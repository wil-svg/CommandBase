"use client";

import { useEffect, useState } from "react";
import StatsCards from "@/components/admin/StatsCards";
import { formatTime, formatCost, formatDateTime, isThisMonth } from "@/lib/utils";
import type { Task } from "@/lib/kv";

interface WorkerInfo {
  id: string;
  name: string;
}

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/workers").then((r) => r.json()),
    ]).then(([t, w]) => {
      setTasks(Array.isArray(t) ? t : []);
      setWorkers(Array.isArray(w) ? w : []);
      setLoading(false);
    });
  }, []);

  const activeTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const completedThisMonth = tasks.filter((t) => t.status === "completed" && t.completedAt && isThisMonth(t.completedAt));
  const hoursThisMonth = completedThisMonth.reduce((s, t) => s + t.timeSpentMinutes / 60, 0);
  const costThisMonth = completedThisMonth.reduce((s, t) => s + t.cost, 0);

  const recentCompleted = tasks
    .filter((t) => t.status === "completed" && t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 10);

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w.name]));

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>

      <StatsCards
        stats={[
          { label: "Active Tasks", value: activeTasks.length },
          { label: "Completed This Month", value: completedThisMonth.length },
          { label: "Hours This Month", value: hoursThisMonth.toFixed(1) },
          { label: "Cost This Month", value: formatCost(costThisMonth) },
        ]}
      />

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h3>
        {recentCompleted.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white rounded-card p-4">No completed tasks yet.</p>
        ) : (
          <div className="bg-white rounded-card border border-gray-100 divide-y divide-gray-50">
            {recentCompleted.map((task) => (
              <div key={task.id} className="px-4 py-3 flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-4">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    {workerMap[task.assignedTo] || "Unknown"} &middot;{" "}
                    {task.completedAt ? formatDateTime(task.completedAt) : ""}
                  </p>
                  {task.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic truncate">{task.notes}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono text-gray-700">{formatTime(task.timeSpentMinutes)}</p>
                  <p className="text-xs font-mono text-gray-500">{formatCost(task.cost)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
