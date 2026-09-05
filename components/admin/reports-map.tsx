"use client";

import { useState, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, Rectangle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Flame, MapPin, Grid, Layers } from "lucide-react";
import { cn, statusLabel } from "@/lib/utils";
import { HeatmapLayer } from "@/components/admin/heatmap-layer";
import { QuadTree, type BoundingBox } from "@/lib/dsa/quadtree";

const STATUS_COLORS: Record<string, string> = {
  REPORTED: "#64748b",
  VERIFIED: "#2563eb",
  IN_PROGRESS: "#d97706",
  RESOLVED: "#059669",
};

function iconFor(status: string) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.REPORTED;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function clusterIcon(count: number) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:#059669;color:white;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${count}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface MapReport {
  id: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
}

// Accurate center of Desa Bojong Kulur, Gunung Putri, Kabupaten Bogor
const DEFAULT_CENTER: [number, number] = [-6.3687, 106.9745];

const BOJONG_BOUNDS: BoundingBox = {
  minLat: -6.39,
  maxLat: -6.345,
  minLng: 106.955,
  maxLng: 106.995,
};

type ViewMode = "pins" | "heatmap" | "spatial";

export function ReportsMap({ reports }: { reports: MapReport[] }) {
  const [view, setView] = useState<ViewMode>("pins");
  const center: [number, number] = reports.length > 0 ? [reports[0].lat, reports[0].lng] : DEFAULT_CENTER;

  // Build QuadTree spatial partition in memory
  const { clusters } = useMemo(() => {
    const qt = new QuadTree<MapReport>(BOJONG_BOUNDS, 3, 0, 5);
    qt.insertMany(reports);
    return { clusters: qt.getClusters(3) };
  }, [reports]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setView("pins")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 active:scale-95 active:translate-y-0",
              view === "pins" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:shadow-sm",
            )}
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Titik Laporan
          </button>
          <button
            type="button"
            onClick={() => setView("heatmap")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 active:scale-95 active:translate-y-0",
              view === "heatmap" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:shadow-sm",
            )}
          >
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            Heatmap
          </button>
          <button
            type="button"
            onClick={() => setView("spatial")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:-translate-y-0.5 active:scale-95 active:translate-y-0",
              view === "spatial" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:shadow-sm",
            )}
          >
            <Grid className="h-3.5 w-3.5" aria-hidden="true" />
            Klaster wilayah
          </button>
        </div>

        {view === "spatial" && (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
            <Layers className="h-3 w-3" /> {clusters.length} klaster
          </span>
        )}
      </div>

      {/* relative z-0: contains Leaflet's internal pane/control z-index (up to 1000) inside its
          own stacking context, so the map can't render on top of fixed-position popups elsewhere
          in the app (see components/reports/location-picker.tsx for the full explanation). */}
      <div className="relative z-0 overflow-hidden rounded-lg border border-slate-300">
        <MapContainer center={center} zoom={13} style={{ height: 350, width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {view === "pins" &&
            reports.map((report) => (
              <Marker key={report.id} position={[report.lat, report.lng]} icon={iconFor(report.status)}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-medium capitalize">{report.category.replace(/_/g, " ")}</div>
                    <div className="text-slate-600">{statusLabel(report.status)}</div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {view === "heatmap" && (
            <HeatmapLayer
              points={reports.map((r) => ({
                lat: r.lat,
                lng: r.lng,
                intensity: r.status === "RESOLVED" ? 0.35 : 0.85,
              }))}
            />
          )}

          {view === "spatial" &&
            clusters.map((cluster) => {
              const bounds: [[number, number], [number, number]] = [
                [cluster.box.minLat, cluster.box.minLng],
                [cluster.box.maxLat, cluster.box.maxLng],
              ];

              const color =
                cluster.count > 5
                  ? "#e11d48"
                  : cluster.count > 2
                    ? "#f59e0b"
                    : "#10b981";

              return (
                <div key={cluster.id}>
                  <Rectangle
                    bounds={bounds}
                    pathOptions={{
                      color,
                      weight: 1.5,
                      fillColor: color,
                      fillOpacity: 0.15,
                      dashArray: "4, 4",
                    }}
                  />
                  <Marker position={cluster.center} icon={clusterIcon(cluster.count)}>
                    <Popup>
                      <div className="text-xs space-y-1">
                        <div className="font-semibold text-slate-900">
                          Kuadran Spasial (Kedalaman: {cluster.depth})
                        </div>
                        <div className="text-slate-600">
                          Total Laporan di Area Ini: <span className="font-bold">{cluster.count}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Bounds: [{cluster.box.minLat.toFixed(3)}, {cluster.box.minLng.toFixed(3)}] s.d. [
                          {cluster.box.maxLat.toFixed(3)}, {cluster.box.maxLng.toFixed(3)}]
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              );
            })}
        </MapContainer>
      </div>

      {view === "heatmap" && (
        <p className="text-xs text-slate-500">
          Area yang lebih merah/padat menandakan konsentrasi laporan lebih tinggi. Laporan yang belum selesai
          diberi bobot lebih besar daripada yang sudah selesai.
        </p>
      )}

      {view === "spatial" && (
        <p className="text-xs text-slate-500">
          <strong>Struktur Data 2D QuadTree:</strong> Mempartisi ruang geografis Bojong Kulur menjadi 4 kuadran rekursif.
          Warna kotak menandakan kepadatan laporan (Hijau: Rendah, Oranye: Sedang, Merah: Hotspot).
        </p>
      )}
    </div>
  );
}
