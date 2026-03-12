import { NextRequest, NextResponse } from "next/server";
import { findWorkerByPin } from "@/lib/kv";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  const worker = await findWorkerByPin(pin);
  if (!worker) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const token = await createSession({ role: "worker", workerId: worker.id });
  const res = NextResponse.json({
    success: true,
    worker: { id: worker.id, name: worker.name },
  });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
