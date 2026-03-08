import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExtractedLineItem {
  rawName: string;
  normalizedName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface ExtractedFee {
  name: string;
  amount: number;
  isHidden: boolean;
}

export interface ExtractedQuote {
  vendorName: string | null;
  currency: string | null;
  paymentTerms: string | null;
  deliveryDays: number | null;
  lineItems: ExtractedLineItem[];
  fees: ExtractedFee[];
  notes: string[];
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const EXTRACTION_SYSTEM_PROMPT = `You are a procurement data extraction specialist. You will receive a vendor/supplier quote — either as text, a PDF document, or an image. Your job is to extract structured pricing data from it.

Extract the following and return ONLY valid JSON (no markdown, no explanation):

{
  "vendorName": "string",
  "currency": "string — ISO currency code",
  "paymentTerms": "string",
  "deliveryDays": number or null,
  "lineItems": [
    {
      "rawName": "string",
      "normalizedName": "string",
      "unitPrice": number,
      "quantity": number,
      "unit": "string",
      "subtotal": number
    }
  ],
  "fees": [
    {
      "name": "string",
      "amount": number,
      "isHidden": boolean
    }
  ],
  "notes": ["string"]
}

Important rules:
- If a subtotal is not explicitly stated, calculate it from unitPrice × quantity
- Convert all prices to the document's stated currency
- Flag any fees that appear buried, unclear, or easily overlooked as isHidden: true
- If the document is in a non-English language, still extract everything and translate field names to English
- If you cannot determine a field with confidence, use null rather than guessing`;

// ---------------------------------------------------------------------------
// Media types that Claude can handle natively as documents/images
// ---------------------------------------------------------------------------

const DOCUMENT_TYPES = new Set(["application/pdf"]);
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

// ---------------------------------------------------------------------------
// Main extraction — text input
// ---------------------------------------------------------------------------

export async function extractQuoteData(
  rawText: string,
): Promise<ExtractedQuote> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Cannot extract quote data from empty text");
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: rawText,
      },
    ],
  });

  return parseExtractionResponse(response);
}

// ---------------------------------------------------------------------------
// Main extraction — file input (PDF, images sent directly to Claude)
// ---------------------------------------------------------------------------

export async function extractQuoteFromFile(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractedQuote> {
  const base64 = buffer.toString("base64");
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  if (DOCUMENT_TYPES.has(mimeType)) {
    content.push({
      type: "document",
      source: {
        type: "base64",
        media_type: mimeType as "application/pdf",
        data: base64,
      },
    });
  } else if (IMAGE_TYPES.has(mimeType)) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: mimeType as "image/png" | "image/jpeg" | "image/gif" | "image/webp",
        data: base64,
      },
    });
  } else {
    throw new Error(`Cannot send ${mimeType} directly to Claude`);
  }

  content.push({
    type: "text",
    text: "Extract all pricing data from this quote document.",
  });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });

  return parseExtractionResponse(response);
}

// ---------------------------------------------------------------------------
// Check if a MIME type can be sent directly to Claude
// ---------------------------------------------------------------------------

export function isDirectFileType(mimeType: string): boolean {
  return DOCUMENT_TYPES.has(mimeType) || IMAGE_TYPES.has(mimeType);
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

function parseExtractionResponse(response: Anthropic.Messages.Message): ExtractedQuote {
  const textBlock = response.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content during extraction");
  }

  const raw = textBlock.text.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Attempt to recover if Claude wrapped JSON in a markdown code fence.
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        parsed = JSON.parse(fenceMatch[1].trim());
      } catch {
        throw new Error(
          "Failed to parse extraction response as JSON even after stripping code fences",
        );
      }
    } else {
      throw new Error("Failed to parse extraction response as JSON");
    }
  }

  return validateExtractedQuote(parsed);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateExtractedQuote(data: unknown): ExtractedQuote {
  if (typeof data !== "object" || data === null) {
    throw new Error("Extraction response is not a JSON object");
  }

  const obj = data as Record<string, unknown>;

  const lineItems: ExtractedLineItem[] = Array.isArray(obj.lineItems)
    ? obj.lineItems.map(validateLineItem)
    : [];

  const fees: ExtractedFee[] = Array.isArray(obj.fees)
    ? obj.fees.map(validateFee)
    : [];

  const notes: string[] = Array.isArray(obj.notes)
    ? obj.notes.filter((n): n is string => typeof n === "string")
    : [];

  return {
    vendorName: typeof obj.vendorName === "string" ? obj.vendorName : null,
    currency: typeof obj.currency === "string" ? obj.currency : null,
    paymentTerms: typeof obj.paymentTerms === "string" ? obj.paymentTerms : null,
    deliveryDays: typeof obj.deliveryDays === "number" ? obj.deliveryDays : null,
    lineItems,
    fees,
    notes,
  };
}

function validateLineItem(raw: unknown): ExtractedLineItem {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Line item is not a JSON object");
  }

  const item = raw as Record<string, unknown>;

  return {
    rawName: typeof item.rawName === "string" ? item.rawName : "",
    normalizedName:
      typeof item.normalizedName === "string" ? item.normalizedName : "",
    unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : 0,
    quantity: typeof item.quantity === "number" ? item.quantity : 0,
    unit: typeof item.unit === "string" ? item.unit : "",
    subtotal: typeof item.subtotal === "number" ? item.subtotal : 0,
  };
}

function validateFee(raw: unknown): ExtractedFee {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Fee is not a JSON object");
  }

  const fee = raw as Record<string, unknown>;

  return {
    name: typeof fee.name === "string" ? fee.name : "",
    amount: typeof fee.amount === "number" ? fee.amount : 0,
    isHidden: typeof fee.isHidden === "boolean" ? fee.isHidden : false,
  };
}
