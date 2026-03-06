import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  intakeResponses,
  relocationPlans,
  timelineMilestones,
  budgetItems,
  notificationLog,
  movingQuotes,
  leaseDocuments,
  moveOutPhotos,
  userBudgets,
  plaidConnections,
  moveExpenses,
  movePartners,
  userXp,
} from "@/lib/db/schema";

// ─── Database Row Types ──────────────────────────────────

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type IntakeResponse = InferSelectModel<typeof intakeResponses>;
export type NewIntakeResponse = InferInsertModel<typeof intakeResponses>;

export type RelocationPlan = InferSelectModel<typeof relocationPlans>;
export type NewRelocationPlan = InferInsertModel<typeof relocationPlans>;

export type TimelineMilestone = InferSelectModel<typeof timelineMilestones>;
export type NewTimelineMilestone = InferInsertModel<typeof timelineMilestones>;

export type BudgetItem = InferSelectModel<typeof budgetItems>;
export type NewBudgetItem = InferInsertModel<typeof budgetItems>;

export type NotificationLogEntry = InferSelectModel<typeof notificationLog>;

export type MovingQuote = InferSelectModel<typeof movingQuotes>;
export type NewMovingQuote = InferInsertModel<typeof movingQuotes>;

export type LeaseDocument = InferSelectModel<typeof leaseDocuments>;
export type MoveOutPhoto = InferSelectModel<typeof moveOutPhotos>;
export type UserBudget = InferSelectModel<typeof userBudgets>;
export type PlaidConnection = InferSelectModel<typeof plaidConnections>;
export type MoveExpense = InferSelectModel<typeof moveExpenses>;
export type MovePartner = InferSelectModel<typeof movePartners>;
export type UserXp = InferSelectModel<typeof userXp>;

// ─── Enum Types ──────────────────────────────────────────

export type MoveType = "buy" | "rent";
export type TimelineFlexibility = "flexible" | "somewhat" | "fixed";
export type MilestoneCategory = "housing" | "finance" | "logistics" | "admin";
export type UserRole = "user" | "admin";

// ─── API Response Types ──────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

// ─── Dashboard Types ─────────────────────────────────────

export interface DashboardData {
  plan: RelocationPlan;
  milestones: TimelineMilestone[];
  budgetItems: BudgetItem[];
  intake: IntakeResponse;
  daysUntilMove: number;
}

// ─── Intake Step Types ───────────────────────────────────

export interface IntakeStep {
  id: string;
  question: string;
  subtitle?: string;
  type: "text" | "select" | "date" | "number";
  field: keyof IntakeFormData;
  options?: { value: string; label: string }[];
  encouragement?: string;
}

export interface IntakeFormData {
  movingFrom: string;
  movingTo: string;
  targetMoveDate: string;
  moveType: MoveType;
  needsToSell: boolean;
  hasPreApproval: boolean;
  employmentSecured: boolean;
  timelineFlexibility: TimelineFlexibility;
  peopleCount: number;
  topConcern: string;
}
