// ==========================================
// MAIN BAR 1: BERANDA / DASHBOARD & GRAFIK TREN
// PARENGGEKITA - SISTEM MANIFES KAPAL
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
