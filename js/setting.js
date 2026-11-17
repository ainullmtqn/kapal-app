// ==========================================
// MAIN BAR 5: PENGATURAN WEBHOOK & CADANGAN
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initSettingView() {
  const container = document.getElementById("tabSetting");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <div class="setting-box">
        <div class="setting-brand-banner">
          <div class="setting-banner-logo-wrap">
            <img src="logo.png" alt="Logo PARENGGEKITA" class="setting-banner-logo">
          </div>
          <div>
            <div class="setting-banner-title">PARENGGE<span class="brand-title-accent">KITA</span><span class="brand-title-dot">.</span></div>
            <div class="setting-banner-sub">Sistem Digital Manifes & Nota Logistik Kapal</div>
          </div>
        </div>

        <!-- 1. Kredensial Webhook Dilindungi -->
        <div class="security-card-section">
          <div class="security-card-header">
            <div class="security-card-title-wrap">
              <span class="security-icon">🔗</span>
              <div>
                <h3 class="setting-title" style="margin-bottom: 2px;">Koneksi Database Webhook (GAS)</h3>
                <div class="setting-desc" style="margin-bottom: 0;">Tautan endpoint Google Apps Script untuk sinkronisasi manifes kapal.</div>
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

        <!-- 2. Pusat Cadangan & Pemulihan Data (Data Protection & Recovery) -->
        <div class="security-card-section" style="margin-top: 1.25rem;">
          <div class="security-card-title-wrap" style="margin-bottom: 0.5rem;">
            <span class="security-icon">🛡️</span>
            <div>
              <h3 class="setting-title" style="margin-bottom: 2px;">Cadangan & Pemulihan Mandiri (JSON)</h3>
              <div class="setting-desc" style="margin-bottom: 0;">Amankan data offline ke file lokal atau pulihkan data kapan saja tanpa internet.</div>
            </div>
          </div>

          <div class="backup-btn-grid">
            <button type="button" class="btn-action btn-backup-export" onclick="eksporCadanganData()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Ekspor Cadangan (JSON)</span>
            </button>

            <button type="button" class="btn-action btn-backup-import" onclick="triggerImporCadangan()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span>Pulihkan dari Cadangan</span>
            </button>
            <input type="file" id="backupFileInput" accept=".json" style="display: none;" onchange="handleFileImporCadangan(event)">
          </div>
        </div>

        <!-- 3. Status Audit Proteksi Keamanan Fitur -->
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

        <!-- 4. Pengelolaan Cache Lokal -->
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
  `;
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
      if (typeof renderAuditTab === "function") renderAuditTab();

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

