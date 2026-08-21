import type { DocumentChunk } from "../dsa/inverted-index";

export const ECOLUR_KNOWLEDGE_BASE: DocumentChunk[] = [
  // --- SDG 7: ENERGY & REGULATIONS ---
  {
    id: "reg-pln-tariff-2026",
    category: "energy",
    title: "Struktur Tarif Tenaga Listrik PLN Rumah Tangga (R-1/TR)",
    source: "Kementerian ESDM & PT PLN (Persero) 2026",
    keywords: ["tarif", "listrik", "pln", "kwh", "biaya", "r1", "daya", "900va", "1300va", "2200va", "subsidi"],
    content: `
Tarif Tenaga Listrik (TTL) untuk pelanggan rumah tangga di Indonesia terbagi dalam beberapa golongan:
1. Golongan R-1/TR 450 VA: Rp415 per kWh (Subsidi pemerintah untuk keluarga pra-sejahtera terdaftar DTKS).
2. Golongan R-1/TR 900 VA Bersubsidi: Rp605 per kWh.
3. Golongan R-1/TR 900 VA RTM (Rumah Tangga Mampu / Non-Subsidi): Rp1.352 per kWh.
4. Golongan R-1/TR 1.300 VA dan 2.200 VA ke atas: Rp1.444,70 per kWh (Tarif penyesuaian non-subsidi).
Estimasi emisi karbon rata-rata jaringan listrik PLN (Jawa-Madura-Bali) adalah 0,85 kg CO2 per 1 kWh listrik yang dikonsumsi.
    `.trim(),
  },
  {
    id: "reg-plts-atap-esdm",
    category: "regulation",
    title: "Regulasi & Prosedur Pemasangan PLTS Atap (Permen ESDM No. 2/2024)",
    source: "Permen ESDM No. 2 Tahun 2024 tentang PLTS Atap",
    keywords: ["plts", "solar", "panel", "surya", "esdm", "atap", "net metering", "kuota", "izin", "pln"],
    content: `
Ketentuan pemasangan Pembangkit Listrik Tenaga Surya (PLTS) Atap untuk rumah tangga:
1. Pendaftaran Kuota: Warga harus mengajukan permohonan ke PLN setempat pada periode pembukaan kuota (biasanya Januari dan Juli tiap tahun).
2. Kapasitas Maksimum: Disesuaikan dengan kapasitas kuota sistem kelistrikan PLN setempat tanpa batasan kaku persentase daya tersambung, namun tidak dikenakan biaya kapasitas (capacity charge) untuk pelanggan rumah tangga.
3. Skema Ekspor-Impor: Berdasarkan regulasi terbaru 2024, listrik berlebih yang dialirkan ke jaringan PLN tidak lagi dihitung sebagai pengurang tagihan (net metering ditiadakan), sehingga sistem PLTS dianjurkan dioptimalkan sesuai konsumsi harian (zero-export) atau memakai baterai (ESS).
4. Persyaratan Administrasi: KTP, nomor ID pelanggan PLN, gambar denah instalasi, dan sertifikasi laik operasi (SLO) inverter.
    `.trim(),
  },
  {
    id: "tips-hemat-ac-elektronik",
    category: "energy",
    title: "Panduan Teknis Efisiensi Listrik AC, Kulkas, dan Beban Siaga (Standby Power)",
    source: "Direktorat Jenderal EBTKE Kementerian ESDM",
    keywords: ["hemat", "ac", "kulkas", "standby", "elektronik", "inverter", "tips", "suhu", "daya"],
    content: `
Cara menghemat listrik perangkat rumah tangga berdaya besar:
1. Air Conditioner (AC):
   - Set suhu optimal 24°C - 26°C. Menurunkan suhu ke 18°C meningkatkan konsumsi listrik hingga 20-30% tanpa mendinginkan ruangan lebih cepat.
   - Gunakan AC teknologi Inverter untuk ruangan yang menyala >5 jam/hari (hemat hingga 30-50% kWh).
   - Bersihkan filter AC minimal 1 bulan sekali untuk mencegah kompresor bekerja terlalu berat.
2. Beban Standby (Vampire Power):
   - Cabut colokan TV, microwave, charger HP, dan dispenser saat tidak digunakan. Beban standby menyumbang 5-10% dari total tagihan listrik bulanan.
3. Kulkas:
   - Hindari memasukkan makanan/minuman panas langsung ke kulkas.
   - Jaga jarak bagian belakang kulkas minimal 10-15 cm dari dinding agar sirkulasi kondensor optimal.
    `.trim(),
  },
  {
    id: "subsidi-tambah-daya",
    category: "energy",
    title: "Prosedur Perubahan Daya Listrik dan Pengajuan Subsidi Listrik PLN",
    source: "Layanan Pelanggan PLN 123 & DTKS Kemensos",
    keywords: ["tambah daya", "turun daya", "subsidi", "dtks", "pln mobile", "migrasi", "meteran"],
    content: `
Prosedur perubahan daya dan pengajuan subsidi:
1. Permohonan Tambah/Turun Daya: Dapat dilakukan secara mandiri melalui aplikasi resmi PLN Mobile dengan memilih menu 'Perubahan Daya', mengisi nomor meter, dan memilih paket daya baru.
2. Subsidi Listrik Rumah Tangga: Penentuan tarif subsidi 450 VA / 900 VA terintegrasi otomatis dengan Data Terpadu Kesejahteraan Sosial (DTKS) Kementerian Sosial. Warga yang berhak namun belum menerima subsidi dapat mengajukan surat rekomendasi dari Kelurahan / Desa setempat untuk verifikasi ke dinas sosial.
    `.trim(),
  },

  // --- SDG 11: PUBLIC SERVICES & BOJONG KULUR INFRASTRUCTURE ---
  {
    id: "sop-jalan-rusak-bojongkulur",
    category: "public_service",
    title: "SOP Pelaporan dan Perbaikan Jalan Berlubang & Aspal Desa Bojong Kulur",
    source: "Dinas Pekerjaan Umum & Tata Ruang Kab. Bogor / Pemdes Bojong Kulur",
    keywords: ["jalan", "rusak", "lubang", "aspal", "perbaikan", "sop", "sla", "bojong kulur", "dpu"],
    content: `
Standar Operasional Prosedur penanganan jalan rusak di Desa Bojong Kulur, Gunung Putri:
1. Pelaporan Warga: Laporan dimasukkan lewat EcoLur dengan foto titik kerusakan dan koordinat GPS akurat.
2. Verifikasi Lapangan (SLA: 1x24 Jam): Petugas lapangan memverifikasi ukuran lubang, volume lalu lintas, dan tingkat bahaya (kategori darurat vs pemeliharaan rutin).
3. Penjadwalan Perbaikan:
   - Kerusakan Darurat (kedalaman >10 cm di jalan utama): Tindakan pengamanan/penambalan cepat dalam 2-3 hari kerja.
   - Pemeliharaan Berkala: Dikelompokkan ke dalam paket pemeliharaan bulanan RT/RW.
4. Update Status: Petugas mengunggah foto bukti penambalan dan menandai status laporan menjadi RESOLVED.
    `.trim(),
  },
  {
    id: "sop-pengelolaan-sampah-bojongkulur",
    category: "public_service",
    title: "Jadwal dan Mekanisme Pengelolaan Sampah Warga & Pasar Bojong Kulur",
    source: "Dinas Lingkungan Hidup Kab. Bogor & BUMDes Bojong Kulur",
    keywords: ["sampah", "jadwal", "truk", "pasar", "daur ulang", "dlh", "bank sampah", "retribusi"],
    content: `
Jadwal pengangkutan dan pengelolaan sampah di wilayah Bojong Kulur:
1. Pengangkutan Sampah Permukiman: Dilakukan 3 kali seminggu (Senin, Rabu, Sabtu pagi) oleh armada kebersihan desa.
2. Area Komersial & Pasar Bojong Kulur: Pengangkutan harian setiap pukul 05.00 - 08.00 WIB guna mencegah penumpukan sampah organik.
3. Larangan Pembakaran: Membakar sampah secara terbuka dilarang keras berdasarkan Perda Pengelolaan Lingkungan karena mencemari udara dan berisiko memicu kebakaran.
4. Program Bank Sampah EcoLur: Warga dapat menyetorkan sampah anorganik terpilah (kardus, botol plastik, logam) ke Bank Sampah RW untuk mendapatkan poin reward/XP EcoLur.
    `.trim(),
  },
  {
    id: "sop-drainase-banjir-cileungsi",
    category: "public_service",
    title: "Protokol Penanganan Drainase Mampet & Titik Rawan Luapan Sungai Cileungsi",
    source: "BPBD Kab. Bogor & Posko Siaga Banjir Bojong Kulur",
    keywords: ["drainase", "got", "banjir", "cileungsi", "sungai", "pompa", "bpbd", "hujan", "sedimen"],
    content: `
Protokol antisipasi dan penanganan drainase di Bojong Kulur (area pertemuan Sungai Cileungsi dan Cikeas):
1. Pengerukan Sedimen Rutin: Dilakukan secara berkala sebelum musim penghujan pada saluran primer dan sekunder.
2. Laporan Warga Soal Got Tersumbat: Diprioritaskan untuk pembersihan manual oleh tim kebersihan dalam kurun waktu maksimal 48 jam.
3. Status Siaga Banjir:
   - Siaga 3 (Waspada): Ketinggian air Cileungsi naik, warga diimbau mengamankan barang berharga.
   - Siaga 2 & 1 (Kritis): Tim tanggap darurat dan pompa mobile diaktifkan di titik tanggul Villa Nusa Indah / Bojong Kulur.
4. Kontak Darurat Bencana: Posko Siaga Bojong Kulur / BPBD Kab. Bogor (112 atau 021-87914800).
    `.trim(),
  },
  {
    id: "ecolur-gamification-prizes",
    category: "gamification",
    title: "Panduan Level, XP, Lencana, dan Klaim Hadiah di Platform EcoLur",
    source: "Tim Pengembang EcoLur — ITechno Cup 2026",
    keywords: ["xp", "level", "hadiah", "lencana", "voucher", "klaim", "gamifikasi", "poin"],
    content: `
Sistem Reward & Gamifikasi EcoLur:
1. Cara Mendapatkan XP:
   - Mencatat konsumsi listrik bulanan: +50 XP per bulan.
   - Berhasil menurunkan konsumsi kWh dibanding bulan sebelumnya: +100 XP bonus.
   - Melaporkan fasilitas publik yang valid: +75 XP per laporan terverifikasi.
2. Hadiah Tingkat Level:
   - Level 3 (Pionir Hijau): Pulsa / Token Listrik Rp25.000.
   - Level 5 (Pelindung Bumi): Voucher Belanja Koperasi Desa / UMKM Rp50.000.
   - Level 7 (Duta Keberlanjutan): Paket Makan Bergizi Gratis (MBG) UMKM Lokal.
   - Level 10 (Pahlawan Lingkungan): Set Sprei & Perlengkapan Rumah Ramah Lingkungan.
3. Prosedur Klaim Hadiah: Saat level tercapai, sistem mencatat klaim otomatis di database. Petugas/Admin desa akan memverifikasi dan menyerahkan hadiah fisik/digital pada saat jam pelayanan kantor desa.
    `.trim(),
  },
];
