// ==========================================
// MAIN BAR 1: BERANDA / DASHBOARD & GRAFIK TREN
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initDashboardView() {
  const container = document.getElementById("tabDashboard");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
      <!-- 4 KPI Metrics Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" onclick="switchTab('kapal')" style="cursor: pointer;" title="Buka Database Pelayaran Kapal">
          <div class="kpi-header">
            <span class="kpi-label">Kapal Ongkir</span>
            <div class="kpi-icon-box kpi-icon-ship">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 20a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 4 0"/>
                <path d="M4 18l2-7h12l2 7"/>
                <path d="M12 4v7"/>
                <path d="M9 7l3-3 3 3"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value" id="kpiKapalOnline">0 Kapal</div>
          <div class="kpi-sub">Pelayaran Tercatat →</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span class="kpi-label">Total Muatan</span>
            <div class="kpi-icon-box kpi-icon-cargo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="13" width="18" height="7" rx="1.5"/>
                <rect x="5" y="5" width="14" height="6" rx="1.5"/>
                <line x1="3" y1="16.5" x2="21" y2="16.5"/>
                <line x1="5" y1="8" x2="19" y2="8"/>
                <circle cx="12" cy="16.5" r="1" fill="currentColor"/>
                <circle cx="12" cy="8" r="1" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value" id="kpiTotalGabus">0 Gabus</div>
          <div class="kpi-sub">Fisik Muatan Masuk</div>
        </div>

        <div class="kpi-card" onclick="switchTab('muatan')" style="cursor: pointer;" title="Buka Data Muatan Parengge">
          <div class="kpi-header">
            <span class="kpi-label">Kapal Parengge</span>
            <div class="kpi-icon-box kpi-icon-parengge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 19c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1"/>
                <path d="M3.5 16L5 11h14l1.5 5H3.5z"/>
                <path d="M10 11V5l7 3-7 3z"/>
                <line x1="6" y1="11" x2="6" y2="8"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value" id="kpiTotalParengge">0 Kapal</div>
          <div class="kpi-sub" id="kpiSubParengge">Master Terdaftar →</div>
        </div>

        <div class="kpi-card" onclick="switchTab('kapal')" style="cursor: pointer;" title="Buka Daftar Kapal Ongkir">
          <div class="kpi-header">
            <span class="kpi-label">Status Audit</span>
            <div class="kpi-icon-box kpi-icon-audit" id="kpiAuditIconBox">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                <path d="M7 21h10"/>
                <path d="M12 3v18"/>
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
              </svg>
            </div>
          </div>
          <div class="kpi-value" id="kpiStatusAudit" style="color: var(--success-text);">Semua Sesuai</div>
          <div class="kpi-sub" id="kpiSubAudit">0 Selisih</div>
        </div>
      </div>

      <!-- Alert Selisih Banner -->
      <div class="alert-banner" id="alertBanner" style="display: none;" onclick="switchTab('kapal')">
        <div class="alert-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <div class="alert-title">Perhatian: Selisih Hitung Muatan</div>
            <div class="alert-desc" id="alertDesc">Ditemukan kapal dengan perbedaan manifest fisik.</div>
          </div>
        </div>
        <button class="btn-alert">Tinjau di Kapal Ongkir →</button>
      </div>

      <!-- GRAFIK TREN HARIAN KAPAL ONGKIR & MUATAN GABUS -->
      <div class="chart-section-card" id="chartSectionCard">
        <div class="chart-card-header">
          <div class="chart-title-wrap">
            <div class="chart-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div>
              <h3 class="chart-title">Grafik Harian Kapal Ongkir & Muatan Gabus</h3>
              <p class="chart-subtitle">Statistik harian armada kapal ongkir dan volume gabus ikan per tanggal</p>
            </div>
          </div>

          <div class="chart-controls">
            <div class="chart-range-pills" id="chartRangePills">
              <button type="button" class="chart-pill-btn active" onclick="setChartRange(7, this)">7 Hari</button>
              <button type="button" class="chart-pill-btn" onclick="setChartRange(14, this)">14 Hari</button>
              <button type="button" class="chart-pill-btn" onclick="setChartRange(30, this)">30 Hari</button>
              <button type="button" class="chart-pill-btn" onclick="setChartRange(0, this)">Semua</button>
            </div>
          </div>
        </div>

        <!-- Mini Stats Summary Chips -->
        <div class="chart-stat-chips" id="chartStatChips">
          <div class="stat-chip">
            <span class="stat-chip-label">Rata-rata Kapal</span>
            <span class="stat-chip-val" id="statAvgKapal">0 / hari</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip-label">Rata-rata Muatan</span>
            <span class="stat-chip-val" id="statAvgGabus">0 Gabus / hari</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip-label">Puncak Muatan</span>
            <span class="stat-chip-val" id="statPeakGabus">-</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip-label">Hari Operasi</span>
            <span class="stat-chip-val" id="statTotalDays">0 Hari</span>
          </div>
        </div>

        <!-- Legend Row -->
        <div class="chart-legend-row">
          <div class="legend-indicator">
            <span class="legend-box-gabus"></span>
            <span class="legend-text-full">Total Muatan Gabus (Gabus) — Sumbu Kiri</span>
            <span class="legend-text-mobile">Gabus (Kiri)</span>
          </div>
          <div class="legend-indicator">
            <span class="legend-line-kapal"></span>
            <span class="legend-text-full">Jumlah Kapal Ongkir (Kapal) — Sumbu Kanan</span>
            <span class="legend-text-mobile">Kapal (Kanan)</span>
          </div>
        </div>

        <!-- Canvas Container -->
        <div class="chart-canvas-container" id="chartCanvasContainer">
          <canvas id="dailyShipGabusChart"></canvas>
          <div class="chart-empty-state" id="chartEmptyState" style="display: none;">
            <div class="chart-empty-icon">📈</div>
            <div class="chart-empty-text">Belum ada data pelayaran untuk grafik</div>
            <div class="chart-empty-sub">Grafik tren harian akan terisi otomatis setelah data kapal dan muatan tersedia.</div>
          </div>
        </div>
      </div>
  `;
}

function renderDashboard() {
  initDashboardView();
  const totalKapal = allPelayaran.length;
  const totalGabus = allPelayaran.reduce((sum, p) => sum + (Number(p.total_hitung) || 0), 0);
  
  // Hitung Parengge Terdaftar & Aktif
  let activeParenggeMap = {};
  if (Array.isArray(allRincian)) {
    allRincian.forEach(r => {
      let rawName = String(r.nama_kapal_parengge || r.nama_pemilik || "").trim();
      if (rawName && rawName.toLowerCase() !== "tanpa nama") {
        activeParenggeMap[rawName.toLowerCase()] = true;
      }
    });
  }
  const activeParenggeCount = Object.keys(activeParenggeMap).length;
  const masterListCount = Array.isArray(MASTER_KAPAL_PARENGGE) ? MASTER_KAPAL_PARENGGE.length : 34;
  const totalParengge = Math.max(masterListCount, activeParenggeCount);

  const selisihList = allPelayaran.filter(p => p.status_selisih !== "SESUAI");

  // 1. Update 4 KPI Cards
  const kpiKapal = document.getElementById("kpiKapalOnline");
  if (kpiKapal) kpiKapal.textContent = `${totalKapal} Kapal`;

  const kpiGabus = document.getElementById("kpiTotalGabus");
  if (kpiGabus) kpiGabus.textContent = `${formatDots(totalGabus)} Gabus`;

  const kpiParengge = document.getElementById("kpiTotalParengge");
  if (kpiParengge) kpiParengge.textContent = `${totalParengge} Kapal`;

  const kpiSubP = document.getElementById("kpiSubParengge");
  if (kpiSubP) {
    kpiSubP.textContent = activeParenggeCount > 0 
      ? `${activeParenggeCount} Aktif Muat →` 
      : `${masterListCount} Master Terdaftar →`;
  }

  const kpiAudit = document.getElementById("kpiStatusAudit");
  const kpiSubAudit = document.getElementById("kpiSubAudit");
  const navAuditBadge = document.getElementById("navAuditBadge");

  if (kpiAudit) {
    if (selisihList.length === 0) {
      kpiAudit.textContent = "Semua Sesuai ✓";
      kpiAudit.style.color = "var(--success-text)";
      if (kpiSubAudit) kpiSubAudit.textContent = "0 Selisih hitung";
    } else {
      kpiAudit.textContent = `${selisihList.length} Selisih`;
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
// GRAFIK HARIAN KAPAL ONGKIR & GABUS
// ==========================================

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

  if (elAvgKapal) elAvgKapal.textContent = `${formatDots(avgKapal)} / hari`;
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
    updateChartMiniStats(0, 0, "-", 0);
    return;
  }

  // Agregasi harian: Jumlah kapal ongkir dan total gabus per tanggal
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
    updateChartMiniStats(0, 0, "-", 0);
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
    totalHari > 0 ? Math.round(sumKapal / totalHari) : 0,
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
    dailyChartInstance.data.datasets[0].customFullDates = fullDatesList;
    dailyChartInstance.update();
    return;
  }

  const isMobile = window.innerWidth <= 640;
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
          borderRadius: isMobile ? 4 : 6,
          borderSkipped: false,
          maxBarThickness: isMobile ? 22 : 42,
          order: 2,
          customFullDates: fullDatesList
        },
        {
          type: 'line',
          label: 'Jumlah Kapal Ongkir',
          data: kapalData,
          yAxisID: 'yKapal',
          borderColor: '#ea580c',
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          borderWidth: isMobile ? 2.2 : 3,
          fill: false,
          tension: 0.35,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ea580c',
          pointBorderWidth: isMobile ? 2 : 2.5,
          pointRadius: isMobile ? 3.5 : 4.5,
          pointHoverRadius: isMobile ? 5.5 : 7,
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
            size: isMobile ? 11 : 13,
            weight: '700'
          },
          bodyColor: '#e2e8f0',
          bodyFont: {
            family: 'Plus Jakarta Sans',
            size: isMobile ? 10 : 12,
            weight: '500'
          },
          padding: isMobile ? 8 : 12,
          cornerRadius: 8,
          boxPadding: 4,
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
                return ` 🚢 Kapal Ongkir: ${formatDots(context.parsed.y)} Kapal`;
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
              size: isMobile ? 9 : 11
            },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: isMobile ? 5 : 10
          }
        },
        yGabus: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          grid: {
            color: 'rgba(226, 232, 240, 0.6)',
            drawBorder: false
          },
          ticks: {
            color: '#0c2340',
            font: {
              family: 'Plus Jakarta Sans',
              weight: '600',
              size: isMobile ? 9 : 11
            },
            callback: function(val) {
              if (val >= 1000) {
                return (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
              }
              return val;
            }
          },
          title: {
            display: !isMobile,
            text: 'Muatan Gabus',
            color: '#0c2340',
            font: {
              family: 'Plus Jakarta Sans',
              size: 11,
              weight: '700'
            }
          }
        },
        yKapal: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: '#ea580c',
            stepSize: 1,
            precision: 0,
            font: {
              family: 'Plus Jakarta Sans',
              weight: '600',
              size: isMobile ? 9 : 11
            },
            callback: function(val) {
              return Math.round(val);
            }
          },
          title: {
            display: !isMobile,
            text: 'Armada Kapal',
            color: '#ea580c',
            font: {
              family: 'Plus Jakarta Sans',
              size: 11,
              weight: '700'
            }
          }
        }
      }
    }
  });
}

