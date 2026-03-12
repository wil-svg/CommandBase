import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getWorkerStats } from "@/lib/kv";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stats = await getWorkerStats(params.id);
  return NextResponse.json(stats);
}
