import Link from "next/link";

export const metadata = {
  title: "Kebijakan Privasi - EcoLur",
};

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Kebijakan Privasi</h1>
          <p className="text-xs text-slate-500">Terakhir diperbarui: 2026</p>
        </div>

        <p>
          EcoLur adalah platform milik Desa Jatikulur, Kecamatan Gunung Putri, Kabupaten Bogor, untuk pemantauan
          konsumsi energi warga dan pelaporan masalah infrastruktur. Halaman ini menjelaskan data apa saja yang kami
          kumpulkan, untuk apa data itu digunakan, dan hak Anda atas data tersebut.
        </p>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Data yang kami kumpulkan</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Nomor HP</strong>, digunakan sebagai identitas akun dan untuk verifikasi login lewat kode OTP.</li>
            <li><strong>Nama</strong>, ditampilkan pada laporan dan papan peringkat.</li>
            <li><strong>Data konsumsi listrik</strong> yang Anda input (kWh per bulan), digunakan untuk menghitung estimasi biaya, estimasi emisi karbon, dan rekomendasi hemat energi.</li>
            <li><strong>Laporan infrastruktur</strong>: kategori, deskripsi, foto (jika Anda unggah), dan titik lokasi GPS yang Anda tandai di peta.</li>
            <li><strong>Data aktivitas</strong>: poin XP, level, lencana, riwayat check-in harian, dan riwayat klaim hadiah.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Bagaimana data digunakan</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Memverifikasi identitas Anda saat login (OTP dikirim ke nomor HP yang terdaftar).</li>
            <li>Menghasilkan rekomendasi hemat energi lewat model AI (Google Gemini), berdasarkan riwayat konsumsi Anda sendiri.</li>
            <li>Meneruskan laporan infrastruktur Anda ke petugas desa untuk diverifikasi dan ditindaklanjuti.</li>
            <li>Menampilkan statistik agregat (bukan data pribadi individu) pada dashboard transparansi milik pemerintah desa.</li>
            <li>Menentukan level, lencana, dan kelayakan hadiah pada sistem poin XP.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Siapa yang dapat melihat data Anda</h2>
          <p>
            Petugas desa (role Petugas) dapat melihat laporan yang Anda kirim beserta nama dan nomor HP Anda, untuk
            keperluan verifikasi dan penindaklanjutan. Admin (Pemerintah Desa) dapat melihat statistik agregat dan
            peta sebaran laporan; data individu warga tidak ditampilkan di dashboard publik. Kami tidak menjual atau
            membagikan data Anda kepada pihak ketiga di luar keperluan operasional platform ini.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Penyimpanan dan keamanan</h2>
          <p>
            Data disimpan di basis data PostgreSQL yang dikelola melalui Supabase. Foto laporan disimpan di Supabase
            Storage. Sesi login diamankan lewat token yang ditandatangani dan disimpan sebagai cookie HTTP-only, tidak
            dapat diakses oleh skrip di browser.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Hak Anda</h2>
          <p>
            Anda dapat meminta penghapusan akun dan data terkait dengan menghubungi petugas desa secara langsung.
            Riwayat status laporan yang sudah masuk sistem transparansi (append-only log) tetap disimpan untuk
            keperluan audit, namun akan diminta anonimisasi identitas pelapor jika Anda mengajukan penghapusan akun.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Kontak</h2>
          <p>
            Pertanyaan seputar kebijakan privasi ini dapat disampaikan ke Kantor Desa Jatikulur, Kecamatan Gunung
            Putri, Kabupaten Bogor.
          </p>
        </section>
      </main>
    </div>
  );
}
