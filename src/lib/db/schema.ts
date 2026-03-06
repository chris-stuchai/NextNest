import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  date,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── Enums ───────────────────────────────────────────────

export const moveTypeEnum = pgEnum("move_type", ["buy", "rent"]);

export const timelineFlexibilityEnum = pgEnum("timeline_flexibility", [
  "flexible",
  "somewhat",
  "fixed",
]);

export const milestoneCategoryEnum = pgEnum("milestone_category", [
  "housing",
  "finance",
  "logistics",
  "admin",
]);

// ─── Auth.js Required Tables ─────────────────────────────
// Column names must match the Auth.js Drizzle adapter expectations

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  hashedPassword: text("hashed_password"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

// ─── Application Tables ──────────────────────────────────

export const intakeResponses = pgTable("intake_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  movingFrom: text("moving_from").notNull(),
  movingTo: text("moving_to").notNull(),
  targetMoveDate: date("target_move_date", { mode: "string" }).notNull(),
  moveType: moveTypeEnum("move_type").notNull(),
  needsToSell: boolean("needs_to_sell").default(false).notNull(),
  hasPreApproval: boolean("has_pre_approval").default(false).notNull(),
  employmentSecured: boolean("employment_secured").default(false).notNull(),
  timelineFlexibility: timelineFlexibilityEnum("timeline_flexibility")
    .default("somewhat")
    .notNull(),
  peopleCount: integer("people_count").default(1).notNull(),
  topConcern: text("top_concern"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const relocationPlans = pgTable("relocation_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  targetDate: date("target_date", { mode: "string" }).notNull(),
  readinessScore: integer("readiness_score").default(0).notNull(),
  planConfig: jsonb("plan_config"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const timelineMilestones = pgTable("timeline_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .references(() => relocationPlans.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: date("target_date", { mode: "string" }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  category: milestoneCategoryEnum("category").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const budgetItems = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .references(() => relocationPlans.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category").notNull(),
  label: text("label").notNull(),
  estimatedLow: integer("estimated_low").notNull(),
  estimatedHigh: integer("estimated_high").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const movingQuoteStatusEnum = pgEnum("moving_quote_status", [
  "pending",
  "calling",
  "connected",
  "completed",
  "failed",
]);

export const movingQuotes = pgTable("moving_quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  planId: uuid("plan_id")
    .references(() => relocationPlans.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  companyName: text("company_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  callId: text("call_id"),
  status: movingQuoteStatusEnum("status").default("pending").notNull(),
  transcript: text("transcript"),
  quoteLow: integer("quote_low"),
  quoteHigh: integer("quote_high"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const notificationLog = pgTable("notification_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  sentAt: timestamp("sent_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
