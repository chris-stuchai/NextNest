"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type Phase = "house" | "shake" | "morph" | "launch" | "trail";

const PHASE_TIMINGS = {
  house: 2200,
  shake: 600,
  morph: 800,
  launch: 1200,
  trail: 1600,
};

/** Animated house-to-rocket transition — tells the NextNest brand story. */
export function HouseToRocket() {
  const [phase, setPhase] = useState<Phase>("house");

  useEffect(() => {
    const sequence: Phase[] = ["house", "shake", "morph", "launch", "trail"];
    let timeout: NodeJS.Timeout;
    let idx = 0;

    function next() {
      idx++;
      if (idx >= sequence.length) {
        timeout = setTimeout(() => {
          idx = 0;
          setPhase("house");
          timeout = setTimeout(next, PHASE_TIMINGS.house);
        }, PHASE_TIMINGS.trail);
        return;
      }
      setPhase(sequence[idx]);
      timeout = setTimeout(next, PHASE_TIMINGS[sequence[idx]]);
    }

    timeout = setTimeout(next, PHASE_TIMINGS.house);
    return () => clearTimeout(timeout);
  }, []);

  const isRocket = phase === "morph" || phase === "launch" || phase === "trail";
  const isLaunching = phase === "launch" || phase === "trail";
  const isGone = phase === "trail";

  return (
    <div className="relative h-[320px] w-[280px] mx-auto flex items-center justify-center overflow-hidden">
      {/* Ground line */}
      <motion.div
        className="absolute bottom-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"
        animate={{ opacity: isLaunching ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Launch particles */}
      <AnimatePresence>
        {(phase === "launch" || phase === "shake") && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: 3 + Math.random() * 4,
                  height: 3 + Math.random() * 4,
                  background: i % 3 === 0 ? "#f97316" : i % 3 === 1 ? "#fbbf24" : "#ef4444",
                }}
                initial={{
                  x: -6 + Math.random() * 12,
                  y: phase === "shake" ? 60 : 40,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: -40 + Math.random() * 80,
                  y: 100 + Math.random() * 60,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.6 + Math.random() * 0.4,
                  delay: Math.random() * 0.3,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 0.2,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Smoke cloud at launch */}
      <AnimatePresence>
        {phase === "launch" && (
          <motion.div
            className="absolute bottom-12"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 2.5, opacity: [0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <div className="h-16 w-32 rounded-full bg-muted-foreground/10 blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main icon container */}
      <motion.div
        className="relative z-10"
        animate={
          phase === "shake"
            ? { x: [0, -3, 3, -2, 2, -1, 1, 0], rotate: [0, -1, 1, -1, 1, 0] }
            : isLaunching
              ? { y: -400, scale: 0.6, opacity: isGone ? 0 : 1 }
              : { y: 0, scale: 1, opacity: 1 }
        }
        transition={
          phase === "shake"
            ? { duration: 0.5, ease: "easeInOut" }
            : isLaunching
              ? { duration: 1.0, ease: [0.4, 0, 0.2, 1] }
              : { duration: 0.6, ease: "easeOut" }
        }
      >
        {/* House SVG */}
        <motion.svg
          viewBox="0 0 120 120"
          className="h-32 w-32"
          animate={{ opacity: isRocket ? 0 : 1, scale: isRocket ? 0.8 : 1 }}
          transition={{ duration: 0.3 }}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Roof */}
          <motion.path
            d="M60 15 L105 55 L15 55 Z"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <motion.path
            d="M60 15 L105 55 L15 55 Z"
            fill="hsl(var(--primary) / 0.1)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
          />
          {/* Walls */}
          <motion.rect
            x="22"
            y="55"
            width="76"
            height="48"
            rx="2"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          />
          <motion.rect
            x="22"
            y="55"
            width="76"
            height="48"
            rx="2"
            fill="hsl(var(--primary) / 0.05)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1 }}
          />
          {/* Door */}
          <motion.rect
            x="48"
            y="72"
            width="24"
            height="31"
            rx="3"
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            style={{ transformOrigin: "60px 103px" }}
          />
          {/* Door handle */}
          <motion.circle
            cx="66"
            cy="89"
            r="2"
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.1 }}
          />
          {/* Windows */}
          <motion.rect
            x="30"
            y="63"
            width="14"
            height="12"
            rx="2"
            fill="hsl(var(--primary) / 0.12)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.0 }}
          />
          <motion.rect
            x="76"
            y="63"
            width="14"
            height="12"
            rx="2"
            fill="hsl(var(--primary) / 0.12)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.05 }}
          />
        </motion.svg>

        {/* Rocket SVG */}
        <motion.svg
          viewBox="0 0 120 140"
          className="h-32 w-32"
          animate={{ opacity: isRocket ? 1 : 0, scale: isRocket ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Rocket body */}
          <motion.path
            d="M60 8 C60 8 42 30 42 70 L42 95 L78 95 L78 70 C78 30 60 8 60 8Z"
            fill="hsl(var(--primary) / 0.1)"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Nose cone highlight */}
          <motion.path
            d="M60 14 C58 20 52 35 50 55"
            fill="none"
            stroke="hsl(var(--primary) / 0.3)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Window */}
          <motion.circle
            cx="60"
            cy="52"
            r="10"
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
          />
          <motion.circle
            cx="60"
            cy="52"
            r="6"
            fill="hsl(var(--primary) / 0.08)"
            stroke="hsl(var(--primary) / 0.4)"
            strokeWidth="1.5"
          />
          {/* Left fin */}
          <motion.path
            d="M42 80 L28 102 L42 95Z"
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Right fin */}
          <motion.path
            d="M78 80 L92 102 L78 95Z"
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Exhaust nozzle */}
          <motion.path
            d="M48 95 L52 105 L68 105 L72 95"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Flame */}
          <AnimatePresence>
            {(phase === "morph" || phase === "launch") && (
              <>
                <motion.path
                  d="M54 105 Q60 130 66 105"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0.6, 1, 0.6] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, opacity: { repeat: Infinity, duration: 0.15 } }}
                />
                <motion.path
                  d="M56 105 Q60 122 64 105"
                  fill="#fbbf24"
                  fillOpacity={0.6}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: [0.8, 1.2, 0.8] }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 0.12 }}
                  style={{ transformOrigin: "60px 105px" }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.svg>
      </motion.div>

      {/* Trail streaks during launch */}
      <AnimatePresence>
        {isLaunching && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`streak-${i}`}
                className="absolute w-0.5 rounded-full"
                style={{
                  height: 40 + i * 20,
                  left: `calc(50% + ${(i - 1) * 8}px)`,
                  background: `linear-gradient(to bottom, transparent, ${i === 1 ? "hsl(var(--primary) / 0.3)" : "hsl(var(--primary) / 0.15)"})`,
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, 60, 120], opacity: [0, 0.8, 0] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.2,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* "Finding your next nest..." text */}
      <AnimatePresence>
        {isGone && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 text-sm font-medium text-primary"
          >
            Finding your next nest...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
