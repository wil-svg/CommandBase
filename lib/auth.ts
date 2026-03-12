import { cookies } from "next/headers";
import { supabase } from "./supabase";

export interface Session {
  role: "admin" | "worker";
  workerId?: string;
}

export async function createSession(session: Session): Promise<string> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      role: session.role,
      worker_id: session.workerId || null,
    })
    .select("token")
    .single();

  if (error || !data) throw new Error("Failed to create session");
  return data.token;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const { data, error } = await supabase
    .from("sessions")
    .select("role, worker_id, expires_at")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) return null;

  return {
    role: data.role,
    workerId: data.worker_id || undefined,
  };
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
