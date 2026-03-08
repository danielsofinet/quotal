import { extractText } from "unpdf";
import ExcelJS from "exceljs";
import { Readable } from "stream";

/**
 * Parse a file buffer and extract its text content.
 * Returns the extracted text, or null if the file is image-based
 * (scanned PDF, etc.) and needs Claude's vision API instead.
 */
export async function parseFile(
  buffer: Buffer,
  mimeType: string,
): Promise<string | null> {
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

  // Images and unsupported types return null — caller should use Claude's vision
  return null;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function parsePdf(buffer: Buffer): Promise<string | null> {
  const result = await extractText(new Uint8Array(buffer), { mergePages: true });
  const content = String(result.text).trim();

  // If empty, it's likely a scanned/image-based PDF — return null so caller falls back to Claude vision
  if (content.length < 20) {
    return null;
  }

  return content;
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

    parts.push("");
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

  if (typeof cell.value === "object" && "result" in cell.value) {
    return String(cell.value.result ?? "");
  }

  if (typeof cell.value === "object" && "richText" in cell.value) {
    return (cell.value.richText as Array<{ text: string }>)
      .map((fragment) => fragment.text)
      .join("");
  }

  if (cell.value instanceof Date) {
    return cell.value.toISOString();
  }

  return String(cell.value);
}
