import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.plan !== "pro") {
    return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
  }

  const rl = rateLimit(`export:${user.id}`, 10, 60_000);
  if (!rl.success) return rateLimitResponse(60_000);

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      quotes: {
        where: { processingStatus: "DONE" },
        include: { lineItems: true, fees: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project || project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const quotes = project.quotes;
  if (quotes.length === 0) {
    return NextResponse.json({ error: "No quotes to export" }, { status: 400 });
  }

  const currency = quotes[0]?.currency || "EUR";
  const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";

  // Build item groups (same logic as ComparisonTable)
  const groupMap = new Map<string, Map<string, { unitPrice: number; quantity: number; unit: string; subtotal: number }>>();
  quotes.forEach((q) => {
    q.lineItems.forEach((item) => {
      const key = item.canonicalName || item.name;
      if (!groupMap.has(key)) groupMap.set(key, new Map());
      groupMap.get(key)!.set(q.id, {
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        unit: item.unit,
        subtotal: item.subtotal,
      });
    });
  });

  // Collect all fee names
  const feeNames = new Set<string>();
  quotes.forEach((q) => q.fees.forEach((f) => feeNames.add(f.name)));

  // Build CSV rows
  const rows: string[][] = [];

  // Header
  rows.push(["", ...quotes.map((q) => q.vendorName || "Unknown Vendor")]);

  // Line items
  for (const [itemName, vendors] of groupMap) {
    const row = [itemName];
    for (const q of quotes) {
      const entry = vendors.get(q.id);
      row.push(entry ? `${sym}${entry.subtotal.toFixed(2)}` : "—");
    }
    rows.push(row);
  }

  // Fees section
  if (feeNames.size > 0) {
    rows.push([]); // blank separator
    rows.push(["Fees & Surcharges", ...quotes.map(() => "")]);
    for (const feeName of feeNames) {
      const row = [feeName];
      for (const q of quotes) {
        const fee = q.fees.find((f) => f.name === feeName);
        row.push(fee ? `${sym}${fee.amount.toFixed(2)}` : "—");
      }
      rows.push(row);
    }
  }

  // Grand total
  rows.push([]); // blank separator
  rows.push([
    "Grand Total",
    ...quotes.map((q) =>
      q.grandTotal !== null ? `${sym}${q.grandTotal.toFixed(2)}` : "—"
    ),
  ]);

  // Terms
  rows.push([]);
  rows.push(["Payment Terms", ...quotes.map((q) => q.paymentTerms || "—")]);
  rows.push([
    "Delivery (days)",
    ...quotes.map((q) => (q.deliveryDays ? String(q.deliveryDays) : "—")),
  ]);

  const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
  const filename = sanitizeFilename(project.name) || "comparison";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
