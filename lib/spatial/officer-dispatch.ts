import { QuadTree, haversineDistance, type SpatialPoint, type BoundingBox } from "../dsa/quadtree";
import { PriorityQueue } from "../dsa/priority-queue";
import type { ReportStatus } from "@prisma/client";

// Reference base coordinates for Bojong Kulur Officer Dispatch Post (Kantor Desa)
export const OFFICER_BASE_COORDINATES: [number, number] = [-6.44, 106.9];

// Bounding box covering Bojong Kulur and surroundings
export const BOJONG_KULUR_BOUNDING_BOX: BoundingBox = {
  minLat: -6.48,
  maxLat: -6.40,
  minLng: 106.85,
  maxLng: 106.95,
};

export const CATEGORY_URGENCY_WEIGHTS: Record<string, number> = {
  jalan_rusak: 85,
  penerangan_jalan: 75,
  drainase: 70,
  sampah: 60,
  fasilitas_umum: 50,
  lainnya: 40,
};

export interface DispatchReport extends SpatialPoint {
  id: string;
  category: string;
  description: string;
  photoUrl: string | null;
  status: ReportStatus;
  createdAt: Date;
  user: {
    name: string;
    phone: string;
  };
  statusLogs: {
    id: string;
    status: ReportStatus;
    notes: string | null;
    updatedAt: Date;
    officer?: { name: string } | null;
  }[];
  // Computed spatial & triage properties
  distanceKm?: number;
  priorityScore?: number;
  urgencyLevel?: "TINGGI" | "SEDANG" | "NORMAL";
}

/**
 * Builds a QuadTree index from a collection of reports.
 */
export function buildReportsQuadTree(
  reports: DispatchReport[],
  boundary: BoundingBox = BOJONG_KULUR_BOUNDING_BOX,
): QuadTree<DispatchReport> {
  const quadTree = new QuadTree<DispatchReport>(boundary, 4, 0, 6);
  quadTree.insertMany(reports);
  return quadTree;
}

/**
 * Calculates dynamic urgency priority score:
 * Base Category Weight + (Hours Waiting * 1.5) - (Distance in Km * 4) + Unresolved Bonus
 */
export function computeReportPriorityScore(
  report: DispatchReport,
  baseLat = OFFICER_BASE_COORDINATES[0],
  baseLng = OFFICER_BASE_COORDINATES[1],
): { score: number; distanceKm: number; urgencyLevel: "TINGGI" | "SEDANG" | "NORMAL" } {
  const distanceKm = haversineDistance(baseLat, baseLng, report.lat, report.lng);
  const baseWeight = CATEGORY_URGENCY_WEIGHTS[report.category] ?? 40;

  const hoursElapsed = Math.max(
    0,
    (Date.now() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60),
  );
  const timeBonus = Math.min(hoursElapsed * 1.5, 50); // cap at +50

  const statusBonus =
    report.status === "REPORTED" ? 30 : report.status === "VERIFIED" ? 20 : 0;

  const distancePenalty = distanceKm * 4;

  const score = Math.round(baseWeight + timeBonus + statusBonus - distancePenalty);

  let urgencyLevel: "TINGGI" | "SEDANG" | "NORMAL" = "NORMAL";
  if (score >= 100 || baseWeight >= 80) {
    urgencyLevel = "TINGGI";
  } else if (score >= 65) {
    urgencyLevel = "SEDANG";
  }

  return { score, distanceKm, urgencyLevel };
}

export type SortMode = "SMART_PRIORITY" | "KNN_DISTANCE" | "NEWEST";

/**
 * Sorts and triages reports using Data Structures (QuadTree & PriorityQueue).
 */
export function triageReports(
  reports: DispatchReport[],
  sortMode: SortMode = "SMART_PRIORITY",
  baseLat = OFFICER_BASE_COORDINATES[0],
  baseLng = OFFICER_BASE_COORDINATES[1],
): DispatchReport[] {
  if (reports.length === 0) return [];

  // 1. Enrich reports with spatial distance & priority scores
  const enriched: DispatchReport[] = reports.map((r) => {
    const { score, distanceKm, urgencyLevel } = computeReportPriorityScore(
      r,
      baseLat,
      baseLng,
    );
    return {
      ...r,
      distanceKm: Math.round(distanceKm * 100) / 100,
      priorityScore: score,
      urgencyLevel,
    };
  });

  if (sortMode === "SMART_PRIORITY") {
    // Max-Heap: highest priority score comes first
    return PriorityQueue.topK(
      enriched,
      enriched.length,
      (a, b) => (a.priorityScore ?? 0) - (b.priorityScore ?? 0),
    );
  }

  if (sortMode === "KNN_DISTANCE") {
    // Min-Heap: nearest distance from base comes first
    return PriorityQueue.topK(
      enriched,
      enriched.length,
      (a, b) => (b.distanceKm ?? 0) - (a.distanceKm ?? 0),
    );
  }

  // Fallback: Newest
  return [...enriched].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
