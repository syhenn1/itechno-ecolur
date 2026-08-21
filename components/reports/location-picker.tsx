"use client";

import { useCallback } from "react";
import { MapContainer, Marker, Rectangle, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

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

// Approximate bounding box around Bojong Kulur, Gunung Putri, Kabupaten Bogor — the pilot area.
// This is a rough hand-picked box (~4km across), not a surveyed kelurahan boundary — tighten it
// with real GIS/administrative boundary data if precise coverage matters.
const BOJONG_KULUR_BOUNDS = L.latLngBounds(
  [-6.46, 106.88], // southwest
  [-6.42, 106.92], // northeast
);
const DEFAULT_CENTER: [number, number] = [-6.44, 106.9];

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
    <div className="overflow-hidden rounded-lg border border-slate-300">
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
