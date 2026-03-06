import { HeroSection } from "@/components/landing/HeroSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { CtaSection } from "@/components/landing/CtaSection";

/** Landing page — introduces NextNest and drives users into the intake flow. */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
