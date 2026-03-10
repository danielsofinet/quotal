import ExcelJS from "exceljs";
import path from "path";

async function generate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Quotal";
  wb.created = new Date();

  // Colors
  const purple = "635BFF";
  const darkBg = "0A2540";
  const lightBg = "F4F4F7";
  const midGray = "64748B";
  const white = "FFFFFF";
  const green = "00C48C";
  const red = "FF6B6B";

  const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: white }, size: 11 };
  const headerFill: ExcelJS.FillPattern = { type: "pattern", pattern: "solid", fgColor: { argb: darkBg } };
  const subHeaderFill: ExcelJS.FillPattern = { type: "pattern", pattern: "solid", fgColor: { argb: purple } };
  const altRowFill: ExcelJS.FillPattern = { type: "pattern", pattern: "solid", fgColor: { argb: lightBg } };
  const borderStyle: Partial<ExcelJS.Borders> = {
    top: { style: "thin", color: { argb: "DEDEDE" } },
    bottom: { style: "thin", color: { argb: "DEDEDE" } },
    left: { style: "thin", color: { argb: "DEDEDE" } },
    right: { style: "thin", color: { argb: "DEDEDE" } },
  };

  // ============================================================
  // Sheet 1: Vendor Info
  // ============================================================
  const info = wb.addWorksheet("Vendor Info", { properties: { tabColor: { argb: purple } } });
  info.columns = [
    { header: "", width: 28 },
    { header: "", width: 30 },
    { header: "", width: 30 },
    { header: "", width: 30 },
    { header: "", width: 30 },
  ];

  // Title
  info.mergeCells("A1:E1");
  const titleCell = info.getCell("A1");
  titleCell.value = "VENDOR QUOTE COMPARISON";
  titleCell.font = { bold: true, size: 16, color: { argb: darkBg } };
  titleCell.alignment = { vertical: "middle" };
  info.getRow(1).height = 36;

  info.mergeCells("A2:E2");
  info.getCell("A2").value = "Enter vendor details below. Add more columns for additional vendors.";
  info.getCell("A2").font = { italic: true, color: { argb: midGray }, size: 10 };

  // Headers
  const infoHeaders = ["", "Vendor 1", "Vendor 2", "Vendor 3", "Vendor 4"];
  const headerRow = info.getRow(4);
  infoHeaders.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = borderStyle;
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 28;

  const infoFields = [
    "Company Name",
    "Contact Person",
    "Email",
    "Phone",
    "Quote Number",
    "Quote Date",
    "Valid Until",
    "Payment Terms",
    "Delivery Terms",
    "Warranty",
    "Currency",
  ];

  infoFields.forEach((field, i) => {
    const row = info.getRow(5 + i);
    row.getCell(1).value = field;
    row.getCell(1).font = { bold: true, color: { argb: darkBg } };
    for (let c = 1; c <= 5; c++) {
      row.getCell(c).border = borderStyle;
      if (i % 2 === 0) row.getCell(c).fill = altRowFill;
    }
  });

  // ============================================================
  // Sheet 2: Line Item Comparison
  // ============================================================
  const items = wb.addWorksheet("Line Items", { properties: { tabColor: { argb: purple } } });
  items.columns = [
    { header: "", width: 8 },
    { header: "", width: 32 },
    { header: "", width: 10 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 16 },
  ];

  items.mergeCells("A1:N1");
  items.getCell("A1").value = "LINE ITEM COMPARISON";
  items.getCell("A1").font = { bold: true, size: 14, color: { argb: darkBg } };
  items.getRow(1).height = 32;

  // Sub-headers for vendor groups
  items.mergeCells("D3:F3");
  items.getCell("D3").value = "Vendor 1";
  items.getCell("D3").font = headerFont;
  items.getCell("D3").fill = subHeaderFill;
  items.getCell("D3").alignment = { horizontal: "center" };

  items.mergeCells("G3:I3");
  items.getCell("G3").value = "Vendor 2";
  items.getCell("G3").font = headerFont;
  items.getCell("G3").fill = subHeaderFill;
  items.getCell("G3").alignment = { horizontal: "center" };

  items.mergeCells("J3:L3");
  items.getCell("J3").value = "Vendor 3";
  items.getCell("J3").font = headerFont;
  items.getCell("J3").fill = subHeaderFill;
  items.getCell("J3").alignment = { horizontal: "center" };

  items.mergeCells("M3:N3");
  items.getCell("M3").value = "Analysis";
  items.getCell("M3").font = headerFont;
  items.getCell("M3").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1A1A25" } };
  items.getCell("M3").alignment = { horizontal: "center" };

  const itemHeaders = ["#", "Item Description", "Qty", "Unit $", "Total", "Notes", "Unit $", "Total", "Notes", "Unit $", "Total", "Notes", "Lowest", "Savings"];
  const itemHeaderRow = items.getRow(4);
  itemHeaders.forEach((h, i) => {
    const cell = itemHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = borderStyle;
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  itemHeaderRow.height = 28;

  // Sample rows with formulas
  for (let r = 0; r < 15; r++) {
    const row = items.getRow(5 + r);
    row.getCell(1).value = r + 1;
    row.getCell(1).alignment = { horizontal: "center" };

    // Totals: Unit * Qty
    const qtyRef = `C${5 + r}`;
    row.getCell(5).value = { formula: `D${5 + r}*${qtyRef}` } as ExcelJS.CellFormulaValue;  // V1 total
    row.getCell(8).value = { formula: `G${5 + r}*${qtyRef}` } as ExcelJS.CellFormulaValue;  // V2 total
    row.getCell(11).value = { formula: `J${5 + r}*${qtyRef}` } as ExcelJS.CellFormulaValue; // V3 total

    // Lowest price
    row.getCell(13).value = { formula: `MIN(E${5 + r},H${5 + r},K${5 + r})` } as ExcelJS.CellFormulaValue;
    // Savings vs highest
    row.getCell(14).value = { formula: `MAX(E${5 + r},H${5 + r},K${5 + r})-MIN(E${5 + r},H${5 + r},K${5 + r})` } as ExcelJS.CellFormulaValue;

    // Number format for price columns
    [4, 5, 7, 8, 10, 11, 13, 14].forEach((c) => {
      row.getCell(c).numFmt = '#,##0.00';
    });

    for (let c = 1; c <= 14; c++) {
      row.getCell(c).border = borderStyle;
      if (r % 2 === 0) row.getCell(c).fill = altRowFill;
    }
  }

  // Totals row
  const totalsRowNum = 20;
  const totalsRow = items.getRow(totalsRowNum);
  totalsRow.getCell(2).value = "TOTAL";
  totalsRow.getCell(2).font = { bold: true, color: { argb: darkBg } };
  totalsRow.getCell(5).value = { formula: `SUM(E5:E19)` } as ExcelJS.CellFormulaValue;
  totalsRow.getCell(8).value = { formula: `SUM(H5:H19)` } as ExcelJS.CellFormulaValue;
  totalsRow.getCell(11).value = { formula: `SUM(K5:K19)` } as ExcelJS.CellFormulaValue;
  totalsRow.getCell(13).value = { formula: `MIN(E${totalsRowNum},H${totalsRowNum},K${totalsRowNum})` } as ExcelJS.CellFormulaValue;
  totalsRow.getCell(14).value = { formula: `MAX(E${totalsRowNum},H${totalsRowNum},K${totalsRowNum})-MIN(E${totalsRowNum},H${totalsRowNum},K${totalsRowNum})` } as ExcelJS.CellFormulaValue;

  [4, 5, 7, 8, 10, 11, 13, 14].forEach((c) => {
    totalsRow.getCell(c).numFmt = '#,##0.00';
    totalsRow.getCell(c).font = { bold: true };
  });
  for (let c = 1; c <= 14; c++) {
    totalsRow.getCell(c).border = {
      top: { style: "medium", color: { argb: darkBg } },
      bottom: { style: "medium", color: { argb: darkBg } },
      left: { style: "thin", color: { argb: "DEDEDE" } },
      right: { style: "thin", color: { argb: "DEDEDE" } },
    };
  }

  // ============================================================
  // Sheet 3: Total Cost of Ownership
  // ============================================================
  const tco = wb.addWorksheet("TCO", { properties: { tabColor: { argb: purple } } });
  tco.columns = [
    { header: "", width: 32 },
    { header: "", width: 18 },
    { header: "", width: 18 },
    { header: "", width: 18 },
  ];

  tco.mergeCells("A1:D1");
  tco.getCell("A1").value = "TOTAL COST OF OWNERSHIP";
  tco.getCell("A1").font = { bold: true, size: 14, color: { argb: darkBg } };
  tco.getRow(1).height = 32;

  const tcoHeaders = ["Cost Category", "Vendor 1", "Vendor 2", "Vendor 3"];
  const tcoHeaderRow = tco.getRow(3);
  tcoHeaders.forEach((h, i) => {
    const cell = tcoHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = borderStyle;
  });

  const tcoItems = [
    "Quoted Product Total",
    "Shipping / Freight",
    "Import Duties / Taxes",
    "Setup / Installation",
    "Training",
    "Annual Maintenance",
    "Consumables (Year 1)",
    "Early Payment Discount",
    "Volume Discount",
    "Other Adjustments",
  ];

  tcoItems.forEach((item, i) => {
    const row = tco.getRow(4 + i);
    row.getCell(1).value = item;
    row.getCell(1).font = { color: { argb: darkBg } };
    if (item.includes("Discount")) row.getCell(1).font = { color: { argb: "00A67E" } };
    for (let c = 1; c <= 4; c++) {
      row.getCell(c).border = borderStyle;
      if (c > 1) row.getCell(c).numFmt = '#,##0.00';
      if (i % 2 === 0) row.getCell(c).fill = altRowFill;
    }
  });

  // TCO Total
  const tcoTotalRow = tco.getRow(14);
  tcoTotalRow.getCell(1).value = "TOTAL COST OF OWNERSHIP";
  tcoTotalRow.getCell(1).font = { bold: true, color: { argb: darkBg } };
  tcoTotalRow.getCell(2).value = { formula: "SUM(B4:B13)" } as ExcelJS.CellFormulaValue;
  tcoTotalRow.getCell(3).value = { formula: "SUM(C4:C13)" } as ExcelJS.CellFormulaValue;
  tcoTotalRow.getCell(4).value = { formula: "SUM(D4:D13)" } as ExcelJS.CellFormulaValue;
  for (let c = 1; c <= 4; c++) {
    tcoTotalRow.getCell(c).border = {
      top: { style: "medium", color: { argb: darkBg } },
      bottom: { style: "medium", color: { argb: darkBg } },
      left: { style: "thin", color: { argb: "DEDEDE" } },
      right: { style: "thin", color: { argb: "DEDEDE" } },
    };
    if (c > 1) {
      tcoTotalRow.getCell(c).numFmt = '#,##0.00';
      tcoTotalRow.getCell(c).font = { bold: true };
    }
  }

  // ============================================================
  // Sheet 4: Weighted Scoring
  // ============================================================
  const scoring = wb.addWorksheet("Scoring", { properties: { tabColor: { argb: purple } } });
  scoring.columns = [
    { header: "", width: 28 },
    { header: "", width: 12 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
    { header: "", width: 14 },
  ];

  scoring.mergeCells("A1:H1");
  scoring.getCell("A1").value = "WEIGHTED VENDOR SCORING";
  scoring.getCell("A1").font = { bold: true, size: 14, color: { argb: darkBg } };
  scoring.getRow(1).height = 32;

  scoring.mergeCells("A2:H2");
  scoring.getCell("A2").value = "Rate each vendor 1-5 per criteria. Weighted scores calculate automatically.";
  scoring.getCell("A2").font = { italic: true, color: { argb: midGray }, size: 10 };

  // Sub-headers
  scoring.mergeCells("C3:D3");
  scoring.getCell("C3").value = "Vendor 1";
  scoring.getCell("C3").font = headerFont;
  scoring.getCell("C3").fill = subHeaderFill;
  scoring.getCell("C3").alignment = { horizontal: "center" };

  scoring.mergeCells("E3:F3");
  scoring.getCell("E3").value = "Vendor 2";
  scoring.getCell("E3").font = headerFont;
  scoring.getCell("E3").fill = subHeaderFill;
  scoring.getCell("E3").alignment = { horizontal: "center" };

  scoring.mergeCells("G3:H3");
  scoring.getCell("G3").value = "Vendor 3";
  scoring.getCell("G3").font = headerFont;
  scoring.getCell("G3").fill = subHeaderFill;
  scoring.getCell("G3").alignment = { horizontal: "center" };

  const scoreHeaders = ["Criteria", "Weight", "Score", "Weighted", "Score", "Weighted", "Score", "Weighted"];
  const scoreHeaderRow = scoring.getRow(4);
  scoreHeaders.forEach((h, i) => {
    const cell = scoreHeaderRow.getCell(i + 1);
    cell.value = h;
    cell.font = headerFont;
    cell.fill = headerFill;
    cell.border = borderStyle;
    cell.alignment = { horizontal: "center" };
  });

  const criteria = [
    ["Price Competitiveness", "30%"],
    ["Product Quality", "20%"],
    ["Delivery Reliability", "15%"],
    ["Customer Support", "10%"],
    ["Payment Flexibility", "10%"],
    ["Warranty Terms", "10%"],
    ["Sustainability / ESG", "5%"],
  ];

  criteria.forEach(([name, weight], i) => {
    const row = scoring.getRow(5 + i);
    row.getCell(1).value = name;
    row.getCell(1).font = { color: { argb: darkBg } };
    row.getCell(2).value = parseFloat(weight!) / 100;
    row.getCell(2).numFmt = "0%";
    row.getCell(2).alignment = { horizontal: "center" };

    // Weighted = Score * Weight
    const r = 5 + i;
    row.getCell(4).value = { formula: `C${r}*B${r}` } as ExcelJS.CellFormulaValue;
    row.getCell(6).value = { formula: `E${r}*B${r}` } as ExcelJS.CellFormulaValue;
    row.getCell(8).value = { formula: `G${r}*B${r}` } as ExcelJS.CellFormulaValue;

    [4, 6, 8].forEach((c) => { row.getCell(c).numFmt = "0.00"; });

    for (let c = 1; c <= 8; c++) {
      row.getCell(c).border = borderStyle;
      if (i % 2 === 0) row.getCell(c).fill = altRowFill;
    }
  });

  // Total weighted score
  const scoreTotalRow = scoring.getRow(12);
  scoreTotalRow.getCell(1).value = "TOTAL WEIGHTED SCORE";
  scoreTotalRow.getCell(1).font = { bold: true, color: { argb: darkBg } };
  scoreTotalRow.getCell(2).value = { formula: "SUM(B5:B11)" } as ExcelJS.CellFormulaValue;
  scoreTotalRow.getCell(2).numFmt = "0%";
  scoreTotalRow.getCell(4).value = { formula: "SUM(D5:D11)" } as ExcelJS.CellFormulaValue;
  scoreTotalRow.getCell(6).value = { formula: "SUM(F5:F11)" } as ExcelJS.CellFormulaValue;
  scoreTotalRow.getCell(8).value = { formula: "SUM(H5:H11)" } as ExcelJS.CellFormulaValue;
  [4, 6, 8].forEach((c) => {
    scoreTotalRow.getCell(c).numFmt = "0.00";
    scoreTotalRow.getCell(c).font = { bold: true, size: 12 };
  });
  for (let c = 1; c <= 8; c++) {
    scoreTotalRow.getCell(c).border = {
      top: { style: "medium", color: { argb: darkBg } },
      bottom: { style: "medium", color: { argb: darkBg } },
      left: { style: "thin", color: { argb: "DEDEDE" } },
      right: { style: "thin", color: { argb: "DEDEDE" } },
    };
  }

  // ============================================================
  // Sheet 5: Instructions
  // ============================================================
  const guide = wb.addWorksheet("How to Use", { properties: { tabColor: { argb: "00C48C" } } });
  guide.columns = [{ header: "", width: 80 }];

  const instructions = [
    "VENDOR QUOTE COMPARISON TEMPLATE — How to Use",
    "",
    "This template helps you compare vendor quotes side by side and make data-driven purchasing decisions.",
    "",
    "STEP 1: VENDOR INFO TAB",
    "Fill in each vendor's contact details, quote dates, and terms. This gives you a quick reference during negotiations.",
    "",
    "STEP 2: LINE ITEMS TAB",
    "Enter each product/service as a row. Fill in quantities, then unit prices for each vendor.",
    "Totals, lowest price, and savings calculate automatically.",
    "The 'Notes' columns are for quality differences, specs, or delivery variations.",
    "",
    "STEP 3: TCO TAB",
    "Go beyond the quoted price. Add shipping, installation, maintenance, and any hidden costs.",
    "Subtract discounts. The TCO total shows the real cost of each vendor.",
    "",
    "STEP 4: SCORING TAB",
    "Rate each vendor 1-5 on qualitative criteria. Adjust weights to match your priorities.",
    "The weighted score gives you a single number to compare — combining price and non-price factors.",
    "",
    "TIPS",
    "• Add more vendor columns by copying an existing vendor column group",
    "• Adjust scoring weights to match what matters most for your purchase",
    "• Use conditional formatting to highlight the best values",
    "• Share the file with stakeholders — all data is in one place",
    "",
    "NEED MORE?",
    "If you're comparing 4+ vendors or dealing with PDFs and emails,",
    "try Quotal — it automates everything in this template: quotal.app",
  ];

  instructions.forEach((line, i) => {
    const cell = guide.getCell(`A${i + 1}`);
    cell.value = line;
    if (i === 0) cell.font = { bold: true, size: 16, color: { argb: darkBg } };
    else if (line.startsWith("STEP") || line === "TIPS" || line === "NEED MORE?")
      cell.font = { bold: true, size: 12, color: { argb: purple } };
    else cell.font = { size: 11, color: { argb: "333333" } };
  });

  // Save
  const outPath = path.join(
    process.cwd(),
    "public/templates/vendor-quote-comparison-template.xlsx"
  );
  await wb.xlsx.writeFile(outPath);
  console.log(`Template saved to ${outPath}`);
}

generate().catch(console.error);
