"use client";

import { useState } from "react";
import Badge from "@/components/shared/Badge";
import { useToast } from "@/components/shared/Toast";

interface WorkerCardProps {
  worker: {
    id: string;
    name: string;
    hourlyRate: number;
    status: string;
  };
  stats?: {
    tasksCompletedMonth: number;
    hoursMonth: number;
  };
  onClick?: () => void;
  onStatusChange?: () => void;
}

export default function WorkerCard({ worker, stats, onClick, onStatusChange }: WorkerCardProps) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleInvite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSending(true);
    try {
      const res = await fetch(`/api/workers/${worker.id}/invite`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to send invite", "error");
      } else {
        toast("Invite sent!");
        onStatusChange?.();
      }
    } catch {
      toast("Failed to send invite", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-card p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-gray-900">{worker.name}</h3>
        <div className="flex items-center gap-2">
          {(worker.status === "invited" || worker.status === "pending") && (
            <button
              onClick={handleInvite}
              disabled={sending}
              className="text-xs font-medium px-2 py-1 rounded-card bg-purple-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? "Sending..." : worker.status === "invited" ? "Send Invite" : "Resend"}
            </button>
          )}
          <Badge
            className={
              worker.status === "active"
                ? "bg-teal-light text-teal-primary"
                : worker.status === "invited"
                ? "bg-purple-light text-purple-primary"
                : worker.status === "pending"
                ? "bg-amber-light text-amber-primary"
                : "bg-gray-100 text-gray-500"
            }
          >
            {worker.status === "active"
              ? "Active"
              : worker.status === "invited"
              ? "Invited"
              : worker.status === "pending"
              ? "Pending"
              : worker.status === "archived"
              ? "Archived"
              : "Inactive"}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-gray-500 font-mono">${worker.hourlyRate.toFixed(2)}/hr</p>
      {stats && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
          <span>{stats.tasksCompletedMonth} tasks this month</span>
          <span className="font-mono">{stats.hoursMonth.toFixed(1)}h this month</span>
        </div>
      )}
    </div>
  );
}
