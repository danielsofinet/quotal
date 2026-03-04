import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data
  await prisma.fee.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const user = await prisma.user.create({
    data: {
      firebaseUid: "demo-seed-user",
      email: "demo@quotal.app",
      name: "Alex Chen",
      inboxAddress: `quotes+${uuidv4().slice(0, 8)}@quotal.app`,
    },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      name: "Q2 Packaging Materials",
      userId: user.id,
    },
  });

  // Quote 1: QuickPack Srl (Italian supplier - cheapest on most items but no VAT)
  const quote1 = await prisma.quote.create({
    data: {
      projectId: project.id,
      vendorName: "QuickPack Srl",
      fileName: "quickpack_q2_2026_offer.pdf",
      originalFileUrl: "/uploads/quickpack_q2_2026_offer.pdf",
      currency: "EUR",
      dateReceived: new Date("2026-02-15"),
      paymentTerms: "Net 45",
      deliveryDays: 14,
      notes: [
        "All prices exclude VAT (22%) — totals may not be directly comparable with VAT-inclusive quotes",
        "Free delivery for orders over €10,000",
        "Quote valid until 2026-04-30",
      ],
      grandTotal: 8747.0,
      processingStatus: "DONE",
      rawText:
        "QuickPack Srl — Offerta Q2 2026\nCorrugated Carton 40x30x20cm — €0.85/pc × 2000 = €1,700\nBubble Wrap Roll 100m — €32.00/roll × 15 = €480\nStretch Film 500mm — €18.50/roll × 30 = €555\nPacking Tape 66m — €2.20/roll × 100 = €220\nFoam Sheets 1m×2m — €4.80/sheet × 200 = €960\nPaper Void Fill 50m — €12.00/roll × 25 = €300\nShipping Labels 100×150mm — €0.03/pc × 5000 = €150\nPalletization: €180\nDelivery: €0 (orders over €10,000)\nNote: All prices exclude VAT 22%",
    },
  });

  await prisma.lineItem.createMany({
    data: [
      { quoteId: quote1.id, name: "Corrugated Carton 40×30×20cm", rawName: "Corrugated Carton 40x30x20cm", unitPrice: 0.85, quantity: 2000, unit: "pcs", subtotal: 1700 },
      { quoteId: quote1.id, name: "Bubble Wrap Roll 100m", rawName: "Bubble Wrap Roll 100m", unitPrice: 32.0, quantity: 15, unit: "rolls", subtotal: 480 },
      { quoteId: quote1.id, name: "Stretch Film 500mm", rawName: "Stretch Film 500mm", unitPrice: 18.5, quantity: 30, unit: "rolls", subtotal: 555 },
      { quoteId: quote1.id, name: "Packing Tape 66m", rawName: "Packing Tape 66m", unitPrice: 2.2, quantity: 100, unit: "rolls", subtotal: 220 },
      { quoteId: quote1.id, name: "Foam Sheets 1×2m", rawName: "Foam Sheets 1m×2m", unitPrice: 4.8, quantity: 200, unit: "sheets", subtotal: 960 },
      { quoteId: quote1.id, name: "Paper Void Fill 50m", rawName: "Paper Void Fill 50m", unitPrice: 12.0, quantity: 25, unit: "rolls", subtotal: 300 },
      { quoteId: quote1.id, name: "Shipping Labels 100×150mm", rawName: "Shipping Labels 100×150mm", unitPrice: 0.03, quantity: 5000, unit: "pcs", subtotal: 150 },
    ],
  });

  await prisma.fee.createMany({
    data: [
      { quoteId: quote1.id, name: "Palletization", amount: 180, isHidden: false },
      { quoteId: quote1.id, name: "Delivery", amount: 0, isHidden: false },
    ],
  });

  // Quote 2: PackRight GmbH (German supplier - mid-range, includes hidden surcharge)
  const quote2 = await prisma.quote.create({
    data: {
      projectId: project.id,
      vendorName: "PackRight GmbH",
      fileName: "packright_angebot_2026.xlsx",
      originalFileUrl: "/uploads/packright_angebot_2026.xlsx",
      currency: "EUR",
      dateReceived: new Date("2026-02-18"),
      paymentTerms: "Net 30",
      deliveryDays: 7,
      notes: [
        "Minimum order quantity of 5,000 pcs for corrugated cartons",
        "Prices include VAT (19% DE)",
        "Express delivery available at additional cost",
      ],
      grandTotal: 10289.5,
      processingStatus: "DONE",
      rawText:
        "PackRight GmbH — Angebot Nr. 2026-0482\nWellpappkarton 400×300×200mm — €1.12/Stk × 2000 = €2,240\nLuftpolsterfolie 100m — €38.50/Rolle × 15 = €577.50\nStretchfolie 500mm — €21.00/Rolle × 30 = €630\nPackband 66m — €2.85/Rolle × 100 = €285\nSchaumstoffplatten 1000×2000mm — €5.60/Platte × 200 = €1,120\nFüllpapier 50m — €14.20/Rolle × 25 = €355\nVersandetiketten 100×150mm — €0.04/Stk × 5000 = €200\nVersand: €320\nBrennstoffzuschlag: €85 (see terms p.4)\nPalettierung: €150\nMindestbestellmenge Wellpappkarton: 5.000 Stk",
    },
  });

  await prisma.lineItem.createMany({
    data: [
      { quoteId: quote2.id, name: "Corrugated Carton 40×30×20cm", rawName: "Wellpappkarton 400×300×200mm", unitPrice: 1.12, quantity: 2000, unit: "pcs", subtotal: 2240 },
      { quoteId: quote2.id, name: "Bubble Wrap Roll 100m", rawName: "Luftpolsterfolie 100m", unitPrice: 38.5, quantity: 15, unit: "rolls", subtotal: 577.5 },
      { quoteId: quote2.id, name: "Stretch Film 500mm", rawName: "Stretchfolie 500mm", unitPrice: 21.0, quantity: 30, unit: "rolls", subtotal: 630 },
      { quoteId: quote2.id, name: "Packing Tape 66m", rawName: "Packband 66m", unitPrice: 2.85, quantity: 100, unit: "rolls", subtotal: 285 },
      { quoteId: quote2.id, name: "Foam Sheets 1×2m", rawName: "Schaumstoffplatten 1000×2000mm", unitPrice: 5.6, quantity: 200, unit: "sheets", subtotal: 1120 },
      { quoteId: quote2.id, name: "Paper Void Fill 50m", rawName: "Füllpapier 50m", unitPrice: 14.2, quantity: 25, unit: "rolls", subtotal: 355 },
      { quoteId: quote2.id, name: "Shipping Labels 100×150mm", rawName: "Versandetiketten 100×150mm", unitPrice: 0.04, quantity: 5000, unit: "pcs", subtotal: 200 },
    ],
  });

  await prisma.fee.createMany({
    data: [
      { quoteId: quote2.id, name: "Shipping", amount: 320, isHidden: false },
      { quoteId: quote2.id, name: "Fuel Surcharge", amount: 85, isHidden: true },
      { quoteId: quote2.id, name: "Palletization", amount: 150, isHidden: false },
    ],
  });

  // Quote 3: Nordic Supplies AB (Swedish supplier - most expensive but volume discount)
  const quote3 = await prisma.quote.create({
    data: {
      projectId: project.id,
      vendorName: "Nordic Supplies AB",
      fileName: "nordic_supplies_quote_2026.pdf",
      originalFileUrl: "/uploads/nordic_supplies_quote_2026.pdf",
      currency: "EUR",
      dateReceived: new Date("2026-02-20"),
      paymentTerms: "Net 60",
      deliveryDays: 10,
      notes: [
        "10% discount on orders over €15,000 which is not reflected in the totals above",
        "All materials are FSC certified",
        "Prices include VAT (25% SE)",
        "Free return policy for defective goods within 30 days",
      ],
      grandTotal: 11095.0,
      processingStatus: "DONE",
      rawText:
        "Nordic Supplies AB — Quotation #NS-2026-1847\nCorrugated Box 400×300×200mm — €1.25/pc × 2000 = €2,500\nBubble Wrap 100m roll — €41.00/roll × 15 = €615\nStretch Wrap 500mm — €22.50/roll × 30 = €675\nPacking Tape 66m — €3.10/roll × 100 = €310\nFoam Padding 1m×2m — €6.20/sheet × 200 = €1,240\nVoid Fill Paper 50m — €15.50/roll × 25 = €387.50\nShipping Labels 100×150mm — €0.035/pc × 5000 = €175\nStandard Delivery: €450\nHandling Fee: €45\nEnvironmental Surcharge: €22.50 (per Swedish regulation SFS 2014:1073)\nAll materials FSC certified. Volume discount: 10% on orders exceeding €15,000.",
    },
  });

  await prisma.lineItem.createMany({
    data: [
      { quoteId: quote3.id, name: "Corrugated Carton 40×30×20cm", rawName: "Corrugated Box 400×300×200mm", unitPrice: 1.25, quantity: 2000, unit: "pcs", subtotal: 2500 },
      { quoteId: quote3.id, name: "Bubble Wrap Roll 100m", rawName: "Bubble Wrap 100m roll", unitPrice: 41.0, quantity: 15, unit: "rolls", subtotal: 615 },
      { quoteId: quote3.id, name: "Stretch Film 500mm", rawName: "Stretch Wrap 500mm", unitPrice: 22.5, quantity: 30, unit: "rolls", subtotal: 675 },
      { quoteId: quote3.id, name: "Packing Tape 66m", rawName: "Packing Tape 66m", unitPrice: 3.1, quantity: 100, unit: "rolls", subtotal: 310 },
      { quoteId: quote3.id, name: "Foam Sheets 1×2m", rawName: "Foam Padding 1m×2m", unitPrice: 6.2, quantity: 200, unit: "sheets", subtotal: 1240 },
      { quoteId: quote3.id, name: "Paper Void Fill 50m", rawName: "Void Fill Paper 50m", unitPrice: 15.5, quantity: 25, unit: "rolls", subtotal: 387.5 },
      { quoteId: quote3.id, name: "Shipping Labels 100×150mm", rawName: "Shipping Labels 100×150mm", unitPrice: 0.035, quantity: 5000, unit: "pcs", subtotal: 175 },
    ],
  });

  await prisma.fee.createMany({
    data: [
      { quoteId: quote3.id, name: "Standard Delivery", amount: 450, isHidden: false },
      { quoteId: quote3.id, name: "Handling Fee", amount: 45, isHidden: false },
      { quoteId: quote3.id, name: "Environmental Surcharge", amount: 22.5, isHidden: true },
    ],
  });

  // Create a second empty project for demo
  await prisma.project.create({
    data: {
      name: "Office Supplies Renewal",
      userId: user.id,
    },
  });

  console.log("Seed data created successfully!");
  console.log(`Demo user: ${user.email}`);
  console.log(`Inbox: ${user.inboxAddress}`);
  console.log(`Project: ${project.name} with 3 quotes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
