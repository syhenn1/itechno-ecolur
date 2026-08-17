/**
 * Minimal in-memory fixed-window rate limiter — enough to blunt naive spam on citizen-submitted
 * endpoints during the competition demo. Each serverless instance keeps its own memory, so this
 * does NOT enforce a single global limit across concurrent Vercel instances. Swap for a shared
 * store (e.g. Upstash Redis) before relying on this for real abuse prevention.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
