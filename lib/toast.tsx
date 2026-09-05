"use client";

import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TutorialMascot, type MascotMood } from "@/components/tutorial/tutorial-mascot";
import { Button } from "@/components/ui/button";

// A drop-in replacement for sonner's `toast` API (same call shape: `toast.success(message,
// { description, duration })`, etc.) that renders centered on screen instead of in a corner —
// every call site across the app already used only this subset of sonner's API, so swapping the
// import is enough; no call site needed to change. Kept intentionally small (no swipe-to-dismiss,
// no promise/loading toasts, no stacking limits) since that's all this app actually uses.

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastEntry {
  id: number;
  type: ToastType;
  message: string;
  description?: string;
  duration: number;
  /** True once dismissal (manual or auto-timeout) has been triggered — renders the exit
   *  animation while the removal timeout below actually takes the entry out of the array. */
  leaving: boolean;
}

const DEFAULT_DURATION = 4500;
const EXIT_ANIMATION_MS = 220;

let toasts: ToastEntry[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/** Marks a toast as leaving (so it plays the exit animation) and removes it from the queue once
 *  that animation has had time to finish. Safe to call twice for the same id (e.g. once from a
 *  manual click, once from the auto-dismiss timer that was already in flight) — the second call
 *  just finds nothing left to update. */
function dismiss(id: number) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  notify();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, EXIT_ANIMATION_MS);
}

function push(type: ToastType, message: string, options?: ToastOptions) {
  // De-duplicate: a rapid double-click on a submit button (or any other double-fire) shouldn't
  // stack up several identical cards — if the exact same toast is already showing, leave it be
  // instead of piling another one on top of it.
  const alreadyShowing = toasts.some(
    (t) => !t.leaving && t.type === type && t.message === message && t.description === options?.description,
  );
  if (alreadyShowing) return -1;

  const id = nextId++;
  const duration = options?.duration ?? DEFAULT_DURATION;
  toasts = [...toasts, { id, type, message, description: options?.description, duration, leaving: false }];
  notify();
  window.setTimeout(() => dismiss(id), duration);
  return id;
}

export const toast = Object.assign((message: string, options?: ToastOptions) => push("info", message, options), {
  success: (message: string, options?: ToastOptions) => push("success", message, options),
  error: (message: string, options?: ToastOptions) => push("error", message, options),
  info: (message: string, options?: ToastOptions) => push("info", message, options),
  warning: (message: string, options?: ToastOptions) => push("warning", message, options),
});

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return toasts;
}

const EMPTY_TOASTS: ToastEntry[] = [];
function getServerSnapshot() {
  return EMPTY_TOASTS;
}

// The mascot's expression stands in for a generic icon — happy/celebrating for success, sad/
// worried for error, surprised for warning, curious for a plain info message.
const MOODS: Record<ToastType, MascotMood> = {
  success: "happy",
  error: "sad",
  info: "curious",
  warning: "surprised",
};

/** Mount once, at the root layout — subscribes to the module-level toast queue above via
 *  useSyncExternalStore (the React-blessed way to read state that lives outside React) and
 *  renders every active toast centered on screen, stacked if more than one is showing. */
export function CenterToaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (items.length === 0) return null;

  return (
    // data-tutorial-ui: exempts every toast from the tutorial's click-blocking guard (see
    // components/tutorial/tutorial-provider.tsx) — a toast is transient system feedback, not
    // in-app navigation, so its own buttons (Lanjutkan, X) must always work regardless of
    // whatever step the forced tour is currently on.
    <div data-tutorial-ui className="pointer-events-none fixed inset-0 z-[300] flex flex-col items-center justify-center gap-3 px-4">
      {items.map((t) => {
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto relative w-full max-w-md overflow-hidden rounded-md border-2 border-emerald-300 bg-white p-7 shadow-2xl sm:max-w-lg",
              t.leaving ? "animate-tutorial-pop-out" : "animate-tutorial-pop",
            )}
          >
            <div className="flex items-start gap-4">
              <TutorialMascot mood={MOODS[t.type]} className="h-24 w-20 shrink-0" />
              <div className="min-w-0 flex-1 pt-1">
                <div className="text-xl font-bold text-slate-900">{t.message}</div>
                {t.description && <p className="mt-1.5 text-base leading-relaxed text-slate-600">{t.description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => dismiss(t.id)} aria-label="Tutup" className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <Button type="button" onClick={() => dismiss(t.id)} className="mt-5 w-full">
              Lanjutkan
            </Button>

            {/* Progress bar counting down to auto-dismiss — paused visually once `leaving` (the
                exit animation takes over instead of finishing the shrink). */}
            {!t.leaving && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-100" aria-hidden="true">
                <div
                  className="animate-toast-progress h-full bg-emerald-400"
                  style={{ animationDuration: `${t.duration}ms` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
