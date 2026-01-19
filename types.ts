
export interface ScreeningResult {
  timestamp: string;
  name: string;
  age: number;
  pregnancyWeeks: number;
  status: 'ZONA HIJAU' | 'ZONA KUNING' | 'ZONA MERAH' | 'AMAN' | 'BAHAYA';
  riskFactors: string;
  notes: string;
}

export interface SopItem {
  id: string;
  category: string;
  safe: boolean;
  title_id: string;
  title_en: string;
  subtitle_id: string; // NEW: Keterangan ID
  subtitle_en: string; // NEW: Keterangan EN
  image_url: string;
  description_id: string;
  description_en: string;
}

export interface MedisItem {
  id: string;
  title_id: string;
  title_en: string;
  // action fields now store newline-separated lists for bullet points
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
  icon: string; // Will store specific icon keys (e.g., 'water', 'sun')
}

export interface ScreeningQuestion {
  id: string;
  index: number;
  text_id: string;
  text_en: string;
  type: 'CORE' | 'RISK';
  safe_answer: 'YES' | 'NO';
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
