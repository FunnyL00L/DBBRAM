
import { ScreeningQuestion } from '../types';

export const TEMPLATE_DATA = {
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
