
export interface ScreeningResult {
  timestamp: string;
  name: string;
  age: number;
  pregnancyWeeks: number;
  status: 'ZONA HIJAU' | 'ZONA KUNING' | 'ZONA MERAH' | 'AMAN' | 'BAHAYA';
  riskFactors: string;
  notes: string;
  // Location Data
  lat?: number;
  lng?: number;
  locationName?: string; // e.g. "Lovina Beach", "Kuta"
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
  questions: ScreeningQuestion[];
  analytics?: {
    totalViews: number;
  };
}
