import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPayment, getTask, getWorker } from "@/lib/kv";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payment = await getPayment(params.id);
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await getTask(payment.taskId);
  const worker = await getWorker(payment.workerId);

  return NextResponse.json({
    payment,
    task,
    worker: worker ? { id: worker.id, name: worker.name } : null,
  });
}
