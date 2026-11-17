// ==========================================
// MAIN BAR 3: MUATAN PARENGGE (REKAPITULASI PEMILIK)
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function filterParenggeTab(query) {
  renderSemuaMuatan(query);
}

function renderSemuaMuatan(searchQuery = "") {
  const container = document.getElementById("allMuatanList");
  if (!container) return;
  container.innerHTML = "";

  if (allRincian.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--warning-text); font-weight: 600;">
        ⚠️ Rincian muatan masih 0.<br>
        <small style="color: var(--text-muted); font-weight: normal;">
          Pastikan Webhook Google Apps Script terhubung dan memiliki rincian muatan.
        </small>
      </div>
    `;
    if (document.getElementById("countMuatan")) {
      document.getElementById("countMuatan").textContent = "0";
    }
    return;
  }

  let aggregatedMap = {};
  allRincian.forEach((r) => {
    let rawName = (r.nama_pemilik || "Tanpa Nama").trim();
    let key = rawName.toLowerCase();
    
    if (!aggregatedMap[key]) {
      aggregatedMap[key] = {
        nama_asli: rawName,
        total_gabus: 0,
        riwayat_pengiriman: []
      };
    }
    
    aggregatedMap[key].total_gabus += Number(r.jumlah) || 0;
    aggregatedMap[key].riwayat_pengiriman.push({
      kapal: r.nama_kapal || "-",
      tanggal: r.tanggal || "-",
      jumlah: Number(r.jumlah) || 0
    });
  });

  let aggregatedList = Object.values(aggregatedMap);

  if (searchQuery) {
    const qLower = searchQuery.toLowerCase();
    aggregatedList = aggregatedList.filter(item => {
      const matchNama = item.nama_asli.toLowerCase().includes(qLower);
      const matchKapal = item.riwayat_pengiriman.some(rip => 
        rip.kapal.toLowerCase().includes(qLower) || rip.tanggal.includes(qLower)
      );
      return matchNama || matchKapal;
    });
  }

  aggregatedList.sort((a, b) => b.total_gabus - a.total_gabus);

  if (document.getElementById("countMuatan")) {
    document.getElementById("countMuatan").textContent = aggregatedList.length;
  }

  if (aggregatedList.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
        Tidak ada data kapal parengge yang sesuai dengan pencarian "${escapeHtml(searchQuery)}".
      </div>
    `;
    return;
  }

  aggregatedList.forEach((item) => {
    let card = document.createElement("div");
    card.className = "parengge-card";
    
    let detailHtml = item.riwayat_pengiriman.map(rip => 
      `<div>• Kapal: <b>${escapeHtml(rip.kapal)}</b> (${escapeHtml(rip.tanggal)}) — <b>${rip.jumlah} Gabus</b></div>`
    ).join("");

    card.innerHTML = `
      <div class="parengge-card-header">
        <div>
          <div class="parengge-title">${escapeHtml(item.nama_asli)}</div>
          <div class="parengge-meta">Total Pengiriman: ${item.riwayat_pengiriman.length} kali</div>
        </div>
        <div class="parengge-gabus-badge">
          📦 ${formatDots(item.total_gabus)} G
        </div>
      </div>
      <div class="parengge-history-list">
        ${detailHtml}
      </div>
    `;
    container.appendChild(card);
  });
}
