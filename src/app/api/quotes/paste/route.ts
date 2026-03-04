import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { extractQuoteData } from "@/lib/extraction";

export const maxDuration = 60;

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

  after(async () => {
    await processQuote(quote.id, text);
  });

  return NextResponse.json(quote);
}

async function processQuote(quoteId: string, rawText: string) {
  try {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "PROCESSING" },
    });

    const extracted = await extractQuoteData(rawText);

    const itemsTotal = extracted.lineItems.reduce((sum, item) => sum + item.subtotal, 0);
    const feesTotal = extracted.fees.reduce((sum, fee) => sum + fee.amount, 0);
    const grandTotal = itemsTotal + feesTotal;

    await prisma.quote.update({
      where: { id: quoteId },
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
