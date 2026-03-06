import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/** Full-width hero with headline, subtitle, and primary CTA. */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          Your relocation, simplified
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Move with confidence,
          <br />
          <span className="text-primary">not chaos.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Answer a few quick questions and get a personalized relocation plan
          complete with timeline, budget guidance, and milestone tracking — all
          in under 3 minutes.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2 text-base px-8">
            <Link href="/intake">
              Build My Move Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Free to use &middot; No account required to start
          </p>
        </div>
      </div>
    </section>
  );
}
