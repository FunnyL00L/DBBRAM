
// ==========================================
// SCRIPT UNTUK RESET & SETUP DATABASE BARU
// ==========================================

function setupNewDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. SETUP SHEET SCREENING RESULTS (Header Baru: Lokasi di depan)
  setupSheet(ss, 'SCREENING_RESULTS', ['Timestamp', 'Lat', 'Lng', 'LocationName', 'Name', 'Age', 'PregnancyWeek', 'Status', 'RiskFactors', 'Notes']);
  
  // 2. SETUP SHEET QUESTIONS & ISI DATA DEFAULT
  setupSheet(ss, 'SCREENING_QUESTIONS', ['id', 'index', 'text_id', 'text_en', 'type', 'safe_answer']);
  
  const defaultQuestions = [
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
  
  const qSheet = ss.getSheetByName('SCREENING_QUESTIONS');
  if (qSheet.getLastRow() <= 1) {
    qSheet.getRange(2, 1, defaultQuestions.length, defaultQuestions[0].length).setValues(defaultQuestions);
  }

  Logger.log("DATABASE BERHASIL DI-SETUP! Siap digunakan.");
}

function setupSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (sheet) {
    sheet.clear(); // Hapus data lama jika ada
  } else {
    sheet = ss.insertSheet(name);
  }
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
}
