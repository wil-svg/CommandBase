import { NextRequest, NextResponse } from "next/server";
import { requireWorker } from "@/lib/auth";
import { getTask, updateTask, getWorker, createPayment, getAdminSettings } from "@/lib/kv";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireWorker();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const task = await getTask(params.id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (task.assignedTo !== session.workerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (task.status !== "in_progress") {
    return NextResponse.json({ error: "Task is not in progress" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const completedAt = new Date().toISOString();
  const sessionMinutes = task.startedAt
    ? (new Date(completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000 / 60
    : 0;
  const timeSpentMinutes = (task.timeSpentMinutes || 0) + sessionMinutes;

  const worker = await getWorker(session.workerId!);
  const hourlyRate = worker?.hourlyRate || 0;
  const cost = (timeSpentMinutes / 60) * hourlyRate;
  const roundedCost = Math.round(cost * 100) / 100;
  const roundedMinutes = Math.round(timeSpentMinutes * 100) / 100;

  const updated = await updateTask(params.id, {
    status: "completed",
    completedAt,
    timeSpentMinutes: roundedMinutes,
    cost: roundedCost,
    notes: body.notes || task.notes,
  });

  // Create a payment record for admin review
  let payment;
  try {
    payment = await createPayment({
      taskId: params.id,
      workerId: session.workerId!,
      amount: roundedCost,
      timeSpentMinutes: roundedMinutes,
      hourlyRate,
    });
  } catch {
    // Payment creation is non-blocking — task is still completed
  }

  // Send SMS notification to admin
  if (payment) {
    try {
      const adminSettings = await getAdminSettings();
      if (adminSettings?.phone) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cr-commandbase.com";

        if (accountSid && authToken && (messagingServiceSid || fromNumber)) {
          const twilio = (await import("twilio")).default;
          const client = twilio(accountSid, authToken);
          const h = Math.floor(roundedMinutes / 60);
          const m = Math.round(roundedMinutes % 60);
          const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

          await client.messages.create({
            body: `Task completed: "${task.title}" by ${worker?.name || "Worker"}. Time: ${timeStr}, Amount: $${roundedCost.toFixed(2)}. Review payment: ${appUrl}/admin/payments/${payment.id}`,
            ...(messagingServiceSid
              ? { messagingServiceSid }
              : { from: fromNumber }),
            to: adminSettings.phone,
          });
        }
      }
    } catch {
      // SMS notification is non-blocking
    }
  }

  return NextResponse.json(updated);
}
