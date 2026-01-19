import { SopItem, MedisItem, TipsItem, ScreeningQuestion } from '../types';

export const TEMPLATE_DATA = {
  SOP: [
    {
      id: 'sop_role_01',
      category: 'persiapan',
      safe: true,
      title_id: 'Peran & Batasan Pramuwisata',
      title_en: 'Role & Limitations of Tour Guides',
      description_id: 'Pramuwisata BUKAN tenaga medis. Tugas: Skrining singkat, edukasi keselamatan, pemantauan. DILARANG memberikan diagnosis/obat. RUJUK bila ada tanda bahaya.',
      description_en: 'Guides are NOT medical personnel. Duty: Brief screening, safety education, monitoring. DO NOT diagnose/medicate. REFER if danger signs appear.',
      image_url: ''
    },
    {
      id: 'sop_trimester_02',
      category: 'persiapan',
      safe: true,
      title_id: 'Aturan Usia Kehamilan (Trimester)',
      title_en: 'Pregnancy Age Rules (Trimester)',
      description_id: 'AMAN: 4-6 Bulan. HINDARI: 1-3 Bulan (Risiko keguguran/mual) dan 7-9 Bulan (Risiko prematur/ketidaknyamanan fisik).',
      description_en: 'SAFE: 4-6 Months. AVOID: 1-3 Months (Miscarriage risk/nausea) and 7-9 Months (Premature risk/discomfort).',
      image_url: ''
    },
    {
      id: 'sop_act_safe_03',
      category: 'kuliner',
      safe: true,
      title_id: 'Aktivitas Dianjurkan (Risiko Rendah)',
      title_en: 'Recommended Activities (Low Risk)',
      description_id: '1. Jalan santai di area rata. 2. Duduk menikmati pemandangan (teduh & terhidrasi). 3. Wisata kuliner matang & higienis.',
      description_en: '1. Relaxing walk on flat areas. 2. Sitting/viewing (shade & hydrated). 3. Hygienic & cooked culinary tours.',
      image_url: ''
    },
    {
      id: 'sop_act_limited_04',
      category: 'snorkeling',
      safe: true,
      title_id: 'Aktivitas Terbatas (Dengan Syarat)',
      title_en: 'Limited Activities (Conditional)',
      description_id: 'Berenang ringan/Surface Snorkeling. SYARAT: Skrining "Aman", Laut Tenang, Ada Pelampung, Pengawasan Ketat. STOP jika sesak/pusing.',
      description_en: 'Light swimming/Surface Snorkeling. CONDITIONS: "Safe" screening, Calm Sea, Life Jacket, Strict Supervision. STOP if breathless/dizzy.',
      image_url: ''
    },
    {
      id: 'sop_act_banned_05',
      category: 'boat',
      safe: false,
      title_id: 'Aktivitas DILARANG (Zona Merah)',
      title_en: 'PROHIBITED Activities (Red Zone)',
      description_id: '1. Scuba Diving (Bahaya dekompresi janin). 2. Jet Ski/Banana Boat (Benturan/Kecepatan tinggi). 3. Berenang saat ombak besar/arus kuat.',
      description_en: '1. Scuba Diving (Fetal decompression risk). 2. Jet Ski/Banana Boat (Impact/High speed). 3. Swimming in rough waves/strong currents.',
      image_url: ''
    }
  ] as SopItem[],

  MEDIS: [
    {
      id: 'medis_emergency_01',
      title_id: 'Tanda Bahaya (Segera Rujuk)',
      title_en: 'Danger Signs (Refer Immediately)',
      action_id: 'Perdarahan, Keluar air ketuban, Nyeri perut hebat, Pusing hebat/Pingsan, Sesak napas. STOP aktivitas & bawa ke Fasilitas Kesehatan.',
      action_en: 'Bleeding, Water break, Severe abdominal pain, Severe dizziness/Fainting, Breathlessness. STOP activity & take to Health Facility.',
      media_url: '',
      type: 'image'
    }
  ] as MedisItem[],

  TIPS: [
    {
      id: 'tips_01',
      title_id: 'Pendampingan',
      title_en: 'Companionship',
      content_id: 'Ibu hamil harus selalu didampingi oleh keluarga dan pemandu wisata selama aktivitas.',
      content_en: 'Pregnant women must always be accompanied by family and tour guides during activities.',
      icon: ''
    },
    {
      id: 'tips_02',
      title_id: 'Pelampung (Life Jacket)',
      title_en: 'Life Jacket',
      content_id: 'Wajib menggunakan pelampung dengan ukuran pas ketika berada di perahu atau dekat air.',
      content_en: 'Must wear a properly fitted life jacket when on a boat or near water.',
      icon: ''
    },
    {
      id: 'tips_03',
      title_id: 'Hidrasi & Istirahat',
      title_en: 'Hydration & Rest',
      content_id: 'Minum air yang cukup untuk cegah dehidrasi dan sering beristirahat di tempat teduh.',
      content_en: 'Drink enough water to prevent dehydration and take frequent breaks in the shade.',
      icon: ''
    },
    {
      id: 'tips_04',
      title_id: 'Perlindungan Matahari',
      title_en: 'Sun Protection',
      content_id: 'Gunakan tabir surya (Sunscreen) minimal SPF 30+ dan topi.',
      content_en: 'Use sunscreen (min SPF 30+) and a hat.',
      icon: ''
    },
    {
      id: 'tips_05',
      title_id: 'Posisi Duduk di Boat',
      title_en: 'Boat Seating Position',
      content_id: 'Minta ibu hamil duduk di kursi BAGIAN TENGAH perahu untuk meminimalkan guncangan.',
      content_en: 'Ask pregnant women to sit in the MIDDLE section of the boat to minimize shocks.',
      icon: ''
    }
  ] as TipsItem[],

  QUESTIONS: [
    { id: 'q1', index: 1, text_id: 'Apakah usia kehamilannya 4-6 bulan?', text_en: 'Is the pregnancy between 4-6 months?', type: 'CORE', safe_answer: 'YES' },
    { id: 'q2', index: 2, text_id: 'Apakah ibu merasa sehat dan siap berwisata?', text_en: 'Do you feel healthy and ready for tourism?', type: 'CORE', safe_answer: 'YES' },
    { id: 'q3', index: 3, text_id: 'Apakah bayi dalam kandungan bergerak secara teratur?', text_en: 'Is the baby moving regularly?', type: 'CORE', safe_answer: 'YES' },
    { id: 'q4', index: 4, text_id: 'Apakah sudah konsultasi dokter/bidan untuk aktivitas ini?', text_en: 'Have you consulted a doctor/midwife for this activity?', type: 'CORE', safe_answer: 'YES' },
    { id: 'q5', index: 5, text_id: 'Apakah perut terasa mulas/kencang teratur?', text_en: 'Do you feel regular contractions/tightness?', type: 'RISK', safe_answer: 'NO' },
    { id: 'q6', index: 6, text_id: 'Apakah mengalami perdarahan/keluar air/nyeri hebat?', text_en: 'Any bleeding/fluid leakage/severe pain?', type: 'RISK', safe_answer: 'NO' },
    { id: 'q7', index: 7, text_id: 'Apakah ada riwayat tekanan darah tinggi?', text_en: 'History of high blood pressure?', type: 'RISK', safe_answer: 'NO' },
    { id: 'q8', index: 8, text_id: 'Apakah mengalami mual muntah berat?', text_en: 'Experiencing severe nausea/vomiting?', type: 'RISK', safe_answer: 'NO' },
    { id: 'q9', index: 9, text_id: 'Apakah merasa pusing hebat/ingin pingsan/sesak?', text_en: 'Feeling severe dizziness/faint/breathless?', type: 'RISK', safe_answer: 'NO' },
    { id: 'q10', index: 10, text_id: 'Apakah ada penyakit lain yang dilarang dokter?', text_en: 'Any other medical conditions prohibited by doctor?', type: 'RISK', safe_answer: 'NO' }
  ] as ScreeningQuestion[]
};