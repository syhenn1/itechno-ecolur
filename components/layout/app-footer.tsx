import Link from "next/link";

/** The public landing page has its own (bigger) footer — this is the compact version shown
 *  inside the logged-in app, since without it there was no way to reach /privacy or /terms once
 *  a citizen/officer/admin was signed in. */
export function AppFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
        <span>2026 EcoLur &middot; Pemerintah Desa Bojong Kulur</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="transition-colors hover:text-slate-700">
            Kebijakan Privasi
          </Link>
          <Link href="/terms" className="transition-colors hover:text-slate-700">
            Syarat dan Ketentuan
          </Link>
        </div>
      </div>
    </footer>
  );
}
