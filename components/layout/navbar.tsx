import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { getLevelDef } from "@/lib/gamification-data";

interface NavLink {
  href: string;
  label: string;
}

const LINK_CLASSES =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95";

export function Navbar({
  name,
  roleLabel,
  links,
  level,
}: {
  name: string;
  roleLabel: string;
  links: NavLink[];
  /** Citizen gamification level — omit for officer/admin, who don't earn XP. */
  level?: number;
}) {
  const levelDef = typeof level === "number" ? getLevelDef(level) : null;

  return (
    <header className="animate-fade-in-up sticky top-0 z-30 border-b border-emerald-100 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-slate-900 transition-transform active:scale-95"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/Lambang_Kabupaten_Bogor.svg.webp"
              alt="Logo Kab. Bogor"
              className="h-7 w-7 object-contain drop-shadow-xs"
            />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold text-emerald-800 tracking-tight">EcoLur</span>
              <span className="text-[10px] font-medium text-slate-500">Bojong Kulur &middot; Bogor</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={LINK_CLASSES}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile & Level Badge */}
        <div className="flex items-center gap-3">
          {levelDef && (
            <Link
              href="/badges"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold shadow-xs transition-all hover:border-emerald-300 hover:bg-emerald-50 active:scale-95"
              title={`Level ${levelDef.level} - ${levelDef.name}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={levelDef.badgeIcon}
                alt={levelDef.badgeName}
                className="h-5 w-5 object-contain"
              />
              <span className="text-slate-800 font-medium">Lv. {levelDef.level}</span>
              <span className="hidden md:inline text-[11px] font-bold text-emerald-700">
                {levelDef.badgeName}
              </span>
            </Link>
          )}

          <div className="hidden text-right sm:block">
            <div className="text-sm font-semibold text-slate-900 leading-tight">{name}</div>
            <div className="text-[11px] text-slate-500 font-medium">{roleLabel}</div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Keluar"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-95"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline text-xs font-medium">Keluar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Mobile nav bar */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-1.5 sm:hidden">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={`whitespace-nowrap text-xs ${LINK_CLASSES}`}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
