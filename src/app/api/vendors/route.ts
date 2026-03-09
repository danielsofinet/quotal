import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getAuthenticatedUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request) || await getAuthenticatedUserFromCookies();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.plan !== "pro") {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const rl = rateLimit(`vendors:${user.id}`, 20, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  // Get all DONE quotes across user's projects
  const quotes = await prisma.quote.findMany({
    where: {
      project: { userId: user.id },
      processingStatus: "DONE",
      vendorName: { not: null },
    },
    select: {
      id: true,
      vendorName: true,
      grandTotal: true,
      createdAt: true,
      project: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by normalized vendor name (case-insensitive, trimmed)
  const vendorMap = new Map<
    string,
    {
      name: string;
      quotes: {
        id: string;
        grandTotal: number | null;
        createdAt: string;
        projectId: string;
        projectName: string;
      }[];
    }
  >();

  for (const q of quotes) {
    const key = q.vendorName!.toLowerCase().trim();
    if (!vendorMap.has(key)) {
      vendorMap.set(key, { name: q.vendorName!, quotes: [] });
    }
    vendorMap.get(key)!.quotes.push({
      id: q.id,
      grandTotal: q.grandTotal,
      createdAt: q.createdAt.toISOString(),
      projectId: q.project.id,
      projectName: q.project.name,
    });
  }

  // Sort vendors by quote count desc
  const vendors = Array.from(vendorMap.values()).sort(
    (a, b) => b.quotes.length - a.quotes.length
  );

  return NextResponse.json(vendors);
}
