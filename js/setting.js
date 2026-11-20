// ==========================================
// MAIN BAR 5: PENGATURAN MASTER DATA KAPAL & CACHE
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initSettingView() {
  const container = document.getElementById("tabSetting");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <div class="setting-box">
        <div class="setting-page-header-wrap" style="margin-bottom: 1.25rem;">
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
            <span class="master-tab-badge" id="badgeCountOngkir">0</span>
          </button>
          <button type="button" class="btn-master-tab" id="btnTabMasterParengge" onclick="switchMasterTab('parengge')">
            <span>🐟 Kapal Parengge</span>
            <span class="master-tab-badge" id="badgeCountParengge">0</span>
          </button>
        </div>

        <!-- Toolbar Pencarian & Tambah/Simpan Kapal Baru -->
        <div class="master-toolbar-grid">
          <div class="master-search-row">
            <input type="text" id="searchMasterInput" class="master-input" placeholder="🔍 Cari nama kapal di daftar master..." oninput="filterMasterKapal(this.value)">
          </div>
          <div class="master-add-row">
            <input type="text" id="inputTambahMasterKapal" class="master-input" placeholder="Nama Kapal Ongkir baru (cth: KMN SAMUDRA JAYA)..." onkeydown="if(event.key==='Enter') tambahDanSimpanMasterKapal();">
            <button type="button" class="btn-master-add" id="btnSimpanMasterSheets" onclick="tambahDanSimpanMasterKapal()" title="Simpan ke database master kapal">
              <span>💾 Simpan</span>
            </button>
          </div>
        </div>

        <!-- Peringatan Perubahan Belum Disimpan -->
        <div class="master-unsaved-alert" id="masterUnsavedAlert" style="display: none;">
          <span>⚠️</span>
          <span>Terdapat perubahan yang belum tersimpan ke Google Sheets. Klik <strong>"Simpan"</strong> di atas agar data online sinkron!</span>
        </div>

        <!-- Container Daftar Nama Kapal dengan Fitur Tutup / Buka -->
        <details class="master-kapal-details-toggle" id="detailsMasterKapalList" style="border: 1px solid var(--border); border-radius: 10px; background: #ffffff; overflow: hidden; margin-top: 0.75rem;">
          <summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: #f8fafc; font-size: 0.84rem; font-weight: 800; color: var(--text-primary); user-select: none; outline: none; list-style: none;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.15rem;">📑</span>
              <span id="titleSummaryMasterList">Daftar Nama Kapal Ongkir</span>
              <span class="master-tab-badge" id="badgeCountMasterList" style="font-size: 0.7rem; padding: 2px 7px;">0</span>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; font-size: 0.73rem; color: var(--text-muted); font-weight: 600;">
              <span>Klik Buka / Tutup</span>
              <span style="font-size: 0.85rem;">📋</span>
            </div>
          </summary>
          <div class="master-list-container" id="masterKapalItemsList" style="border: none; border-top: 1px solid var(--border); border-radius: 0;">
            <!-- Diisi via renderMasterKapalList() -->
          </div>
        </details>

        <!-- Keamanan & Hak Akses Kata Sandi Pengelola (Hanya Ditampilkan untuk Super Admin) -->
        <div id="sectionPasswordPengelola" style="border-top: 1px solid var(--border); padding-top: 1.25rem; margin-top: 1.75rem; display: none;">
          <!-- Diisi dinamis via renderAdminPasswordSection() -->
        </div>

        <!-- Pengelolaan Cache Lokal -->
        <div style="border-top: 1px solid var(--border); padding-top: 1.25rem; margin-top: 1.75rem;">
          <div style="font-size: 0.84rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">💾 Cache Penyimpanan Perangkat</div>
          <p style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 0.75rem; line-height: 1.45;">
            Aplikasi menyimpan salinan database di perangkat ini agar tetap dapat membuka data dan mencetak nota saat koneksi internet di pelabuhan tidak stabil.
          </p>
          <button class="btn-action" onclick="bersihkanCache()" style="background: #475569; font-size: 0.78rem; padding: 0.55rem 1rem;">
            🗑️ Bersihkan Cache Lokal
          </button>
        </div>
      </div>
  `;

  setTimeout(() => {
    if (typeof renderMasterKapalList === 'function') {
      renderMasterKapalList();
    }
    if (typeof renderAdminPasswordSection === 'function') {
      renderAdminPasswordSection();
    }
  }, 10);
}

// Navigasi pembantu untuk kompatibilitas jika dipanggil dari tempat lain
function bukaSettingHalaman() {
  if (typeof renderMasterKapalList === 'function') {
    renderMasterKapalList();
  }
  if (typeof renderAdminPasswordSection === 'function') {
    renderAdminPasswordSection();
  }
}

function bersihkanCache() {
  if (confirm("Peringatan Keamanan: Bersihkan seluruh cache lokal pelayaran, muatan, dan master kapal di perangkat ini?")) {
    localStorage.removeItem("CACHE_PELAYARAN");
    localStorage.removeItem("CACHE_RINCIAN");
    localStorage.removeItem("CACHE_MASTER_ONGKIR");
    localStorage.removeItem("CACHE_MASTER_PARENGGE");
    localStorage.removeItem("GAS_WEBHOOK_URL");
    showSecurityToast("✓ Cache lokal berhasil dibersihkan.");
    setTimeout(() => location.reload(), 500);
  }
}

// ==============================================================
// PENGELOLAAN KATA SANDI
// ==============================================================

function renderAdminPasswordSection(isOpen = false) {
  const container = document.getElementById("sectionPasswordPengelola");
  if (!container) return;

  const isAuth = sessionStorage.getItem("IS_ADMIN_AUTH") === "true";
  const role = sessionStorage.getItem("ADMIN_ROLE");

  // UNTUK ADMIN BIASA (ATAU BELUM AUTH): BAGIAN KEAMANAN DAN HAK AKSES TIDAK DITAMPILKAN SAMA SEKALI
  if (!isAuth || role !== "super_admin") {
    container.style.display = "none";
    container.innerHTML = "";
    return;
  }

  // TAMPILKAN DALAM KONDISI MINIMISE (COLLAPSED) TERLEBIH DAHULU
  container.style.display = "block";
  const currentAdminPass = localStorage.getItem("APP_ADMIN_PASSWORD") || "PAONGKIR";

  container.innerHTML = `
    <details class="superadmin-details-toggle" id="detailsSuperAdminPass" ${isOpen ? 'open' : ''} style="border: 1px solid var(--border); border-radius: 10px; background: #ffffff; overflow: hidden;">
      <summary style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: #f8fafc; font-size: 0.84rem; font-weight: 800; color: var(--text-primary); user-select: none; outline: none; list-style: none;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.15rem;">🔐</span>
          <span>Pengaturan Kata Sandi Admin</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.73rem; color: var(--text-muted); font-weight: 600;">
          <span>Klik Buka / Tutup</span>
          <span style="font-size: 0.85rem;">⚙️</span>
        </div>
      </summary>

      <div style="padding: 1.1rem; border-top: 1px solid var(--border); background: #ffffff;">
        <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.45;">
          Ubah kata sandi yang digunakan oleh <strong>Admin</strong> untuk masuk ke portal administrasi & database kapal.
        </p>

        <!-- Card: Ganti Sandi Admin Biasa -->
        <div style="background: var(--card-bg, #ffffff); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; max-width: 440px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
            <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-primary);">🛡️ Sandi Admin</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">Saat ini: <strong>${escapeHtml(currentAdminPass)}</strong></span>
          </div>
          <p style="font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.65rem; line-height: 1.35;">
            Kata sandi login operasional untuk petugas pelabuhan & admin.
          </p>
          <div style="position: relative; margin-bottom: 0.65rem;">
            <input type="password" id="inputNewAdminPassword" class="search-input" placeholder="Ketik kata sandi Admin baru..." style="width: 100%; font-size: 0.82rem; padding-right: 36px;">
            <button type="button" onclick="togglePasswordVisibility('inputNewAdminPassword', this)" title="Tampilkan sandi" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 0.9rem;">👁️</button>
          </div>
          <button type="button" class="btn-action" onclick="simpanSandiRole('admin')" style="background: var(--ocean); font-size: 0.76rem; padding: 0.45rem 0.9rem; width: 100%; justify-content: center; font-weight: 700;">
            💾 Simpan Sandi Admin
          </button>
        </div>

        <div style="display: flex; justify-content: flex-start;">
          <button type="button" class="btn-action" onclick="kunciPortalPengelola()" style="background: #e2e8f0; color: var(--text-primary); font-size: 0.75rem; padding: 0.45rem 0.95rem;">
            🔒 Kunci Portal Sekarang
          </button>
        </div>
      </div>
    </details>
  `;
}

function simpanSandiRole(type) {
  const role = sessionStorage.getItem("ADMIN_ROLE");
  if (role !== "super_admin") {
    alert("⛔ Akses Ditolak: Hanya Super Admin yang berhak mengubah kata sandi.");
    return;
  }

  const inp = document.getElementById("inputNewAdminPassword");
  const val = (inp ? inp.value : "").trim();
  if (!val || val.length < 3) {
    alert("Kata sandi Admin baru minimal 3 karakter.");
    return;
  }
  localStorage.setItem("APP_ADMIN_PASSWORD", val);
  if (inp) inp.value = "";
  showSecurityToast("✓ Kata sandi Admin berhasil diubah!");
  renderAdminPasswordSection(true);
  alert("✓ Sukses! Kata sandi Admin berhasil diperbarui menjadi: " + val);
}

function simpanPasswordPengelolaBaru() {
  simpanSandiRole('admin');
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
  const details = document.getElementById('detailsMasterKapalList');
  if (details && masterSearchQuery) {
    details.open = true;
  }
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

  const titleSummary = document.getElementById('titleSummaryMasterList');
  const badgeSummary = document.getElementById('badgeCountMasterList');
  if (titleSummary) {
    titleSummary.textContent = currentMasterTab === 'ongkir' ? 'Daftar Nama Kapal Ongkir' : 'Daftar Nama Kapal Parengge';
  }
  if (badgeSummary) {
    badgeSummary.textContent = currentMasterTab === 'ongkir' ? countOngkir : countParengge;
  }

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

async function tambahDanSimpanMasterKapal() {
  const input = document.getElementById('inputTambahMasterKapal');
  const rawVal = input ? input.value.trim().toUpperCase() : '';

  if (rawVal) {
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
    input.value = '';
    const details = document.getElementById('detailsMasterKapalList');
    if (details) details.open = true;
    renderMasterKapalList();
  }

  // Simpan perubahan ke Google Sheets secara langsung
  await simpanMasterKeSheets(true);
}

function tambahMasterKapal() {
  return tambahDanSimpanMasterKapal();
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
  masterEditingIndex = -1;
  renderMasterKapalList();
  showSecurityToast(`✓ Kapal "${namaLama}" diperbarui menjadi "${valBaru}".`);
  simpanMasterKeSheets(true);
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
  if (masterEditingIndex === index) masterEditingIndex = -1;
  renderMasterKapalList();
  showSecurityToast(`✓ Kapal "${namaTarget}" berhasil dihapus.`);
  simpanMasterKeSheets(true);
}

async function simpanMasterKeSheets(silent = false) {
  const url = (typeof getActiveWebhookUrl === "function") ? getActiveWebhookUrl() : (typeof getDefaultWebhookUrl === 'function' ? getDefaultWebhookUrl() : '');
  if (!url) {
    if (!silent) alert('Koneksi sistem belum siap.');
    return;
  }

  const btnSimpan = document.getElementById('btnSimpanMasterSheets');
  const oldText = btnSimpan ? btnSimpan.innerHTML : '';
  if (btnSimpan) {
    btnSimpan.disabled = true;
    btnSimpan.innerHTML = `<span>⏳ Menyimpan...</span>`;
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
      showSecurityToast(`✓ Master kapal berhasil disimpan!`);
    } else {
      throw new Error(result.pesan || 'Respon server tidak sukses');
    }
  } catch (err) {
    console.error('Gagal menyimpan master kapal:', err);
    if (!silent) {
      alert('Gagal menyimpan master kapal: ' + err.message);
    } else {
      showSecurityToast('⚠️ Tersimpan di perangkat (koneksi lambat).');
    }
  } finally {
    if (btnSimpan) {
      btnSimpan.disabled = false;
      btnSimpan.innerHTML = oldText || `<span>💾 Simpan</span>`;
    }
  }
}

async function sinkronkanMasterDariSheets() {
  const url = (typeof getActiveWebhookUrl === "function") ? getActiveWebhookUrl() : (typeof getDefaultWebhookUrl === 'function' ? getDefaultWebhookUrl() : '');
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


