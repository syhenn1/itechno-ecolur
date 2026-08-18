import { NextResponse } from "next/server";

/**
 * Wraps a route handler so any uncaught throw (missing env var, unreachable DB, unexpected
 * bug — anything) still comes back as a valid JSON error response instead of an empty/broken
 * body. Without this, a thrown error inside a route handler surfaces to the client as
 * "Unexpected end of JSON input" from `res.json()`, which points nowhere useful — the real
 * error only shows up in the `next dev` terminal log.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("[api] Unhandled error:", error);
      return NextResponse.json({ error: "Terjadi kesalahan pada server. Coba lagi sebentar lagi." }, { status: 500 });
    }
  };
}
