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

        <!-- Keamanan & Kata Sandi Pengelola -->
        <div style="border-top: 1px solid var(--border); padding-top: 1.25rem; margin-top: 1.75rem;">
          <div style="font-size: 0.84rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
            🔐 Kata Sandi Akses Pengelola
          </div>
          <p style="font-size: 0.76rem; color: var(--text-muted); margin-bottom: 0.75rem; line-height: 1.45;">
            Ubah kata sandi yang digunakan saat masuk ke portal administrasi & database kapal (Kata sandi bawaan: <code>parengge2026</code>).
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; max-width: 440px; margin-bottom: 0.75rem;">
            <input type="password" id="inputNewAdminPassword" class="search-input" placeholder="Ketik kata sandi baru..." style="flex: 1; min-width: 200px; font-size: 0.82rem;">
            <button type="button" class="btn-action" onclick="simpanPasswordPengelolaBaru()" style="background: var(--ocean); font-size: 0.78rem; padding: 0.55rem 1rem;">
              💾 Simpan Sandi
            </button>
          </div>
          <div>
            <button type="button" class="btn-action" onclick="kunciPortalPengelola()" style="background: #e2e8f0; color: var(--text-primary); font-size: 0.75rem; padding: 0.4rem 0.85rem;">
              🔒 Kunci Portal Sekarang
            </button>
          </div>
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
  }, 10);
}

// Navigasi pembantu untuk kompatibilitas jika dipanggil dari tempat lain
function bukaSettingHalaman() {
  if (typeof renderMasterKapalList === 'function') {
    renderMasterKapalList();
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

function simpanPasswordPengelolaBaru() {
  const inp = document.getElementById("inputNewAdminPassword");
  const val = (inp ? inp.value : "").trim();
  if (!val || val.length < 4) {
    alert("Kata sandi baru minimal 4 karakter.");
    return;
  }
  localStorage.setItem("APP_ADMIN_PASSWORD", val);
  if (inp) inp.value = "";
  showSecurityToast("✓ Kata sandi pengelola berhasil diperbarui!");
  alert("✓ Kata sandi pengelola berhasil diubah!");
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
  const url = (typeof getActiveWebhookUrl === "function") ? getActiveWebhookUrl() : (typeof getDefaultWebhookUrl === 'function' ? getDefaultWebhookUrl() : '');
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


