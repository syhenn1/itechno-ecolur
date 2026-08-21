"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  formatter?: (value: number) => string;
}

/** Animates a number counting up to `value` on mount/change. Respects prefers-reduced-motion by
 *  collapsing the animation to a single frame rather than skipping the effect (setting state
 *  synchronously at the top of an effect is its own anti-pattern — this keeps every state
 *  update inside the requestAnimationFrame callback instead). */
export function CountUp({ value, duration = 800, formatter }: CountUpProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveDuration = prefersReducedMotion ? 0 : duration;

    startRef.current = null;
    let frame: number;

    function step(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = effectiveDuration === 0 ? 1 : Math.min(elapsed / effectiveDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(eased * value);
      if (progress < 1) frame = requestAnimationFrame(step);
    }

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{formatter ? formatter(display) : Math.round(display).toLocaleString("id-ID")}</>;
}
