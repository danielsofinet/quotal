import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractQuoteData, extractQuoteFromFile, isDirectFileType } from "@/lib/extraction";
import { parseFile } from "@/lib/fileParser";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

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

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain",
]);

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS = 5;

export async function POST(request: NextRequest) {
  // Verify webhook token — reject if not configured or mismatched
  const token = request.headers.get("x-postmark-token");
  if (!process.env.POSTMARK_WEBHOOK_TOKEN || token !== process.env.POSTMARK_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: PostmarkInboundPayload;
  try { payload = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Extract the recipient inbox address
  const toAddress = payload.To.toLowerCase();
  const inboxMatch = toAddress.match(/quotes\+[^@]+@/);
  const inboxAddress = inboxMatch
    ? inboxMatch[0].replace(/@$/, "") + "@quotal.app"
    : toAddress;

  // Rate limit per inbox address
  const rl = rateLimit(`inbound:${inboxAddress}`, 5, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

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

  // Process attachments (capped at 5)
  if (payload.Attachments && payload.Attachments.length > 0) {
    const attachments = payload.Attachments.slice(0, MAX_ATTACHMENTS);
    if (payload.Attachments.length > MAX_ATTACHMENTS) {
      results.push(`Only processing first ${MAX_ATTACHMENTS} of ${payload.Attachments.length} attachments`);
    }

    for (const attachment of attachments) {
      // Validate attachment type and size
      if (!ALLOWED_ATTACHMENT_TYPES.has(attachment.ContentType)) {
        results.push(`Skipped ${attachment.Name}: unsupported file type (${attachment.ContentType})`);
        continue;
      }
      if (attachment.ContentLength > MAX_ATTACHMENT_SIZE) {
        results.push(`Skipped ${attachment.Name}: exceeds 10MB size limit`);
        continue;
      }

      const buffer = Buffer.from(attachment.Content, "base64");

      const quote = await prisma.quote.create({
        data: {
          projectId: project.id,
          fileName: attachment.Name,
          processingStatus: "PENDING",
        },
      });

      await processAttachmentQuote(quote.id, buffer, attachment.ContentType);
      results.push(`Processed attachment: ${attachment.Name}`);
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

    await processTextQuote(quote.id, payload.TextBody);
    results.push("Processed email body as quote");
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
