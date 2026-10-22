let allPelayaran = [];
let allRincian = [];
let filteredPelayaran = [];
let currentFilterPill = 'SEMUA';
let currentDashChip = 'SEMUA';
let currentTab = 'dashboard'; // 'dashboard' | 'kapal' | 'muatan' | 'audit' | 'setting'
let activeKapal = null;
let notaItems = [];
let potonganNominal = 0;
let autoSaveTimer = null;
let dailyChartInstance = null;
let currentChartRangeDays = 7;

// ==========================================
// FORMATTER ANGKA & TANGGAL
// ==========================================
function formatDots(val) {
  if (!val && val !== 0) return "0";
  let str = val.toString().replace(/\D/g, "");
  if (!str) return "0";
  return new Intl.NumberFormat("id-ID").format(Number(str));
}

function parseDots(str) {
  if (!str) return 0;
  let digits = str.toString().replace(/\D/g, "");
  return Number(digits) || 0;
}

function formatRp(n) {
  return new Intl.NumberFormat("id-ID").format(Math.round(n || 0));
}

function formatTanggalIndo(dateObj = new Date()) {
  const hariArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulanArr = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const hari = hariArr[dateObj.getDay()];
  const tgl = dateObj.getDate();
  const bln = bulanArr[dateObj.getMonth()];
  const thn = dateObj.getFullYear();
  return `${hari}, ${tgl} ${bln} ${thn}`;
}

// ==========================================
// INISIALISASI APLIKASI & CACHE OFFLINE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const dateEl = document.getElementById("currentDateDisplay");
  if (dateEl) dateEl.textContent = formatTanggalIndo();

  const savedWebhook = localStorage.getItem("GAS_WEBHOOK_URL") || "";
  const inpWebhook = document.getElementById("webhookInput");
  if (inpWebhook) inpWebhook.value = savedWebhook;

  // 1. Muat Cache Offline terlebih dahulu (Instant 0ms display)
  try {
    const cachedPel = localStorage.getItem("CACHE_PELAYARAN");
    const cachedRin = localStorage.getItem("CACHE_RINCIAN");
    if (cachedPel && cachedRin) {
      allPelayaran = JSON.parse(cachedPel) || [];
      allRincian = JSON.parse(cachedRin) || [];
      if (allPelayaran.length > 0) {
        updateStatusBadge("cache", `● Cache (${allPelayaran.length} Kapal)`);
        renderDashboard();
        filterData();
        renderSemuaMuatan();
        renderAuditTab();
      }
    }
  } catch (err) {
    console.warn("Gagal membaca cache lokal:", err);
  }

  // 2. Setup Dismiss Modal (Backdrop Click & ESC Key)
  const modal = document.getElementById("notaModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) tutupNota();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && modal.classList.contains("active")) {
      tutupNota();
    }
  });

  // 3. Tarik data terbaru dari Google Apps Script
  if (savedWebhook) {
    tarikSemuaData();
  } else if (allPelayaran.length === 0) {
    updateStatusBadge("offline", "● Webhook Belum Diatur");
  }
});

function updateStatusBadge(status, text) {
  const badge = document.getElementById("statusBadge");
  const badgeText = document.getElementById("statusBadgeText");
  if (!badge || !badgeText) return;

  badgeText.textContent = text;
  
  if (status === "online") {
    badge.style.background = "var(--success-bg)";
    badge.style.borderColor = "var(--success-border)";
    badge.style.color = "var(--success-text)";
  } else if (status === "loading") {
    badge.style.background = "var(--primary-light)";
    badge.style.borderColor = "#bfdbfe";
    badge.style.color = "var(--primary)";
  } else {
    badge.style.background = "var(--warning-bg)";
    badge.style.borderColor = "var(--warning-border)";
    badge.style.color = "var(--warning-text)";
  }
}

// ==========================================
// KONEKSI WEBHOOK GOOGLE APPS SCRIPT
// ==========================================
async function tarikSemuaData() {
  const url = localStorage.getItem("GAS_WEBHOOK_URL");
  if (!url) {
    alert("Silakan masukkan URL Webhook Apps Script di menu Pengaturan!");
    switchTab('setting');
    return;
  }

  updateStatusBadge("loading", "Menghubungkan...");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP Status " + res.status);
    const data = await res.json();

    if (data.status === "sukses") {
      allPelayaran = data.pelayaran || [];
      allRincian = data.rincian || [];
      
      allPelayaran.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));

      // Simpan ke Cache Offline
      try {
        localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
        localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      } catch (cacheErr) {
        console.warn("Penyimpanan cache gagal:", cacheErr);
      }
      
      updateStatusBadge("online", `● Online (${allPelayaran.length} Kapal)`);
      if (document.getElementById("countMuatan")) {
        document.getElementById("countMuatan").textContent = allRincian.length;
      }

      renderDashboard();
      filterData();
      renderSemuaMuatan();
      renderAuditTab();
    } else {
      updateStatusBadge("offline", "● Kendala Spreadsheet");
      alert("Gagal membaca database: " + (data.pesan || "Terjadi kesalahan"));
    }
  } catch (e) {
    console.error("Gagal menarik data:", e);
    if (allPelayaran.length > 0) {
      updateStatusBadge("offline", `● Offline (Data Cache)`);
    } else {
      updateStatusBadge("offline", "● Offline / Jaringan");
    }
  }
}

function simpanWebhook() {
  const inp = document.getElementById("webhookInput");
  const val = inp ? inp.value.trim() : "";
  if (!val) {
    alert("Masukkan URL Webhook Google Apps Script terlebih dahulu!");
    return;
  }
  localStorage.setItem("GAS_WEBHOOK_URL", val);
  alert("Webhook berhasil disimpan!");
  switchTab('dashboard');
  tarikSemuaData();
}

function bersihkanCache() {
  if (confirm("Bersihkan cache lokal pelayaran dan muatan di perangkat ini?")) {
    localStorage.removeItem("CACHE_PELAYARAN");
    localStorage.removeItem("CACHE_RINCIAN");
    alert("Cache lokal berhasil dibersihkan.");
    location.reload();
  }
}

// ==========================================
// RENDER TAB 1: BERANDA (DASHBOARD)
// ==========================================
function renderDashboard() {
  const totalKapal = allPelayaran.length;
  const totalGabus = allPelayaran.reduce((sum, p) => sum + (Number(p.total_hitung) || 0), 0);
  
  // Hitung Parengge Unik
  let parenggeMap = {};
  allRincian.forEach(r => {
    let rawName = (r.nama_pemilik || "Tanpa Nama").trim();
    let key = rawName.toLowerCase();
    if (!parenggeMap[key]) parenggeMap[key] = true;
  });
  const totalParengge = Object.keys(parenggeMap).length;

  const selisihList = allPelayaran.filter(p => p.status_selisih !== "SESUAI");

  // 1. Update 4 KPI Cards
  const kpiKapal = document.getElementById("kpiKapalOnline");
  if (kpiKapal) kpiKapal.textContent = `${totalKapal} Kapal`;

  const kpiGabus = document.getElementById("kpiTotalGabus");
  if (kpiGabus) kpiGabus.textContent = `${formatDots(totalGabus)} Gabus`;

  const kpiParengge = document.getElementById("kpiTotalParengge");
  if (kpiParengge) kpiParengge.textContent = `${totalParengge} Parengge`;

  const kpiAudit = document.getElementById("kpiStatusAudit");
  const kpiSubAudit = document.getElementById("kpiSubAudit");
  const navAuditBadge = document.getElementById("navAuditBadge");

  if (kpiAudit) {
    if (selisihList.length === 0) {
      kpiAudit.textContent = "Semua Sesuai ✓";
      kpiAudit.style.color = "var(--success-text)";
      if (kpiSubAudit) kpiSubAudit.textContent = "0 Selisih hitung";
    } else {
      kpiAudit.textContent = `${selisihList.length} Selisih ⚠️`;
      kpiAudit.style.color = "var(--warning-text)";
      if (kpiSubAudit) kpiSubAudit.textContent = "Perlu verifikasi";
    }
  }

  // 2. Alert Banner & Audit Badge
  const alertBanner = document.getElementById("alertBanner");
  const alertDesc = document.getElementById("alertDesc");

  if (selisihList.length > 0) {
    if (alertBanner) alertBanner.style.display = "flex";
    if (alertDesc) alertDesc.textContent = `Ditemukan ${selisihList.length} kapal pelayaran dengan status muatan selisih.`;
    if (navAuditBadge) {
      navAuditBadge.style.display = "inline-block";
      navAuditBadge.textContent = selisihList.length;
    }
  } else {
    if (alertBanner) alertBanner.style.display = "none";
    if (navAuditBadge) navAuditBadge.style.display = "none";
  }

  // 3. Render Grafik Tren Harian Kapal & Gabus
  renderDailyChart();
}

// ==========================================
// GRAFIK HARIAN KAPAL PENGANGKUT & GABUS
// ==========================================
function normalizeDateKey(tglStr) {
  if (!tglStr) return "";
  tglStr = tglStr.toString().trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(tglStr)) {
    return tglStr.substring(0, 10);
  }
  const dmy = tglStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const d = dmy[1].padStart(2, '0');
    const m = dmy[2].padStart(2, '0');
    const y = dmy[3];
    return `${y}-${m}-${d}`;
  }
  const parsed = new Date(tglStr);
  if (!isNaN(parsed.getTime())) {
    const yr = parsed.getFullYear();
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    const da = String(parsed.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  }
  return tglStr;
}

function formatChartDateShort(dKey) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dKey)) {
    const [y, m, d] = dKey.split("-");
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    const dayArr = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const blnArr = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    return `${dayArr[dt.getDay()]}, ${Number(d)} ${blnArr[dt.getMonth()]}`;
  }
  return dKey;
}

function formatChartDateLong(dKey) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dKey)) {
    const [y, m, d] = dKey.split("-");
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    const hariArr = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const bulanArr = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${hariArr[dt.getDay()]}, ${Number(d)} ${bulanArr[dt.getMonth()]} ${y}`;
  }
  return dKey;
}

function setChartRange(days, btnEl) {
  currentChartRangeDays = Number(days);
  document.querySelectorAll('#chartRangePills .chart-pill-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderDailyChart();
}

function updateChartMiniStats(avgKapal, avgGabus, peakGabus, totalDays) {
  const elAvgKapal = document.getElementById("statAvgKapal");
  const elAvgGabus = document.getElementById("statAvgGabus");
  const elPeakGabus = document.getElementById("statPeakGabus");
  const elTotalDays = document.getElementById("statTotalDays");

  if (elAvgKapal) elAvgKapal.textContent = `${avgKapal} / hari`;
  if (elAvgGabus) elAvgGabus.textContent = `${formatDots(avgGabus)} Gabus / hari`;
  if (elPeakGabus) elPeakGabus.textContent = peakGabus || "-";
  if (elTotalDays) elTotalDays.textContent = `${totalDays} Hari`;
}

function renderDailyChart() {
  const canvas = document.getElementById("dailyShipGabusChart");
  const emptyState = document.getElementById("chartEmptyState");
  if (!canvas) return;

  const sourceList = allPelayaran;

  if (!sourceList || sourceList.length === 0) {
    if (dailyChartInstance) {
      dailyChartInstance.destroy();
      dailyChartInstance = null;
    }
    canvas.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
    updateChartMiniStats("0", 0, "-", 0);
    return;
  }

  // Agregasi harian: Jumlah kapal pengangkut dan total gabus per tanggal
  const dateMap = {};
  sourceList.forEach(p => {
    const dKey = normalizeDateKey(p.tanggal);
    if (!dKey) return;
    if (!dateMap[dKey]) {
      dateMap[dKey] = {
        dateKey: dKey,
        kapalList: [],
        totalGabus: 0
      };
    }
    dateMap[dKey].kapalList.push(p.nama_kapal || "Tanpa Nama");
    dateMap[dKey].totalGabus += (Number(p.total_hitung) || 0);
  });

  let sortedDates = Object.keys(dateMap).sort();
  if (sortedDates.length === 0) {
    if (dailyChartInstance) {
      dailyChartInstance.destroy();
      dailyChartInstance = null;
    }
    canvas.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
    updateChartMiniStats("0", 0, "-", 0);
    return;
  }

  // Filter rentang hari (7 hari, 14 hari, 30 hari, atau semua)
  if (currentChartRangeDays > 0 && sortedDates.length > currentChartRangeDays) {
    sortedDates = sortedDates.slice(-currentChartRangeDays);
  }

  canvas.style.display = "block";
  if (emptyState) emptyState.style.display = "none";

  const labels = sortedDates.map(dKey => formatChartDateShort(dKey));
  const gabusData = sortedDates.map(dKey => dateMap[dKey].totalGabus);
  const kapalData = sortedDates.map(dKey => dateMap[dKey].kapalList.length);
  const shipNamesList = sortedDates.map(dKey => dateMap[dKey].kapalList);
  const fullDatesList = sortedDates.map(dKey => formatChartDateLong(dKey));

  // Hitung metrik ringkasan
  const totalHari = sortedDates.length;
  const sumKapal = kapalData.reduce((a, b) => a + b, 0);
  const sumGabus = gabusData.reduce((a, b) => a + b, 0);
  let peakGabusVal = -1;
  let peakGabusDate = "";
  sortedDates.forEach(dKey => {
    if (dateMap[dKey].totalGabus > peakGabusVal) {
      peakGabusVal = dateMap[dKey].totalGabus;
      peakGabusDate = formatChartDateShort(dKey);
    }
  });

  updateChartMiniStats(
    totalHari > 0 ? (sumKapal / totalHari).toFixed(1) : "0",
    totalHari > 0 ? Math.round(sumGabus / totalHari) : 0,
    peakGabusVal >= 0 ? `${formatDots(peakGabusVal)} Gabus (${peakGabusDate})` : "-",
    totalHari
  );

  if (typeof Chart === "undefined") {
    console.warn("Library Chart.js belum tersedia.");
    return;
  }

  if (dailyChartInstance) {
    dailyChartInstance.data.labels = labels;
    dailyChartInstance.data.datasets[0].data = gabusData;
    dailyChartInstance.data.datasets[1].data = kapalData;
    dailyChartInstance.data.datasets[0].customShipNames = shipNamesList;
    dailyChartInstance.data.datasets[0].customFullDates = fullDatesList;
    dailyChartInstance.update();
    return;
  }

  const ctx = canvas.getContext("2d");
  const gabusGradient = ctx.createLinearGradient(0, 0, 0, 300);
  gabusGradient.addColorStop(0, 'rgba(12, 35, 64, 0.95)');
  gabusGradient.addColorStop(1, 'rgba(56, 136, 204, 0.7)');

  dailyChartInstance = new Chart(ctx, {
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Total Muatan Gabus',
          data: gabusData,
          yAxisID: 'yGabus',
          backgroundColor: gabusGradient,
          hoverBackgroundColor: '#2b75b3',
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 42,
          order: 2,
          customShipNames: shipNamesList,
          customFullDates: fullDatesList
        },
        {
          type: 'line',
          label: 'Jumlah Kapal Pengangkut',
          data: kapalData,
          yAxisID: 'yKapal',
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ea580c',
          pointBorderWidth: 2.5,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#ea580c',
          pointHoverBorderColor: '#ffffff',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(12, 35, 64, 0.95)',
          titleColor: '#ffffff',
          titleFont: {
            family: 'Plus Jakarta Sans',
            size: 13,
            weight: '700'
          },
          bodyColor: '#e2e8f0',
          bodyFont: {
            family: 'Plus Jakarta Sans',
            size: 12,
            weight: '500'
          },
          padding: 12,
          cornerRadius: 8,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            title: function(items) {
              if (!items || items.length === 0) return "";
              const idx = items[0].dataIndex;
              const fullDates = items[0].chart.data.datasets[0].customFullDates;
              return (fullDates && fullDates[idx]) ? fullDates[idx] : items[0].label;
            },
            label: function(context) {
              if (context.dataset.yAxisID === 'yGabus') {
                return ` 📦 Muatan Gabus: ${formatDots(context.parsed.y)} Gabus`;
              }
              if (context.dataset.yAxisID === 'yKapal') {
                const idx = context.dataIndex;
                const ships = context.chart.data.datasets[0].customShipNames ? context.chart.data.datasets[0].customShipNames[idx] : [];
                let shipStr = "";
                if (ships && ships.length > 0) {
                  if (ships.length <= 3) {
                    shipStr = ` (${ships.join(', ')})`;
                  } else {
                    shipStr = ` (${ships.slice(0, 2).join(', ')} +${ships.length - 2} kapal)`;
                  }
                }
                return ` 🚢 Kapal Pengangkut: ${context.parsed.y} Kapal${shipStr}`;
              }
              return ` ${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '600',
              size: 11
            },
            maxRotation: 45,
            minRotation: 0
          }
        },
        yGabus: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: '📦 Total Gabus',
            color: '#1e40af',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '700',
              size: 11
            }
          },
          ticks: {
            color: '#64748b',
            font: {
              family: 'Plus Jakarta Sans',
              size: 10
            },
            callback: function(val) {
              return formatDots(val);
            }
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.7)'
          }
        },
        yKapal: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: '🚢 Kapal Pengangkut',
            color: '#ea580c',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '700',
              size: 11
            }
          },
          ticks: {
            stepSize: 1,
            precision: 0,
            color: '#ea580c',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '600',
              size: 10
            },
            callback: function(val) {
              return val + ' Kapal';
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// ==========================================
// RENDER TAB 2: DAFTAR SEMUA KAPAL
// ==========================================
function setPillFilter(type, el) {
  document.querySelectorAll('#filterPillsWrap .pill-btn').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  currentFilterPill = type;
  filterData();
}

function filterData() {
  const searchInput = document.getElementById("searchInput");
  const q = searchInput ? searchInput.value.toLowerCase().trim() : "";
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

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${p.nama_kapal}</div>
        <span class="${badgeClass}">${badgeLabel}</span>
      </div>
      <div class="card-meta-list">
        <div>📅 <b>Tanggal:</b> ${p.tanggal || "-"}</div>
        <div>👤 <b>Juragan:</b> ${p.juragan || "-"}</div>
        <div>📍 <b>Lokasi Muat:</b> ${p.lokasi_muat || "DDL"}</div>
      </div>
      <div class="card-footer">
        <div class="card-total-box">📦 ${formatDots(p.total_hitung)} Gabus</div>
        <button class="btn-action" onclick="bukaNota('${p.kunci_unik}')">Buka / Cetak Nota</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// RENDER TAB 3: AGREGASI MUATAN PARENGGE
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
        Tidak ada data kapal parengge yang sesuai dengan pencarian "${searchQuery}".
      </div>
    `;
    return;
  }

  aggregatedList.forEach((item) => {
    let card = document.createElement("div");
    card.className = "parengge-card";
    
    let detailHtml = item.riwayat_pengiriman.map(rip => 
      `<div>• Kapal: <b>${rip.kapal}</b> (${rip.tanggal}) — <b>${rip.jumlah} Gabus</b></div>`
    ).join("");

    card.innerHTML = `
      <div class="parengge-card-header">
        <div>
          <div class="parengge-title">${item.nama_asli}</div>
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

// ==========================================
// RENDER TAB 4: AUDIT & SELISIH
// ==========================================
function renderAuditTab() {
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
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${p.nama_kapal}</div>
        <span class="badge-status-warn">SELISIH ⚠️</span>
      </div>
      <div class="card-meta-list">
        <div>📅 <b>Tanggal:</b> ${p.tanggal || "-"}</div>
        <div>👤 <b>Juragan:</b> ${p.juragan || "-"}</div>
        <div>📍 <b>Lokasi Muat:</b> ${p.lokasi_muat || "DDL"}</div>
        <div>📦 <b>Total Hitung:</b> ${formatDots(p.total_hitung)} Gabus</div>
      </div>
      <div class="card-footer">
        <button class="btn-action" onclick="bukaNota('${p.kunci_unik}')" style="background: var(--warning-text); width: 100%; justify-content: center;">
          🔍 Periksa & Edit Nota
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==========================================
// MODAL NOTA KONTAN CETAK (A6)
// ==========================================
function bukaNota(kunciUnik) {
  activeKapal = allPelayaran.find(p => p.kunci_unik === kunciUnik);
  if (!activeKapal) return;

  const aKapal = (activeKapal.nama_kapal || "").trim().toLowerCase();
  const aKunci = (activeKapal.kunci_unik || "").trim().toLowerCase();
  const aTgl = (activeKapal.tanggal || "").toString().trim().toLowerCase();
  const cleanA = aTgl.replace(/[^0-9]/g, "");

  const muatanKapal = allRincian.filter(r => {
    // 1. Cocokkan kunci_unik jika keduanya ada
    const rKunci = (r.kunci_unik || "").trim().toLowerCase();
    if (rKunci && aKunci && rKunci === aKunci) {
      return true;
    }

    // 2. Cocokkan nama kapal
    const rKapal = (r.nama_kapal || "").trim().toLowerCase();
    if (rKapal && aKapal && rKapal === aKapal) {
      // Jika salah satu tanggal kosong, anggap cocok
      if (!r.tanggal || !activeKapal.tanggal) return true;

      const rTgl = r.tanggal.toString().trim().toLowerCase();
      if (rTgl === aTgl) return true;

      // Normalisasi angka tanggal (mengatasi format YYYY-MM-DD vs DD/MM/YYYY)
      const cleanR = rTgl.replace(/[^0-9]/g, "");
      if (cleanR && cleanA) {
        if (cleanR === cleanA) return true;
        if (cleanR.length >= 8 && cleanA.length >= 8) {
          // Cek substring tanggal/bulan/tahun
          if (cleanR.slice(-4) === cleanA.slice(-4)) return true;
        }
      }
      return true;
    }
    return false;
  });

  notaItems = muatanKapal.map(m => {
    let ongkirTersimpan = parseDots(m.ongkir);
    let gabus = Number(m.jumlah) || 0;
    return {
      nama: m.nama_pemilik || "Tanpa Nama",
      gabus: gabus,
      ongkir: ongkirTersimpan > 0 ? ongkirTersimpan : 0
    };
  });

  potonganNominal = parseDots(activeKapal.potongan) || 0;

  renderBlangkoNota();
  updateSaveIndicator("saved");
  document.getElementById("notaModal").classList.add("active");
}

function tutupNota() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
    eksekusiSimpanOtomatis();
  }
  document.getElementById("notaModal").classList.remove("active");
}

function tambahBarisManual() {
  notaItems.push({
    nama: "Kapal Parengge Baru",
    gabus: 1,
    ongkir: 0
  });
  renderBlangkoNota();
  triggerAutoSave();
}

function hapusBaris(idx) {
  const item = notaItems[idx];
  const nama = item ? item.nama : "baris ini";
  if (confirm(`Hapus baris "${nama}" dari nota ini?`)) {
    const itemDihapus = notaItems[idx];
    const namaHapus = (itemDihapus.nama || "").trim().toLowerCase();

    notaItems.splice(idx, 1);

    allRincian = allRincian.filter(r => {
      if (r.kunci_unik === activeKapal.kunci_unik) {
        return (r.nama_pemilik || "").trim().toLowerCase() !== namaHapus;
      }
      return true;
    });

    renderBlangkoNota();
    renderSemuaMuatan();
    renderDashboard();
    triggerAutoSave();
  }
}

// ==========================================
// RENDER BLANGKO NOTA (PRESISI CETAK A6)
// ==========================================
function renderBlangkoNota() {
  const printArea = document.getElementById("notaPrintArea");

  let tglStr = activeKapal.tanggal;
  try {
    const [y, m, d] = activeKapal.tanggal.split("-");
    tglStr = `${d} - ${m} - ${y}`;
  } catch (e) {}

  let resiVal = activeKapal.resi || "1";
  const isCompact = notaItems.length > 6;
  const sheetClass = isCompact ? "nota-sheet compact-sheet" : "nota-sheet";

  let rowsHtml = "";
  if (notaItems.length === 0) {
    rowsHtml = `
      <tr>
        <td colspan="4" style="text-align: center; color: var(--danger-text); padding: 8px; font-weight: 600;">
          ⚠️ Rincian muatan kapal ini belum ada / kosong.<br>
          <small style="color: var(--text-muted); font-weight: normal;">
            Klik "+ Tambah Baris Kapal Parengge Manual" di bawah untuk menambahkan.
          </small>
        </td>
      </tr>
    `;
  } else {
    notaItems.forEach((item, idx) => {
      rowsHtml += `
        <tr>
          <td class="cell-no">${idx + 1}</td>
          <td style="padding-left: 5px;">
            <span class="print-text text-left" id="txtPrintNama_${idx}">${item.nama}</span>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
              <input type="text" class="inp-nama no-print" value="${item.nama}" oninput="updateNamaItem(${idx}, this.value)" style="flex: 1;">
              <button type="button" class="btn-del-item no-print" onclick="hapusBaris(${idx})" title="Hapus Baris">🗑️</button>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="print-text text-center" id="txtPrintGabus_${idx}">${item.gabus}</span>
            <input type="number" class="inp-gabus no-print" value="${item.gabus}" oninput="updateGabusItem(${idx}, this.value)">
          </td>
          <td style="text-align: right; padding-right: 5px;">
            <span class="print-text text-right font-bold" id="txtPrintOngkir_${idx}">${item.ongkir ? formatDots(item.ongkir) : ''}</span>
            <input type="text" inputmode="numeric" class="inp-ongkir no-print" placeholder="0" value="${item.ongkir ? formatDots(item.ongkir) : ''}" oninput="handleOngkirInput(${idx}, this)">
          </td>
        </tr>
      `;
    });
  }

  let totalGabusFisik = 0;
  notaItems.forEach(i => totalGabusFisik += Number(i.gabus) || 0);

  printArea.innerHTML = `
    <div class="${sheetClass}">
      <div class="nota-header-top">
        <div class="resi-wrap">
          <span>Res</span>
          <span class="print-text print-resi-box" id="txtPrintResi">${resiVal}</span>
          <input type="text" class="resi-input no-print" id="inpResi" value="${resiVal}" oninput="handleResiInput(this.value)">
        </div>
        <div class="nota-header-title">
          <div class="nota-title-brand-row">
            <img src="LOGO.jpg" alt="Logo PARENGGEKITA" class="nota-mini-logo">
            <span>NOTA ONGKIR</span>
          </div>
        </div>
        <div class="nota-header-date">${tglStr}</div>
      </div>

      <table class="info-table">
        <tr>
          <td class="lbl">Kapal Pengangkut</td>
          <td class="col">:</td>
          <td class="val">${activeKapal.nama_kapal}</td>
        </tr>
        <tr>
          <td class="lbl">Juragan</td>
          <td class="col">:</td>
          <td class="val">${activeKapal.juragan || "-"}</td>
        </tr>
        <tr>
          <td class="lbl">Lokasi Muat</td>
          <td class="col">:</td>
          <td class="val">${activeKapal.lokasi_muat || "DDL"}</td>
        </tr>
      </table>

      <table class="items-table">
        <colgroup>
          <col style="width: 22px;">
          <col style="width: 43%;">
          <col style="width: 22%;">
          <col style="width: 29%;">
        </colgroup>
        <thead>
          <tr>
            <th>NO</th>
            <th>KAPAL PARENGGE</th>
            <th>MUATAN (GBS)</th>
            <th>TOTAL ONGKIR (RP)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" rowspan="3" class="calc-side-left">
              <div class="t-label">SISA BERSIH JURAGAN</div>
              <div class="t-amount" id="txtBigBersih">0</div>
              <div class="t-gabus" id="txtTotalGabusNota">Total: <b>${totalGabusFisik} Gabus</b></div>
            </td>
            <td class="lbl-calc">Subtotal:</td>
            <td class="val-calc" id="txtSubtotal">0</td>
          </tr>
          <tr>
            <td class="lbl-calc">Potongan:</td>
            <td class="val-calc">
              <span class="print-text text-right font-bold" id="txtPrintPotongan">${potonganNominal ? formatDots(potonganNominal) : ''}</span>
              <input type="text" id="inpPotonganNom" inputmode="numeric" class="inp-potongan no-print" placeholder="0" value="${potonganNominal ? formatDots(potonganNominal) : ''}" oninput="handlePotonganNominalInput(this)">
            </td>
          </tr>
          <tr style="background:#f4f4f4;">
            <td class="lbl-calc" style="font-weight:900;">Total Bersih:</td>
            <td class="val-calc val-total" id="txtTotalBersih">0</td>
          </tr>
        </tfoot>
      </table>

      <div class="sig-section">
        <div class="sig-box">
          <div class="sig-title">Hormat kami,</div>
          <div class="sig-line">Dg Sila</div>
        </div>
      </div>
    </div>
  `;

  hitungNota();
}

// ==========================================
// LIVE SYNC INPUT KE CETAK & AUTOSAVE
// ==========================================
function updateNamaItem(idx, val) {
  if (!notaItems[idx]) return;
  notaItems[idx].nama = val;
  const printEl = document.getElementById(`txtPrintNama_${idx}`);
  if (printEl) printEl.textContent = val;
  triggerAutoSave();
}

function updateGabusItem(idx, val) {
  if (!notaItems[idx]) return;
  const num = Number(val) || 0;
  notaItems[idx].gabus = num;

  const printEl = document.getElementById(`txtPrintGabus_${idx}`);
  if (printEl) printEl.textContent = num;

  let totalGabusFisik = 0;
  notaItems.forEach(i => totalGabusFisik += Number(i.gabus) || 0);
  const elGabus = document.getElementById("txtTotalGabusNota");
  if (elGabus) elGabus.innerHTML = `Total: <b>${totalGabusFisik} Gabus</b>`;

  hitungNota();
  triggerAutoSave();
}

function handleOngkirInput(idx, inputEl) {
  let num = parseDots(inputEl.value);
  inputEl.value = num ? formatDots(num) : "";
  notaItems[idx].ongkir = num;
  
  const printEl = document.getElementById(`txtPrintOngkir_${idx}`);
  if (printEl) printEl.textContent = num ? formatDots(num) : "";

  hitungNota();
  triggerAutoSave();
}

function handlePotonganNominalInput(inputEl) {
  let num = parseDots(inputEl.value);
  inputEl.value = num ? formatDots(num) : "";
  potonganNominal = num;

  const printPot = document.getElementById("txtPrintPotongan");
  if (printPot) printPot.textContent = num ? formatDots(num) : "";

  hitungNota();
  triggerAutoSave();
}

function handleResiInput(val) {
  if (activeKapal) activeKapal.resi = val;
  const printResi = document.getElementById("txtPrintResi") || document.querySelector(".print-resi-box");
  if (printResi) printResi.textContent = val;
  triggerAutoSave();
}

function hitungNota() {
  let sub = 0;
  notaItems.forEach(i => sub += Number(i.ongkir) || 0);
  const bersih = sub - (potonganNominal || 0);

  const elSub = document.getElementById("txtSubtotal");
  const elTot = document.getElementById("txtTotalBersih");
  const elBig = document.getElementById("txtBigBersih");

  if (elSub) elSub.textContent = formatRp(sub);
  if (elTot) elTot.textContent = formatRp(bersih);
  if (elBig) elBig.textContent = formatRp(bersih);
}

// ==========================================
// AUTOSAVE LOGIC & NOTIFIKASI STATUS
// ==========================================
function updateSaveIndicator(status) {
  const el = document.getElementById("saveIndicator");
  if (!el) return;

  if (status === "typing") {
    el.style.background = "#fef3c7";
    el.style.color = "#b45309";
    el.innerHTML = "⏳ Menyimpan...";
  } else if (status === "saved") {
    el.style.background = "#dcfce7";
    el.style.color = "#15803d";
    el.innerHTML = "✓ Tersimpan";
  } else if (status === "error") {
    el.style.background = "#fee2e2";
    el.style.color = "#b91c1c";
    el.innerHTML = "⚠️ Gagal Simpan";
  }
}

function triggerAutoSave() {
  updateSaveIndicator("typing");
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    autoSaveTimer = null;
    eksekusiSimpanOtomatis();
  }, 800);
}

async function eksekusiSimpanOtomatis() {
  const url = localStorage.getItem("GAS_WEBHOOK_URL");
  if (!url || !activeKapal) return;

  // Keamanan: Mencegah eksekusi simpan jika rincian nota kosong agar tidak menghapus database
  if (!notaItems || notaItems.length === 0) {
    console.warn("Penyimpanan dicegah: notaItems kosong agar data di spreadsheet tidak terhapus.");
    updateSaveIndicator("saved");
    return;
  }

  let sub = 0;
  notaItems.forEach(i => sub += Number(i.ongkir) || 0);
  const bersih = sub - (potonganNominal || 0);
  const resiVal = document.getElementById("inpResi") ? document.getElementById("inpResi").value : "1";

  // Kirim data dengan kedua format penamaan (nama/nama_pemilik, gabus/jumlah)
  // agar Apps Script mengenali field apapun tanpa membuat kolom kosong
  const formattedItems = notaItems.map(item => ({
    nama: item.nama || "Tanpa Nama",
    nama_pemilik: item.nama || "Tanpa Nama",
    gabus: Number(item.gabus) || 0,
    jumlah: Number(item.gabus) || 0,
    satuan: "Gabus",
    ongkir: Number(item.ongkir) || 0,
    kunci_unik: activeKapal.kunci_unik,
    tanggal: activeKapal.tanggal,
    nama_kapal: activeKapal.nama_kapal
  }));

  const payload = {
    aksi: "SIMPAN_NOTA",
    kunci_unik: activeKapal.kunci_unik,
    tanggal: activeKapal.tanggal,
    nama_kapal: activeKapal.nama_kapal,
    juragan: activeKapal.juragan || "",
    lokasi_muat: activeKapal.lokasi_muat || "DDL",
    total_hitung: activeKapal.total_hitung || 0,
    status_selisih: activeKapal.status_selisih || "SESUAI",
    resi: resiVal,
    subtotal: sub,
    subtotal_ongkir: sub,
    potongan: potonganNominal,
    total_bersih: bersih,
    items: formattedItems
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    let resJson = null;
    try { resJson = await res.json(); } catch (_) {}

    if (resJson && resJson.status === "gagal") {
      throw new Error(resJson.pesan || "Server merespon gagal");
    }

    activeKapal.subtotal_ongkir = sub;
    activeKapal.potongan = potonganNominal;
    activeKapal.total_bersih = bersih;
    activeKapal.resi = resiVal;

    allRincian = allRincian.filter(r => {
      if (r.kunci_unik === activeKapal.kunci_unik) {
        return notaItems.some(ni => (ni.nama || "").trim().toLowerCase() === (r.nama_pemilik || "").trim().toLowerCase());
      }
      return true;
    });

    notaItems.forEach(nItem => {
      let found = allRincian.find(r => 
        (r.kunci_unik === activeKapal.kunci_unik && (r.nama_pemilik || "").trim().toLowerCase() === (nItem.nama || "").trim().toLowerCase())
      );
      if (found) {
        found.ongkir = nItem.ongkir;
        found.jumlah = nItem.gabus;
      } else {
        allRincian.push({
          kunci_unik: activeKapal.kunci_unik,
          tanggal: activeKapal.tanggal,
          nama_kapal: activeKapal.nama_kapal,
          nama_pemilik: nItem.nama,
          jumlah: nItem.gabus,
          satuan: "Gabus",
          ongkir: nItem.ongkir
        });
      }
    });

    try {
      localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
      localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
    } catch (_) {}

    renderDashboard();
    renderSemuaMuatan();
    renderAuditTab();
    updateSaveIndicator("saved");
  } catch (err) {
    console.error("Gagal simpan otomatis:", err);
    updateSaveIndicator("error");
  }
}

// ==========================================
// SWITCH TAB NAVIGATION (NAVBAR & BOTTOM NAV)
// ==========================================
function switchTab(tabName, el) {
  currentTab = tabName;

  // 1. Update Desktop Navbar link active state
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
  const desktopNavMap = {
    dashboard: document.getElementById("navTabDashboard"),
    kapal: document.getElementById("navTabKapal"),
    muatan: document.getElementById("navTabMuatan"),
    audit: document.getElementById("navTabAudit"),
    setting: document.getElementById("navTabSetting")
  };
  if (desktopNavMap[tabName]) {
    desktopNavMap[tabName].classList.add('active');
  }

  // 2. Update Mobile Bottom Nav active state
  document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));
  const mobileNavMap = {
    dashboard: document.getElementById("bottomTabDashboard"),
    kapal: document.getElementById("bottomTabKapal"),
    muatan: document.getElementById("bottomTabMuatan"),
    audit: document.getElementById("bottomTabAudit"),
    setting: document.getElementById("bottomTabSetting")
  };
  if (mobileNavMap[tabName]) {
    mobileNavMap[tabName].classList.add('active');
  }

  // 3. Tampilkan Tab yang Sesuai
  const tabDashboard = document.getElementById("tabDashboard");
  const tabKapal = document.getElementById("tabKapal");
  const tabMuatan = document.getElementById("tabMuatan");
  const tabAudit = document.getElementById("tabAudit");
  const tabSetting = document.getElementById("tabSetting");

  if (tabDashboard) tabDashboard.style.display = "none";
  if (tabKapal) tabKapal.style.display = "none";
  if (tabMuatan) tabMuatan.style.display = "none";
  if (tabAudit) tabAudit.style.display = "none";
  if (tabSetting) tabSetting.style.display = "none";

  if (tabName === 'dashboard') {
    if (tabDashboard) tabDashboard.style.display = "block";
    renderDashboard();
    if (dailyChartInstance) {
      setTimeout(() => {
        try { dailyChartInstance.resize(); } catch (_) {}
      }, 50);
    }
  } else if (tabName === 'kapal') {
    if (tabKapal) tabKapal.style.display = "block";
    filterData();
  } else if (tabName === 'muatan') {
    if (tabMuatan) tabMuatan.style.display = "block";
    renderSemuaMuatan();
  } else if (tabName === 'audit') {
    if (tabAudit) tabAudit.style.display = "block";
    renderAuditTab();
  } else if (tabName === 'setting') {
    if (tabSetting) tabSetting.style.display = "block";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Responsivitas Grafik saat Ukuran Layar Desktop Berubah
window.addEventListener("resize", () => {
  if (dailyChartInstance && currentTab === 'dashboard') {
    try {
      dailyChartInstance.resize();
    } catch (_) {}
  }
});