"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { intakeQuestions } from "@/constants/intake-questions";
import { IntakeProgress } from "@/components/intake/IntakeProgress";
import { IntakeStepComponent } from "@/components/intake/IntakeStep";
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

/** Multi-step conversational intake flow for gathering relocation details. */
export default function IntakePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setCurrentStep((s) => s + 1);
    } else {
      await handleSubmit();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit intake");
      }

      const { data } = await response.json();
      router.push(`/intake/loading?planId=${data.planId}`);
    } catch (error) {
      console.error("Intake submission failed:", error);
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg text-muted-foreground">
            Preparing your plan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <IntakeProgress currentStep={currentStep} totalSteps={totalSteps} />
      <div className="mt-12">
        <IntakeStepComponent
          key={step.id}
          step={step}
          value={getCurrentValue()}
          onChange={handleChange}
          onNext={handleNext}
          onBack={handleBack}
          isFirst={currentStep === 0}
          isLast={currentStep === totalSteps - 1}
        />
      </div>
    </div>
  );
}
