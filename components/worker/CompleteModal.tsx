"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";

interface CompleteModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (notes: string) => void;
  taskTitle: string;
  loading?: boolean;
}

export default function CompleteModal({ open, onClose, onComplete, taskTitle, loading }: CompleteModalProps) {
  const [notes, setNotes] = useState("");

  return (
    <Modal open={open} onClose={onClose} title="Complete Task">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Mark <strong>{taskTitle}</strong> as complete?
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this task..."
            className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="success" size="lg" onClick={() => onComplete(notes)} disabled={loading}>
            {loading ? "Completing..." : "Complete Task"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
