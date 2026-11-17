// ==========================================
// MAIN BAR 2: KAPAL ONGKIR (PELAYARAN & MANIFES)
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function setPillFilter(type, el) {
  document.querySelectorAll('#filterPillsWrap .pill-btn').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  currentFilterPill = type;
  filterData();
}

function filterData() {
  const searchInput = document.getElementById("searchInput");
  const rawQ = searchInput ? searchInput.value : "";
  const q = sanitizeInput(rawQ).toLowerCase();
  const todayStr = new Date().toISOString().split("T")[0];

  filteredPelayaran = allPelayaran.filter(p => {
    const matchSearch = !q || 
      (p.nama_kapal || "").toLowerCase().includes(q) ||
      (p.juragan || "").toLowerCase().includes(q) ||
      (p.lokasi_muat || "").toLowerCase().includes(q) ||
      (p.tanggal || "").toLowerCase().includes(q);

    let matchPill = true;
    if (currentFilterPill === 'HARI_INI') {
      matchPill = (p.tanggal === todayStr);
    } else if (currentFilterPill === 'KALMAS') {
      const lok = (p.lokasi_muat || "").toLowerCase();
      const nKapal = (p.nama_kapal || "").toLowerCase();
      matchPill = lok.includes('kalmas') || lok.includes('ddc') || lok.includes('ddl') || nKapal.includes('kalmas');
    } else if (currentFilterPill === 'PUMA') {
      const lok = (p.lokasi_muat || "").toLowerCase();
      const nKapal = (p.nama_kapal || "").toLowerCase();
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
    const safeNama = escapeHtml(p.nama_kapal);
    const safeTanggal = validateDateFormat(p.tanggal) ? escapeHtml(normalizeDateKey(p.tanggal)) : escapeHtml(p.tanggal || "-");
    const safeJuragan = escapeHtml(p.juragan || "-");
    const safeLokasi = escapeHtml(p.lokasi_muat || "DDL");
    const tripKey = p.kunci_unik || getNormalizedTripId(p.nama_kapal, p.tanggal);
    const safeKunci = escapeHtml(tripKey).replace(/'/g, "\\'");

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
      </div>
      <div class="card-footer">
        <div class="card-total-box">📦 ${formatDots(p.total_hitung)} Gabus</div>
        <button class="btn-action" onclick="bukaNota('${safeKunci}')">Buka / Cetak Nota</button>
      </div>
    `;
    container.appendChild(card);
  });
}
