// ==========================================
// MAIN BAR 3: MUATAN KAPAL PARENGGE (MASTER & REKAPITULASI)
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

var currentParenggePill = 'SEMUA';

function initMuatanView() {
  const container = document.getElementById("tabMuatan");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <div class="search-card">
        <div class="section-header" style="margin-bottom: 0.5rem;">
          <div>
            <h2 class="section-title">Kapal Parengge (<span id="countMuatan">0</span> Terdeteksi)</h2>
            <div class="section-subtitle">Daftar master kapal parengge dan rekapitulasi muatan gabus</div>
          </div>
        </div>
        <div class="search-input-wrap">
          <input type="text" id="searchMuatanInput" class="search-input" placeholder="🔍 Cari nama kapal parengge / kapal ongkir..." oninput="filterParenggeTab(this.value)">
          <button class="btn-action btn-refresh-search" onclick="tarikSemuaData()" title="Segarkan Data">
            <svg class="btn-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span class="btn-text">Segarkan</span>
          </button>
        </div>
        <div class="filter-pills-wrap" id="parenggePillsWrap">
          <div class="pill-btn active" onclick="setPillParengge('SEMUA', this)">Semua (<span id="pillCountSemua">0</span>)</div>
          <div class="pill-btn" onclick="setPillParengge('ADA_MUATAN', this)">Ada Muatan (<span id="pillCountAktif">0</span>)</div>
          <div class="pill-btn" onclick="setPillParengge('KOSONG', this)">Belum Ada Muatan (<span id="pillCountKosong">0</span>)</div>
        </div>
      </div>

      <div class="parengge-grid" id="allMuatanList"></div>
  `;
}

function setPillParengge(type, el) {
  initMuatanView();
  document.querySelectorAll('#parenggePillsWrap .pill-btn').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  currentParenggePill = type;
  const searchInput = document.getElementById("searchMuatanInput");
  renderSemuaMuatan(searchInput ? searchInput.value : "");
}

function filterParenggeTab(query) {
  initMuatanView();
  renderSemuaMuatan(query);
}

function renderSemuaMuatan(searchQuery = "") {
  initMuatanView();
  const container = document.getElementById("allMuatanList");
  if (!container) return;
  container.innerHTML = "";

  // 1. Agregasi: Inisialisasi dari Master Database Kapal Parengge
  let aggregatedMap = {};

  const masterList = typeof getMasterKapalParengge === "function"
    ? getMasterKapalParengge()
    : ((Array.isArray(MASTER_KAPAL_PARENGGE) && MASTER_KAPAL_PARENGGE.length > 0) ? MASTER_KAPAL_PARENGGE : DEFAULT_MASTER_KAPAL_PARENGGE);

  masterList.forEach((namaMaster) => {
    const raw = String(namaMaster || "").trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    if (!aggregatedMap[key]) {
      aggregatedMap[key] = {
        nama_asli: raw,
        is_master: true,
        total_gabus: 0,
        riwayat_pengiriman: []
      };
    }
  });

  // 2. Gabungkan data riwayat muatan aktual dari allRincian
  if (Array.isArray(allRincian)) {
    allRincian.forEach((r) => {
      let rawName = String(r.nama_kapal_parengge || r.nama_pemilik || r.nama || "").trim();
      if (!rawName) rawName = "Tanpa Nama";
      let key = rawName.toLowerCase();

      if (!aggregatedMap[key]) {
        aggregatedMap[key] = {
          nama_asli: rawName,
          is_master: false,
          total_gabus: 0,
          riwayat_pengiriman: []
        };
      }

      const jml = Number(r.jumlah_gabus !== undefined ? r.jumlah_gabus : r.jumlah) || 0;
      aggregatedMap[key].total_gabus += jml;
      aggregatedMap[key].riwayat_pengiriman.push({
        kapal: r.nama_kapal_ongkir || r.nama_kapal || "-",
        tanggal: r.tanggal || "-",
        jumlah: jml,
        satuan: r.satuan || "Gabus"
      });
    });
  }

  let fullList = Object.values(aggregatedMap);

  // Update counter pills
  const totalCount = fullList.length;
  const aktifCount = fullList.filter(item => item.total_gabus > 0).length;
  const kosongCount = totalCount - aktifCount;

  const elSemua = document.getElementById("pillCountSemua");
  const elAktif = document.getElementById("pillCountAktif");
  const elKosong = document.getElementById("pillCountKosong");
  if (elSemua) elSemua.textContent = totalCount;
  if (elAktif) elAktif.textContent = aktifCount;
  if (elKosong) elKosong.textContent = kosongCount;

  // 3. Filter berdasarkan Pill
  let displayList = fullList;
  if (currentParenggePill === 'ADA_MUATAN') {
    displayList = displayList.filter(item => item.total_gabus > 0);
  } else if (currentParenggePill === 'KOSONG') {
    displayList = displayList.filter(item => item.total_gabus === 0);
  }

  // 4. Filter berdasarkan Search Input
  if (searchQuery) {
    const qLower = searchQuery.toLowerCase().trim();
    displayList = displayList.filter(item => {
      const matchNama = item.nama_asli.toLowerCase().includes(qLower);
      const matchKapal = item.riwayat_pengiriman.some(rip => 
        rip.kapal.toLowerCase().includes(qLower) || String(rip.tanggal).includes(qLower)
      );
      return matchNama || matchKapal;
    });
  }

  // 5. Urutkan: Yang ada muatan terbanyak di atas, sisanya urut nama
  displayList.sort((a, b) => {
    if (b.total_gabus !== a.total_gabus) {
      return b.total_gabus - a.total_gabus;
    }
    return a.nama_asli.localeCompare(b.nama_asli);
  });

  const countBadge = document.getElementById("countMuatan");
  if (countBadge) {
    countBadge.textContent = fullList.length;
  }

  if (displayList.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        Tidak ada data kapal parengge yang sesuai dengan filter / pencarian "${escapeHtml(searchQuery)}".
      </div>
    `;
    return;
  }

  displayList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "parengge-card";

    const hasCargo = item.total_gabus > 0;
    const badgeStyle = hasCargo 
      ? "" 
      : "background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1;";
    const badgeText = hasCargo 
      ? `📦 ${formatDots(item.total_gabus)} G` 
      : "0 Gabus (Siap Muat)";

    let historyContent = "";
    if (hasCargo && item.riwayat_pengiriman.length > 0) {
      historyContent = item.riwayat_pengiriman.map(rip => 
        `<div>• Kapal: <b>${escapeHtml(rip.kapal)}</b> (${escapeHtml(rip.tanggal)}) — <b>${rip.jumlah} Gabus</b></div>`
      ).join("");
    } else {
      historyContent = `<div style="font-size: 0.76rem; color: var(--text-muted); font-style: italic;">Belum ada catatan pelayaran kedatangan muatan.</div>`;
    }

    card.innerHTML = `
      <div class="parengge-card-header">
        <div>
          <div class="parengge-title">${escapeHtml(item.nama_asli)}</div>
          <div class="parengge-meta">
            ${hasCargo ? `Total Pengiriman: ${item.riwayat_pengiriman.length} kali` : "Terdaftar di Master Database Kapal"}
          </div>
        </div>
        <div class="parengge-gabus-badge" style="${badgeStyle}">
          ${badgeText}
        </div>
      </div>
      <div class="parengge-history-list">
        ${historyContent}
      </div>
    `;
    container.appendChild(card);
  });
}
