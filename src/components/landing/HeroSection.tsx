"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const floatingCards = [
  { icon: MapPin, label: "San Francisco → Austin", color: "bg-blue-50 text-blue-600", delay: 0 },
  { icon: Calendar, label: "142 days until move", color: "bg-emerald-50 text-emerald-600", delay: 1.5 },
  { icon: TrendingUp, label: "Readiness: 73%", color: "bg-amber-50 text-amber-600", delay: 3 },
];

/** Full-width hero with animated gradient, staggered text, and floating UI cards. */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-accent/8" />
        <div className="animate-float-slow absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="animate-float-delayed absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-accent/8 blur-3xl" />
        <div className="animate-float absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Your relocation, simplified
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]"
            >
              Move with confidence,{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  not chaos.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0 mx-auto"
            >
              Answer a few quick questions and get a personalized relocation
              plan — timeline, budget, milestones — all in under 3 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center"
            >
              <Button
                asChild
                size="lg"
                className="group gap-2 rounded-full px-8 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                <Link href="/intake">
                  Build My Move Plan
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Free &middot; No account needed to start
              </p>
            </motion.div>
          </div>

          {/* Right: Floating dashboard preview cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative mx-auto w-full max-w-md">
              {/* Main card */}
              <div className="glass rounded-2xl p-6 shadow-xl shadow-black/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">N</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">My Relocation Plan</p>
                    <p className="text-xs text-muted-foreground">San Francisco → Austin, TX</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Move readiness</span>
                    <span className="font-semibold text-primary">73%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      initial={{ width: "0%" }}
                      animate={{ width: "73%" }}
                      transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Mini milestones */}
                <div className="space-y-3">
                  {["Research neighborhoods", "Get pre-approved", "Book moving company"].map((item, i) => (
                    <div key={item} className="flex items-center gap-3 text-sm">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 + i * 0.15 }}
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                          i === 0
                            ? "bg-primary text-primary-foreground"
                            : "border-2 border-muted-foreground/20"
                        }`}
                      >
                        {i === 0 && "✓"}
                      </motion.div>
                      <span className={i === 0 ? "line-through text-muted-foreground" : ""}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating notification cards */}
              {floatingCards.map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.2, duration: 0.5 }}
                  className={`absolute glass rounded-xl px-4 py-3 shadow-lg shadow-black/5 ${
                    i === 0
                      ? "-top-4 -left-8"
                      : i === 1
                        ? "top-1/3 -right-10"
                        : "-bottom-4 -left-4"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-lg p-1.5 ${card.color}`}>
                      <card.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">{card.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
