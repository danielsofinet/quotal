import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ? "set (length: " + process.env.ANTHROPIC_API_KEY.length + ")" : "MISSING";
  checks.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ? `"${process.env.FIREBASE_PROJECT_ID}"` : "MISSING";

  // Test DB
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.user.count();
    checks.db = `OK (${count} users)`;
  } catch (e) {
    checks.db = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test Anthropic
  try {
    const { anthropic } = await import("@/lib/anthropic");
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say hi" }],
    });
    checks.anthropic = `OK (${res.model})`;
  } catch (e) {
    checks.anthropic = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Test unpdf
  try {
    const { extractText } = await import("unpdf");
    // Minimal valid PDF
    const pdf = Buffer.from(
      `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 100 700 Td (Hello World) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000360 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
433
%%EOF`
    );
    const result = await extractText(new Uint8Array(pdf), { mergePages: true });
    checks.unpdf = `OK (extracted: "${String(result.text).trim().substring(0, 50)}")`;
  } catch (e) {
    checks.unpdf = `FAILED: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
