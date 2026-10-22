# PARENGGEKITA — Sistem Manifes Kedatangan Kapal & Nota Ongkir Muatan

Aplikasi web modern, responsif, dan mandiri (*standalone*) untuk pencatatan manifes logistik kedatangan kapal pengangkut, rekapitulasi muatan fisik gabus ikan kapal parengge, audit selisih muatan, serta penerbitan nota kontan ongkir presisi cetak kertas A6 ber-watermark resmi.

---

## 🌟 Fitur Utama

1. **📊 Beranda & Grafik Tren Harian (Dashboard)**
   - 4 Kartu Metrik KPI Real-Time: **Kapal Ongkir**, **Total Muatan (Gabus)**, **Kapal Parengge**, dan **Status Audit**.
   - Banner identitas resmi dengan tipografi *Comfortaa* yang selaras dengan logo.
   - Grafik interaktif tren harian volume muatan gabus dan armada kapal pengangkut dengan filter rentang waktu (7 Hari, 14 Hari, 30 Hari, Semua).
   - Tampilan grafik yang dioptimalkan khusus untuk layar ponsel (*mobile-friendly*), bebas tumpang-tindih sumbu dan ringkas.

2. **🚢 Database Pelayaran (Kapal Ongkir)**
   - Pencatatan data pelayaran kapal pengangkut, nama juragan, tanggal berlayar, dan nomor resi.
   - Filter pill cepat berdasarkan lokasi muat: **Semua**, **Kalmas**, dan **DDL**.
   - Input pencarian langsung (*instant real-time search*).
   - Akses cepat ke rincian muatan dan cetak nota blangko kontan.

3. **🐟 Data Muatan Parengge**
   - Rekapitulasi gabus ikan berdasarkan pemilik kapal parengge unik.
   - Riwayat pelayaran dan distribusi muatan per tanggal.

4. **⚖️ Audit & Selisih Muatan Fisik**
   - Pengecekan otomatis kesesuaian antara total fisik muatan gabus dan rincian manifes kapal.
   - Deteksi selisih secara akurat guna menjamin integritas logistik di dermaga/pelabuhan.

5. **🧾 Blangko Nota Kontan Presisi A6**
   - Format tata letak dirancang presisi untuk ukuran kertas A6 standar (`105mm x 148mm`).
   - Dilengkapi **Watermark Logo Resmi** tembus pandang yang jernih dan tajam di latar belakang nota.
   - Kalkulasi otomatis: Subtotal, Potongan Biaya, Total Bersih, dan Sisa Bersih Juragan.
   - Sinkronisasi langsung (*live sync*) antara input layar dan pratinjau cetak.
   - Penyimpanan otomatis (*auto-save*) dengan debounce 800ms.

6. **🔒 Keamanan Data & Privasi**
   - Kredensial URL Webhook Google Apps Script (GAS) terlindungi dengan opsi sembunyikan/tampilkan kata sandi (*toggle eye*).
   - Sanitasi input anti-XSS menyeluruh (`escapeHtml`).
   - Penanganan kesalahan defensif (*null guards*) untuk mencegah crash saat data kosong.

---

## 📁 Struktur Direktori & File

```text
manifes-kapal-app/
├── index.html       # Struktur HTML semantik, modul navigasi, dan antarmuka pengguna
├── style.css        # Desain sistem Vanilla CSS (desktop, mobile responsive, dan @media print A6)
├── app.js           # Logika kalkulasi, integrasi Google Apps Script, grafik tren, dan nota
├── chart.min.js     # Library Chart.js versi lokal (100% offline-ready tanpa ketergantungan CDN)
├── logo.png         # Aset logo transparan resmi PARENGGEKITA (emblem grafis murni)
├── .gitignore       # Konfigurasi pengabaian berkas sementara, cache, dan editor
├── README.md        # Dokumentasi resmi proyek
└── assets/          # Arsip aset mentah dan berkas pendukung
    └── LOGO.jpg     # Master file citra resolusi tinggi
```

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi ini dibangun menggunakan arsitektur web murni (*Vanilla JavaScript, HTML5, CSS3*) tanpa dependensi framework yang rumit:

1. **Secara Langsung (File System)**:
   - Cukup buka berkas `index.html` menggunakan peramban web modern (*Google Chrome, Microsoft Edge, Mozilla Firefox, Safari*).
2. **Melalui Web Server Lokal**:
   - Jalankan perintah berikut di terminal:
     ```bash
     python -m http.server 8080
     ```
   - Buka `http://localhost:8080` pada peramban Anda.
3. **Melalui GitHub Pages**:
   - Buka pengaturan repositori GitHub di menu **Settings** > **Pages** > pilih branch `main` dan folder `/ (root)` > Save.

---

## 🖨️ Panduan Mencetak Nota A6

1. Buka kartu kapal pada tab **Kapal Ongkir**.
2. Klik tombol **Lihat Nota / Cetak**.
3. Di dalam modal pratinjau nota, pastikan rincian nama pemilik muatan dan jumlah gabus sudah sesuai.
4. Klik tombol hijau **🖨️ Cetak Nota Kontan (A6)**.
5. Pada dialog cetak browser:
   - **Tujuan / Printer**: Pilih printer kasir/thermal atau Simpan sebagai PDF.
   - **Ukuran Kertas**: Pilih **A6** (atau *Postcard*).
   - **Margin**: Pilih **None** (Tanpa Margin) atau **Default**.
   - **Opsi**: Centang opsi **Grafik Latar Belakang / Background Graphics** agar watermark tercetak dengan sempurna.

---

## 📄 Lisensi & Hak Cipta

© 2026 **PARENGGEKITA**. Hak Cipta Dilindungi. Sistem Digital Manifes Kedatangan Kapal & Nota Ongkir Muatan.
