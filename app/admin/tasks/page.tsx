"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import AdminTaskCard from "@/components/admin/TaskCard";
import FilterBar from "@/components/admin/FilterBar";
import CreateTaskModal from "@/components/admin/CreateTaskModal";
import type { Task } from "@/lib/kv";

interface Worker {
  id: string;
  name: string;
  status?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", worker: "", category: "", priority: "" });
  const router = useRouter();

  const load = () => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/workers").then((r) => r.json()),
    ]).then(([t, w]) => {
      setTasks(Array.isArray(t) ? t : []);
      setWorkers(Array.isArray(w) ? w : []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w.name]));

  const filtered = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.worker && t.assignedTo !== filters.worker) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
        <Button onClick={() => setShowCreate(true)}>Create Task</Button>
      </div>

      <FilterBar filters={filters} workers={workers} onChange={setFilters} />

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 bg-white rounded-card p-6 text-center">
          No tasks found.
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => (
            <AdminTaskCard
              key={t.id}
              task={t}
              workerName={workerMap[t.assignedTo]}
              onClick={() => router.push(`/admin/tasks/${t.id}`)}
            />
          ))}
        </div>
      )}

      <CreateTaskModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
        workers={workers.filter((w) => w.status === "active")}
      />
    </div>
  );
}
