import { NextRequest, NextResponse } from "next/server";
import { getAppData, savePaperOrder } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getAppData();
  const positions = new Map<string, number>();
  for (const order of [...data.paperOrders].reverse()) {
    positions.set(order.symbol, (positions.get(order.symbol) || 0) + (order.side === "BUY" ? order.quantity : -order.quantity));
  }
  return NextResponse.json({ orders: data.paperOrders, positions: Object.fromEntries(positions) });
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  if (!["BUY", "SELL"].includes(payload.side) || !payload.symbol || Number(payload.quantity) <= 0 || Number(payload.price) <= 0) {
    return NextResponse.json({ error: "A valid symbol, side, quantity, and price are required." }, { status: 400 });
  }
  const order = await savePaperOrder({
    id: crypto.randomUUID(),
    symbol: String(payload.symbol).toUpperCase(),
    side: payload.side,
    quantity: Number(payload.quantity),
    price: Number(payload.price),
    modelVersion: String(payload.modelVersion || "manual"),
    experimentId: payload.experimentId,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(order, { status: 201 });
}
