
export interface ScreeningResult {
  timestamp: string;
  name: string;
  age: number;
  pregnancyWeeks: number;
  status: 'ZONA HIJAU' | 'ZONA KUNING' | 'ZONA MERAH' | 'AMAN' | 'BAHAYA'; // Backward compatibility
  riskFactors: string;
  notes: string;
}

export interface SopItem {
  id: string;
  category: string; // 'persiapan', 'boat', 'lumba', 'snorkeling'
  safe: boolean; // TRUE = Aman, FALSE = Bahaya
  title_id: string;
  title_en: string;
  image_url: string;
  description_id: string;
  description_en: string;
}

export interface MedisItem {
  id: string;
  title_id: string;
  title_en: string;
  action_id: string;
  action_en: string;
  media_url: string;
  type: 'image' | 'video';
}

export interface TipsItem {
  id: string;
  title_id: string;
  title_en: string;
  content_id: string;
  content_en: string;
  icon: string;
}

export interface ScreeningQuestion {
  id: string;
  index: number; // Urutan tampilan
  text_id: string;
  text_en: string;
  type: 'CORE' | 'RISK'; // CORE = Syarat Dasar (Logic 1-4), RISK = Gejala Bahaya (Logic 5-10)
  safe_answer: 'YES' | 'NO'; // Jawaban yang dianggap AMAN
}

export interface DashboardData {
  screening: ScreeningResult[];
  sop: SopItem[];
  medis: MedisItem[];
  tips: TipsItem[];
  questions: ScreeningQuestion[];
  analytics?: {
    totalViews: number;
  };
}
