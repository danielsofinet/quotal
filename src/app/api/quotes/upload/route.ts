import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseFile } from "@/lib/fileParser";
import { extractQuoteData, extractQuoteFromFile, isDirectFileType } from "@/lib/extraction";

export const maxDuration = 60;

const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB (Vercel body limit)

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".xlsx", ".xls", ".csv", ".txt",
  ".png", ".jpg", ".jpeg", ".gif", ".webp",
]);

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file || !projectId) {
    return NextResponse.json(
      { error: "File and projectId are required" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 4.5MB limit" },
      { status: 400 }
    );
  }

  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: PDF, Excel, CSV, TXT, PNG, JPG" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const quote = await prisma.quote.create({
    data: {
      projectId,
      fileName: file.name,
      processingStatus: "PENDING",
    },
  });

  try {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { processingStatus: "PROCESSING" },
    });

    let extracted;
    let rawText: string | null = null;

    // Try local text extraction first (cheap) — returns null for images/scanned PDFs
    rawText = await parseFile(buffer, file.type);

    if (rawText) {
      // Text extracted locally — send just the text to Claude (cheap path)
      extracted = await extractQuoteData(rawText);
    } else if (isDirectFileType(file.type)) {
      // No text extracted — send the file directly to Claude's vision API (fallback)
      extracted = await extractQuoteFromFile(buffer, file.type);
    } else {
      throw new Error("Could not extract any content from this file");
    }

    const itemsTotal = extracted.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const feesTotal = extracted.fees.reduce((sum, fee) => sum + fee.amount, 0);
    const grandTotal = itemsTotal + feesTotal;

    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        vendorName: extracted.vendorName,
        ...(rawText && { rawText }),
        currency: extracted.currency,
        paymentTerms: extracted.paymentTerms,
        deliveryDays: extracted.deliveryDays,
        notes: extracted.notes,
        grandTotal,
      },
    });

    if (extracted.lineItems.length > 0) {
      await prisma.lineItem.createMany({
        data: extracted.lineItems.map((item) => ({
          quoteId: quote.id,
          name: item.normalizedName,
          rawName: item.rawName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          unit: item.unit,
          subtotal: item.subtotal,
        })),
      });
    }

    if (extracted.fees.length > 0) {
      await prisma.fee.createMany({
        data: extracted.fees.map((fee) => ({
          quoteId: quote.id,
          name: fee.name,
          amount: fee.amount,
          isHidden: fee.isHidden,
        })),
      });
    }

    await prisma.quote.update({
      where: { id: quote.id },
      data: { processingStatus: "DONE" },
    });

    const result = await prisma.quote.findUnique({
      where: { id: quote.id },
      include: { lineItems: true, fees: true },
    });
    return NextResponse.json(result);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Quote processing failed:", errMsg);
    await prisma.quote.update({
      where: { id: quote.id },
      data: { processingStatus: "FAILED" },
    });
    return NextResponse.json(
      { ...quote, processingStatus: "FAILED", error: errMsg },
      { status: 200 }
    );
  }
}
