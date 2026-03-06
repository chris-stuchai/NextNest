import { z } from "zod";

/** Validates the complete intake form submission. */
export const intakeFormSchema = z.object({
  movingFrom: z
    .string()
    .min(2, "Please enter your current location")
    .max(200),
  movingTo: z
    .string()
    .min(2, "Please enter your destination")
    .max(200),
  targetMoveDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Please enter a valid date"),
  moveType: z.enum(["buy", "rent"]),
  needsToSell: z.boolean(),
  hasPreApproval: z.boolean(),
  employmentSecured: z.boolean(),
  timelineFlexibility: z.enum(["flexible", "somewhat", "fixed"]),
  peopleCount: z.number().int().min(1).max(20),
  topConcern: z.string().max(500).optional().default(""),
});

export type IntakeFormInput = z.infer<typeof intakeFormSchema>;

/** Validates a milestone completion toggle. */
export const milestoneUpdateSchema = z.object({
  isCompleted: z.boolean(),
});

/** Validates email input for magic link requests. */
export const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
