"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        setError("Invalid PIN");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-card shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-1">
          Cochrane Realty
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">Admin Login</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-coral-primary bg-coral-light p-2 rounded-card text-center">
              {error}
            </p>
          )}
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter admin PIN"
            className="w-full border border-gray-200 rounded-card px-4 py-3 text-center font-mono tracking-widest text-lg"
            autoFocus
          />
          <Button type="submit" className="w-full" size="lg" disabled={loading || !pin}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
