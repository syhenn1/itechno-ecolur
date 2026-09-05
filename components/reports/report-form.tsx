"use client";

import { useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { showGamificationToasts } from "@/lib/gamification-client";
import { useTutorial } from "@/components/tutorial/tutorial-provider";

const LocationPicker = dynamic(
  () => import("@/components/reports/location-picker").then((m) => m.LocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-slate-300 bg-slate-50 text-sm text-slate-500">
        Memuat peta...
      </div>
    ),
  },
);

const CATEGORIES = [
  { value: "jalan_rusak", label: "Jalan Rusak" },
  { value: "sampah", label: "Sampah" },
  { value: "drainase", label: "Drainase" },
  { value: "penerangan_jalan", label: "Penerangan Jalan" },
  { value: "fasilitas_umum", label: "Fasilitas Umum" },
  { value: "lainnya", label: "Lainnya" },
];

export function ReportForm() {
  const router = useRouter();
  const tutorial = useTutorial();
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (description.trim().length < 10) {
      toast.error("Deskripsi terlalu pendek", { description: "Ceritakan masalahnya minimal 10 karakter, ya." });
      return;
    }

    if (!location) {
      toast.error("Tandai lokasi kejadian di peta terlebih dahulu.");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const origin = { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight };

    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("category", category);
      formData.set("description", description);
      formData.set("lat", String(location.lat));
      formData.set("lng", String(location.lng));
      if (photo) formData.set("photo", photo);

      const res = await fetch("/api/reports", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim laporan");

      toast.success("Laporan terkirim", { description: "Anda bisa memantau statusnya di Laporan Saya." });
      showGamificationToasts(data.gamification, origin);
      tutorial?.complete("report_submit");
      router.push("/my-reports");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} data-tutorial-zone="report_submit" className="space-y-4">
      <div>
        <Label htmlFor="category">Kategori</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Jelaskan masalah yang Anda temukan sedetail mungkin..."
        />
      </div>

      <div>
        <Label htmlFor="photo">Foto (opsional)</Label>
        <label
          htmlFor="photo"
          className="flex h-10 w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {photo ? photo.name : "Pilih foto"}
        </label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
      </div>

      <div>
        <Label>Lokasi</Label>
        <p className="mb-1.5 text-xs text-slate-500">
          Klik pada peta untuk menandai lokasi kejadian, dibatasi di area Bojong Kulur (kotak putus-putus).
        </p>
        <LocationPicker value={location} onChange={(lat, lng) => setLocation({ lat, lng })} />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Kirim Laporan
      </Button>
    </form>
  );
}
