"use client";

import { X } from "lucide-react";
import type { TutorialStep } from "@/lib/tutorial-steps";
import { TutorialMascot } from "./tutorial-mascot";
import { Button } from "@/components/ui/button";

interface TutorialPointerProps {
  step: TutorialStep;
  /** The target element's bounding box, already resolved by the provider (either the real
   *  input/button for the current step, or the nav link toward it if not on the right page yet). */
  rect: DOMRect;
  viewportWidth: number;
  viewportHeight: number;
  needsNavigation: boolean;
  onNavigate: () => void;
  /** true outside the mandatory first-time walkthrough (triggered via "Panduan" or Reset Demo) —
   *  shows a close button, since nothing is being enforced. */
  dismissible: boolean;
  onDismiss: () => void;
}

const RING_PAD = 6;
const TOOLTIP_MARGIN = 12;
const TOOLTIP_MAX_WIDTH = 380;
const EDGE_MARGIN = 12;

/**
 * Draws a spotlight ring around the element the user needs to interact with next, plus a
 * small card next to it explaining the step — a real pointer instead of a bottom-of-screen bar,
 * so the eye goes straight to the right spot. The ring's own `box-shadow` (a huge spread) is what
 * dims the rest of the screen — one property doing both jobs (highlight + backdrop), no separate
 * mask element needed. The caller remounts this component (via a `key={step.id}`) on every step
 * change, so its entrance animations replay fresh each time instead of only playing once.
 */
export function TutorialPointer({
  step,
  rect,
  viewportWidth,
  viewportHeight,
  needsNavigation,
  onNavigate,
  dismissible,
  onDismiss,
}: TutorialPointerProps) {
  const top = Math.max(0, rect.top - RING_PAD);
  const left = Math.max(0, rect.left - RING_PAD);
  const width = rect.width + RING_PAD * 2;
  const height = rect.height + RING_PAD * 2;

  const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, viewportWidth - EDGE_MARGIN * 2);
  const spaceBelow = viewportHeight - (top + height);
  const estimatedTooltipHeight = 210;
  const placeBelow = spaceBelow >= estimatedTooltipHeight || top < estimatedTooltipHeight;

  let tooltipTop = placeBelow ? top + height + TOOLTIP_MARGIN : top - estimatedTooltipHeight - TOOLTIP_MARGIN;
  tooltipTop = Math.min(Math.max(EDGE_MARGIN, tooltipTop), viewportHeight - EDGE_MARGIN);

  let tooltipLeft = left + width / 2 - tooltipWidth / 2;
  tooltipLeft = Math.min(Math.max(EDGE_MARGIN, tooltipLeft), viewportWidth - tooltipWidth - EDGE_MARGIN);

  return (
    <>
      <div
        aria-hidden="true"
        className="animate-tutorial-backdrop-in fixed z-[90] rounded-lg pointer-events-none transition-[top,left,width,height] duration-200 ease-out"
        style={{
          top,
          left,
          width,
          height,
          boxShadow: "0 0 0 9999px rgba(15,23,42,0.6), 0 0 0 3px #10b981",
        }}
      />
      <div
        aria-hidden="true"
        className="animate-tutorial-ring fixed z-[90] rounded-lg pointer-events-none"
        style={{ top, left, width, height }}
      />

      <div
        data-tutorial-ui
        className="animate-tutorial-pop fixed z-[100] rounded-md border-2 border-emerald-300 bg-white p-6 shadow-2xl transition-[top,left] duration-200 ease-out"
        style={{ top: tooltipTop, left: tooltipLeft, width: tooltipWidth }}
      >
        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            aria-label="Tutup panduan"
            className="absolute top-2.5 right-2.5 h-7 w-7"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-start gap-3.5 pr-4">
          <TutorialMascot mood="curious" className="h-16 w-14 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">{step.title}</div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.description}</p>
          </div>
        </div>
        {needsNavigation && (
          <Button type="button" onClick={onNavigate} className="mt-4 w-full">
            {step.ctaLabel}
          </Button>
        )}
      </div>
    </>
  );
}
