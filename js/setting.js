// ==========================================
// MAIN BAR 5: PENGATURAN WEBHOOK & CADANGAN
// PARENGGEKITA - SISTEM MANIFES KAPAL
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
