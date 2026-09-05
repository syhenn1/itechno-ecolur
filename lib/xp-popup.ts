export interface XpPopupOrigin {
  /** Normalized 0-1 fraction of viewport width/height — same shape as confetti.ts's
   *  ConfettiOrigin, so a call site that already computed one for the confetti burst can reuse
   *  it here without re-deriving anything. */
  x: number;
  y: number;
}

/** A floating "+XX EXP" badge that pops up and drifts away — imperative DOM (like canvas-confetti
 *  itself), not a React component, since it's a fire-and-forget celebration effect with no state
 *  to track afterward. Pass `null`/omit `origin` to center it on screen. */
export function triggerXpPopup(amount: number, origin?: XpPopupOrigin | null) {
  if (typeof window === "undefined" || !amount || amount <= 0) return;

  const xFraction = origin ? Math.max(0.05, Math.min(0.95, origin.x)) : 0.5;
  const yFraction = origin ? Math.max(0.05, Math.min(0.95, origin.y)) : 0.45;

  const el = document.createElement("div");
  el.textContent = `+${amount} EXP`;
  el.className = "ecolur-xp-popup";
  el.style.left = `${xFraction * window.innerWidth}px`;
  el.style.top = `${yFraction * window.innerHeight}px`;
  document.body.appendChild(el);

  const cleanup = () => el.remove();
  el.addEventListener("animationend", cleanup, { once: true });
  // Fallback in case animationend never fires (e.g. animation disabled some other way) — the
  // popup shouldn't linger in the DOM forever. Must stay longer than the CSS animation itself
  // (2.2s, see globals.css's xp-popup-float) or this would yank the element out mid-fade.
  window.setTimeout(cleanup, 2600);
}
