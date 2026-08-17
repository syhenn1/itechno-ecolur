import { clsx, type ClassValue } from "clsx";

/** Conditionally joins Tailwind classes. No tailwind-merge — kept intentionally light per
 *  CLAUDE.md's "avoid heavy UI kits" guidance; be mindful of conflicting utility classes. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

const STATUS_LABELS: Record<string, string> = {
  REPORTED: "Dilaporkan",
  VERIFIED: "Terverifikasi",
  IN_PROGRESS: "Diproses",
  RESOLVED: "Selesai",
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}
