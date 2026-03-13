"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { useToast } from "@/components/shared/Toast";
import StatsCards from "@/components/admin/StatsCards";
import AdminTaskCard from "@/components/admin/TaskCard";
import { formatCost } from "@/lib/utils";
import type { Task } from "@/lib/kv";

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  hourlyRate: number;
  status: string;
}

interface Stats {
  tasksCompletedMonth: number;
  tasksCompletedYear: number;
  hoursMonth: number;
  hoursYear: number;
  costMonth: number;
  costYear: number;
}

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editing, setEditing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", hourlyRate: "" });

  useEffect(() => {
    const id = params.id as string;
    Promise.all([
      fetch(`/api/workers/${id}`).then((r) => r.json()),
      fetch(`/api/workers/${id}/stats`).then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ]).then(([w, s, t]) => {
      setWorker(w);
      setStats(s);
      setForm({ name: w.name, email: w.email || "", phone: w.phone || "", hourlyRate: String(w.hourlyRate) });
      const workerTasks = (Array.isArray(t) ? t : []).filter((task: Task) => task.assignedTo === id);
      setTasks(workerTasks);
    });
  }, [params.id]);

  const handleSave = async () => {
    const res = await fetch(`/api/workers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hourlyRate: parseFloat(form.hourlyRate) }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWorker(updated);
      setEditing(false);
      toast("Worker updated");
    }
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      const res = await fetch(`/api/workers/${params.id}/invite`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast("Invite sent!");
        const updated = await fetch(`/api/workers/${params.id}`).then((r) => r.json());
        setWorker(updated);
      } else {
        toast(data.error || "Failed to send invite", "error");
      }
    } finally {
      setInviting(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm("Archive this worker? They will be hidden from the main list and cannot be assigned tasks.")) return;
    const res = await fetch(`/api/workers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    });
    if (res.ok) router.push("/admin/workers");
  };

  const handleRestore = async () => {
    const res = await fetch(`/api/workers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWorker(updated);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Permanently delete this worker? This cannot be undone.")) return;
    await fetch(`/api/workers/${params.id}`, { method: "DELETE" });
    router.push("/admin/workers");
  };

  if (!worker) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const isArchived = worker.status === "archived";
  const canInvite = worker.status === "invited" || worker.status === "pending";
  const canArchive = ["active", "invited", "pending", "inactive"].includes(worker.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin/workers")} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Workers
        </button>
        <h2 className="text-lg font-semibold text-gray-900">{worker.name}</h2>
      </div>

      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hourly Rate</label>
                <input type="number" step="0.01" value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border rounded-card px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">Rate:</span> <span className="font-mono">${worker.hourlyRate.toFixed(2)}/hr</span></p>
              {worker.email && <p><span className="text-gray-500">Email:</span> {worker.email}</p>}
              {worker.phone && <p><span className="text-gray-500">Phone:</span> {worker.phone}</p>}
              <p>
                <span className="text-gray-500">Status:</span>{" "}
                <span className={
                  worker.status === "active" ? "text-teal-primary font-medium" :
                  worker.status === "invited" ? "text-purple-primary font-medium" :
                  worker.status === "pending" ? "text-amber-primary font-medium" :
                  worker.status === "archived" ? "text-gray-400 font-medium" :
                  "text-gray-500 font-medium"
                }>
                  {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canInvite && (
                <Button size="sm" onClick={handleInvite} disabled={inviting}>
                  {inviting ? "Sending..." : worker.status === "invited" ? "Send Invite" : "Resend Invite"}
                </Button>
              )}
              {!isArchived && (
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
              )}
              {isArchived && (
                <Button size="sm" variant="secondary" onClick={handleRestore}>Restore</Button>
              )}
              {canArchive && (
                <Button size="sm" variant="danger" onClick={handleArchive}>Archive</Button>
              )}
              <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        )}
      </div>

      {stats && (
        <StatsCards
          stats={[
            { label: "Tasks This Month", value: stats.tasksCompletedMonth },
            { label: "Tasks This Year", value: stats.tasksCompletedYear },
            { label: "Hours This Month", value: stats.hoursMonth.toFixed(1) },
            { label: "Hours This Year", value: stats.hoursYear.toFixed(1) },
            { label: "Cost This Month", value: formatCost(stats.costMonth) },
            { label: "Cost This Year", value: formatCost(stats.costYear) },
          ]}
        />
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Task History</h3>
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white rounded-card p-4">No tasks assigned.</p>
        ) : (
          <div className="grid gap-3">
            {tasks.map((t) => (
              <AdminTaskCard key={t.id} task={t} workerName={worker.name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
