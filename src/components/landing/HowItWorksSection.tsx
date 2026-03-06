const steps = [
  {
    number: "01",
    title: "Tell us about your move",
    description:
      "Answer 10 quick questions about where you're going, when, and what matters most to you.",
  },
  {
    number: "02",
    title: "Get your personalized plan",
    description:
      "We generate a custom timeline, budget breakdown, and priority list based on your answers.",
  },
  {
    number: "03",
    title: "Track your progress",
    description:
      "Check off milestones, watch your readiness score climb, and receive smart reminders as you go.",
  },
];

/** Three-step explanation of the product flow. */
export function HowItWorksSection() {
  return (
    <section className="border-y bg-muted/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            From overwhelmed to organized in under 3 minutes.
          </p>
        </div>
        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {step.number}
              </div>
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
