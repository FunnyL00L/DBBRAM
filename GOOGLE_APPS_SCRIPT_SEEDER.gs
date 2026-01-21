
// ==========================================
// SCRIPT UNTUK RESET, SETUP DATABASE & SEEDING DATA
// ==========================================

// 1. Jalankan ini untuk membuat Tabel/Sheet yang belum ada
function setupNewDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. SETUP SHEET SCREENING RESULTS
  setupSheet(ss, 'SCREENING_RESULTS', ['Timestamp', 'Lat', 'Lng', 'LocationName', 'Name', 'Age', 'PregnancyWeek', 'Status', 'RiskFactors', 'Notes']);
  
  // 2. SETUP SHEET TRAFFIC LOGS (Untuk Info Trafik)
  setupSheet(ss, 'TRAFFIC_LOGS', ['Timestamp', 'DateStr', 'Lat', 'Lng', 'UserAgent']);

  // 3. SETUP SHEET SYSTEM CONFIG (Untuk Lock/Unlock System)
  setupSheet(ss, 'SYSTEM_CONFIG', ['Key', 'Value', 'LastUpdated']);
  
  // Set Default System Config (Aktif)
  const configSheet = ss.getSheetByName('SYSTEM_CONFIG');
  if (configSheet.getLastRow() <= 1) {
    configSheet.appendRow(['guest_app_active', '1', new Date()]);
  }
  
  // 4. SETUP SHEET QUESTIONS & ISI DATA DEFAULT
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

  Logger.log("DATABASE BERHASIL DI-SETUP! Semua tabel siap digunakan.");
}

// 2. Jalankan ini untuk mengisi DATA PALSU ke Info Trafik (Untuk Tes Visualisasi Map)
function seedDummyTrafficData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('TRAFFIC_LOGS');
  
  if (!sheet) {
    Logger.log("ERROR: Sheet TRAFFIC_LOGS tidak ditemukan. Jalankan setupNewDatabase() dulu.");
    return;
  }

  // Opsi: Hapus data lama agar bersih (Uncomment jika ingin reset total)
  // if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();

  const dummyData = [];
  const centers = [
    { lat: -8.670458, lng: 115.212629 }, // Denpasar
    { lat: -8.717, lng: 115.174 },       // Kuta
    { lat: -8.506, lng: 115.262 },       // Ubud
    { lat: -8.154, lng: 115.026 },       // Lovina
    { lat: -8.800, lng: 115.160 }        // Nusa Dua
  ];

  // Generate 50 data acak
  for (let i = 0; i < 50; i++) {
    const center = centers[Math.floor(Math.random() * centers.length)];
    // Random spread ~2-3km
    const lat = center.lat + (Math.random() - 0.5) * 0.04;
    const lng = center.lng + (Math.random() - 0.5) * 0.04;
    
    const date = new Date();
    // Random waktu dalam 24 jam terakhir
    date.setHours(date.getHours() - Math.floor(Math.random() * 24));
    
    const dateStr = Utilities.formatDate(date, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
    
    dummyData.push([
      date,
      dateStr,
      lat,
      lng,
      "Mozilla/5.0 (Dummy Test Data)"
    ]);
  }

  sheet.getRange(sheet.getLastRow() + 1, 1, dummyData.length, dummyData[0].length).setValues(dummyData);
  Logger.log("SUKSES: 50 Data Trafik Palsu berhasil ditambahkan ke database.");
}

function setupSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (sheet) {
    // sheet.clear(); // Hapus baris ini agar tidak menghapus data lama saat setup ulang
  } else {
    sheet = ss.insertSheet(name);
  }
  
  // Cek apakah header sudah ada, jika belum tambahkan
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
}
