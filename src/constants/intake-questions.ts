import type { IntakeStep } from "@/types";

/** Ordered list of intake questions shown during the onboarding flow. */
export const intakeQuestions: IntakeStep[] = [
  {
    id: "moving-from",
    question: "Where are you moving from?",
    subtitle: "Enter your current city and state.",
    type: "text",
    field: "movingFrom",
    encouragement: "Great start! Let's map out your journey.",
  },
  {
    id: "moving-to",
    question: "Where are you planning to move?",
    subtitle: "Enter your destination city and state.",
    type: "text",
    field: "movingTo",
    encouragement: "Exciting destination! Let's keep going.",
  },
  {
    id: "target-date",
    question: "When would you like to be in your new home?",
    subtitle: "Pick your ideal move-in date.",
    type: "date",
    field: "targetMoveDate",
    encouragement: "Having a date makes everything more real.",
  },
  {
    id: "move-type",
    question: "Are you planning to buy or rent?",
    subtitle: "This helps us tailor your timeline.",
    type: "select",
    field: "moveType",
    options: [
      { value: "buy", label: "Buy a home" },
      { value: "rent", label: "Rent a place" },
    ],
    encouragement: "Perfect — we'll customize your plan around this.",
  },
  {
    id: "needs-to-sell",
    question: "Do you need to sell your current home?",
    subtitle: "Selling adds important milestones to your timeline.",
    type: "select",
    field: "needsToSell",
    options: [
      { value: "true", label: "Yes, I need to sell" },
      { value: "false", label: "No, I don't need to sell" },
    ],
  },
  {
    id: "pre-approval",
    question: "Do you have a mortgage pre-approval?",
    subtitle: "If you're buying, this affects your timeline significantly.",
    type: "select",
    field: "hasPreApproval",
    options: [
      { value: "true", label: "Yes, I'm pre-approved" },
      { value: "false", label: "Not yet" },
    ],
    encouragement: "Noted! We'll factor this into your plan.",
  },
  {
    id: "employment",
    question: "Is employment already secured for your move?",
    subtitle: "This helps us understand your readiness.",
    type: "select",
    field: "employmentSecured",
    options: [
      { value: "true", label: "Yes, it's secured" },
      { value: "false", label: "Still working on it" },
    ],
  },
  {
    id: "flexibility",
    question: "How flexible is your timeline?",
    subtitle: "This helps us prioritize your milestones.",
    type: "select",
    field: "timelineFlexibility",
    options: [
      { value: "flexible", label: "Very flexible" },
      { value: "somewhat", label: "Somewhat flexible" },
      { value: "fixed", label: "Fixed date — can't change" },
    ],
    encouragement: "Almost there! Just a couple more questions.",
  },
  {
    id: "people-count",
    question: "How many people are moving?",
    subtitle: "Including yourself.",
    type: "number",
    field: "peopleCount",
  },
  {
    id: "top-concern",
    question: "What concerns you most about your move?",
    subtitle: "Optional — this helps us personalize your experience.",
    type: "text",
    field: "topConcern",
    encouragement: "You're done! Let's build your plan.",
  },
];
