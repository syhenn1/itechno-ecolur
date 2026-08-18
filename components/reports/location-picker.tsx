"use client";

import { useState, useCallback } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Approximate center of Bojong Kulur, Gunung Putri, Kabupaten Bogor — the pilot area. This is
// only a map default, not a precise survey point; adjust if you have the exact coordinates.
const DEFAULT_CENTER: [number, number] = [-6.44, 106.9];

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
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
  const [center] = useState<[number, number]>(value ? [value.lat, value.lng] : DEFAULT_CENTER);
  const handlePick = useCallback((lat: number, lng: number) => onChange(lat, lng), [onChange]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300">
      <MapContainer center={center} zoom={15} style={{ height: 280, width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler onPick={handlePick} />
        {value && <Marker position={[value.lat, value.lng]} icon={defaultIcon} />}
      </MapContainer>
    </div>
  );
}
