import { Progress } from "@/components/ui/progress";

interface IntakeProgressProps {
  currentStep: number;
  totalSteps: number;
}

/** Visual progress indicator showing completion percentage during intake. */
export function IntakeProgress({ currentStep, totalSteps }: IntakeProgressProps) {
  const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span>{percentage}% complete</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
