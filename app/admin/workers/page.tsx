"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import WorkerCard from "@/components/admin/WorkerCard";
import CreateWorkerModal from "@/components/admin/CreateWorkerModal";

interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  hourlyRate: number;
  status: string;
}

interface WorkerStats {
  tasksCompletedMonth: number;
  hoursMonth: number;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState<Record<string, WorkerStats>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = () => {
    fetch("/api/workers?include=all")
      .then((r) => r.json())
      .then(async (data: Worker[]) => {
        if (!Array.isArray(data)) return;
        setWorkers(data);
        setLoading(false);
        const statsMap: Record<string, WorkerStats> = {};
        await Promise.all(
          data.map(async (w) => {
            const s = await fetch(`/api/workers/${w.id}/stats`).then((r) => r.json());
            statsMap[w.id] = s;
          })
        );
        setStats(statsMap);
      });
  };

  useEffect(() => { load(); }, []);

  const activeWorkers = workers.filter((w) => w.status !== "archived");
  const archivedWorkers = workers.filter((w) => w.status === "archived");

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Workers</h2>
        <Button onClick={() => setShowCreate(true)}>Add Worker</Button>
      </div>

      {activeWorkers.length === 0 ? (
        <p className="text-sm text-gray-400 bg-white rounded-card p-6 text-center">
          No workers yet. Add your first contractor.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeWorkers.map((w) => (
            <WorkerCard
              key={w.id}
              worker={w}
              stats={stats[w.id]}
              onClick={() => router.push(`/admin/workers/${w.id}`)}
              onStatusChange={load}
            />
          ))}
        </div>
      )}

      {archivedWorkers.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            {showArchived ? "Hide" : "Show"} Archived Workers ({archivedWorkers.length})
          </button>
          {showArchived && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-3">
              {archivedWorkers.map((w) => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  stats={stats[w.id]}
                  onClick={() => router.push(`/admin/workers/${w.id}`)}
                  onStatusChange={load}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CreateWorkerModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={load}
      />
    </div>
  );
}
