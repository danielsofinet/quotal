import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { extractQuoteData } from "@/lib/extraction";

export const maxDuration = 60;

const MAX_TEXT_LENGTH = 100_000; // ~100KB

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { text, projectId } = body;

  if (!text || !projectId) {
    return NextResponse.json(
      { error: "Text and projectId are required" },
      { status: 400 }
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Text exceeds maximum length (100,000 characters)" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const quote = await prisma.quote.create({
    data: {
      projectId,
      fileName: "Pasted text",
      rawText: text,
      processingStatus: "PENDING",
    },
  });

  // Process inline — more reliable than after() on serverless
  try {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { processingStatus: "PROCESSING" },
    });

    const extracted = await extractQuoteData(text);

    const itemsTotal = extracted.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const feesTotal = extracted.fees.reduce((sum, fee) => sum + fee.amount, 0);
    const grandTotal = itemsTotal + feesTotal;

    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        vendorName: extracted.vendorName,
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
