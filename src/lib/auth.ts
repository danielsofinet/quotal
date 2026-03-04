import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { getAdminAuth } from "./firebase-admin";
import { v4 as uuidv4 } from "uuid";

/**
 * Verify Firebase token from Authorization header and find/create user in DB.
 * Used by API routes.
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const idToken = authHeader.slice(7);
  return verifyAndGetUser(idToken);
}

/**
 * Verify Firebase session cookie and find/create user in DB.
 * Used by server-rendered pages.
 */
export async function getAuthenticatedUserFromCookies() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("__session")?.value;
  if (!sessionCookie) return null;

  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return findOrCreateUser(decoded.uid, decoded.email, decoded.name);
  } catch {
    return null;
  }
}

/**
 * Get authenticated user with all projects (for server pages).
 */
export async function getUserWithProjects() {
  const user = await getAuthenticatedUserFromCookies();
  if (!user) return null;

  return prisma.user.findUnique({
    where: { id: user.id },
    include: {
      projects: {
        include: {
          _count: { select: { quotes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

async function verifyAndGetUser(idToken: string) {
  try {
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    return findOrCreateUser(decoded.uid, decoded.email, decoded.name);
  } catch {
    return null;
  }
}

async function findOrCreateUser(
  firebaseUid: string,
  email?: string,
  name?: string,
) {
  let user = await prisma.user.findUnique({ where: { firebaseUid } });

  if (!user) {
    const inboxAddress = `quotes+${uuidv4().slice(0, 8)}@quotal.app`;
    user = await prisma.user.create({
      data: {
        firebaseUid,
        email: email || `${firebaseUid}@firebase.user`,
        name: name || null,
        inboxAddress,
      },
    });
  }

  return user;
}
