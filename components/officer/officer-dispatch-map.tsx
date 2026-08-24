"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Circle,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Building2, Navigation, MapPin, ShieldAlert, AlertTriangle, ArrowUpRight } from "lucide-react";
import {
  OFFICER_BASE_COORDINATES,
  type DispatchReport,
  type SortMode,
} from "@/lib/spatial/officer-dispatch";
import { cn, statusLabel } from "@/lib/utils";

// Officer Base Custom Icon
const officerBaseIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:36px;
      height:36px;
      border-radius:12px;
      background:linear-gradient(135deg, #28430a, #507b00);
      color:white;
      border:2.5px solid #ffffff;
      box-shadow:0 4px 12px rgba(40,67,10,0.45);
      font-size:16px;
      font-weight:900;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21h18"/>
        <path d="M9 8h1"/>
        <path d="M9 12h1"/>
        <path d="M9 16h1"/>
        <path d="M14 8h1"/>
        <path d="M14 12h1"/>
        <path d="M14 16h1"/>
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function reportRankIcon(rank: number, isSelected: boolean, urgency?: string) {
  let bg = "#3b82f6"; // default blue
  let glow = "rgba(59,130,246,0.35)";

  if (urgency === "TINGGI") {
    bg = "#e11d48"; // rose red
    glow = "rgba(225,29,72,0.45)";
  } else if (urgency === "SEDANG") {
    bg = "#d97706"; // amber
    glow = "rgba(217,119,6,0.4)";
  } else if (rank === 1) {
    bg = "#507b00"; // leaf eco green for #1 closest
    glow = "rgba(80,123,0,0.5)";
  }

  const size = isSelected ? 34 : 28;
  const border = isSelected ? "3px solid #ffffff" : "2px solid #ffffff";
  const scale = isSelected ? "transform:scale(1.15);" : "";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:${size}px;
        height:${size}px;
        border-radius:9999px;
        background:${bg};
        color:white;
        font-size:${isSelected ? "13px" : "11px"};
        font-weight:800;
        border:${border};
        box-shadow:0 3px 10px ${glow};
        ${scale}
        transition:all 0.2s ease;
      ">
        #${rank}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapPanController({ targetCenter }: { targetCenter: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (targetCenter) {
      map.flyTo(targetCenter, 15, { duration: 1.2 });
    }
  }, [map, targetCenter]);
  return null;
}

interface OfficerDispatchMapProps {
  reports: DispatchReport[];
  selectedReportId: string | null;
  onSelectReport: (id: string) => void;
  sortMode: SortMode;
}

export function OfficerDispatchMap({
  reports,
  selectedReportId,
  onSelectReport,
  sortMode,
}: OfficerDispatchMapProps) {
  const selectedReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) ?? (reports.length > 0 ? reports[0] : null);
  }, [reports, selectedReportId]);

  const targetCenter: [number, number] | null = selectedReport
    ? [selectedReport.lat, selectedReport.lng]
    : OFFICER_BASE_COORDINATES;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
      {/* Map Header Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-slate-50 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-eco-forest to-eco-leaf text-white shadow-xs">
            <Navigation className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-extrabold text-slate-900">
                Peta Spasial Penugasan Petugas (KNN)
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                Live GPS
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Pos Acuan: <strong>Kantor Desa Bojong Kulur</strong> ({OFFICER_BASE_COORDINATES[0]}, {OFFICER_BASE_COORDINATES[1]})
            </p>
          </div>
        </div>

        {selectedReport && (
          <div className="flex items-center gap-2 text-xs bg-white border border-emerald-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="font-bold text-slate-700">Fokus: #{reports.findIndex(r => r.id === selectedReport.id) + 1}</span>
            <span className="text-emerald-800 font-extrabold font-mono">
              {selectedReport.distanceKm} km dari Pos
            </span>
          </div>
        )}
      </div>

      {/* Interactive Map View */}
      <div className="h-[360px] w-full relative z-0">
        <MapContainer
          center={OFFICER_BASE_COORDINATES}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapPanController targetCenter={targetCenter} />

          {/* 1 KM & 2 KM Radar Circles from Officer Base */}
          <Circle
            center={OFFICER_BASE_COORDINATES}
            radius={1000}
            pathOptions={{
              color: "#507b00",
              fillColor: "#95c22b",
              fillOpacity: 0.06,
              weight: 1.5,
              dashArray: "4 4",
            }}
          />
          <Circle
            center={OFFICER_BASE_COORDINATES}
            radius={2000}
            pathOptions={{
              color: "#64748b",
              fillColor: "#64748b",
              fillOpacity: 0.03,
              weight: 1,
              dashArray: "6 6",
            }}
          />

          {/* Officer Base Post Marker */}
          <Marker position={OFFICER_BASE_COORDINATES} icon={officerBaseIcon}>
            <Popup>
              <div className="p-1 text-center">
                <div className="font-extrabold text-emerald-950 text-xs flex items-center justify-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                  Pos Petugas Bojong Kulur
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Titik Awal Penghitungan Jarak KNN
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Connected Polyline from Pos to Selected Report */}
          {selectedReport && (
            <Polyline
              positions={[OFFICER_BASE_COORDINATES, [selectedReport.lat, selectedReport.lng]]}
              pathOptions={{
                color: "#507b00",
                weight: 3,
                dashArray: "6 8",
                opacity: 0.85,
              }}
            >
              <Tooltip sticky>
                <span className="text-xs font-bold font-mono">
                  Garis Jarak KNN: {selectedReport.distanceKm} km
                </span>
              </Tooltip>
            </Polyline>
          )}

          {/* Report Markers with Rank Badge (#1, #2, #3...) */}
          {reports.map((report, idx) => {
            const rank = idx + 1;
            const isSelected = report.id === selectedReport?.id;

            return (
              <Marker
                key={report.id}
                position={[report.lat, report.lng]}
                icon={reportRankIcon(rank, isSelected, report.urgencyLevel)}
                eventHandlers={{
                  click: () => onSelectReport(report.id),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 min-w-[180px]">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
                      <span className="font-extrabold text-xs text-slate-900 capitalize">
                        #{rank} {report.category.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {report.distanceKm} km
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                      {report.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Status: <strong>{statusLabel(report.status)}</strong></span>
                      <button
                        type="button"
                        onClick={() => onSelectReport(report.id)}
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>Pilih</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span>#1 Terdekat (KNN)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-600" />
            <span>Urgensi Tinggi</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>Urgensi Sedang</span>
          </span>
        </div>
        <span className="text-slate-400 font-medium">Klik nomor pin pada peta untuk memilih laporan</span>
      </div>
    </div>
  );
}
