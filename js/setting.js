// ==========================================
// MAIN BAR 5: PENGATURAN WEBHOOK & CADANGAN
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initSettingView() {
  const container = document.getElementById("tabSetting");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <div class="setting-box">
        <!-- ============================================== -->
        <!-- 1. HALAMAN MENU UTAMA PENGATURAN (HUB)        -->
        <!-- ============================================== -->
        <div id="settingPageMenu" class="setting-subpage">
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">
            Pusat Pengaturan Sistem
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem;">
            Pilih menu konfigurasi di bawah ini untuk mengelola database master kapal atau pengaturan koneksi online:
          </div>

          <div class="setting-menu-grid">
            <!-- Menu 1: Master Data Nama Kapal -->
            <div class="setting-menu-card" onclick="bukaSettingHalaman('master')">
              <div class="setting-menu-card-left">
                <div class="setting-menu-icon">📋</div>
                <div class="setting-menu-card-body">
                  <div class="setting-menu-card-title">Master Data Nama Kapal</div>
                  <div class="setting-menu-card-desc">
                    Kelola daftar nama Kapal Ongkir & Kapal Parengge untuk rekomendasi pencarian (auto-complete) serta sinkronkan ke Google Spreadsheet.
                  </div>
                  <div class="setting-menu-card-badge">
                    <span id="badgeMenuMasterInfo">Kelola Database Kapal</span>
                  </div>
                </div>
              </div>
              <div class="setting-menu-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>

            <!-- Menu 2: Koneksi dan Tautan Webhook -->
            <div class="setting-menu-card" onclick="bukaSettingHalaman('koneksi')">
              <div class="setting-menu-card-left">
                <div class="setting-menu-icon">🔗</div>
                <div class="setting-menu-card-body">
                  <div class="setting-menu-card-title">Koneksi dan Tautan Webhook</div>
                  <div class="setting-menu-card-desc">
                    Tautan endpoint Google Apps Script untuk sinkronisasi Google Sheets, status proteksi keamanan sistem, dan bersihkan cache perangkat.
                  </div>
                  <div class="setting-menu-card-badge">
                    <span>Spreadsheet Webhook & Keamanan</span>
                  </div>
                </div>
              </div>
              <div class="setting-menu-arrow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- 2. HALAMAN BARU: MASTER DATA KAPAL             -->
        <!-- ============================================== -->
        <div id="settingPageMaster" class="setting-subpage" style="display: none;">
          <button type="button" class="btn-setting-back" onclick="bukaSettingHalaman('menu')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali ke Menu Pengaturan</span>
          </button>

          <div class="setting-page-header-wrap">
            <div class="setting-page-title-box">
              <span class="setting-page-icon">📋</span>
              <div>
                <h3 class="setting-page-header-title">Master Data Kapal (Database Kapal)</h3>
                <div class="setting-page-header-sub">Kelola daftar nama Kapal Ongkir & Kapal Parengge yang tersimpan di Google Spreadsheet</div>
              </div>
            </div>
          </div>

          <!-- Switcher Tab Master: Ongkir / Parengge -->
          <div class="master-tab-switch-bar">
            <button type="button" class="btn-master-tab active" id="btnTabMasterOngkir" onclick="switchMasterTab('ongkir')">
              <span>🚢 Kapal Ongkir</span>
              <span class="master-tab-badge" id="badgeCountOngkir">37</span>
            </button>
            <button type="button" class="btn-master-tab" id="btnTabMasterParengge" onclick="switchMasterTab('parengge')">
              <span>🐟 Kapal Parengge</span>
              <span class="master-tab-badge" id="badgeCountParengge">34</span>
            </button>
          </div>

          <!-- Toolbar Pencarian & Tambah Kapal Baru -->
          <div class="master-toolbar-grid">
            <div class="master-search-row">
              <input type="text" id="searchMasterInput" class="master-input" placeholder="🔍 Cari nama kapal di daftar master..." oninput="filterMasterKapal(this.value)">
            </div>
            <div class="master-add-row">
              <input type="text" id="inputTambahMasterKapal" class="master-input" placeholder="Nama Kapal Ongkir baru (cth: KMN SAMUDRA JAYA)..." onkeydown="if(event.key==='Enter') tambahMasterKapal();">
              <button type="button" class="btn-master-add" onclick="tambahMasterKapal()">
                <span>➕ Tambah</span>
              </button>
            </div>
          </div>

          <!-- Bar Aksi Sync & Simpan ke Google Sheets -->
          <div class="master-actions-bar">
            <div class="master-actions-group">
              <button type="button" class="btn-master-action primary" id="btnSimpanMasterSheets" onclick="simpanMasterKeSheets()" title="Simpan daftar nama kapal terbaru ke tab Database_Kapal di Spreadsheet">
                <span>☁️ Simpan ke Google Sheets</span>
              </button>
              <button type="button" class="btn-master-action" id="btnSyncMasterSheets" onclick="sinkronkanMasterDariSheets()" title="Ambil daftar nama kapal terbaru dari tab Database_Kapal di Spreadsheet">
                <span>🔄 Tarik dari Sheets</span>
              </button>
            </div>
            <div>
              <button type="button" class="btn-master-action" onclick="resetMasterKeStandar()" title="Kembalikan daftar kapal ke daftar bawaan standar">
                <span>↺ Standar</span>
              </button>
            </div>
          </div>

          <!-- Peringatan Perubahan Belum Disimpan -->
          <div class="master-unsaved-alert" id="masterUnsavedAlert">
            <span>⚠️</span>
            <span>Terdapat perubahan lokal yang belum disimpan ke Google Sheets. Klik <strong>"Simpan ke Google Sheets"</strong> agar data online sinkron!</span>
          </div>

          <!-- Container Daftar Nama Kapal -->
          <div class="master-list-container" id="masterKapalItemsList">
            <!-- Diisi via renderMasterKapalList() -->
          </div>
        </div>

        <!-- ============================================== -->
        <!-- 3. HALAMAN BARU: KONEKSI & TAUTAN WEBHOOK      -->
        <!-- ============================================== -->
        <div id="settingPageKoneksi" class="setting-subpage" style="display: none;">
          <button type="button" class="btn-setting-back" onclick="bukaSettingHalaman('menu')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Kembali ke Menu Pengaturan</span>
          </button>

          <div class="setting-page-header-wrap">
            <div class="setting-page-title-box">
              <span class="setting-page-icon">🔗</span>
              <div>
                <h3 class="setting-page-header-title">Koneksi Database & Tautan Webhook</h3>
                <div class="setting-page-header-sub">Tautan endpoint Google Apps Script untuk sinkronisasi online dan proteksi sistem</div>
              </div>
            </div>
          </div>

          <!-- Kredensial Webhook Dilindungi -->
          <div class="security-card-section" style="border-top: none; padding-top: 0;">
            <div class="security-card-header">
              <div class="security-card-title-wrap">
                <span class="security-icon">🌐</span>
                <div>
                  <h3 class="setting-title" style="margin-bottom: 2px;">URL Endpoint Google Apps Script (GAS)</h3>
                  <div class="setting-desc" style="margin-bottom: 0;">Tautan webhook database Google Spreadsheet untuk pelayaran dan muatan.</div>
                </div>
              </div>
              <button type="button" class="btn-lock-toggle is-locked" id="btnToggleWebhookLock" onclick="toggleWebhookLock()">
                🔒 Kunci URL Aktif
              </button>
            </div>

            <div class="webhook-input-wrap">
              <input type="password" id="webhookInput" class="search-input webhook-input" placeholder="https://script.google.com/macros/s/.../exec" readonly>
              <button type="button" class="btn-addon-eye" id="btnToggleWebhookEye" onclick="toggleWebhookVisibility()" title="Tampilkan/Sembunyikan URL">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>

            <button class="btn-action" onclick="simpanWebhook()" style="padding: 0.65rem 1rem; width: 100%; justify-content: center;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Simpan & Amankan Webhook
            </button>
          </div>

          <!-- Status Audit Proteksi Keamanan Fitur -->
          <div class="security-card-section" style="margin-top: 1.25rem; background: #f8fafc; border-radius: 10px; padding: 1rem;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
              <span>🛡️</span> Status Proteksi Keamanan Fitur Web App
            </div>
            <div class="security-checklist-grid">
              <div class="security-check-item">
                <span class="check-bullet">✓</span>
                <span><strong>Anti-Spam Rate Limiter:</strong> Cooldown 4 detik mencegah banjir request & kuota GAS habis</span>
              </div>
              <div class="security-check-item">
                <span class="check-bullet">✓</span>
                <span><strong>Sanitasi Input (Anti-XSS):</strong> Proteksi script injection pada nama kapal & pemilik muatan</span>
              </div>
              <div class="security-check-item">
                <span class="check-bullet">✓</span>
                <span><strong>Masking & Kunci Webhook:</strong> Menyembunyikan endpoint URL database dari pihak lain</span>
              </div>
              <div class="security-check-item">
                <span class="check-bullet">✓</span>
                <span><strong>Proteksi Kerusakan Data:</strong> Validasi ketat rincian kosong sebelum sinkronisasi</span>
              </div>
            </div>
          </div>

          <!-- Pengelolaan Cache Lokal -->
          <div style="border-top: 1px solid var(--border); padding-top: 1rem; margin-top: 1.25rem;">
            <div style="font-size: 0.84rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">Cache Penyimpanan Perangkat</div>
            <p style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 0.6rem;">
              Aplikasi menyimpan salinan database di perangkat ini agar tetap dapat membuka data dan mencetak nota saat koneksi di pelabuhan terputus.
            </p>
            <button class="btn-action" onclick="bersihkanCache()" style="background: #475569; font-size: 0.75rem;">
              🗑️ Bersihkan Cache Lokal
            </button>
          </div>
        </div>
      </div>
  `;

  setTimeout(() => {
    bukaSettingHalaman(currentSettingView);
  }, 10);
}

// ==========================================
// NAVIGASI HALAMAN PENGATURAN (HUB & SUB-PAGES)
// ==========================================
var currentSettingView = 'menu'; // 'menu' | 'master' | 'koneksi'

function bukaSettingHalaman(page) {
  currentSettingView = page;
  const pMenu = document.getElementById('settingPageMenu');
  const pMaster = document.getElementById('settingPageMaster');
  const pKoneksi = document.getElementById('settingPageKoneksi');

  if (pMenu) pMenu.style.display = (page === 'menu') ? 'block' : 'none';
  if (pMaster) pMaster.style.display = (page === 'master') ? 'block' : 'none';
  if (pKoneksi) pKoneksi.style.display = (page === 'koneksi') ? 'block' : 'none';

  if (page === 'master' && typeof renderMasterKapalList === 'function') {
    renderMasterKapalList();
  }

  updateSettingMenuBadges();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSettingMenuBadges() {
  const badgeInfo = document.getElementById('badgeMenuMasterInfo');
  if (badgeInfo) {
    const oCount = Array.isArray(MASTER_KAPAL_ONGKIR) ? MASTER_KAPAL_ONGKIR.length : 0;
    const pCount = Array.isArray(MASTER_KAPAL_PARENGGE) ? MASTER_KAPAL_PARENGGE.length : 0;
    badgeInfo.textContent = `${oCount} Kapal Ongkir • ${pCount} Kapal Parengge`;
  }
}

function switchSettingSubPage(page) {
  if (page === 'data') bukaSettingHalaman('master');
  else if (page === 'link') bukaSettingHalaman('koneksi');
  else bukaSettingHalaman(page);
}

function toggleWebhookLock() {
  initSettingView();
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
    if (typeof switchTab === "function") switchTab('dashboard');
    if (typeof tarikSemuaData === "function") tarikSemuaData();
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
      if (typeof normalizeDatasetTripIds === "function") {
        normalizeDatasetTripIds(allPelayaran, allRincian);
      }

      try {
        localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
        localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      } catch (cErr) {
        console.warn("Gagal simpan ke cache:", cErr);
      }

      if (typeof updateStatusBadge === "function") {
        updateStatusBadge("cache", "Cadangan", ` (${allPelayaran.length} Kapal)`);
      }
      if (document.getElementById("countMuatan")) {
        document.getElementById("countMuatan").textContent = allRincian.length;
      }

      if (typeof renderDashboard === "function") renderDashboard();
      if (typeof filterData === "function") filterData();
      if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();

      showSecurityToast(`✓ ${jmlKapal} kapal berhasil dipulihkan dari cadangan!`);
    } catch (err) {
      console.error("Gagal membaca file cadangan:", err);
      alert("Gagal memulihkan file cadangan: " + err.message);
    }
  };
  reader.readAsText(file);
}

function bersihkanCache() {
  if (confirm("Peringatan Keamanan: Bersihkan seluruh cache lokal pelayaran, muatan, dan master kapal di perangkat ini?")) {
    localStorage.removeItem("CACHE_PELAYARAN");
    localStorage.removeItem("CACHE_RINCIAN");
    localStorage.removeItem("CACHE_MASTER_ONGKIR");
    localStorage.removeItem("CACHE_MASTER_PARENGGE");
    showSecurityToast("✓ Cache lokal berhasil dibersihkan.");
    setTimeout(() => location.reload(), 500);
  }
}

// ==============================================================
// MASTER KAPAL MANAGER (PENGELOLAAN DATABASE_KAPAL SPREADSHEET)
// ==============================================================
var currentMasterTab = 'ongkir'; // 'ongkir' | 'parengge'
var masterSearchQuery = '';
var masterEditingIndex = -1;
var hasUnsavedMasterChanges = false;

function switchMasterTab(type) {
  currentMasterTab = type;
  masterEditingIndex = -1;
  const tabOngkir = document.getElementById('btnTabMasterOngkir');
  const tabParengge = document.getElementById('btnTabMasterParengge');
  if (tabOngkir && tabParengge) {
    if (type === 'ongkir') {
      tabOngkir.classList.add('active');
      tabParengge.classList.remove('active');
    } else {
      tabParengge.classList.add('active');
      tabOngkir.classList.remove('active');
    }
  }
  const inputAdd = document.getElementById('inputTambahMasterKapal');
  if (inputAdd) {
    inputAdd.placeholder = type === 'ongkir' 
      ? 'Nama Kapal Ongkir baru (cth: KMN SAMUDRA JAYA)...' 
      : 'Nama Kapal Parengge baru (cth: BINTANG TIMUR)...';
    inputAdd.value = '';
  }
  renderMasterKapalList();
}

function filterMasterKapal(query) {
  masterSearchQuery = (query || '').trim().toLowerCase();
  renderMasterKapalList();
}

function getActiveMasterArray() {
  return currentMasterTab === 'ongkir' ? MASTER_KAPAL_ONGKIR : MASTER_KAPAL_PARENGGE;
}

function saveActiveMasterArray(newArr) {
  if (currentMasterTab === 'ongkir') {
    MASTER_KAPAL_ONGKIR = newArr;
    try { localStorage.setItem('CACHE_MASTER_ONGKIR', JSON.stringify(MASTER_KAPAL_ONGKIR)); } catch (_) {}
    if (typeof updateMasterOngkirDatalist === 'function') updateMasterOngkirDatalist();
  } else {
    MASTER_KAPAL_PARENGGE = newArr;
    try { localStorage.setItem('CACHE_MASTER_PARENGGE', JSON.stringify(MASTER_KAPAL_PARENGGE)); } catch (_) {}
    if (typeof updateMasterParenggeDatalist === 'function') updateMasterParenggeDatalist();
  }
}

function updateMasterBadges() {
  const countOngkir = Array.isArray(MASTER_KAPAL_ONGKIR) ? MASTER_KAPAL_ONGKIR.length : 0;
  const countParengge = Array.isArray(MASTER_KAPAL_PARENGGE) ? MASTER_KAPAL_PARENGGE.length : 0;
  const bO = document.getElementById('badgeCountOngkir');
  const bP = document.getElementById('badgeCountParengge');
  if (bO) bO.textContent = countOngkir;
  if (bP) bP.textContent = countParengge;

  const unsavedAlert = document.getElementById('masterUnsavedAlert');
  if (unsavedAlert) {
    unsavedAlert.style.display = hasUnsavedMasterChanges ? 'flex' : 'none';
  }
}

function renderMasterKapalList() {
  const container = document.getElementById('masterKapalItemsList');
  if (!container) return;

  updateMasterBadges();

  const arr = getActiveMasterArray();
  const q = masterSearchQuery;

  // Filter dengan melacak original index di array master
  const indexed = arr.map((nama, idx) => ({ nama, originalIndex: idx }));
  const filtered = q
    ? indexed.filter(item => String(item.nama).toLowerCase().includes(q))
    : indexed;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="master-empty-state">
        <div style="font-size: 1.5rem; margin-bottom: 0.35rem;">🔍</div>
        <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Tidak ada kapal ditemukan</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">
          ${q ? `Tidak ada nama yang cocok dengan pencarian "<strong>${escapeHtml(q)}</strong>".` : 'Daftar master kapal saat ini kosong.'}
        </div>
      </div>
    `;
    return;
  }

  let html = '';
  filtered.forEach(item => {
    const isEditing = (masterEditingIndex === item.originalIndex);
    if (isEditing) {
      html += `
        <div class="master-item-row editing">
          <span class="master-item-number">${item.originalIndex + 1}</span>
          <div class="master-item-edit-box">
            <input type="text" id="inputEditMaster_${item.originalIndex}" class="master-edit-input" value="${escapeHtml(item.nama)}" onkeydown="if(event.key==='Enter') simpanEditMasterKapal(${item.originalIndex}); if(event.key==='Escape') batalEditMasterKapal();">
            <button type="button" class="btn-master-save-edit" onclick="simpanEditMasterKapal(${item.originalIndex})" title="Simpan Perubahan">✓ Simpan</button>
            <button type="button" class="btn-master-cancel-edit" onclick="batalEditMasterKapal()" title="Batal">✕ Batal</button>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="master-item-row">
          <span class="master-item-number">${item.originalIndex + 1}</span>
          <span class="master-item-name" title="${escapeHtml(item.nama)}">${escapeHtml(item.nama)}</span>
          <div class="master-item-actions">
            <button type="button" class="btn-master-item-action edit" onclick="bukaEditMasterKapal(${item.originalIndex})" title="Edit nama kapal ini">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-master-item-action delete" onclick="hapusMasterKapal(${item.originalIndex})" title="Hapus nama kapal ini">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Hapus</span>
            </button>
          </div>
        </div>
      `;
    }
  });

  container.innerHTML = html;

  if (masterEditingIndex >= 0) {
    setTimeout(() => {
      const el = document.getElementById(`inputEditMaster_${masterEditingIndex}`);
      if (el) {
        el.focus();
        el.select();
      }
    }, 50);
  }
}

function tambahMasterKapal() {
  const input = document.getElementById('inputTambahMasterKapal');
  if (!input) return;
  const rawVal = input.value.trim().toUpperCase();
  if (!rawVal) {
    showSecurityToast('⚠️ Masukkan nama kapal terlebih dahulu!');
    input.focus();
    return;
  }

  const arr = getActiveMasterArray();
  // Validasi duplikat
  const exists = arr.some(k => k.trim().toUpperCase() === rawVal);
  if (exists) {
    alert(`Kapal "${rawVal}" sudah ada dalam daftar Master ${currentMasterTab === 'ongkir' ? 'Kapal Ongkir' : 'Kapal Parengge'}!`);
    input.focus();
    return;
  }

  arr.push(rawVal);
  saveActiveMasterArray(arr);
  hasUnsavedMasterChanges = true;
  input.value = '';
  renderMasterKapalList();
  showSecurityToast(`✓ Kapal "${rawVal}" berhasil ditambahkan ke daftar master.`);
}

function bukaEditMasterKapal(index) {
  masterEditingIndex = index;
  renderMasterKapalList();
}

function batalEditMasterKapal() {
  masterEditingIndex = -1;
  renderMasterKapalList();
}

function simpanEditMasterKapal(index) {
  const input = document.getElementById(`inputEditMaster_${index}`);
  if (!input) return;
  const valBaru = input.value.trim().toUpperCase();
  if (!valBaru) {
    alert('Nama kapal tidak boleh kosong!');
    input.focus();
    return;
  }

  const arr = getActiveMasterArray();
  const isDuplicate = arr.some((k, i) => i !== index && k.trim().toUpperCase() === valBaru);
  if (isDuplicate) {
    alert(`Nama kapal "${valBaru}" sudah ada dalam daftar!`);
    input.focus();
    return;
  }

  const namaLama = arr[index];
  arr[index] = valBaru;
  saveActiveMasterArray(arr);
  hasUnsavedMasterChanges = true;
  masterEditingIndex = -1;
  renderMasterKapalList();
  showSecurityToast(`✓ Kapal "${namaLama}" diperbarui menjadi "${valBaru}".`);
}

function hapusMasterKapal(index) {
  const arr = getActiveMasterArray();
  const namaTarget = arr[index];
  if (!namaTarget) return;

  const tabLabel = currentMasterTab === 'ongkir' ? 'Kapal Ongkir' : 'Kapal Parengge';
  if (!confirm(`Hapus "${namaTarget}" dari Master ${tabLabel}?`)) {
    return;
  }

  arr.splice(index, 1);
  saveActiveMasterArray(arr);
  hasUnsavedMasterChanges = true;
  if (masterEditingIndex === index) masterEditingIndex = -1;
  renderMasterKapalList();
  showSecurityToast(`✓ Kapal "${namaTarget}" berhasil dihapus.`);
}

async function simpanMasterKeSheets() {
  const url = (typeof getActiveWebhookUrl === "function") ? getActiveWebhookUrl() : localStorage.getItem('GAS_WEBHOOK_URL');
  if (!url) {
    alert('URL Webhook Google Apps Script belum diatur! Masukkan URL webhook di bagian atas terlebih dahulu.');
    return;
  }

  const totalOngkir = Array.isArray(MASTER_KAPAL_ONGKIR) ? MASTER_KAPAL_ONGKIR.length : 0;
  const totalParengge = Array.isArray(MASTER_KAPAL_PARENGGE) ? MASTER_KAPAL_PARENGGE.length : 0;

  const konfirmasi = confirm(
    `Simpan Perubahan Master Kapal ke Google Sheets?\n\n` +
    `• Master Kapal Ongkir: ${totalOngkir} kapal\n` +
    `• Master Kapal Parengge: ${totalParengge} kapal\n\n` +
    `Data tab Database_Kapal di Spreadsheet akan diperbarui secara otomatis. Lanjutkan?`
  );
  if (!konfirmasi) return;

  const btnSimpan = document.getElementById('btnSimpanMasterSheets');
  const oldText = btnSimpan ? btnSimpan.innerHTML : '';
  if (btnSimpan) {
    btnSimpan.disabled = true;
    btnSimpan.innerHTML = `<span>⏳ Menyimpan ke Sheets...</span>`;
  }

  try {
    const payload = {
      auth: typeof APP_SECRET_TOKEN !== "undefined" ? APP_SECRET_TOKEN : "",
      aksi: 'UPDATE_MASTER_KAPAL',
      master_kapal_ongkir: MASTER_KAPAL_ONGKIR,
      master_kapal_parengge: MASTER_KAPAL_PARENGGE
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.status === 'sukses') {
      hasUnsavedMasterChanges = false;
      renderMasterKapalList();
      showSecurityToast(`✓ Master kapal berhasil disimpan ke Google Sheets!`);
      alert(`✓ Berhasil disimpan ke Google Sheets!\n\nTab "Database_Kapal" kini diperbarui:\n• ${result.total_ongkir || totalOngkir} Kapal Ongkir\n• ${result.total_parengge || totalParengge} Kapal Parengge`);
    } else {
      throw new Error(result.pesan || 'Respon server tidak sukses');
    }
  } catch (err) {
    console.error('Gagal menyimpan master kapal ke Google Sheets:', err);
    alert('Gagal menyimpan ke Google Sheets: ' + err.message + '\n\nPastikan script Google Apps Script terbaru sudah di-deploy.');
  } finally {
    if (btnSimpan) {
      btnSimpan.disabled = false;
      btnSimpan.innerHTML = oldText;
    }
  }
}

async function sinkronkanMasterDariSheets() {
  const url = (typeof getActiveWebhookUrl === "function") ? getActiveWebhookUrl() : localStorage.getItem('GAS_WEBHOOK_URL');
  if (!url) {
    alert('URL Webhook Google Apps Script belum diatur! Masukkan URL webhook di bagian atas terlebih dahulu.');
    return;
  }

  const btnSync = document.getElementById('btnSyncMasterSheets');
  const oldText = btnSync ? btnSync.innerHTML : '';
  if (btnSync) {
    btnSync.disabled = true;
    btnSync.innerHTML = `<span>⏳ Mengambil data...</span>`;
  }

  try {
    const sep = url.includes('?') ? '&' : '?';
    const targetUrl = `${url}${sep}aksi=GET_MASTER_DATA&auth=${encodeURIComponent(typeof APP_SECRET_TOKEN !== "undefined" ? APP_SECRET_TOKEN : "")}`;
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error('HTTP Status ' + res.status);
    const data = await res.json();

    if (data.status === 'sukses') {
      let updatedCount = 0;
      if (Array.isArray(data.master_kapal_ongkir) && data.master_kapal_ongkir.length > 0) {
        MASTER_KAPAL_ONGKIR = data.master_kapal_ongkir;
        try { localStorage.setItem('CACHE_MASTER_ONGKIR', JSON.stringify(MASTER_KAPAL_ONGKIR)); } catch (_) {}
        if (typeof updateMasterOngkirDatalist === 'function') updateMasterOngkirDatalist();
        updatedCount += MASTER_KAPAL_ONGKIR.length;
      }
      if (Array.isArray(data.master_kapal_parengge) && data.master_kapal_parengge.length > 0) {
        MASTER_KAPAL_PARENGGE = data.master_kapal_parengge;
        try { localStorage.setItem('CACHE_MASTER_PARENGGE', JSON.stringify(MASTER_KAPAL_PARENGGE)); } catch (_) {}
        if (typeof updateMasterParenggeDatalist === 'function') updateMasterParenggeDatalist();
        updatedCount += MASTER_KAPAL_PARENGGE.length;
      }

      hasUnsavedMasterChanges = false;
      renderMasterKapalList();
      showSecurityToast(`✓ Berhasil menarik master kapal dari Sheets (${updatedCount} kapal).`);
    } else {
      throw new Error(data.pesan || 'Format respon tidak sesuai');
    }
  } catch (err) {
    console.error('Gagal menarik master kapal dari Sheets:', err);
    alert('Gagal menarik master kapal dari Google Sheets: ' + err.message);
  } finally {
    if (btnSync) {
      btnSync.disabled = false;
      btnSync.innerHTML = oldText;
    }
  }
}

function resetMasterKeStandar() {
  const tabLabel = currentMasterTab === 'ongkir' ? 'Kapal Ongkir (37 Kapal)' : 'Kapal Parengge (34 Kapal)';
  if (!confirm(`Kembalikan daftar Master ${tabLabel} ke daftar default bawaan sistem?`)) {
    return;
  }

  if (currentMasterTab === 'ongkir') {
    MASTER_KAPAL_ONGKIR = [...DEFAULT_MASTER_KAPAL_ONGKIR];
    try { localStorage.setItem('CACHE_MASTER_ONGKIR', JSON.stringify(MASTER_KAPAL_ONGKIR)); } catch (_) {}
    if (typeof updateMasterOngkirDatalist === 'function') updateMasterOngkirDatalist();
  } else {
    MASTER_KAPAL_PARENGGE = [...DEFAULT_MASTER_KAPAL_PARENGGE];
    try { localStorage.setItem('CACHE_MASTER_PARENGGE', JSON.stringify(MASTER_KAPAL_PARENGGE)); } catch (_) {}
    if (typeof updateMasterParenggeDatalist === 'function') updateMasterParenggeDatalist();
  }

  hasUnsavedMasterChanges = true;
  masterEditingIndex = -1;
  renderMasterKapalList();
  showSecurityToast(`✓ Master ${tabLabel} berhasil dikembalikan ke standar bawaan.`);
}


