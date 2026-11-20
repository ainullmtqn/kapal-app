// ==========================================
// MAIN BAR 2: KAPAL ONGKIR (PELAYARAN & MANIFES)
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initKapalView() {
  const container = document.getElementById("tabKapal");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <datalist id="listMasterOngkir"></datalist>
      <div class="section-header" style="margin-bottom: 0.85rem;">
        <div>
          <h2 class="section-title">Database Pelayaran Kapal</h2>
          <div class="section-subtitle">Daftar seluruh manifest kedatangan kapal dan rincian muatan</div>
        </div>
      </div>

      <div class="search-card">
        <div class="search-input-wrap">
          <input type="text" id="searchInput" class="search-input" placeholder="🔍 Cari nama kapal, juragan, parengge..." oninput="filterData()">
          <button class="btn-action btn-refresh-search" onclick="tarikSemuaData()" title="Segarkan Data">
            <svg class="btn-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span class="btn-text">Segarkan</span>
          </button>
        </div>
        <div class="filter-pills-wrap" id="filterPillsWrap">
          <div class="pill-btn active" onclick="setPillFilter('SEMUA', this)">Semua Data</div>
          <div class="pill-btn" onclick="setPillFilter('HARI_INI', this)">Hari Ini</div>
          <div class="pill-btn" onclick="setPillFilter('KALMAS', this)">Kalmas</div>
          <div class="pill-btn" onclick="setPillFilter('PUMA', this)">Puma</div>
        </div>
      </div>

      <div class="voyage-grid" id="shipCardList">
        <div class="card" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Sedang memuat daftar kapal...
        </div>
      </div>

      <div class="bottom-action-bar-wrap" style="margin-top: 1.5rem; text-align: center; padding-bottom: 1.5rem;">
        <button class="btn-action" onclick="bukaModalTambahPelayaran()" style="background: var(--ocean); font-size: 0.88rem; padding: 0.75rem 1.4rem; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; max-width: 360px; margin: 0 auto; box-shadow: 0 4px 14px rgba(14, 116, 144, 0.28); border-radius: 9px; font-weight: 700;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Tambah Pelayaran Baru</span>
        </button>
      </div>
  `;

  updateMasterOngkirDatalist();
}

function setPillFilter(type, el) {
  initKapalView();
  document.querySelectorAll('#filterPillsWrap .pill-btn').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  currentFilterPill = type;
  filterData();
}

function filterData() {
  initKapalView();
  const searchInput = document.getElementById("searchInput");
  const rawQ = searchInput ? searchInput.value : "";
  const q = sanitizeInput(rawQ).toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];

  filteredPelayaran = allPelayaran.filter(p => {
    const nKapal = (p.nama_kapal_ongkir || p.nama_kapal || "").toLowerCase();
    const matchShip = nKapal.includes(q) ||
      (p.juragan || "").toLowerCase().includes(q) ||
      (p.lokasi_muat || "").toLowerCase().includes(q) ||
      (p.waktu_berangkat || "").toLowerCase().includes(q) ||
      (p.tanggal || "").toLowerCase().includes(q);

    const matchParengge = !q ? false : allRincian.some(r => 
      isSameTripRecord(r, p) && 
      (r.nama_kapal_parengge || r.nama_pemilik || "").toLowerCase().includes(q)
    );

    const matchSearch = !q || matchShip || matchParengge;

    let matchPill = true;
    if (currentFilterPill === 'HARI_INI') {
      matchPill = (p.tanggal === todayStr);
    } else if (currentFilterPill === 'KALMAS') {
      const lok = (p.lokasi_muat || "").toLowerCase();
      matchPill = lok.includes('kalmas') || lok.includes('ddc') || lok.includes('ddl') || nKapal.includes('kalmas');
    } else if (currentFilterPill === 'PUMA') {
      const lok = (p.lokasi_muat || "").toLowerCase();
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
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🚢</div>
        <p style="margin-bottom: 1rem; font-weight: 600; color: var(--text-primary);">Belum ada data pelayaran kapal yang sesuai filter.</p>
        <button class="btn-action" onclick="bukaModalTambahPelayaran()" style="margin: 0 auto; background: var(--ocean);">
          ➕ Tambah Pelayaran Baru
        </button>
      </div>
    `;
    return;
  }

  filteredPelayaran.forEach((p) => {
    const isOk = p.status_selisih === "SESUAI";
    const badgeClass = isOk ? "badge-status-ok" : "badge-status-warn";
    const badgeLabel = isOk ? "SESUAI ✓" : "SELISIH ⚠️";
    const safeNama = escapeHtml(p.nama_kapal_ongkir || p.nama_kapal);
    const safeTanggal = validateDateFormat(p.tanggal) ? escapeHtml(normalizeDateKey(p.tanggal)) : escapeHtml(p.tanggal || "-");
    const safeJuragan = escapeHtml(p.juragan || "-");
    const safeLokasi = escapeHtml(p.lokasi_muat || "DDL");
    const safeWaktu = p.waktu_berangkat ? escapeHtml(formatWaktuBerangkat(p.waktu_berangkat)) : "";
    const tripKey = p.kunci_unik || getNormalizedTripId(p.nama_kapal_ongkir || p.nama_kapal, p.tanggal);
    const safeKunci = escapeHtml(tripKey).replace(/'/g, "\\'");

    const totalTerhitung = p.total_terhitung !== undefined ? p.total_terhitung : p.total_hitung;

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
        ${safeWaktu ? `<div>⏰ <b>Waktu Berangkat:</b> ${safeWaktu}</div>` : ""}
      </div>
      <div class="card-footer">
        <div class="card-total-box">📦 ${formatDots(totalTerhitung)} Gabus</div>
        <button class="btn-action" onclick="bukaNota('${safeKunci}')">Buka / Cetak Nota</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// MODAL TAMBAH PELAYARAN / NOTA BARU
// ==========================================

function updateMasterOngkirDatalist() {
  const dl = document.getElementById("listMasterOngkir");
  if (!dl) return;
  const list = typeof getMasterKapalOngkir === "function" 
    ? getMasterKapalOngkir() 
    : ((Array.isArray(MASTER_KAPAL_ONGKIR) && MASTER_KAPAL_ONGKIR.length > 0) ? MASTER_KAPAL_ONGKIR : DEFAULT_MASTER_KAPAL_ONGKIR);
  dl.innerHTML = list.map(k => `<option value="${escapeHtml(k)}">`).join("");
}

function bukaModalTambahPelayaran(defaultTanggal = "") {
  const modal = document.getElementById("tambahPelayaranModal");
  if (!modal) return;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const tglVal = defaultTanggal || todayStr;
  
  const masterOngkir = typeof getMasterKapalOngkir === "function"
    ? getMasterKapalOngkir()
    : ((Array.isArray(MASTER_KAPAL_ONGKIR) && MASTER_KAPAL_ONGKIR.length > 0) ? MASTER_KAPAL_ONGKIR : DEFAULT_MASTER_KAPAL_ONGKIR);
  const defaultKapal = masterOngkir.length > 0 ? masterOngkir[0] : "KMN AMALIA";

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 480px; padding: 1.5rem;">
      <div class="modal-top-bar" style="margin-bottom: 1.25rem;">
        <span style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary);">➕ Tambah Pelayaran / Nota Baru</span>
        <button type="button" class="btn-close" onclick="tutupModalTambahPelayaran()">✕</button>
      </div>

      <form id="formTambahPelayaran" onsubmit="handleSimpanPelayaranBaru(event)">
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div>
            <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Nama Kapal Ongkir *</label>
            <input type="text" id="inpBaruNamaKapal" list="listMasterOngkir" class="search-input" value="${escapeHtml(defaultKapal)}" required style="width: 100%;" placeholder="Pilih / ketik nama kapal ongkir...">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Tanggal *</label>
              <input type="date" id="inpBaruTanggal" class="search-input" value="${escapeHtml(tglVal)}" required style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Waktu Berangkat</label>
              <input type="text" id="inpBaruWaktu" class="search-input" value="14.30" style="width: 100%;" placeholder="Contoh: 14.30">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Juragan</label>
              <input type="text" id="inpBaruJuragan" class="search-input" placeholder="Nama juragan..." style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Lokasi Muat</label>
              <input type="text" id="inpBaruLokasi" class="search-input" value="DDL" style="width: 100%;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Nomor Resi</label>
              <input type="text" id="inpBaruResi" class="search-input" value="1" style="width: 100%;">
            </div>
            <div>
              <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); display: block; margin-bottom: 4px;">Total Tertulis (Opsional)</label>
              <input type="number" id="inpBaruTotalTertulis" class="search-input" min="0" placeholder="0" style="width: 100%;">
            </div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 0.75rem;">
            <button type="button" class="btn-action" onclick="tutupModalTambahPelayaran()" style="background: #64748b;">Batal</button>
            <button type="submit" class="btn-action" style="background: var(--ocean);">✓ Simpan & Buka Nota</button>
          </div>
        </div>
      </form>
    </div>
  `;

  updateMasterOngkirDatalist();
  modal.classList.add("active");
}

function tutupModalTambahPelayaran() {
  const modal = document.getElementById("tambahPelayaranModal");
  if (modal) modal.classList.remove("active");
}

function handleSimpanPelayaranBaru(e) {
  if (e && e.preventDefault) e.preventDefault();
  const inpKapal = document.getElementById("inpBaruNamaKapal");
  const inpTgl = document.getElementById("inpBaruTanggal");
  const inpWkt = document.getElementById("inpBaruWaktu");
  const inpJrg = document.getElementById("inpBaruJuragan");
  const inpLok = document.getElementById("inpBaruLokasi");
  const inpRes = document.getElementById("inpBaruResi");
  const inpTot = document.getElementById("inpBaruTotalTertulis");

  const rawKapal = inpKapal ? inpKapal.value : "";
  const namaKapal = sanitizeInput(rawKapal).trim();
  const tanggal = normalizeDateKey(inpTgl ? inpTgl.value : "").trim();
  if (!namaKapal || !tanggal) {
    alert("Harap isi Nama Kapal Ongkir dan Tanggal.");
    return;
  }

  const juragan = sanitizeInput(inpJrg ? inpJrg.value : "").trim();
  const waktu = sanitizeInput(inpWkt ? inpWkt.value : "14.30").trim();
  const lokasi = sanitizeInput(inpLok ? inpLok.value : "DDL").trim();
  const resi = sanitizeInput(inpRes ? inpRes.value : "1").trim();
  const tertulis = Math.max(0, Math.floor(Number(inpTot ? inpTot.value : 0) || 0));

  const tripKey = `${namaKapal}_${tanggal}`;

  // Cek apakah pelayaran ini sudah ada
  let existing = allPelayaran.find(p => {
    const pK = String(p.kunci_unik || "").trim().toLowerCase();
    return pK === tripKey.toLowerCase();
  });

  if (!existing) {
    const newShip = {
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      kunci_unik: tripKey,
      tanggal: tanggal,
      nama_kapal_ongkir: namaKapal,
      nama_kapal: namaKapal,
      juragan: juragan,
      lokasi_muat: lokasi,
      waktu_berangkat: waktu,
      total_tertulis: tertulis,
      total_terhitung: 0,
      total_hitung: 0,
      selisih: tertulis > 0 ? tertulis : 0,
      status_selisih: tertulis > 0 ? "SELISIH" : "SESUAI",
      subtotal_ongkir: 0,
      subtotal: 0,
      potongan: 0,
      total_bersih: 0,
      resi: resi
    };
    allPelayaran.unshift(newShip);
    try {
      localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
    } catch (_) {}
  }

  tutupModalTambahPelayaran();

  if (typeof renderWartaHariIni === "function") renderWartaHariIni(tanggal);
  if (typeof renderDashboard === "function") renderDashboard();
  if (typeof filterData === "function") filterData();

  // Langsung buka modal nota agar user bisa mengisi rincian kapal parengge
  setTimeout(() => {
    bukaNota(tripKey);
  }, 100);
}

