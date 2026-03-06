interface BudgetTemplate {
  category: string;
  label: string;
  estimatedLow: number;
  estimatedHigh: number;
  notes: string;
  /** Only applies when the user's move type matches. */
  condition?: "buying" | "renting" | "selling";
}

/** Default budget estimate templates for relocation costs. */
export const budgetTemplates: BudgetTemplate[] = [
  {
    category: "Moving",
    label: "Moving company",
    estimatedLow: 1500,
    estimatedHigh: 5000,
    notes: "Local: $1,500–$2,500. Long-distance: $3,000–$5,000+.",
  },
  {
    category: "Moving",
    label: "Packing supplies",
    estimatedLow: 100,
    estimatedHigh: 400,
    notes: "Boxes, tape, bubble wrap, and specialty containers.",
  },
  {
    category: "Travel",
    label: "Travel to new location",
    estimatedLow: 200,
    estimatedHigh: 1500,
    notes: "Gas, flights, hotels, and meals during the move.",
  },
  {
    category: "Housing",
    label: "Temporary housing",
    estimatedLow: 500,
    estimatedHigh: 3000,
    notes: "If there's a gap between move-out and move-in dates.",
  },
  {
    category: "Housing",
    label: "Security deposit",
    estimatedLow: 1000,
    estimatedHigh: 3000,
    notes: "Typically 1–2 months rent.",
    condition: "renting",
  },
  {
    category: "Housing",
    label: "Estimated closing costs",
    estimatedLow: 8000,
    estimatedHigh: 25000,
    notes: "Typically 2–5% of the home purchase price.",
    condition: "buying",
  },
  {
    category: "Housing",
    label: "Down payment",
    estimatedLow: 15000,
    estimatedHigh: 80000,
    notes: "Varies widely: 3.5%–20% of purchase price.",
    condition: "buying",
  },
  {
    category: "Utilities",
    label: "Utility setup fees",
    estimatedLow: 100,
    estimatedHigh: 500,
    notes: "Electric, gas, water, internet connection and deposits.",
  },
  {
    category: "Admin",
    label: "DMV and registration",
    estimatedLow: 50,
    estimatedHigh: 300,
    notes: "Driver's license transfer, vehicle registration, and title fees.",
  },
  {
    category: "Contingency",
    label: "Emergency buffer",
    estimatedLow: 1000,
    estimatedHigh: 3000,
    notes: "Unexpected costs — storage, repairs, or timeline changes.",
  },
];
