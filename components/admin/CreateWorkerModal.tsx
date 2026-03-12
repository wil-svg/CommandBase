"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";

interface CreateWorkerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateWorkerModal({ open, onClose, onCreated }: CreateWorkerModalProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", hourlyRate: "", pin: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setForm((f) => ({ ...f, pin }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hourlyRate: parseFloat(form.hourlyRate) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create worker");
      }
      setForm({ name: "", email: "", phone: "", hourlyRate: "", pin: "" });
      onCreated();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Worker">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-coral-primary bg-coral-light p-2 rounded">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($) *</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.hourlyRate}
            onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
            className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Login PIN *</label>
          <div className="flex gap-2">
            <input
              required
              value={form.pin}
              onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
              className="flex-1 border border-gray-200 rounded-card px-3 py-2 text-sm font-mono tracking-widest"
              minLength={4}
              maxLength={6}
              pattern="[0-9]{4,6}"
              placeholder="4-6 digits"
            />
            <Button type="button" variant="secondary" size="sm" onClick={generatePin}>
              Generate
            </Button>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Add Worker"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
