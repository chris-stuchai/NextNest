"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { intakeQuestions } from "@/constants/intake-questions";
import { IntakeProgress } from "@/components/intake/IntakeProgress";
import { IntakeStepComponent } from "@/components/intake/IntakeStep";
import { motion, AnimatePresence } from "framer-motion";
import type { IntakeFormData } from "@/types";

const initialData: IntakeFormData = {
  movingFrom: "",
  movingTo: "",
  targetMoveDate: "",
  moveType: "rent",
  needsToSell: false,
  hasPreApproval: false,
  employmentSecured: false,
  timelineFlexibility: "somewhat",
  peopleCount: 1,
  topConcern: "",
};

/** Multi-step conversational intake flow with slide transitions. */
export default function IntakePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");

  const step = intakeQuestions[currentStep];
  const totalSteps = intakeQuestions.length;

  function getCurrentValue(): string | number | boolean {
    const raw = formData[step.field];
    if (typeof raw === "boolean") return String(raw);
    return raw;
  }

  function handleChange(value: string | number | boolean) {
    setFormData((prev) => {
      const field = step.field;
      let parsed: string | number | boolean = value;

      if (field === "needsToSell" || field === "hasPreApproval" || field === "employmentSecured") {
        parsed = value === "true" || value === true;
      }
      if (field === "peopleCount" && typeof value === "string") {
        parsed = parseInt(value) || 1;
      }

      return { ...prev, [field]: parsed };
    });
  }

  async function handleNext() {
    if (currentStep < totalSteps - 1) {
      setSlideDirection("forward");
      setCurrentStep((s) => s + 1);
    } else {
      await handleSubmit();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setSlideDirection("backward");
      setCurrentStep((s) => s - 1);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to submit intake");
      }

      router.push(`/intake/loading?planId=${result.data.planId}`);
    } catch (err) {
      console.error("Intake submission failed:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 animate-orbit rounded-full border-2 border-primary/20 border-t-primary" />
            <div className="absolute inset-2 animate-orbit-reverse rounded-full border-2 border-primary/10 border-b-primary/60" />
            <div className="absolute inset-4 animate-orbit rounded-full border-2 border-primary/5 border-t-primary/40" style={{ animationDuration: "2s" }} />
          </div>
          <p className="text-lg font-medium text-muted-foreground">
            Preparing your plan...
          </p>
        </motion.div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "forward" | "backward") => ({
      x: direction === "forward" ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <IntakeProgress currentStep={currentStep} totalSteps={totalSteps} />
      </motion.div>

      <div className="mt-12 overflow-hidden">
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={step.id}
            custom={slideDirection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <IntakeStepComponent
              step={step}
              value={getCurrentValue()}
              onChange={handleChange}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={currentStep === 0}
              isLast={currentStep === totalSteps - 1}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
