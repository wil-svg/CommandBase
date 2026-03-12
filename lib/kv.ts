import { supabase } from "./supabase";

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  pin: string;
  hourlyRate: number;
  status: "invited" | "pending" | "active" | "inactive";
  balance: number;
  bankAccountLast4: string | null;
  bankRoutingLast4: string | null;
  stripeConnectAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  stripeCustomerId: string | null;
  cardLast4: string | null;
  cardBrand: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  taskId: string;
  workerId: string;
  amount: number;
  timeSpentMinutes: number;
  hourlyRate: number;
  status: "pending_review" | "approved" | "denied" | "processed" | "failed";
  stripePaymentIntentId: string | null;
  reviewedAt: string | null;
  processedAt: string | null;
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
    balance: Number(row.balance || 0),
    bankAccountLast4: (row.bank_account_last4 as string) || null,
    bankRoutingLast4: (row.bank_routing_last4 as string) || null,
    stripeConnectAccountId: (row.stripe_connect_account_id as string) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToAdminSettings(row: Record<string, unknown>): AdminSettings {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    addressLine1: row.address_line1 as string,
    addressLine2: row.address_line2 as string,
    city: row.city as string,
    state: row.state as string,
    zip: row.zip as string,
    stripeCustomerId: (row.stripe_customer_id as string) || null,
    cardLast4: (row.card_last4 as string) || null,
    cardBrand: (row.card_brand as string) || null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    taskId: row.task_id as string,
    workerId: row.worker_id as string,
    amount: Number(row.amount),
    timeSpentMinutes: Number(row.time_spent_minutes),
    hourlyRate: Number(row.hourly_rate),
    status: row.status as Payment["status"],
    stripePaymentIntentId: (row.stripe_payment_intent_id as string) || null,
    reviewedAt: (row.reviewed_at as string) || null,
    processedAt: (row.processed_at as string) || null,
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
  if (data.balance !== undefined) updateData.balance = data.balance;
  if (data.bankAccountLast4 !== undefined) updateData.bank_account_last4 = data.bankAccountLast4;
  if (data.bankRoutingLast4 !== undefined) updateData.bank_routing_last4 = data.bankRoutingLast4;
  if (data.stripeConnectAccountId !== undefined) updateData.stripe_connect_account_id = data.stripeConnectAccountId;

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

// Admin settings operations
export async function getAdminSettings(): Promise<AdminSettings | null> {
  const { data: row, error } = await supabase
    .from("admin_settings")
    .select()
    .limit(1)
    .single();

  if (error || !row) return null;
  return rowToAdminSettings(row);
}

export async function upsertAdminSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
  const existing = await getAdminSettings();
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.addressLine1 !== undefined) updateData.address_line1 = data.addressLine1;
  if (data.addressLine2 !== undefined) updateData.address_line2 = data.addressLine2;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.zip !== undefined) updateData.zip = data.zip;
  if (data.stripeCustomerId !== undefined) updateData.stripe_customer_id = data.stripeCustomerId;
  if (data.cardLast4 !== undefined) updateData.card_last4 = data.cardLast4;
  if (data.cardBrand !== undefined) updateData.card_brand = data.cardBrand;

  if (existing) {
    const { data: row, error } = await supabase
      .from("admin_settings")
      .update(updateData)
      .eq("id", existing.id)
      .select()
      .single();
    if (error || !row) throw new Error(error?.message || "Failed to update settings");
    return rowToAdminSettings(row);
  } else {
    const { data: row, error } = await supabase
      .from("admin_settings")
      .insert(updateData)
      .select()
      .single();
    if (error || !row) throw new Error(error?.message || "Failed to create settings");
    return rowToAdminSettings(row);
  }
}

// Payment operations
export async function createPayment(data: {
  taskId: string;
  workerId: string;
  amount: number;
  timeSpentMinutes: number;
  hourlyRate: number;
}): Promise<Payment> {
  const { data: row, error } = await supabase
    .from("payments")
    .insert({
      task_id: data.taskId,
      worker_id: data.workerId,
      amount: data.amount,
      time_spent_minutes: data.timeSpentMinutes,
      hourly_rate: data.hourlyRate,
    })
    .select()
    .single();

  if (error || !row) throw new Error(error?.message || "Failed to create payment");
  return rowToPayment(row);
}

export async function getPayment(id: string): Promise<Payment | null> {
  const { data: row, error } = await supabase
    .from("payments")
    .select()
    .eq("id", id)
    .single();

  if (error || !row) return null;
  return rowToPayment(row);
}

export async function getAllPayments(): Promise<Payment[]> {
  const { data: rows, error } = await supabase
    .from("payments")
    .select()
    .order("created_at", { ascending: false });

  if (error || !rows) return [];
  return rows.map(rowToPayment);
}

export async function updatePayment(id: string, data: Partial<Payment>): Promise<Payment | null> {
  const updateData: Record<string, unknown> = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.stripePaymentIntentId !== undefined) updateData.stripe_payment_intent_id = data.stripePaymentIntentId;
  if (data.reviewedAt !== undefined) updateData.reviewed_at = data.reviewedAt;
  if (data.processedAt !== undefined) updateData.processed_at = data.processedAt;

  const { data: row, error } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error || !row) return null;
  return rowToPayment(row);
}
