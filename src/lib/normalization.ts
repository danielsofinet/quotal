import { anthropic } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma";

export interface NormalizedItem {
  lineItemId: string;
  canonicalName: string;
  variantNote: string | null;
}

const NORMALIZATION_SYSTEM_PROMPT = `You are a procurement comparison specialist. You will receive line items extracted from multiple vendor quotes for the same purchasing project.

Your job is to:
1. MATCH items across vendors that refer to the same product category, even when names differ wildly (different languages, abbreviations, brand names, sizing formats)
2. Assign each item a shared canonicalName that all matching items will share
3. When matched items have meaningful differences (e.g. 1-ply vs 2-ply, cubed vs granulated, different brand), add a short variantNote describing that vendor's specific variant

Rules:
- Two items are the "same product" if a procurement buyer would consider them interchangeable alternatives for the same need
- "White Sugar Cubes 1kg" and "Granulated Sugar 1kg" → SAME category (both are "White Sugar 1kg"), but note the variant (cubed vs granulated)
- "Oatly Barista 1L" and "Minor Figures Oat Milk 1L" → SAME category ("Oat Milk 1L"), variant is the brand
- Be aggressive about matching — different pack sizes for the same product should still match (note the pack size difference)
- canonicalName should be clean, concise English: "Oat Milk 1L", "White Sugar 1kg", "Paper Napkins", "Takeaway Cups 350ml"
- variantNote should be very short: "Oatly Barista", "cubed", "2-ply", "box of 1000", "Monin brand". null if no notable difference.
- Items that exist in only one quote should still get a canonicalName (just no matching peers)

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

  // Build compact input — only send what's needed for matching (id + names)
  const input = quotes.map((q) => ({
    vendor: q.vendorName,
    items: q.lineItems.map((li) => ({
      id: li.id,
      name: li.name,
      rawName: li.rawName,
    })),
  }));

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
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
