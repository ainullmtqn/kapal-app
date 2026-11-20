/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (Code.gs) - DATABASE MANIFES KAPAL
 * INTEGRASI GANDA: BOT TELEGRAM/WHATSAPP + WEB APP PARENGGEKITA
 * =========================================================================
 * Nama Spreadsheet : Database Manifes Kapal
 * Spreadsheet ID   : 1w4StmnR78nlq3zRmjXnGJ559EGK3ZqF_X5KeqIQSMeo
 * URL Spreadsheet  : https://docs.google.com/spreadsheets/d/1w4StmnR78nlq3zRmjXnGJ559EGK3ZqF_X5KeqIQSMeo/edit
 * 
 * Tab Utama:
 *   1. Rekap_Ongkir   (Header Pelayaran - Primary Key: Kunci Unik Kolom B)
 *   2. Rincian_Muatan (Detail Item Muatan - Foreign Key: Kunci Unik Kolom B)
 *   3. Database_Kapal (Master Dataset 37 Kapal Ongkir & 34 Kapal Parengge)
 * =========================================================================
 */

const SPREADSHEET_ID = '1w4StmnR78nlq3zRmjXnGJ559EGK3ZqF_X5KeqIQSMeo';
const SPREADSHEET_NAME = 'Database Manifes Kapal';
const TIMEZONE = 'Asia/Jakarta';

const SHEET_REKAP = 'Rekap_Ongkir';
const SHEET_MUATAN = 'Rincian_Muatan';
const SHEET_MASTER = 'Database_Kapal';

/**
 * Master Dataset Fallback Standar (37 Kapal Ongkir & 34 Kapal Parengge)
 */
const DEFAULT_MASTER_ONGKIR = [
  "KMN BINTANG SOREANG", "KMN CAHAYA BARU", "KMN TUNAS HARAPAN", "KMN BARI BARIA",
  "KMN BINTANG BKC", "KMN AISYAH 02", "KMN ALIKA JAYA", "KMN AMALIA",
  "KMN MUARA BAHARI", "KMN BINTANG AL KHAFI", "KMN CAHAYA SALWA", "KMN PUTRI TUNGGAL",
  "KMN BINTANG MUTIARA", "KMN ODONG ODONG", "KMN NUR KHALISTA", "KMN SINAR FAUZIA",
  "KMN BINTANG DUA PUTRI", "KMN CAHAYA NUR AISYAH", "KMN BINTANG AJT", "KMN MANYIGARRI",
  "KMN FAHRY JAYA", "KMN BINTANG NADITA", "KMN ALIZA JAYA", "KMN FAIZ JAYA",
  "KMN BINTANG CN", "KMN CAHAYA YUNNA", "KMN BINTANG CAHAYA YUNNA", "KMN BINTANG DPS",
  "KMN IRFAN JAYA BBL", "KMN BIRU BIRU", "KMN CAHAYA BULAN", "KMN JABAL NUR",
  "KMN ALZAKI", "KMN IQBAL JAYA", "KMN BINTANG MADINA", "KMN NUR HIKMA 02",
  "KMN SABARI UTAMA"
];

const DEFAULT_MASTER_PARENGGE = [
  "BTG 01", "ALAM SURGA", "ALHAMIDI 01", "ALHAMIDI 02",
  "ANWAR SH", "BARI BIRU", "BARI MUDA", "BINTANG 33",
  "BINTANG 88", "BINTANG ALAM", "BINTANG HARAPAN", "BINTANG KEJORA 01",
  "BINTANG KEJORA 02", "BINTANG KEJORA 55", "BINTANG MUSAFIR 01", "BINTANG RAJA CF 04",
  "BULU JAYA", "BUNGA JAYA", "CAHAYA BINTANG", "CB 06",
  "CB 10", "CHOKI COKI", "CORA CORA", "DENSAR",
  "DEWA BATARA 01", "DUA PUTRA", "GARUDA CITY", "JUKU JUKU",
  "KEJORA GHIFARI", "KIBAR", "TINGGI MONCONG", "SUMBER JAYA",
  "SAMPOERNA", "TABBING TABBING"
];

/**
 * Mendapatkan instance Spreadsheet "Database Manifes Kapal"
 */
function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    console.error('Gagal membuka via openById, fallback ke active:', e.message);
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * Helper JSON Response
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Format string tanggal aktif WIB (YYYY-MM-DD)
 */
function getActiveDateWIB() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Format timestamp aktif WIB (YYYY-MM-DD HH:mm:ss)
 */
function getActiveTimestampWIB() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Format fleksibel objek atau string tanggal ke ISO yyyy-MM-dd
 */
function formatDateIso(val) {
  if (!val && val !== 0) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, TIMEZONE, 'yyyy-MM-dd');
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.substring(0, 10);
  }
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    const d = ('0' + dmy[1]).slice(-2);
    const m = ('0' + dmy[2]).slice(-2);
    const y = dmy[3];
    return y + '-' + m + '-' + d;
  }
  return s;
}

/**
 * Format sel jam berangkat agar tidak terserialisasi menjadi ISO 1899-12-30T...
 */
function formatTimeCell(val) {
  if (val === null || val === undefined || val === '') return '-';
  if (val instanceof Date) {
    return Utilities.formatDate(val, TIMEZONE, 'HH.mm');
  }
  const str = String(val).trim();
  if (!str || str === '-') return '-';
  if (str.indexOf('1899-12-30') !== -1 || (str.indexOf('T') !== -1 && str.indexOf('Z') !== -1)) {
    const dt = new Date(str);
    if (!isNaN(dt.getTime())) {
      return Utilities.formatDate(dt, TIMEZONE, 'HH.mm');
    }
  }
  const match = str.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    const h = ('0' + match[1]).slice(-2);
    const m = match[2];
    return h + '.' + m;
  }
  return str;
}

/**
 * Helper untuk mengambil sheet dan memastikan ketersediaannya
 */
function getSpreadsheetSheets(ss) {
  if (!ss) {
    ss = getSpreadsheet();
  }
  const sheetRekap = ss.getSheetByName(SHEET_REKAP) || ss.getSheets()[0];
  const sheetMuatan = ss.getSheetByName(SHEET_MUATAN) || ss.getSheetByName('Rincian Muatan') || (ss.getSheets().length > 1 ? ss.getSheets()[1] : null);
  const sheetMaster = ss.getSheetByName(SHEET_MASTER) || ss.getSheetByName('Database Kapal') || (ss.getSheets().length > 2 ? ss.getSheets()[2] : null);

  return { sheetRekap: sheetRekap, sheetMuatan: sheetMuatan, sheetMaster: sheetMaster };
}

/**
 * =========================================================================
 * POST WEBHOOK HANDLER (KOMPATIBEL: BOT + WEB APP)
 * =========================================================================
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Kunci eksekusi max 15 detik untuk mencegah tabrakan data (race condition)
    lock.waitLock(15000);

    const rawData = e.postData?.contents;
    if (!rawData) {
      return jsonResponse({ status: 'error', pesan: 'Payload POST kosong' });
    }

    const payload = JSON.parse(rawData);
    const ss = getSpreadsheet();
    const sheets = getSpreadsheetSheets(ss);

    // 1. Aksi EDIT_MUATAN (Bot: Update gabus parengge & audit ulang kapal)
    if (payload.aksi === 'EDIT_MUATAN') {
      return handleEditMuatan(sheets, payload);
    }

    // 2. Aksi HAPUS_KAPAL (Bot: Hapus header kapal & seluruh rincian muatannya)
    if (payload.aksi === 'HAPUS_KAPAL') {
      return handleHapusKapal(sheets, payload);
    }

    // 3. Aksi RESET_DATA (Bot: Bersihkan transaksi pada tanggal terkait)
    if (payload.aksi === 'RESET_DATA') {
      return handleResetData(sheets, payload);
    }

    // 4. Aksi SIMPAN_NOTA (Web App: Simpan / Autosave Nota Kontan & Rincian Muatan)
    if (payload.aksi === 'SIMPAN_NOTA') {
      return handleSimpanNota(sheets, payload);
    }

    // 5. Default: Simpan Data Manifes dari Bot (BARU / REVISI_PENUH / TAMBAHAN_PARSIAL)
    return handleSaveManifest(sheets, payload);

  } catch (err) {
    return jsonResponse({ status: 'error', pesan: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Menyimpan data manifes dari BOT ke Rekap_Ongkir & Rincian_Muatan
 * Format input bot: data_pelayaran, audit, rincian_muatan
 */
function handleSaveManifest(sheets, data) {
  const sheetRekap = sheets.sheetRekap;
  const sheetMuatan = sheets.sheetMuatan;

  const timestamp = getActiveTimestampWIB();
  const kunciUnik = data.kunci_unik || '';
  const dataKapal = data.data_pelayaran || {};
  const audit = data.audit || {};
  const tglPelayaran = formatDateIso(dataKapal.tanggal) || getActiveDateWIB();
  const namaKapal = (dataKapal.nama_kapal || '').trim().toUpperCase();

  const totalTertulis = Number(dataKapal.total_muatan_tertulis || 0);
  const totalTerhitung = Number(audit.total_muatan_terhitung || 0);
  const selisih = Number(audit.selisih || 0);
  const statusSelisih = audit.apakah_cocok ? 'SESUAI' : 'SELISIH';

  const subtotalOngkir = Number(data.subtotal_ongkir || 0);
  const potongan = Number(data.potongan || 0);
  const totalBersih = Number(data.total_bersih || (subtotalOngkir - potongan));
  const resi = data.resi || '1';

  // Baris Rekap_Ongkir (Kolom A s/d O):
  const rowRekap = [
    timestamp,
    kunciUnik,
    tglPelayaran,
    namaKapal,
    dataKapal.juragan || '-',
    dataKapal.lokasi_muat || 'DDL',
    dataKapal.waktu_berangkat || '-',
    totalTertulis,
    totalTerhitung,
    selisih,
    statusSelisih,
    subtotalOngkir,
    potongan,
    totalBersih,
    resi
  ];

  // 1. Simpan ke Rekap_Ongkir (Timpa jika Kunci Unik sudah ada di Kolom B)
  const lastRowRekap = sheetRekap.getLastRow();
  let existingRowRekap = -1;

  if (lastRowRekap > 1) {
    const keys = sheetRekap.getRange(2, 2, lastRowRekap - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (String(keys[i][0]).toLowerCase() === kunciUnik.toLowerCase()) {
        existingRowRekap = i + 2;
        break;
      }
    }
  }

  if (existingRowRekap > 0) {
    sheetRekap.getRange(existingRowRekap, 1, 1, rowRekap.length).setValues([rowRekap]);
  } else {
    sheetRekap.appendRow(rowRekap);
  }

  // 2. Hapus rincian lama untuk Kunci Unik ini di Rincian_Muatan (Mencegah duplikasi baris saat revisi)
  const lastRowMuatan = sheetMuatan.getLastRow();
  if (lastRowMuatan > 1) {
    const muatanKeys = sheetMuatan.getRange(2, 2, lastRowMuatan - 1, 1).getValues();
    for (let r = muatanKeys.length - 1; r >= 0; r--) {
      if (String(muatanKeys[r][0]).toLowerCase() === kunciUnik.toLowerCase()) {
        sheetMuatan.deleteRow(r + 2);
      }
    }
  }

  // 3. Masukkan rincian muatan parengge baru ke Rincian_Muatan (Kolom A s/d H)
  const rincian = data.rincian_muatan || [];
  if (rincian.length > 0) {
    const rowsMuatan = rincian.map(function(item) {
      return [
        timestamp,
        kunciUnik,
        tglPelayaran,
        namaKapal,
        item.nama_pemilik || item.nama_kapal_parengge || 'TANPA NAMA',
        Number(item.jumlah || item.jumlah_gabus || 0),
        item.satuan || 'Gabus',
        Number(item.ongkir || item.ongkir_rp || 0)
      ];
    });

    const targetRow = sheetMuatan.getLastRow() + 1;
    sheetMuatan.getRange(targetRow, 1, rowsMuatan.length, 8).setValues(rowsMuatan);
  }

  return jsonResponse({
    status: 'sukses',
    pesan: 'Manifes kapal berhasil dicatat ke Database ' + SPREADSHEET_NAME,
    kunci_unik: kunciUnik,
    total_muatan: totalTerhitung,
    status_selisih: statusSelisih
  });
}

/**
 * Menyimpan / Autosave Nota Kontan & Rincian Muatan dari WEB APP PARENGGEKITA
 */
function handleSimpanNota(sheets, payload) {
  const sheetRekap = sheets.sheetRekap;
  const sheetMuatan = sheets.sheetMuatan;

  const timestamp = getActiveTimestampWIB();
  const kunci = String(payload.kunci_unik || '').trim();
  const tanggal = formatDateIso(payload.tanggal) || getActiveDateWIB();
  const namaKapal = String(payload.nama_kapal_ongkir || payload.nama_kapal || '').trim().toUpperCase();
  const juragan = String(payload.juragan || '-').trim();
  const lokasi = String(payload.lokasi_muat || 'DDL').trim();
  const waktuBerangkat = String(payload.waktu_berangkat || '').trim();
  const resi = String(payload.resi || '1').trim();

  const items = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.rincian_muatan) ? payload.rincian_muatan : []);

  let totalTerhitung = 0;
  let subtotalOngkir = 0;
  for (let k = 0; k < items.length; k++) {
    const it = items[k];
    const gbs = Math.max(0, Math.floor(Number(it.jumlah_gabus !== undefined ? it.jumlah_gabus : it.jumlah) || 0));
    const ongk = Number(it.ongkir_rp !== undefined ? it.ongkir_rp : it.ongkir) || 0;
    totalTerhitung += gbs;
    subtotalOngkir += ongk;
  }

  const totalTertulis = Number(payload.total_tertulis) || 0;
  const selisih = totalTertulis > 0 ? (totalTertulis - totalTerhitung) : (Number(payload.selisih) || 0);
  const statusSelisih = totalTertulis > 0 ? (selisih === 0 ? 'SESUAI' : 'SELISIH') : String(payload.status_selisih || (selisih === 0 ? 'SESUAI' : 'SELISIH')).trim();

  const subtotal = Number(payload.subtotal_ongkir !== undefined ? payload.subtotal_ongkir : payload.subtotal) || subtotalOngkir;
  const potongan = Number(payload.potongan) || 0;
  const totalBersih = Number(payload.total_bersih) || Math.max(0, subtotal - potongan);

  // 1. Simpan ke Rekap_Ongkir
  const lastRowRekap = sheetRekap.getLastRow();
  let existingRowRekap = -1;

  if (lastRowRekap > 1) {
    const keys = sheetRekap.getRange(2, 2, lastRowRekap - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (String(keys[i][0]).toLowerCase() === kunci.toLowerCase()) {
        existingRowRekap = i + 2;
        break;
      }
    }
  }

  const rowRekap = [
    timestamp,
    kunci,
    tanggal,
    namaKapal,
    juragan,
    lokasi,
    waktuBerangkat,
    totalTertulis,
    totalTerhitung,
    selisih,
    statusSelisih,
    subtotal,
    potongan,
    totalBersih,
    resi
  ];

  if (existingRowRekap > 0) {
    sheetRekap.getRange(existingRowRekap, 1, 1, 15).setValues([rowRekap]);
  } else {
    sheetRekap.appendRow(rowRekap);
  }

  // 2. Hapus rincian lama untuk Kunci Unik ini di Rincian_Muatan
  const lastRowMuatan = sheetMuatan.getLastRow();
  if (lastRowMuatan > 1) {
    const muatanKeys = sheetMuatan.getRange(2, 2, lastRowMuatan - 1, 1).getValues();
    for (let r = muatanKeys.length - 1; r >= 0; r--) {
      if (String(muatanKeys[r][0]).toLowerCase() === kunci.toLowerCase()) {
        sheetMuatan.deleteRow(r + 2);
      }
    }
  }

  // 3. Masukkan rincian muatan parengge baru
  if (items.length > 0) {
    const rowsMuatan = items.map(function(item) {
      const pName = String(item.nama_kapal_parengge || item.nama_pemilik || item.nama || 'TANPA NAMA').trim();
      const gJml = Math.max(0, Math.floor(Number(item.jumlah_gabus !== undefined ? item.jumlah_gabus : item.gabus) || 0));
      const oVal = Number(item.ongkir_rp !== undefined ? item.ongkir_rp : item.ongkir) || 0;
      return [
        timestamp,
        kunci,
        tanggal,
        namaKapal,
        pName,
        gJml,
        item.satuan || 'Gabus',
        oVal
      ];
    });

    const targetRow = sheetMuatan.getLastRow() + 1;
    sheetMuatan.getRange(targetRow, 1, rowsMuatan.length, 8).setValues(rowsMuatan);
  }

  return jsonResponse({
    status: 'sukses',
    pesan: 'Nota & rincian berhasil disimpan ke ' + SPREADSHEET_NAME,
    kunci_unik: kunci,
    total_muatan: totalTerhitung,
    status_selisih: statusSelisih
  });
}

/**
 * Mengedit kuantitas gabus parengge & audit ulang kapal di database (Fungsi BOT)
 */
function handleEditMuatan(sheets, data) {
  const sheetRekap = sheets.sheetRekap;
  const sheetMuatan = sheets.sheetMuatan;

  const tanggal = formatDateIso(data.tanggal) || getActiveDateWIB();
  const targetKapal = (data.nama_kapal || '').trim().toUpperCase();
  const targetParengge = (data.nama_pemilik || data.nama_kapal_parengge || '').trim().toUpperCase();
  const jumlahBaru = Number(data.jumlah_baru || 0);

  let updatedInMuatan = false;
  let jumlahLama = 0;
  let kunciUnikDitemukan = '';

  // 1. Cari & perbarui kuantitas di Rincian_Muatan (Kolom F)
  const lastRowMuatan = sheetMuatan.getLastRow();
  if (lastRowMuatan > 1) {
    const dataMuatan = sheetMuatan.getRange(2, 1, lastRowMuatan - 1, 8).getValues();
    for (let i = 0; i < dataMuatan.length; i++) {
      const tgl = formatDateIso(dataMuatan[i][2]);
      const kapal = (dataMuatan[i][3] || '').toString().trim().toUpperCase();
      const parengge = (dataMuatan[i][4] || '').toString().trim().toUpperCase();

      if (kapal === targetKapal && parengge === targetParengge && (tgl === tanggal || !data.tanggal)) {
        jumlahLama = Number(dataMuatan[i][5] || 0);
        kunciUnikDitemukan = dataMuatan[i][1];
        sheetMuatan.getRange(i + 2, 6).setValue(jumlahBaru);
        updatedInMuatan = true;
        break;
      }
    }
  }

  // Jika belum ada parengge tersebut pada kapal ini, tambahkan baris baru
  if (!updatedInMuatan) {
    const timestamp = getActiveTimestampWIB();
    const kunciUnik = targetKapal.replace(/[^A-Z0-9]+/g, '_') + '_' + tanggal.replace(/[^0-9]/g, '');
    kunciUnikDitemukan = kunciUnik;
    sheetMuatan.appendRow([
      timestamp,
      kunciUnik,
      tanggal,
      targetKapal,
      targetParengge,
      jumlahBaru,
      'Gabus',
      0
    ]);
  }

  // 2. Hitung ulang total terhitung untuk kapal ini di Rincian_Muatan
  let totalTerhitungBaru = 0;
  const newLastRowMuatan = sheetMuatan.getLastRow();
  if (newLastRowMuatan > 1) {
    const allMuatan = sheetMuatan.getRange(2, 1, newLastRowMuatan - 1, 8).getValues();
    for (let j = 0; j < allMuatan.length; j++) {
      const tgl = formatDateIso(allMuatan[j][2]);
      const k = (allMuatan[j][3] || '').toString().trim().toUpperCase();
      if (k === targetKapal && (tgl === tanggal || !data.tanggal)) {
        totalTerhitungBaru += Number(allMuatan[j][5] || 0);
      }
    }
  }

  // 3. Perbarui Rekap_Ongkir: Total Terhitung (Kolom I), Selisih (Kolom J), Status Selisih (Kolom K)
  let selisihBaru = 0;
  let statusSelisihBaru = 'SESUAI';
  const lastRowRekap = sheetRekap.getLastRow();
  if (lastRowRekap > 1) {
    const dataRekap = sheetRekap.getRange(2, 1, lastRowRekap - 1, 15).getValues();
    for (let k = 0; k < dataRekap.length; k++) {
      const tgl = formatDateIso(dataRekap[k][2]);
      const namaK = (dataRekap[k][3] || '').toString().trim().toUpperCase();
      const keyK = dataRekap[k][1];

      if ((namaK === targetKapal && (tgl === tanggal || !data.tanggal)) || (kunciUnikDitemukan && keyK === kunciUnikDitemukan)) {
        const totalTertulis = Number(dataRekap[k][7] || 0);
        selisihBaru = totalTertulis - totalTerhitungBaru;
        statusSelisihBaru = (selisihBaru === 0) ? 'SESUAI' : 'SELISIH';

        // Kolom 9 (I): Total Terhitung
        sheetRekap.getRange(k + 2, 9).setValue(totalTerhitungBaru);
        // Kolom 10 (J): Selisih
        sheetRekap.getRange(k + 2, 10).setValue(selisihBaru);
        // Kolom 11 (K): Status Selisih
        sheetRekap.getRange(k + 2, 11).setValue(statusSelisihBaru);
        break;
      }
    }
  }

  return jsonResponse({
    status: 'sukses',
    pesan: 'Muatan parengge berhasil diperbarui',
    data: {
      nama_kapal: targetKapal,
      nama_pemilik: targetParengge,
      jumlah_lama: jumlahLama,
      jumlah_baru: jumlahBaru,
      total_terhitung: totalTerhitungBaru,
      selisih: selisihBaru,
      status_selisih: statusSelisihBaru
    }
  });
}

/**
 * Menghapus data kapal beserta seluruh rincian muatannya (Fungsi BOT)
 */
function handleHapusKapal(sheets, data) {
  const sheetRekap = sheets.sheetRekap;
  const sheetMuatan = sheets.sheetMuatan;

  const tanggal = data.tanggal ? formatDateIso(data.tanggal) : null;
  const targetKapal = (data.nama_kapal || '').trim().toUpperCase();

  // 1. Hapus dari Rekap_Ongkir
  const lastRowRekap = sheetRekap.getLastRow();
  if (lastRowRekap > 1) {
    const rekapData = sheetRekap.getRange(2, 1, lastRowRekap - 1, 4).getValues();
    for (let r = rekapData.length - 1; r >= 0; r--) {
      const rowTgl = formatDateIso(rekapData[r][2]);
      const rowKapal = (rekapData[r][3] || '').toString().trim().toUpperCase();

      if (rowKapal === targetKapal && (!tanggal || rowTgl === tanggal)) {
        sheetRekap.deleteRow(r + 2);
      }
    }
  }

  // 2. Hapus seluruh rincian dari Rincian_Muatan
  const lastRowMuatan = sheetMuatan.getLastRow();
  if (lastRowMuatan > 1) {
    const muatanData = sheetMuatan.getRange(2, 1, lastRowMuatan - 1, 4).getValues();
    for (let r = muatanData.length - 1; r >= 0; r--) {
      const rowTgl = formatDateIso(muatanData[r][2]);
      const rowKapal = (muatanData[r][3] || '').toString().trim().toUpperCase();

      if (rowKapal === targetKapal && (!tanggal || rowTgl === tanggal)) {
        sheetMuatan.deleteRow(r + 2);
      }
    }
  }

  return jsonResponse({
    status: 'sukses',
    pesan: 'Data kapal ' + targetKapal + ' beserta muatannya berhasil dihapus dari ' + SPREADSHEET_NAME + '.'
  });
}

/**
 * Mereset transaksi pada tanggal tertentu atau seluruhnya (Fungsi BOT)
 */
function handleResetData(sheets, data) {
  const sheetRekap = sheets.sheetRekap;
  const sheetMuatan = sheets.sheetMuatan;
  const tanggal = data.tanggal ? formatDateIso(data.tanggal) : null;

  if (tanggal) {
    if (sheetRekap.getLastRow() > 1) {
      const dataR = sheetRekap.getRange(2, 3, sheetRekap.getLastRow() - 1, 1).getValues();
      for (let r = dataR.length - 1; r >= 0; r--) {
        const rowTgl = formatDateIso(dataR[r][0]);
        if (rowTgl === tanggal) {
          sheetRekap.deleteRow(r + 2);
        }
      }
    }
    if (sheetMuatan.getLastRow() > 1) {
      const dataM = sheetMuatan.getRange(2, 3, sheetMuatan.getLastRow() - 1, 1).getValues();
      for (let r = dataM.length - 1; r >= 0; r--) {
        const rowTgl = formatDateIso(dataM[r][0]);
        if (rowTgl === tanggal) {
          sheetMuatan.deleteRow(r + 2);
        }
      }
    }
    return jsonResponse({
      status: 'sukses',
      pesan: 'Transaksi untuk tanggal ' + tanggal + ' berhasil dibersihkan.'
    });
  } else {
    if (sheetRekap.getLastRow() > 1) {
      sheetRekap.deleteRows(2, sheetRekap.getLastRow() - 1);
    }
    if (sheetMuatan.getLastRow() > 1) {
      sheetMuatan.deleteRows(2, sheetMuatan.getLastRow() - 1);
    }
    return jsonResponse({
      status: 'sukses',
      pesan: 'Seluruh data transaksi di Rekap_Ongkir & Rincian_Muatan telah dibersihkan.'
    });
  }
}

/**
 * =========================================================================
 * GET WEBHOOK HANDLER (KOMPATIBEL: BOT + WEB APP)
 * =========================================================================
 */
function doGet(e) {
  try {
    const params = e.parameter || {};
    const tanggal = params.tanggal ? formatDateIso(params.tanggal) : getActiveDateWIB();
    const targetKapal = (params.kapal || '').trim().toUpperCase();
    const targetAgen = (params.agen || '').trim().toUpperCase();
    const aksi = params.aksi || '';

    const ss = getSpreadsheet();
    const sheets = getSpreadsheetSheets(ss);
    const sheetRekap = sheets.sheetRekap;
    const sheetMuatan = sheets.sheetMuatan;
    const sheetMaster = sheets.sheetMaster;

    // 0. GET MASTER DATASET DARI Database_Kapal (Query BOT)
    if (aksi === 'GET_MASTER_DATA') {
      const masterOngkir = [];
      const masterParengge = [];

      if (sheetMaster && sheetMaster.getLastRow() > 1) {
        const dataOngkir = sheetMaster.getRange(2, 2, Math.min(sheetMaster.getLastRow() - 1, 37), 1).getValues();
        dataOngkir.forEach(function(row) {
          const val = row[0] ? row[0].toString().trim() : '';
          if (val && masterOngkir.indexOf(val) === -1) masterOngkir.push(val);
        });

        const dataParengge = sheetMaster.getRange(2, 5, Math.min(sheetMaster.getLastRow() - 1, 34), 1).getValues();
        dataParengge.forEach(function(row) {
          const val = row[0] ? row[0].toString().trim() : '';
          if (val && masterParengge.indexOf(val) === -1) masterParengge.push(val);
        });
      }

      if (masterParengge.length === 0) masterParengge.push.apply(masterParengge, DEFAULT_MASTER_PARENGGE);
      if (masterOngkir.length === 0) masterOngkir.push.apply(masterOngkir, DEFAULT_MASTER_ONGKIR);

      return jsonResponse({
        status: 'sukses',
        database: SPREADSHEET_NAME,
        master_kapal_ongkir: masterOngkir,
        master_kapal_parengge: masterParengge
      });
    }

    // 1. CEK DETAIL KAPAL (Query BOT: Header + Rincian Parengge Kapal Ini)
    if (targetKapal) {
      if (!sheetRekap || sheetRekap.getLastRow() <= 1) {
        return jsonResponse({ status: 'sukses', pelayaran: [] });
      }

      const rowsRekap = sheetRekap.getRange(2, 1, sheetRekap.getLastRow() - 1, 15).getValues();
      let headerKapal = null;

      for (let i = 0; i < rowsRekap.length; i++) {
        const rowTgl = formatDateIso(rowsRekap[i][2]);
        const kapal = (rowsRekap[i][3] || '').toString().trim().toUpperCase();

        if ((kapal === targetKapal || kapal.includes(targetKapal) || targetKapal.includes(kapal)) && (!params.tanggal || rowTgl === tanggal)) {
          headerKapal = {
            timestamp: rowsRekap[i][0] instanceof Date ? Utilities.formatDate(rowsRekap[i][0], TIMEZONE, 'yyyy-MM-dd HH:mm:ss') : String(rowsRekap[i][0] || ''),
            kunci_unik: rowsRekap[i][1],
            tanggal: rowTgl,
            nama_kapal: rowsRekap[i][3],
            nama_kapal_ongkir: rowsRekap[i][3],
            juragan: rowsRekap[i][4],
            lokasi_muat: rowsRekap[i][5],
            jam_berangkat: formatTimeCell(rowsRekap[i][6]),
            waktu_berangkat: formatTimeCell(rowsRekap[i][6]),
            total_tertulis: Number(rowsRekap[i][7]) || 0,
            total_hitung: Number(rowsRekap[i][8]) || 0,
            total_terhitung: Number(rowsRekap[i][8]) || 0,
            selisih: Number(rowsRekap[i][9]) || 0,
            status_selisih: rowsRekap[i][10],
            subtotal_ongkir: Number(rowsRekap[i][11]) || 0,
            subtotal: Number(rowsRekap[i][11]) || 0,
            potongan: Number(rowsRekap[i][12]) || 0,
            total_bersih: Number(rowsRekap[i][13]) || 0,
            resi: rowsRekap[i][14],
            rincian: []
          };
          break;
        }
      }

      if (!headerKapal) {
        return jsonResponse({ status: 'sukses', pelayaran: [] });
      }

      // Ambil daftar parengge dari Rincian_Muatan
      if (sheetMuatan && sheetMuatan.getLastRow() > 1) {
        const rowsMuatan = sheetMuatan.getRange(2, 1, sheetMuatan.getLastRow() - 1, 8).getValues();
        for (let j = 0; j < rowsMuatan.length; j++) {
          const rowKey = String(rowsMuatan[j][1] || '').trim().toLowerCase();
          const rowKapal = (rowsMuatan[j][3] || '').toString().trim().toUpperCase();

          if (rowKey === String(headerKapal.kunci_unik || '').toLowerCase() || rowKapal === headerKapal.nama_kapal.toUpperCase()) {
            headerKapal.rincian.push({
              nama_pemilik: rowsMuatan[j][4],
              nama_kapal_parengge: rowsMuatan[j][4],
              jumlah: Number(rowsMuatan[j][5]) || 0,
              jumlah_gabus: Number(rowsMuatan[j][5]) || 0,
              satuan: rowsMuatan[j][6],
              ongkir: Number(rowsMuatan[j][7]) || 0,
              ongkir_rp: Number(rowsMuatan[j][7]) || 0
            });
          }
        }
      }

      return jsonResponse({ status: 'sukses', pelayaran: [headerKapal] });
    }

    // 2. LACAK PARENGGE (Query BOT: Sebaran di Seluruh Kapal)
    if (targetAgen) {
      if (!sheetMuatan || sheetMuatan.getLastRow() <= 1) {
        return jsonResponse({ status: 'sukses', rincian: [] });
      }

      const rowsMuatan = sheetMuatan.getRange(2, 1, sheetMuatan.getLastRow() - 1, 8).getValues();
      const hasil = [];

      for (let i = 0; i < rowsMuatan.length; i++) {
        const rowTgl = formatDateIso(rowsMuatan[i][2]);
        const pemilik = (rowsMuatan[i][4] || '').toString().trim().toUpperCase();

        if ((pemilik === targetAgen || pemilik.includes(targetAgen) || targetAgen.includes(pemilik)) && (!params.tanggal || rowTgl === tanggal)) {
          hasil.push({
            tanggal: rowTgl,
            nama_kapal: rowsMuatan[i][3],
            nama_kapal_ongkir: rowsMuatan[i][3],
            nama_pemilik: rowsMuatan[i][4],
            nama_kapal_parengge: rowsMuatan[i][4],
            jumlah: Number(rowsMuatan[i][5]) || 0,
            jumlah_gabus: Number(rowsMuatan[i][5]) || 0,
            satuan: rowsMuatan[i][6],
            ongkir: Number(rowsMuatan[i][7]) || 0,
            ongkir_rp: Number(rowsMuatan[i][7]) || 0
          });
        }
      }

      return jsonResponse({ status: 'sukses', rincian: hasil });
    }

    // 3. REKAP KHUSUS BOT JIKA DIINGINKAN (mode=bot)
    if (params.mode === 'bot') {
      if (!sheetRekap || sheetRekap.getLastRow() <= 1) {
        return jsonResponse({ status: 'sukses', pelayaran: [] });
      }

      const rowsRekap = sheetRekap.getRange(2, 1, sheetRekap.getLastRow() - 1, 15).getValues();
      const pelayaranList = [];

      for (let i = 0; i < rowsRekap.length; i++) {
        const rowTgl = formatDateIso(rowsRekap[i][2]);
        if (!params.tanggal || rowTgl === tanggal) {
          pelayaranList.push({
            kunci_unik: rowsRekap[i][1],
            tanggal: rowTgl,
            nama_kapal: rowsRekap[i][3],
            juragan: rowsRekap[i][4],
            lokasi_muat: rowsRekap[i][5],
            jam_berangkat: formatTimeCell(rowsRekap[i][6]),
            total_tertulis: rowsRekap[i][7],
            total_hitung: rowsRekap[i][8],
            selisih: rowsRekap[i][9],
            status_selisih: rowsRekap[i][10],
            subtotal_ongkir: rowsRekap[i][11],
            potongan: rowsRekap[i][12],
            total_bersih: rowsRekap[i][13],
            resi: rowsRekap[i][14]
          });
        }
      }

      return jsonResponse({ status: 'sukses', pelayaran: pelayaranList });
    }

    // 4. DEFAULT: FULL DATASET UNTUK WEB APP PARENGGEKITA (Pelayaran + Rincian + Master)
    const pelayaranList = [];
    if (sheetRekap && sheetRekap.getLastRow() > 1) {
      const rowsRekap = sheetRekap.getRange(2, 1, sheetRekap.getLastRow() - 1, 15).getValues();
      for (let i = 0; i < rowsRekap.length; i++) {
        const rTgl = formatDateIso(rowsRekap[i][2]);
        const nK = String(rowsRekap[i][3] || '').trim();
        const kU = String(rowsRekap[i][1] || '').trim();
        if (!kU && !nK) continue;

        pelayaranList.push({
          timestamp: rowsRekap[i][0] instanceof Date ? Utilities.formatDate(rowsRekap[i][0], TIMEZONE, 'yyyy-MM-dd HH:mm:ss') : String(rowsRekap[i][0] || ''),
          kunci_unik: kU || (nK + '_' + rTgl),
          tanggal: rTgl,
          nama_kapal: rowsRekap[i][3],
          nama_kapal_ongkir: rowsRekap[i][3],
          juragan: rowsRekap[i][4] || '-',
          lokasi_muat: rowsRekap[i][5] || 'DDL',
          jam_berangkat: formatTimeCell(rowsRekap[i][6]),
          waktu_berangkat: formatTimeCell(rowsRekap[i][6]),
          total_tertulis: Number(rowsRekap[i][7]) || 0,
          total_hitung: Number(rowsRekap[i][8]) || 0,
          total_terhitung: Number(rowsRekap[i][8]) || 0,
          selisih: Number(rowsRekap[i][9]) || 0,
          status_selisih: String(rowsRekap[i][10] || 'SESUAI').trim(),
          subtotal_ongkir: Number(rowsRekap[i][11]) || 0,
          subtotal: Number(rowsRekap[i][11]) || 0,
          potongan: Number(rowsRekap[i][12]) || 0,
          total_bersih: Number(rowsRekap[i][13]) || 0,
          resi: String(rowsRekap[i][14] || '1').trim()
        });
      }
    }

    // Rincian Muatan Seluruh Kapal Parengge
    const rincianList = [];
    if (sheetMuatan && sheetMuatan.getLastRow() > 1) {
      const rowsMuatan = sheetMuatan.getRange(2, 1, sheetMuatan.getLastRow() - 1, 8).getValues();
      for (let j = 0; j < rowsMuatan.length; j++) {
        const rKunci = String(rowsMuatan[j][1] || '').trim();
        const rParengge = String(rowsMuatan[j][4] || '').trim();
        const rOngkir = String(rowsMuatan[j][3] || '').trim();
        const rTgl = formatDateIso(rowsMuatan[j][2]);

        if (!rKunci && !rParengge) continue;

        const jml = Math.max(0, Math.floor(Number(rowsMuatan[j][5]) || 0));
        const ongk = Number(rowsMuatan[j][7]) || 0;

        rincianList.push({
          timestamp: rowsMuatan[j][0] instanceof Date ? Utilities.formatDate(rowsMuatan[j][0], TIMEZONE, 'yyyy-MM-dd HH:mm:ss') : String(rowsMuatan[j][0] || ''),
          kunci_unik: rKunci || (rOngkir + '_' + rTgl),
          tanggal: rTgl,
          nama_kapal: rOngkir,
          nama_kapal_ongkir: rOngkir,
          nama_pemilik: rParengge,
          nama_kapal_parengge: rParengge,
          jumlah: jml,
          jumlah_gabus: jml,
          satuan: String(rowsMuatan[j][6] || 'Gabus').trim(),
          ongkir: ongk,
          ongkir_rp: ongk
        });
      }
    }

    // Master Kapal dari Database_Kapal
    const masterOngkir = [];
    const masterParengge = [];
    if (sheetMaster && sheetMaster.getLastRow() > 1) {
      const dataOngkir = sheetMaster.getRange(2, 2, Math.min(sheetMaster.getLastRow() - 1, 37), 1).getValues();
      dataOngkir.forEach(function(row) {
        const val = row[0] ? row[0].toString().trim() : '';
        if (val && masterOngkir.indexOf(val) === -1) masterOngkir.push(val);
      });

      const dataParengge = sheetMaster.getRange(2, 5, Math.min(sheetMaster.getLastRow() - 1, 34), 1).getValues();
      dataParengge.forEach(function(row) {
        const val = row[0] ? row[0].toString().trim() : '';
        if (val && masterParengge.indexOf(val) === -1) masterParengge.push(val);
      });
    }

    if (masterParengge.length === 0) masterParengge.push.apply(masterParengge, DEFAULT_MASTER_PARENGGE);
    if (masterOngkir.length === 0) masterOngkir.push.apply(masterOngkir, DEFAULT_MASTER_ONGKIR);

    return jsonResponse({
      status: 'sukses',
      database: SPREADSHEET_NAME,
      pelayaran: pelayaranList,
      rincian: rincianList,
      master_kapal_ongkir: masterOngkir,
      master_kapal_parengge: masterParengge,
      waktu_baca: getActiveTimestampWIB()
    });

  } catch (err) {
    return jsonResponse({ status: 'error', pesan: err.toString() });
  }
}
