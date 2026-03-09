import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processAttachmentQuote, processTextQuote } from "@/lib/quote-processing";
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
  // Verify webhook token via query param
  const token = request.nextUrl.searchParams.get("token");
  if (!process.env.POSTMARK_WEBHOOK_TOKEN || token !== process.env.POSTMARK_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: PostmarkInboundPayload;
  try { payload = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Parse the To address: {userPrefix}+{projectSlug}@in.quotal.app or {userPrefix}@in.quotal.app
  const toAddress = payload.To.toLowerCase();
  const toLocal = toAddress.split("@")[0];
  const plusIndex = toLocal.indexOf("+");
  const userPrefix = plusIndex >= 0 ? toLocal.substring(0, plusIndex) : toLocal;
  const projectSlug = plusIndex >= 0 ? toLocal.substring(plusIndex + 1) : null;
  const inboxAddress = `${userPrefix}@in.quotal.app`;

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

  // If there's a project slug, try to route directly to that project
  let project = null;
  if (projectSlug) {
    project = await prisma.project.findFirst({
      where: { userId: user.id, emailSlug: projectSlug },
    });
  }

  // If we have a project, process the email directly into it
  if (project) {
    return await processIntoProject(project.id, payload);
  }

  // Otherwise, store in inbox as an unassigned item
  const attachmentData = payload.Attachments?.slice(0, MAX_ATTACHMENTS)
    .filter((a) => ALLOWED_ATTACHMENT_TYPES.has(a.ContentType) && a.ContentLength <= MAX_ATTACHMENT_SIZE)
    .map((a) => ({
      name: a.Name,
      contentType: a.ContentType,
      contentBase64: a.Content,
      contentLength: a.ContentLength,
    })) || [];

  await prisma.inboxItem.create({
    data: {
      userId: user.id,
      fromEmail: payload.From,
      fromName: payload.FromName || null,
      subject: payload.Subject || null,
      textBody: payload.TextBody || null,
      attachments: attachmentData.length > 0 ? attachmentData : undefined,
    },
  });

  return NextResponse.json({
    message: "Added to inbox",
    destination: "inbox",
  });
}

async function processIntoProject(projectId: string, payload: PostmarkInboundPayload) {
  const results: string[] = [];

  if (payload.Attachments && payload.Attachments.length > 0) {
    const attachments = payload.Attachments.slice(0, MAX_ATTACHMENTS);
    if (payload.Attachments.length > MAX_ATTACHMENTS) {
      results.push(`Only processing first ${MAX_ATTACHMENTS} of ${payload.Attachments.length} attachments`);
    }

    for (const attachment of attachments) {
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
          projectId,
          fileName: attachment.Name,
          processingStatus: "PENDING",
        },
      });

      await processAttachmentQuote(quote.id, buffer, attachment.ContentType);
      results.push(`Processed attachment: ${attachment.Name}`);
    }
  }

  if (
    (!payload.Attachments || payload.Attachments.length === 0) &&
    payload.TextBody
  ) {
    const quote = await prisma.quote.create({
      data: {
        projectId,
        fileName: `Email: ${payload.Subject || "No subject"}`,
        rawText: payload.TextBody,
        processingStatus: "PENDING",
      },
    });

    await processTextQuote(quote.id, payload.TextBody);
    results.push("Processed email body as quote");
  }

  return NextResponse.json({
    message: "Processed into project",
    destination: "project",
    results,
  });
}
