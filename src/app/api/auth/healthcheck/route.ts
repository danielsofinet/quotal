import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // 1. Check env vars exist (don't leak values)
  checks.envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_URL_HOST: process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).hostname
      : "MISSING",
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
    FIREBASE_PRIVATE_KEY_LENGTH: process.env.FIREBASE_PRIVATE_KEY?.length ?? 0,
  };

  // 2. Test Firebase Admin init
  try {
    const auth = getAdminAuth();
    checks.firebaseAdmin = auth ? "OK" : "FAILED";
  } catch (err) {
    checks.firebaseAdmin = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  // 3. Test database connection
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    checks.database = `OK: ${JSON.stringify(result)}`;
  } catch (err) {
    checks.database = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json(checks);
}
