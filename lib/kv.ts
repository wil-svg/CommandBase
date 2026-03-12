import { supabase } from "./supabase";

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  pin: string;
  hourlyRate: number;
  status: "invited" | "pending" | "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate: string | null;
  assignedTo: string;
  status: "pending" | "in_progress" | "paused" | "completed" | "cancelled";
  createdAt: string;
  createdBy: string;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentMinutes: number;
  cost: number;
  notes: string;
}

// Map DB row (snake_case) to app interface (camelCase)
function rowToWorker(row: Record<string, unknown>): Worker {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    pin: row.pin as string,
    hourlyRate: Number(row.hourly_rate),
    status: row.status as Worker["status"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToTask(row: Record<string, unknown>): Task {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    subcategory: row.subcategory as string,
    priority: row.priority as Task["priority"],
    dueDate: (row.due_date as string) || null,
    assignedTo: row.assigned_to as string,
    status: row.status as Task["status"],
    createdAt: row.created_at as string,
    createdBy: row.created_by as string,
    startedAt: (row.started_at as string) || null,
    completedAt: (row.completed_at as string) || null,
    timeSpentMinutes: Number(row.time_spent_minutes),
    cost: Number(row.cost),
    notes: row.notes as string,
  };
}

// Worker operations
export async function createWorker(data: Omit<Worker, "id" | "createdAt" | "updatedAt">): Promise<Worker> {
  const { data: row, error } = await supabase
    .from("workers")
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      pin: data.pin,
      hourly_rate: data.hourlyRate,
      status: data.status,
    })
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || "Failed to create worker");
  return rowToWorker(row);
}

export async function getWorker(id: string): Promise<Worker | null> {
  const { data: row, error } = await supabase
    .from("workers")
    .select()
    .eq("id", id)
    .single();

  if (error || !row) return null;
  return rowToWorker(row);
}

export async function getAllWorkers(): Promise<Worker[]> {
  const { data: rows, error } = await supabase
    .from("workers")
    .select()
    .order("created_at", { ascending: false });

  if (error || !rows) return [];
  return rows.map(rowToWorker);
}

export async function updateWorker(id: string, data: Partial<Worker>): Promise<Worker | null> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.pin !== undefined) updateData.pin = data.pin;
  if (data.hourlyRate !== undefined) updateData.hourly_rate = data.hourlyRate;
  if (data.status !== undefined) updateData.status = data.status;

  const { data: row, error } = await supabase
    .from("workers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !row) return null;
  return rowToWorker(row);
}

export async function findWorkerByPin(pin: string): Promise<Worker | null> {
  const { data: rows } = await supabase
    .from("workers")
    .select()
    .in("status", ["invited", "pending", "active"]);

  if (!rows) return null;
  const bcrypt = await import("bcryptjs");
  for (const row of rows) {
    if (await bcrypt.compare(pin, row.pin)) {
      return rowToWorker(row);
    }
  }
  return null;
}

// Task operations
export async function createTask(data: Omit<Task, "id" | "createdAt" | "startedAt" | "completedAt" | "timeSpentMinutes" | "cost">): Promise<Task> {
  const { data: row, error } = await supabase
    .from("tasks")
    .insert({
      title: data.title,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      priority: data.priority,
      due_date: data.dueDate,
      assigned_to: data.assignedTo,
      status: data.status,
      created_by: data.createdBy,
      notes: data.notes,
    })
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || "Failed to create task");
  return rowToTask(row);
}

export async function getTask(id: string): Promise<Task | null> {
  const { data: row, error } = await supabase
    .from("tasks")
    .select()
    .eq("id", id)
    .single();

  if (error || !row) return null;
  return rowToTask(row);
}

export async function getAllTasks(): Promise<Task[]> {
  const { data: rows, error } = await supabase
    .from("tasks")
    .select()
    .order("created_at", { ascending: false });

  if (error || !rows) return [];
  return rows.map(rowToTask);
}

export async function getWorkerTasks(workerId: string): Promise<Task[]> {
  const { data: rows, error } = await supabase
    .from("tasks")
    .select()
    .eq("assigned_to", workerId)
    .order("created_at", { ascending: false });

  if (error || !rows) return [];
  return rows.map(rowToTask);
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
  if (data.assignedTo !== undefined) updateData.assigned_to = data.assignedTo;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startedAt !== undefined) updateData.started_at = data.startedAt;
  if (data.completedAt !== undefined) updateData.completed_at = data.completedAt;
  if (data.timeSpentMinutes !== undefined) updateData.time_spent_minutes = data.timeSpentMinutes;
  if (data.cost !== undefined) updateData.cost = data.cost;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const { data: row, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !row) return null;
  return rowToTask(row);
}

export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  return !error;
}

export async function getWorkerStats(workerId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

  const { data: monthRows } = await supabase
    .from("tasks")
    .select("time_spent_minutes, cost")
    .eq("assigned_to", workerId)
    .eq("status", "completed")
    .gte("completed_at", monthStart);

  const { data: yearRows } = await supabase
    .from("tasks")
    .select("time_spent_minutes, cost")
    .eq("assigned_to", workerId)
    .eq("status", "completed")
    .gte("completed_at", yearStart);

  const month = monthRows || [];
  const year = yearRows || [];

  return {
    tasksCompletedMonth: month.length,
    tasksCompletedYear: year.length,
    hoursMonth: month.reduce((sum, t) => sum + Number(t.time_spent_minutes) / 60, 0),
    hoursYear: year.reduce((sum, t) => sum + Number(t.time_spent_minutes) / 60, 0),
    costMonth: month.reduce((sum, t) => sum + Number(t.cost), 0),
    costYear: year.reduce((sum, t) => sum + Number(t.cost), 0),
  };
}
