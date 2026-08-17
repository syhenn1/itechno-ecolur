"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { statusLabel } from "@/lib/utils";

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

interface MapReport {
  id: string;
  category: string;
  status: string;
  lat: number;
  lng: number;
}

// Approximate center of Bojong Kulur, Gunung Putri, Kabupaten Bogor — the pilot area.
const DEFAULT_CENTER: [number, number] = [-6.44, 106.9];

export function ReportsMap({ reports }: { reports: MapReport[] }) {
  const center: [number, number] = reports.length > 0 ? [reports[0].lat, reports[0].lng] : DEFAULT_CENTER;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <MapContainer center={center} zoom={13} style={{ height: 320, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {reports.map((report) => (
          <Marker key={report.id} position={[report.lat, report.lng]} icon={iconFor(report.status)}>
            <Popup>
              <div className="text-sm">
                <div className="font-medium capitalize">{report.category.replace(/_/g, " ")}</div>
                <div className="text-slate-600">{statusLabel(report.status)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
