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
        <div class="navbar-brand" onclick="switchTab('dashboard')" title="PARENGGEKITA - Sistem Manifes & Nota Logistik Kapal">
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
          <div class="nav-link active" onclick="switchTab('dashboard', this)" id="navTabDashboard">
            <svg class="nav-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Beranda</span>
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
          <div class="nav-link" onclick="switchTab('audit', this)" id="navTabAudit">
            <svg class="nav-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
              <path d="M7 21h10"/>
              <path d="M12 3v18"/>
              <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
            </svg>
            <span>Audit & Selisih</span>
            <span class="badge-count" id="navAuditBadge" style="display: none;">0</span>
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
        </div>

      </div>
    `;
  }

  const bNav = document.getElementById("bottomNav");
  if (bNav && bNav.innerHTML.trim() === "") {
    bNav.innerHTML = `
      <div class="nav-item active" onclick="switchTab('dashboard', this)" id="bottomTabDashboard">
        <div class="nav-icon-wrap">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <span class="nav-label">Beranda</span>
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
      <div class="nav-item" onclick="switchTab('audit', this)" id="bottomTabAudit">
        <div class="nav-icon-wrap">
          <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
            <path d="M7 21h10"/>
            <path d="M12 3v18"/>
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
          </svg>
        </div>
        <span class="nav-label">Audit</span>
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
    if (typeof renderDashboard === "function") renderDashboard();
    if (dailyChartInstance) {
      setTimeout(() => {
        try { dailyChartInstance.resize(); } catch (_) {}
      }, 50);
    }
  } else if (tabName === 'kapal') {
    if (tabKapal) tabKapal.style.display = "block";
    if (typeof filterData === "function") filterData();
  } else if (tabName === 'muatan') {
    if (tabMuatan) tabMuatan.style.display = "block";
    if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();
  } else if (tabName === 'audit') {
    if (tabAudit) tabAudit.style.display = "block";
    if (typeof renderAuditTab === "function") renderAuditTab();
  } else if (tabName === 'setting') {
    if (tabSetting) tabSetting.style.display = "block";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ==========================================
// INISIALISASI APLIKASI & CACHE OFFLINE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // 0. Render Seluruh Komponen Antarmuka (Modular Templates)
  if (typeof initNavbar === "function") initNavbar();
  if (typeof initDashboardView === "function") initDashboardView();
  if (typeof initKapalView === "function") initKapalView();
  if (typeof initMuatanView === "function") initMuatanView();
  if (typeof initAuditView === "function") initAuditView();
  if (typeof initSettingView === "function") initSettingView();
  if (typeof initNotaModalView === "function") initNotaModalView();

  const dateEl = document.getElementById("currentDateDisplay");
  if (dateEl && typeof formatTanggalIndo === "function") {
    dateEl.textContent = formatTanggalIndo();
  }

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
        if (typeof normalizeDatasetTripIds === "function") {
          normalizeDatasetTripIds(allPelayaran, allRincian);
        }
        if (typeof computeDataSignature === "function") {
          lastDataSignature = computeDataSignature(allPelayaran, allRincian);
        }
        if (typeof updateStatusBadge === "function") {
          updateStatusBadge("cache", "Cache", ` (${allPelayaran.length} Kapal)`);
        }
        if (typeof renderDashboard === "function") renderDashboard();
        if (typeof filterData === "function") filterData();
        if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();
        if (typeof renderAuditTab === "function") renderAuditTab();
      }
    }
  } catch (err) {
    console.warn("Gagal membaca cache lokal:", err);
  }

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

  // 4. Tarik data terbaru dari Google Apps Script
  if (savedWebhook) {
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
    if (!document.hidden && localStorage.getItem("GAS_WEBHOOK_URL")) {
      if (typeof cekDataBaruSilent === "function") cekDataBaruSilent();
    }
  });
});

// Responsivitas Grafik saat Ukuran Layar Desktop Berubah
window.addEventListener("resize", () => {
  if (dailyChartInstance && currentTab === 'dashboard') {
    try {
      dailyChartInstance.resize();
    } catch (_) {}
  }
});
