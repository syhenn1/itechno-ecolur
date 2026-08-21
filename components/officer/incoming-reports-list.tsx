"use client";

import { useState, useMemo } from "react";
import { Zap, MapPin, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusTimeline } from "@/components/reports/status-timeline";
import { StatusUpdateForm } from "@/components/reports/status-update-form";
import {
  triageReports,
  type DispatchReport,
  type SortMode,
} from "@/lib/spatial/officer-dispatch";

export function IncomingReportsList({ initialReports }: { initialReports: DispatchReport[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("SMART_PRIORITY");

  const sortedReports = useMemo(() => {
    return triageReports(initialReports, sortMode);
  }, [initialReports, sortMode]);

  return (
    <div className="space-y-6">
      {/* Control bar / Triage Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Urutan Penugasan Petugas
          </div>
          <div className="text-sm font-medium text-slate-900 mt-0.5">
            {sortMode === "SMART_PRIORITY" && "Prioritas Cerdas (Struktur Data Max-Heap & Triage)"}
            {sortMode === "KNN_DISTANCE" && "Jarak Terdekat (Algoritma KNN dari Pos Bojong Kulur)"}
            {sortMode === "NEWEST" && "Urutan Waktu Laporan (Terbaru)"}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setSortMode("SMART_PRIORITY")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
              sortMode === "SMART_PRIORITY"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Prioritas Cerdas
          </button>
          <button
            type="button"
            onClick={() => setSortMode("KNN_DISTANCE")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
              sortMode === "KNN_DISTANCE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            Terdekat (KNN)
          </button>
          <button
            type="button"
            onClick={() => setSortMode("NEWEST")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
              sortMode === "NEWEST"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            Terbaru
          </button>
        </div>
      </div>

      {sortedReports.length === 0 ? (
        <Card className="text-center text-sm text-slate-500 py-10">
          Belum ada laporan masuk.
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report, index) => (
            <Card
              key={report.id}
              className="animate-fade-in-up transition-all hover:border-slate-300"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="capitalize text-base">
                      {report.category.replace(/_/g, " ")}
                    </CardTitle>

                    {/* Urgency Badge */}
                    {report.urgencyLevel === "TINGGI" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                        <ShieldAlert className="h-3 w-3" /> Urgensi Tinggi
                      </span>
                    )}
                    {report.urgencyLevel === "SEDANG" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
                        <AlertTriangle className="h-3 w-3" /> Urgensi Sedang
                      </span>
                    )}

                    {/* Spatial Distance Badge */}
                    {typeof report.distanceKm === "number" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700 border border-sky-200">
                        <MapPin className="h-3 w-3" /> {report.distanceKm} km dari Pos
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Pelapor: {report.user.name} &middot;{" "}
                    {new Date(report.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {typeof report.priorityScore === "number" && (
                    <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                      Skor: {report.priorityScore}
                    </span>
                  )}
                  <StatusBadge status={report.status} />
                </div>
              </CardHeader>

              <p className="mb-4 text-sm text-slate-700 leading-relaxed">{report.description}</p>

              <StatusTimeline logs={report.statusLogs} />
              <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
