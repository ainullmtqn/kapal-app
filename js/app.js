let allPelayaran = [];
let allRincian = [];
let filteredPelayaran = [];
let currentFilterPill = 'SEMUA';
let currentDashChip = 'SEMUA';
let currentTab = 'dashboard'; // 'dashboard' | 'kapal' | 'muatan' | 'audit' | 'setting'
let activeKapal = null;
let notaItems = [];
let potonganNominal = 0;
let autoSaveTimer = null;
let dailyChartInstance = null;
let currentChartRangeDays = 7;

// ==========================================
// FITUR KEAMANAN OPERASIONAL & PROTEKSI DATA
// ==========================================
let lastSyncTimestamp = 0;        // Anti-Spam Rate Limiter Cooldown
let isWebhookLocked = true;       // Kunci URL Webhook
let isWebhookVisible = false;     // Masking Sandi Webhook
let lastDataSignature = "";       // Sidik Jari Data untuk Deteksi Perubahan Realtime
let autoSyncTimer = null;         // Timer Polling Latar Belakang
let isSilentChecking = false;     // Proteksi Request Latar Belakang Simultan

// Sanitasi Input Anti-XSS (Script Injection Protection & HTML Entity Encoding)
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  const s = String(str);
  // Mencegah double-escaping jika entitas HTML sudah ada sebelumnya
  return s
    .replace(/&(?!amp;|lt;|gt;|quot;|#039;|#x27;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Sanitasi Input String Pengguna
function sanitizeInput(str) {
  if (str === null || str === undefined) return "";
  return escapeHtml(String(str).trim());
}

// Notifikasi Melayang Khusus Keamanan & Proteksi
function showSecurityToast(msg) {
  let toast = document.getElementById("securityToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "securityToast";
    toast.className = "security-toast";
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span style="margin-right: 6px;">🛡️</span><span>${escapeHtml(msg)}</span>`;
  toast.classList.add("show");
  if (window._securityToastTimer) clearTimeout(window._securityToastTimer);
  window._securityToastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// ==========================================
// FORMATTER & VALIDASI TIPE DATA ANGKA & TANGGAL
// ==========================================

// Validasi Tipe Data Angka Ongkir Non-Negatif
function validateOngkir(val) {
  if (val === null || val === undefined || val === "") return 0;
  let num;
  if (typeof val === "number") {
    num = val;
  } else {
    const str = String(val).trim();
    // Tolak jika nilai negatif atau mengandung karakter berbahaya / huruf
    if (str.includes("-") || /[<>"'&;a-zA-Z]/.test(str)) {
      return 0;
    }
    const digits = str.replace(/\D/g, "");
    if (!digits) return 0;
    num = Number(digits);
  }
  if (typeof num !== "number" || isNaN(num) || !isFinite(num) || num <= 0) {
    return 0;
  }
  return Math.round(num);
}

function formatDots(val) {
  if (!val && val !== 0) return "0";
  let num = validateOngkir(val);
  if (!num) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
}

function parseDots(str) {
  return validateOngkir(str);
}

function formatRp(n) {
  const safeNum = validateOngkir(n);
  return new Intl.NumberFormat("id-ID").format(safeNum);
}

// Validasi Tipe Data Format Tanggal (Anti-XSS & Format Guard)
function validateDateFormat(tglStr) {
  if (!tglStr && tglStr !== 0) return false;
  if (tglStr instanceof Date && !isNaN(tglStr.getTime())) return true;
  
  const str = String(tglStr).trim();
  if (!str) return false;

  // Proteksi XSS: Tolak jika mengandung karakter berbahaya / tag HTML / kurung kode
  if (/[<>"'&;()]/.test(str)) return false;

  // 1. Format YYYY-MM-DD atau ISO Date (e.g. 2026-10-23)
  if (/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])(?:T.*)?$/.test(str)) {
    return true;
  }

  // 2. Format DD/MM/YYYY atau DD-MM-YYYY
  if (/^(?:0?[1-9]|[12]\d|3[01])[\/\-](?:0?[1-9]|1[0-2])[\/\-]\d{4}$/.test(str)) {
    return true;
  }

  // 3. Format YYYY/MM/DD
  if (/^\d{4}[\/\-](?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])$/.test(str)) {
    return true;
  }

  // 4. Format Tanggal Teks Bahasa Indonesia (e.g. 23 Oktober 2026)
  if (/^(?:0?[1-9]|[12]\d|3[01])\s+[a-zA-Z]{3,10}\s+\d{4}$/.test(str)) {
    const match = str.match(/^(?:0?[1-9]|[12]\d|3[01])\s+([a-zA-Z]{3,10})\s+\d{4}$/);
    if (match) {
      const mStr = match[1].toLowerCase().substring(0, 3);
      const validMonths = ['jan', 'feb', 'mar', 'apr', 'mei', 'may', 'jun', 'jul', 'ags', 'agt', 'aug', 'sep', 'okt', 'oct', 'nov', 'des', 'dec'];
      if (validMonths.includes(mStr)) return true;
    }
  }

  // 5. Cek objek tanggal JS standar yang valid tanpa tag HTML
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && /^\d{4}/.test(parsed.getFullYear().toString())) {
    return true;
  }

  return false;
}

function formatTanggalIndo(dateObj = new Date()) {
  const hariArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulanArr = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const hari = hariArr[dateObj.getDay()];
  const tgl = dateObj.getDate();
  const bln = bulanArr[dateObj.getMonth()];
  const thn = dateObj.getFullYear();
  return `${hari}, ${tgl} ${bln} ${thn}`;
}

// Normalisasi Tanggal ke Format Standar YYYY-MM-DD
function normalizeDateKey(tglStr) {
  if (!tglStr && tglStr !== 0) return "";
  
  // Validasi format tanggal & tangkal XSS injection
  if (!validateDateFormat(tglStr)) {
    return escapeHtml(String(tglStr).replace(/[<>"'&]/g, "")).trim();
  }

  if (tglStr instanceof Date && !isNaN(tglStr.getTime())) {
    const yr = tglStr.getFullYear();
    const mo = String(tglStr.getMonth() + 1).padStart(2, '0');
    const da = String(tglStr.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }
  let str = tglStr.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const d = dmy[1].padStart(2, '0');
    const m = dmy[2].padStart(2, '0');
    const y = dmy[3];
    return `${y}-${m}-${d}`;
  }
  const ymdSlash = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdSlash) {
    const y = ymdSlash[1];
    const m = ymdSlash[2].padStart(2, '0');
    const d = ymdSlash[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const indoMatch = str.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (indoMatch) {
    const d = indoMatch[1].padStart(2, '0');
    const mStr = indoMatch[2].toLowerCase().substring(0, 3);
    const y = indoMatch[3];
    const monthMap = {
      jan: '01', feb: '02', mar: '03', apr: '04', mei: '05', may: '05',
      jun: '06', jul: '07', ags: '08', agt: '08', aug: '08', sep: '09',
      okt: '10', oct: '10', nov: '11', des: '12', dec: '12'
    };
    if (monthMap[mStr]) {
      return `${y}-${monthMap[mStr]}-${d}`;
    }
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const yr = parsed.getFullYear();
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    const da = String(parsed.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }
  return escapeHtml(str);
}

// Identifikasi Trip Unik Berdasarkan Kombinasi [Nama Kapal] + [Tanggal]
function getNormalizedTripId(namaKapal, tanggal, fallbackKunci = "") {
  const k = (namaKapal || "").toString().trim();
  const rawTgl = (tanggal || "").toString().trim();
  const normDate = normalizeDateKey(rawTgl);

  if (k && normDate) {
    return `${k}_${normDate}`;
  }
  if (k && rawTgl) {
    return `${k}_${rawTgl}`;
  }
  if (fallbackKunci && String(fallbackKunci).trim()) {
    return String(fallbackKunci).trim();
  }
  return k || normDate || "trip_unknown";
}

// Pengecekan Presisi Apakah Rincian Milik Trip Kapal Tertentu
function isSameTripRecord(r, kapal) {
  if (!r || !kapal) return false;

  const rKapal = (r.nama_kapal || "").trim().toLowerCase();
  const kKapal = (kapal.nama_kapal || "").trim().toLowerCase();

  // 1. Jika nama kapal sama: wajib cocokkan tanggal jika keduanya memiliki tanggal
  if (rKapal && kKapal && rKapal === kKapal) {
    const rDate = normalizeDateKey(r.tanggal);
    const kDate = normalizeDateKey(kapal.tanggal);
    if (rDate && kDate) {
      return rDate === kDate;
    }
    if (r.tanggal && kapal.tanggal) {
      const rTgl = String(r.tanggal).trim().toLowerCase();
      const kTgl = String(kapal.tanggal).trim().toLowerCase();
      if (rTgl === kTgl) return true;
      const cleanR = rTgl.replace(/[^0-9]/g, "");
      const cleanK = kTgl.replace(/[^0-9]/g, "");
      if (cleanR && cleanK) {
        return cleanR === cleanK;
      }
    }
  }

  // 2. Cocokkan trip ID unik berbasis kombinasi [nama kapal] + [tanggal]
  const rTripId = getNormalizedTripId(r.nama_kapal, r.tanggal, r.kunci_unik).trim().toLowerCase();
  const kTripId = getNormalizedTripId(kapal.nama_kapal, kapal.tanggal, kapal.kunci_unik).trim().toLowerCase();
  if (rTripId && kTripId && rTripId === kTripId) {
    return true;
  }

  return false;
}

// Normalisasi Seluruh Kunci Unik pada Kumpulan Data Pelayaran dan Rincian
function normalizeDatasetTripIds(pelayaranList, rincianList) {
  if (Array.isArray(pelayaranList)) {
    pelayaranList.forEach(p => {
      if (p) {
        p.kunci_unik = getNormalizedTripId(p.nama_kapal, p.tanggal, p.kunci_unik);
      }
    });
  }
  if (Array.isArray(rincianList)) {
    rincianList.forEach(r => {
      if (r) {
        r.kunci_unik = getNormalizedTripId(r.nama_kapal, r.tanggal, r.kunci_unik);
      }
    });
  }
}

// ==========================================
// INISIALISASI APLIKASI & CACHE OFFLINE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const dateEl = document.getElementById("currentDateDisplay");
  if (dateEl) dateEl.textContent = formatTanggalIndo();

  // Inisialisasi Proteksi Webhook
  const savedWebhook = localStorage.getItem("GAS_WEBHOOK_URL") || "";
  const inpWebhook = document.getElementById("webhookInput");
  if (inpWebhook) {
    inpWebhook.value = savedWebhook;
    inpWebhook.type = "password";
    inpWebhook.readOnly = true;
    inpWebhook.classList.add("input-locked");
  }

  // 1. Muat Cache Offline terlebih dahulu (Instant 0ms display)
  try {
    const cachedPel = localStorage.getItem("CACHE_PELAYARAN");
    const cachedRin = localStorage.getItem("CACHE_RINCIAN");
    if (cachedPel && cachedRin) {
      allPelayaran = JSON.parse(cachedPel) || [];
      allRincian = JSON.parse(cachedRin) || [];
      if (allPelayaran.length > 0) {
        normalizeDatasetTripIds(allPelayaran, allRincian);
        lastDataSignature = computeDataSignature(allPelayaran, allRincian);
        updateStatusBadge("cache", "Cache", ` (${allPelayaran.length} Kapal)`);
        renderDashboard();
        filterData();
        renderSemuaMuatan();
        renderAuditTab();
      }
    }
  } catch (err) {
    console.warn("Gagal membaca cache lokal:", err);
  }

  // 2. Setup Dismiss Modal (Backdrop Click & ESC Key)
  const modal = document.getElementById("notaModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) tutupNota();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      tutupNota();
    }
  });

  // 3. Proteksi Perubahan Belum Disimpan (BeforeUnload Guard)
  window.addEventListener("beforeunload", (e) => {
    if (autoSaveTimer !== null) {
      e.preventDefault();
      e.returnValue = "Perubahan nota sedang disimpan ke server. Tetap ingin menutup halaman?";
      return e.returnValue;
    }
  });

  // 4. Tarik data terbaru dari Google Apps Script
  if (savedWebhook) {
    tarikSemuaData();
  } else if (allPelayaran.length === 0) {
    updateStatusBadge("offline", "Belum Diatur");
  }

  // 5. Inisialisasi Real-Time Auto Sync (Silent Polling & Diffing)
  startRealtimeSync(25);

  // Periksa seketika saat pengguna membuka kembali tab browser
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && localStorage.getItem("GAS_WEBHOOK_URL")) {
      cekDataBaruSilent();
    }
  });
});

function updateStatusBadge(status, text, countText = "") {
  const badge = document.getElementById("statusBadge");
  const badgeText = document.getElementById("statusBadgeText");
  const badgeCount = document.getElementById("statusBadgeCount");
  const radarDot = document.getElementById("radarDot");
  if (!badge || !badgeText) return;

  badgeText.textContent = text;
  if (badgeCount) {
    badgeCount.textContent = countText;
  }
  
  // Set class agar styling CSS rapi dan responsif
  badge.className = `status-badge status-${status}`;
  if (radarDot) {
    radarDot.className = `radar-dot dot-${status}`;
  }
}

// ==========================================
// KONEKSI WEBHOOK GOOGLE APPS SCRIPT
// DILENGKAPI ANTI-SPAM RATE LIMITER
// ==========================================
async function tarikSemuaData() {
  // Keamanan Fitur: Anti-Spam Rate Limiter (Cooldown 4 detik)
  const now = Date.now();
  if (now - lastSyncTimestamp < 4000) {
    const sisa = Math.ceil((4000 - (now - lastSyncTimestamp)) / 1000);
    showSecurityToast(`⏳ Harap tunggu ${sisa} detik sebelum menyegarkan data lagi.`);
    return;
  }
  lastSyncTimestamp = now;

  const url = localStorage.getItem("GAS_WEBHOOK_URL");
  if (!url) {
    showSecurityToast("⚠️ Webhook Apps Script belum diatur!");
    switchTab('setting');
    return;
  }

  updateStatusBadge("loading", "Menghubungkan...");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP Status " + res.status);
    const data = await res.json();

    if (data.status === "sukses") {
      allPelayaran = data.pelayaran || [];
      allRincian = data.rincian || [];
      
      normalizeDatasetTripIds(allPelayaran, allRincian);
      allPelayaran.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
      lastDataSignature = computeDataSignature(allPelayaran, allRincian);

      // Simpan ke Cache Offline
      try {
        localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
        localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      } catch (cacheErr) {
        console.warn("Penyimpanan cache gagal:", cacheErr);
      }
      
      updateStatusBadge("online", "Online", ` (${allPelayaran.length} Kapal)`);
      if (document.getElementById("countMuatan")) {
        document.getElementById("countMuatan").textContent = allRincian.length;
      }

      renderDashboard();
      filterData();
      renderSemuaMuatan();
      renderAuditTab();
      showSecurityToast(`✓ Data terbaru disinkronkan (${allPelayaran.length} kapal).`);
    } else {
      updateStatusBadge("offline", "Kendala DB");
      alert("Gagal membaca database: " + (data.pesan || "Terjadi kesalahan"));
    }
  } catch (e) {
    console.error("Gagal menarik data:", e);
    if (allPelayaran.length > 0) {
      updateStatusBadge("offline", "Offline", " (Cache)");
      showSecurityToast("⚠️ Gagal terhubung ke server. Menggunakan data cache lokal.");
    } else {
      updateStatusBadge("offline", "Offline");
    }
  }
}

// ==========================================
// SINKRONISASI REALTIME & DATA DIFFING (AUTO-REFRESH)
// ==========================================

// Menghitung sidik jari (fingerprint) data untuk mendeteksi perubahan dari Spreadsheet
function computeDataSignature(pelayaran, rincian) {
  if (!Array.isArray(pelayaran) && !Array.isArray(rincian)) return "";

  const pList = (pelayaran || []).map(p => 
    `${p.kunci_unik || ''}_${p.tanggal || ''}_${p.nama_kapal || ''}_${p.juragan || ''}_${p.lokasi_muat || ''}_${p.total_hitung || 0}_${p.status_selisih || ''}_${p.resi || ''}_${p.subtotal_ongkir || 0}_${p.potongan || 0}_${p.total_bersih || 0}`
  ).join("|");

  const rList = (rincian || []).map(r => 
    `${r.kunci_unik || ''}_${r.nama_pemilik || ''}_${r.jumlah || 0}_${r.ongkir || 0}`
  ).join("|");

  return `${(pelayaran || []).length}#${(rincian || []).length}#${pList}#${rList}`;
}

// Cek perubahan data di latar belakang tanpa me-reload atau mengedipkan tampilan
async function cekDataBaruSilent() {
  // 1. Lewatkan jika tab sedang diminimalkan, sedang mengecek, atau user sedang mengetik
  if (document.hidden || isSilentChecking || autoSaveTimer !== null) return;

  // 2. Jika modal nota sedang aktif terbuka, tunda update agar tidak mengganggu pengetikan pengguna
  const modal = document.getElementById("notaModal");
  if (modal && modal.classList.contains("active")) return;

  const url = localStorage.getItem("GAS_WEBHOOK_URL");
  if (!url) return;

  isSilentChecking = true;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();

    if (data.status === "sukses") {
      const dataBaruPelayaran = data.pelayaran || [];
      const dataBaruRincian = data.rincian || [];
      normalizeDatasetTripIds(dataBaruPelayaran, dataBaruRincian);
      const newSignature = computeDataSignature(dataBaruPelayaran, dataBaruRincian);

      // JIKA DATA SAMA PERSIS: Jangan lakukan apa-apa (Zero Disruption, tidak ada refresh)
      if (lastDataSignature !== "" && lastDataSignature === newSignature) {
        return;
      }

      // JIKA TERBACA DATA BARU / PERUBAHAN DI SPREADSHEET:
      const totalKapalSebelumnya = allPelayaran.length;
      lastDataSignature = newSignature;
      allPelayaran = dataBaruPelayaran;
      allRincian = dataBaruRincian;
      allPelayaran.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));

      // Simpan ke Cache Offline
      try {
        localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
        localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      } catch (_) {}

      updateStatusBadge("online", "Online", ` (${allPelayaran.length} Kapal)`);
      if (document.getElementById("countMuatan")) {
        document.getElementById("countMuatan").textContent = allRincian.length;
      }

      // Perbarui tampilan aktif secara otomatis dan mulus
      renderDashboard();
      if (currentTab === 'kapal') filterData();
      if (currentTab === 'muatan') renderSemuaMuatan();
      if (currentTab === 'audit') renderAuditTab();

      // Notifikasi halus kepada pengguna
      if (allPelayaran.length > totalKapalSebelumnya) {
        showSecurityToast(`🚢 Data baru terdeteksi dari Spreadsheet! Total: ${allPelayaran.length} kapal.`);
      } else {
        showSecurityToast("✨ Perubahan data dari Spreadsheet berhasil disinkronkan.");
      }
    }
  } catch (err) {
    console.warn("Pengecekan data baru di latar belakang dilewati:", err);
  } finally {
    isSilentChecking = false;
  }
}

// Menjalankan pemeriksaan otomatis berkala
function startRealtimeSync(intervalDetik = 25) {
  stopRealtimeSync();
  autoSyncTimer = setInterval(cekDataBaruSilent, intervalDetik * 1000);
}

// Menghentikan pemeriksaan otomatis berkala
function stopRealtimeSync() {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }
}

// ==========================================
// PROTEKSI PENGATURAN & MASKING WEBHOOK
// ==========================================
function toggleWebhookLock() {
  isWebhookLocked = !isWebhookLocked;
  const btn = document.getElementById("btnToggleWebhookLock");
  const inp = document.getElementById("webhookInput");

  if (isWebhookLocked) {
    if (btn) {
      btn.className = "btn-lock-toggle is-locked";
      btn.textContent = "🔒 Kunci URL Aktif";
    }
    if (inp) {
      inp.readOnly = true;
      inp.classList.add("input-locked");
    }
    showSecurityToast("🔒 URL Webhook dikunci untuk keamanan.");
  } else {
    if (btn) {
      btn.className = "btn-lock-toggle is-unlocked";
      btn.textContent = "🔓 Buka Kunci URL";
    }
    if (inp) {
      inp.readOnly = false;
      inp.classList.remove("input-locked");
      inp.focus();
    }
    showSecurityToast("🔓 URL Webhook terbuka. Berhati-hatilah saat mengubah endpoint.");
  }
}

function toggleWebhookVisibility() {
  const inp = document.getElementById("webhookInput");
  const btn = document.getElementById("btnToggleWebhookEye");
  if (!inp) return;

  isWebhookVisible = !isWebhookVisible;
  if (isWebhookVisible) {
    inp.type = "text";
    if (btn) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      `;
      btn.title = "Sembunyikan URL Webhook";
    }
  } else {
    inp.type = "password";
    if (btn) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `;
      btn.title = "Tampilkan URL Webhook";
    }
  }
}

function simpanWebhook() {
  const inp = document.getElementById("webhookInput");
  const val = inp ? inp.value.trim() : "";
  if (!val) {
    showSecurityToast("⚠️ Masukkan URL Webhook Google Apps Script terlebih dahulu!");
    return;
  }

  // Protokol Keamanan: Wajib HTTPS
  if (!val.startsWith("https://")) {
    alert("Protokol Keamanan: URL Webhook wajib menggunakan koneksi aman https://");
    return;
  }

  localStorage.setItem("GAS_WEBHOOK_URL", val);

  // Kunci kembali secara otomatis setelah simpan
  isWebhookLocked = true;
  isWebhookVisible = false;
  inp.type = "password";
  inp.readOnly = true;
  inp.classList.add("input-locked");
  const btnLock = document.getElementById("btnToggleWebhookLock");
  if (btnLock) {
    btnLock.className = "btn-lock-toggle is-locked";
    btnLock.textContent = "🔒 Kunci URL Aktif";
  }

  showSecurityToast("✓ Webhook berhasil disimpan & dikunci dengan aman!");
  setTimeout(() => {
    switchTab('dashboard');
    tarikSemuaData();
  }, 400);
}

// ==========================================
// CADANGAN & PEMULIHAN MANDIRI (JSON BACKUP)
// ==========================================
function eksporCadanganData() {
  if (allPelayaran.length === 0 && allRincian.length === 0) {
    showSecurityToast("⚠️ Belum ada data pelayaran untuk dicadangkan.");
    return;
  }

  const backupData = {
    app: "PARENGGEKITA",
    version: "1.0",
    waktu_ekspor: new Date().toISOString(),
    total_kapal: allPelayaran.length,
    total_rincian: allRincian.length,
    pelayaran: allPelayaran,
    rincian: allRincian
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const dlAnchor = document.createElement("a");
  const tglSekarang = new Date().toISOString().slice(0, 10);
  const jamSekarang = new Date().toTimeString().slice(0, 5).replace(":", "");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `Cadangan_Manifes_Kapal_${tglSekarang}_${jamSekarang}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();

  showSecurityToast(`✓ Cadangan ${allPelayaran.length} kapal berhasil diunduh!`);
}

function triggerImporCadangan() {
  const input = document.getElementById("backupFileInput");
  if (input) {
    input.value = "";
    input.click();
  }
}

function handleFileImporCadangan(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const content = evt.target.result;
      const parsed = JSON.parse(content);

      // Validasi Skema Data Cadangan
      if (!parsed || !Array.isArray(parsed.pelayaran)) {
        throw new Error("Format file JSON tidak valid (array 'pelayaran' tidak ditemukan).");
      }

      const jmlKapal = parsed.pelayaran.length;
      const jmlRincian = Array.isArray(parsed.rincian) ? parsed.rincian.length : 0;

      const konfirmasi = confirm(
        `Pulihkan Data dari Cadangan Mandiri?\n\n` +
        `• Jumlah Kapal: ${jmlKapal}\n` +
        `• Jumlah Rincian Muatan: ${jmlRincian}\n` +
        `• Waktu Cadangan: ${parsed.waktu_ekspor || "Tidak tercatat"}\n\n` +
        `Data lokal saat ini (${allPelayaran.length} kapal) akan digantikan dengan isi cadangan ini. Lanjutkan?`
      );

      if (!konfirmasi) {
        showSecurityToast("Pemulihan data dibatalkan.");
        return;
      }

      allPelayaran = parsed.pelayaran;
      allRincian = parsed.rincian || [];
      normalizeDatasetTripIds(allPelayaran, allRincian);

      // Simpan ke Cache Offline
      try {
        localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
        localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      } catch (cErr) {
        console.warn("Gagal simpan ke cache:", cErr);
      }

      updateStatusBadge("cache", "Cadangan", ` (${allPelayaran.length} Kapal)`);
      if (document.getElementById("countMuatan")) {
        document.getElementById("countMuatan").textContent = allRincian.length;
      }

      renderDashboard();
      filterData();
      renderSemuaMuatan();
      renderAuditTab();

      showSecurityToast(`✓ ${jmlKapal} kapal berhasil dipulihkan dari cadangan!`);
    } catch (err) {
      console.error("Gagal membaca file cadangan:", err);
      alert("Gagal memulihkan file cadangan: " + err.message);
    }
  };
  reader.readAsText(file);
}

function bersihkanCache() {
  if (confirm("Peringatan Keamanan: Bersihkan seluruh cache lokal pelayaran dan muatan di perangkat ini?")) {
    localStorage.removeItem("CACHE_PELAYARAN");
    localStorage.removeItem("CACHE_RINCIAN");
    showSecurityToast("✓ Cache lokal berhasil dibersihkan.");
    setTimeout(() => location.reload(), 500);
  }
}

// ==========================================
// RENDER TAB 1: BERANDA (DASHBOARD)
// ==========================================
function renderDashboard() {
  const totalKapal = allPelayaran.length;
  const totalGabus = allPelayaran.reduce((sum, p) => sum + (Number(p.total_hitung) || 0), 0);
  
  // Hitung Parengge Unik
  let parenggeMap = {};
  allRincian.forEach(r => {
    let rawName = (r.nama_pemilik || "Tanpa Nama").trim();
    let key = rawName.toLowerCase();
    if (!parenggeMap[key]) parenggeMap[key] = true;
  });
  const totalParengge = Object.keys(parenggeMap).length;

  const selisihList = allPelayaran.filter(p => p.status_selisih !== "SESUAI");

  // 1. Update 4 KPI Cards
  const kpiKapal = document.getElementById("kpiKapalOnline");
  if (kpiKapal) kpiKapal.textContent = `${totalKapal} Kapal`;

  const kpiGabus = document.getElementById("kpiTotalGabus");
  if (kpiGabus) kpiGabus.textContent = `${formatDots(totalGabus)} Gabus`;

  const kpiParengge = document.getElementById("kpiTotalParengge");
  if (kpiParengge) kpiParengge.textContent = `${totalParengge} Parengge`;

  const kpiAudit = document.getElementById("kpiStatusAudit");
  const kpiSubAudit = document.getElementById("kpiSubAudit");
  const navAuditBadge = document.getElementById("navAuditBadge");

  if (kpiAudit) {
    if (selisihList.length === 0) {
      kpiAudit.textContent = "Semua Sesuai ✓";
      kpiAudit.style.color = "var(--success-text)";
      if (kpiSubAudit) kpiSubAudit.textContent = "0 Selisih hitung";
    } else {
      kpiAudit.textContent = `${selisihList.length} Selisih`;
      kpiAudit.style.color = "var(--warning-text)";
      if (kpiSubAudit) kpiSubAudit.textContent = "Perlu verifikasi";
    }
  }

  // 2. Alert Banner & Audit Badge
  const alertBanner = document.getElementById("alertBanner");
  const alertDesc = document.getElementById("alertDesc");

  if (selisihList.length > 0) {
    if (alertBanner) alertBanner.style.display = "flex";
    if (alertDesc) alertDesc.textContent = `Ditemukan ${selisihList.length} kapal pelayaran dengan status muatan selisih.`;
    if (navAuditBadge) {
      navAuditBadge.style.display = "inline-block";
      navAuditBadge.textContent = selisihList.length;
    }
  } else {
    if (alertBanner) alertBanner.style.display = "none";
    if (navAuditBadge) navAuditBadge.style.display = "none";
  }

  // 3. Render Grafik Tren Harian Kapal & Gabus
  renderDailyChart();
}

// ==========================================
// GRAFIK HARIAN KAPAL PENGANGKUT & GABUS
// ==========================================

function formatChartDateShort(dKey) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dKey)) {
    const [y, m, d] = dKey.split("-");
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    const dayArr = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const blnArr = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return `${dayArr[dt.getDay()]}, ${Number(d)} ${blnArr[dt.getMonth()]}`;
  }
  return dKey;
}

function formatChartDateLong(dKey) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dKey)) {
    const [y, m, d] = dKey.split("-");
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    const hariArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulanArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${hariArr[dt.getDay()]}, ${Number(d)} ${bulanArr[dt.getMonth()]} ${y}`;
  }
  return dKey;
}

function setChartRange(days, btnEl) {
  currentChartRangeDays = Number(days);
  document.querySelectorAll('#chartRangePills .chart-pill-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderDailyChart();
}

function updateChartMiniStats(avgKapal, avgGabus, peakGabus, totalDays) {
  const elAvgKapal = document.getElementById("statAvgKapal");
  const elAvgGabus = document.getElementById("statAvgGabus");
  const elPeakGabus = document.getElementById("statPeakGabus");
  const elTotalDays = document.getElementById("statTotalDays");

  if (elAvgKapal) elAvgKapal.textContent = `${formatDots(avgKapal)} / hari`;
  if (elAvgGabus) elAvgGabus.textContent = `${formatDots(avgGabus)} Gabus / hari`;
  if (elPeakGabus) elPeakGabus.textContent = peakGabus || "-";
  if (elTotalDays) elTotalDays.textContent = `${totalDays} Hari`;
}

function renderDailyChart() {
  const canvas = document.getElementById("dailyShipGabusChart");
  const emptyState = document.getElementById("chartEmptyState");
  if (!canvas) return;

  const sourceList = allPelayaran;

  if (!sourceList || sourceList.length === 0) {
    if (dailyChartInstance) {
      dailyChartInstance.destroy();
      dailyChartInstance = null;
    }
    canvas.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
    updateChartMiniStats(0, 0, "-", 0);
    return;
  }

  // Agregasi harian: Jumlah kapal pengangkut dan total gabus per tanggal
  const dateMap = {};
  sourceList.forEach(p => {
    const dKey = normalizeDateKey(p.tanggal);
    if (!dKey) return;
    if (!dateMap[dKey]) {
      dateMap[dKey] = {
        dateKey: dKey,
        kapalList: [],
        totalGabus: 0
      };
    }
    dateMap[dKey].kapalList.push(p.nama_kapal || "Tanpa Nama");
    dateMap[dKey].totalGabus += (Number(p.total_hitung) || 0);
  });

  let sortedDates = Object.keys(dateMap).sort();
  if (sortedDates.length === 0) {
    if (dailyChartInstance) {
      dailyChartInstance.destroy();
      dailyChartInstance = null;
    }
    canvas.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
    updateChartMiniStats(0, 0, "-", 0);
    return;
  }

  // Filter rentang hari (7 hari, 14 hari, 30 hari, atau semua)
  if (currentChartRangeDays > 0 && sortedDates.length > currentChartRangeDays) {
    sortedDates = sortedDates.slice(-currentChartRangeDays);
  }

  canvas.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  const labels = sortedDates.map(dKey => formatChartDateShort(dKey));
  const gabusData = sortedDates.map(dKey => dateMap[dKey].totalGabus);
  const kapalData = sortedDates.map(dKey => dateMap[dKey].kapalList.length);
  const shipNamesList = sortedDates.map(dKey => dateMap[dKey].kapalList);
  const fullDatesList = sortedDates.map(dKey => formatChartDateLong(dKey));

  // Hitung metrik ringkasan
  const totalHari = sortedDates.length;
  const sumKapal = kapalData.reduce((a, b) => a + b, 0);
  const sumGabus = gabusData.reduce((a, b) => a + b, 0);
  let peakGabusVal = -1;
  let peakGabusDate = "";
  sortedDates.forEach(dKey => {
    if (dateMap[dKey].totalGabus > peakGabusVal) {
      peakGabusVal = dateMap[dKey].totalGabus;
      peakGabusDate = formatChartDateShort(dKey);
    }
  });

  updateChartMiniStats(
    totalHari > 0 ? Math.round(sumKapal / totalHari) : 0,
    totalHari > 0 ? Math.round(sumGabus / totalHari) : 0,
    peakGabusVal >= 0 ? `${formatDots(peakGabusVal)} Gabus (${peakGabusDate})` : "-",
    totalHari
  );

  if (typeof Chart === "undefined") {
    console.warn("Library Chart.js belum tersedia.");
    return;
  }

  if (dailyChartInstance) {
    dailyChartInstance.data.labels = labels;
    dailyChartInstance.data.datasets[0].data = gabusData;
    dailyChartInstance.data.datasets[1].data = kapalData;
    dailyChartInstance.data.datasets[0].customShipNames = shipNamesList;
    dailyChartInstance.data.datasets[0].customFullDates = fullDatesList;
    dailyChartInstance.update();
    return;
  }

  const isMobile = window.innerWidth <= 640;
  const ctx = canvas.getContext("2d");
  const gabusGradient = ctx.createLinearGradient(0, 0, 0, 300);
  gabusGradient.addColorStop(0, 'rgba(12, 35, 64, 0.95)');
  gabusGradient.addColorStop(1, 'rgba(56, 136, 204, 0.7)');

  dailyChartInstance = new Chart(ctx, {
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Total Muatan Gabus',
          data: gabusData,
          yAxisID: 'yGabus',
          backgroundColor: gabusGradient,
          hoverBackgroundColor: '#2b75b3',
          borderRadius: isMobile ? 4 : 6,
          borderSkipped: false,
          maxBarThickness: isMobile ? 22 : 42,
          order: 2,
          customShipNames: shipNamesList,
          customFullDates: fullDatesList
        },
        {
          type: 'line',
          label: 'Jumlah Kapal Pengangkut',
          data: kapalData,
          yAxisID: 'yKapal',
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          borderWidth: isMobile ? 2.2 : 3,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ea580c',
          pointBorderWidth: isMobile ? 2 : 2.5,
          pointRadius: isMobile ? 3.5 : 4.5,
          pointHoverRadius: isMobile ? 5.5 : 7,
          pointHoverBackgroundColor: '#ea580c',
          pointHoverBorderColor: '#ffffff',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(12, 35, 64, 0.95)',
          titleColor: '#ffffff',
          titleFont: {
            family: 'Plus Jakarta Sans',
            size: isMobile ? 11 : 13,
            weight: '700'
          },
          bodyColor: '#e2e8f0',
          bodyFont: {
            family: 'Plus Jakarta Sans',
            size: isMobile ? 10 : 12,
            weight: '500'
          },
          padding: isMobile ? 8 : 12,
          cornerRadius: 8,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            title: function(items) {
              if (!items || items.length === 0) return "";
              const idx = items[0].dataIndex;
              const fullDates = items[0].chart.data.datasets[0].customFullDates;
              return (fullDates && fullDates[idx]) ? fullDates[idx] : items[0].label;
            },
            label: function(context) {
              if (context.dataset.yAxisID === 'yGabus') {
                return ` 📦 Muatan Gabus: ${formatDots(context.parsed.y)} Gabus`;
              }
              if (context.dataset.yAxisID === 'yKapal') {
                const idx = context.dataIndex;
                const ships = context.chart.data.datasets[0].customShipNames ? context.chart.data.datasets[0].customShipNames[idx] : [];
                let shipStr = "";
                if (ships && ships.length > 0) {
                  if (ships.length <= 3) {
                    shipStr = ` (${ships.join(', ')})`;
                  } else {
                    shipStr = ` (${ships.slice(0, 2).join(', ')} +${ships.length - 2} kapal)`;
                  }
                }
                return ` 🚢 Kapal Pengangkut: ${context.parsed.y} Kapal${shipStr}`;
              }
              return ` ${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '600',
              size: isMobile ? 9 : 11
            },
            maxRotation: isMobile ? 35 : 45,
            minRotation: isMobile ? 35 : 0,
            autoSkip: true,
            maxTicksLimit: isMobile ? 7 : 14
          }
        },
        yGabus: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: {
            display: !isMobile,
            text: '📦 Total Gabus',
            color: '#1e40af',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '700',
              size: 11
            }
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'Plus Jakarta Sans',
              size: isMobile ? 9 : 10
            },
            callback: function(val) {
              if (isMobile && val >= 1000) {
                return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
              }
              return formatDots(val);
            }
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.7)'
          }
        },
        yKapal: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: {
            display: !isMobile,
            text: '🚢 Kapal',
            color: '#ea580c',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '700',
              size: 11
            }
          },
          ticks: {
            stepSize: 1,
            precision: 0,
            color: '#ea580c',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '600',
              size: isMobile ? 9 : 10
            },
            callback: function(val) {
              return isMobile ? val : (val + ' Kapal');
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// ==========================================
// RENDER TAB 2: DAFTAR SEMUA KAPAL
// ==========================================
function setPillFilter(type, el) {
  document.querySelectorAll('#filterPillsWrap .pill-btn').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  currentFilterPill = type;
  filterData();
}

function filterData() {
  const searchInput = document.getElementById("searchInput");
  const rawQ = searchInput ? searchInput.value : "";
  const q = sanitizeInput(rawQ).toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];

  filteredPelayaran = allPelayaran.filter(p => {
    const matchSearch = !q || 
      (p.nama_kapal || "").toLowerCase().includes(q) ||
      (p.juragan || "").toLowerCase().includes(q) ||
      (p.lokasi_muat || "").toLowerCase().includes(q) ||
      (p.tanggal || "").toLowerCase().includes(q);

    let matchPill = true;
    if (currentFilterPill === 'HARI_INI') {
      matchPill = (p.tanggal === todayStr);
    } else if (currentFilterPill === 'KALMAS') {
      const lok = (p.lokasi_muat || "").toLowerCase();
      const nKapal = (p.nama_kapal || "").toLowerCase();
      matchPill = lok.includes('kalmas') || lok.includes('ddc') || lok.includes('ddl') || nKapal.includes('kalmas');
    } else if (currentFilterPill === 'PUMA') {
      const lok = (p.lokasi_muat || "").toLowerCase();
      const nKapal = (p.nama_kapal || "").toLowerCase();
      matchPill = lok.includes('puma') || nKapal.includes('puma');
    }

    return matchSearch && matchPill;
  });

  renderDaftarKapal();
}

function renderDaftarKapal() {
  const container = document.getElementById("shipCardList");
  if (!container) return;
  container.innerHTML = "";

  if (filteredPelayaran.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        Tidak ada data kapal yang sesuai pencarian / filter.
      </div>
    `;
    return;
  }

  filteredPelayaran.forEach((p) => {
    const isOk = p.status_selisih === "SESUAI";
    const badgeClass = isOk ? "badge-status-ok" : "badge-status-warn";
    const badgeLabel = isOk ? "SESUAI ✓" : "SELISIH ⚠️";
    const safeNama = escapeHtml(p.nama_kapal);
    const safeTanggal = validateDateFormat(p.tanggal) ? escapeHtml(normalizeDateKey(p.tanggal)) : escapeHtml(p.tanggal || "-");
    const safeJuragan = escapeHtml(p.juragan || "-");
    const safeLokasi = escapeHtml(p.lokasi_muat || "DDL");
    const tripKey = p.kunci_unik || getNormalizedTripId(p.nama_kapal, p.tanggal);
    const safeKunci = escapeHtml(tripKey).replace(/'/g, "\\'");

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${safeNama}</div>
        <span class="${badgeClass}">${badgeLabel}</span>
      </div>
      <div class="card-meta-list">
        <div>📅 <b>Tanggal:</b> ${safeTanggal}</div>
        <div>👤 <b>Juragan:</b> ${safeJuragan}</div>
        <div>📍 <b>Lokasi Muat:</b> ${safeLokasi}</div>
      </div>
      <div class="card-footer">
        <div class="card-total-box">📦 ${formatDots(p.total_hitung)} Gabus</div>
        <button class="btn-action" onclick="bukaNota('${safeKunci}')">Buka / Cetak Nota</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// RENDER TAB 3: AGREGASI MUATAN PARENGGE
// ==========================================
function filterParenggeTab(query) {
  renderSemuaMuatan(query);
}

function renderSemuaMuatan(searchQuery = "") {
  const container = document.getElementById("allMuatanList");
  if (!container) return;
  container.innerHTML = "";

  if (allRincian.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--warning-text); font-weight: 600;">
        ⚠️ Rincian muatan masih 0.<br>
        <small style="color: var(--text-muted); font-weight: normal;">
          Pastikan Webhook Google Apps Script terhubung dan memiliki rincian muatan.
        </small>
      </div>
    `;
    if (document.getElementById("countMuatan")) {
      document.getElementById("countMuatan").textContent = "0";
    }
    return;
  }

  let aggregatedMap = {};
  allRincian.forEach((r) => {
    let rawName = (r.nama_pemilik || "Tanpa Nama").trim();
    let key = rawName.toLowerCase();
    
    if (!aggregatedMap[key]) {
      aggregatedMap[key] = {
        nama_asli: rawName,
        total_gabus: 0,
        riwayat_pengiriman: []
      };
    }
    
    aggregatedMap[key].total_gabus += Number(r.jumlah) || 0;
    aggregatedMap[key].riwayat_pengiriman.push({
      kapal: r.nama_kapal || "-",
      tanggal: r.tanggal || "-",
      jumlah: Number(r.jumlah) || 0
    });
  });

  let aggregatedList = Object.values(aggregatedMap);

  if (searchQuery) {
    const qLower = searchQuery.toLowerCase();
    aggregatedList = aggregatedList.filter(item => {
      const matchNama = item.nama_asli.toLowerCase().includes(qLower);
      const matchKapal = item.riwayat_pengiriman.some(rip => 
        rip.kapal.toLowerCase().includes(qLower) || rip.tanggal.includes(qLower)
      );
      return matchNama || matchKapal;
    });
  }

  aggregatedList.sort((a, b) => b.total_gabus - a.total_gabus);

  if (document.getElementById("countMuatan")) {
    document.getElementById("countMuatan").textContent = aggregatedList.length;
  }

  if (aggregatedList.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        Tidak ada data kapal parengge yang sesuai dengan pencarian "${escapeHtml(searchQuery)}".
      </div>
    `;
    return;
  }

  aggregatedList.forEach((item) => {
    let card = document.createElement("div");
    card.className = "parengge-card";
    
    let detailHtml = item.riwayat_pengiriman.map(rip => 
      `<div>• Kapal: <b>${escapeHtml(rip.kapal)}</b> (${escapeHtml(rip.tanggal)}) — <b>${rip.jumlah} Gabus</b></div>`
    ).join("");

    card.innerHTML = `
      <div class="parengge-card-header">
        <div>
          <div class="parengge-title">${escapeHtml(item.nama_asli)}</div>
          <div class="parengge-meta">Total Pengiriman: ${item.riwayat_pengiriman.length} kali</div>
        </div>
        <div class="parengge-gabus-badge">
          📦 ${formatDots(item.total_gabus)} G
        </div>
      </div>
      <div class="parengge-history-list">
        ${detailHtml}
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// RENDER TAB 4: AUDIT & SELISIH
// ==========================================
function renderAuditTab() {
  const container = document.getElementById("auditList");
  if (!container) return;
  container.innerHTML = "";

  const selisihList = allPelayaran.filter(p => p.status_selisih !== "SESUAI");

  if (selisihList.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
        <div style="font-weight: 800; font-size: 1.05rem; color: var(--success-text); margin-bottom: 0.25rem;">Seluruh Muatan Fisik SESUAI</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Tidak ditemukan selisih antara manifest perhitungan dan fisik pada kapal pelayaran.</div>
      </div>
    `;
    return;
  }

  selisihList.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.borderLeft = "4px solid var(--warning-text)";
    const safeNama = escapeHtml(p.nama_kapal);
    const safeTanggal = validateDateFormat(p.tanggal) ? escapeHtml(normalizeDateKey(p.tanggal)) : escapeHtml(p.tanggal || "-");
    const safeJuragan = escapeHtml(p.juragan || "-");
    const safeLokasi = escapeHtml(p.lokasi_muat || "DDL");
    const tripKey = p.kunci_unik || getNormalizedTripId(p.nama_kapal, p.tanggal);
    const safeKunci = escapeHtml(tripKey).replace(/'/g, "\\'");

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${safeNama}</div>
        <span class="badge-status-warn">SELISIH ⚠️</span>
      </div>
      <div class="card-meta-list">
        <div>📅 <b>Tanggal:</b> ${safeTanggal}</div>
        <div>👤 <b>Juragan:</b> ${safeJuragan}</div>
        <div>📍 <b>Lokasi Muat:</b> ${safeLokasi}</div>
        <div>📦 <b>Total Hitung:</b> ${formatDots(p.total_hitung)} Gabus</div>
      </div>
      <div class="card-footer">
        <button class="btn-action" onclick="bukaNota('${safeKunci}')" style="background: var(--warning-text); width: 100%; justify-content: center;">
          🔍 Periksa & Edit Nota
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// MODAL NOTA KONTAN CETAK (A6)
// ==========================================
function bukaNota(kunciUnik) {
  if (!kunciUnik && kunciUnik !== 0) return;
  const targetKey = String(kunciUnik).trim().toLowerCase();

  activeKapal = allPelayaran.find(p => {
    const pKunci = (p.kunci_unik || getNormalizedTripId(p.nama_kapal, p.tanggal)).trim().toLowerCase();
    return pKunci === targetKey;
  });

  if (!activeKapal) {
    activeKapal = allPelayaran.find(p => {
      const generated = getNormalizedTripId(p.nama_kapal, p.tanggal).trim().toLowerCase();
      return generated === targetKey;
    });
  }

  if (!activeKapal) return;

  activeKapal.kunci_unik = getNormalizedTripId(activeKapal.nama_kapal, activeKapal.tanggal, activeKapal.kunci_unik);

  const muatanKapal = allRincian.filter(r => isSameTripRecord(r, activeKapal));

  notaItems = muatanKapal.map(m => {
    let ongkirTersimpan = validateOngkir(m.ongkir);
    let gabus = Math.max(0, Math.floor(Number(m.jumlah) || 0));
    return {
      nama: sanitizeInput(m.nama_pemilik || "Tanpa Nama"),
      gabus: gabus,
      ongkir: ongkirTersimpan
    };
  });

  potonganNominal = validateOngkir(activeKapal.potongan);

  renderBlangkoNota();
  updateSaveIndicator("saved");
  document.getElementById("notaModal").classList.add("active");
}

function tutupNota() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
    eksekusiSimpanOtomatis();
  }
  document.getElementById("notaModal").classList.remove("active");
}

function tambahBarisManual() {
  notaItems.push({
    nama: "Kapal Parengge Baru",
    gabus: 1,
    ongkir: 0
  });
  renderBlangkoNota();
  triggerAutoSave();
}

function hapusBaris(idx) {
  const item = notaItems[idx];
  const nama = item ? item.nama : "baris ini";
  if (confirm(`Peringatan: Hapus baris "${nama}" dari nota ini?`)) {
    const itemDihapus = notaItems[idx];
    const namaHapus = (itemDihapus.nama || "").trim().toLowerCase();

    notaItems.splice(idx, 1);

    allRincian = allRincian.filter(r => {
      if (isSameTripRecord(r, activeKapal)) {
        return (r.nama_pemilik || "").trim().toLowerCase() !== namaHapus;
      }
      return true;
    });

    renderBlangkoNota();
    renderSemuaMuatan();
    renderDashboard();
    triggerAutoSave();
    showSecurityToast(`Baris "${nama}" berhasil dihapus.`);
  }
}

// ==========================================
// RENDER BLANGKO NOTA (PRESISI CETAK A6)
// DILENGKAPI SANITASI INPUT ANTI-XSS
// ==========================================
function renderBlangkoNota() {
  const printArea = document.getElementById("notaPrintArea");
  if (!printArea) return;
  if (!activeKapal) return;

  try {
    let rawTgl = activeKapal.tanggal ? String(activeKapal.tanggal) : "";
    let tglStr = escapeHtml(rawTgl);
    try {
      if (rawTgl.includes("-")) {
        const parts = rawTgl.split("-");
        if (parts.length === 3) {
          tglStr = `${parts[2]} - ${parts[1]} - ${parts[0]}`;
        }
      }
    } catch (_) {}

    let resiVal = escapeHtml(activeKapal.resi ? String(activeKapal.resi) : "1");
    const isCompact = Array.isArray(notaItems) && notaItems.length > 6;
    const sheetClass = isCompact ? "nota-sheet compact-sheet" : "nota-sheet";

    let rowsHtml = "";
    if (!notaItems || notaItems.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--danger-text); padding: 8px; font-weight: 600;">
            ⚠️ Rincian muatan kapal ini belum ada / kosong.<br>
            <small style="color: var(--text-muted); font-weight: normal;">
              Klik "+ Tambah Baris Kapal Parengge Manual" di bawah untuk menambahkan.
            </small>
          </td>
        </tr>
      `;
    } else {
      notaItems.forEach((item, idx) => {
        const safeNama = escapeHtml(item ? item.nama : "");
        const safeGabus = Math.max(0, Math.floor(Number(item ? item.gabus : 0) || 0));
        const safeOngkir = validateOngkir(item ? item.ongkir : 0);
        rowsHtml += `
          <tr>
            <td class="cell-no">${idx + 1}</td>
            <td style="padding-left: 5px;">
              <span class="print-text text-left" id="txtPrintNama_${idx}">${safeNama}</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                <input type="text" class="inp-nama no-print" value="${safeNama}" oninput="updateNamaItem(${idx}, this.value)" style="flex: 1;">
                <button type="button" class="btn-del-item no-print" onclick="hapusBaris(${idx})" title="Hapus Baris">🗑️</button>
              </div>
            </td>
            <td style="text-align: center;">
              <span class="print-text text-center" id="txtPrintGabus_${idx}">${safeGabus}</span>
              <input type="number" class="inp-gabus no-print" min="0" value="${safeGabus}" oninput="updateGabusItem(${idx}, this.value)">
            </td>
            <td style="text-align: right; padding-right: 5px;">
              <span class="print-text text-right font-bold" id="txtPrintOngkir_${idx}">${safeOngkir ? formatDots(safeOngkir) : ''}</span>
              <input type="text" inputmode="numeric" class="inp-ongkir no-print" placeholder="0" value="${safeOngkir ? formatDots(safeOngkir) : ''}" oninput="handleOngkirInput(${idx}, this)">
            </td>
          </tr>
        `;
      });
    }

    let totalGabusFisik = 0;
    if (Array.isArray(notaItems)) {
      notaItems.forEach(i => totalGabusFisik += Math.max(0, Math.floor(Number(i.gabus) || 0)));
    }

    printArea.innerHTML = `
      <div class="${sheetClass}">
        <!-- WATERMARK LOGO RESMI DI BELAKANG NOTA -->
        <div class="nota-watermark" aria-hidden="true">
          <img src="logo.png" alt="Watermark PARENGGEKITA" class="nota-watermark-img">
        </div>

        <div class="nota-header-top">
          <div class="resi-wrap">
            <span>Res</span>
            <span class="print-text print-resi-box" id="txtPrintResi">${resiVal}</span>
            <input type="text" class="resi-input no-print" id="inpResi" value="${resiVal}" oninput="handleResiInput(this.value)">
          </div>
          <div class="nota-header-title">
            <span>NOTA ONGKIR</span>
          </div>
          <div class="nota-header-date">${tglStr}</div>
        </div>

      <table class="info-table">
        <tr>
          <td class="lbl">Kapal Pengangkut</td>
          <td class="col">:</td>
          <td class="val">${escapeHtml(activeKapal.nama_kapal)}</td>
        </tr>
        <tr>
          <td class="lbl">Juragan</td>
          <td class="col">:</td>
          <td class="val">${escapeHtml(activeKapal.juragan || "-")}</td>
        </tr>
        <tr>
          <td class="lbl">Lokasi Muat</td>
          <td class="col">:</td>
          <td class="val">${escapeHtml(activeKapal.lokasi_muat || "DDL")}</td>
        </tr>
      </table>

      <table class="items-table">
        <colgroup>
          <col style="width: 22px;">
          <col style="width: 43%;">
          <col style="width: 22%;">
          <col style="width: 29%;">
        </colgroup>
        <thead>
          <tr>
            <th>NO</th>
            <th>KAPAL PARENGGE</th>
            <th>MUATAN (GBS)</th>
            <th>TOTAL ONGKIR (RP)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" rowspan="3" class="calc-side-left">
              <div class="t-label">SISA BERSIH JURAGAN</div>
              <div class="t-amount" id="txtBigBersih">0</div>
              <div class="t-gabus" id="txtTotalGabusNota">Total: <b>${totalGabusFisik} Gabus</b></div>
            </td>
            <td class="lbl-calc">Subtotal:</td>
            <td class="val-calc" id="txtSubtotal">0</td>
          </tr>
          <tr>
            <td class="lbl-calc">Potongan:</td>
            <td class="val-calc">
              <span class="print-text text-right font-bold" id="txtPrintPotongan">${potonganNominal ? formatDots(potonganNominal) : ''}</span>
              <input type="text" id="inpPotonganNom" inputmode="numeric" class="inp-potongan no-print" placeholder="0" value="${potonganNominal ? formatDots(potonganNominal) : ''}" oninput="handlePotonganNominalInput(this)">
            </td>
          </tr>
          <tr>
            <td class="lbl-calc" style="font-weight:900;">Total Bersih:</td>
            <td class="val-calc val-total" id="txtTotalBersih">0</td>
          </tr>
        </tfoot>
      </table>

      <div class="sig-section">
        <div class="sig-box">
          <div class="sig-title">Hormat kami,</div>
          <div class="sig-line">Dg Sila</div>
        </div>
      </div>
    </div>
  `;

    hitungNota();
  } catch (err) {
    console.error("Gagal render blangko nota:", err);
  }
}

// ==========================================
// LIVE SYNC INPUT KE CETAK & AUTOSAVE
// ==========================================
function updateNamaItem(idx, val) {
  if (!notaItems[idx]) return;
  // Sanitasi input nama kapal parengge (escape HTML untuk mencegah XSS)
  const safeVal = sanitizeInput(val);
  notaItems[idx].nama = safeVal;
  const printEl = document.getElementById(`txtPrintNama_${idx}`);
  if (printEl) printEl.textContent = safeVal;
  triggerAutoSave();
}

function updateGabusItem(idx, val) {
  if (!notaItems[idx]) return;
  // Validasi tipe data muatan gabus non-negatif
  let num = Number(val);
  if (isNaN(num) || !isFinite(num) || num < 0) {
    num = 0;
  }
  num = Math.max(0, Math.floor(num));
  notaItems[idx].gabus = num;

  const printEl = document.getElementById(`txtPrintGabus_${idx}`);
  if (printEl) printEl.textContent = num;

  let totalGabusFisik = 0;
  notaItems.forEach(i => totalGabusFisik += Math.max(0, Math.floor(Number(i.gabus) || 0)));
  const elGabus = document.getElementById("txtTotalGabusNota");
  if (elGabus) elGabus.innerHTML = `Total: <b>${totalGabusFisik} Gabus</b>`;

  hitungNota();
  triggerAutoSave();
}

function handleOngkirInput(idx, inputEl) {
  if (!notaItems[idx] || !inputEl) return;
  // Validasi tipe data angka ongkir non-negatif
  let num = validateOngkir(inputEl.value);
  inputEl.value = num > 0 ? formatDots(num) : "";
  notaItems[idx].ongkir = num;
  
  const printEl = document.getElementById(`txtPrintOngkir_${idx}`);
  if (printEl) printEl.textContent = num > 0 ? formatDots(num) : "";

  hitungNota();
  triggerAutoSave();
}

function handlePotonganNominalInput(inputEl) {
  if (!inputEl) return;
  // Validasi tipe data potongan nominal non-negatif
  let num = validateOngkir(inputEl.value);
  inputEl.value = num > 0 ? formatDots(num) : "";
  potonganNominal = num;

  const printPot = document.getElementById("txtPrintPotongan");
  if (printPot) printPot.textContent = num > 0 ? formatDots(num) : "";

  hitungNota();
  triggerAutoSave();
}

function handleResiInput(val) {
  if (!activeKapal) return;
  // Sanitasi input resi (escape HTML)
  const safeVal = sanitizeInput(val);
  activeKapal.resi = safeVal;
  const printResi = document.getElementById("txtPrintResi") || document.querySelector(".print-resi-box");
  if (printResi) printResi.textContent = safeVal;
  triggerAutoSave();
}

function hitungNota() {
  let sub = 0;
  // Validasi kalkulasi subtotal ongkir non-negatif
  notaItems.forEach(i => sub += validateOngkir(i.ongkir));
  const safePot = validateOngkir(potonganNominal);
  const bersih = Math.max(0, sub - safePot);

  const elSub = document.getElementById("txtSubtotal");
  const elTot = document.getElementById("txtTotalBersih");
  const elBig = document.getElementById("txtBigBersih");

  if (elSub) elSub.textContent = formatRp(sub);
  if (elTot) elTot.textContent = formatRp(bersih);
  if (elBig) elBig.textContent = formatRp(bersih);
}

// ==========================================
// AUTOSAVE LOGIC & NOTIFIKASI STATUS
// ==========================================
function updateSaveIndicator(status) {
  const el = document.getElementById("saveIndicator");
  if (!el) return;

  if (status === "typing") {
    el.style.background = "#fef3c7";
    el.style.color = "#b45309";
    el.innerHTML = "⏳ Menyimpan...";
  } else if (status === "saved") {
    el.style.background = "#dcfce7";
    el.style.color = "#15803d";
    el.innerHTML = "✓ Tersimpan";
  } else if (status === "error") {
    el.style.background = "#fee2e2";
    el.style.color = "#b91c1c";
    el.innerHTML = "⚠️ Gagal Simpan";
  }
}

function triggerAutoSave() {
  updateSaveIndicator("typing");
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    autoSaveTimer = null;
    eksekusiSimpanOtomatis();
  }, 800);
}

async function eksekusiSimpanOtomatis() {
  const url = localStorage.getItem("GAS_WEBHOOK_URL");
  if (!url || !activeKapal) return;

  // Keamanan: Mencegah eksekusi simpan jika rincian nota kosong agar tidak menghapus database
  if (!notaItems || notaItems.length === 0) {
    console.warn("Penyimpanan dicegah: notaItems kosong agar data di spreadsheet tidak terhapus.");
    updateSaveIndicator("saved");
    return;
  }

  let sub = 0;
  notaItems.forEach(i => sub += validateOngkir(i.ongkir));
  const safePotongan = validateOngkir(potonganNominal);
  const bersih = Math.max(0, sub - safePotongan);
  const resiVal = document.getElementById("inpResi") ? sanitizeInput(document.getElementById("inpResi").value) : "1";

  const safeTanggal = validateDateFormat(activeKapal.tanggal) ? normalizeDateKey(activeKapal.tanggal) : sanitizeInput(activeKapal.tanggal);
  const safeNamaKapal = sanitizeInput(activeKapal.nama_kapal);

  const tripKey = getNormalizedTripId(safeNamaKapal, safeTanggal, activeKapal.kunci_unik);
  activeKapal.kunci_unik = tripKey;
  activeKapal.tanggal = safeTanggal;
  activeKapal.nama_kapal = safeNamaKapal;

  // Kirim data dengan kedua format penamaan (nama/nama_pemilik, gabus/jumlah)
  // agar Apps Script mengenali field apapun tanpa membuat kolom kosong
  const formattedItems = notaItems.map(item => {
    const cleanNama = sanitizeInput(item.nama || "Tanpa Nama");
    const cleanGabus = Math.max(0, Math.floor(Number(item.gabus) || 0));
    const cleanOngkir = validateOngkir(item.ongkir);
    return {
      nama: cleanNama,
      nama_pemilik: cleanNama,
      gabus: cleanGabus,
      jumlah: cleanGabus,
      satuan: "Gabus",
      ongkir: cleanOngkir,
      kunci_unik: tripKey,
      tanggal: safeTanggal,
      nama_kapal: safeNamaKapal
    };
  });

  const payload = {
    aksi: "SIMPAN_NOTA",
    kunci_unik: tripKey,
    tanggal: safeTanggal,
    nama_kapal: safeNamaKapal,
    juragan: sanitizeInput(activeKapal.juragan || ""),
    lokasi_muat: sanitizeInput(activeKapal.lokasi_muat || "DDL"),
    total_hitung: Math.max(0, Math.floor(Number(activeKapal.total_hitung) || 0)),
    status_selisih: sanitizeInput(activeKapal.status_selisih || "SESUAI"),
    resi: resiVal,
    subtotal: sub,
    subtotal_ongkir: sub,
    potongan: safePotongan,
    total_bersih: bersih,
    items: formattedItems
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    let resJson = null;
    try { resJson = await res.json(); } catch (_) {}

    if (resJson && resJson.status === "gagal") {
      throw new Error(resJson.pesan || "Server merespon gagal");
    }

    activeKapal.subtotal_ongkir = sub;
    activeKapal.potongan = safePotongan;
    activeKapal.total_bersih = bersih;
    activeKapal.resi = resiVal;

    allRincian = allRincian.filter(r => {
      if (isSameTripRecord(r, activeKapal)) {
        return notaItems.some(ni => sanitizeInput(ni.nama || "").toLowerCase() === sanitizeInput(r.nama_pemilik || "").toLowerCase());
      }
      return true;
    });

    notaItems.forEach(nItem => {
      const cleanNama = sanitizeInput(nItem.nama || "Tanpa Nama");
      const cleanGabus = Math.max(0, Math.floor(Number(nItem.gabus) || 0));
      const cleanOngkir = validateOngkir(nItem.ongkir);
      let found = allRincian.find(r => 
        isSameTripRecord(r, activeKapal) && sanitizeInput(r.nama_pemilik || "").toLowerCase() === cleanNama.toLowerCase()
      );
      if (found) {
        found.ongkir = cleanOngkir;
        found.jumlah = cleanGabus;
        found.kunci_unik = tripKey;
        found.tanggal = safeTanggal;
        found.nama_kapal = safeNamaKapal;
      } else {
        allRincian.push({
          kunci_unik: tripKey,
          tanggal: safeTanggal,
          nama_kapal: safeNamaKapal,
          nama_pemilik: cleanNama,
          jumlah: cleanGabus,
          satuan: "Gabus",
          ongkir: cleanOngkir
        });
      }
    });

    try {
      localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
      localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      lastDataSignature = computeDataSignature(allPelayaran, allRincian);
    } catch (_) {}

    renderDashboard();
    renderSemuaMuatan();
    renderAuditTab();
    updateSaveIndicator("saved");
  } catch (err) {
    console.error("Gagal simpan otomatis:", err);
    updateSaveIndicator("error");
  }
}

// ==========================================
// SWITCH TAB NAVIGATION (NAVBAR & BOTTOM NAV)
// ==========================================
function switchTab(tabName, el) {
  currentTab = tabName;

  // 1. Update Desktop Navbar link active state
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
  const desktopNavMap = {
    dashboard: document.getElementById("navTabDashboard"),
    kapal: document.getElementById("navTabKapal"),
    muatan: document.getElementById("navTabMuatan"),
    audit: document.getElementById("navTabAudit"),
    setting: document.getElementById("navTabSetting")
  };
  if (desktopNavMap[tabName]) {
    desktopNavMap[tabName].classList.add('active');
  }

  // 2. Update Mobile Bottom Nav active state
  document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
  const mobileNavMap = {
    dashboard: document.getElementById("bottomTabDashboard"),
    kapal: document.getElementById("bottomTabKapal"),
    muatan: document.getElementById("bottomTabMuatan"),
    audit: document.getElementById("bottomTabAudit"),
    setting: document.getElementById("bottomTabSetting")
  };
  if (mobileNavMap[tabName]) {
    mobileNavMap[tabName].classList.add('active');
  }

  // 3. Tampilkan Tab yang Sesuai
  const tabDashboard = document.getElementById("tabDashboard");
  const tabKapal = document.getElementById("tabKapal");
  const tabMuatan = document.getElementById("tabMuatan");
  const tabAudit = document.getElementById("tabAudit");
  const tabSetting = document.getElementById("tabSetting");

  if (tabDashboard) tabDashboard.style.display = "none";
  if (tabKapal) tabKapal.style.display = "none";
  if (tabMuatan) tabMuatan.style.display = "none";
  if (tabAudit) tabAudit.style.display = "none";
  if (tabSetting) tabSetting.style.display = "none";

  if (tabName === 'dashboard') {
    if (tabDashboard) tabDashboard.style.display = "block";
    renderDashboard();
    if (dailyChartInstance) {
      setTimeout(() => {
        try { dailyChartInstance.resize(); } catch (_) {}
      }, 50);
    }
  } else if (tabName === 'kapal') {
    if (tabKapal) tabKapal.style.display = "block";
    filterData();
  } else if (tabName === 'muatan') {
    if (tabMuatan) tabMuatan.style.display = "block";
    renderSemuaMuatan();
  } else if (tabName === 'audit') {
    if (tabAudit) tabAudit.style.display = "block";
    renderAuditTab();
  } else if (tabName === 'setting') {
    if (tabSetting) tabSetting.style.display = "block";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Responsivitas Grafik saat Ukuran Layar Desktop Berubah
window.addEventListener("resize", () => {
  if (dailyChartInstance && currentTab === 'dashboard') {
    try {
      dailyChartInstance.resize();
    } catch (_) {}
  }
});