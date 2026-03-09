import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { processAttachmentQuote, processTextQuote } from "@/lib/quote-processing";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

interface StoredAttachment {
  name: string;
  contentType: string;
  contentBase64: string;
  contentLength: number;
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`inbox-assign:${user.id}`, 10, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { inboxItemIds, projectId } = body;

  if (!Array.isArray(inboxItemIds) || inboxItemIds.length === 0 || !projectId) {
    return NextResponse.json({ error: "Missing inboxItemIds or projectId" }, { status: 400 });
  }

  // Verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
  });
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch inbox items (verify they belong to user)
  const items = await prisma.inboxItem.findMany({
    where: { id: { in: inboxItemIds }, userId: user.id },
  });

  if (items.length === 0) {
    return NextResponse.json({ error: "No items found" }, { status: 404 });
  }

  const results: string[] = [];

  for (const item of items) {
    const attachments = (Array.isArray(item.attachments) ? item.attachments : []) as unknown as StoredAttachment[];

    if (attachments.length > 0) {
      for (const att of attachments) {
        const buffer = Buffer.from(att.contentBase64, "base64");
        const quote = await prisma.quote.create({
          data: {
            projectId,
            fileName: att.name,
            processingStatus: "PENDING",
          },
        });
        await processAttachmentQuote(quote.id, buffer, att.contentType);
        results.push(`Processed: ${att.name}`);
      }
    } else if (item.textBody) {
      const quote = await prisma.quote.create({
        data: {
          projectId,
          fileName: `Email: ${item.subject || "No subject"}`,
          rawText: item.textBody,
          processingStatus: "PENDING",
        },
      });
      await processTextQuote(quote.id, item.textBody);
      results.push(`Processed email: ${item.subject || "No subject"}`);
    }

    // Remove from inbox after processing
    await prisma.inboxItem.delete({ where: { id: item.id } });
  }

  return NextResponse.json({ results, assigned: items.length });
}
