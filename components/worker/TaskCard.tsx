"use client";

import { useState } from "react";
import Badge from "@/components/shared/Badge";
import Button from "@/components/shared/Button";
import Timer from "@/components/worker/Timer";
import CompleteModal from "@/components/worker/CompleteModal";
import { CATEGORY_COLORS, PRIORITY_COLORS, type Priority } from "@/lib/categories";
import { formatTime, formatCost, formatDate, formatDateTime, isDueToday, isOverdue } from "@/lib/utils";
import type { Task } from "@/lib/kv";

interface WorkerTaskCardProps {
  task: Task;
  onStart: (taskId: string) => void;
  onComplete: (taskId: string, notes: string) => void;
  hasInProgress: boolean;
  loading?: boolean;
}

export default function WorkerTaskCard({ task, onStart, onComplete, hasInProgress, loading }: WorkerTaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  const catColor = CATEGORY_COLORS[task.category] || { bg: "bg-gray-100", text: "text-gray-600" };
  const priColor = PRIORITY_COLORS[task.priority as Priority] || { bg: "bg-gray-100", text: "text-gray-600" };

  const dueDateWarning = task.dueDate
    ? isOverdue(task.dueDate)
      ? "text-coral-primary font-medium"
      : isDueToday(task.dueDate)
      ? "text-amber-primary font-medium"
      : "text-gray-500"
    : "";

  return (
    <>
      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge className={`${catColor.bg} ${catColor.text}`}>
            {task.category}
            {task.subcategory ? ` / ${task.subcategory}` : ""}
          </Badge>
          <Badge className={`${priColor.bg} ${priColor.text}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
        </div>

        {task.dueDate && (
          <p className={`text-xs mb-3 ${dueDateWarning}`}>
            {isOverdue(task.dueDate) ? "Overdue" : isDueToday(task.dueDate) ? "Due today" : `Due ${formatDate(task.dueDate)}`}
          </p>
        )}

        {task.description && (
          <div className="mb-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-purple-primary hover:underline"
            >
              {expanded ? "Hide Instructions" : "View Instructions"}
            </button>
            {expanded && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
          </div>
        )}

        {task.status === "pending" && (
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => onStart(task.id)}
            disabled={loading || (hasInProgress && task.status === "pending")}
          >
            {hasInProgress ? "Complete current task first" : "Start Task"}
          </Button>
        )}

        {task.status === "in_progress" && (
          <div className="space-y-3">
            <div className="flex justify-center py-2">
              <Timer startedAt={task.startedAt!} />
            </div>
            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={() => setShowComplete(true)}
              disabled={loading}
            >
              Complete Task
            </Button>
          </div>
        )}

        {task.status === "completed" && (
          <div className="text-sm text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Time spent</span>
              <span className="font-mono">{formatTime(task.timeSpentMinutes)}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed</span>
              <span>{task.completedAt ? formatDateTime(task.completedAt) : "-"}</span>
            </div>
            {task.notes && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-600">{task.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CompleteModal
        open={showComplete}
        onClose={() => setShowComplete(false)}
        onComplete={(notes) => {
          onComplete(task.id, notes);
          setShowComplete(false);
        }}
        taskTitle={task.title}
        loading={loading}
      />
    </>
  );
}
