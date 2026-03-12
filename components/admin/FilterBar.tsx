"use client";

import { CATEGORIES, PRIORITIES, STATUSES } from "@/lib/categories";

interface FilterBarProps {
  filters: {
    status: string;
    worker: string;
    category: string;
    priority: string;
  };
  workers: { id: string; name: string }[];
  onChange: (filters: FilterBarProps["filters"]) => void;
}

export default function FilterBar({ filters, workers, onChange }: FilterBarProps) {
  const update = (key: string, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="border border-gray-200 rounded-card px-3 py-2 text-sm bg-white"
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </option>
        ))}
      </select>
      <select
        value={filters.worker}
        onChange={(e) => update("worker", e.target.value)}
        className="border border-gray-200 rounded-card px-3 py-2 text-sm bg-white"
      >
        <option value="">All Workers</option>
        {workers.map((w) => (
          <option key={w.id} value={w.id}>{w.name}</option>
        ))}
      </select>
      <select
        value={filters.category}
        onChange={(e) => update("category", e.target.value)}
        className="border border-gray-200 rounded-card px-3 py-2 text-sm bg-white"
      >
        <option value="">All Categories</option>
        {Object.keys(CATEGORIES).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(e) => update("priority", e.target.value)}
        className="border border-gray-200 rounded-card px-3 py-2 text-sm bg-white"
      >
        <option value="">All Priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
