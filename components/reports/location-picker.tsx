"use client";

import { useState, useCallback } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet's default marker icons resolve to broken paths under most JS bundlers — re-point them
// at the package's own bundled images (Next.js turns these imports into hashed static URLs).
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
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
