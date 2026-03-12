"use client";

import { useEffect, useState, useCallback } from "react";
import WorkerTaskCard from "@/components/worker/TaskCard";
import type { Task } from "@/lib/kv";

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [workerName, setWorkerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    fetch("/api/tasks")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/worker/login";
          return [];
        }
        return r.json();
      })
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
    // Try to get worker name from cookie/session
    fetch("/api/tasks").then((r) => {
      if (r.ok) {
        // We have a session, the name will be derived from tasks or shown generically
      }
    });
  }, [load]);

  const activeTasks = tasks
    .filter((t) => t.status === "pending" || t.status === "in_progress" || t.status === "paused")
    .sort((a, b) => {
      const statusOrder: Record<string, number> = { in_progress: 0, paused: 1, pending: 2 };
      const sa = statusOrder[a.status] ?? 3;
      const sb = statusOrder[b.status] ?? 3;
      if (sa !== sb) return sa - sb;
      const pa = PRIORITY_ORDER[a.priority] ?? 4;
      const pb = PRIORITY_ORDER[b.priority] ?? 4;
      if (pa !== pb) return pa - pb;
      if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

  const completedTasks = tasks
    .filter((t) => t.status === "completed")
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime());

  const hasInProgress = tasks.some((t) => t.status === "in_progress");

  const handleStart = async (taskId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/start`, { method: "POST" });
      if (res.ok) load();
      else {
        const data = await res.json();
        alert(data.error || "Failed to start task");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async (taskId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/pause`, { method: "POST" });
      if (res.ok) load();
      else {
        const data = await res.json();
        alert(data.error || "Failed to pause task");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (taskId: string, notes: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        const completed = await res.json();
        const mins = completed.timeSpentMinutes;
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
        alert(`Task completed!\nTime: ${timeStr}\nEarned: $${completed.cost.toFixed(2)}`);
        load();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const displayed = tab === "active" ? activeTasks : completedTasks;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">My Tasks</h1>
      </div>

      <div className="flex gap-1 bg-white rounded-card p-1 shadow-sm border border-gray-100">
        {(["active", "completed"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t
                ? "bg-purple-light text-purple-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "active" ? `Active (${activeTasks.length})` : `Completed (${completedTasks.length})`}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">
            {tab === "active" ? "No active tasks" : "No completed tasks"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((t) => (
            <WorkerTaskCard
              key={t.id}
              task={t}
              onStart={handleStart}
              onPause={handlePause}
              onComplete={handleComplete}
              hasInProgress={hasInProgress}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
