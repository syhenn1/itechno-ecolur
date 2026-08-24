"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  MapPin,
  Trophy,
  Sparkles,
  BarChart3,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { getLevelDef } from "@/lib/gamification-data";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

function getNavIcon(href: string) {
  if (href.includes("/energy")) return Zap;
  if (href.includes("/report")) return MapPin;
  if (href.includes("/badges")) return Trophy;
  if (href.includes("/ask-ai")) return Sparkles;
  if (href.includes("/dashboard")) return BarChart3;
  if (href.includes("/incoming-reports")) return ShieldAlert;
  return Zap;
}

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
  const pathname = usePathname();
  const levelDef = typeof level === "number" ? getLevelDef(level) : null;

  return (
    <>
      {/* Top Main Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 border-b border-emerald-100/90 bg-white/95 backdrop-blur-xl shadow-2xs">
        {/* Top Ambient Eco Color Accent Strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-eco-forest via-eco-lime to-eco-leaf" />

        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Side: Exact Clean 2-Line Legacy Brand Block */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 transition-transform active:scale-95"
          >
            {/* Pak Eko Mascot Logo */}
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/ecolur-logo.png"
                alt="Logo EcoLur"
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shadow-xs ring-1 ring-emerald-600/30"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2 items-center justify-center rounded-full bg-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-base sm:text-lg font-bold text-emerald-800 tracking-tight">EcoLur</span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">Bojong Kulur &middot; Bogor</span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1.5">
            {links.map((link) => {
              const Icon = getNavIcon(link.href);
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all duration-150 active:scale-95",
                    isActive
                      ? "bg-gradient-to-r from-eco-forest via-eco-leaf to-eco-lime text-white shadow-xs font-extrabold ring-1 ring-emerald-700/20"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-yellow-300" : "text-slate-400")} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Citizen Level Badge Pill */}
            {levelDef && (
              <Link
                href="/badges"
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-white to-amber-50/60 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-extrabold shadow-2xs transition-all hover:border-amber-400 hover:shadow-xs active:scale-95 cursor-pointer"
                title={`Level ${levelDef.level} - ${levelDef.name}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={levelDef.badgeIcon}
                  alt={levelDef.badgeName}
                  className="h-4 w-4 sm:h-5 sm:w-5 object-contain drop-shadow-2xs animate-bounce-slow"
                />
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-mono text-slate-900 text-xs font-black">Lv.{levelDef.level}</span>
                  <span className="hidden lg:inline text-[11px] font-black text-amber-800">
                    {levelDef.badgeName}
                  </span>
                </div>
              </Link>
            )}

            {/* User Name & Role Pill (Desktop) */}
            <div className="hidden sm:flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-emerald-600 text-[11px] font-black text-white uppercase shadow-2xs">
                {name ? name.charAt(0) : "W"}
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-extrabold text-slate-900 truncate max-w-[120px]">{name}</div>
                <div className="text-[10px] font-semibold text-emerald-700">{roleLabel}</div>
              </div>
            </div>

            {/* Logout Form Button */}
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Keluar"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 sm:px-3 sm:py-1.5 text-xs font-bold text-slate-600 shadow-2xs transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-700 active:scale-95 cursor-pointer"
              >
                <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Generous Tall Padding & Comfortable Reach) */}
      <nav
        aria-label="Navigasi Utama Ponsel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-2xl px-2 pt-2.5 pb-6 sm:pb-7"
      >
        <div className="mx-auto flex max-w-md items-center justify-around">
          {links.map((link) => {
            const Icon = getNavIcon(link.href);
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-1 px-2.5 min-w-[60px] transition-all active:scale-95 outline-none focus:outline-none focus-visible:outline-none ring-0 select-none",
                  isActive
                    ? "text-emerald-800 font-black"
                    : "text-slate-500 hover:text-slate-800 font-semibold"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-2xl transition-all",
                    isActive
                      ? "bg-gradient-to-tr from-eco-forest to-eco-leaf text-white shadow-md shadow-emerald-800/20 scale-105"
                      : "text-slate-600 bg-slate-100/90"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className={cn("text-[10px] sm:text-[11px] leading-none mt-0.5 tracking-tight select-none", isActive && "font-black text-emerald-800")}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
