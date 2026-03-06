import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/** Bottom call-to-action section reinforcing the primary action. */
export function CtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your NextNest is waiting
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Join thousands of families who turned moving day stress into moving day
          confidence. Start your personalized plan today — it only takes 3
          minutes.
        </p>
        <Button asChild size="lg" className="mt-8 gap-2 text-base px-8">
          <Link href="/intake">
            Build My Move Plan
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
