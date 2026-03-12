import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import { v4 as uuid } from "uuid";

export interface Session {
  role: "admin" | "worker";
  workerId?: string;
}

export async function createSession(session: Session): Promise<string> {
  const token = uuid();
  await kv.set(`session:${token}`, JSON.stringify(session), { ex: 60 * 60 * 24 * 7 });
  return token;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  const data = await kv.get<string>(`session:${token}`);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "admin";
}

export async function requireWorker(): Promise<Session | null> {
  const session = await getSession();
  if (!session || session.role !== "worker") return null;
  return session;
}

export function setSessionCookie(token: string) {
  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().delete("session");
}
