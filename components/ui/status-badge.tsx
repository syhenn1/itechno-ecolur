import { cn, statusLabel } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  REPORTED: "bg-slate-100 text-slate-700",
  VERIFIED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
