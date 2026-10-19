# Aplikasi Web Manifes & Nota Logistik Kapal

Struktur file telah dipecah menjadi modular agar revisi dan perawatan kode lebih mudah:

- `index.html` : Struktur HTML (tampilan mobile, daftar kapal, modal nota kontan)
- `style.css`  : Tata letak, warna, responsivitas mobile, dan aturan cetak A6 (@media print)
- `app.js`     : Logika kalkulasi, auto-save (debounce 800ms), fetch API Apps Script, format titik ribuan

Cara menjalankan:
Cukup buka `index.html` di browser (Chrome / Edge / Safari). File `style.css` dan `app.js` otomatis termuat.