# EcoLur

Platform digital untuk warga Desa Bojong Kulur (Kecamatan Gunung Putri, Kabupaten Bogor) memantau konsumsi listrik rumah tangga dan melaporkan masalah infrastruktur kota, dengan dashboard transparansi untuk pemerintah desa.

Dikembangkan untuk **ITechno Cup 2026 - Web Development Student Competition**
Sub-tema: *Smart Sustainable Digital Solution for Inclusive Society*
SDG yang diterapkan: **SDG 7**, **SDG 9**, **SDG 11**

---

## Daftar Isi

- [Latar Belakang dan Tujuan](#latar-belakang-dan-tujuan)
- [SDG yang Diterapkan](#sdg-yang-diterapkan)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Instalasi](#instalasi)
- [Cara Menggunakan](#cara-menggunakan)
- [Akun Demo](#akun-demo)
- [Struktur Proyek](#struktur-proyek)
- [Penggunaan AI dalam Pengembangan](#penggunaan-ai-dalam-pengembangan)
- [Tim](#tim)
- [Tautan](#tautan)
- [Lisensi](#lisensi)

---

## Latar Belakang dan Tujuan

Banyak kelurahan dan desa di Indonesia menghadapi dua masalah yang jarang ditangani bersamaan:

1. **Konsumsi listrik rumah tangga tidak terpantau** - warga tidak punya gambaran jelas soal pola pemakaian listrik mereka, sehingga sulit mengambil langkah hemat energi yang konkret.
2. **Laporan masalah infrastruktur lambat dan manual** - laporan seperti jalan rusak, sampah menumpuk, atau lampu jalan padam sering tidak terlacak, membuat warga tidak tahu apakah laporannya pernah ditindaklanjuti.

EcoLur menggabungkan keduanya dalam satu platform: warga bisa memantau jejak energi mereka sekaligus melaporkan dan melacak masalah infrastruktur kota, sementara pemerintah desa mendapatkan dashboard transparansi berbasis data untuk pengambilan keputusan.

Nama **EcoLur** berasal dari *"Eco"* (keberlanjutan) dan *"Lur"* - diambil dari **Bojong Kulur**, wilayah percontohan proyek ini di Gunung Putri, Kabupaten Bogor, sekaligus sapaan akrab dalam bahasa gaul lokal. Platform ini dirancang untuk dimulai di satu desa, tapi bisa diperluas ke kota atau kabupaten lain yang menghadapi tantangan energi dan layanan publik yang sama.

Tujuan aplikasi:
- Mendorong kesadaran hemat energi lewat data yang jelas dan dapat ditindaklanjuti.
- Mempercepat dan menambah transparansi proses pelaporan masalah publik.
- Menyediakan data agregat yang bisa dipakai pemerintah desa untuk perencanaan.
- Memberi insentif nyata (poin, level, hadiah) supaya partisipasi warga berkelanjutan, bukan sekali coba lalu ditinggalkan.

---

## SDG yang Diterapkan

| SDG | Penerapan di EcoLur |
|---|---|
| **SDG 7** - Energi Bersih dan Terjangkau | Pemantauan konsumsi listrik rumah tangga, estimasi biaya dan emisi karbon, rekomendasi hemat energi berbasis AI. |
| **SDG 9** - Industri, Inovasi, dan Infrastruktur | Sistem digital untuk data kota, log status laporan yang bersifat append-only untuk jejak audit, AI dan struktur data khusus (spatial indexing, retrieval) sebagai inovasi layanan. |
| **SDG 11** - Kota dan Komunitas Berkelanjutan | Modul pelaporan masalah publik dengan pelacakan status, dashboard transparansi untuk pemerintah desa, peta sebaran laporan dan heatmap area bermasalah. |

---

## Fitur Utama

### Modul Energi (SDG 7)
- Catat konsumsi listrik bulanan, lihat grafik tren, estimasi biaya dan emisi CO2.
- Rekomendasi hemat energi otomatis dari AI (Google Gemini), berdasarkan riwayat konsumsi masing-masing warga.

### Modul Layanan Publik (SDG 11)
- Lapor masalah infrastruktur (jalan rusak, sampah, drainase, penerangan jalan, dll.) dengan foto dan titik lokasi GPS, dibatasi ke area Bojong Kulur.
- Pelacakan status laporan secara real-time (Dilaporkan - Terverifikasi - Diproses - Selesai), dengan riwayat lengkap yang tidak pernah ditimpa (append-only log).
- Petugas desa memverifikasi dan memperbarui status laporan lewat terminal khusus, dengan pengurutan laporan berdasarkan jarak dan tingkat prioritas.

### Gamifikasi dan Apresiasi Warga
- Sistem poin XP dari aktivitas nyata: login harian, mencatat konsumsi energi, mengirim laporan, dan laporan yang selesai ditangani.
- 5 tingkat level (Bronze - Silver - Gold - Ruby - Diamond), masing-masing dengan hadiah nyata (pulsa, voucher koperasi desa, paket sembako, hingga hadiah utama).
- Lencana pencapaian, misi harian/mingguan, papan peringkat warga, dan absensi harian dengan pelacakan hari beruntun.

### Asisten AI (EcoBot)
- Chatbot yang menjawab pertanyaan seputar tarif listrik PLN, regulasi panel surya, tips hemat energi, dan prosedur pelaporan warga.
- Jawaban dirujuk dari basis pengetahuan lokal (regulasi ESDM, tarif PLN, SOP desa), bukan jawaban generik tanpa sumber.

### Dashboard Transparansi (Pemerintah Desa/Admin)
- Statistik agregat energi dan laporan per area.
- Peta sebaran laporan dan heatmap konsentrasi masalah.
- Ringkasan pola masalah berulang dari AI, untuk membantu pengambilan keputusan.
- Ekspor data laporan, dan pengelolaan klaim hadiah warga.

---

## Tech Stack

| Kategori | Teknologi | Fungsi |
|---|---|---|
| Framework inti | **Next.js (App Router) + TypeScript** | Fullstack - frontend dan API routes dalam satu aplikasi, memudahkan deployment ke Vercel |
| Styling | **Tailwind CSS** | Styling responsif dan konsisten di semua ukuran layar |
| Database | **PostgreSQL** (via Supabase) | Penyimpanan data utama (pengguna, laporan, log energi, gamifikasi) |
| ORM | **Prisma** | Query dan migrasi database dengan tipe yang aman |
| Autentikasi | **OTP berbasis nomor HP** | Login tanpa kata sandi |
| Peta | **Leaflet.js + OpenStreetMap** | Visualisasi lokasi laporan tanpa API key berbayar |
| Grafik | **Recharts** | Visualisasi tren konsumsi energi |
| AI | **Google Gemini API** | Rekomendasi hemat energi, ringkasan laporan, dan asisten chat EcoBot |
| Penyimpanan file | **Supabase Storage** | Foto laporan warga |
| Hosting | **Vercel** | Hosting gratis untuk frontend dan API routes |

Selain itu, proyek ini punya beberapa struktur data kustom di `lib/dsa/` (priority queue, quadtree, trie, inverted index) yang dipakai untuk triase spasial petugas (`lib/spatial/`) dan mesin pencarian basis pengetahuan EcoBot (`lib/rag/`).

---

## Arsitektur

Arsitektur sistem lengkap, use case per aktor, ERD, dan alur status laporan ada di [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Instalasi

### Prasyarat
- Node.js v18 atau lebih baru
- npm
- Database PostgreSQL gratis (disarankan [Supabase](https://supabase.com))
- API key Google Gemini gratis (lewat [Google AI Studio](https://aistudio.google.com))

### Langkah setup

```bash
# 1. Clone repository
git clone https://github.com/<username>/ecolur.git
cd ecolur

# 2. Install dependencies
npm install

# 3. Salin template environment variable
cp .env.example .env

# 4. Isi .env dengan kredensial Anda sendiri
# DATABASE_URL, DIRECT_URL, GEMINI_API_KEY, SESSION_SECRET, dll. (lihat .env.example)

# 5. Jalankan migrasi database
npx prisma migrate dev

# 6. Isi data demo
npx prisma db seed

# 7. Jalankan server pengembangan
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`

---

## Cara Menggunakan

Setelah login (lihat [Akun Demo](#akun-demo) di bawah), aplikasi menampilkan tampilan berbeda sesuai peran:

1. **Warga**: masuk lewat nomor HP dan kode OTP, lalu diarahkan ke halaman Energi. Catat konsumsi listrik bulanan, lihat rekomendasi AI, kirim laporan masalah lewat menu Lapor, dan pantau level/lencana/hadiah lewat menu Hadiah & Lencana. Tanyakan hal seputar listrik atau regulasi ke EcoBot lewat menu Tanya AI.
2. **Petugas**: masuk ke Laporan Masuk, memverifikasi laporan warga, memperbarui status, dan menambahkan catatan tindak lanjut.
3. **Admin**: masuk ke Dashboard Transparansi untuk melihat statistik agregat, peta sebaran laporan, ringkasan pola masalah dari AI, mengelola klaim hadiah warga, dan mengekspor data.

```bash
# Build untuk produksi
npm run build
npm run start

# Buka Prisma Studio untuk memeriksa database
npx prisma studio
```

---

## Akun Demo

Setelah menjalankan `npx prisma db seed`, tiga akun demo tersedia (kode OTP selalu `000000` selama `OTP_PROVIDER_API_KEY` belum diisi):

| Peran | Nomor HP |
|---|---|
| Warga | 081234567890 |
| Petugas | 081234567891 |
| Admin | 081234567892 |

Karena data yang dipakai untuk demo ini sama dengan data yang tersimpan di database sungguhan, setiap input yang dilakukan lewat akun demo (catatan energi baru, laporan baru, klaim hadiah, dan sebagainya) benar-benar tersimpan — baik oleh akun Warga Demo maupun warga lain yang sudah diseed, dan aksi Petugas/Admin (verifikasi laporan, tandai hadiah terkirim) juga ikut mengubah data yang sama. Kalau data demo sudah terlalu jauh berubah dari kondisi awal, gunakan tombol **Reset Demo** di menu navigasi untuk mengembalikannya ke data awal tanpa perlu menjalankan ulang seed dari terminal — ini juga otomatis memulai ulang tutorial dari langkah pertama.

---

## Struktur Proyek

```
ecolur/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login dan OTP
│   ├── (citizen)/                # Warga: energi, lapor, hadiah & lencana, tanya AI
│   ├── (officer)/                # Petugas: laporan masuk
│   ├── (admin)/                  # Admin: dashboard transparansi
│   ├── privacy/, terms/          # Kebijakan privasi dan syarat & ketentuan
│   └── api/                      # Route handlers
├── components/
│   ├── ui/                       # Komponen dasar (Button, Card, Input, dll.)
│   ├── layout/                   # Navbar, badge pemerintah
│   ├── auth/, energy/, reports/  # Komponen per modul
│   ├── gamification/             # Level, lencana, misi, papan peringkat, klaim hadiah
│   ├── ai/                       # Chat EcoBot
│   ├── officer/, admin/          # Komponen petugas dan admin
│   └── landing/                  # Komponen landing page
├── lib/
│   ├── db.ts, session.ts, auth.ts, ai.ts, supabase.ts
│   ├── gamification.ts, gamification-data.ts, gamification-client.ts
│   ├── dsa/                      # Priority queue, quadtree, trie, inverted index
│   ├── rag/                      # Basis pengetahuan dan mesin retrieval EcoBot
│   └── spatial/                  # Triase dan penugasan spasial petugas
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/                       # Aset statis (logo, ikon lencana, foto)
├── ARCHITECTURE.md
├── CLAUDE.md                     # Konteks proyek untuk asisten AI pengembangan
├── .env.example
└── package.json
```

---

## Penggunaan AI dalam Pengembangan

Sesuai aturan kompetisi soal transparansi penggunaan AI:

- **AI sebagai fitur produk**: Google Gemini API dipakai untuk rekomendasi hemat energi, ringkasan pola laporan, dan asisten chat EcoBot. Data yang dikirim ke AI dibatasi hanya yang relevan (tanpa nomor HP lengkap atau data pribadi sensitif lainnya), dan input warga disaring untuk mencegah prompt injection.
- **AI sebagai alat bantu pengembangan**: sebagian besar kode proyek ini dikembangkan dengan bantuan asisten coding AI (Claude), namun seluruh keputusan arsitektur, pilihan teknis, dan hasil akhir telah ditinjau dan dipahami sepenuhnya oleh tim.
- **Komitmen etis**: tim bertanggung jawab penuh atas seluruh kode dan konten yang dihasilkan, memastikan tidak ada pelanggaran hak cipta, melindungi privasi data pengguna (autentikasi OTP, tanpa penyimpanan data sensitif tanpa enkripsi), dan menerapkan validasi keamanan dasar (sanitasi input, pembatasan laju permintaan).

---

## Tim

| Nama | NIM | Universitas | Peran |
|---|---|---|---|
| [Nama Anggota 1] | [NIM] | [Universitas] | [Fullstack Developer] |
| [Nama Anggota 2] | [NIM] | [Universitas] | [UI/UX Designer] |
| [Nama Anggota 3] | [NIM] | [Universitas] | [Backend Developer] |

---

## Tautan

- Repositori GitHub: `[isi tautan repo]`
- Demo langsung (hosting): `[isi tautan Vercel]`
- Kebijakan Privasi: `/privacy`
- Syarat dan Ketentuan: `/terms`
- Pitch deck: `[isi setelah lolos ke babak final]`

---

## Lisensi

Proyek ini dibuat untuk kompetisi ITechno Cup 2026 dan merupakan karya asli - belum pernah dipublikasikan untuk tujuan komersial maupun menjadi pemenang kompetisi serupa sebelumnya.
