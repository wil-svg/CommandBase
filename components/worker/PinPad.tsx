"use client";

import { useState } from "react";

interface PinPadProps {
  onSubmit: (pin: string) => void;
  loading?: boolean;
  error?: string;
}

export default function PinPad({ onSubmit, loading, error }: PinPadProps) {
  const [pin, setPin] = useState("");

  const handleKey = (key: string) => {
    if (key === "del") {
      setPin((p) => p.slice(0, -1));
    } else if (key === "go") {
      if (pin.length >= 4) onSubmit(pin);
    } else if (pin.length < 6) {
      setPin((p) => p + key);
    }
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "go"];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              i < pin.length
                ? "bg-purple-primary border-purple-primary"
                : "border-gray-300"
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-coral-primary bg-coral-light px-3 py-1.5 rounded-card">
          {error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            disabled={loading || (key === "go" && pin.length < 4)}
            className={`h-16 rounded-card text-xl font-medium transition-all active:scale-95 ${
              key === "del"
                ? "text-gray-500 bg-gray-100 hover:bg-gray-200"
                : key === "go"
                ? `text-white ${
                    pin.length >= 4
                      ? "bg-purple-primary hover:opacity-90"
                      : "bg-gray-300 cursor-not-allowed"
                  }`
                : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm"
            } disabled:opacity-50`}
          >
            {key === "del" ? "\u232B" : key === "go" ? "\u2192" : key}
          </button>
        ))}
      </div>
    </div>
  );
}
