import {
  Calendar,
  Target,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const benefits = [
  {
    icon: Calendar,
    title: "Personalized Timeline",
    description:
      "A step-by-step relocation plan tailored to your move date, housing type, and unique circumstances.",
  },
  {
    icon: Target,
    title: "Readiness Score",
    description:
      "Track how prepared you are with a real-time score that updates as you complete milestones.",
  },
  {
    icon: DollarSign,
    title: "Budget Guidance",
    description:
      "Estimated cost breakdowns for every category — from moving companies to utility setup.",
  },
  {
    icon: CheckCircle2,
    title: "Milestone Tracking",
    description:
      "Check off tasks as you go. Never miss a critical deadline like utility transfers or address changes.",
  },
  {
    icon: Clock,
    title: "Smart Reminders",
    description:
      "Automated nudges that get more frequent as your move date approaches, keeping you on track.",
  },
  {
    icon: TrendingUp,
    title: "Monthly Priorities",
    description:
      "Know exactly what to focus on each month so nothing falls through the cracks.",
  },
];

/** Grid of product benefits with icons and descriptions. */
export function BenefitsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to move stress-free
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            NextNest transforms the chaos of relocation into a calm, organized
            journey you actually feel good about.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="border-0 bg-muted/40 transition-colors hover:bg-muted/60"
            >
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
