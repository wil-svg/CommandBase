import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminSettings, upsertAdminSettings } from "@/lib/kv";

export async function GET() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await getAdminSettings();
  return NextResponse.json(settings || {
    name: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", zip: "", cardLast4: null, cardBrand: null,
  });
}

export async function PUT(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const settings = await upsertAdminSettings({
    name: body.name,
    phone: body.phone,
    addressLine1: body.addressLine1,
    addressLine2: body.addressLine2,
    city: body.city,
    state: body.state,
    zip: body.zip,
  });

  return NextResponse.json(settings);
}
