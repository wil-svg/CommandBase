"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";
import { CATEGORY_COLORS, PRIORITY_COLORS, CATEGORIES, PRIORITIES, type Priority } from "@/lib/categories";
import { formatTime, formatCost, formatDate, formatDateTime } from "@/lib/utils";
import type { Task } from "@/lib/kv";

interface Worker {
  id: string;
  name: string;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch(`/api/tasks/${params.id}`).then((r) => r.json()),
      fetch("/api/workers").then((r) => r.json()),
    ]).then(([t, w]) => {
      setTask(t);
      setWorkers(Array.isArray(w) ? w : []);
      setForm({
        title: t.title,
        description: t.description || "",
        category: t.category,
        subcategory: t.subcategory || "",
        priority: t.priority,
        dueDate: t.dueDate || "",
        assignedTo: t.assignedTo,
      });
    });
  }, [params.id]);

  const handleSave = async () => {
    const res = await fetch(`/api/tasks/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTask(updated);
      setEditing(false);
    }
  };

  const handleCancel = async () => {
    const res = await fetch(`/api/tasks/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTask(updated);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/tasks/${params.id}`, { method: "DELETE" });
    router.push("/admin/tasks");
  };

  if (!task) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const catColor = CATEGORY_COLORS[task.category] || { bg: "bg-gray-100", text: "text-gray-600" };
  const priColor = PRIORITY_COLORS[task.priority as Priority] || { bg: "bg-gray-100", text: "text-gray-600" };
  const workerName = workers.find((w) => w.id === task.assignedTo)?.name || "Unknown";

  const statusLabel: Record<string, string> = {
    pending: "Pending", in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/tasks")} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Tasks
        </button>
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 space-y-4">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: "" }))} className="w-full border rounded-card px-3 py-2 text-sm bg-white">
                  {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subcategory</label>
                <select value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm bg-white">
                  <option value="">None</option>
                  {(CATEGORIES[form.category] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm bg-white">
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Assign To</label>
              <select value={form.assignedTo} onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm bg-white">
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
              <div className="flex gap-2">
                {task.status !== "completed" && task.status !== "cancelled" && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={handleCancel}>Cancel Task</Button>
                  </>
                )}
                <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${catColor.bg} ${catColor.text}`}>
                {task.category}{task.subcategory ? ` / ${task.subcategory}` : ""}
              </Badge>
              <Badge className={`${priColor.bg} ${priColor.text}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
              <Badge className="bg-gray-100 text-gray-600">{statusLabel[task.status]}</Badge>
            </div>
            {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Assigned to:</span> {workerName}</div>
              {task.dueDate && <div><span className="text-gray-500">Due:</span> {formatDate(task.dueDate)}</div>}
              <div><span className="text-gray-500">Created:</span> {formatDateTime(task.createdAt)}</div>
              {task.startedAt && <div><span className="text-gray-500">Started:</span> {formatDateTime(task.startedAt)}</div>}
              {task.completedAt && <div><span className="text-gray-500">Completed:</span> {formatDateTime(task.completedAt)}</div>}
              {task.status === "completed" && (
                <>
                  <div><span className="text-gray-500">Time:</span> <span className="font-mono">{formatTime(task.timeSpentMinutes)}</span></div>
                  <div><span className="text-gray-500">Cost:</span> <span className="font-mono">{formatCost(task.cost)}</span></div>
                </>
              )}
            </div>
            {task.notes && (
              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{task.notes}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
