import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getWorker, updateWorker } from "@/lib/kv";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const worker = await getWorker(params.id);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { pin, ...safe } = worker;
  return NextResponse.json(safe);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updateData: Record<string, unknown> = {};

  if (body.name !== undefined) updateData.name = body.name;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.hourlyRate !== undefined) updateData.hourlyRate = Number(body.hourlyRate);
  if (body.status !== undefined) updateData.status = body.status;
  if (body.pin) updateData.pin = await bcrypt.hash(body.pin, 10);

  const worker = await updateWorker(params.id, updateData);
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { pin, ...safe } = worker;
  return NextResponse.json(safe);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const worker = await updateWorker(params.id, { status: "inactive" });
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
