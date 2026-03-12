import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createWorker, getAllWorkers } from "@/lib/kv";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const includeAll = req.nextUrl.searchParams.get("include") === "all";
  const workers = await getAllWorkers();
  const filtered = includeAll ? workers : workers.filter((w) => w.status !== "archived");
  const safe = filtered.map(({ pin, ...rest }) => rest);
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, phone, hourlyRate, pin } = body;

  if (!name || !pin || !hourlyRate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const hashedPin = await bcrypt.hash(pin, 10);
  const worker = await createWorker({
    name,
    email: email || "",
    phone: phone || "",
    pin: hashedPin,
    hourlyRate: Number(hourlyRate),
    status: "invited",
    balance: 0,
    bankAccountLast4: null,
    bankRoutingLast4: null,
    stripeConnectAccountId: null,
  });

  const { pin: _, ...safe } = worker;
  return NextResponse.json(safe, { status: 201 });
}
