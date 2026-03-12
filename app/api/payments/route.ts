import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAllPayments } from "@/lib/kv";

export async function GET() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await getAllPayments();
  return NextResponse.json(payments);
}
