import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const adminPin = process.env.ADMIN_PIN;

  if (!adminPin || pin !== adminPin) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const token = await createSession({ role: "admin" });
  const res = NextResponse.json({ success: true });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
