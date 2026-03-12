import { NextRequest, NextResponse } from "next/server";
import { requireWorker } from "@/lib/auth";
import { getTask, updateTask, getWorkerTasks } from "@/lib/kv";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireWorker();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await getTask(params.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.assignedTo !== session.workerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (task.status !== "pending") {
    return NextResponse.json({ error: "Task is not pending" }, { status: 400 });
  }

  // Check no other task is in progress
  const workerTasks = await getWorkerTasks(session.workerId!);
  const inProgress = workerTasks.find((t) => t.status === "in_progress");
  if (inProgress) {
    return NextResponse.json(
      { error: "You already have a task in progress. Complete it first.", taskId: inProgress.id },
      { status: 409 }
    );
  }

  const updated = await updateTask(params.id, {
    status: "in_progress",
    startedAt: new Date().toISOString(),
  });

  return NextResponse.json(updated);
}
