import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      lineItems: true,
      fees: true,
      project: { select: { userId: true } },
    },
  });

  if (!quote || quote.project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(quote);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { project: { select: { userId: true } } },
  });

  if (!quote || quote.project.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { vendorName, currency, paymentTerms, deliveryDays, lineItems, fees } = body;

  // Update quote fields
  await prisma.quote.update({
    where: { id },
    data: {
      ...(vendorName !== undefined && { vendorName }),
      ...(currency !== undefined && { currency }),
      ...(paymentTerms !== undefined && { paymentTerms }),
      ...(deliveryDays !== undefined && { deliveryDays }),
    },
  });

  // Update line items if provided (scoped to this quote only)
  if (lineItems && Array.isArray(lineItems)) {
    for (const item of lineItems) {
      if (item.id) {
        await prisma.lineItem.update({
          where: { id: item.id, quoteId: id },
          data: {
            name: item.name,
            rawName: item.rawName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            unit: item.unit,
            subtotal: item.subtotal,
          },
        });
      }
    }
  }

  // Update fees if provided (scoped to this quote only)
  if (fees && Array.isArray(fees)) {
    for (const fee of fees) {
      if (fee.id) {
        await prisma.fee.update({
          where: { id: fee.id, quoteId: id },
          data: {
            name: fee.name,
            amount: fee.amount,
            isHidden: fee.isHidden,
          },
        });
      }
    }
  }

  // Recalculate grand total
  const allItems = await prisma.lineItem.findMany({ where: { quoteId: id } });
  const allFees = await prisma.fee.findMany({ where: { quoteId: id } });
  const grandTotal =
    allItems.reduce((sum, item) => sum + item.subtotal, 0) +
    allFees.reduce((sum, fee) => sum + fee.amount, 0);

  await prisma.quote.update({
    where: { id },
    data: { grandTotal },
  });

  const result = await prisma.quote.findUnique({
    where: { id },
    include: { lineItems: true, fees: true },
  });

  return NextResponse.json(result);
}
