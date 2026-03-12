import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPayment, updatePayment } from "@/lib/kv";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payment = await getPayment(params.id);
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payment.status !== "pending_review") {
    return NextResponse.json({ error: "Payment already reviewed" }, { status: 400 });
  }

  await updatePayment(params.id, {
    status: "denied",
    reviewedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, status: "denied" });
}
