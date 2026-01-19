
// INSTRUKSI:
// 1. Buat File Script baru di Google Apps Script Editor.
// 2. Paste kode ini.
// 3. Simpan, lalu Pilih fungsi "seedAllContent" di toolbar atas.
// 4. Klik "Run".

function seedAllContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. DATA QUESTIONS (Standard)
  const questionData = [
    ['q1', 1, 'Apakah usia kehamilannya 4-6 bulan?', 'Is pregnancy 4-6 months?', 'CORE', 'YES'],
    ['q2', 2, 'Apakah ibu merasa sehat dan siap berwisata?', 'Feel healthy & ready?', 'CORE', 'YES'],
    ['q3', 3, 'Apakah bayi dalam kandungan bergerak secara teratur?', 'Baby moving regularly?', 'CORE', 'YES'],
    ['q4', 4, 'Apakah sudah konsultasi dokter/bidan untuk aktivitas ini?', 'Consulted doctor?', 'CORE', 'YES'],
    ['q5', 5, 'Apakah perut terasa mulas, kencang secara teratur?', 'Regular contractions?', 'RISK', 'NO'],
    ['q6', 6, 'Apakah mengalami perdarahan, keluar air, nyeri hebat?', 'Bleeding/Pain/Fluids?', 'RISK', 'NO'],
    ['q7', 7, 'Apakah ada riwayat tekanan darah tinggi?', 'High blood pressure?', 'RISK', 'NO'],
    ['q8', 8, 'Apakah mengalami mual muntah berat?', 'Severe nausea?', 'RISK', 'NO'],
    ['q9', 9, 'Apakah merasa pusing hebat, ingin pingsan, sesak?', 'Dizzy/Faint/Breathless?', 'RISK', 'NO'],
    ['q10', 10, 'Apakah ada penyakit lain yang dilarang dokter?', 'Other prohibited conditions?', 'RISK', 'NO']
  ];
  updateSheet(ss, 'SCREENING_QUESTIONS', questionData);

  Logger.log("DATABASE SEEDED SUCCESSFULLY WITH NEW STRUCTURE (LOGIC ONLY)!");
}

function updateSheet(ss, sheetName, data) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
  }

  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  }
}
