import confetti from "canvas-confetti";

// 100% Strict Eco-Green Palette for ALL Confetti Across the Application
export const ECO_GREEN_PALETTE = [
  "#28430a", // Dark Forest Eco
  "#507b00", // Leaf Eco Green
  "#95c22b", // Lime Green
  "#a7d930", // Chartreuse
  "#3f6212", // Olive Green
  "#65a30d", // Bright Green
  "#84cc16", // Lime
  "#16a34a", // Pure Green
  "#22c55e", // Emerald
];

export interface ConfettiOrigin {
  x: number;
  y: number;
}

export function triggerButtonExplosion(
  targetOrEventOrOrigin?: HTMLElement | React.MouseEvent<HTMLElement> | ConfettiOrigin | null
) {
  if (typeof window === "undefined") return;

  let origin: ConfettiOrigin = { x: 0.5, y: 0.5 };

  if (targetOrEventOrOrigin) {
    if (
      typeof targetOrEventOrOrigin === "object" &&
      "x" in targetOrEventOrOrigin &&
      "y" in targetOrEventOrOrigin &&
      typeof targetOrEventOrOrigin.x === "number"
    ) {
      origin = {
        x: Math.max(0.05, Math.min(0.95, targetOrEventOrOrigin.x)),
        y: Math.max(0.05, Math.min(0.95, targetOrEventOrOrigin.y)),
      };
    } else {
      const el =
        "currentTarget" in targetOrEventOrOrigin && targetOrEventOrOrigin.currentTarget
          ? (targetOrEventOrOrigin.currentTarget as HTMLElement)
          : "target" in targetOrEventOrOrigin && targetOrEventOrOrigin.target
          ? (targetOrEventOrOrigin.target as HTMLElement)
          : targetOrEventOrOrigin instanceof HTMLElement
          ? targetOrEventOrOrigin
          : null;

      if (el && typeof el.getBoundingClientRect === "function") {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          origin = {
            x: Math.max(0.05, Math.min(0.95, (rect.left + rect.width / 2) / window.innerWidth)),
            y: Math.max(0.05, Math.min(0.95, (rect.top + rect.height / 2) / window.innerHeight)),
          };
        }
      }
    }
  }

  // Burst 1: Instant high-density all-green explosion
  confetti({
    particleCount: 70,
    spread: 80,
    startVelocity: 36,
    origin,
    colors: ECO_GREEN_PALETTE,
    ticks: 150,
    gravity: 1.0,
    decay: 0.92,
    scalar: 1.25,
    zIndex: 999999,
    shapes: ["circle", "square"],
    disableForReducedMotion: false,
  });

  // Burst 2: Follow-up green particle shower (100ms delay)
  setTimeout(() => {
    confetti({
      particleCount: 45,
      spread: 100,
      startVelocity: 26,
      origin,
      colors: ECO_GREEN_PALETTE,
      ticks: 130,
      gravity: 0.9,
      decay: 0.94,
      scalar: 1.0,
      zIndex: 999999,
      shapes: ["circle"],
      disableForReducedMotion: false,
    });
  }, 100);
}
