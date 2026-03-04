import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: "postgresql://postgres:postgres@localhost:5432/quotal?schema=public" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const items = await prisma.lineItem.findMany({
    where: { quote: { projectId: "cmm9mfd1n0000ol2g6nisky1n" } },
    include: { quote: { select: { vendorName: true } } },
    orderBy: { canonicalName: "asc" },
  });

  let lastCanon = "";
  for (const i of items) {
    const canon = i.canonicalName || "NO CANONICAL";
    if (canon !== lastCanon) {
      console.log("\n--- " + canon + " ---");
      lastCanon = canon;
    }
    const variant = i.variantNote ? ` [${i.variantNote}]` : "";
    console.log(`  ${i.quote.vendorName}: ${i.name}${variant}`);
  }
  await prisma.$disconnect();
}

main();
