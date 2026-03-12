import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminSettings, upsertAdminSettings } from "@/lib/kv";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { paymentMethodId } = await req.json();
  if (!paymentMethodId) {
    return NextResponse.json({ error: "Missing payment method" }, { status: 400 });
  }

  const settings = await getAdminSettings();
  if (!settings?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
  }

  // Set as default payment method
  await stripe.customers.update(settings.stripeCustomerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  // Get card details for display
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  const card = pm.card;

  const updated = await upsertAdminSettings({
    cardLast4: card?.last4 || null,
    cardBrand: card?.brand || null,
  });

  return NextResponse.json(updated);
}
