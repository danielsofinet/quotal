import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getPlanLimits } from "@/lib/auth";
import { extractQuoteData } from "@/lib/extraction";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const maxDuration = 60;

const MAX_TEXT_LENGTH = 100_000; // ~100KB

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`paste:${user.id}`, 10, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { text, projectId } = body;

  if (!text || typeof text !== "string" || !projectId) {
    return NextResponse.json(
      { error: "Text (string) and projectId are required" },
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

  // Enforce plan limits
  const limits = getPlanLimits(user.plan);
  const quoteCount = await prisma.quote.count({
    where: { projectId },
  });
  if (quoteCount >= limits.maxQuotesPerProject) {
    return NextResponse.json(
      { error: "PLAN_LIMIT", limit: "quotes", current: quoteCount, max: limits.maxQuotesPerProject },
      { status: 403 },
    );
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
    console.error("Quote processing failed:", error instanceof Error ? error.message : String(error));
    await prisma.quote.update({
      where: { id: quote.id },
      data: { processingStatus: "FAILED" },
    });
    return NextResponse.json(
      { ...quote, processingStatus: "FAILED" },
      { status: 200 }
    );
  }
}
