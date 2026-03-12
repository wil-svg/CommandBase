"use client";

import Badge from "@/components/shared/Badge";
import { CATEGORY_COLORS, PRIORITY_COLORS, type Priority } from "@/lib/categories";
import { formatTime, formatCost, formatDate } from "@/lib/utils";
import type { Task } from "@/lib/kv";

interface AdminTaskCardProps {
  task: Task;
  workerName?: string;
  onClick?: () => void;
}

export default function AdminTaskCard({ task, workerName, onClick }: AdminTaskCardProps) {
  const catColor = CATEGORY_COLORS[task.category] || { bg: "bg-gray-100", text: "text-gray-600" };
  const priColor = PRIORITY_COLORS[task.priority as Priority] || { bg: "bg-gray-100", text: "text-gray-600" };

  const statusLabel: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    in_progress: "bg-blue-light text-blue-primary",
    completed: "bg-teal-light text-teal-primary",
    cancelled: "bg-coral-light text-coral-primary",
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-card p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
        <Badge className={statusColor[task.status]}>{statusLabel[task.status]}</Badge>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={`${catColor.bg} ${catColor.text}`}>{task.category}</Badge>
        <Badge className={`${priColor.bg} ${priColor.text}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{workerName || "Unassigned"}</span>
        <div className="flex items-center gap-3">
          {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
          {task.status === "completed" && (
            <>
              <span className="font-mono">{formatTime(task.timeSpentMinutes)}</span>
              <span className="font-mono font-medium text-gray-700">{formatCost(task.cost)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
