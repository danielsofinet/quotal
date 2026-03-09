import { prisma } from "./prisma";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export async function generateUniqueProjectSlug(
  userId: string,
  name: string
): Promise<string> {
  const base = generateSlug(name);
  if (!base) return generateSlug(`project-${Date.now()}`);

  const existing = await prisma.project.findUnique({
    where: { userId_emailSlug: { userId, emailSlug: base } },
  });

  if (!existing) return base;

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`.slice(0, 30);
    const taken = await prisma.project.findUnique({
      where: { userId_emailSlug: { userId, emailSlug: candidate } },
    });
    if (!taken) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`.slice(0, 30);
}
