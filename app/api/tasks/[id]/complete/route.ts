import { NextRequest, NextResponse } from "next/server";
import { requireWorker } from "@/lib/auth";
import { getTask, updateTask, getWorker } from "@/lib/kv";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireWorker();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await getTask(params.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.assignedTo !== session.workerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (task.status !== "in_progress") {
    return NextResponse.json({ error: "Task is not in progress" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const completedAt = new Date().toISOString();
  const sessionMinutes = task.startedAt
    ? (new Date(completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000 / 60
    : 0;
  const timeSpentMinutes = (task.timeSpentMinutes || 0) + sessionMinutes;

  const worker = await getWorker(session.workerId!);
  const cost = (timeSpentMinutes / 60) * (worker?.hourlyRate || 0);

  const updated = await updateTask(params.id, {
    status: "completed",
    completedAt,
    timeSpentMinutes: Math.round(timeSpentMinutes * 100) / 100,
    cost: Math.round(cost * 100) / 100,
    notes: body.notes || task.notes,
  });

  return NextResponse.json(updated);
}
