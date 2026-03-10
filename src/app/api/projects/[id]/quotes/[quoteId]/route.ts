import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserFromCookies } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; quoteId: string }> }
) {
  const user = await getAuthenticatedUserFromCookies();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, quoteId } = await params;

  // Verify ownership
  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, projectId: id, project: { userId: user.id } },
  });

  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete line items and fees first, then the quote
  await prisma.$transaction([
    prisma.lineItem.deleteMany({ where: { quoteId } }),
    prisma.fee.deleteMany({ where: { quoteId } }),
    prisma.quote.delete({ where: { id: quoteId } }),
  ]);

  return NextResponse.json({ status: "ok" });
}
