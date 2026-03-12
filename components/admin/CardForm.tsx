"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Button from "@/components/shared/Button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CardFormInnerProps {
  clientSecret: string;
  onSaved: (last4: string, brand: string) => void;
  onCancel: () => void;
}

function CardFormInner({ clientSecret, onSaved, onCancel }: CardFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSaving(true);
    setError("");

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { setupIntent, error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (stripeError) {
      setError(stripeError.message || "Failed to save card");
      setSaving(false);
      return;
    }

    // Save the payment method to our backend
    const res = await fetch("/api/admin/settings/save-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId: setupIntent?.payment_method }),
    });

    if (res.ok) {
      const data = await res.json();
      onSaved(data.cardLast4, data.cardBrand);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save card");
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      {error && (
        <p className="text-sm text-coral-primary bg-coral-light p-2 rounded-card">{error}</p>
      )}
      <div className="border border-gray-200 rounded-card p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#1f2937",
                "::placeholder": { color: "#9ca3af" },
              },
            },
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving || !stripe}>
          {saving ? "Saving..." : "Save Card"}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface CardFormProps {
  onSaved: (last4: string, brand: string) => void;
  onCancel: () => void;
}

export default function CardForm({ onSaved, onCancel }: CardFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/setup-intent", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError(data.error || "Failed to initialize card form. Make sure Stripe is configured.");
        }
      })
      .catch(() => setError("Failed to connect to payment service"));
  }, []);

  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-coral-primary bg-coral-light p-2 rounded-card">{error}</p>
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    );
  }

  if (!clientSecret) {
    return <p className="text-sm text-gray-400">Loading payment form...</p>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardFormInner clientSecret={clientSecret} onSaved={onSaved} onCancel={onCancel} />
    </Elements>
  );
}
