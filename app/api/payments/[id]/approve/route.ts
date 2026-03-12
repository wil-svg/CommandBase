import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getPayment, updatePayment, getWorker, updateWorker, getAdminSettings } from "@/lib/kv";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payment = await getPayment(params.id);
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payment.status !== "pending_review") {
    return NextResponse.json({ error: "Payment already reviewed" }, { status: 400 });
  }

  const settings = await getAdminSettings();
  if (!settings?.stripeCustomerId) {
    return NextResponse.json({ error: "No payment method on file. Add a card in Settings." }, { status: 400 });
  }

  // Charge the admin's card
  try {
    const customer = await stripe.customers.retrieve(settings.stripeCustomerId) as { invoice_settings?: { default_payment_method?: string } };
    const defaultPm = customer.invoice_settings?.default_payment_method;
    if (!defaultPm) {
      return NextResponse.json({ error: "No default payment method. Add a card in Settings." }, { status: 400 });
    }

    const amountCents = Math.round(payment.amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: settings.stripeCustomerId,
      payment_method: defaultPm as string,
      off_session: true,
      confirm: true,
      metadata: {
        payment_id: payment.id,
        worker_id: payment.workerId,
        task_id: payment.taskId,
      },
    });

    // Update payment record
    await updatePayment(params.id, {
      status: "processed",
      stripePaymentIntentId: paymentIntent.id,
      reviewedAt: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    });

    // Credit worker's balance
    const worker = await getWorker(payment.workerId);
    if (worker) {
      await updateWorker(payment.workerId, {
        balance: Math.round((worker.balance + payment.amount) * 100) / 100,
      });
    }

    return NextResponse.json({ success: true, status: "processed" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment failed";
    await updatePayment(params.id, {
      status: "failed",
      reviewedAt: new Date().toISOString(),
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
