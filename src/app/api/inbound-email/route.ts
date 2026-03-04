import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractQuoteData } from "@/lib/extraction";
import { parseFile } from "@/lib/fileParser";

export const maxDuration = 60;

// Postmark inbound webhook payload types
interface PostmarkAttachment {
  Name: string;
  Content: string; // base64
  ContentType: string;
  ContentLength: number;
}

interface PostmarkInboundPayload {
  From: string;
  FromName: string;
  To: string;
  Subject: string;
  TextBody: string;
  HtmlBody: string;
  Attachments: PostmarkAttachment[];
}

export async function POST(request: NextRequest) {
  // Optional: verify webhook token
  const token = request.headers.get("x-postmark-token");
  if (
    process.env.POSTMARK_WEBHOOK_TOKEN &&
    token !== process.env.POSTMARK_WEBHOOK_TOKEN
  ) {
    if (process.env.POSTMARK_WEBHOOK_TOKEN !== "") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  }

  const payload: PostmarkInboundPayload = await request.json();

  // Extract the recipient inbox address
  const toAddress = payload.To.toLowerCase();
  const inboxMatch = toAddress.match(/quotes\+[^@]+@/);
  const inboxAddress = inboxMatch
    ? inboxMatch[0].replace(/@$/, "") + "@quotal.app"
    : toAddress;

  // Find user by inbox address
  const user = await prisma.user.findFirst({
    where: {
      inboxAddress: {
        equals: inboxAddress,
        mode: "insensitive",
      },
    },
  });

  if (!user) {
    console.log(`No user found for inbox: ${inboxAddress}`);
    return NextResponse.json({ error: "Unknown inbox address" }, { status: 404 });
  }

  // Find the user's most recent project, or create an "Inbox" project
  let project = await prisma.project.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Inbox",
        userId: user.id,
      },
    });
  }

  const results: string[] = [];

  // Process attachments
  if (payload.Attachments && payload.Attachments.length > 0) {
    for (const attachment of payload.Attachments) {
      const buffer = Buffer.from(attachment.Content, "base64");

      const quote = await prisma.quote.create({
        data: {
          projectId: project.id,
          fileName: attachment.Name,
          processingStatus: "PENDING",
        },
      });

      after(async () => {
        await processAttachmentQuote(quote.id, buffer, attachment.ContentType);
      });

      results.push(`Processing attachment: ${attachment.Name}`);
    }
  }

  // If no attachments but there's text body, process the email body as a quote
  if (
    (!payload.Attachments || payload.Attachments.length === 0) &&
    payload.TextBody
  ) {
    const quote = await prisma.quote.create({
      data: {
        projectId: project.id,
        fileName: `Email: ${payload.Subject || "No subject"}`,
        rawText: payload.TextBody,
        processingStatus: "PENDING",
      },
    });

    after(async () => {
      await processTextQuote(quote.id, payload.TextBody);
    });

    results.push("Processing email body as quote");
  }

  console.log(
    `[Inbound Email] Confirmation would be sent to ${payload.From}: ` +
      `Quote(s) from email "${payload.Subject}" added to project "${project.name}"`
  );

  return NextResponse.json({
    message: "Received and processing",
    project: project.name,
    results,
  });
}

async function processAttachmentQuote(
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
        rawText,
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

async function processTextQuote(quoteId: string, rawText: string) {
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
