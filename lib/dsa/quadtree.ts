import { PriorityQueue } from "./priority-queue";

/**
 * 2D Spatial Axis-Aligned Bounding Box (AABB) using Latitude & Longitude.
 */
export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface SpatialPoint {
  lat: number;
  lng: number;
}

export interface SpatialCluster<T extends SpatialPoint> {
  id: string;
  box: BoundingBox;
  center: [number, number];
  count: number;
  points: T[];
  depth: number;
}

export interface NearestResult<T extends SpatialPoint> {
  item: T;
  distanceKm: number;
}

/**
 * Calculate Great-Circle Distance (Haversine formula) in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function containsPoint(box: BoundingBox, lat: number, lng: number): boolean {
  return (
    lat >= box.minLat &&
    lat <= box.maxLat &&
    lng >= box.minLng &&
    lng <= box.maxLng
  );
}

export function intersectsBox(a: BoundingBox, b: BoundingBox): boolean {
  return !(
    a.maxLat < b.minLat ||
    a.minLat > b.maxLat ||
    a.maxLng < b.minLng ||
    a.minLng > b.maxLng
  );
}

/**
 * 2D Spatial QuadTree.
 * Partitions coordinate space into 4 quadrants (NW, NE, SW, SE).
 * Time complexity:
 * - Insertion: O(log N) average
 * - Range Query: O(log N + K)
 * - Nearest Neighbor: O(log N)
 */
export class QuadTree<T extends SpatialPoint> {
  readonly boundary: BoundingBox;
  readonly capacity: number;
  readonly depth: number;
  readonly maxDepth: number;

  points: T[] = [];
  divided = false;

  northWest?: QuadTree<T>;
  northEast?: QuadTree<T>;
  southWest?: QuadTree<T>;
  southEast?: QuadTree<T>;

  constructor(
    boundary: BoundingBox,
    capacity = 4,
    depth = 0,
    maxDepth = 8,
  ) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.depth = depth;
    this.maxDepth = maxDepth;
  }

  insert(point: T): boolean {
    if (!containsPoint(this.boundary, point.lat, point.lng)) {
      return false;
    }

    if (this.points.length < this.capacity || this.depth >= this.maxDepth) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northWest!.insert(point) ||
      this.northEast!.insert(point) ||
      this.southWest!.insert(point) ||
      this.southEast!.insert(point)
    );
  }

  insertMany(points: T[]): number {
    let inserted = 0;
    for (const p of points) {
      if (this.insert(p)) inserted++;
    }
    return inserted;
  }

  private subdivide(): void {
    const { minLat, maxLat, minLng, maxLng } = this.boundary;
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;

    this.northWest = new QuadTree(
      { minLat: midLat, maxLat, minLng, maxLng: midLng },
      this.capacity,
      this.depth + 1,
      this.maxDepth,
    );
    this.northEast = new QuadTree(
      { minLat: midLat, maxLat, minLng: midLng, maxLng },
      this.capacity,
      this.depth + 1,
      this.maxDepth,
    );
    this.southWest = new QuadTree(
      { minLat, maxLat: midLat, minLng, maxLng: midLng },
      this.capacity,
      this.depth + 1,
      this.maxDepth,
    );
    this.southEast = new QuadTree(
      { minLat, maxLat: midLat, minLng: midLng, maxLng },
      this.capacity,
      this.depth + 1,
      this.maxDepth,
    );

    this.divided = true;

    // Re-insert existing points to child nodes for spatial purity
    const oldPoints = this.points;
    this.points = [];
    for (const pt of oldPoints) {
      this.insert(pt);
    }
  }

  queryRange(range: BoundingBox, found: T[] = []): T[] {
    if (!intersectsBox(this.boundary, range)) {
      return found;
    }

    for (const p of this.points) {
      if (containsPoint(range, p.lat, p.lng)) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northWest!.queryRange(range, found);
      this.northEast!.queryRange(range, found);
      this.southWest!.queryRange(range, found);
      this.southEast!.queryRange(range, found);
    }

    return found;
  }

  queryRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
  ): NearestResult<T>[] {
    // 1 deg latitude is approx 111km
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180));

    const approxBox: BoundingBox = {
      minLat: centerLat - latDelta,
      maxLat: centerLat + latDelta,
      minLng: centerLng - lngDelta,
      maxLng: centerLng + lngDelta,
    };

    const candidates = this.queryRange(approxBox);
    const results: NearestResult<T>[] = [];

    for (const item of candidates) {
      const distanceKm = haversineDistance(
        centerLat,
        centerLng,
        item.lat,
        item.lng,
      );
      if (distanceKm <= radiusKm) {
        results.push({ item, distanceKm });
      }
    }

    return results.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  findKNearest(
    targetLat: number,
    targetLng: number,
    k: number,
  ): NearestResult<T>[] {
    const allPoints = this.getAllPoints();
    if (allPoints.length === 0 || k <= 0) return [];

    const scored = allPoints.map((item) => ({
      item,
      distanceKm: haversineDistance(targetLat, targetLng, item.lat, item.lng),
    }));

    // Min-Heap based Top-K (nearest = smallest distance)
    return PriorityQueue.topK(scored, k, (a, b) => b.distanceKm - a.distanceKm);
  }

  getAllPoints(found: T[] = []): T[] {
    found.push(...this.points);
    if (this.divided) {
      this.northWest!.getAllPoints(found);
      this.northEast!.getAllPoints(found);
      this.southWest!.getAllPoints(found);
      this.southEast!.getAllPoints(found);
    }
    return found;
  }

  /**
   * Decomposes the QuadTree into spatial clusters for visualization on a map.
   */
  getClusters(targetDepth = 3): SpatialCluster<T>[] {
    const clusters: SpatialCluster<T>[] = [];

    const traverse = (node: QuadTree<T>, currentDepth: number) => {
      const allPoints = node.getAllPoints();
      if (allPoints.length === 0) return;

      if (currentDepth === targetDepth || !node.divided) {
        const centerLat =
          (node.boundary.minLat + node.boundary.maxLat) / 2;
        const centerLng =
          (node.boundary.minLng + node.boundary.maxLng) / 2;

        clusters.push({
          id: `cluster-${node.boundary.minLat.toFixed(4)}-${node.boundary.minLng.toFixed(4)}-${currentDepth}`,
          box: node.boundary,
          center: [centerLat, centerLng],
          count: allPoints.length,
          points: allPoints,
          depth: currentDepth,
        });
        return;
      }

      if (node.divided) {
        traverse(node.northWest!, currentDepth + 1);
        traverse(node.northEast!, currentDepth + 1);
        traverse(node.southWest!, currentDepth + 1);
        traverse(node.southEast!, currentDepth + 1);
      }
    };

    traverse(this, 0);
    return clusters;
  }
}
