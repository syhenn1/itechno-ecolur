"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Zap, MapPin, Clock, AlertTriangle, ShieldAlert, Map as MapIcon, ChevronDown, ChevronUp } from "lucide-react";
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

// Dynamically load Leaflet Map without SSR issues
const OfficerDispatchMap = dynamic(
  () => import("./officer-dispatch-map").then((mod) => mod.OfficerDispatchMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
        Memuat Peta Spasial Petugas...
      </div>
    ),
  }
);

export function IncomingReportsList({ initialReports }: { initialReports: DispatchReport[] }) {
  const [sortMode, setSortMode] = useState<SortMode>("KNN_DISTANCE");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState<boolean>(true);

  const sortedReports = useMemo(() => {
    return triageReports(initialReports, sortMode);
  }, [initialReports, sortMode]);

  // Default select first report if none selected
  const activeSelectedId = selectedReportId ?? (sortedReports[0]?.id || null);

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    const elem = document.getElementById(`report-card-${id}`);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Control bar / Triage Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Urutan Penugasan Petugas
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-0.5">
            {sortMode === "KNN_DISTANCE" && "Jarak Terdekat (Algoritma KNN dari Pos Bojong Kulur)"}
            {sortMode === "SMART_PRIORITY" && "Prioritas Cerdas (Struktur Data Max-Heap & Triage)"}
            {sortMode === "NEWEST" && "Urutan Waktu Laporan (Terbaru)"}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setSortMode("KNN_DISTANCE")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                sortMode === "KNN_DISTANCE"
                  ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <MapPin className="h-3.5 w-3.5" />
              Terdekat (KNN)
            </button>
            <button
              type="button"
              onClick={() => setSortMode("SMART_PRIORITY")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                sortMode === "SMART_PRIORITY"
                  ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              Prioritas Cerdas
            </button>
            <button
              type="button"
              onClick={() => setSortMode("NEWEST")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                sortMode === "NEWEST"
                  ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Terbaru
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMap((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all active:scale-95"
          >
            <MapIcon className="h-3.5 w-3.5 text-emerald-700" />
            <span>{showMap ? "Sembunyikan Peta" : "Buka Peta"}</span>
            {showMap ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map with Pos Marker & Pin Points */}
      {showMap && sortedReports.length > 0 && (
        <div className="animate-fade-in-up">
          <OfficerDispatchMap
            reports={sortedReports}
            selectedReportId={activeSelectedId}
            onSelectReport={handleSelectReport}
            sortMode={sortMode}
          />
        </div>
      )}

      {sortedReports.length === 0 ? (
        <Card className="text-center text-sm text-slate-500 py-10 rounded-3xl">
          Belum ada laporan masuk.
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedReports.map((report, index) => {
            const rank = index + 1;
            const isSelected = report.id === activeSelectedId;

            return (
              <div
                key={report.id}
                id={`report-card-${report.id}`}
                onClick={() => setSelectedReportId(report.id)}
                className={cn(
                  "animate-fade-in-up rounded-3xl border bg-white p-5 shadow-xs transition-all cursor-pointer",
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md bg-gradient-to-r from-emerald-50/40 via-white to-slate-50"
                    : "border-slate-200 hover:border-emerald-300 hover:shadow-sm"
                )}
                style={{ animationDelay: `${Math.min(index * 40, 250)}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-extrabold text-white">
                        #{rank}
                      </span>
                      <h4 className="capitalize text-base font-extrabold text-slate-900">
                        {report.category.replace(/_/g, " ")}
                      </h4>

                      {/* Urgency Badge */}
                      {report.urgencyLevel === "TINGGI" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                          <ShieldAlert className="h-3 w-3" /> Urgensi Tinggi
                        </span>
                      )}
                      {report.urgencyLevel === "SEDANG" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                          <AlertTriangle className="h-3 w-3" /> Urgensi Sedang
                        </span>
                      )}

                      {/* Spatial Distance Badge */}
                      {typeof report.distanceKm === "number" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                          <MapPin className="h-3 w-3 text-emerald-600" /> {report.distanceKm} km dari Pos Bojong Kulur
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Pelapor: <strong>{report.user.name}</strong> ({report.user.phone}) &middot;{" "}
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
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                        Skor: {report.priorityScore}
                      </span>
                    )}
                    <StatusBadge status={report.status} />
                  </div>
                </div>

                <p className="mb-4 text-sm text-slate-700 leading-relaxed">{report.description}</p>

                <StatusTimeline logs={report.statusLogs} />
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
