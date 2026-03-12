"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { formatTime, formatCost, formatDateTime } from "@/lib/utils";
import type { Task, Payment } from "@/lib/kv";

interface PaymentDetail {
  payment: Payment;
  task: Task;
  worker: { id: string; name: string } | null;
}

export default function PaymentReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetch(`/api/payments/${params.id}`)
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
        setLoading(false);
      });
  }, [params.id, router]);

  const handleAction = async (action: "approve" | "deny") => {
    setActionLoading(true);
    setResult(null);
    const res = await fetch(`/api/payments/${params.id}/${action}`, { method: "POST" });
    const body = await res.json();
    if (res.ok) {
      setResult({
        type: "success",
        message: action === "approve"
          ? "Payment processed! Worker balance has been credited."
          : "Payment denied.",
      });
      // Refresh data
      const updated = await fetch(`/api/payments/${params.id}`).then((r) => r.json());
      setData(updated);
    } else {
      setResult({ type: "error", message: body.error || "Action failed" });
    }
    setActionLoading(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-gray-400">Payment not found.</div>;

  const { payment, task, worker } = data;
  const isPending = payment.status === "pending_review";

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/admin")} className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Dashboard
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Review Payment</h2>
      </div>

      {result && (
        <div className={`p-3 rounded-card text-sm ${
          result.type === "success" ? "bg-teal-light text-teal-primary" : "bg-coral-light text-coral-primary"
        }`}>
          {result.message}
        </div>
      )}

      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <p className="text-xs text-gray-500">Task</p>
          <p className="text-sm font-medium text-gray-900">{task?.title || "Unknown task"}</p>
          {task?.notes && (
            <p className="text-xs text-gray-500 mt-1 italic">{task.notes}</p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500">Worker</p>
          <p className="text-sm font-medium text-gray-900">{worker?.name || "Unknown"}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Time Worked</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              {formatTime(payment.timeSpentMinutes)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Rate</p>
            <p className="text-lg font-mono font-semibold text-gray-900">
              ${payment.hourlyRate.toFixed(2)}/hr
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Due</p>
            <p className="text-lg font-mono font-semibold text-purple-primary">
              {formatCost(payment.amount)}
            </p>
          </div>
        </div>

        {task?.completedAt && (
          <div>
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-sm text-gray-700">{formatDateTime(task.completedAt)}</p>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p className={`text-sm font-medium ${
            payment.status === "pending_review" ? "text-amber-primary" :
            payment.status === "processed" ? "text-teal-primary" :
            payment.status === "denied" ? "text-coral-primary" :
            payment.status === "failed" ? "text-coral-primary" :
            "text-gray-500"
          }`}>
            {payment.status === "pending_review" ? "Pending Review" :
             payment.status === "processed" ? "Processed" :
             payment.status === "denied" ? "Denied" :
             payment.status === "failed" ? "Failed" :
             payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </p>
        </div>

        {isPending && (
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => handleAction("approve")}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Approve & Pay"}
            </Button>
            <Button
              size="lg"
              variant="danger"
              className="flex-1"
              onClick={() => handleAction("deny")}
              disabled={actionLoading}
            >
              Deny
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
