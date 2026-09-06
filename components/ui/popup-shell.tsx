import type { ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TutorialMascot, type MascotMood } from "@/components/tutorial/tutorial-mascot";
import { Button } from "@/components/ui/button";

export type PopupType = "success" | "info" | "warning" | "error";

interface TypeMeta {
  mood: MascotMood;
  panelGradient: string;
  badgeIcon: typeof CheckCircle2;
  badgeColorClass: string;
  eyebrowColorClass: string;
  buttonBgClass: string;
}

// One shared shell for every popup in the app (toasts, the tutorial's blocked-click notice, the
// Reset Demo confirmation) -- panel color, status badge, and mascot mood all key off the same
// `type`, so a popup's "genre" (good news / heads-up / needs-attention / went wrong) always reads
// the same way no matter which surface it came from.
const TYPE_META: Record<PopupType, TypeMeta> = {
  success: {
    mood: "happy",
    panelGradient: "bg-[linear-gradient(160deg,#8FD8A8_0%,#52A675_55%,#1B4332_130%)]",
    badgeIcon: CheckCircle2,
    badgeColorClass: "text-[#52A675]",
    eyebrowColorClass: "text-[#1B4332]",
    buttonBgClass: "!bg-[#1B4332]",
  },
  info: {
    mood: "curious",
    panelGradient: "bg-[linear-gradient(160deg,#BFE0F7_0%,#4E8FC4_60%,#2E5E85_130%)]",
    badgeIcon: Info,
    badgeColorClass: "text-[#4E8FC4]",
    eyebrowColorClass: "text-[#2E5E85]",
    buttonBgClass: "!bg-[#2E5E85]",
  },
  // Our "surprised" mood (validation nudges, the tutorial's forced-step block) -- an attention
  // color that isn't alarming, so it gets the gold/achievement tone rather than red.
  warning: {
    mood: "surprised",
    panelGradient: "bg-[linear-gradient(160deg,#F4C95D_0%,#C9922F_55%,#8C6412_130%)]",
    badgeIcon: TriangleAlert,
    badgeColorClass: "text-[#C9922F]",
    eyebrowColorClass: "text-[#8C6412]",
    buttonBgClass: "!bg-[#8C6412]",
  },
  // Our "sad" mood (something actually failed) -- the coral/red tone.
  error: {
    mood: "sad",
    panelGradient: "bg-[linear-gradient(160deg,#F6A896_0%,#E8654F_55%,#A6402E_130%)]",
    badgeIcon: XCircle,
    badgeColorClass: "text-[#E8654F]",
    eyebrowColorClass: "text-[#A6402E]",
    buttonBgClass: "!bg-[#A6402E]",
  },
};

interface PopupAction {
  label: string;
  onClick: () => void;
  loading?: boolean;
}

export interface PopupShellProps {
  type: PopupType;
  eyebrow: string;
  title: string;
  message?: ReactNode;
  primary: PopupAction;
  secondary?: PopupAction;
  /** Shows an X button at the card's top-right corner when provided. */
  onClose?: () => void;
  /** e.g. a toast's auto-dismiss progress bar -- rendered under the actions. */
  footer?: ReactNode;
  leaving?: boolean;
  className?: string;
  [dataAttr: `data-${string}`]: string | boolean | undefined;
}

// Left mascot panel's width -- kept as a single source of truth since the status badge below has
// to straddle the exact seam between the two panels (left-<PANEL_WIDTH> - translate-x-1/2).
const PANEL_WIDTH_CLASS = "w-36"; // 9rem / 144px
const PANEL_WIDTH_LEFT_CLASS = "left-36";

/** The shared popup card: a wide landscape layout with a color-coded mascot panel on the left
 *  (gradient + status badge straddling the seam) and the message/actions on the right -- used for
 *  toasts (lib/toast.tsx), the tutorial's blocked-click notice, and the Reset Demo confirmation.
 *
 *  The badge is a sibling of both panels, not a child of either -- each panel clips its own
 *  gradient/mascot to its own rounded corner (`overflow-hidden`), so a badge nested inside either
 *  one would get clipped by that same boundary the moment it pokes out past it. Positioning it at
 *  the outer card's level instead (which stays `overflow-visible`) is what lets it actually
 *  straddle the seam without losing half of itself. */
export function PopupShell({
  type,
  eyebrow,
  title,
  message,
  primary,
  secondary,
  onClose,
  footer,
  leaving = false,
  className,
  ...rest
}: PopupShellProps) {
  const meta = TYPE_META[type];
  const BadgeIcon = meta.badgeIcon;

  return (
    <div
      {...rest}
      className={cn(
        "relative flex w-full max-w-[480px] overflow-visible rounded-[28px] bg-white shadow-2xl",
        leaving ? "animate-tutorial-pop-out" : "animate-tutorial-pop",
        className,
      )}
    >
      {/* Left: mascot panel */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-l-[28px]",
          PANEL_WIDTH_CLASS,
          meta.panelGradient,
        )}
      >
        {/* Decorative texture -- soft translucent circles, purely atmospheric. */}
        <span aria-hidden="true" className="absolute -left-4 -top-3 h-16 w-16 rounded-full bg-white/15" />
        <span aria-hidden="true" className="absolute -right-3 bottom-6 h-8 w-8 rounded-full bg-white/15" />
        <span aria-hidden="true" className="absolute left-3 top-8 h-4 w-4 rounded-full bg-white/15" />

        <TutorialMascot mood={meta.mood} className="relative z-[1] h-24 w-20" />
      </div>

      {/* Status badge -- a sibling of both panels (see the function doc above), straddling the
          seam between them, vertically pinned near the top so it never collides with the message. */}
      <span
        className={cn(
          "absolute top-5 z-[2] flex h-13 w-13 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-lg",
          PANEL_WIDTH_LEFT_CLASS,
          meta.badgeColorClass,
        )}
      >
        <BadgeIcon className="h-6 w-6" />
      </span>

      {/* Right: content. overflow-hidden so the footer progress bar (flush to the edges, see
          lib/toast.tsx) can't poke past this panel's own rounded bottom-right corner -- doesn't
          affect the badge above, which is a sibling positioned at the outer card level. */}
      <div className="relative flex-1 overflow-hidden rounded-r-[28px] px-6 py-6 text-left">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup"
            className="!absolute !right-3 !top-3 !h-8 !w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        <p className={cn("mb-1.5 pr-8 text-[11.5px] font-bold tracking-wide", meta.eyebrowColorClass)}>{eyebrow}</p>
        <h2 className="mb-2.5 pr-8 font-[family-name:var(--font-baloo)] text-[21px] font-bold leading-tight text-slate-900">
          {title}
        </h2>
        {message && <p className="mb-5 text-[14px] leading-relaxed text-slate-600">{message}</p>}

        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={primary.onClick}
            loading={primary.loading}
            className={cn("!h-auto !rounded-2xl !py-3 !text-[14px] !font-bold", meta.buttonBgClass)}
          >
            {primary.label}
          </Button>
          {secondary && (
            <Button
              type="button"
              variant="ghost"
              onClick={secondary.onClick}
              className="!h-auto !rounded-xl !py-2 !text-slate-400 hover:!text-slate-600"
            >
              {secondary.label}
            </Button>
          )}
        </div>

        {footer}
      </div>
    </div>
  );
}
