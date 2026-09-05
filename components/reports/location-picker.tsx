"use client";

import { useCallback } from "react";
import { MapContainer, Marker, Rectangle, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "@/lib/toast";

// Leaflet's default marker icons resolve to broken paths under most JS bundlers. Importing the
// PNGs directly from node_modules is the commonly-suggested fix, but it's unreliable across
// bundlers (broke under Turbopack here — the imported value didn't resolve to a usable URL).
// Pointing at the package's own files on a CDN, pinned to the installed version, sidesteps the
// bundler-asset-import question entirely.
const LEAFLET_VERSION = "1.9.4"; // must match the installed "leaflet" version in package.json
const defaultIcon = L.icon({
  iconUrl: `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-icon.png`,
  iconRetinaUrl: `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-icon-2x.png`,
  shadowUrl: `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/images/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Accurate bounding box around Desa Bojong Kulur, Gunung Putri, Kabupaten Bogor
const BOJONG_KULUR_BOUNDS = L.latLngBounds(
  [-6.39, 106.955], // southwest (Ciangsana / Wanaherang border)
  [-6.345, 106.995], // northeast (Villa Nusa Indah / Kali Cileungsi border)
);
const DEFAULT_CENTER: [number, number] = [-6.3687, 106.9745]; // Kantor Desa Bojong Kulur

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (!BOJONG_KULUR_BOUNDS.contains(e.latlng)) {
        toast.error("Lokasi di luar jangkauan", {
          description: "Titik laporan harus berada di area Bojong Kulur.",
        });
        return;
      }
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function LocationPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const handlePick = useCallback((lat: number, lng: number) => onChange(lat, lng), [onChange]);

  return (
    // relative z-0: Leaflet's own CSS gives its internal panes/controls z-index values up to
    // 1000 that, without an explicit z-index here to contain them in their own stacking context,
    // leak out and compare against the rest of the page — which let the map render on top of
    // fixed-position popups (toasts, the tutorial pointer) elsewhere in the app.
    <div className="relative z-0 overflow-hidden rounded-lg border border-slate-300">
      <MapContainer
        center={value ? [value.lat, value.lng] : DEFAULT_CENTER}
        zoom={15}
        minZoom={13}
        maxBounds={BOJONG_KULUR_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: 280, width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Rectangle
          bounds={BOJONG_KULUR_BOUNDS}
          pathOptions={{ color: "#059669", weight: 1, fill: false, dashArray: "6 6" }}
        />
        <ClickHandler onPick={handlePick} />
        {value && <Marker position={[value.lat, value.lng]} icon={defaultIcon} />}
      </MapContainer>
    </div>
  );
}
