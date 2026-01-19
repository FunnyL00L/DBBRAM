// INSTRUKSI:
// 1. Buat File Script baru di Google Apps Script Editor.
// 2. Paste kode ini.
// 3. Simpan, lalu Pilih fungsi "seedAllContent" di toolbar atas.
// 4. Klik "Run". (Berikan izin jika diminta).

function seedAllContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. DATA SOP (Standard Operating Procedure)
  const sopData = [
    ['sop_01', 'persiapan', true, 'Tujuan & Batasan Peran', 'Purpose & Role Limits', '', 'Tujuan: Meningkatkan pengetahuan pramuwisata terkait bumil. Pramuwisata BUKAN medis. Tugas: Skrining, edukasi, pantau. DILARANG diagnosa/obat.', 'Purpose: Increase guide knowledge re: pregnant guests. Guides are NOT medics. Duty: Screen, educate, monitor. NO diagnosis/meds.'],
    ['sop_02', 'persiapan', true, 'Definisi Pramuwisata', 'Definition of Tour Guide', '', 'Pramuwisata memandu & berhubungan langsung dengan tamu. Memberikan bimbingan, petunjuk, dan perlindungan tambahan bagi wisatawan.', 'Guides lead & interact directly with guests. Provide guidance, direction, and extra protection for tourists.'],
    ['sop_03', 'persiapan', true, 'Apakah Bumil Boleh Wisata?', 'Can Pregnant Women Tour?', '', 'YA. Wisata fisik bermanfaat. TAPI perhatikan usia kehamilan, kondisi ibu/janin, dan jenis aktivitas.', 'YES. Physical tourism is beneficial. BUT consider pregnancy age, condition, and activity type.'],
    ['sop_04', 'persiapan', true, 'Aturan Usia Kehamilan', 'Pregnancy Age Rules', '', 'AMAN: 4-6 Bulan. HINDARI: 1-3 Bulan (Rentan Keguguran/Mual) dan 7-9 Bulan (Ketidaknyamanan/Sering Kencing).', 'SAFE: 4-6 Months. AVOID: 1-3 Months (Miscarriage Risk) and 7-9 Months (Discomfort/Freq Urination).'],
    ['sop_05', 'kuliner', true, 'Aktivitas Dianjurkan', 'Recommended Activities', '', '1. Jalan santai di area rata. 2. Duduk menikmati pemandangan (teduh). 3. Kuliner matang & higienis.', '1. Relaxing walk on flat areas. 2. Sitting with view (shade). 3. Cooked & hygienic culinary.'],
    ['sop_06', 'snorkeling', true, 'Aktivitas Terbatas', 'Limited Activities', '', 'Renang ringan / Surface Snorkeling. SYARAT: Skrining Aman, Laut Tenang, Ada Pelampung, Ada Pemandu. STOP jika sesak/pusing.', 'Light swim / Surface Snorkeling. CONDITION: Safe Screening, Calm Sea, Life Jacket, Guide present. STOP if dizzy.'],
    ['sop_07', 'boat', false, 'Aktivitas DILARANG', 'Prohibited Activities', '', '1. Scuba Diving (Bahaya dekompresi). 2. Jet Ski/Banana Boat (Benturan). 3. Renang saat ombak besar.', '1. Scuba Diving (Decompression risk). 2. Jet Ski/Banana Boat (Impact). 3. Swimming in rough waves.']
  ];
  updateSheet(ss, 'SOP_DATA', sopData);

  // 2. DATA QUESTIONS (Screening Logic)
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

  // 3. DATA TIPS (Info Tambahan)
  const tipsData = [
    ['t1', 'Pendampingan', 'Companionship', 'Ibu hamil harus selalu didampingi oleh keluarga dan pemandu.', 'Must always be accompanied by family and guide.', ''],
    ['t2', 'Pelampung', 'Life Jacket', 'Wajib menggunakan pelampung ukuran pas di perahu/air.', 'Must wear fitted life jacket on boat/water.', ''],
    ['t3', 'Hidrasi', 'Hydration', 'Minum air cukup & istirahat di tempat teduh.', 'Drink enough water & rest in shade.', ''],
    ['t4', 'Sunscreen', 'Sunscreen', 'Gunakan Sunscreen SPF30+ dan topi.', 'Use Sunscreen SPF30+ and hat.', ''],
    ['t5', 'Posisi Duduk', 'Seating', 'Duduk di KURSI TENGAH perahu untuk minimalkan guncangan.', 'Sit in MIDDLE seats to minimize shock.', '']
  ];
  updateSheet(ss, 'TIPS_DATA', tipsData);
  
  // 4. DATA MEDIS (Kosongkan dulu atau isi sample)
  const medisData = [
    ['m1', 'Tanda Bahaya', 'Danger Signs', 'Perdarahan, Ketuban pecah, Nyeri Hebat. STOP & Rujuk ke Faskes.', 'Bleeding, Water break, Severe Pain. STOP & Refer to Hospital.', '', 'image']
  ];
  updateSheet(ss, 'MEDIS_DATA', medisData);

  Logger.log("DATABASE SEEDED SUCCESSFULLY!");
}

function updateSheet(ss, sheetName, data) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Clear old data (keep header if exists, assume row 1 is header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
  }

  // Write new data
  if (data.length > 0) {
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
  }
}