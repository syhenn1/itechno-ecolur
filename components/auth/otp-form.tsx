"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { showGamificationToasts } from "@/lib/gamification-client";
import { Smartphone, KeyRound, User, Wrench, Building2 } from "lucide-react";

type Step = "phone" | "otp";

const DEMO_ACCOUNTS = [
  { label: "Warga Demo", phone: "081234567890", role: "Warga", iconType: "user" },
  { label: "Petugas Demo", phone: "081234567891", role: "Petugas", iconType: "wrench" },
  { label: "Admin Demo", phone: "081234567892", role: "Admin", iconType: "admin" },
];

function renderDemoIcon(type: string) {
  switch (type) {
    case "user":
      return <User className="h-5 w-5 text-emerald-700 mb-0.5" />;
    case "wrench":
      return <Wrench className="h-5 w-5 text-amber-700 mb-0.5" />;
    case "admin":
      return <Building2 className="h-5 w-5 text-sky-800 mb-0.5" />;
    default:
      return <User className="h-5 w-5 text-emerald-700 mb-0.5" />;
  }
}

export function OtpForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtpForPhone(targetPhone: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "request", phone: targetPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim OTP");
      setChallengeToken(data.challengeToken);
      setDevCode(data.devCode ?? null);
      if (data.devCode) {
        setCode(data.devCode); // Auto-fill dev code for frictionless demo
      }
      setStep("otp");
      toast.success("Kode OTP terkirim", {
        description: data.devCode ? `Kode OTP demo: ${data.devCode}` : "Cek WhatsApp/SMS Anda.",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestOtp(event: FormEvent) {
    event.preventDefault();
    if (!phone.trim()) {
      toast.error("Isi nomor HP dulu, ya.");
      return;
    }
    await requestOtpForPhone(phone);
  }

  const handleQuickDemoSelect = (demoPhone: string) => {
    setPhone(demoPhone);
    requestOtpForPhone(demoPhone);
  };

  async function handleVerifyOtp(event: FormEvent) {
    event.preventDefault();
    if (code.length !== 6) {
      toast.error("Kode OTP harus 6 digit.");
      return;
    }
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

      const roleHome =
        data.role === "ADMIN" ? "/dashboard" : data.role === "OFFICER" ? "/incoming-reports" : "/energy";
      const targetUrl = next && next !== "/" && next !== "/login" ? next : roleHome;
      window.location.href = targetUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-800">
            <KeyRound className="h-4 w-4 text-slate-500" />
            <span>Verifikasi nomor: {phone}</span>
          </div>
          {devCode && (
            <p className="mt-1.5 text-[11px] font-mono text-slate-600 bg-white border border-slate-200 py-1 px-2 rounded inline-block">
              Kode OTP dev: <strong>{devCode}</strong>
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="code">Masukkan 6 digit kode OTP</Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            autoFocus
            className="text-center font-mono text-lg tracking-widest"
          />
        </div>

        <Button type="submit" className="w-full" loading={loading} disabled={code.length !== 6}>
          Verifikasi dan masuk
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            setStep("phone");
            setCode("");
          }}
        >
          Ganti nomor HP
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Smartphone className="h-3.5 w-3.5 text-slate-500" />
            <span>Nomor HP (WhatsApp)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 081234567890"
            autoFocus
            className="mt-1.5"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Jika nomor baru, akun otomatis dibuat tanpa perlu kata sandi.
          </p>
        </div>

        <Button type="submit" className="w-full" loading={loading} disabled={!phone}>
          Kirim kode OTP
        </Button>
      </form>

      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-medium">Login demo</span>
          <span className="text-[10px] text-slate-400">Pilih akun demo</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((demo) => (
            <Button
              key={demo.phone}
              variant="outline"
              onClick={() => handleQuickDemoSelect(demo.phone)}
              disabled={loading}
              // !h-auto / !p-2.5: cn() is plain clsx (no tailwind-merge, see lib/utils.ts), so
              // without `!important` here these lose to SIZE_CLASSES.md's `h-10 px-4` depending
              // on Tailwind's internal generation order — which is exactly what was clipping this
              // 3-line tile down to a fixed 40px-tall box and making the lines look squished
              // together instead of genuinely stacking.
              className="!h-auto !p-2.5"
            >
              {/* Button's own content wrapper is a row flexbox (icon next to label) — for this
                  tile's icon-over-two-lines layout, nest a column flexbox as the single child
                  instead of fighting that wrapper via className (it doesn't reach an inner span). */}
              <span className="flex flex-col items-center gap-0.5">
                {renderDemoIcon(demo.iconType)}
                <span className="text-xs font-semibold text-slate-800 leading-tight">{demo.label}</span>
                <span className="text-[10px] font-normal text-slate-500">{demo.role}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
