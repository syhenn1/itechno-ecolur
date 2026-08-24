"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

/** Animates a number counting up to `value` on mount/change. Serialisable props only (safe across RSC boundary). */
export function CountUp({ value, duration = 800, decimals = 0, prefix = "", suffix = "" }: CountUpProps) {
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

  const formatted = decimals > 0 
    ? display.toFixed(decimals) 
    : Math.round(display).toLocaleString("id-ID");

  return <>{prefix}{formatted}{suffix}</>;
}
