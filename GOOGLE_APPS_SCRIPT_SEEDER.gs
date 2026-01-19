
// INSTRUKSI:
// 1. Buat File Script baru di Google Apps Script Editor.
// 2. Paste kode ini.
// 3. Simpan, lalu Pilih fungsi "seedAllContent" di toolbar atas.
// 4. Klik "Run".

function seedAllContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. DATA SOP (SOP Updated with Subtitles/Keterangan)
  const sopData = [
    [
      'sop_01', 'persiapan', true, 
      'Peran & Batasan', 'Role & Limits', 
      'Tanggung Jawab Guide', 'Guide Responsibility',
      '', 
      'Pramuwisata BUKAN tenaga medis. Tugas utama: Skrining, edukasi keselamatan, dan pemantauan kondisi tamu.', 
      'Guides are NOT medical personnel. Main duty: Screening, safety education, and monitoring guest condition.'
    ],
    [
      'sop_02', 'persiapan', true, 
      'Aturan Trimester', 'Trimester Rules',
      'Waktu Aman Wisata', 'Safe Travel Time',
      '', 
      'Usia kehamilan paling aman adalah 14-28 Minggu (Trimester 2). Hindari wisata berat di Trimester 1 (risiko mual/keguguran) dan Trimester 3 (risiko prematur).', 
      'Safest pregnancy age is 14-28 Weeks (2nd Trimester). Avoid heavy tours in 1st Trimester (nausea/miscarriage risk) and 3rd Trimester (premature risk).'
    ],
    [
      'sop_03', 'boat', false, 
      'Larangan Keras', 'Strict Prohibition',
      'Aktivitas Berisiko Tinggi', 'High Risk Activities',
      '', 
      'Dilarang melakukan Scuba Diving, menaiki Speedboat kecepatan tinggi (bouncing), dan berenang saat arus kuat.', 
      'No Scuba Diving, high-speed Speedboat rides (bouncing), and swimming during strong currents.'
    ]
  ];
  updateSheet(ss, 'SOP_DATA', sopData);

  // 2. DATA TIPS (10 ICON CATEGORIES)
  // Icon keys: 'hydration', 'sun', 'food', 'medicine', 'companion', 'rest', 'clothing', 'float', 'seat', 'emergency'
  const tipsData = [
    ['t1', 'Hidrasi', 'Hydration', 'Minum air minimal 2 liter per hari untuk mencegah dehidrasi.', 'Drink at least 2 liters of water daily to prevent dehydration.', 'hydration'],
    ['t2', 'Perlindungan Matahari', 'Sun Protection', 'Gunakan topi lebar dan tabir surya SPF 30+.', 'Use wide hats and SPF 30+ sunscreen.', 'sun'],
    ['t3', 'Makanan Higienis', 'Hygienic Food', 'Pastikan makanan matang sempurna. Hindari makanan mentah/salad.', 'Ensure food is fully cooked. Avoid raw food/salads.', 'food'],
    ['t4', 'Obat Pribadi', 'Personal Meds', 'Bawa vitamin kehamilan dan obat anti-mual dari dokter.', 'Bring pregnancy vitamins and anti-nausea meds from doctor.', 'medicine'],
    ['t5', 'Pendamping', 'Companion', 'Jangan biarkan ibu hamil sendirian. Suami/keluarga wajib mendampingi.', 'Never leave pregnant women alone. Husband/family must accompany.', 'companion'],
    ['t6', 'Istirahat Cukup', 'Enough Rest', 'Jangan memaksakan diri. Istirahat tiap 30 menit aktivitas.', 'Do not push yourself. Rest every 30 mins of activity.', 'rest'],
    ['t7', 'Pakaian Nyaman', 'Comfy Clothes', 'Pakai baju longgar berbahan katun dan alas kaki anti-selip.', 'Wear loose cotton clothes and non-slip footwear.', 'clothing'],
    ['t8', 'Pelampung', 'Life Jacket', 'Wajib pakai pelampung ukuran pas saat naik perahu.', 'Must wear fitted life jacket when on boat.', 'float'],
    ['t9', 'Posisi Duduk', 'Seating', 'Pilih tempat duduk di tengah perahu (minim guncangan).', 'Choose seats in the middle of the boat (min shock).', 'seat'],
    ['t10', 'Kontak Darurat', 'Emergency Contact', 'Simpan nomor RS terdekat dan kabari guide jika ada keluhan.', 'Save nearest hospital number and alert guide if issues arise.', 'emergency']
  ];
  updateSheet(ss, 'TIPS_DATA', tipsData);
  
  // 3. DATA MEDIS (LIST FORMAT - NEWLINE SEPARATED)
  const medisData = [
    [
      'm1', 
      'Tanda Bahaya Fisik', 'Physical Danger Signs',
      'Perdarahan dari jalan lahir (flek/darah segar)\nKeluar air ketuban (pecah ketuban)\nNyeri perut bawah yang hebat\nKontraksi yang teratur', 
      'Bleeding from birth canal\nLeaking amniotic fluid\nSevere lower abdominal pain\nRegular contractions', 
      '', 'image'
    ],
    [
      'm2', 
      'Gejala Umum', 'General Symptoms',
      'Pusing hebat yang tidak hilang\nPandangan mata kabur\nMuntah terus menerus (tidak bisa makan)\nDemam tinggi', 
      'Severe dizziness that persists\nBlurred vision\nContinuous vomiting (cannot eat)\nHigh fever', 
      '', 'image'
    ]
  ];
  updateSheet(ss, 'MEDIS_DATA', medisData);

  // 4. QUESTIONS (Standard)
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

  Logger.log("DATABASE SEEDED SUCCESSFULLY WITH NEW STRUCTURE!");
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
