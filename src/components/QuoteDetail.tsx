"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { authFetch } from "@/lib/api";

interface LineItem {
  id: string;
  name: string;
  rawName: string;
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

interface QuoteData {
  id: string;
  vendorName: string | null;
  fileName: string | null;
  originalFileUrl: string | null;
  rawText: string | null;
  currency: string | null;
  dateReceived: string;
  paymentTerms: string | null;
  deliveryDays: number | null;
  notes: string[];
  grandTotal: number | null;
  processingStatus: string;
  lineItems: LineItem[];
  fees: Fee[];
  createdAt: string;
}

interface QuoteDetailProps {
  quote: QuoteData;
  projectId: string;
}

function formatPrice(amount: number, currency?: string | null) {
  const sym = currency === "USD" ? "$" : currency === "GBP" ? "£" : "€";
  return `${sym}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function QuoteDetail({ quote, projectId }: QuoteDetailProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [vendorName, setVendorName] = useState(quote.vendorName || "");
  const [currency, setCurrency] = useState(quote.currency || "EUR");
  const [paymentTerms, setPaymentTerms] = useState(quote.paymentTerms || "");
  const [deliveryDays, setDeliveryDays] = useState(
    quote.deliveryDays?.toString() || ""
  );
  const [lineItems, setLineItems] = useState(quote.lineItems);
  const [fees, setFees] = useState(quote.fees);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await authFetch(`/api/quotes/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorName,
          currency,
          paymentTerms,
          deliveryDays: deliveryDays ? parseInt(deliveryDays) : null,
          lineItems,
          fees,
        }),
      });
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: field === "unitPrice" || field === "quantity" || field === "subtotal" ? parseFloat(value) || 0 : value };
        if (field === "unitPrice" || field === "quantity") {
          updated.subtotal = updated.unitPrice * updated.quantity;
        }
        return updated;
      })
    );
  }

  function updateFee(index: number, field: string, value: string | boolean) {
    setFees((prev) =>
      prev.map((fee, i) =>
        i !== index ? fee : { ...fee, [field]: field === "amount" ? parseFloat(value as string) || 0 : value }
      )
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/project/${projectId}`)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to comparison
        </button>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setLineItems(quote.lineItems);
                  setFees(quote.fees);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" loading={saving} onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Vendor info card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Vendor">
          {editing ? (
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="bg-bg border border-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-accent"
            />
          ) : (
            <span className="font-semibold text-text-primary">
              {quote.vendorName || "Unknown"}
            </span>
          )}
        </InfoCard>
        <InfoCard label="Currency">
          {editing ? (
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-bg border border-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-accent"
            />
          ) : (
            <span className="font-mono">{quote.currency || "—"}</span>
          )}
        </InfoCard>
        <InfoCard label="Payment Terms">
          {editing ? (
            <input
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="bg-bg border border-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-accent"
            />
          ) : (
            <span>{quote.paymentTerms || "—"}</span>
          )}
        </InfoCard>
        <InfoCard label="Delivery">
          {editing ? (
            <input
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              className="bg-bg border border-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-accent"
              type="number"
            />
          ) : (
            <span>{quote.deliveryDays ? `${quote.deliveryDays} days` : "—"}</span>
          )}
        </InfoCard>
      </div>

      {/* Original file */}
      {quote.fileName && (
        <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-dim">
            <path d="M9 1H4C3.44772 1 3 1.44772 3 2V14C3 14.5523 3.44772 15 4 15H12C12.5523 15 13 14.5523 13 14V5L9 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 1V5H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm text-text-muted flex-1">{quote.fileName}</span>
          {quote.originalFileUrl && (
            <a
              href={quote.originalFileUrl}
              className="text-xs text-accent hover:text-accent-light transition-colors"
              download
            >
              Download original
            </a>
          )}
        </div>
      )}

      {/* Line Items */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-surface border-b border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
            Line Items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface/50">
                <th className="text-left px-4 py-2 text-text-dim text-xs font-medium">
                  Item
                </th>
                <th className="text-left px-4 py-2 text-text-dim text-xs font-medium">
                  Original Name
                </th>
                <th className="text-right px-4 py-2 text-text-dim text-xs font-medium">
                  Unit Price
                </th>
                <th className="text-right px-4 py-2 text-text-dim text-xs font-medium">
                  Qty
                </th>
                <th className="text-left px-4 py-2 text-text-dim text-xs font-medium">
                  Unit
                </th>
                <th className="text-right px-4 py-2 text-text-dim text-xs font-medium">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={item.id} className={i % 2 === 0 ? "bg-bg" : "bg-surface/30"}>
                  <td className="px-4 py-2.5">
                    {editing ? (
                      <input
                        value={item.name}
                        onChange={(e) => updateLineItem(i, "name", e.target.value)}
                        className="bg-bg border border-border rounded px-2 py-1 text-sm w-full focus:outline-none focus:border-accent"
                      />
                    ) : (
                      <span className="text-text-primary">{item.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-text-dim text-xs">{item.rawName}</td>
                  <td className="px-4 py-2.5 text-right">
                    {editing ? (
                      <input
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(i, "unitPrice", e.target.value)}
                        className="bg-bg border border-border rounded px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-accent font-mono"
                        type="number"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-mono">{formatPrice(item.unitPrice, quote.currency)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editing ? (
                      <input
                        value={item.quantity}
                        onChange={(e) => updateLineItem(i, "quantity", e.target.value)}
                        className="bg-bg border border-border rounded px-2 py-1 text-sm w-20 text-right focus:outline-none focus:border-accent font-mono"
                        type="number"
                      />
                    ) : (
                      <span className="font-mono">{item.quantity}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-text-muted">{item.unit}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-medium text-text-primary">
                    {formatPrice(item.subtotal, quote.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fees */}
      {fees.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface border-b border-border">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              Fees & Surcharges
            </span>
          </div>
          <div className="divide-y divide-border">
            {fees.map((fee, i) => (
              <div key={fee.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {editing ? (
                    <input
                      value={fee.name}
                      onChange={(e) => updateFee(i, "name", e.target.value)}
                      className="bg-bg border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    />
                  ) : (
                    <span className="text-text-muted">{fee.name}</span>
                  )}
                  {fee.isHidden && <Badge variant="warning">Hidden</Badge>}
                </div>
                {editing ? (
                  <input
                    value={fee.amount}
                    onChange={(e) => updateFee(i, "amount", e.target.value)}
                    className="bg-bg border border-border rounded px-2 py-1 text-sm w-24 text-right focus:outline-none focus:border-accent font-mono"
                    type="number"
                    step="0.01"
                  />
                ) : (
                  <span className="font-mono text-text-primary">
                    {formatPrice(fee.amount, quote.currency)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grand Total */}
      <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
        <span className="font-semibold">Grand Total</span>
        <span className="font-mono font-semibold text-lg">
          {quote.grandTotal !== null
            ? formatPrice(quote.grandTotal, quote.currency)
            : "—"}
        </span>
      </div>

      {/* Notes */}
      {quote.notes.length > 0 && (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface border-b border-border">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-dim">
              AI Notes
            </span>
          </div>
          <div className="divide-y divide-border">
            {quote.notes.map((note, i) => (
              <div key={i} className="px-4 py-3 text-sm text-text-muted flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-accent shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="10.5" r="0.5" fill="currentColor" />
                </svg>
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Text */}
      {quote.rawText && (
        <details className="border border-border rounded-lg overflow-hidden">
          <summary className="px-4 py-2.5 bg-surface cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-text-dim hover:text-text-muted transition-colors">
            Raw Extracted Text
          </summary>
          <div className="px-4 py-3 bg-bg">
            <pre className="text-xs text-text-dim font-mono whitespace-pre-wrap leading-relaxed">
              {quote.rawText}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-3 bg-surface border border-border rounded-lg">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-text-dim mb-1.5">
        {label}
      </div>
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  );
}
