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
import { ResetDemoButton } from "@/components/layout/reset-demo-button";
import { HelpButton } from "@/components/layout/help-button";
import { Button } from "@/components/ui/button";
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
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left Side: Exact Clean 2-Line Legacy Brand Block */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/ecolur-logo.png"
              alt="Logo EcoLur"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-md object-cover shrink-0"
            />
            <div className="flex flex-col leading-none">
              <span className="text-base sm:text-lg font-bold text-slate-900">EcoLur</span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5">Jatikulur, Bogor</span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = getNavIcon(link.href);
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 lg:px-3 py-2 text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5",
                    isActive
                      ? "bg-emerald-700 text-white shadow-sm shadow-emerald-700/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: User Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-1">
              <HelpButton />
              <ResetDemoButton />
            </div>

            {/* One combined "who's logged in" card — level badge, avatar, name, and role all in
                a single box instead of two separate ones, so the header reads as fewer, calmer
                chunks instead of a row of same-sized boxes competing for attention. */}
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-slate-200 bg-white py-1.5 pl-1.5 pr-3">
              {levelDef && (
                <Link
                  href="/badges"
                  className="flex shrink-0 items-center gap-1 rounded px-1.5 py-1 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50"
                  title={`Level ${levelDef.level} - ${levelDef.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={levelDef.badgeIcon} alt={levelDef.badgeName} className="h-5 w-5 object-contain" />
                  <span className="font-mono text-xs font-bold text-slate-900">Lv.{levelDef.level}</span>
                </Link>
              )}
              {levelDef && <div className="h-6 w-px bg-slate-200" aria-hidden="true" />}
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-[11px] font-bold text-white uppercase">
                {name ? name.charAt(0) : "W"}
              </div>
              <div className="min-w-0 text-left leading-tight">
                <div className="truncate text-xs font-semibold text-slate-900 max-w-[110px]">{name}</div>
                <div className="text-[10px] text-slate-500">{roleLabel}</div>
              </div>
            </div>

            <form action={logoutAction} data-tutorial-allow>
              <Button type="submit" variant="outline" size="icon" aria-label="Keluar" title="Keluar" className="h-9 w-9">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Generous Tall Padding & Comfortable Reach) */}
      <nav
        aria-label="Navigasi Utama Ponsel"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-2 pt-2 pb-5 sm:pb-6"
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
                  "flex flex-col items-center justify-center gap-1 rounded-md py-1 px-2.5 min-w-[60px] transition-colors select-none",
                  isActive ? "text-emerald-700 font-semibold" : "text-slate-500 hover:text-slate-800",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                    isActive ? "bg-emerald-700 text-white" : "text-slate-600 bg-slate-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] leading-none mt-0.5 tracking-tight select-none">
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
