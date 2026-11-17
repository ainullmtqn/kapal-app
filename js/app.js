// ==========================================
// PARENGGEKITA — SISTEM MANIFES KAPAL & NOTA ONGKIR
// APLIKASI UTAMA & NAVIGASI (ORCHESTRATOR ENTRY POINT)
// ==========================================

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
