import { NextRequest, NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth";
import { createTask, getAllTasks, getWorkerTasks } from "@/lib/kv";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let tasks;
  if (session.role === "admin") {
    tasks = await getAllTasks();
  } else {
    tasks = await getWorkerTasks(session.workerId!);
  }

  tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, category, subcategory, priority, dueDate, assignedTo } = body;

  if (!title || !category || !priority || !assignedTo) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const task = await createTask({
    title,
    description: description || "",
    category,
    subcategory: subcategory || "",
    priority,
    dueDate: dueDate || null,
    assignedTo,
    status: "pending",
    createdBy: "admin",
    notes: "",
  });

  return NextResponse.json(task, { status: 201 });
}
