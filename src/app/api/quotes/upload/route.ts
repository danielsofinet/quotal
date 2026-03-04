import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseFile } from "@/lib/fileParser";
import { extractQuoteData } from "@/lib/extraction";

export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".xlsx", ".xls", ".csv", ".txt"]);

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
      { error: "File size exceeds 10MB limit" },
      { status: 400 }
    );
  }

  // Validate file type (MIME + extension)
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.type) && !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: PDF, Excel, CSV, TXT" },
      { status: 400 }
    );
  }

  // Verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Read file into memory
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create quote record
  const quote = await prisma.quote.create({
    data: {
      projectId,
      fileName: file.name,
      processingStatus: "PENDING",
    },
  });

  // Process in background using Next.js after() API
  after(async () => {
    await processQuote(quote.id, buffer, file.type);
  });

  return NextResponse.json(quote);
}

async function processQuote(quoteId: string, buffer: Buffer, mimeType: string) {
  try {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "PROCESSING" },
    });

    // Step 1: Extract text from buffer
    const rawText = await parseFile(buffer, mimeType);

    // Step 2: AI extraction
    const extracted = await extractQuoteData(rawText);

    // Step 3: Compute grand total
    const itemsTotal = extracted.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const feesTotal = extracted.fees.reduce((sum, fee) => sum + fee.amount, 0);
    const grandTotal = itemsTotal + feesTotal;

    // Step 4: Save extracted data
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        vendorName: extracted.vendorName,
        rawText,
        currency: extracted.currency,
        paymentTerms: extracted.paymentTerms,
        deliveryDays: extracted.deliveryDays,
        notes: extracted.notes,
        grandTotal,
      },
    });

    // Step 5: Create line items
    if (extracted.lineItems.length > 0) {
      await prisma.lineItem.createMany({
        data: extracted.lineItems.map((item) => ({
          quoteId,
          name: item.normalizedName,
          rawName: item.rawName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          unit: item.unit,
          subtotal: item.subtotal,
        })),
      });
    }

    // Step 6: Create fees
    if (extracted.fees.length > 0) {
      await prisma.fee.createMany({
        data: extracted.fees.map((fee) => ({
          quoteId,
          name: fee.name,
          amount: fee.amount,
          isHidden: fee.isHidden,
        })),
      });
    }

    // Step 7: Mark as DONE
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "DONE" },
    });
  } catch (error) {
    console.error("Quote processing failed:", error);
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "FAILED" },
    });
  }
}
