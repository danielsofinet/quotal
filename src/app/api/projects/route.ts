import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, getPlanLimits } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { generateUniqueProjectSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { quotes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = rateLimit(`projects:${user.id}`, 10, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (trimmedName.length > 100) {
    return NextResponse.json({ error: "Name must be 100 characters or less" }, { status: 400 });
  }

  // Enforce plan limits
  const limits = getPlanLimits(user.plan);
  const projectCount = await prisma.project.count({
    where: { userId: user.id },
  });
  if (projectCount >= limits.maxProjects) {
    return NextResponse.json(
      { error: "PLAN_LIMIT", limit: "projects", current: projectCount, max: limits.maxProjects },
      { status: 403 },
    );
  }

  const emailSlug = await generateUniqueProjectSlug(user.id, trimmedName);

  const project = await prisma.project.create({
    data: {
      name: trimmedName,
      userId: user.id,
      emailSlug,
    },
  });

  return NextResponse.json(project);
}
