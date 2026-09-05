"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "glass" | "warning";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner and disables the button — for the duration of an in-flight action. */
  loading?: boolean;
}

// Base look for each variant (unchanged from before — what the button looks like at rest).
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white disabled:bg-emerald-300",
  secondary: "bg-slate-900 text-white disabled:bg-slate-400",
  outline: "border border-slate-300 text-slate-900 disabled:text-slate-400",
  ghost: "text-slate-700 disabled:text-slate-400",
  danger: "bg-red-600 text-white disabled:bg-red-300",
  // For placing a button on top of a colored/gradient surface (e.g. the AI recommendation
  // card's green banner) — translucent white instead of a flat color that would clash.
  glass: "bg-white/15 border border-white/25 text-white disabled:opacity-50",
  warning: "bg-amber-600 text-white disabled:bg-amber-300",
};

// The color the radial fill sweeps in as, on hover/press/focus. For a variant that already has a
// solid-color background at rest (primary/danger/warning), a *darker shade of that same hue*
// barely reads as a change at all — green-on-green, orange-on-orange — so those fill with a
// shared dark neutral instead, which reads clearly against any of them. Variants that start
// transparent/near-black (outline/ghost/secondary) get a bright brand-colored fill instead, for
// the same reason in reverse: a neutral fill wouldn't stand out against an already-dark base.
const FILL_CLASSES: Record<Variant, string> = {
  primary: "bg-slate-900",
  secondary: "bg-emerald-600",
  outline: "bg-emerald-700",
  ghost: "bg-slate-800",
  danger: "bg-slate-900",
  glass: "bg-white",
  warning: "bg-slate-900",
};

// The text color to switch to once the fill covers the button, per variant — undefined means no
// change needed (white text stays legible against every fill color used above).
const FILL_TEXT_CLASSES: Record<Variant, string | undefined> = {
  primary: undefined,
  secondary: undefined,
  outline: "text-white",
  ghost: "text-white",
  danger: undefined,
  // glass fills opaque white, so its text needs to go dark to stay legible.
  glass: "text-emerald-900",
  warning: undefined,
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  // Square, no horizontal padding — for an icon-only button (a close X, a chevron, etc).
  icon: "h-9 w-9 p-0",
};

function coverDiameter(width: number, height: number, x: number, y: number) {
  return Math.ceil(
    2 *
      Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y),
      ),
  );
}

/**
 * A solid color sweeps in from wherever the pointer entered (or from the center, on keyboard
 * focus) and covers the whole button — a richer stand-in for a flat `hover:bg-*` transition.
 * Reimplemented from a Motion/React reference component using plain refs + CSS transitions
 * instead of the `motion` library, to avoid adding a new animation dependency for one component
 * (see lib/utils.ts's "avoid heavy UI kits" note) — the visual effect is the same.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, disabled, children, onClick, ...props },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const [origin, setOrigin] = useState({ x: 0, y: 0 });
    const [coverSize, setCoverSize] = useState(0);

    const isDisabled = Boolean(disabled || loading);
    const showFill = !isDisabled && (hovered || pressed);

    const setMergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    function updateOrigin(x: number, y: number) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setOrigin({ x, y });
      setCoverSize(coverDiameter(rect.width, rect.height, x, y));
    }

    function handlePointerEnter(event: ReactPointerEvent<HTMLButtonElement>) {
      if (isDisabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      updateOrigin(event.clientX - rect.left, event.clientY - rect.top);
      setHovered(true);
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
      if (isDisabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      updateOrigin(event.clientX - rect.left, event.clientY - rect.top);
      setPressed(true);
    }

    function handleFocus() {
      if (isDisabled) return;
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) updateOrigin(rect.width / 2, rect.height / 2);
      setHovered(true);
    }

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
      onClick?.(event);
    }

    return (
      <button
        ref={setMergedRef}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onFocus={handleFocus}
        onBlur={() => {
          setHovered(false);
          setPressed(false);
        }}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg font-medium transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:active:scale-100",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "btn-fill pointer-events-none absolute rounded-full -translate-x-1/2 -translate-y-1/2",
            FILL_CLASSES[variant],
          )}
          style={{
            left: origin.x,
            top: origin.y,
            width: showFill ? coverSize : 0,
            height: showFill ? coverSize : 0,
            opacity: showFill ? 1 : 0,
            transition: "width 500ms cubic-bezier(0.16,1,0.3,1), height 500ms cubic-bezier(0.16,1,0.3,1), opacity 500ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center gap-2 transition-colors duration-300",
            showFill && FILL_TEXT_CLASSES[variant],
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";
