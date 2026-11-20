// ==========================================
// PORTAL UTAMA: INFORMASI ONGKIR HARI INI (WARTA PUBLIK)
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

var currentWartaDate = "";

function initWartaView() {
  const container = document.getElementById("tabWarta");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <!-- HERO BANNER INFORMASI ONGKIR HARI INI -->
      <div class="warta-hero-card">
        <div class="warta-hero-top">
          <div>
            <div class="warta-hero-badge">📢 LIVE DISPATCH & MANIFES HARIAN</div>
            <h1 class="warta-hero-title" ondblclick="switchTab('dashboard')" title="Informasi Ongkir Hari Ini">Informasi Ongkir Hari Ini</h1>
            <p class="warta-hero-desc">Format resmi warta kedatangan kapal ongkir & rekapitulasi muatan ikan kapal parengge</p>
          </div>
        </div>

        <!-- NAVIGASI TANGGAL WARTA (HANYA SEBELUMNYA, TANGGAL, DAN BERIKUTNYA) -->
        <div class="warta-date-control-bar">
          <div class="warta-date-nav-buttons">
            <button type="button" class="btn-warta-nav btn-warta-prev" onclick="geserTanggalWarta(-1)" title="Hari Sebelumnya" aria-label="Hari Sebelumnya">
              <span class="nav-arrow">◀</span><span class="nav-text"> Sebelumnya</span>
            </button>
            <div class="warta-input-date-wrap">
              <input type="date" id="wartaDateInput" class="warta-date-input" onchange="pilihTanggalWarta(this.value)">
            </div>
            <button type="button" class="btn-warta-nav btn-warta-next" onclick="geserTanggalWarta(1)" title="Hari Berikutnya" aria-label="Hari Berikutnya">
              <span class="nav-text">Berikutnya </span><span class="nav-arrow">▶</span>
            </button>
          </div>

          <div class="warta-date-actions">
            <button type="button" class="btn-action btn-copy-all-warta" onclick="salinSemuaWarta()" id="btnCopyAllWarta">
              📋 Salin Semua Warta (WhatsApp)
            </button>
          </div>
        </div>
      </div>

      <!-- KETERANGAN STATUS JADWAL TANGGAL -->
      <div id="wartaNoticeBox" style="display: none;"></div>

      <!-- DAFTAR KARTU WARTA PELAYARAN HARI INI -->
      <div class="warta-grid" id="wartaShipList">
        <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          Sedang menyiapkan warta informasi ongkir...
        </div>
      </div>

      <!-- FOOTER DISKRET PUBLIK DENGAN AKSES PENGELOLA SAMAR -->
      <footer class="warta-public-footer no-print">
        <div class="warta-footer-left">
          <span>PARENGGEKITA &bull; Sistem Manifes & Nota Logistik Kapal</span>
        </div>
        <div class="warta-footer-right">
          <a href="#admin" class="warta-admin-discreet-link" onclick="switchTab('dashboard'); return false;" title="Portal Khusus Pengelola">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -1px; margin-right: 3px;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Pengelola</span>
          </a>
        </div>
      </footer>
  `;
}

// ==========================================
// FORMATTER KHUSUS TANGGAL WARTA
// Contoh: Ahad -15 -11-2026
// ==========================================
function formatTanggalWartaIndo(tglStr) {
  if (!tglStr && tglStr !== 0) return "-";
  const norm = normalizeDateKey(tglStr);
  if (/^\d{4}-\d{2}-\d{2}$/.test(norm)) {
    const parts = norm.split("-");
    const yr = parts[0];
    const mo = parts[1];
    const da = parts[2];
    const dt = new Date(Number(yr), Number(mo) - 1, Number(da));
    const dayNames = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const hari = dayNames[dt.getDay()];
    return `${hari} -${da} -${mo}-${yr}`;
  }
  return String(tglStr);
}

// ==========================================
// GENERATOR TEKS FORMAT STANDAR WARTA
// ==========================================
function generateTeksWarta(pelayaranItem, muatanItems) {
  const p = pelayaranItem || {};
  const namaKapal = (p.nama_kapal_ongkir || p.nama_kapal || "KMN -").toUpperCase();
  const juragan = (p.juragan || "-").trim();
  const tglWarta = formatTanggalWartaIndo(p.tanggal);
  const lokasiMuat = (p.lokasi_muat || "DDL").trim();
  const waktu = formatWaktuBerangkat(p.waktu_berangkat);

  // Kategori lokasi: jika ada kata kalmas/puma, tampilkan sesuai itu
  let kategoriLokasi = "kalmas";
  if (lokasiMuat.toLowerCase().includes("puma")) {
    kategoriLokasi = "puma";
  } else if (lokasiMuat.toLowerCase().includes("ddl")) {
    kategoriLokasi = "kalmas";
  } else if (lokasiMuat) {
    kategoriLokasi = lokasiMuat.toLowerCase();
  }

  let lines = [];
  lines.push("Bismillah 🤲🤲🐟🐟");
  lines.push("Kapal Ongkir " + kategoriLokasi);
  lines.push(namaKapal);
  lines.push("Jrg  " + juragan);
  lines.push(tglWarta);
  lines.push("");
  lines.push("Daftar muatan :");

  let totalGabus = 0;
  if (Array.isArray(muatanItems) && muatanItems.length > 0) {
    muatanItems.forEach(m => {
      const nama = (m.nama_kapal_parengge || m.nama_pemilik || m.nama || "Tanpa Nama").trim();
      const jml = Number(m.jumlah_gabus !== undefined ? m.jumlah_gabus : m.jumlah) || 0;
      totalGabus += jml;
      lines.push(`${nama} =  ${jml} G`);
    });
  } else {
    lines.push("(Belum ada rincian muatan)");
  }

  // Jika muatan items kosong, gunakan total terhitung kapal
  if (totalGabus === 0 && Number(p.total_hitung) > 0) {
    totalGabus = Number(p.total_hitung);
  }

  lines.push("");
  lines.push(`Jumlah =  ${totalGabus} Gabus `);
  lines.push(`Lokasi muat ${lokasiMuat}`);
  lines.push(`Jam ${waktu} Waktu ${lokasiMuat}`);

  return lines.join("\n");
}

// ==========================================
// RENDER VIEW WARTA INFORMASI ONGKIR
// ==========================================
function renderWartaHariIni(targetDate = "") {
  initWartaView();
  const container = document.getElementById("wartaShipList");
  const noticeBox = document.getElementById("wartaNoticeBox");
  const dateInput = document.getElementById("wartaDateInput");
  if (!container) return;

  const todayStr = new Date().toISOString().split("T")[0];

  // Tentukan tanggal aktif
  if (!targetDate) {
    if (currentWartaDate) {
      targetDate = currentWartaDate;
    } else {
      targetDate = todayStr;
    }
  }

  currentWartaDate = targetDate;
  if (dateInput) {
    dateInput.value = targetDate;
  }

  container.innerHTML = "";

  // 1. Filter kapal pada tanggal yang dipilih
  let shipsOnDate = allPelayaran.filter(p => normalizeDateKey(p.tanggal) === targetDate);

  // 2. Fallback cerdas: Jika pada tanggal hari ini belum ada transaksi, cari tanggal terakhir yang ada data
  let isFallbackNotice = false;
  let fallbackDateStr = "";

  if (shipsOnDate.length === 0 && allPelayaran.length > 0) {
    if (targetDate === todayStr) {
      // Ambil pelayaran tanggal terakhir yang tersedia
      const latestShip = allPelayaran[0];
      if (latestShip && latestShip.tanggal) {
        fallbackDateStr = normalizeDateKey(latestShip.tanggal);
        if (fallbackDateStr && fallbackDateStr !== todayStr) {
          shipsOnDate = allPelayaran.filter(p => normalizeDateKey(p.tanggal) === fallbackDateStr);
          isFallbackNotice = true;
          currentWartaDate = fallbackDateStr;
          if (dateInput) dateInput.value = fallbackDateStr;
        }
      }
    }
  }

  // 3. Tampilkan Notifikasi Banner Status
  if (noticeBox) {
    if (isFallbackNotice) {
      noticeBox.style.display = "block";
      noticeBox.innerHTML = `
        <div class="warta-fallback-alert">
          <span style="font-size: 1.15rem; flex-shrink: 0;">ℹ️</span>
          <div>
            <b>Jadwal Pelayaran Hari Ini (${formatTanggalWartaIndo(todayStr)}) Belum Tersedia.</b><br>
            <span style="font-size: 0.76rem; color: var(--text-muted);">
              Menampilkan arsip manifes pelayaran tanggal terakhir: <strong>${formatTanggalWartaIndo(fallbackDateStr)}</strong>. Anda dapat memilih tanggal lain melalui pemilih tanggal di atas.
            </span>
          </div>
        </div>
      `;
    } else {
      noticeBox.style.display = "none";
      noticeBox.innerHTML = "";
    }
  }

  // 4. Jika data benar-benar kosong
  if (shipsOnDate.length === 0) {
    container.innerHTML = `
      <div class="card" style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem;">
        <div style="font-size: 2.75rem; margin-bottom: 0.65rem;">🚢</div>
        <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.35rem;">
          Tidak Ada Pelayaran pada Tanggal Ini
        </div>
        <div style="font-size: 0.82rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 1.25rem;">
          Belum ada rekaman manifes kapal ongkir untuk tanggal <strong>${formatTanggalWartaIndo(targetDate)}</strong>.
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn-action" onclick="setWartaHariIni()" style="font-size: 0.8rem;">
            📅 Cek Hari Ini
          </button>
        </div>
      </div>
    `;
    const btnCopyAll = document.getElementById("btnCopyAllWarta");
    if (btnCopyAll) btnCopyAll.style.display = "none";
    return;
  }

  const btnCopyAll = document.getElementById("btnCopyAllWarta");
  if (btnCopyAll) btnCopyAll.style.display = "inline-flex";

  // 5. Render Tiap Kapal Ongkir dengan Tampilan Format Warta
  shipsOnDate.forEach((p, idx) => {
    const muatanKapal = allRincian.filter(r => isSameTripRecord(r, p));
    const teksBroadcast = generateTeksWarta(p, muatanKapal);

    const safeNama = escapeHtml(p.nama_kapal_ongkir || p.nama_kapal);
    const safeJuragan = escapeHtml(p.juragan || "-");
    const safeLokasi = escapeHtml(p.lokasi_muat || "DDL");
    const safeWaktu = escapeHtml(formatWaktuBerangkat(p.waktu_berangkat));
    const tripKey = p.kunci_unik || getNormalizedTripId(p.nama_kapal_ongkir || p.nama_kapal, p.tanggal);
    const safeKunci = escapeHtml(tripKey).replace(/'/g, "\\'");

    let totalGabusFisik = 0;
    muatanKapal.forEach(m => totalGabusFisik += Number(m.jumlah_gabus !== undefined ? m.jumlah_gabus : m.jumlah) || 0);
    if (totalGabusFisik === 0 && Number(p.total_hitung) > 0) {
      totalGabusFisik = Number(p.total_hitung);
    }

    const card = document.createElement("div");
    card.className = "warta-card";
    card.innerHTML = `
      <div class="warta-card-header">
        <div class="warta-badge-row">
          <span class="warta-ship-pill">🚢 KAPAL ONGKIR ${safeLokasi.toUpperCase()}</span>
          <span class="warta-time-pill">⏰ Jam ${safeWaktu} Waktu ${safeLokasi}</span>
        </div>
        <div class="warta-ship-title-wrap">
          <div class="warta-ship-title">${safeNama}</div>
          <div class="warta-ship-meta">
            <span>👤 Jrg <b>${safeJuragan}</b></span>
            <span>•</span>
            <span>📅 <b>${formatTanggalWartaIndo(p.tanggal)}</b></span>
          </div>
        </div>
      </div>

      <!-- KOTAK FORMAT TEKS RESMI SESUAI PERMINTAAN USER -->
      <div class="warta-pre-box-wrap">
        <div class="warta-pre-box-header">
          <span style="font-size: 0.74rem; font-weight: 700; color: #1e293b;">📋 Format Pesan Broadcast WhatsApp:</span>
          <button type="button" class="btn-copy-bubble" onclick="salinSatuTeksWarta('${safeKunci}')" title="Salin Teks Ini">
            📋 Salin Teks
          </button>
        </div>
        <pre class="warta-pre-content" id="preWarta_${idx}">${escapeHtml(teksBroadcast)}</pre>
      </div>

      <!-- KAKI KARTU DENGAN TOTAL & AKSI -->
      <div class="warta-card-footer">
        <div class="warta-footer-stat">
          <div class="warta-total-label">Total Muatan Fisik</div>
          <div class="warta-total-val">📦 ${formatDots(totalGabusFisik)} Gabus</div>
        </div>
        <div class="warta-action-group">
          <button type="button" class="btn-action btn-warta-wa" onclick="bagikanKeWhatsApp('${safeKunci}')" title="Bagikan langsung ke WhatsApp">
            <span>📲 Kirim ke WhatsApp</span>
          </button>
          <button type="button" class="btn-action" onclick="bukaNota('${safeKunci}')" style="background: #0f172a;" title="Buka dan Cetak Nota Kontan A6">
            <span>🧾 Buka / Cetak Nota</span>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

// ==========================================
// KONTROL NAVIGASI TANGGAL
// ==========================================
function pilihTanggalWarta(val) {
  if (!val) return;
  currentWartaDate = val;
  renderWartaHariIni(val);
}

function setWartaHariIni() {
  const todayStr = new Date().toISOString().split("T")[0];
  currentWartaDate = todayStr;
  renderWartaHariIni(todayStr);
}

function geserTanggalWarta(deltaHari) {
  let baseDate = currentWartaDate ? new Date(currentWartaDate) : new Date();
  if (isNaN(baseDate.getTime())) baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + deltaHari);
  const newDateStr = baseDate.toISOString().split("T")[0];
  currentWartaDate = newDateStr;
  renderWartaHariIni(newDateStr);
}

// ==========================================
// SALIN TEKS BROADCAST & SHARE KE WHATSAPP
// ==========================================
function salinSatuTeksWarta(kunciUnik) {
  if (!kunciUnik) return;
  const targetKey = String(kunciUnik).trim().toLowerCase();
  const pel = allPelayaran.find(p => {
    const k = (p.kunci_unik || getNormalizedTripId(p.nama_kapal_ongkir || p.nama_kapal, p.tanggal)).trim().toLowerCase();
    return k === targetKey;
  });

  if (!pel) return;
  const muatan = allRincian.filter(r => isSameTripRecord(r, pel));
  const text = generateTeksWarta(pel, muatan);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showSecurityToast(`✓ Format teks "${pel.nama_kapal_ongkir || pel.nama_kapal}" berhasil disalin ke clipboard! Siap kirim ke WhatsApp.`);
    }).catch(() => {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function salinSemuaWarta() {
  const todayTarget = currentWartaDate || new Date().toISOString().split("T")[0];
  const ships = allPelayaran.filter(p => normalizeDateKey(p.tanggal) === todayTarget);

  if (ships.length === 0) {
    showSecurityToast("⚠️ Tidak ada warta manifes pada tanggal ini untuk disalin.");
    return;
  }

  const allTexts = ships.map(p => {
    const muatan = allRincian.filter(r => isSameTripRecord(r, p));
    return generateTeksWarta(p, muatan);
  }).join("\n\n════════════════════\n\n");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(allTexts).then(() => {
      showSecurityToast(`✓ Seluruh warta (${ships.length} kapal) berhasil disalin ke clipboard! Siap kirim ke grup WhatsApp.`);
    }).catch(() => {
      fallbackCopyText(allTexts);
    });
  } else {
    fallbackCopyText(allTexts);
  }
}

function bagikanKeWhatsApp(kunciUnik) {
  if (!kunciUnik) return;
  const targetKey = String(kunciUnik).trim().toLowerCase();
  const pel = allPelayaran.find(p => {
    const k = (p.kunci_unik || getNormalizedTripId(p.nama_kapal_ongkir || p.nama_kapal, p.tanggal)).trim().toLowerCase();
    return k === targetKey;
  });

  if (!pel) return;
  const muatan = allRincian.filter(r => isSameTripRecord(r, pel));
  const text = generateTeksWarta(pel, muatan);

  const encodedText = encodeURIComponent(text);
  const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.open(waUrl, "_blank");
}

function fallbackCopyText(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showSecurityToast("✓ Format teks warta berhasil disalin ke clipboard!");
  } catch (err) {
    showSecurityToast("⚠️ Gagal menyalin teks otomatis. Silakan salin manual.");
  }
  document.body.removeChild(textArea);
}
