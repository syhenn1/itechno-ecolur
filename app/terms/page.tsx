import Link from "next/link";

export const metadata = {
  title: "Syarat dan Ketentuan - EcoLur",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4">
          <Link href="/" className="text-base font-bold text-slate-900">
            EcoLur
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8 text-sm text-slate-700 leading-relaxed">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Syarat dan Ketentuan</h1>
          <p className="text-xs text-slate-500">Terakhir diperbarui: 2026</p>
        </div>

        <p>
          Dengan menggunakan EcoLur, Anda menyetujui syarat dan ketentuan berikut. EcoLur adalah platform untuk
          warga Desa Jatikulur, Kecamatan Gunung Putri, Kabupaten Bogor, dan disediakan sebagai layanan publik
          desa, bukan layanan komersial.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Akun dan login</h2>
          <p>
            Login menggunakan nomor HP dan kode OTP, tanpa kata sandi. Anda bertanggung jawab menjaga akses ke nomor
            HP yang digunakan untuk mendaftar. Satu nomor HP hanya dapat terhubung dengan satu akun.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Data konsumsi energi</h2>
          <p>
            Data konsumsi listrik yang Anda input harus sesuai dengan meteran atau tagihan listrik Anda yang
            sebenarnya. Estimasi biaya dan emisi karbon yang ditampilkan dihitung menggunakan tarif dan faktor emisi
            pendekatan, bukan angka resmi PLN, dan hanya untuk keperluan edukasi.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Laporan infrastruktur</h2>
          <p>
            Laporan yang Anda kirim harus berdasarkan kondisi nyata di lapangan. Dilarang mengirim laporan palsu,
            foto yang tidak relevan, atau laporan berulang untuk masalah yang sama dengan tujuan menyalahgunakan
            sistem poin. Petugas desa berhak menolak laporan yang tidak dapat diverifikasi.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Poin XP, level, dan hadiah</h2>
          <p>
            Poin XP diperoleh dari aktivitas nyata (login harian, pencatatan energi, dan laporan yang benar-benar
            terkirim). Hadiah pada tiap level (pulsa, voucher koperasi desa, paket sembako, atau hadiah lainnya)
            tunduk pada ketersediaan program dan dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Hadiah
            yang sudah diklaim akan diproses atau ditukarkan langsung di Kantor Desa Jatikulur pada hari kerja.
            Kami berhak membatalkan poin atau hadiah yang diperoleh lewat kecurangan.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Asisten AI</h2>
          <p>
            Jawaban dari EcoBot dan rekomendasi hemat energi dihasilkan otomatis dan disediakan sebagai informasi
            umum, bukan nasihat teknis atau hukum resmi. Untuk keputusan resmi terkait regulasi kelistrikan atau
            perizinan, hubungi PLN atau instansi terkait secara langsung.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Perubahan layanan</h2>
          <p>
            Kami dapat mengubah, menambah, atau menghentikan fitur pada platform ini sewaktu-waktu. Perubahan
            signifikan pada syarat dan ketentuan ini akan diumumkan melalui platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">7. Kontak</h2>
          <p>
            Pertanyaan seputar syarat dan ketentuan ini dapat disampaikan ke Kantor Desa Jatikulur, Kecamatan
            Gunung Putri, Kabupaten Bogor.
          </p>
        </section>
      </main>
    </div>
  );
}
