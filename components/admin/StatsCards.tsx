"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-card p-3 sm:p-4 shadow-sm border border-gray-100">
      <p className="text-xs sm:text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-semibold font-mono text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

interface StatsCardsProps {
  stats: { label: string; value: string | number; sub?: string }[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
}
