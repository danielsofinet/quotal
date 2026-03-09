import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getAuthenticatedUserFromCookies } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request) || await getAuthenticatedUserFromCookies();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.inboxItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fromEmail: true,
      fromName: true,
      subject: true,
      createdAt: true,
      attachments: true,
    },
  });

  // Return items with attachment count (don't send the full base64 data)
  const mapped = items.map((item) => ({
    id: item.id,
    fromEmail: item.fromEmail,
    fromName: item.fromName,
    subject: item.subject,
    createdAt: item.createdAt,
    attachmentCount: Array.isArray(item.attachments) ? item.attachments.length : 0,
  }));

  return NextResponse.json(mapped);
}
