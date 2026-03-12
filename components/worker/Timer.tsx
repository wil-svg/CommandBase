"use client";

import { useState, useEffect } from "react";
import { formatTimerDisplay } from "@/lib/utils";

interface TimerProps {
  startedAt: string;
  offsetMinutes?: number;
}

export default function Timer({ startedAt, offsetMinutes = 0 }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const offsetSeconds = Math.round(offsetMinutes * 60);
    const update = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000) + offsetSeconds);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startedAt, offsetMinutes]);

  return (
    <span className="font-mono text-3xl font-bold text-purple-primary tabular-nums">
      {formatTimerDisplay(elapsed)}
    </span>
  );
}
