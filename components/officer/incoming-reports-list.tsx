"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Zap,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  Search,
  Navigation,
  ExternalLink,
  ChevronRight,
  User,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
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
      <div className="flex h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
        Memuat Peta Spasial Petugas...
      </div>
    ),
  }
);

interface OfficerStats {
  total: number;
  reported: number;
  inProgress: number;
  resolved: number;
}

export function IncomingReportsList({
  initialReports,
  stats,
}: {
  initialReports: DispatchReport[];
  stats: OfficerStats;
}) {
  const [sortMode, setSortMode] = useState<SortMode>("KNN_DISTANCE");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const sortedReports = useMemo(() => {
    return triageReports(initialReports, sortMode);
  }, [initialReports, sortMode]);

  // Filtered by category and search
  const filteredReports = useMemo(() => {
    return sortedReports.filter((r) => {
      const matchCat = categoryFilter === "ALL" || r.category === categoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [sortedReports, categoryFilter, searchQuery]);

  // Selected report object
  const activeReport = useMemo(() => {
    if (selectedReportId) {
      const found = filteredReports.find((r) => r.id === selectedReportId) || sortedReports.find((r) => r.id === selectedReportId);
      if (found) return found;
    }
    return filteredReports[0] || null;
  }, [selectedReportId, filteredReports, sortedReports]);

  const nearestDistance = useMemo(() => {
    if (sortedReports.length === 0) return "-";
    const min = sortedReports[0].distanceKm;
    return min !== undefined ? `${min.toFixed(2)} km` : "-";
  }, [sortedReports]);

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Antrean Baru</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-900 font-mono">
            {stats.reported}
          </div>
          <div className="mt-1 text-[11px] font-medium text-amber-700">Perlu Verifikasi Segera</div>
        </div>

        <div className="rounded-3xl border border-sky-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sedang Ditangani</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-sky-900 font-mono">
            {stats.inProgress}
          </div>
          <div className="mt-1 text-[11px] font-medium text-sky-700">Petugas di Lapangan</div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selesai Ditangani</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
            {stats.resolved}
          </div>
          <div className="mt-1 text-[11px] font-medium text-emerald-700">Laporan Tuntas</div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jarak Terdekat</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Navigation className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {nearestDistance}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500">Dari Pos Desa Bojong Kulur</div>
        </div>
      </div>

      {/* Control Bar: Algoritma Triase & Filter Kategori */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Sorting Buttons */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mode Triase &amp; Algoritma Spasial:
            </div>
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSortMode("KNN_DISTANCE")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer",
                  sortMode === "KNN_DISTANCE"
                    ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
                Terdekat (KNN)
              </button>
              <button
                type="button"
                onClick={() => setSortMode("SMART_PRIORITY")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer",
                  sortMode === "SMART_PRIORITY"
                    ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <Zap className="h-3.5 w-3.5" />
                Prioritas Cerdas (Max-Heap)
              </button>
              <button
                type="button"
                onClick={() => setSortMode("NEWEST")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer",
                  sortMode === "NEWEST"
                    ? "bg-gradient-to-r from-eco-forest to-eco-leaf text-white shadow-xs"
                    : "text-slate-600 hover:bg-white hover:text-slate-900"
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                Waktu Laporan (Terbaru)
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi / nama warga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          {[
            { id: "ALL", label: "Semua Kategori" },
            { id: "jalan_rusak", label: "Jalan Rusak" },
            { id: "sampah", label: "Tumpukan Sampah" },
            { id: "drainase", label: "Saluran Drainase" },
            { id: "penerangan_jalan", label: "Lampu Jalan (PJU)" },
            { id: "fasilitas_umum", label: "Fasilitas Umum" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                categoryFilter === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split-Screen Command Center */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Interactive Map & Queue List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dispatch Interactive Map */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black">
                  <Navigation className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-extrabold text-slate-900">Peta Spasial Penugasan Petugas</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {filteredReports.length} Titik Laporan Terpetakan
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <OfficerDispatchMap
                reports={filteredReports}
                sortMode={sortMode}
                selectedReportId={activeReport?.id || null}
                onSelectReport={(id) => setSelectedReportId(id)}
              />
            </div>
          </div>

          {/* Queue Cards List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-extrabold text-slate-900">
                Daftar Antrean Penanganan ({filteredReports.length})
              </h3>
              <span className="text-xs text-slate-500">Klik kartu untuk melihat rincian di terminal</span>
            </div>

            {filteredReports.length === 0 ? (
              <Card className="text-center py-12 text-xs text-slate-500">
                Tidak ada laporan yang sesuai dengan filter pencarian saat ini.
              </Card>
            ) : (
              filteredReports.map((report, index) => {
                const isSelected = activeReport?.id === report.id;
                const distanceText =
                  report.distanceKm !== undefined ? `${report.distanceKm.toFixed(2)} km dari Pos` : null;

                return (
                  <div
                    key={report.id}
                    id={`report-card-${report.id}`}
                    onClick={() => setSelectedReportId(report.id)}
                    className={cn(
                      "cursor-pointer rounded-3xl border p-4 transition-all",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/30"
                        : "border-slate-200 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                            isSelected
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          #{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold capitalize text-slate-900">
                              {report.category.replace(/_/g, " ")}
                            </h4>
                            <StatusBadge status={report.status} />
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                            {distanceText && (
                              <span className="font-bold text-emerald-800 flex items-center gap-1 font-mono">
                                <MapPin className="h-3 w-3" /> {distanceText}
                              </span>
                            )}
                            <span>&middot;</span>
                            <span>
                              {new Date(report.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ChevronRight
                        className={cn(
                          "h-5 w-5 transition-transform",
                          isSelected ? "text-emerald-700 translate-x-1" : "text-slate-300"
                        )}
                      />
                    </div>

                    <p className="mt-2.5 text-xs text-slate-700 line-clamp-2 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-slate-100">
                      {report.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Task Terminal & Execution (5 Cols Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {activeReport ? (
            <Card className="border-slate-200 bg-white shadow-md rounded-3xl overflow-hidden animate-fade-in-up p-0">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex flex-col gap-2.5">
                {/* Row 1: Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                    Terminal Eksekusi Petugas
                  </span>
                  <StatusBadge status={activeReport.status} />
                </div>

                {/* Row 2: Report Category Title */}
                <h3 className="text-xl font-black capitalize text-white tracking-tight leading-snug">
                  {activeReport.category.replace(/_/g, " ")}
                </h3>

                {/* Row 3: Meta Date & Distance */}
                <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(activeReport.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {activeReport.distanceKm !== undefined && (
                    <span className="flex items-center gap-1 font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-[11px]">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      {activeReport.distanceKm.toFixed(2)} km dari Pos
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Photo if available */}
                {activeReport.photoUrl && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeReport.photoUrl}
                      alt="Foto Lampiran"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}

                {/* Citizen Information & Direct Contact Buttons */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-700" />
                    <span>Informasi Warga Pelapor</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {activeReport.user?.name || "Warga Anonim"}
                      </div>
                      <div className="font-mono text-slate-500">
                        {activeReport.user?.phone || "-"}
                      </div>
                    </div>

                    {activeReport.user?.phone && (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${activeReport.user.phone.replace(/^0/, "62")}?text=Halo%20${encodeURIComponent(activeReport.user.name || "Bapak/Ibu")},%20saya%20petugas%20lapangan%20Desa%20Bojong%20Kulur%20terkait%20laporan%20${encodeURIComponent(activeReport.category)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${activeReport.user.phone}`}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-200 p-1.5 text-slate-700 hover:bg-slate-300 transition-colors"
                          title="Telepon Warga"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Deskripsi Detail Masalah:
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                    {activeReport.description}
                  </p>
                </div>

                {/* GPS Coordinates & Google Maps Link */}
                <div className="flex items-center justify-between text-xs bg-slate-100/70 p-3 rounded-2xl border border-slate-200">
                  <div className="font-mono text-slate-600 text-[11px]">
                    GPS: {activeReport.lat.toFixed(5)}, {activeReport.lng.toFixed(5)}
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeReport.lat},${activeReport.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline"
                  >
                    <span>Navigasi Rute</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Fast Action Status Form */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Tindak Lanjut &amp; Update Status:</span>
                  </div>
                  <StatusUpdateForm
                    reportId={activeReport.id}
                    currentStatus={activeReport.status}
                  />
                </div>

                {/* Audit Timeline */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Riwayat Audit Tindakan:
                  </div>
                  <StatusTimeline logs={activeReport.statusLogs} />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-xs text-slate-500 rounded-3xl">
              Pilih salah satu laporan di sebelah kiri untuk membuka terminal penanganan petugas.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
