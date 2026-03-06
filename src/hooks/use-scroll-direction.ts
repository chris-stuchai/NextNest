"use client";

import { useState, useEffect, useCallback } from "react";

interface ScrollState {
  direction: "up" | "down" | null;
  scrollY: number;
  isAtTop: boolean;
}

/**
 * Tracks scroll direction and position for scroll-aware UI elements
 * like navbar hide/show behavior.
 */
export function useScrollDirection(threshold = 10): ScrollState {
  const [state, setState] = useState<ScrollState>({
    direction: null,
    scrollY: 0,
    isAtTop: true,
  });

  const lastScrollY = useCallback(() => {
    let value = 0;
    return {
      get: () => value,
      set: (v: number) => {
        value = v;
      },
    };
  }, []);

  useEffect(() => {
    const tracker = lastScrollY();

    function handleScroll() {
      const currentY = window.scrollY;
      const delta = currentY - tracker.get();

      if (Math.abs(delta) < threshold) return;

      setState({
        direction: delta > 0 ? "down" : "up",
        scrollY: currentY,
        isAtTop: currentY < 10,
      });

      tracker.set(currentY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold, lastScrollY]);

  return state;
}
