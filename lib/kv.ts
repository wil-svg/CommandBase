import { kv } from "@vercel/kv";
import { v4 as uuid } from "uuid";

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  pin: string;
  hourlyRate: number;
  status: "active" | "inactive";
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
  status: "pending" | "in_progress" | "completed" | "cancelled";
  createdAt: string;
  createdBy: string;
  startedAt: string | null;
  completedAt: string | null;
  timeSpentMinutes: number;
  cost: number;
  notes: string;
}

// Worker operations
export async function createWorker(data: Omit<Worker, "id" | "createdAt" | "updatedAt">): Promise<Worker> {
  const id = uuid();
  const now = new Date().toISOString();
  const worker: Worker = { ...data, id, createdAt: now, updatedAt: now };
  await kv.set(`worker:${id}`, JSON.stringify(worker));
  await kv.sadd("workers:index", id);
  return worker;
}

export async function getWorker(id: string): Promise<Worker | null> {
  const data = await kv.get<string>(`worker:${id}`);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function getAllWorkers(): Promise<Worker[]> {
  const ids = await kv.smembers("workers:index");
  if (!ids || ids.length === 0) return [];
  const workers: Worker[] = [];
  for (const id of ids) {
    const worker = await getWorker(id as string);
    if (worker) workers.push(worker);
  }
  return workers;
}

export async function updateWorker(id: string, data: Partial<Worker>): Promise<Worker | null> {
  const worker = await getWorker(id);
  if (!worker) return null;
  const updated = { ...worker, ...data, id, updatedAt: new Date().toISOString() };
  await kv.set(`worker:${id}`, JSON.stringify(updated));
  return updated;
}

export async function findWorkerByPin(pin: string): Promise<Worker | null> {
  const workers = await getAllWorkers();
  const bcrypt = await import("bcryptjs");
  for (const worker of workers) {
    if (worker.status === "active" && await bcrypt.compare(pin, worker.pin)) {
      return worker;
    }
  }
  return null;
}

// Task operations
export async function createTask(data: Omit<Task, "id" | "createdAt" | "startedAt" | "completedAt" | "timeSpentMinutes" | "cost">): Promise<Task> {
  const id = uuid();
  const now = new Date().toISOString();
  const task: Task = {
    ...data,
    id,
    createdAt: now,
    startedAt: null,
    completedAt: null,
    timeSpentMinutes: 0,
    cost: 0,
  };
  await kv.set(`task:${id}`, JSON.stringify(task));
  await kv.sadd("tasks:index", id);
  await kv.sadd(`tasks:worker:${data.assignedTo}`, id);
  await kv.sadd(`tasks:status:${data.status}`, id);
  return task;
}

export async function getTask(id: string): Promise<Task | null> {
  const data = await kv.get<string>(`task:${id}`);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function getAllTasks(): Promise<Task[]> {
  const ids = await kv.smembers("tasks:index");
  if (!ids || ids.length === 0) return [];
  const tasks: Task[] = [];
  for (const id of ids) {
    const task = await getTask(id as string);
    if (task) tasks.push(task);
  }
  return tasks;
}

export async function getWorkerTasks(workerId: string): Promise<Task[]> {
  const ids = await kv.smembers(`tasks:worker:${workerId}`);
  if (!ids || ids.length === 0) return [];
  const tasks: Task[] = [];
  for (const id of ids) {
    const task = await getTask(id as string);
    if (task) tasks.push(task);
  }
  return tasks;
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
  const task = await getTask(id);
  if (!task) return null;
  const oldStatus = task.status;
  const updated = { ...task, ...data, id };
  await kv.set(`task:${id}`, JSON.stringify(updated));
  if (data.status && data.status !== oldStatus) {
    await kv.srem(`tasks:status:${oldStatus}`, id);
    await kv.sadd(`tasks:status:${data.status}`, id);
  }
  return updated;
}

export async function deleteTask(id: string): Promise<boolean> {
  const task = await getTask(id);
  if (!task) return false;
  await kv.del(`task:${id}`);
  await kv.srem("tasks:index", id);
  await kv.srem(`tasks:worker:${task.assignedTo}`, id);
  await kv.srem(`tasks:status:${task.status}`, id);
  return true;
}

export async function getWorkerStats(workerId: string) {
  const tasks = await getWorkerTasks(workerId);
  const completed = tasks.filter((t) => t.status === "completed");
  const now = new Date();
  const thisMonth = completed.filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisYear = completed.filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    return d.getFullYear() === now.getFullYear();
  });

  return {
    tasksCompletedMonth: thisMonth.length,
    tasksCompletedYear: thisYear.length,
    hoursMonth: thisMonth.reduce((sum, t) => sum + t.timeSpentMinutes / 60, 0),
    hoursYear: thisYear.reduce((sum, t) => sum + t.timeSpentMinutes / 60, 0),
    costMonth: thisMonth.reduce((sum, t) => sum + t.cost, 0),
    costYear: thisYear.reduce((sum, t) => sum + t.cost, 0),
  };
}
