import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

// Read at build time so the file is included in the serverless bundle
const filePath = path.join(process.cwd(), "public/templates/vendor-quote-comparison-template.xlsx");
let templateBuffer: Buffer;
try {
  templateBuffer = readFileSync(filePath);
} catch {
  templateBuffer = Buffer.alloc(0);
}

export async function GET() {
  if (!templateBuffer.length) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(templateBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        "attachment; filename=vendor-quote-comparison-template.xlsx",
    },
  });
}
