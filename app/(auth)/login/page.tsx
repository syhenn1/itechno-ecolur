import { Suspense } from "react";
import { OtpForm } from "@/components/auth/otp-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/ecolur-logo.png" alt="Logo EcoLur" className="h-16 w-16 rounded-md object-cover mb-2" />
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Pemerintah Kabupaten Bogor
        </div>
        <h1 className="text-xl font-bold text-slate-900">Masuk ke EcoLur</h1>
        <p className="text-xs text-slate-600">
          Gunakan nomor HP Anda, tanpa password, verifikasi lewat kode OTP.
        </p>
      </div>
      <Suspense>
        <OtpForm />
      </Suspense>
    </div>
  );
}
