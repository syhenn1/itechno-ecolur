"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A pill-shaped CTA for navigation ("go to X") rather than in-place actions — the arrow slides
 * in and a solid circle sweeps out from the center on hover, morphing the pill into a rounded
 * square. This is a deliberate, scoped exception to the app's normal "no capsule buttons" rule:
 * the citizen asked for this exact effect by name, and the pill shape is what the morph
 * animates from, so it can't be swapped for rounded-md without losing the effect itself. Colors
 * are EcoLur's brand emerald instead of the original neutral black/white version — use this for
 * links that take the citizen somewhere else, not for buttons that act on the current page (use
 * components/ui/button.tsx for those instead).
 */
interface FlowButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** "sm" for inline use next to other content (card headers, table rows); default size for
   *  standalone CTAs (hero sections, banners). */
  size?: "sm" | "md";
}

// Horizontal padding stays the same across sizes (px-6) — only vertical padding and font size
// shrink for "sm". The arrows are absolutely positioned at a fixed inset (right-4 / left-4)
// regardless of size, so shrinking the horizontal padding too would leave too little clearance
// between the (also fixed -translate-x-3) text and the arrow, causing them to visually overlap.
const SIZE_CLASSES: Record<"sm" | "md", string> = {
  sm: "px-6 py-2 text-xs",
  md: "px-6 py-3 text-sm",
};

export function FlowButton({ text, href, onClick, className, size = "md" }: FlowButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-emerald-800/40 bg-transparent font-semibold text-emerald-900 cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-xl active:scale-[0.95]",
    SIZE_CLASSES[size],
    className,
  );

  const content = (
    <>
      <ArrowRight
        className="absolute w-4 h-4 left-[-25%] stroke-emerald-900 fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        aria-hidden="true"
      />
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-800 rounded-full opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
      />
      <ArrowRight
        className="absolute w-4 h-4 right-4 stroke-emerald-900 fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        aria-hidden="true"
      />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
