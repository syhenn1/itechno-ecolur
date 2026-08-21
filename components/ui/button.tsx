"use client";

import { forwardRef, useRef, useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and disables the button — for the duration of an in-flight action. */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300",
  secondary: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400",
  outline: "border border-slate-300 text-slate-900 hover:bg-slate-50 disabled:text-slate-400",
  ghost: "text-slate-700 hover:bg-slate-100 disabled:text-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

// Ripple tint needs to read on every variant's background, including light ones (outline/ghost).
const RIPPLE_CLASSES: Record<Variant, string> = {
  primary: "bg-white/40",
  secondary: "bg-white/40",
  outline: "bg-slate-900/10",
  ghost: "bg-slate-900/10",
  danger: "bg-white/40",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const rippleId = useRef(0);

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
      const rect = event.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const id = rippleId.current++;
      setRipples((prev) => [
        ...prev,
        { id, size, x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2 },
      ]);
      window.setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
      onClick?.(event);
    }

    return (
      <button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg font-medium transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:active:scale-100",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          {ripples.map((r) => (
            <span
              key={r.id}
              className={cn("animate-ripple absolute rounded-full", RIPPLE_CLASSES[variant])}
              style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
            />
          ))}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";
