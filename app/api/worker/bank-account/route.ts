import { NextRequest, NextResponse } from "next/server";
import { requireWorker } from "@/lib/auth";
import { getWorker, updateWorker } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const session = await requireWorker();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const worker = await getWorker(session.workerId!);
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  const { accountLast4, routingLast4 } = await req.json();
  if (!accountLast4 || !routingLast4) {
    return NextResponse.json({ error: "Account and routing numbers required" }, { status: 400 });
  }

  const updated = await updateWorker(session.workerId!, {
    bankAccountLast4: accountLast4,
    bankRoutingLast4: routingLast4,
  });

  return NextResponse.json({
    bankAccountLast4: updated?.bankAccountLast4,
    bankRoutingLast4: updated?.bankRoutingLast4,
  });
}
