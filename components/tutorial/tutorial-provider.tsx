"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { TUTORIAL_STEPS } from "@/lib/tutorial-steps";
import { TutorialPointer } from "./tutorial-pointer";
import { TutorialMascot } from "./tutorial-mascot";
import { cn } from "@/lib/utils";

// Bumped to v2: an earlier version of "Panduan" rewrote this key back to "not done" every time
// it was reopened, before the forced/guide split existed — anyone who clicked it back then has
// a permanently stuck "unfinished tour" flag under the old key. Renaming the key orphans that
// stale value instead of trying to migrate it, so the tour cleanly restarts fresh once and then
// behaves correctly (persisting only for the real forced walkthrough) from here on.
const STORAGE_KEY = "ecolur_tutorial_citizen_v2";

interface StoredState {
  active: boolean;
  stepIndex: number;
  done: boolean;
}

// "forced" = the mandatory first-time walkthrough: every click outside the current step's zone
// is blocked. "guide" = a replay (via the navbar's Panduan button, or after Reset Demo) that
// shows the exact same spotlight/tooltip but never blocks anything and can be closed anytime —
// see the user's own distinction: re-showing the tooltips isn't supposed to redo the lockdown.
type TourMode = "forced" | "guide";

interface TutorialContextValue {
  active: boolean;
  currentStepId: string | null;
  /** Call from wherever a step's real action succeeds (form submit, claim, tab click). Ignored
   *  if the tutorial isn't active or `stepId` isn't the current step — so a stray/duplicate call
   *  from an unrelated action can never skip steps out of order. */
  complete: (stepId: string) => void;
  /** Replays the tour as a non-blocking guide — what the navbar's Panduan button and Reset Demo
   *  now trigger. Never touches the persisted "has completed the mandatory tour" flag. */
  restart: () => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

/** Safe to call from any client component — returns null (no-op) outside the citizen layout,
 *  so shared components used by more than one role don't need to guard every call site. */
export function useTutorial() {
  return useContext(TutorialContext);
}

function readStored(): StoredState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredState) : null;
  } catch {
    return null;
  }
}

function writeStored(state: StoredState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / storage disabled — the tour just won't resume after a refresh, harmless.
  }
}

function isVisible(el: HTMLElement): boolean {
  return el.offsetWidth > 0 && el.offsetHeight > 0;
}

interface TargetState {
  rect: DOMRect;
  viewportWidth: number;
  viewportHeight: number;
}

/**
 * A forced, action-gated product tour for first-time citizens: unlike a normal onboarding modal
 * (read some text, click through), each step only advances when the citizen actually performs
 * the real action elsewhere in the app — see the `complete("...")` calls in EnergyForm,
 * ReportForm, InteractiveLevelCard, and GamificationHub's leaderboard tab. A spotlight ring +
 * tooltip (TutorialPointer) tracks and points straight at whatever the citizen needs to touch
 * next — the real target once they're on the right page, or the nav link toward it if they
 * aren't yet. That lockdown only applies the first time (mode "forced"); replaying it later via
 * Panduan/Reset Demo runs in "guide" mode instead — same pointer, nothing blocked, closable.
 */
export function TutorialProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = useState<TourMode>("forced");
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [target, setTarget] = useState<TargetState | null>(null);
  const [blocked, setBlocked] = useState<{ text: string; nonce: number; leaving: boolean } | null>(null);
  const rafRef = useRef<number | null>(null);
  // Mirrors `stepIndex`/`mode`, but updated synchronously (refs don't batch) the instant a step
  // completes — see `complete()` below for why that's what actually prevents duplicate toasts.
  const stepIndexRef = useRef(0);
  const modeRef = useRef<TourMode>("forced");

  // One-time hydration from localStorage: resume an interrupted forced tour, skip a finished
  // one, or auto-start for a citizen who has never seen it. Reading localStorage can only happen
  // once mounted in the browser, so this can't be computed in a lazy useState initializer
  // without risking a server/client hydration mismatch — a legitimate one-time external read.
  useEffect(() => {
    const stored = readStored();
    if (!stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(true);
      writeStored({ active: true, stepIndex: 0, done: false });
    } else if (!stored.done && stored.active) {
      const resumeIndex = Math.min(stored.stepIndex, TUTORIAL_STEPS.length - 1);
      setActive(true);
      setStepIndex(resumeIndex);
      stepIndexRef.current = resumeIndex;
    }
  }, []);

  const currentStep = active ? (TUTORIAL_STEPS[stepIndex] ?? null) : null;

  // Reads/advances `stepIndexRef` (not React state) as its source of truth, and updates the ref
  // synchronously before doing anything else. This is what actually matters here: React's Strict
  // Mode intentionally invokes effects twice in development (to surface missing cleanup), and
  // every step completion in this app is signalled from an effect somewhere (see
  // CompleteTutorialStepOnMount, and the safety-net effect below) — a version of this function
  // that read `stepIndex` from React state (even via the functional setState-updater form) would
  // still see the OLD value on that immediate second call, since no re-render happens between
  // the two invocations, and would advance + toast twice. The ref sidesteps that entirely: its
  // update lands instantly, so the duplicate call's `step.id !== stepId` check fails and it's a
  // safe no-op.
  const complete = useCallback((stepId: string) => {
    const idx = stepIndexRef.current;
    const step = TUTORIAL_STEPS[idx];
    if (!step || step.id !== stepId) return;

    const nextIdx = idx + 1;
    stepIndexRef.current = nextIdx;
    const isForced = modeRef.current === "forced";

    if (nextIdx >= TUTORIAL_STEPS.length) {
      setActive(false);
      if (isForced) writeStored({ active: false, stepIndex: 0, done: true });
      toast.success("Semua langkah selesai!", {
        description: "Kamu sudah coba semua fitur utama EcoLur. Selamat menjelajah!",
      });
      return;
    }

    setStepIndex(nextIdx);
    if (isForced) writeStored({ active: true, stepIndex: nextIdx, done: false });
    // No "Langkah selesai" toast here (unlike the final one below) — the pointer/tooltip for the
    // next step appears immediately and already says exactly this ("Langkah X/5 · ..."), so a
    // center-screen toast on top of it was just duplicate information colliding with it visually.
  }, []);

  // Triggered by the navbar's Panduan button and by Reset Demo — a non-blocking replay, never
  // written to storage, so it can never overwrite the persisted "completed the mandatory tour"
  // flag (that would make the hard lock reappear for a citizen who already finished it once).
  const restart = useCallback(() => {
    stepIndexRef.current = 0;
    modeRef.current = "guide";
    setMode("guide");
    setActive(true);
    setStepIndex(0);
  }, []);

  const dismissGuide = useCallback(() => {
    setActive(false);
  }, []);

  // Listen for the navbar's "Panduan" button (dispatches this same event the old onboarding
  // modal used, so HelpButton itself didn't need to change).
  useEffect(() => {
    function handleReopen() {
      restart();
    }
    window.addEventListener("ecolur:open-onboarding", handleReopen);
    return () => window.removeEventListener("ecolur:open-onboarding", handleReopen);
  }, [restart]);

  // Safety net: a step whose action is "click this specific element" (claim_prize, view_ranking)
  // could theoretically never be completable — e.g. a citizen whose current level has no prize
  // left to claim, so the claim button never renders at all. Rather than leave them stuck behind
  // a hard lock forever, auto-advance if the expected zone never shows up on the required page.
  useEffect(() => {
    if (!active || !currentStep) return;
    if (pathname !== currentStep.requiredPath) return;
    if (currentStep.id === "open_badges") return; // completes on arrival, not on a zone element

    const timer = window.setTimeout(() => {
      const zoneExists = document.querySelector(`[data-tutorial-zone="${currentStep.id}"]`);
      if (!zoneExists) complete(currentStep.id);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [active, currentStep, pathname, complete]);

  // Continuously track where the spotlight should point — on the current step's real target
  // once the citizen is on the right page, otherwise on the nav link that gets them there.
  // Recomputed every animation frame (cheap: a querySelector + getBoundingClientRect) so it
  // stays glued to the target through scrolling, resizing, and layout shifts without needing
  // separate scroll/resize listeners. Runs identically in both forced and guide mode.
  useEffect(() => {
    if (!active || !currentStep) {
      // Tutorial just turned off (or has no step) — stop tracking immediately rather than
      // leaving a stale spotlight rect around from before. Not state derived from other React
      // state; it's clearing this effect's own external tracking loop as it shuts down.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTarget(null);
      return;
    }

    let cancelled = false;

    function tick() {
      if (cancelled || !currentStep) return;
      const selector =
        pathname === currentStep.requiredPath
          ? `[data-tutorial-zone="${currentStep.id}"]`
          : `a[href="${currentStep.requiredPath}"]`;
      const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector));
      const visible = candidates.find(isVisible);
      const viewportWidth = window.innerWidth;
      // The citizen layout's mobile bottom nav (md:hidden, ~72px tall) sits fixed at the very
      // bottom below that breakpoint — shrink the usable height so the tooltip never gets
      // clamped underneath it.
      const viewportHeight = window.innerHeight - (viewportWidth < 768 ? 72 : 0);
      setTarget(visible ? { rect: visible.getBoundingClientRect(), viewportWidth, viewportHeight } : null);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active, currentStep, pathname]);

  // The hard lock — forced mode only. While a step is active, intercept every click on an
  // interactive element that isn't inside this step's zone, isn't a link toward this step's
  // required page, and isn't one of the two safety-valve actions (logout, reset demo) — so the
  // citizen can never get truly stuck with no way out even if the tour itself has a bug. Guide
  // mode (Panduan/Reset Demo replays) never installs this listener at all — nothing to unblock.
  useEffect(() => {
    if (!active || !currentStep || mode !== "forced") return;

    function handleClickCapture(event: MouseEvent) {
      const targetEl = event.target as HTMLElement | null;
      const interactive = targetEl?.closest<HTMLElement>('a,button,input,select,textarea,[role="button"]');
      if (!interactive) return;

      if (interactive.closest("[data-tutorial-ui]")) return;
      if (interactive.closest("[data-tutorial-allow]")) return;
      if (currentStep && interactive.closest(`[data-tutorial-zone="${currentStep.id}"]`)) return;

      if (interactive.tagName === "A") {
        const href = interactive.getAttribute("href");
        if (href === currentStep?.requiredPath) return;
      }

      event.preventDefault();
      event.stopPropagation();
      setBlocked({ text: currentStep?.description ?? "", nonce: Date.now(), leaving: false });
    }

    document.addEventListener("click", handleClickCapture, true);
    return () => document.removeEventListener("click", handleClickCapture, true);
  }, [active, currentStep, mode]);

  // Auto-dismiss the centered "Eits" popup in two steps — mark it leaving so it plays the exit
  // animation, then actually clear it once that animation has had time to finish. Re-armed every
  // time `blocked` changes (a fresh blocked click always gets its own full display time, even if
  // it fires while one is already fading out).
  useEffect(() => {
    if (!blocked || blocked.leaving) return;
    const timer = window.setTimeout(() => {
      setBlocked((b) => (b ? { ...b, leaving: true } : b));
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  useEffect(() => {
    if (!blocked?.leaving) return;
    const timer = window.setTimeout(() => setBlocked(null), 220);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  return (
    <TutorialContext.Provider value={{ active, currentStepId: currentStep?.id ?? null, complete, restart }}>
      {children}

      {active && currentStep && target && (
        <TutorialPointer
          key={currentStep.id}
          step={currentStep}
          rect={target.rect}
          viewportWidth={target.viewportWidth}
          viewportHeight={target.viewportHeight}
          needsNavigation={pathname !== currentStep.requiredPath}
          onNavigate={() => router.push(currentStep.requiredPath)}
          dismissible={mode === "guide"}
          onDismiss={dismissGuide}
        />
      )}

      {blocked && (
        <div
          key={blocked.nonce}
          data-tutorial-ui
          className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center px-4"
        >
          <div
            className={cn(
              "pointer-events-auto w-full max-w-md sm:max-w-lg rounded-md border-2 border-emerald-300 bg-white p-7 text-center shadow-2xl",
              blocked.leaving ? "animate-tutorial-pop-out" : "animate-tutorial-pop",
            )}
          >
            <TutorialMascot mood="surprised" className="mx-auto h-28 w-24" />
            <div className="mt-3 text-xl font-bold text-emerald-800">Eits, mau ke mana?</div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">Ini dulu, yuk: {blocked.text}</p>
          </div>
        </div>
      )}
    </TutorialContext.Provider>
  );
}
