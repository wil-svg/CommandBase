import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { getTask, updateTask, deleteTask } from "@/lib/kv";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await getTask(params.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.role === "worker" && task.assignedTo !== session.workerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(task);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await getTask(params.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  if (session.role === "worker") {
    if (task.assignedTo !== session.workerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed: Record<string, unknown> = {};
    if (body.status !== undefined) allowed.status = body.status;
    if (body.notes !== undefined) allowed.notes = body.notes;
    const updated = await updateTask(params.id, allowed);
    return NextResponse.json(updated);
  }

  const updated = await updateTask(params.id, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const success = await deleteTask(params.id);
  if (!success) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
