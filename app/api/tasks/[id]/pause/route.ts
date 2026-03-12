import { NextRequest, NextResponse } from "next/server";
import { requireWorker } from "@/lib/auth";
import { getTask, updateTask } from "@/lib/kv";

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

  // Calculate elapsed time for this session and add to accumulated time
  const sessionMinutes = (Date.now() - new Date(task.startedAt!).getTime()) / 1000 / 60;
  const totalMinutes = (task.timeSpentMinutes || 0) + sessionMinutes;

  const updated = await updateTask(params.id, {
    status: "paused",
    timeSpentMinutes: Math.round(totalMinutes * 100) / 100,
    startedAt: null,
  });

  return NextResponse.json(updated);
}
