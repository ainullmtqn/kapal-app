// ==========================================
// MAIN BAR 3: MUATAN KAPAL PARENGGE (RIWAYAT PENGIRIMAN AKTUAL)
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
            <h2 class="section-title">Kapal Parengge (<span id="countMuatan">0</span> Kapal Pernah Kirim)</h2>
            <div class="section-subtitle">Daftar kapal parengge yang tercatat memiliki riwayat pengiriman muatan gabus</div>
          </div>
        </div>
        <div class="search-input-wrap">
          <input type="text" id="searchMuatanInput" class="search-input" placeholder="🔍 Cari nama kapal parengge / kapal penerima..." oninput="filterParenggeTab(this.value)">
          <button class="btn-action btn-refresh-search" onclick="tarikSemuaData()" title="Segarkan Data">
            <svg class="btn-icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span class="btn-text">Segarkan</span>
          </button>
        </div>
        <div class="filter-pills-wrap" id="parenggePillsWrap">
          <div class="pill-btn active" onclick="setPillParengge('SEMUA', this)">Semua Riwayat (<span id="pillCountSemua">0</span>)</div>
          <div class="pill-btn" onclick="setPillParengge('HARI_INI', this)">Kirim Hari Ini (<span id="pillCountHariIni">0</span>)</div>
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

  // 1. Agregasi: HANYA ambil kapal parengge yang sudah pernah kirim muatan dari data allRincian
  let aggregatedMap = {};

  if (Array.isArray(allRincian)) {
    allRincian.forEach((r) => {
      let rawName = String(r.nama_kapal_parengge || r.nama_pemilik || r.nama || "").trim();
      if (!rawName || rawName.toUpperCase() === "TANPA NAMA") return;
      let key = rawName.toLowerCase();

      const jml = Number(r.jumlah_gabus !== undefined ? r.jumlah_gabus : r.jumlah) || 0;

      if (!aggregatedMap[key]) {
        aggregatedMap[key] = {
          nama_asli: rawName.toUpperCase(),
          total_gabus: 0,
          riwayat_pengiriman: []
        };
      }

      aggregatedMap[key].total_gabus += jml;
      aggregatedMap[key].riwayat_pengiriman.push({
        kapal: r.nama_kapal_ongkir || r.nama_kapal || "-",
        tanggal: r.tanggal || "-",
        jumlah: jml,
        satuan: r.satuan || "Gabus"
      });
    });
  }

  // Hanya kapal dengan riwayat pengiriman aktual
  let fullList = Object.values(aggregatedMap).filter(item => item.riwayat_pengiriman.length > 0);

  // Tanggal aktif hari ini untuk filter pill
  const todayWIB = (typeof getActiveDateWIB === "function") 
    ? getActiveDateWIB() 
    : new Date().toISOString().slice(0, 10);

  const totalCount = fullList.length;
  const hariIniCount = fullList.filter(item => 
    item.riwayat_pengiriman.some(rip => String(rip.tanggal).trim() === todayWIB)
  ).length;

  const elSemua = document.getElementById("pillCountSemua");
  const elHariIni = document.getElementById("pillCountHariIni");
  if (elSemua) elSemua.textContent = totalCount;
  if (elHariIni) elHariIni.textContent = hariIniCount;

  // 2. Filter berdasarkan Pill (Semua vs Hari Ini)
  let displayList = fullList;
  if (currentParenggePill === 'HARI_INI') {
    displayList = displayList.filter(item => 
      item.riwayat_pengiriman.some(rip => String(rip.tanggal).trim() === todayWIB)
    );
  }

  // 3. Filter berdasarkan Input Pencarian
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

  // 4. Urutkan: Total muatan gabus terbanyak di atas, kemudian urut abjad
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

  // 5. Tampilan jika kosong
  if (displayList.length === 0) {
    let emptyMsg = "Belum ada catatan kapal parengge yang pernah kirim";
    let emptySub = "Data kapal akan muncul otomatis setelah dicatat membawa muatan gabus pada nota pelayaran.";
    if (searchQuery) {
      emptyMsg = `Tidak ada kapal parengge yang cocok dengan "${escapeHtml(searchQuery)}"`;
      emptySub = "Silakan periksa kembali ejaan pencarian Anda.";
    } else if (currentParenggePill === 'HARI_INI') {
      emptyMsg = "Belum ada kapal parengge yang mengirim muatan hari ini";
      emptySub = "Pilih tab 'Semua Riwayat' untuk melihat seluruh riwayat kapal yang pernah kirim.";
    }

    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🐟</div>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
          ${emptyMsg}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          ${emptySub}
        </div>
      </div>
    `;
    return;
  }

  // 6. Render kartu untuk setiap kapal yang pernah kirim
  displayList.forEach((item) => {
    const card = document.createElement("div");
    card.className = "parengge-card";

    let historyContent = item.riwayat_pengiriman.map(rip => 
      `<div>• Kapal: <b>${escapeHtml(rip.kapal)}</b> (${escapeHtml(rip.tanggal)}) — <b>${rip.jumlah} Gabus</b></div>`
    ).join("");

    card.innerHTML = `
      <div class="parengge-card-header">
        <div>
          <div class="parengge-title">${escapeHtml(item.nama_asli)}</div>
          <div class="parengge-meta">
            Total Pengiriman: ${item.riwayat_pengiriman.length} kali
          </div>
        </div>
        <div class="parengge-gabus-badge">
          📦 ${formatDots(item.total_gabus)} Gabus
        </div>
      </div>
      <div class="parengge-history-list">
        ${historyContent}
      </div>
    `;
    container.appendChild(card);
  });
}
