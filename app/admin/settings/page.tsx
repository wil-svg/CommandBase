"use client";

import { useEffect, useState } from "react";
import Button from "@/components/shared/Button";
import CardForm from "@/components/admin/CardForm";

interface Settings {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
  cardLast4: string | null;
  cardBrand: string | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    name: "", phone: "", addressLine1: "", addressLine2: "",
    city: "", state: "", zip: "", cardLast4: null, cardBrand: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: settings.name,
        phone: settings.phone,
        addressLine1: settings.addressLine1,
        addressLine2: settings.addressLine2,
        city: settings.city,
        state: settings.state,
        zip: settings.zip,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSettings((prev) => ({ ...prev, ...updated }));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleCardSaved = (cardLast4: string, cardBrand: string) => {
    setSettings((prev) => ({ ...prev, cardLast4, cardBrand }));
    setShowCardForm(false);
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Admin Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              value={settings.name}
              onChange={update("name")}
              className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            <input
              value={settings.phone}
              onChange={update("phone")}
              className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <h3 className="text-sm font-medium text-gray-700 pt-2">Address</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Address Line 1</label>
            <input
              value={settings.addressLine1}
              onChange={update("addressLine1")}
              className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Address Line 2</label>
            <input
              value={settings.addressLine2}
              onChange={update("addressLine2")}
              className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
              placeholder="Apt, suite, etc."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">City</label>
              <input
                value={settings.city}
                onChange={update("city")}
                className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <input
                value={settings.state}
                onChange={update("state")}
                className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
                placeholder="OR"
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">ZIP</label>
              <input
                value={settings.zip}
                onChange={update("zip")}
                className="w-full border border-gray-200 rounded-card px-3 py-2 text-sm"
                placeholder="97501"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
          {saved && <span className="text-sm text-teal-primary">Saved!</span>}
        </div>
      </div>

      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Payment Method</h3>
        <p className="text-xs text-gray-500">
          Add a credit or debit card to pay workers when you approve completed tasks.
        </p>

        {settings.cardLast4 ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-7 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600 uppercase">
                {settings.cardBrand || "Card"}
              </div>
              <span className="text-sm font-mono text-gray-700">
                **** **** **** {settings.cardLast4}
              </span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setShowCardForm(true)}>
              Update Card
            </Button>
          </div>
        ) : (
          <Button onClick={() => setShowCardForm(true)}>Add Card</Button>
        )}

        {showCardForm && (
          <CardForm
            onSaved={handleCardSaved}
            onCancel={() => setShowCardForm(false)}
          />
        )}
      </div>
    </div>
  );
}
