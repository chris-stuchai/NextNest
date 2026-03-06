import type { MilestoneCategory } from "@/types";

interface MilestoneTemplate {
  title: string;
  description: string;
  category: MilestoneCategory;
  /** Months before move date when this should be targeted. Negative = after move. */
  monthsBeforeMove: number;
  /** Only applies if the user's intake matches this condition. */
  condition?: "buying" | "renting" | "selling" | "no-preapproval" | "no-employment";
}

/** Default milestone templates generated based on intake responses. */
export const milestoneTemplates: MilestoneTemplate[] = [
  // Housing — Buying
  {
    title: "Get mortgage pre-approval",
    description: "Shop rates from multiple lenders and secure pre-approval before house hunting.",
    category: "housing",
    monthsBeforeMove: 6,
    condition: "no-preapproval",
  },
  {
    title: "Start home search",
    description: "Connect with a real estate agent and begin touring homes in your target area.",
    category: "housing",
    monthsBeforeMove: 5,
    condition: "buying",
  },
  {
    title: "Make an offer",
    description: "Submit a competitive offer on your chosen property.",
    category: "housing",
    monthsBeforeMove: 4,
    condition: "buying",
  },
  {
    title: "Schedule home inspection",
    description: "Hire a certified inspector to evaluate the property condition.",
    category: "housing",
    monthsBeforeMove: 3,
    condition: "buying",
  },
  {
    title: "Close on new home",
    description: "Complete the closing process with your lender and title company.",
    category: "housing",
    monthsBeforeMove: 1,
    condition: "buying",
  },

  // Housing — Renting
  {
    title: "Research rental markets",
    description: "Explore neighborhoods, pricing, and availability in your destination city.",
    category: "housing",
    monthsBeforeMove: 3,
    condition: "renting",
  },
  {
    title: "Apply for rental",
    description: "Submit applications to your top choices. Have references and proof of income ready.",
    category: "housing",
    monthsBeforeMove: 2,
    condition: "renting",
  },
  {
    title: "Sign lease",
    description: "Review lease terms carefully and sign your new rental agreement.",
    category: "housing",
    monthsBeforeMove: 1,
    condition: "renting",
  },

  // Housing — Selling
  {
    title: "Prepare home for listing",
    description: "Declutter, stage, and make minor repairs to maximize sale value.",
    category: "housing",
    monthsBeforeMove: 5,
    condition: "selling",
  },
  {
    title: "List current home",
    description: "Work with your agent to list your home at a competitive price.",
    category: "housing",
    monthsBeforeMove: 4,
    condition: "selling",
  },

  // Finance
  {
    title: "Create relocation budget",
    description: "Estimate all moving costs and set aside a contingency buffer.",
    category: "finance",
    monthsBeforeMove: 6,
  },
  {
    title: "Review insurance needs",
    description: "Research homeowners/renters insurance and get quotes for your new location.",
    category: "finance",
    monthsBeforeMove: 2,
  },

  // Logistics — Universal
  {
    title: "Research moving companies",
    description: "Get at least 3 quotes from licensed movers. Book early for peak season.",
    category: "logistics",
    monthsBeforeMove: 3,
  },
  {
    title: "Book moving company",
    description: "Confirm your moving date, inventory, and pricing with your chosen mover.",
    category: "logistics",
    monthsBeforeMove: 2,
  },
  {
    title: "Begin packing non-essentials",
    description: "Start with seasonal items, decor, and anything you won't need before the move.",
    category: "logistics",
    monthsBeforeMove: 1,
  },
  {
    title: "Pack remaining belongings",
    description: "Pack room by room. Label every box with contents and destination room.",
    category: "logistics",
    monthsBeforeMove: 0,
  },

  // Admin — Universal
  {
    title: "Secure employment in new area",
    description: "Apply for jobs, arrange transfers, or set up remote work agreements.",
    category: "admin",
    monthsBeforeMove: 4,
    condition: "no-employment",
  },
  {
    title: "Forward mail with USPS",
    description: "Set up mail forwarding at least 2 weeks before your move date.",
    category: "admin",
    monthsBeforeMove: 1,
  },
  {
    title: "Transfer utilities",
    description: "Schedule disconnections at your current home and activations at your new one.",
    category: "admin",
    monthsBeforeMove: 1,
  },
  {
    title: "Update address everywhere",
    description: "Banks, subscriptions, employers, insurance, voter registration, and more.",
    category: "admin",
    monthsBeforeMove: 0,
  },
  {
    title: "Update DMV and registration",
    description: "Get your new state driver's license and vehicle registration within required timeframes.",
    category: "admin",
    monthsBeforeMove: -1,
  },
];
