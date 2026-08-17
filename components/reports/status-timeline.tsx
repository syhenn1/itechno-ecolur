import { Check } from "lucide-react";
import { cn, statusLabel } from "@/lib/utils";

interface StatusLogItem {
  id: string;
  status: string;
  notes: string | null;
  updatedAt: Date | string;
}

export function StatusTimeline({ logs }: { logs: StatusLogItem[] }) {
  if (logs.length === 0) return null;

  return (
    <ol className="space-y-3 border-t border-slate-100 pt-4">
      {logs.map((log, index) => (
        <li key={log.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                index === logs.length - 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500",
              )}
            >
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
            {index < logs.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
          </div>
          <div className="pb-3">
            <div className="text-sm font-medium text-slate-900">{statusLabel(log.status)}</div>
            {log.notes && <div className="text-sm text-slate-600">{log.notes}</div>}
            <div className="text-xs text-slate-400">
              {new Date(log.updatedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
