export const CATEGORIES: Record<string, string[]> = {
  Online: ["Website", "Online ads", "Social presence", "SEO"],
  Print: [
    "Listing signs",
    "Marketing signs",
    "Sponsors",
    "Local paper",
    "Mailers",
    "Door hangers",
  ],
  "Current Business": ["Listing marketing", "Rentals"],
  Sphere: ["Friends & family", "Referrals", "Repeat customers", "Events"],
  "Cold Outreach": ["Email campaigns", "Cold calls"],
};

export const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Online: { bg: "bg-blue-light", text: "text-blue-primary", dot: "bg-blue-primary" },
  Print: { bg: "bg-teal-light", text: "text-teal-primary", dot: "bg-teal-primary" },
  "Current Business": { bg: "bg-coral-light", text: "text-coral-primary", dot: "bg-coral-primary" },
  Sphere: { bg: "bg-pink-light", text: "text-pink-primary", dot: "bg-pink-primary" },
  "Cold Outreach": { bg: "bg-amber-light", text: "text-amber-primary", dot: "bg-amber-primary" },
};

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  low: { bg: "bg-gray-100", text: "text-gray-600" },
  medium: { bg: "bg-blue-light", text: "text-blue-primary" },
  high: { bg: "bg-amber-light", text: "text-amber-primary" },
  urgent: { bg: "bg-coral-light", text: "text-coral-primary" },
};

export const STATUSES = ["pending", "in_progress", "completed", "cancelled"] as const;
export type TaskStatus = (typeof STATUSES)[number];
