"use client";

import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Reopens the role-specific onboarding tour rendered in each layout (see
 *  components/onboarding/onboarding-tour.tsx), which listens for this event. */
export function HelpButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => window.dispatchEvent(new Event("ecolur:open-onboarding"))}
      aria-label="Panduan"
      title="Buka panduan penggunaan"
      className="px-2 text-slate-600 lg:px-3"
    >
      <CircleHelp className="h-4 w-4" aria-hidden="true" />
      <span className="hidden lg:inline">Panduan</span>
    </Button>
  );
}
