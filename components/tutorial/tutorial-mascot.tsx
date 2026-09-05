import type { ReactNode } from "react";

export type MascotMood = "happy" | "sad" | "surprised" | "curious";

interface FaceParts {
  eyebrows: ReactNode;
  eyes: ReactNode;
  mouth: ReactNode;
  /** true = one arm raised (alert/pointing), false = both arms relaxed down. */
  armRaised: boolean;
}

const FACES: Record<MascotMood, FaceParts> = {
  // Success toasts — arms up celebrating, closed happy eyes, big smile.
  happy: {
    eyebrows: null,
    eyes: (
      <>
        <path d="M34 41 Q40 35 46 41" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M54 41 Q60 35 66 41" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
    mouth: <path d="M38 50 Q50 63 62 50" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    armRaised: true,
  },
  // Error toasts — worried eyebrows, downturned mouth, arms drooped.
  sad: {
    eyebrows: (
      <>
        <path d="M32 33 Q37 29 43 33" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M57 33 Q63 29 68 33" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
    eyes: (
      <>
        <circle cx="40" cy="42" r="5" fill="#0f172a" />
        <circle cx="60" cy="42" r="5" fill="#0f172a" />
      </>
    ),
    mouth: <path d="M40 58 Q50 50 60 58" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />,
    armRaised: false,
  },
  // Blocked-click "Eits" popup — raised eyebrows, small surprised smile, one arm up like "wait!".
  surprised: {
    eyebrows: (
      <>
        <path d="M32 30 Q37 26 42 29" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M58 29 Q63 26 68 30" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
    eyes: (
      <>
        <circle cx="40" cy="40" r="5.5" fill="#0f172a" />
        <circle cx="60" cy="40" r="5.5" fill="#0f172a" />
        <circle cx="42" cy="38" r="1.8" fill="#ffffff" />
        <circle cx="62" cy="38" r="1.8" fill="#ffffff" />
      </>
    ),
    mouth: <path d="M41 50 Q50 57 59 50" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />,
    armRaised: true,
  },
  // Info / guidance popups — one eyebrow up (curious), gentle smile, one arm up as if pointing.
  curious: {
    eyebrows: (
      <>
        <path d="M32 33 Q37 29 42 32" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M58 30 Q63 24 68 27" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    ),
    eyes: (
      <>
        <circle cx="40" cy="42" r="5.5" fill="#0f172a" />
        <circle cx="60" cy="42" r="5.5" fill="#0f172a" />
        <circle cx="42" cy="40" r="1.8" fill="#ffffff" />
        <circle cx="62" cy="40" r="1.8" fill="#ffffff" />
      </>
    ),
    mouth: <path d="M41 52 Q50 58 59 52" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />,
    armRaised: true,
  },
};

/**
 * A small original leaf-character mascot used across every popup (tutorial nudges, success/
 * error/info toasts) — drawn as plain inline SVG rather than sourced from a third-party asset,
 * since this is a competition submission and the rules require original work. `mood` swaps its
 * expression and pose so it reacts differently depending on what kind of popup it's in.
 */
export function TutorialMascot({ className, mood = "surprised" }: { className?: string; mood?: MascotMood }) {
  const face = FACES[mood];

  return (
    <svg viewBox="0 0 100 120" className={className} aria-hidden="true">
      {/* Ground shadow */}
      <ellipse cx="50" cy="114" rx="24" ry="5" fill="#000000" opacity="0.08" />

      {/* Body */}
      <rect x="21" y="58" width="58" height="52" rx="26" fill="#059669" />

      {/* Arms */}
      {face.armRaised ? (
        <>
          <ellipse cx="20" cy="80" rx="8" ry="15" fill="#059669" transform="rotate(-12 20 80)" />
          <ellipse cx="82" cy="58" rx="8" ry="17" fill="#059669" transform="rotate(40 82 58)" />
          <circle cx="92" cy="43" r="8" fill="#059669" />
        </>
      ) : (
        <>
          <ellipse cx="19" cy="85" rx="8" ry="15" fill="#059669" transform="rotate(8 19 85)" />
          <ellipse cx="81" cy="85" rx="8" ry="15" fill="#059669" transform="rotate(-8 81 85)" />
        </>
      )}

      {/* Head */}
      <circle cx="50" cy="40" r="30" fill="#10b981" />

      {/* Sprout */}
      <path d="M46 12 C40 4 30 2 24 8 C34 11 40 15 45 20 Z" fill="#34d399" />
      <path d="M54 12 C60 4 70 2 76 8 C66 11 60 15 55 20 Z" fill="#34d399" />

      {face.eyebrows}
      {face.eyes}

      {/* Blush */}
      <ellipse cx="32" cy="49" rx="5" ry="3.2" fill="#fca5a5" opacity="0.55" />
      <ellipse cx="68" cy="49" rx="5" ry="3.2" fill="#fca5a5" opacity="0.55" />

      {face.mouth}
    </svg>
  );
}
