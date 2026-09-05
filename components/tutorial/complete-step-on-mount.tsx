"use client";

import { useEffect } from "react";
import { useTutorial } from "./tutorial-provider";

/**
 * For a tutorial step whose "action" is simply arriving on a page (e.g. "open the Hadiah &
 * Lencana page") rather than submitting a form — drop this in that page and it marks the step
 * done as soon as the page renders. Renders nothing.
 */
export function CompleteTutorialStepOnMount({ stepId }: { stepId: string }) {
  const tutorial = useTutorial();

  useEffect(() => {
    tutorial?.complete(stepId);
    // Intentionally mount-only: `tutorial` is a fresh object every render (its functions are
    // stable via useCallback, but the context value itself isn't memoized), and `complete()` is
    // a no-op once this step is no longer current — so re-running this on every re-render would
    // be harmless but pointless. Only `stepId` (a plain prop) belongs in the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  return null;
}
