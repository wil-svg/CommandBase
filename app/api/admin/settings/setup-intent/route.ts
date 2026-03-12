import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminSettings, upsertAdminSettings } from "@/lib/kv";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let settings = await getAdminSettings();

  // Create or retrieve Stripe customer
  let customerId = settings?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { source: "commandbase_admin" },
    });
    customerId = customer.id;
    settings = await upsertAdminSettings({ stripeCustomerId: customerId });
  }

  // Create SetupIntent for saving a card
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });

  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
