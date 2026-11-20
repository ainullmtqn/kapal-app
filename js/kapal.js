// ==========================================
// MAIN BAR 2: KAPAL ONGKIR (PELAYARAN & MANIFES)
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initKapalView() {
  const container = document.getElementById("tabKapal");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
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
  `;
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
        Tidak ada data kapal yang sesuai pencarian / filter.
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
    const safeWaktu = p.waktu_berangkat ? escapeHtml(p.waktu_berangkat) : "";
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

