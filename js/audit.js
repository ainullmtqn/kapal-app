// ==========================================
// MAIN BAR 4: AUDIT & SELISIH MUATAN FISIK
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initAuditView() {
  const container = document.getElementById("tabAudit");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <div class="section-header">
        <div>
          <h2 class="section-title">Audit Selisih Muatan Fisik</h2>
          <div class="section-subtitle">Daftar kapal pelayaran dengan status muatan belum sesuai</div>
        </div>
      </div>

      <div class="voyage-grid" id="auditList"></div>
  `;
}

function renderAuditTab() {
  initAuditView();
  const container = document.getElementById("auditList");
  if (!container) return;
  container.innerHTML = "";

  const selisihList = allPelayaran.filter(p => p.status_selisih !== "SESUAI");

  if (selisihList.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎉</div>
        <div style="font-weight: 800; font-size: 1.05rem; color: var(--success-text); margin-bottom: 0.25rem;">Seluruh Muatan Fisik SESUAI</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Tidak ditemukan selisih antara manifest perhitungan dan fisik pada kapal pelayaran.</div>
      </div>
    `;
    return;
  }

  selisihList.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.borderLeft = "4px solid var(--warning-text)";
    const safeNama = escapeHtml(p.nama_kapal);
    const safeTanggal = validateDateFormat(p.tanggal) ? escapeHtml(normalizeDateKey(p.tanggal)) : escapeHtml(p.tanggal || "-");
    const safeJuragan = escapeHtml(p.juragan || "-");
    const safeLokasi = escapeHtml(p.lokasi_muat || "DDL");
    const tripKey = p.kunci_unik || getNormalizedTripId(p.nama_kapal, p.tanggal);
    const safeKunci = escapeHtml(tripKey).replace(/'/g, "\\'");

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${safeNama}</div>
        <span class="badge-status-warn">SELISIH ⚠️</span>
      </div>
      <div class="card-meta-list">
        <div>📅 <b>Tanggal:</b> ${safeTanggal}</div>
        <div>👤 <b>Juragan:</b> ${safeJuragan}</div>
        <div>📍 <b>Lokasi Muat:</b> ${safeLokasi}</div>
        <div>📦 <b>Total Hitung:</b> ${formatDots(p.total_hitung)} Gabus</div>
      </div>
      <div class="card-footer">
        <button class="btn-action" onclick="bukaNota('${safeKunci}')" style="background: var(--warning-text); width: 100%; justify-content: center;">
          🔍 Periksa & Edit Nota
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

