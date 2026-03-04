import { PDFParse } from "pdf-parse";
import ExcelJS from "exceljs";
import { Readable } from "stream";

/**
 * Parse a file buffer and extract its text content.
 *
 * Supported formats:
 *  - PDF (text-based)
 *  - XLSX / XLS / CSV (via ExcelJS)
 *  - Plain text
 */
export async function parseFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const mime = mimeType.toLowerCase();

  if (mime === "application/pdf") {
    return parsePdf(buffer);
  }

  if (
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel" ||
    mime === "text/csv"
  ) {
    return parseSpreadsheet(buffer, mime);
  }

  if (mime === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Identity transform for pasted text — returns the input unchanged.
 * Provided as a symmetric API surface for the paste-text upload flow.
 */
export function parseText(text: string): string {
  return text;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  const text = result.text.trim();

  if (text.length === 0) {
    throw new Error(
      "PDF appears to be scanned/image-based. Please upload a text-based PDF, or paste the quote text manually.",
    );
  }

  return text;
}

async function parseSpreadsheet(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const workbook = new ExcelJS.Workbook();

  if (mimeType === "text/csv") {
    const stream = Readable.from(buffer);
    await workbook.csv.read(stream);
  } else {
    await workbook.xlsx.load(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer);
  }

  const parts: string[] = [];

  workbook.eachSheet((worksheet, sheetId) => {
    parts.push(`--- Sheet ${sheetId}: ${worksheet.name} ---`);

    worksheet.eachRow((row, rowNumber) => {
      const cells: string[] = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        cells.push(cellToString(cell));
      });
      parts.push(`Row ${rowNumber}: ${cells.join(" | ")}`);
    });

    parts.push(""); // blank line between sheets
  });

  const result = parts.join("\n").trim();

  if (result.length === 0) {
    throw new Error("Spreadsheet appears to be empty");
  }

  return result;
}

function cellToString(cell: ExcelJS.Cell): string {
  if (cell.value === null || cell.value === undefined) {
    return "";
  }

  // ExcelJS can return rich-text objects, dates, formulas, etc.
  if (typeof cell.value === "object" && "result" in cell.value) {
    // Formula cell — use the cached result.
    return String(cell.value.result ?? "");
  }

  if (typeof cell.value === "object" && "richText" in cell.value) {
    // Rich-text cell — concatenate the plain-text fragments.
    return (cell.value.richText as Array<{ text: string }>)
      .map((fragment) => fragment.text)
      .join("");
  }

  if (cell.value instanceof Date) {
    return cell.value.toISOString();
  }

  return String(cell.value);
}
