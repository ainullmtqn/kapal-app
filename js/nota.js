// ==========================================
// MODAL & BLANGKO CETAK NOTA KONTAN (A6) & AUTOSAVE
// PARENGGEKITA - SISTEM MANIFES KAPAL
// ==========================================

function initNotaModalView() {
  const container = document.getElementById("notaModal");
  if (!container || container.innerHTML.trim() !== "") return;

  container.innerHTML = `
    <datalist id="listMasterParengge"></datalist>
    <div class="modal-content">
      <div class="modal-top-bar no-print">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-weight: 700; font-size: 0.95rem;">Nota Ongkir (A6)</span>
          <span id="saveIndicator" class="save-status-pill">✓ Tersimpan</span>
        </div>
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          <button class="btn-action" onclick="window.print()" style="background: var(--success-text); color: #fff;">🖨️ Cetak A6</button>
          <button class="btn-close" onclick="tutupNota()">✕</button>
        </div>
      </div>

      <!-- BLANGKO NOTA KONTAN -->
      <div id="notaPrintArea">
        <!-- Rendered by JS -->
      </div>

      <div id="btnTambahBarisManualWrap" class="no-print" style="margin-top: 0.75rem; text-align: center;">
        <button type="button" class="btn-action" onclick="tambahBarisManual()" style="background: #475569; font-size: 0.78rem; padding: 0.45rem 0.85rem;">
          ➕ Tambah Baris Kapal Parengge Manual
        </button>
      </div>
    </div>
  `;

  updateMasterParenggeDatalist();
}

function updateMasterParenggeDatalist() {
  const dl = document.getElementById("listMasterParengge");
  if (!dl) return;
  const list = typeof getMasterKapalParengge === "function" 
    ? getMasterKapalParengge() 
    : ((Array.isArray(MASTER_KAPAL_PARENGGE) && MASTER_KAPAL_PARENGGE.length > 0) ? MASTER_KAPAL_PARENGGE : DEFAULT_MASTER_KAPAL_PARENGGE);
  dl.innerHTML = list.map(p => `<option value="${escapeHtml(p)}">`).join("");
}

function bukaNota(kunciUnik) {
  initNotaModalView();
  updateMasterParenggeDatalist();
  if (!kunciUnik && kunciUnik !== 0) return;
  const targetKey = String(kunciUnik).trim().toLowerCase();

  activeKapal = allPelayaran.find(p => {
    const pKunci = String(p.kunci_unik || "").trim().toLowerCase();
    const pGen = getNormalizedTripId(p.nama_kapal_ongkir || p.nama_kapal, p.tanggal).trim().toLowerCase();
    return pKunci === targetKey || pGen === targetKey;
  });

  if (!activeKapal) {
    activeKapal = allPelayaran.find(p => {
      const generated = getNormalizedTripId(p.nama_kapal_ongkir || p.nama_kapal, p.tanggal).trim().toLowerCase();
      return generated === targetKey;
    });
  }

  if (!activeKapal) return;

  // JANGAN timpa kunci_unik yang sudah valid dari database
  if (!activeKapal.kunci_unik || !String(activeKapal.kunci_unik).trim()) {
    activeKapal.kunci_unik = getNormalizedTripId(activeKapal.nama_kapal_ongkir || activeKapal.nama_kapal, activeKapal.tanggal);
  }

  const muatanKapal = allRincian.filter(r => isSameTripRecord(r, activeKapal));

  notaItems = muatanKapal.map(m => {
    let ongkirTersimpan = validateOngkir(m.ongkir_rp !== undefined ? m.ongkir_rp : m.ongkir);
    let gabus = Math.max(0, Math.floor(Number(m.jumlah_gabus !== undefined ? m.jumlah_gabus : m.jumlah) || 0));
    return {
      nama: sanitizeInput(m.nama_kapal_parengge || m.nama_pemilik || m.nama || "Tanpa Nama"),
      gabus: gabus,
      ongkir: ongkirTersimpan
    };
  });

  potonganNominal = validateOngkir(activeKapal.potongan);

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
  const list = typeof getMasterKapalParengge === "function" 
    ? getMasterKapalParengge() 
    : ((Array.isArray(MASTER_KAPAL_PARENGGE) && MASTER_KAPAL_PARENGGE.length > 0) ? MASTER_KAPAL_PARENGGE : DEFAULT_MASTER_KAPAL_PARENGGE);
  const defaultNama = list.length > 0 ? list[0] : "BTG 01";

  notaItems.push({
    nama: defaultNama,
    gabus: 1,
    ongkir: 0
  });
  renderBlangkoNota();
  triggerAutoSave();
}

function hapusBaris(idx) {
  const item = notaItems[idx];
  const nama = item ? item.nama : "baris ini";
  if (confirm(`Peringatan: Hapus baris "${nama}" dari nota ini?`)) {
    const itemDihapus = notaItems[idx];
    const namaHapus = (itemDihapus.nama || "").trim().toLowerCase();

    notaItems.splice(idx, 1);

    allRincian = allRincian.filter(r => {
      if (isSameTripRecord(r, activeKapal)) {
        const itemNama = (r.nama_kapal_parengge || r.nama_pemilik || "").trim().toLowerCase();
        return itemNama !== namaHapus;
      }
      return true;
    });

    renderBlangkoNota();
    if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();
    if (typeof renderDashboard === "function") renderDashboard();
    triggerAutoSave();
    showSecurityToast(`Baris "${nama}" berhasil dihapus.`);
  }
}

// ==========================================
// RENDER BLANGKO NOTA (PRESISI CETAK A6)
// ==========================================

function renderBlangkoNota() {
  const printArea = document.getElementById("notaPrintArea");
  if (!printArea) return;
  if (!activeKapal) return;

  try {
    let rawTgl = activeKapal.tanggal ? String(activeKapal.tanggal) : "";
    let tglStr = escapeHtml(rawTgl);
    try {
      if (rawTgl.includes("-")) {
        const parts = rawTgl.split("-");
        if (parts.length === 3) {
          tglStr = `${parts[2]} - ${parts[1]} - ${parts[0]}`;
        }
      }
    } catch (_) {}

    let resiVal = escapeHtml(activeKapal.resi ? String(activeKapal.resi) : "1");
    const isCompact = Array.isArray(notaItems) && notaItems.length > 6;
    const sheetClass = isCompact ? "nota-sheet compact-sheet" : "nota-sheet";

    let rowsHtml = "";
    if (!notaItems || notaItems.length === 0) {
      rowsHtml = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-primary); padding: 1.15rem 0.5rem;">
            <div style="font-weight: 700; font-size: 0.86rem; color: var(--text-primary); margin-bottom: 0.25rem;">📦 Rincian muatan kapal ini masih kosong</div>
            <div style="color: var(--text-muted); font-size: 0.76rem; margin-bottom: 0.75rem;">Tambahkan baris kapal parengge untuk menghitung muatan & ongkir:</div>
            <button type="button" class="btn-action no-print" onclick="tambahBarisManual()" style="background: var(--ocean); font-size: 0.78rem; padding: 0.45rem 1rem; margin: 0 auto; display: inline-flex; align-items: center; gap: 6px;">
              <span>➕ Tambah Baris Parengge</span>
            </button>
          </td>
        </tr>
      `;
    } else {
      notaItems.forEach((item, idx) => {
        const safeNama = escapeHtml(item ? item.nama : "");
        const safeGabus = Math.max(0, Math.floor(Number(item ? item.gabus : 0) || 0));
        const safeOngkir = validateOngkir(item ? item.ongkir : 0);
        rowsHtml += `
          <tr>
            <td class="cell-no">${idx + 1}</td>
            <td style="padding-left: 5px;">
              <span class="print-text text-left" id="txtPrintNama_${idx}">${safeNama}</span>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                <input type="text" class="inp-nama no-print" list="listMasterParengge" value="${safeNama}" oninput="updateNamaItem(${idx}, this.value)" onchange="updateNamaItem(${idx}, this.value)" style="flex: 1;" placeholder="Pilih / ketik nama kapal parengge...">
                <button type="button" class="btn-del-item no-print" onclick="hapusBaris(${idx})" title="Hapus Baris">🗑️</button>
              </div>
            </td>
            <td style="text-align: center;">
              <span class="print-text text-center" id="txtPrintGabus_${idx}">${safeGabus}</span>
              <input type="number" class="inp-gabus no-print" min="0" value="${safeGabus}" oninput="updateGabusItem(${idx}, this.value)">
            </td>
            <td style="text-align: right; padding-right: 5px;">
              <span class="print-text text-right font-bold" id="txtPrintOngkir_${idx}">${safeOngkir ? formatDots(safeOngkir) : ''}</span>
              <input type="text" inputmode="numeric" class="inp-ongkir no-print" placeholder="0" value="${safeOngkir ? formatDots(safeOngkir) : ''}" oninput="handleOngkirInput(${idx}, this)">
            </td>
          </tr>
        `;
      });
    }

    let totalGabusFisik = 0;
    if (Array.isArray(notaItems)) {
      notaItems.forEach(i => totalGabusFisik += Math.max(0, Math.floor(Number(i.gabus) || 0)));
    }

    printArea.innerHTML = `
      <div class="${sheetClass}">
        <!-- WATERMARK LOGO RESMI DI BELAKANG NOTA -->
        <div class="nota-watermark" aria-hidden="true">
          <img src="logo.png" alt="Watermark PARENGGEKITA" class="nota-watermark-img">
        </div>

        <div class="nota-header-top">
          <div class="resi-wrap">
            <span>Res</span>
            <span class="print-text print-resi-box" id="txtPrintResi">${resiVal}</span>
            <input type="text" class="resi-input no-print" id="inpResi" value="${resiVal}" oninput="handleResiInput(this.value)">
          </div>
          <div class="nota-header-title">
            <span>NOTA ONGKIR</span>
          </div>
          <div class="nota-header-date">${tglStr}</div>
        </div>

      <table class="info-table">
        <tr>
          <td class="lbl">Kapal Ongkir</td>
          <td class="col">:</td>
          <td class="val">${escapeHtml(activeKapal.nama_kapal_ongkir || activeKapal.nama_kapal)}</td>
        </tr>
        <tr>
          <td class="lbl">Juragan</td>
          <td class="col">:</td>
          <td class="val">${escapeHtml(activeKapal.juragan || "-")}</td>
        </tr>
        <tr>
          <td class="lbl">Lokasi Muat</td>
          <td class="col">:</td>
          <td class="val">${escapeHtml(activeKapal.lokasi_muat || "DDL")}</td>
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
          <tr>
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
  } catch (err) {
    console.error("Gagal render blangko nota:", err);
  }
}

// ==========================================
// LIVE SYNC INPUT KE CETAK & AUTOSAVE
// ==========================================

function updateNamaItem(idx, val) {
  if (!notaItems[idx]) return;
  const safeVal = sanitizeInput(val);
  notaItems[idx].nama = safeVal;
  const printEl = document.getElementById(`txtPrintNama_${idx}`);
  if (printEl) printEl.textContent = safeVal;
  triggerAutoSave();
}

function updateGabusItem(idx, val) {
  if (!notaItems[idx]) return;
  let num = Number(val);
  if (isNaN(num) || !isFinite(num) || num < 0) {
    num = 0;
  }
  num = Math.max(0, Math.floor(num));
  notaItems[idx].gabus = num;

  const printEl = document.getElementById(`txtPrintGabus_${idx}`);
  if (printEl) printEl.textContent = num;

  let totalGabusFisik = 0;
  notaItems.forEach(i => totalGabusFisik += Math.max(0, Math.floor(Number(i.gabus) || 0)));
  const elGabus = document.getElementById("txtTotalGabusNota");
  if (elGabus) elGabus.innerHTML = `Total: <b>${totalGabusFisik} Gabus</b>`;

  hitungNota();
  triggerAutoSave();
}

function handleOngkirInput(idx, inputEl) {
  if (!notaItems[idx] || !inputEl) return;
  let num = validateOngkir(inputEl.value);
  inputEl.value = num > 0 ? formatDots(num) : "";
  notaItems[idx].ongkir = num;
  
  const printEl = document.getElementById(`txtPrintOngkir_${idx}`);
  if (printEl) printEl.textContent = num > 0 ? formatDots(num) : "";

  hitungNota();
  triggerAutoSave();
}

function handlePotonganNominalInput(inputEl) {
  if (!inputEl) return;
  let num = validateOngkir(inputEl.value);
  inputEl.value = num > 0 ? formatDots(num) : "";
  potonganNominal = num;

  const printPot = document.getElementById("txtPrintPotongan");
  if (printPot) printPot.textContent = num > 0 ? formatDots(num) : "";

  hitungNota();
  triggerAutoSave();
}

function handleResiInput(val) {
  if (!activeKapal) return;
  const safeVal = sanitizeInput(val);
  activeKapal.resi = safeVal;
  const printResi = document.getElementById("txtPrintResi") || document.querySelector(".print-resi-box");
  if (printResi) printResi.textContent = safeVal;
  triggerAutoSave();
}

function hitungNota() {
  let sub = 0;
  notaItems.forEach(i => sub += validateOngkir(i.ongkir));
  const safePot = validateOngkir(potonganNominal);
  const bersih = Math.max(0, sub - safePot);

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
  const url = (typeof getActiveWebhookUrl === "function") ? getActiveWebhookUrl() : localStorage.getItem("GAS_WEBHOOK_URL");
  if (!url || !activeKapal) return;

  if (!notaItems || notaItems.length === 0) {
    console.warn("Penyimpanan dicegah: notaItems kosong agar data di spreadsheet tidak terhapus.");
    updateSaveIndicator("saved");
    return;
  }

  let sub = 0;
  notaItems.forEach(i => sub += validateOngkir(i.ongkir));
  const safePotongan = validateOngkir(potonganNominal);
  const bersih = Math.max(0, sub - safePotongan);
  const resiVal = document.getElementById("inpResi") ? sanitizeInput(document.getElementById("inpResi").value) : "1";

  const safeTanggal = validateDateFormat(activeKapal.tanggal) ? normalizeDateKey(activeKapal.tanggal) : sanitizeInput(activeKapal.tanggal);
  const safeNamaKapal = sanitizeInput(activeKapal.nama_kapal_ongkir || activeKapal.nama_kapal);

  const tripKey = getNormalizedTripId(safeNamaKapal, safeTanggal, activeKapal.kunci_unik);
  activeKapal.kunci_unik = tripKey;
  activeKapal.tanggal = safeTanggal;
  activeKapal.nama_kapal = safeNamaKapal;
  activeKapal.nama_kapal_ongkir = safeNamaKapal;

  let totalGabusNota = 0;
  notaItems.forEach(i => totalGabusNota += Math.max(0, Math.floor(Number(i.gabus) || 0)));

  const safeTertulis = Number(activeKapal.total_tertulis) || 0;
  const safeTerhitung = totalGabusNota;
  const safeSelisih = safeTertulis > 0 ? (safeTertulis - safeTerhitung) : 0;
  const safeStatus = safeTertulis > 0 ? (safeSelisih === 0 ? "SESUAI" : "SELISIH") : sanitizeInput(activeKapal.status_selisih || "SESUAI");

  activeKapal.total_terhitung = safeTerhitung;
  activeKapal.total_hitung = safeTerhitung;
  activeKapal.selisih = safeSelisih;
  activeKapal.status_selisih = safeStatus;

  const formattedItems = notaItems.map(item => {
    const cleanNama = sanitizeInput(item.nama || "Tanpa Nama");
    const cleanGabus = Math.max(0, Math.floor(Number(item.gabus) || 0));
    const cleanOngkir = validateOngkir(item.ongkir);
    return {
      kunci_unik: tripKey,
      tanggal: safeTanggal,
      nama_kapal_ongkir: safeNamaKapal,
      nama_kapal: safeNamaKapal,
      nama_kapal_parengge: cleanNama,
      nama_pemilik: cleanNama,
      jumlah_gabus: cleanGabus,
      jumlah: cleanGabus,
      satuan: "Gabus",
      ongkir_rp: cleanOngkir,
      ongkir: cleanOngkir
    };
  });

  const payload = {
    auth: typeof APP_SECRET_TOKEN !== "undefined" ? APP_SECRET_TOKEN : "",
    aksi: "SIMPAN_NOTA",
    kunci_unik: tripKey,
    tanggal: safeTanggal,
    nama_kapal_ongkir: safeNamaKapal,
    nama_kapal: safeNamaKapal,
    juragan: sanitizeInput(activeKapal.juragan || ""),
    lokasi_muat: sanitizeInput(activeKapal.lokasi_muat || "DDL"),
    waktu_berangkat: sanitizeInput(activeKapal.waktu_berangkat || ""),
    total_tertulis: safeTertulis,
    total_terhitung: safeTerhitung,
    total_hitung: safeTerhitung,
    selisih: safeSelisih,
    status_selisih: safeStatus,
    subtotal_ongkir: sub,
    subtotal: sub,
    potongan: safePotongan,
    total_bersih: bersih,
    resi: resiVal,
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
    activeKapal.potongan = safePotongan;
    activeKapal.total_bersih = bersih;
    activeKapal.resi = resiVal;

    allRincian = allRincian.filter(r => {
      if (isSameTripRecord(r, activeKapal)) {
        const itemNama = sanitizeInput(r.nama_kapal_parengge || r.nama_pemilik || "").toLowerCase();
        return notaItems.some(ni => sanitizeInput(ni.nama || "").toLowerCase() === itemNama);
      }
      return true;
    });

    notaItems.forEach(nItem => {
      const cleanNama = sanitizeInput(nItem.nama || "Tanpa Nama");
      const cleanGabus = Math.max(0, Math.floor(Number(nItem.gabus) || 0));
      const cleanOngkir = validateOngkir(nItem.ongkir);
      let found = allRincian.find(r => 
        isSameTripRecord(r, activeKapal) && 
        sanitizeInput(r.nama_kapal_parengge || r.nama_pemilik || "").toLowerCase() === cleanNama.toLowerCase()
      );
      if (found) {
        found.ongkir = cleanOngkir;
        found.ongkir_rp = cleanOngkir;
        found.jumlah = cleanGabus;
        found.jumlah_gabus = cleanGabus;
        found.kunci_unik = tripKey;
        found.tanggal = safeTanggal;
        found.nama_kapal = safeNamaKapal;
        found.nama_kapal_ongkir = safeNamaKapal;
        found.nama_pemilik = cleanNama;
        found.nama_kapal_parengge = cleanNama;
        found.satuan = "Gabus";
      } else {
        allRincian.push({
          kunci_unik: tripKey,
          tanggal: safeTanggal,
          nama_kapal: safeNamaKapal,
          nama_kapal_ongkir: safeNamaKapal,
          nama_pemilik: cleanNama,
          nama_kapal_parengge: cleanNama,
          jumlah: cleanGabus,
          jumlah_gabus: cleanGabus,
          satuan: "Gabus",
          ongkir: cleanOngkir,
          ongkir_rp: cleanOngkir
        });
      }
    });

    try {
      localStorage.setItem("CACHE_PELAYARAN", JSON.stringify(allPelayaran));
      localStorage.setItem("CACHE_RINCIAN", JSON.stringify(allRincian));
      lastDataSignature = computeDataSignature(allPelayaran, allRincian);
    } catch (_) {}

    if (typeof renderDashboard === "function") renderDashboard();
    if (typeof renderSemuaMuatan === "function") renderSemuaMuatan();
    updateSaveIndicator("saved");
  } catch (err) {
    console.error("Gagal simpan otomatis:", err);
    updateSaveIndicator("error");
  }
}

