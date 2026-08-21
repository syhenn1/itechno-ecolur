"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

interface HeatPoint {
  lat: number;
  lng: number;
  /** 0-1, defaults to 0.5 — bump reports that are still open so hotspots reflect current
   *  problems, not just historical volume. */
  intensity?: number;
}

export function HeatmapLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return undefined;

    const heatLayer = L.heatLayer(
      points.map((p) => [p.lat, p.lng, p.intensity ?? 0.5]),
      { radius: 28, blur: 22, maxZoom: 17 },
    );
    heatLayer.addTo(map);

    return () => {
      heatLayer.remove();
    };
  }, [map, points]);

  return null;
}
