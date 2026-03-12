"use client";

import { useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";
import { formatCost, formatTime, formatDateTime } from "@/lib/utils";
import type { Payment } from "@/lib/kv";

interface BalanceData {
  balance: number;
  bankAccountLast4: string | null;
  bankRoutingLast4: string | null;
  payments: Payment[];
}

export default function WorkerEarningsPage() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({ accountNumber: "", routingNumber: "" });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    fetch("/api/worker/balance")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/worker/login";
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setData(d);
        setLoading(false);
      });
  }, []);

  const handleSaveBank = async () => {
    if (!bankForm.accountNumber || !bankForm.routingNumber) return;
    setSavingBank(true);

    const accountLast4 = bankForm.accountNumber.slice(-4);
    const routingLast4 = bankForm.routingNumber.slice(-4);

    const res = await fetch("/api/worker/bank-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountLast4, routingLast4 }),
    });

    if (res.ok) {
      const updated = await res.json();
      setData((prev) => prev ? { ...prev, ...updated } : prev);
      setShowBankForm(false);
      setBankForm({ accountNumber: "", routingNumber: "" });
    }
    setSavingBank(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-gray-400">Unable to load earnings.</div>;

  const statusColor: Record<string, { bg: string; text: string; label: string }> = {
    pending_review: { bg: "bg-amber-light", text: "text-amber-primary", label: "Pending" },
    approved: { bg: "bg-blue-50", text: "text-blue-600", label: "Approved" },
    processed: { bg: "bg-teal-light", text: "text-teal-primary", label: "Paid" },
    denied: { bg: "bg-coral-light", text: "text-coral-primary", label: "Denied" },
    failed: { bg: "bg-coral-light", text: "text-coral-primary", label: "Failed" },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-xs text-gray-500 mb-1">Available Balance</p>
        <p className="text-3xl font-mono font-bold text-purple-primary">
          {formatCost(data.balance)}
        </p>
      </div>

      <div className="bg-white rounded-card p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Bank Account</h3>
        {data.bankAccountLast4 ? (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-mono">****{data.bankAccountLast4}</span>
              <span className="text-gray-400 mx-2">/</span>
              <span className="font-mono">****{data.bankRoutingLast4}</span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setShowBankForm(true)}>
              Update
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              Add your bank account to transfer your earnings.
            </p>
            <Button size="sm" onClick={() => setShowBankForm(true)}>
              Add Bank Account
            </Button>
          </div>
        )}

        {showBankForm && (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Routing Number</label>
              <input
                type="text"
                value={bankForm.routingNumber}
                onChange={(e) => setBankForm((f) => ({ ...f, routingNumber: e.target.value }))}
                className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm font-mono"
                placeholder="9 digits"
                maxLength={9}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Account Number</label>
              <input
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))}
                className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm font-mono"
                placeholder="Account number"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveBank} disabled={savingBank}>
                {savingBank ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setShowBankForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Payment History</h3>
        {data.payments.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white rounded-card p-4">No payments yet.</p>
        ) : (
          <div className="bg-white rounded-card border border-gray-100 divide-y divide-gray-50">
            {data.payments.map((p) => {
              const s = statusColor[p.status] || statusColor.pending_review;
              return (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono font-medium text-gray-900">
                      {formatCost(p.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(p.timeSpentMinutes)} at ${p.hourlyRate.toFixed(2)}/hr
                    </p>
                    <p className="text-xs text-gray-400">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <Badge className={`${s.bg} ${s.text}`}>{s.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
