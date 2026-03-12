"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PinPad from "@/components/worker/PinPad";

export default function WorkerLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (pin: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/worker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError("Invalid PIN");
        return;
      }
      router.push("/worker");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Cochrane Realty</h1>
      <p className="text-sm text-gray-500 mb-8">Enter your PIN to sign in</p>
      <PinPad onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
