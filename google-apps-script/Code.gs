/**
 * ===================================================================
 * PARENGGEKITA — GOOGLE APPS SCRIPT BACKEND WEBHOOK (DATABASE MANIFES)
 * ===================================================================
 * Spreadsheet ID: 1w4StmnR78nlq3zRmjXnGJ559EGK3ZqF_X5KeqIQSMeo
 * 
 * Tab 1: "Rekap_Ongkir" (sheetId: 0)
 *   Kolom A: Timestamp
 *   Kolom B: Kunci Unik (Primary Key)
 *   Kolom C: Tanggal (yyyy-mm-dd)
 *   Kolom D: Nama Kapal Ongkir
 *   Kolom E: Juragan
 *   Kolom F: Lokasi Muat
 *   Kolom G: Waktu Berangkat
 *   Kolom H: Total Tertulis
 *   Kolom I: Total Terhitung
 *   Kolom J: Selisih
 *   Kolom K: Status Selisih
 *   Kolom L: Subtotal Ongkir
 *   Kolom M: Potongan
 *   Kolom N: Total Bersih
 *   Kolom O: Resi
 * 
 * Tab 2: "Rincian_Muatan" (sheetId: 1001)
 *   Kolom A: Timestamp
 *   Kolom B: Kunci Unik (Foreign Key ke Rekap_Ongkir)
 *   Kolom C: Tanggal (yyyy-mm-dd)
 *   Kolom D: Nama Kapal Ongkir
 *   Kolom E: Nama Kapal Parengge
 *   Kolom F: Jumlah (Gabus)
 *   Kolom G: Satuan
 *   Kolom H: Ongkir (Rp)
 * 
 * Tab 3: "Database_Kapal" (sheetId: 2001)
 *   Kolom A-B: No, Nama Kapal Ongkir (37 Kapal)
 *   Kolom C: Pemisah
 *   Kolom D-E: No, Nama Kapal Parengge (34 Kapal)
 * ===================================================================
 */

var SPREADSHEET_ID = "1w4StmnR78nlq3zRmjXnGJ559EGK3ZqF_X5KeqIQSMeo";
var TIMEZONE = "Asia/Makassar";

function getSpreadsheet() {
  try {
    var active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (_) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function findSheet(ss, targetSheetId, nameKeywords) {
  var sheets = ss.getSheets();
  // 1. Prioritas: Cek berdasarkan sheetId jika cocok
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === targetSheetId) return sheets[i];
  }
  // 2. Cek berdasarkan nama (case-insensitive & fleksibel spasi/underscore)
  for (var j = 0; j < sheets.length; j++) {
    var sName = sheets[j].getName().toLowerCase().replace(/[\s_\-]+/g, "");
    for (var k = 0; k < nameKeywords.length; k++) {
      var pat = nameKeywords[k].toLowerCase().replace(/[\s_\-]+/g, "");
      if (sName === pat || sName.indexOf(pat) !== -1) {
        return sheets[j];
      }
    }
  }
  return null;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function formatDateIso(val) {
  if (!val && val !== 0) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, TIMEZONE, "yyyy-MM-dd");
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.substring(0, 10);
  }
  var dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmy) {
    var d = ("0" + dmy[1]).slice(-2);
    var m = ("0" + dmy[2]).slice(-2);
    var y = dmy[3];
    return y + "-" + m + "-" + d;
  }
  return s;
}

function formatTimeString(val) {
  if (!val && val !== 0) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, TIMEZONE, "HH:mm:ss");
  }
  return String(val).trim();
}

/**
 * ===================================================================
 * doGet: MEMBACA DATA MANIFES & MASTER KAPAL
 * ===================================================================
 */
function doGet(e) {
  try {
    var ss = getSpreadsheet();
    
    // 1. Baca Tab Rekap_Ongkir (sheetId: 0 atau nama yang cocok)
    var sheetRekap = findSheet(ss, 0, ["Rekap_Ongkir", "RekapOngkir", "Rekap"]) || ss.getSheets()[0];

    var pelayaran = [];
    if (sheetRekap && sheetRekap.getLastRow() >= 2) {
      var dataRekap = sheetRekap.getRange(2, 1, sheetRekap.getLastRow() - 1, 15).getValues();
      for (var i = 0; i < dataRekap.length; i++) {
        var row = dataRekap[i];
        var kunci = String(row[1] || "").trim();
        var namaKapal = String(row[3] || "").trim();
        var tgl = formatDateIso(row[2]);

        if (!kunci && !namaKapal) continue;
        if (!kunci) {
          kunci = namaKapal + "_" + tgl;
        }

        var tertulis = Number(row[7]) || 0;
        var terhitung = Number(row[8]) || 0;
        var selisih = Number(row[9]) || (tertulis - terhitung);
        var statusSelisih = String(row[10] || "").trim();
        if (!statusSelisih) {
          statusSelisih = (selisih === 0) ? "SESUAI" : "SELISIH";
        }

        pelayaran.push({
          timestamp: row[0] instanceof Date ? Utilities.formatDate(row[0], TIMEZONE, "yyyy-MM-dd HH:mm:ss") : String(row[0] || ""),
          kunci_unik: kunci,
          tanggal: tgl,
          nama_kapal_ongkir: namaKapal,
          nama_kapal: namaKapal,
          juragan: String(row[4] || "").trim(),
          lokasi_muat: String(row[5] || "DDL").trim(),
          waktu_berangkat: formatTimeString(row[6]),
          total_tertulis: tertulis,
          total_terhitung: terhitung,
          total_hitung: terhitung,
          selisih: selisih,
          status_selisih: statusSelisih,
          subtotal_ongkir: Number(row[11]) || 0,
          subtotal: Number(row[11]) || 0,
          potongan: Number(row[12]) || 0,
          total_bersih: Number(row[13]) || 0,
          resi: String(row[14] || "1").trim()
        });
      }
    }

    // 2. Baca Tab Rincian_Muatan (sheetId: 1001 atau nama yang cocok)
    var sheetRincian = findSheet(ss, 1001, ["Rincian_Muatan", "RincianMuatan", "Rincian"]) || (ss.getSheets().length > 1 ? ss.getSheets()[1] : null);

    var rincian = [];
    if (sheetRincian && sheetRincian.getLastRow() >= 2) {
      var maxCols = Math.max(sheetRincian.getLastColumn(), 8);
      var dataRincian = sheetRincian.getRange(2, 1, sheetRincian.getLastRow() - 1, maxCols).getValues();
      for (var j = 0; j < dataRincian.length; j++) {
        var rRow = dataRincian[j];
        var rKunci = String(rRow[1] || "").trim();
        var rNamaParengge = String(rRow[4] || "").trim();
        var rNamaOngkir = String(rRow[3] || "").trim();
        var rTgl = formatDateIso(rRow[2]);

        if (!rKunci && !rNamaParengge) continue;
        if (!rKunci) {
          rKunci = rNamaOngkir + "_" + rTgl;
        }

        var jml = Math.max(0, Math.floor(Number(rRow[5]) || 0));
        var ongk = Number(rRow[7]) || 0;

        rincian.push({
          timestamp: rRow[0] instanceof Date ? Utilities.formatDate(rRow[0], TIMEZONE, "yyyy-MM-dd HH:mm:ss") : String(rRow[0] || ""),
          kunci_unik: rKunci,
          tanggal: rTgl,
          nama_kapal_ongkir: rNamaOngkir,
          nama_kapal: rNamaOngkir,
          nama_kapal_parengge: rNamaParengge,
          nama_pemilik: rNamaParengge,
          jumlah_gabus: jml,
          jumlah: jml,
          satuan: String(rRow[6] || "Gabus").trim(),
          ongkir_rp: ongk,
          ongkir: ongk
        });
      }
    }

    // 3. Baca Tab Database_Kapal (sheetId: 2001 atau nama yang cocok)
    var masterOngkir = [];
    var masterParengge = [];
    var sheetMaster = findSheet(ss, 2001, ["Database_Kapal", "DatabaseKapal", "MasterKapal", "Database", "Kapal"]);
    if (sheetMaster && sheetMaster.getLastRow() >= 2) {
      var allMaster = sheetMaster.getDataRange().getValues();
      var colOngkirIdx = 1;   // Default: B (indeks 1)
      var colParenggeIdx = 4; // Default: E (indeks 4)

      if (allMaster.length > 0) {
        var hRow = allMaster[0];
        for (var h = 0; h < hRow.length; h++) {
          var hTxt = String(hRow[h] || "").toLowerCase();
          if (hTxt.indexOf("ongkir") !== -1) colOngkirIdx = h;
          if (hTxt.indexOf("parengge") !== -1) colParenggeIdx = h;
        }
      }

      for (var rowIdx = 1; rowIdx < allMaster.length; rowIdx++) {
        var rItem = allMaster[rowIdx];
        if (rItem.length > colOngkirIdx) {
          var nO = String(rItem[colOngkirIdx] || "").trim();
          if (nO && isNaN(Number(nO)) && masterOngkir.indexOf(nO) === -1) {
            masterOngkir.push(nO);
          }
        }
        if (rItem.length > colParenggeIdx) {
          var nP = String(rItem[colParenggeIdx] || "").trim();
          if (nP && isNaN(Number(nP)) && masterParengge.indexOf(nP) === -1) {
            masterParengge.push(nP);
          }
        }
      }
    }

    return jsonResponse({
      status: "sukses",
      pelayaran: pelayaran,
      rincian: rincian,
      master_kapal_ongkir: masterOngkir,
      master_kapal_parengge: masterParengge,
      waktu_baca: Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss")
    });

  } catch (err) {
    return jsonResponse({
      status: "gagal",
      pesan: "Gagal membaca database: " + err.message
    });
  }
}

/**
 * ===================================================================
 * doPost: MENYIMPAN / MEMPERBARUI NOTA & RINCIAN MUATAN
 * ===================================================================
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Kunci eksekusi max 15 detik untuk mencegah tabrakan data (race condition)
    lock.waitLock(15000);

    var contents = e.postData.contents;
    var payload = JSON.parse(contents);

    if (payload.aksi !== "SIMPAN_NOTA") {
      return jsonResponse({ status: "gagal", pesan: "Aksi tidak dikenali: " + payload.aksi });
    }

    var ss = getSpreadsheet();
    var sheetRekap = findSheet(ss, 0, ["Rekap_Ongkir", "RekapOngkir", "Rekap"]) || ss.getSheets()[0];
    var sheetRincian = findSheet(ss, 1001, ["Rincian_Muatan", "RincianMuatan", "Rincian"]) || (ss.getSheets().length > 1 ? ss.getSheets()[1] : null);

    var nowStr = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    var kunci = String(payload.kunci_unik || "").trim();
    var tanggal = formatDateIso(payload.tanggal);
    var namaKapal = String(payload.nama_kapal_ongkir || payload.nama_kapal || "").trim();
    var juragan = String(payload.juragan || "").trim();
    var lokasi = String(payload.lokasi_muat || "DDL").trim();
    var waktuBerangkat = formatTimeString(payload.waktu_berangkat || "");
    var resi = String(payload.resi || "1").trim();

    var items = Array.isArray(payload.items) ? payload.items : [];

    // Hitung total gabus fisik terhitung dari items
    var totalTerhitung = 0;
    var subtotalOngkir = 0;
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      var gbs = Math.max(0, Math.floor(Number(it.jumlah_gabus !== undefined ? it.jumlah_gabus : it.gabus) || 0));
      var ongk = Number(it.ongkir_rp !== undefined ? it.ongkir_rp : it.ongkir) || 0;
      totalTerhitung += gbs;
      subtotalOngkir += ongk;
    }

    var totalTertulis = Number(payload.total_tertulis) || 0;
    var selisih = totalTertulis > 0 ? (totalTertulis - totalTerhitung) : (Number(payload.selisih) || 0);
    var statusSelisih = totalTertulis > 0 ? (selisih === 0 ? "SESUAI" : "SELISIH") : String(payload.status_selisih || "SESUAI").trim();

    var subtotal = Number(payload.subtotal_ongkir !== undefined ? payload.subtotal_ongkir : payload.subtotal) || subtotalOngkir;
    var potongan = Number(payload.potongan) || 0;
    var totalBersih = Number(payload.total_bersih) || Math.max(0, subtotal - potongan);

    // 1. Simpan / Perbarui Tab Rekap_Ongkir
    var rekapRowIndex = -1;
    var lastRekapRow = sheetRekap.getLastRow();

    if (lastRekapRow >= 2) {
      var colKunciRekap = sheetRekap.getRange(2, 2, lastRekapRow - 1, 1).getValues();
      for (var r = 0; r < colKunciRekap.length; r++) {
        var existingKunci = String(colKunciRekap[r][0] || "").trim();
        if (existingKunci && existingKunci.toLowerCase() === kunci.toLowerCase()) {
          rekapRowIndex = r + 2; // baris aktual (1-based)
          break;
        }
      }
    }

    var rowRekapValues = [
      nowStr,           // A: Timestamp
      kunci,            // B: Kunci Unik
      tanggal,          // C: Tanggal
      namaKapal,        // D: Nama Kapal Ongkir
      juragan,          // E: Juragan
      lokasi,           // F: Lokasi Muat
      waktuBerangkat,   // G: Waktu Berangkat
      totalTertulis,    // H: Total Tertulis
      totalTerhitung,   // I: Total Terhitung
      selisih,          // J: Selisih
      statusSelisih,    // K: Status Selisih
      subtotal,         // L: Subtotal Ongkir
      potongan,         // M: Potongan
      totalBersih,      // N: Total Bersih
      resi              // O: Resi
    ];

    if (rekapRowIndex > 0) {
      sheetRekap.getRange(rekapRowIndex, 1, 1, 15).setValues([rowRekapValues]);
    } else {
      sheetRekap.appendRow(rowRekapValues);
    }

    // 2. Simpan / Perbarui Tab Rincian_Muatan
    // Hapus baris lama milik kunci_unik ini dari bawah ke atas agar indeks tidak geser
    var lastRincianRow = sheetRincian.getLastRow();
    if (lastRincianRow >= 2) {
      var colKunciRincian = sheetRincian.getRange(2, 2, lastRincianRow - 1, 1).getValues();
      for (var d = colKunciRincian.length - 1; d >= 0; d--) {
        var curKunci = String(colKunciRincian[d][0] || "").trim();
        if (curKunci && curKunci.toLowerCase() === kunci.toLowerCase()) {
          sheetRincian.deleteRow(d + 2);
        }
      }
    }

    // Tambahkan item-item rincian baru
    if (items.length > 0) {
      var newRincianRows = [];
      for (var m = 0; m < items.length; m++) {
        var itm = items[m];
        var parenggeName = String(itm.nama_kapal_parengge || itm.nama_pemilik || itm.nama || "Tanpa Nama").trim();
        var gabusJml = Math.max(0, Math.floor(Number(itm.jumlah_gabus !== undefined ? itm.jumlah_gabus : itm.gabus) || 0));
        var ongkirVal = Number(itm.ongkir_rp !== undefined ? itm.ongkir_rp : itm.ongkir) || 0;

        newRincianRows.push([
          nowStr,        // A: Timestamp
          kunci,         // B: Kunci Unik
          tanggal,       // C: Tanggal
          namaKapal,     // D: Nama Kapal Ongkir
          parenggeName,  // E: Nama Kapal Parengge
          gabusJml,      // F: Jumlah (Gabus)
          "Gabus",       // G: Satuan
          ongkirVal      // H: Ongkir (Rp)
        ]);
      }

      if (newRincianRows.length > 0) {
        var startAppendRow = sheetRincian.getLastRow() + 1;
        sheetRincian.getRange(startAppendRow, 1, newRincianRows.length, 8).setValues(newRincianRows);
      }
    }

    return jsonResponse({
      status: "sukses",
      pesan: "Data nota & rincian berhasil disimpan ke Google Sheets.",
      kunci_unik: kunci,
      total_items: items.length
    });

  } catch (postErr) {
    return jsonResponse({
      status: "gagal",
      pesan: "Gagal menyimpan data: " + postErr.message
    });
  } finally {
    lock.releaseLock();
  }
}
