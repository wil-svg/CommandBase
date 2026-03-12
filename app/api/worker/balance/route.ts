import { NextResponse } from "next/server";
import { requireWorker } from "@/lib/auth";
import { getWorker, getAllPayments } from "@/lib/kv";

export async function GET() {
  const session = await requireWorker();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const worker = await getWorker(session.workerId!);
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  const allPayments = await getAllPayments();
  const workerPayments = allPayments
    .filter((p) => p.workerId === session.workerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    balance: worker.balance,
    bankAccountLast4: worker.bankAccountLast4,
    bankRoutingLast4: worker.bankRoutingLast4,
    payments: workerPayments,
  });
}
