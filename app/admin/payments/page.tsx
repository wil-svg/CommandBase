"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/shared/Badge";
import { formatCost, formatTime, formatDateTime } from "@/lib/utils";
import type { Payment } from "@/lib/kv";

interface WorkerInfo {
  id: string;
  name: string;
}

interface TaskInfo {
  id: string;
  title: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending_review: { bg: "bg-amber-light", text: "text-amber-primary", label: "Pending Review" },
  approved: { bg: "bg-blue-50", text: "text-blue-600", label: "Approved" },
  processed: { bg: "bg-teal-light", text: "text-teal-primary", label: "Paid" },
  denied: { bg: "bg-coral-light", text: "text-coral-primary", label: "Denied" },
  failed: { bg: "bg-coral-light", text: "text-coral-primary", label: "Failed" },
};

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [workers, setWorkers] = useState<WorkerInfo[]>([]);
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/payments").then((r) => r.json()),
      fetch("/api/workers?include=all").then((r) => r.json()),
      fetch("/api/tasks").then((r) => r.json()),
    ]).then(([p, w, t]) => {
      setPayments(Array.isArray(p) ? p : []);
      setWorkers(Array.isArray(w) ? w : []);
      setTasks(Array.isArray(t) ? t : []);
      setLoading(false);
    });
  }, []);

  const workerMap = Object.fromEntries(workers.map((w) => [w.id, w.name]));
  const taskMap = Object.fromEntries(tasks.map((t) => [t.id, t.title]));

  const filtered = filter
    ? payments.filter((p) => p.status === filter)
    : payments;

  const pendingCount = payments.filter((p) => p.status === "pending_review").length;

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
        {pendingCount > 0 && (
          <span className="text-xs font-medium bg-amber-light text-amber-primary px-2 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {[
          { value: "", label: "All" },
          { value: "pending_review", label: "Pending" },
          { value: "processed", label: "Paid" },
          { value: "denied", label: "Denied" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 text-sm rounded-card whitespace-nowrap transition-colors ${
              filter === f.value
                ? "bg-purple-light text-purple-primary font-medium"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 bg-white rounded-card p-6 text-center">
          No payments found.
        </p>
      ) : (
        <div className="bg-white rounded-card border border-gray-100 divide-y divide-gray-50">
          {filtered.map((p) => {
            const s = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending_review;
            return (
              <button
                key={p.id}
                onClick={() => router.push(`/admin/payments/${p.id}`)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {taskMap[p.taskId] || "Unknown task"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {workerMap[p.workerId] || "Unknown"} &middot; {formatTime(p.timeSpentMinutes)} &middot; {formatDateTime(p.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono font-medium text-gray-900">
                    {formatCost(p.amount)}
                  </span>
                  <Badge className={`${s.bg} ${s.text}`}>{s.label}</Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
