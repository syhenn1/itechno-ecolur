"use client";

import { useSyncExternalStore } from "react";
import { PopupShell, type PopupType } from "@/components/ui/popup-shell";

// A drop-in replacement for sonner's `toast` API (same call shape: `toast.success(message,
// { description, duration })`, etc.) that renders centered on screen instead of in a corner —
// every call site across the app already used only this subset of sonner's API, so swapping the
// import is enough; no call site needed to change. Kept intentionally small (no swipe-to-dismiss,
// no promise/loading toasts, no stacking limits) since that's all this app actually uses.

type ToastType = PopupType;

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
  /** True once this entry's auto-dismiss timer has actually been scheduled — only ever true for
   *  the front (currently shown) toast, see `ensureFrontTimer()`. Without this, a toast queued
   *  behind another one would silently burn through its whole duration off-screen and vanish
   *  the instant it became visible. */
  timerStarted: boolean;
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
    ensureFrontTimer();
  }, EXIT_ANIMATION_MS);
}

// This centered toast reads visually as a modal (big card, mascot, its own "Lanjutkan" button) —
// showing two at once (e.g. an action's own success toast landing right as the forced tutorial's
// "Semua langkah selesai!" toast fires from that same action) looked like a rendering bug, not
// two separate messages. So only ever one toast is actually live at a time: the rest sit queued
// in `toasts` (still available for the de-dup check below) and only the front one (`toasts[0]`,
// see CenterToaster) is rendered and ticking down — the next one starts its own duration timer
// only once it becomes the front, right after the current one finishes leaving.
function ensureFrontTimer() {
  const front = toasts.find((t) => !t.leaving);
  if (!front || front.timerStarted) return;
  toasts = toasts.map((t) => (t.id === front.id ? { ...t, timerStarted: true } : t));
  window.setTimeout(() => dismiss(front.id), front.duration);
}

function push(type: ToastType, message: string, options?: ToastOptions) {
  // De-duplicate: a rapid double-click on a submit button (or any other double-fire) shouldn't
  // stack up several identical cards — if the exact same toast is already showing (or queued),
  // leave it be instead of piling another one on.
  const alreadyShowing = toasts.some(
    (t) => !t.leaving && t.type === type && t.message === message && t.description === options?.description,
  );
  if (alreadyShowing) return -1;

  const id = nextId++;
  const duration = options?.duration ?? DEFAULT_DURATION;
  toasts = [...toasts, { id, type, message, description: options?.description, duration, leaving: false, timerStarted: false }];
  notify();
  ensureFrontTimer();
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

const EYEBROWS: Record<ToastType, string> = {
  success: "Berhasil",
  error: "Gagal",
  info: "Info",
  warning: "Perhatian",
};

/** Mount once, at the root layout — subscribes to the module-level toast queue above via
 *  useSyncExternalStore (the React-blessed way to read state that lives outside React) and
 *  renders only the front toast centered on screen, via the shared PopupShell. The rest of the
 *  queue waits its turn (see `ensureFrontTimer()`) instead of stacking up several of these
 *  modal-sized cards at once. */
export function CenterToaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = items[0];

  if (!t) return null;

  return (
    // data-tutorial-ui: exempts every toast from the tutorial's click-blocking guard (see
    // components/tutorial/tutorial-provider.tsx) — a toast is transient system feedback, not
    // in-app navigation, so its own buttons (Lanjutkan, X) must always work regardless of
    // whatever step the forced tour is currently on.
    <div data-tutorial-ui className="pointer-events-none fixed inset-0 z-[300] flex flex-col items-center justify-center gap-3 px-4">
      <PopupShell
        key={t.id}
        className="pointer-events-auto"
        type={t.type}
        eyebrow={EYEBROWS[t.type]}
        title={t.message}
        message={t.description}
        primary={{ label: "Lanjutkan", onClick: () => dismiss(t.id) }}
        onClose={() => dismiss(t.id)}
        leaving={t.leaving}
        footer={
          // Progress bar counting down to auto-dismiss -- paused visually once `leaving` (the
          // exit animation takes over instead of finishing the shrink).
          !t.leaving && (
            <div className="relative -mx-6 -mb-6 mt-4 h-1 overflow-hidden bg-slate-100" aria-hidden="true">
              <div
                className="animate-toast-progress h-full bg-slate-300"
                style={{ animationDuration: `${t.duration}ms` }}
              />
            </div>
          )
        }
      />
    </div>
  );
}
