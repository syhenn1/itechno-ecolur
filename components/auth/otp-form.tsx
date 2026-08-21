"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { showGamificationToasts } from "@/lib/gamification-client";

type Step = "phone" | "otp";

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "request", phone, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim OTP");
      setChallengeToken(data.challengeToken);
      setDevCode(data.devCode ?? null);
      setStep("otp");
      toast.success("Kode OTP terkirim", {
        description: data.devCode ? `Mode pengembangan — kode: ${data.devCode}` : "Cek WhatsApp/SMS Anda.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "verify", phone, code, challengeToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kode OTP salah atau kedaluwarsa");
      toast.success("Berhasil masuk");
      showGamificationToasts(data.gamification);
      router.push(next);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div>
          <Label htmlFor="code">Kode OTP</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            required
            autoFocus
          />
          {devCode && <p className="mt-1.5 text-xs text-slate-500">Mode pengembangan — kode OTP: {devCode}</p>}
        </div>
        <Button type="submit" className="w-full" loading={loading} disabled={code.length !== 6}>
          Verifikasi
        </Button>
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="w-full text-center text-sm text-slate-500 transition-all hover:text-slate-700 active:scale-95"
        >
          Ganti nomor HP
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestOtp} className="space-y-4">
      <div>
        <Label htmlFor="phone">Nomor HP</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08123456789"
          required
          autoFocus
        />
      </div>
      <div>
        <Label htmlFor="name">Nama (untuk akun baru)</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
      </div>
      <Button type="submit" className="w-full" loading={loading} disabled={!phone}>
        Kirim Kode OTP
      </Button>
    </form>
  );
}
