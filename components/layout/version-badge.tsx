// Vercel automatically sets these at build time — no env var configuration needed on your end.
// Locally (not on Vercel) they're undefined, so this falls back to "local dev".
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA;
const VERCEL_ENV = process.env.VERCEL_ENV; // "production" | "preview" | "development" | undefined

export function VersionBadge() {
  const label = COMMIT_SHA ? `${VERCEL_ENV ?? "deploy"} · ${COMMIT_SHA.slice(0, 7)}` : "local dev";

  return (
    <span className="pointer-events-none fixed bottom-2 left-2 z-50 select-none font-mono text-[10px] text-slate-400">
      {label}
    </span>
  );
}
