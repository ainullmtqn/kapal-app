// ==========================================
// CORE STATE, KEAMANAN, VALIDASI & SINKRONISASI
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

// Global Application State
var allPelayaran = [];
var allRincian = [];
var filteredPelayaran = [];
var currentFilterPill = 'SEMUA';
var currentDashChip = 'SEMUA';
var currentTab = 'dashboard'; // 'dashboard' | 'kapal' | 'muatan' | 'audit' | 'setting'
var activeKapal = null;
var notaItems = [];
var potonganNominal = 0;
var autoSaveTimer = null;
var dailyChartInstance = null;
var currentChartRangeDays = 7;

// Keamanan Operasional & Proteksi Data
var lastSyncTimestamp = 0;        // Anti-Spam Rate Limiter Cooldown
var isWebhookLocked = true;       // Kunci URL Webhook
var isWebhookVisible = false;     // Masking Sandi Webhook
var lastDataSignature = "";       // Sidik Jari Data untuk Deteksi Perubahan Realtime
var autoSyncTimer = null;         // Timer Polling Latar Belakang
var isSilentChecking = false;     // Proteksi Request Latar Belakang Simultan

// ==========================================
// MASTER DATA KAPAL (DATABASE_KAPAL SPREADSHEET)
// ==========================================
var DEFAULT_MASTER_KAPAL_ONGKIR = [
  "KMN BINTANG SOREANG", "KMN CAHAYA BARU", "KMN TUNAS HARAPAN", "KMN BARI BARIA",
  "KMN BINTANG BKC", "KMN AISYAH 02", "KMN ALIKA JAYA", "KMN AMALIA",
  "KMN MUARA BAHARI", "KMN BINTANG AL KHAFI", "KMN CAHAYA SALWA", "KMN PUTRI TUNGGAL",
  "KMN BINTANG MUTIARA", "KMN ODONG ODONG", "KMN NUR KHALISTA", "KMN SINAR FAUZIA",
  "KMN BINTANG DUA PUTRI", "KMN CAHAYA NUR AISYAH", "KMN BINTANG AJT", "KMN MANYIGARRI",
  "KMN FAHRY JAYA", "KMN BINTANG NADITA", "KMN ALIZA JAYA", "KMN FAIZ JAYA",
  "KMN BINTANG CN", "KMN CAHAYA YUNNA", "KMN BINTANG CAHAYA YUNNA", "KMN BINTANG DPS",
  "KMN IRFAN JAYA BBL", "KMN BIRU BIRU", "KMN CAHAYA BULAN", "KMN JABAL NUR",
  "KMN ALZAKI", "KMN IQBAL JAYA", "KMN BINTANG MADINA", "KMN NUR HIKMA 02",
  "KMN SABARI UTAMA"
];

var DEFAULT_MASTER_KAPAL_PARENGGE = [
  "BTG 01", "ALAM SURGA", "ALHAMIDI 01", "ALHAMIDI 02",
  "ANWAR SH", "BARI BIRU", "BARI MUDA", "BINTANG 33",
  "BINTANG 88", "BINTANG ALAM", "BINTANG HARAPAN", "BINTANG KEJORA 01",
  "BINTANG KEJORA 02", "BINTANG KEJORA 55", "BINTANG MUSAFIR 01", "BINTANG RAJA CF 04",
  "BULU JAYA", "BUNGA JAYA", "CAHAYA BINTANG", "CB 06",
  "CB 10", "CHOKI COKI", "CORA CORA", "DENSAR",
  "DEWA BATARA 01", "DUA PUTRA", "GARUDA CITY", "JUKU JUKU",
  "KEJORA GHIFARI", "KIBAR", "TINGGI MONCONG", "SUMBER JAYA",
  "SAMPOERNA", "TABBING TABBING"
];

var MASTER_KAPAL_ONGKIR = (function() {
  try {
    const c = localStorage.getItem("CACHE_MASTER_ONGKIR");
    if (c) {
      const arr = JSON.parse(c);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (_) {}
  return [...DEFAULT_MASTER_KAPAL_ONGKIR];
})();

var MASTER_KAPAL_PARENGGE = (function() {
  try {
    const c = localStorage.getItem("CACHE_MASTER_PARENGGE");
    if (c) {
      const arr = JSON.parse(c);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch (_) {}
  return [...DEFAULT_MASTER_KAPAL_PARENGGE];
})();

// ==========================================
// SANITASI INPUT ANTI-XSS & SECURITY NOTIFICATIONS
// ==========================================

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  const s = String(str);
  return s
    .replace(/&(?!amp;|lt;|gt;|quot;|#039;|#x27;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeInput(str) {
  if (str === null || str === undefined) return "";
  return escapeHtml(String(str).trim());
}

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

function validateOngkir(val) {
  if (val === null || val === undefined || val === "") return 0;
  let num;
  if (typeof val === "number") {
    num = val;
  } else {
    const str = String(val).trim();
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

function validateDateFormat(tglStr) {
  if (!tglStr && tglStr !== 0) return false;
  if (tglStr instanceof Date && !isNaN(tglStr.getTime())) return true;
  
  const str = String(tglStr).trim();
  if (!str) return false;

  if (/[<>"'&;()]/.test(str)) return false;

  if (/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])(?:T.*)?$/.test(str)) {
    return true;
  }

  if (/^(?:0?[1-9]|[12]\d|3[01])[\/\-](?:0?[1-9]|1[0-2])[\/\-]\d{4}$/.test(str)) {
    return true;
  }

  if (/^\d{4}[\/\-](?:0?[1-9]|1[0-2])[\/\-](?:0?[1-9]|[12]\d|3[01])$/.test(str)) {
    return true;
  }

  if (/^(?:0?[1-9]|[12]\d|3[01])\s+[a-zA-Z]{3,10}\s+\d{4}$/.test(str)) {
    const match = str.match(/^(?:0?[1-9]|[12]\d|3[01])\s+([a-zA-Z]{3,10})\s+\d{4}$/);
    if (match) {
      const mStr = match[1].toLowerCase().substring(0, 3);
      const validMonths = ['jan', 'feb', 'mar', 'apr', 'mei', 'may', 'jun', 'jul', 'ags', 'agt', 'aug', 'sep', 'okt', 'oct', 'nov', 'des', 'dec'];
      if (validMonths.includes(mStr)) return true;
    }
  }

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

function normalizeDateKey(tglStr) {
  if (!tglStr && tglStr !== 0) return "";
  
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

// ==========================================
// IDENTIFIKASI TRIP ID & NORMALISASI
// ==========================================

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

function isSameTripRecord(r, kapal) {
  if (!r || !kapal) return false;

  const rKapal = (r.nama_kapal_ongkir || r.nama_kapal || "").trim().toLowerCase();
  const kKapal = (kapal.nama_kapal_ongkir || kapal.nama_kapal || "").trim().toLowerCase();

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

  const rTripId = getNormalizedTripId(rKapal, r.tanggal, r.kunci_unik).trim().toLowerCase();
  const kTripId = getNormalizedTripId(kKapal, kapal.tanggal, kapal.kunci_unik).trim().toLowerCase();
  if (rTripId && kTripId && rTripId === kTripId) {
    return true;
  }

  return false;
}

function normalizeDatasetTripIds(pelayaranList, rincianList) {
  if (Array.isArray(pelayaranList)) {
    pelayaranList.forEach(p => {
      if (p) {
        // Sinkronisasi alias nama kolom baru & lama
        if (!p.nama_kapal && p.nama_kapal_ongkir) p.nama_kapal = p.nama_kapal_ongkir;
        if (!p.nama_kapal_ongkir && p.nama_kapal) p.nama_kapal_ongkir = p.nama_kapal;
        if (p.total_terhitung !== undefined && p.total_hitung === undefined) p.total_hitung = p.total_terhitung;
        if (p.total_hitung !== undefined && p.total_terhitung === undefined) p.total_terhitung = p.total_hitung;
        p.kunci_unik = getNormalizedTripId(p.nama_kapal || p.nama_kapal_ongkir, p.tanggal, p.kunci_unik);
      }
    });
  }
  if (Array.isArray(rincianList)) {
    rincianList.forEach(r => {
      if (r) {
        // Sinkronisasi alias nama kolom baru & lama
        if (!r.nama_kapal && r.nama_kapal_ongkir) r.nama_kapal = r.nama_kapal_ongkir;
        if (!r.nama_kapal_ongkir && r.nama_kapal) r.nama_kapal_ongkir = r.nama_kapal;
        if (!r.nama_pemilik && r.nama_kapal_parengge) r.nama_pemilik = r.nama_kapal_parengge;
        if (!r.nama_kapal_parengge && r.nama_pemilik) r.nama_kapal_parengge = r.nama_pemilik;
        if (r.jumlah_gabus !== undefined && r.jumlah === undefined) r.jumlah = r.jumlah_gabus;
        if (r.jumlah !== undefined && r.jumlah_gabus === undefined) r.jumlah_gabus = r.jumlah;
        if (r.ongkir_rp !== undefined && r.ongkir === undefined) r.ongkir = r.ongkir_rp;
        if (r.ongkir !== undefined && r.ongkir_rp === undefined) r.ongkir_rp = r.ongkir;
        r.kunci_unik = getNormalizedTripId(r.nama_kapal || r.nama_kapal_ongkir, r.tanggal, r.kunci_unik);
      }
    });
  }
}

// ==========================================
// STATUS BADGE & RADAR INDICATOR
// ==========================================

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
  
  badge.className = `status-badge status-${status}`;
  if (radarDot) {
    radarDot.className = `radar-dot dot-${status}`;
  }
}

// ==========================================
// KONEKSI WEBHOOK GOOGLE APPS SCRIPT
// ==========================================

async function tarikSemuaData() {
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
    if (typeof switchTab === "function") switchTab('setting');
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

      if (Array.isArray(data.master_kapal_ongkir) && data.master_kapal_ongkir.length > 0) {
        MASTER_KAPAL_ONGKIR = data.master_kapal_ongkir;
        try { localStorage.setItem("CACHE_MASTER_ONGKIR", JSON.stringify(MASTER_KAPAL_ONGKIR)); } catch (_) {}
      }
      if (Array.isArray(data.master_kapal_parengge) && data.master_kapal_parengge.length > 0) {
        MASTER_KAPAL_PARENGGE = data.master_kapal_parengge;
        try { localStorage.setItem("CACHE_MASTER_PARENGGE", JSON.stringify(MASTER_KAPAL_PARENGGE)); } catch (_) {}
      }
      
      normalizeDatasetTripIds(allPelayaran, allRincian);
      allPelayaran.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
      lastDataSignature = computeDataSignature(allPelayaran, allRincian);

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

      if (typeof renderDashboard === "function") renderDashboard();
      if (typeof filterData === "function") filterData();
      if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();
      if (typeof renderAuditTab === "function") renderAuditTab();
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
// SINKRONISASI REALTIME & DATA DIFFING
// ==========================================

function computeDataSignature(pelayaran, rincian) {
  if (!Array.isArray(pelayaran) && !Array.isArray(rincian)) return "";

  const pList = (pelayaran || []).map(p => 
    `${p.kunci_unik || ''}_${p.tanggal || ''}_${p.nama_kapal_ongkir || p.nama_kapal || ''}_${p.juragan || ''}_${p.lokasi_muat || ''}_${p.waktu_berangkat || ''}_${p.total_tertulis || 0}_${p.total_terhitung || p.total_hitung || 0}_${p.selisih || 0}_${p.status_selisih || ''}_${p.resi || ''}_${p.subtotal_ongkir || 0}_${p.potongan || 0}_${p.total_bersih || 0}`
  ).join("|");

  const rList = (rincian || []).map(r => 
    `${r.kunci_unik || ''}_${r.nama_kapal_parengge || r.nama_pemilik || ''}_${r.jumlah_gabus || r.jumlah || 0}_${r.satuan || ''}_${r.ongkir_rp || r.ongkir || 0}`
  ).join("|");

  return `${(pelayaran || []).length}#${(rincian || []).length}#${pList}#${rList}`;
}

async function cekDataBaruSilent() {
  if (document.hidden || isSilentChecking || autoSaveTimer !== null) return;

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

      if (Array.isArray(data.master_kapal_ongkir) && data.master_kapal_ongkir.length > 0) {
        MASTER_KAPAL_ONGKIR = data.master_kapal_ongkir;
        try { localStorage.setItem("CACHE_MASTER_ONGKIR", JSON.stringify(MASTER_KAPAL_ONGKIR)); } catch (_) {}
      }
      if (Array.isArray(data.master_kapal_parengge) && data.master_kapal_parengge.length > 0) {
        MASTER_KAPAL_PARENGGE = data.master_kapal_parengge;
        try { localStorage.setItem("CACHE_MASTER_PARENGGE", JSON.stringify(MASTER_KAPAL_PARENGGE)); } catch (_) {}
      }

      normalizeDatasetTripIds(dataBaruPelayaran, dataBaruRincian);
      const newSignature = computeDataSignature(dataBaruPelayaran, dataBaruRincian);

      if (lastDataSignature !== "" && lastDataSignature === newSignature) {
        return;
      }

      const totalKapalSebelumnya = allPelayaran.length;
      lastDataSignature = newSignature;
      allPelayaran = dataBaruPelayaran;
      allRincian = dataBaruRincian;
      allPelayaran.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));

      try {
        localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
        localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      } catch (_) {}

      updateStatusBadge("online", "Online", ` (${allPelayaran.length} Kapal)`);
      if (document.getElementById("countMuatan")) {
        document.getElementById("countMuatan").textContent = allRincian.length;
      }

      if (typeof renderDashboard === "function") renderDashboard();
      if (currentTab === 'kapal' && typeof filterData === "function") filterData();
      if (currentTab === 'muatan' && typeof renderSemuaMuatan === "function") renderSemuaMuatan();
      if (currentTab === 'audit' && typeof renderAuditTab === "function") renderAuditTab();

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

function startRealtimeSync(intervalDetik = 25) {
  stopRealtimeSync();
  autoSyncTimer = setInterval(cekDataBaruSilent, intervalDetik * 1000);
}

function stopRealtimeSync() {
  if (autoSyncTimer) {
    clearInterval(autoSyncTimer);
    autoSyncTimer = null;
  }
}

