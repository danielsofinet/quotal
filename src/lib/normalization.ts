import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";

export interface NormalizedItem {
  lineItemId: string;
  canonicalName: string;
  variantNote: string | null;
}

const NORMALIZATION_SYSTEM_PROMPT = `You are a procurement comparison specialist. You receive line items from multiple vendor quotes for the SAME purchasing project. Your job: match items across vendors so they can be compared side-by-side.

MATCHING RULES:
- Two items are the "same product" if a buyer would consider them alternatives for the same need
- Match aggressively — vendors describe the same product very differently:
  - Different languages: "Florsocker" = "Icing Sugar", "Kaffekopp" = "Coffee Cup"
  - Brand vs generic: "Oatly Barista 1L" = "Oat Milk 1L"
  - Different pack sizes: "Napkins (box of 500)" = "Paper Napkins (pack of 1000)"
  - Abbreviations: "Choc Pwd 1kg" = "Chocolate Powder 1kg"
  - Category overlap: "Hot Chocolate Mix" = "Chocolate Powder" (same product category)
- Use the unit price, quantity, and unit to CONFIRM matches: similar products from different vendors will have comparable (not identical) unit prices
- When in doubt, MATCH rather than leave unmatched. A false match is less harmful than a missed match in procurement comparison.

OUTPUT RULES:
- canonicalName: clean, concise English. E.g. "Oat Milk 1L", "White Sugar 1kg", "Paper Napkins", "Takeaway Cups 350ml"
- variantNote: short difference note. E.g. "Oatly Barista", "cubed", "2-ply, pack of 1000", "Monin brand, 700ml". null if no notable difference.
- EVERY item must get a canonicalName, even if it has no match in other quotes

Return ONLY valid JSON array:
[
  { "id": "lineItemId", "canonicalName": "string", "variantNote": "string or null" }
]`;

export async function normalizeProjectItems(projectId: string): Promise<void> {
  // Find quotes that have completed extraction (have line items),
  // regardless of processingStatus — this allows normalization to run
  // before a quote is marked DONE, avoiding a race with the client poller.
  const quotes = await prisma.quote.findMany({
    where: { projectId, lineItems: { some: {} } },
    include: { lineItems: true },
  });

  if (quotes.length < 2) return;

  // Clear existing canonical names so we re-evaluate everything
  const allItemIds = quotes.flatMap((q) => q.lineItems.map((li) => li.id));
  await prisma.lineItem.updateMany({
    where: { id: { in: allItemIds } },
    data: { canonicalName: null, variantNote: null },
  });

  // Send names + quantities/units/prices for better matching context
  const input = quotes.map((q) => ({
    vendor: q.vendorName,
    items: q.lineItems.map((li) => ({
      id: li.id,
      name: li.name,
      rawName: li.rawName,
      unitPrice: li.unitPrice,
      quantity: li.quantity,
      unit: li.unit,
    })),
  }));

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: NORMALIZATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") return;

  const raw = textBlock.text.trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        parsed = JSON.parse(fenceMatch[1].trim());
      } catch {
        console.warn("Normalization: could not parse fenced JSON, skipping");
        return;
      }
    } else {
      console.warn("Normalization: response was not valid JSON, skipping");
      return;
    }
  }

  if (!Array.isArray(parsed)) return;

  // Build a set of valid line item IDs for security
  const validIds = new Set(
    quotes.flatMap((q) => q.lineItems.map((li) => li.id))
  );

  // Update each line item with its canonical name and variant note
  for (const item of parsed) {
    if (
      typeof item !== "object" ||
      !item ||
      typeof item.id !== "string" ||
      !validIds.has(item.id)
    ) {
      continue;
    }

    await prisma.lineItem.update({
      where: { id: item.id },
      data: {
        canonicalName:
          typeof item.canonicalName === "string"
            ? item.canonicalName.trim()
            : null,
        variantNote:
          typeof item.variantNote === "string"
            ? item.variantNote.trim()
            : null,
      },
    });
  }
}
