import { prisma } from "./prisma";
import { extractQuoteData, extractQuoteFromFile, isDirectFileType } from "./extraction";
import { parseFile } from "./fileParser";

export async function processAttachmentQuote(
  quoteId: string,
  buffer: Buffer,
  mimeType: string
) {
  try {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "PROCESSING" },
    });

    const rawText = await parseFile(buffer, mimeType);
    let extracted;
    if (rawText) {
      extracted = await extractQuoteData(rawText);
    } else if (isDirectFileType(mimeType)) {
      extracted = await extractQuoteFromFile(buffer, mimeType);
    } else {
      throw new Error("Could not extract content from attachment");
    }

    const itemsTotal = extracted.lineItems.reduce(
      (sum, i) => sum + i.subtotal,
      0
    );
    const feesTotal = extracted.fees.reduce((sum, f) => sum + f.amount, 0);

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        vendorName: extracted.vendorName,
        ...(rawText && { rawText }),
        currency: extracted.currency,
        paymentTerms: extracted.paymentTerms,
        deliveryDays: extracted.deliveryDays,
        notes: extracted.notes,
        grandTotal: itemsTotal + feesTotal,
        processingStatus: "DONE",
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
  } catch (error) {
    console.error("Attachment processing failed:", error);
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "FAILED" },
    });
  }
}

export async function processTextQuote(quoteId: string, rawText: string) {
  try {
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "PROCESSING" },
    });

    const extracted = await extractQuoteData(rawText);

    const itemsTotal = extracted.lineItems.reduce(
      (sum, i) => sum + i.subtotal,
      0
    );
    const feesTotal = extracted.fees.reduce((sum, f) => sum + f.amount, 0);

    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        vendorName: extracted.vendorName,
        currency: extracted.currency,
        paymentTerms: extracted.paymentTerms,
        deliveryDays: extracted.deliveryDays,
        notes: extracted.notes,
        grandTotal: itemsTotal + feesTotal,
        processingStatus: "DONE",
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
  } catch (error) {
    console.error("Text quote processing failed:", error);
    await prisma.quote.update({
      where: { id: quoteId },
      data: { processingStatus: "FAILED" },
    });
  }
}
