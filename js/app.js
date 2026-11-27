// ==========================================
// PARENGGEKITA — SISTEM MANIFES KAPAL & NOTA ONGKIR
// APLIKASI UTAMA & NAVIGASI (ORCHESTRATOR ENTRY POINT)
// ==========================================

function initNavbar() {
  const header = document.getElementById("appNavbar");
  if (header && header.innerHTML.trim() === "") {
    header.innerHTML = `
      <div class="navbar-container">
        
        <!-- Brand -->
        <div class="navbar-brand" onclick="switchTab('warta')" title="PARENGGEKITA - Sistem Manifes & Nota Logistik Kapal">
          <div class="brand-logo-wrap">
            <img src="logo.png" alt="Logo PARENGGEKITA" class="brand-logo-img">
          </div>
          <div class="brand-text-wrap">
            <div class="brand-title">PARENGGE<span class="brand-title-accent">KITA</span><span class="brand-title-dot">.</span></div>
            <div class="brand-subtitle">Manifes & Nota Logistik Kapal</div>
          </div>
        </div>

        <!-- Desktop Nav Tabs -->
        <nav class="navbar-nav">
          <div class="nav-link" onclick="switchTab('dashboard', this)" id="navTabDashboard">
            <svg class="nav-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Beranda Admin</span>
          </div>
          <div class="nav-link" onclick="switchTab('kapal', this)" id="navTabKapal">
            <svg class="nav-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 20a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 4 0"/>
              <path d="M4 18l2-7h12l2 7"/>
              <path d="M12 4v7"/>
              <path d="M9 7l3-3 3 3"/>
            </svg>
            <span>Kapal Ongkir</span>
          </div>
          <div class="nav-link" onclick="switchTab('muatan', this)" id="navTabMuatan">
            <svg class="nav-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 19c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1"/>
              <path d="M3.5 16L5 11h14l1.5 5H3.5z"/>
              <path d="M10 11V5l7 3-7 3z"/>
              <line x1="6" y1="11" x2="6" y2="8"/>
            </svg>
            <span>Kapal Parengge</span>
          </div>
          <div class="nav-link" onclick="switchTab('setting', this)" id="navTabSetting">
            <svg class="nav-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span>Pengaturan</span>
          </div>
        </nav>

        <!-- Right: Date, Status, Refresh -->
        <div class="navbar-right">
          <div class="date-pill" id="datePill">
            <svg class="pill-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span id="currentDateDisplay">Memuat...</span>
          </div>
          <div class="status-badge status-online" id="statusBadge" onclick="tarikSemuaData()" title="Status koneksi database. Klik untuk segarkan.">
            <span class="radar-dot dot-online" id="radarDot"></span>
            <span id="statusBadgeText">Online</span>
            <span class="status-badge-count" id="statusBadgeCount"></span>
          </div>
          <button class="btn-refresh" onclick="tarikSemuaData()" title="Segarkan Data" id="btnRefresh">
            <svg class="refresh-svg-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
          </button>
          <button class="btn-refresh" onclick="kunciPortalPengelola()" title="Kunci Portal / Keluar Mode Pengelola" id="btnLockAdmin" style="color: #64748b;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </button>
        </div>

      </div>
    `;
  }

  const bNav = document.getElementById("bottomNav");
  if (bNav && bNav.innerHTML.trim() === "") {
    bNav.innerHTML = `
      <div class="nav-item" onclick="switchTab('dashboard', this)" id="bottomTabDashboard">
        <div class="nav-icon-wrap">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span class="nav-label">Admin</span>
      </div>
      <div class="nav-item" onclick="switchTab('kapal', this)" id="bottomTabKapal">
        <div class="nav-icon-wrap">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 20a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 4 0"/>
            <path d="M4 18l2-7h12l2 7"/>
            <path d="M12 4v7"/>
            <path d="M9 7l3-3 3 3"/>
          </svg>
        </div>
        <span class="nav-label">Ongkir</span>
      </div>
      <div class="nav-item" onclick="switchTab('muatan', this)" id="bottomTabMuatan">
        <div class="nav-icon-wrap">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 19c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1"/>
            <path d="M3.5 16L5 11h14l1.5 5H3.5z"/>
            <path d="M10 11V5l7 3-7 3z"/>
            <line x1="6" y1="11" x2="6" y2="8"/>
          </svg>
        </div>
        <span class="nav-label">Parengge</span>
      </div>
      <div class="nav-item" onclick="switchTab('setting', this)" id="bottomTabSetting">
        <div class="nav-icon-wrap">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <span class="nav-label">Setting</span>
      </div>
    `;
  }
}

// ==========================================
// AUTENTIKASI AKSES PENGELOLA (PROTEKSI PASSWORD)
// ==========================================
var pendingAdminTargetTab = 'dashboard';

function cekAksesPengelola(targetTab) {
  if (targetTab === 'warta') return true;

  const isAuth = sessionStorage.getItem("IS_ADMIN_AUTH") === "true";
  if (isAuth) return true;

  // Belum login, simpan target tab dan tampilkan modal password
  pendingAdminTargetTab = targetTab || 'dashboard';
  bukaModalAuthPengelola(pendingAdminTargetTab);
  return false;
}

function bukaModalAuthPengelola(targetTab = 'dashboard') {
  pendingAdminTargetTab = targetTab;
  const modal = document.getElementById("adminAuthModal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 360px; padding: 1.6rem 1.4rem; text-align: center; border-radius: 14px;">
      <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🔐</div>
      <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">Portal Pengelola</h3>
      <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.4;">
        Masukkan kata sandi pengelola (Admin atau Super Admin) untuk membuka administrasi & database kapal.
      </p>

      <form id="formAuthPengelola" onsubmit="verifikasiPasswordPengelola(event)">
        <div style="position: relative; margin-bottom: 0.5rem;">
          <input type="password" id="inputPasswordPengelola" class="search-input" placeholder="Kata sandi..." required style="width: 100%; padding-right: 42px; font-size: 0.95rem; text-align: center; letter-spacing: 2px;" autocomplete="current-password">
          <button type="button" class="btn-addon-eye" onclick="togglePasswordVisibility('inputPasswordPengelola', this)" title="Tampilkan sandi" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; font-size: 1rem;">
            👁️
          </button>
        </div>

        <div id="authErrorMessage" style="display: none; font-size: 0.78rem; color: var(--danger-text); font-weight: 700; margin-bottom: 0.65rem;">
          ❌ Kata sandi salah! Silakan coba lagi.
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; margin-top: 1.15rem;">
          <button type="button" class="btn-action" onclick="tutupModalAuthPengelola()" style="background: #64748b; font-size: 0.82rem; padding: 0.55rem 1.1rem;">
            Batal
          </button>
          <button type="submit" class="btn-action" style="background: var(--ocean); font-size: 0.82rem; padding: 0.55rem 1.35rem; font-weight: 700;">
            🔓 Masuk
          </button>
        </div>
      </form>
    </div>
  `;

  modal.classList.add("active");
  setTimeout(() => {
    const inp = document.getElementById("inputPasswordPengelola");
    if (inp) {
      inp.value = "";
      inp.focus();
    }
  }, 100);
}

function tutupModalAuthPengelola() {
  const modal = document.getElementById("adminAuthModal");
  if (modal) {
    modal.classList.remove("active");
    modal.innerHTML = "";
  }
}

function togglePasswordVisibility(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === "password") {
    inp.type = "text";
    if (btn) btn.textContent = "🙈";
  } else {
    inp.type = "password";
    if (btn) btn.textContent = "👁️";
  }
}

function updateAdminLockIndicator() {
  const btnLock = document.getElementById("btnLockAdmin");
  const role = sessionStorage.getItem("ADMIN_ROLE");
  const isAuth = sessionStorage.getItem("IS_ADMIN_AUTH") === "true";
  if (btnLock) {
    if (isAuth) {
      if (role === "super_admin") {
        btnLock.title = "👑 Super Admin Aktif (Klik untuk Kunci Portal)";
        btnLock.style.color = "#0284c7";
      } else {
        btnLock.title = "🛡️ Admin Aktif (Klik untuk Kunci Portal)";
        btnLock.style.color = "var(--ocean)";
      }
    } else {
      btnLock.title = "Portal Pengelola Terkunci";
      btnLock.style.color = "#94a3b8";
    }
  }
}

function verifikasiPasswordPengelola(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inp = document.getElementById("inputPasswordPengelola");
  const errBox = document.getElementById("authErrorMessage");
  const enteredPass = (inp ? inp.value : "").trim();

  // Ambil kata sandi yang tersimpan, atau inisialisasi default bawaan:
  // Super Admin: 0NGKIR
  // Admin Biasa: PAONGKIR
  let superPass = localStorage.getItem("APP_SUPER_ADMIN_PASSWORD");
  if (!superPass) {
    superPass = "0NGKIR";
    localStorage.setItem("APP_SUPER_ADMIN_PASSWORD", "0NGKIR");
  }

  let adminPass = localStorage.getItem("APP_ADMIN_PASSWORD");
  if (!adminPass || adminPass === "parengge2026") {
    adminPass = "PAONGKIR";
    localStorage.setItem("APP_ADMIN_PASSWORD", "PAONGKIR");
  }

  const cleanEntered = enteredPass.toUpperCase();
  const cleanSuper = superPass.trim().toUpperCase();
  const cleanAdmin = adminPass.trim().toUpperCase();

  // 1. Verifikasi Super Admin (0NGKIR) -> Hak akses penuh + Bisa ubah kata sandi
  if (cleanEntered === cleanSuper) {
    sessionStorage.setItem("IS_ADMIN_AUTH", "true");
    sessionStorage.setItem("ADMIN_ROLE", "super_admin");
    tutupModalAuthPengelola();
    showSecurityToast("👑 Berhasil masuk sebagai Super Admin.");
    updateAdminLockIndicator();
    const dest = pendingAdminTargetTab || 'dashboard';
    switchTab(dest);
    return;
  }

  // 2. Verifikasi Admin Biasa (PAONGKIR) -> Akses pengelola, tidak bisa ubah kata sandi
  if (cleanEntered === cleanAdmin) {
    sessionStorage.setItem("IS_ADMIN_AUTH", "true");
    sessionStorage.setItem("ADMIN_ROLE", "admin");
    tutupModalAuthPengelola();
    showSecurityToast("🛡️ Berhasil masuk sebagai Admin.");
    updateAdminLockIndicator();
    const dest = pendingAdminTargetTab || 'dashboard';
    switchTab(dest);
    return;
  }

  // Gagal
  if (errBox) errBox.style.display = "block";
  if (inp) {
    inp.select();
    inp.focus();
  }
}

function kunciPortalPengelola() {
  sessionStorage.removeItem("IS_ADMIN_AUTH");
  sessionStorage.removeItem("ADMIN_ROLE");
  sessionStorage.setItem("LAST_ACTIVE_TAB", "warta");
  localStorage.setItem("LAST_ACTIVE_TAB", "warta");
  showSecurityToast("🔒 Portal Pengelola telah dikunci.");
  updateAdminLockIndicator();
  switchTab('warta');
}

// ==========================================
// SWITCH TAB NAVIGATION (NAVBAR & BOTTOM NAV)
// ==========================================

function switchTab(tabName, el) {
  if (tabName === 'admin') tabName = 'dashboard';

  // Proteksi Password untuk Area Pengelola (dashboard, kapal, muatan, setting)
  if (tabName !== 'warta' && !cekAksesPengelola(tabName)) {
    return;
  }

  currentTab = tabName;

  // Simpan posisi tab aktif agar saat refresh (F5/Reload) tetap berada di halaman yang sama
  try {
    sessionStorage.setItem("LAST_ACTIVE_TAB", tabName);
    localStorage.setItem("LAST_ACTIVE_TAB", tabName);
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "#" + tabName);
    }
  } catch (_) {}

  // Mode Warta Publik Bersih: Sembunyikan Main Bar Top Navbar & Bottom Nav
  if (tabName === 'warta') {
    // Kunci portal pengelola secara otomatis saat kembali ke halaman warta publik
    sessionStorage.removeItem("IS_ADMIN_AUTH");
    sessionStorage.removeItem("ADMIN_ROLE");
    updateAdminLockIndicator();
    document.body.classList.add('warta-public-mode');
  } else {
    document.body.classList.remove('warta-public-mode');
  }

  // 1. Update Desktop Navbar link active state
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
  const desktopNavMap = {
    dashboard: document.getElementById("navTabDashboard"),
    kapal: document.getElementById("navTabKapal"),
    muatan: document.getElementById("navTabMuatan"),
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
    setting: document.getElementById("bottomTabSetting")
  };
  if (mobileNavMap[tabName]) {
    mobileNavMap[tabName].classList.add('active');
  }

  // 3. Tampilkan Tab yang Sesuai
  const tabWarta = document.getElementById("tabWarta");
  const tabDashboard = document.getElementById("tabDashboard");
  const tabKapal = document.getElementById("tabKapal");
  const tabMuatan = document.getElementById("tabMuatan");
  const tabSetting = document.getElementById("tabSetting");

  if (tabWarta) tabWarta.style.display = "none";
  if (tabDashboard) tabDashboard.style.display = "none";
  if (tabKapal) tabKapal.style.display = "none";
  if (tabMuatan) tabMuatan.style.display = "none";
  if (tabSetting) tabSetting.style.display = "none";

  if (tabName === 'warta') {
    if (tabWarta) tabWarta.style.display = "block";
    if (typeof renderWartaHariIni === "function") renderWartaHariIni();
  } else if (tabName === 'dashboard') {
    if (tabDashboard) tabDashboard.style.display = "block";
    if (typeof renderDashboard === "function") renderDashboard();
    if (dailyChartInstance) {
      setTimeout(() => {
        try { dailyChartInstance.resize(); } catch (_) { }
      }, 50);
    }
  } else if (tabName === 'kapal') {
    if (tabKapal) tabKapal.style.display = "block";
    if (typeof filterData === "function") filterData();
  } else if (tabName === 'muatan') {
    if (tabMuatan) tabMuatan.style.display = "block";
    if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();
  } else if (tabName === 'setting') {
    if (tabSetting) tabSetting.style.display = "block";
    if (typeof renderMasterKapalList === "function") {
      renderMasterKapalList();
    }
    if (typeof renderAdminPasswordSection === "function") {
      renderAdminPasswordSection();
    }
  }

  updateAdminLockIndicator();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// INISIALISASI APLIKASI & CACHE OFFLINE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 0. Render Seluruh Komponen Antarmuka (Modular Templates)
  if (typeof initNavbar === "function") initNavbar();
  if (typeof initWartaView === "function") initWartaView();
  if (typeof initDashboardView === "function") initDashboardView();
  if (typeof initKapalView === "function") initKapalView();
  if (typeof initMuatanView === "function") initMuatanView();
  if (typeof initSettingView === "function") initSettingView();
  if (typeof initNotaModalView === "function") initNotaModalView();

  const dateEl = document.getElementById("currentDateDisplay");
  if (dateEl && typeof formatTanggalIndo === "function") {
    dateEl.textContent = formatTanggalIndo();
  }


  // 0. Migrasi Otomatis: Hapus sisa link Webhook lama yang pernah tersimpan di perangkat ini
  try {
    if (localStorage.getItem("GAS_WEBHOOK_URL")) {
      localStorage.removeItem("GAS_WEBHOOK_URL");
      // Bersihkan juga cache lama yang berasal dari spreadsheet sebelumnya agar segera tersinkron
      localStorage.removeItem("CACHE_PELAYARAN");
      localStorage.removeItem("CACHE_RINCIAN");
      localStorage.removeItem("CACHE_MASTER_ONGKIR");
      localStorage.removeItem("CACHE_MASTER_PARENGGE");
    }
  } catch (_) {}

  // 1. Muat Cache Offline terlebih dahulu (Instant 0ms display)
  try {
    const cachedPel = localStorage.getItem("CACHE_PELAYARAN");
    const cachedRin = localStorage.getItem("CACHE_RINCIAN");
    if (cachedPel && cachedRin) {
      allPelayaran = JSON.parse(cachedPel) || [];
      allRincian = JSON.parse(cachedRin) || [];
      if (allPelayaran.length > 0) {
        if (typeof normalizeDatasetTripIds === "function") {
          normalizeDatasetTripIds(allPelayaran, allRincian);
        }
        if (typeof computeDataSignature === "function") {
          lastDataSignature = computeDataSignature(allPelayaran, allRincian);
        }
        if (typeof updateStatusBadge === "function") {
          updateStatusBadge("cache", "Cache", ` (${allPelayaran.length} Kapal)`);
        }
        if (typeof renderWartaHariIni === "function") renderWartaHariIni();
        if (typeof renderDashboard === "function") renderDashboard();
        if (typeof filterData === "function") filterData();
        if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();
      }
    }
  } catch (err) {
    console.warn("Gagal membaca cache lokal:", err);
  }

  // Tentukan tab aktif saat buka / refresh: periksa Hash URL (#kapal, #muatan) atau memori sesi tab terakhir
  const rawHash = (window.location.hash || "").replace("#", "").toLowerCase();
  const savedTab = (sessionStorage.getItem("LAST_ACTIVE_TAB") || "").toLowerCase();
  const isAuth = sessionStorage.getItem("IS_ADMIN_AUTH") === "true";
  const validTabs = ["warta", "dashboard", "admin", "kapal", "muatan", "setting"];

  let initialTab = "warta";
  if (isAuth) {
    if (validTabs.includes(rawHash)) {
      initialTab = (rawHash === "admin") ? "dashboard" : rawHash;
    } else if (validTabs.includes(savedTab)) {
      initialTab = (savedTab === "admin") ? "dashboard" : savedTab;
    }
  } else if (rawHash && rawHash !== "warta" && validTabs.includes(rawHash)) {
    pendingAdminTargetTab = (rawHash === "admin") ? "dashboard" : rawHash;
    switchTab('warta');
    setTimeout(() => {
      bukaModalAuthPengelola(pendingAdminTargetTab);
    }, 150);
    return;
  }

  switchTab(initialTab);

  // Listener Perubahan Hash URL
  window.addEventListener("hashchange", () => {
    const hash = (window.location.hash || "").replace("#", "").toLowerCase();
    if (hash === "admin" || hash === "dashboard") {
      switchTab('dashboard');
    } else if (hash === "warta") {
      switchTab('warta');
    } else if (["kapal", "muatan", "setting"].includes(hash)) {
      switchTab(hash);
    }
  });

  // Shortcut Keyboard Pengelola: Alt+A atau Ctrl+Shift+A untuk toggle admin/warta
  document.addEventListener("keydown", (e) => {
    if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'a' || e.key === 'A'))) {
      e.preventDefault();
      if (currentTab === 'warta') {
        switchTab('dashboard');
      } else {
        switchTab('warta');
      }
    }
  });

  // 2. Setup Dismiss Modal (Backdrop Click & ESC Key)
  const modal = document.getElementById("notaModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal && typeof tutupNota === "function") tutupNota();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      if (typeof tutupNota === "function") tutupNota();
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

  // 4. Tarik data terbaru dari Google Apps Script secara otomatis
  const activeUrl = (typeof getActiveWebhookUrl === "function") ? getActiveWebhookUrl() : "";
  if (activeUrl) {
    if (typeof tarikSemuaData === "function") tarikSemuaData();
  } else if (allPelayaran.length === 0) {
    if (typeof updateStatusBadge === "function") {
      updateStatusBadge("offline", "Belum Diatur");
    }
  }

  // 5. Inisialisasi Real-Time Auto Sync (Silent Polling & Diffing)
  if (typeof startRealtimeSync === "function") {
    startRealtimeSync(25);
  }

  // Periksa seketika saat pengguna membuka kembali tab browser
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && typeof getActiveWebhookUrl === "function" && getActiveWebhookUrl()) {
      if (typeof cekDataBaruSilent === "function") cekDataBaruSilent();
    }
  });
});

// Responsivitas Grafik saat Ukuran Layar Desktop Berubah
window.addEventListener("resize", () => {
  if (dailyChartInstance && currentTab === 'dashboard') {
    try {
      dailyChartInstance.resize();
    } catch (_) { }
  }
});
