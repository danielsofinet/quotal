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
      textBody: true,
      createdAt: true,
      attachments: true,
      assignedToProjectId: true,
      assignedToProject: true,
      assignedAt: true,
    },
  });

  interface StoredAttachment {
    name: string;
    contentType: string;
    contentLength: number;
  }

  const mapped = items.map((item) => ({
    id: item.id,
    fromEmail: item.fromEmail,
    fromName: item.fromName,
    subject: item.subject,
    textBody: item.textBody,
    createdAt: item.createdAt,
    attachmentCount: Array.isArray(item.attachments) ? item.attachments.length : 0,
    attachmentNames: Array.isArray(item.attachments)
      ? (item.attachments as unknown as StoredAttachment[]).map((a) => a.name)
      : [],
    assignedToProjectId: item.assignedToProjectId,
    assignedToProject: item.assignedToProject,
    assignedAt: item.assignedAt,
  }));

  return NextResponse.json(mapped);
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request) || await getAuthenticatedUserFromCookies();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await request.json() as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  await prisma.inboxItem.deleteMany({
    where: { id: { in: ids }, userId: user.id },
  });

  return NextResponse.json({ deleted: ids.length });
}
