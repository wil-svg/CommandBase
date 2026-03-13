import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getWorker, updateWorker } from "@/lib/kv";
import twilio from "twilio";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const worker = await getWorker(params.id);
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  if (!worker.phone) return NextResponse.json({ error: "Worker has no phone number" }, { status: 400 });

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
    return NextResponse.json({ error: "SMS service not configured" }, { status: 500 });
  }

  const client = twilio(accountSid, authToken);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cr-commandbase.com";

  try {
    await client.messages.create({
      body: `You've been invited to CommandBase Task Manager. Tap to install the app and get started: ${appUrl}/install Reply STOP to opt out.`,
      ...(messagingServiceSid
        ? { messagingServiceSid }
        : { from: fromNumber }),
      to: worker.phone,
    });

    // Move status from invited to pending (they've been notified)
    if (worker.status === "invited") {
      await updateWorker(params.id, { status: "pending" });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send SMS";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
