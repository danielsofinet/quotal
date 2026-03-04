"use client";

import Link from "next/link";
import { Badge } from "./ui/Badge";

interface LineItem {
  id: string;
  name: string;
  rawName: string;
  canonicalName: string | null;
  variantNote: string | null;
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

interface Fee {
  id: string;
  name: string;
  amount: number;
  isHidden: boolean;
}

interface Quote {
  id: string;
  vendorName: string | null;
  currency: string | null;
  paymentTerms: string | null;
  deliveryDays: number | null;
  notes: string[];
  grandTotal: number | null;
  processingStatus: string;
  lineItems: LineItem[];
  fees: Fee[];
}

interface ComparisonTableProps {
  quotes: Quote[];
  projectId: string;
}

function fmt(amount: number, currency?: string | null) {
  const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function ComparisonTable({ quotes, projectId }: ComparisonTableProps) {
  const processed = quotes.filter((q) => q.processingStatus === "DONE");

  if (processed.length < 2) {
    return (
      <div className="text-center py-12 border border-border rounded-lg bg-surface">
        <p className="text-text-muted text-sm">
          {processed.length === 0
            ? "Upload quotes to see comparisons"
            : "Upload at least one more quote to compare"}
        </p>
      </div>
    );
  }

  const currency = processed[0]?.currency;

  // --- Group items by canonicalName ---
  const groupMap = new Map<string, { quoteId: string; item: LineItem }[]>();
  processed.forEach((q) => {
    q.lineItems.forEach((item) => {
      const key = item.canonicalName || item.name;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key)!.push({ quoteId: q.id, item });
    });
  });

  // Split: items most vendors have vs items only 1-2 have
  const allGroups = Array.from(groupMap.entries());
  const majorGroups = allGroups
    .filter(([, entries]) => entries.length >= Math.ceil(processed.length / 2))
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
  const minorGroups = allGroups
    .filter(([, entries]) => entries.length < Math.ceil(processed.length / 2))
    .sort((a, b) => a[0].localeCompare(b[0]));

  // --- Fee grouping ---
  const allFeeNames = new Set<string>();
  processed.forEach((q) => q.fees.forEach((f) => allFeeNames.add(f.name)));
  const feeNames = Array.from(allFeeNames);

  // --- Totals & winner ---
  const totals = processed
    .filter((q) => q.grandTotal !== null)
    .map((q) => ({ id: q.id, vendor: q.vendorName, total: q.grandTotal! }));
  const cheapestId = totals.length
    ? totals.reduce((min, q) => (q.total < min.total ? q : min)).id
    : null;
  const expensiveId = totals.length
    ? totals.reduce((max, q) => (q.total > max.total ? q : max)).id
    : null;

  // --- Count wins per vendor (cheapest per item row) ---
  const winCount = new Map<string, number>();
  processed.forEach((q) => winCount.set(q.id, 0));
  majorGroups.forEach(([, entries]) => {
    if (entries.length < 2) return;
    const cheapest = entries.reduce((min, e) =>
      e.item.subtotal < min.item.subtotal ? e : min
    );
    winCount.set(cheapest.quoteId, (winCount.get(cheapest.quoteId) || 0) + 1);
  });
  const bestValueId = [...winCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  // --- Hidden fee warnings ---
  const hiddenFees = processed.flatMap((q) =>
    q.fees.filter((f) => f.isHidden).map((f) => ({
      vendor: q.vendorName,
      fee: f.name,
      amount: f.amount,
    }))
  );

  // --- Render helpers ---
  function renderItemRow(
    groupName: string,
    entries: { quoteId: string; item: LineItem }[],
    rowIndex: number
  ) {
    const prices = entries.map((e) => ({ quoteId: e.quoteId, subtotal: e.item.subtotal }));
    const cheapest = prices.length >= 2
      ? prices.reduce((min, p) => (p.subtotal < min.subtotal ? p : min)).quoteId
      : null;
    const expensive = prices.length >= 2
      ? prices.reduce((max, p) => (p.subtotal > max.subtotal ? p : max)).quoteId
      : null;
    const allSame = prices.length >= 2 && prices.every((p) => p.subtotal === prices[0].subtotal);

    return (
      <tr key={groupName} className={rowIndex % 2 === 0 ? "bg-bg" : "bg-surface/50"}>
        <td className="px-4 py-3 align-top">
          <div className="font-medium text-[13px] text-text-muted">{groupName}</div>
        </td>
        {processed.map((q) => {
          const entry = entries.find((e) => e.quoteId === q.id);
          if (!entry) {
            return (
              <td key={q.id} className="px-4 py-3 border-l border-border text-text-dim align-top">
                <span className="text-[11px]">not offered</span>
              </td>
            );
          }
          const { item } = entry;
          const isCheap = !allSame && cheapest === q.id;
          const isExp = !allSame && expensive === q.id;
          return (
            <td
              key={q.id}
              className={`px-4 py-3 border-l border-border align-top ${
                isCheap ? "bg-success-dim" : isExp ? "bg-danger-dim" : ""
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className={`font-mono font-medium text-[13px] ${
                  isCheap ? "text-success" : isExp ? "text-danger" : "text-text-primary"
                }`}>
                  {fmt(item.subtotal, currency)}
                </span>
                <span className="text-[11px] text-text-dim">
                  {fmt(item.unitPrice, currency)} × {item.quantity} {item.unit}
                </span>
                {item.variantNote && (
                  <span className="inline-flex mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-dim text-accent-light leading-tight">
                      {item.variantNote}
                    </span>
                  </span>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    );
  }

  return (
    <div className="space-y-5">
      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Cheapest overall */}
        {cheapestId && (
          <div className="p-4 bg-success-dim border border-success/20 rounded-lg">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-success mb-1.5">
              Cheapest Overall
            </div>
            <div className="font-semibold text-text-primary text-[15px]">
              {processed.find((q) => q.id === cheapestId)?.vendorName}
            </div>
            <div className="font-mono text-success text-lg mt-0.5">
              {fmt(totals.find((t) => t.id === cheapestId)!.total, currency)}
            </div>
            {cheapestId !== expensiveId && expensiveId && (
              <div className="text-[11px] text-text-dim mt-1">
                {fmt(
                  totals.find((t) => t.id === expensiveId)!.total -
                    totals.find((t) => t.id === cheapestId)!.total,
                  currency
                )}{" "}
                less than most expensive
              </div>
            )}
          </div>
        )}

        {/* Best value (most item wins) */}
        {bestValueId && (
          <div className="p-4 bg-accent-dim border border-accent/20 rounded-lg">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent-light mb-1.5">
              Best Per-Item Pricing
            </div>
            <div className="font-semibold text-text-primary text-[15px]">
              {processed.find((q) => q.id === bestValueId)?.vendorName}
            </div>
            <div className="text-sm text-accent-light mt-0.5">
              Cheapest on {winCount.get(bestValueId)} of {majorGroups.length} items
            </div>
          </div>
        )}

        {/* Hidden fees warning */}
        {hiddenFees.length > 0 ? (
          <div className="p-4 bg-warning-dim border border-warning/20 rounded-lg">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-warning mb-1.5">
              Hidden Fees Detected
            </div>
            {hiddenFees.map((hf, i) => (
              <div key={i} className="text-sm text-text-muted">
                <span className="text-text-primary font-medium">{hf.vendor}</span>:{" "}
                {hf.fee}{" "}
                <span className="font-mono text-warning">{fmt(hf.amount, currency)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-surface border border-border rounded-lg">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-dim mb-1.5">
              Quotes Compared
            </div>
            <div className="font-semibold text-text-primary text-2xl">
              {processed.length}
            </div>
            <div className="text-[11px] text-text-dim mt-1">
              {majorGroups.length} items matched across vendors
            </div>
          </div>
        )}
      </div>

      {/* ===== Main Comparison Table ===== */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface">
                <th className="text-left px-4 py-3 font-medium text-text-muted border-b border-border w-[220px] min-w-[220px]">
                  <span className="text-[10px] uppercase tracking-wider">Line Item</span>
                </th>
                {processed.map((q) => (
                  <th key={q.id} className="text-left px-4 py-3 border-b border-border border-l min-w-[180px]">
                    <Link
                      href={`/project/${projectId}?quote=${q.id}`}
                      className="font-semibold text-text-primary hover:text-accent-light transition-colors"
                    >
                      {q.vendorName || "Unknown Vendor"}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Major items (most vendors have them) */}
              {majorGroups.map(([name, entries], i) => renderItemRow(name, entries, i))}

              {/* Minor items section */}
              {minorGroups.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan={processed.length + 1}
                      className="px-4 py-2 bg-surface border-t border-border"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                        Available from select vendors only
                      </span>
                    </td>
                  </tr>
                  {minorGroups.map(([name, entries], i) => renderItemRow(name, entries, i))}
                </>
              )}

              {/* Fees & Surcharges */}
              {feeNames.length > 0 && (
                <>
                  <tr>
                    <td
                      colSpan={processed.length + 1}
                      className="px-4 py-2 bg-surface border-t border-border"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                        Fees & Surcharges
                      </span>
                    </td>
                  </tr>
                  {feeNames.map((feeName, i) => (
                    <tr key={feeName} className={i % 2 === 0 ? "bg-bg" : "bg-surface/50"}>
                      <td className="px-4 py-3 text-text-muted text-[13px]">{feeName}</td>
                      {processed.map((q) => {
                        const fee = q.fees.find((f) => f.name === feeName);
                        if (!fee) {
                          return (
                            <td key={q.id} className="px-4 py-3 border-l border-border text-text-dim">
                              —
                            </td>
                          );
                        }
                        return (
                          <td key={q.id} className="px-4 py-3 border-l border-border">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[13px] text-text-primary">
                                {fmt(fee.amount, currency)}
                              </span>
                              {fee.isHidden && (
                                <span className="inline-flex items-center gap-1 text-warning" title="This fee was buried in the document">
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 2L14.5 13.5H1.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                    <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
                                  </svg>
                                  <span className="text-[10px] font-medium uppercase tracking-wider">Hidden</span>
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              )}

              {/* Grand Total */}
              <tr className="border-t-2 border-border-light bg-surface">
                <td className="px-4 py-4 font-semibold text-text-primary">Grand Total</td>
                {processed.map((q) => {
                  const isCheap = cheapestId === q.id;
                  const isExp = expensiveId === q.id && expensiveId !== cheapestId;
                  return (
                    <td
                      key={q.id}
                      className={`px-4 py-4 border-l border-border font-mono font-semibold text-base ${
                        isCheap ? "text-success bg-success-dim" : isExp ? "text-danger/80" : "text-text-primary"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {q.grandTotal !== null ? fmt(q.grandTotal, currency) : "—"}
                        {isCheap && <Badge variant="success">Best Deal</Badge>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Terms Comparison ===== */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-surface border-b border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
            Terms Comparison
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              <tr className="bg-bg">
                <td className="px-4 py-3 text-text-muted w-[220px]">Payment Terms</td>
                {processed.map((q) => (
                  <td key={q.id} className="px-4 py-3 border-l border-border text-text-primary min-w-[180px]">
                    {q.paymentTerms || "—"}
                  </td>
                ))}
              </tr>
              <tr className="bg-surface/50">
                <td className="px-4 py-3 text-text-muted">Delivery</td>
                {processed.map((q) => {
                  const fastest = Math.min(
                    ...processed.filter((p) => p.deliveryDays).map((p) => p.deliveryDays!)
                  );
                  const isFastest = q.deliveryDays === fastest;
                  return (
                    <td key={q.id} className={`px-4 py-3 border-l border-border ${isFastest ? "text-success" : "text-text-primary"}`}>
                      {q.deliveryDays ? `${q.deliveryDays} days` : "—"}
                      {isFastest && q.deliveryDays ? " (fastest)" : ""}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Notes & Warnings ===== */}
      {processed.some((q) => q.notes.length > 0) && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface border-b border-border">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              Notes & Warnings
            </span>
          </div>
          <div className="divide-y divide-border">
            {processed.map((q) =>
              q.notes.map((note, i) => (
                <div key={`${q.id}-${i}`} className="px-4 py-3 flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-warning shrink-0 mt-0.5">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="8" cy="10.5" r="0.5" fill="currentColor" />
                  </svg>
                  <div>
                    <span className="text-xs font-medium text-accent-light">{q.vendorName}:</span>
                    <p className="text-sm text-text-muted mt-0.5">{note}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
