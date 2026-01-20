
import { API_URL } from '../constants';
import { DashboardData } from '../types';

// MOCK DATA (Fallback jika offline/error)
const MOCK_DATA: DashboardData = {
  screening: [],
  questions: [],
  analytics: { totalViews: 0 }
};

// --- HELPER FUNCTIONS ---

// 1. Normalisasi Status Zona
const normalizeStatus = (val: any): 'ZONA HIJAU' | 'ZONA KUNING' | 'ZONA MERAH' => {
  const s = String(val || '').toUpperCase();
  if (s.includes('MERAH') || s.includes('DANGER') || s.includes('BAHAYA')) return 'ZONA MERAH';
  if (s.includes('KUNING') || s.includes('WARNING') || s.includes('WASPADA')) return 'ZONA KUNING';
  return 'ZONA HIJAU';
};

// 2. Format Nama (Title Case & Trim)
const formatName = (name: any): string => {
  if (!name) return 'Tanpa Nama';
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Hapus spasi ganda
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// 3. Konversi Cerdas Usia Kehamilan
// Menangani input seperti "5 bulan", "20", "Input awal: 5 bulan...", dsb.
const parsePregnancyWeeks = (val: any): number => {
  const str = String(val || '');
  
  // Ambil angka pertama yang muncul di string
  // Contoh: "Input 5 bulan..." -> match "5"
  const match = str.match(/(\d+)/);
  if (!match) return 0;
  
  const num = parseInt(match[0], 10);
  if (isNaN(num) || num === 0) return 0;

  const lowerStr = str.toLowerCase();
  const isMonth = lowerStr.includes('bulan') || lowerStr.includes('month');

  // LOGIKA: Jika angka <= 9 (kemungkinan besar bulan) ATAU ada kata "bulan"
  // Maka dikalikan 4 untuk jadi minggu.
  if (isMonth || num <= 9) {
    return num * 4;
  }

  return num;
};

// 4. Parsing Koordinat & Lokasi
const BALI_HOTSPOTS = [
  { name: 'Lovina Beach', lat: -8.158, lng: 115.026 },
  { name: 'Ubud Center', lat: -8.506, lng: 115.262 },
  { name: 'Kuta Beach', lat: -8.718, lng: 115.169 },
  { name: 'Sanur Harbor', lat: -8.674, lng: 115.263 }
];

const assignLocation = (item: any, index: number) => {
  // Cek kolom Lat/Lng dari sheet (Case Insensitive keys)
  const realLat = item.Lat || item.lat || item.Latitude;
  const realLng = item.Lng || item.lng || item.Longitude;

  // Pastikan Lat/Lng adalah angka valid (bukan teks seperti "MARINA")
  const latNum = parseFloat(realLat);
  const lngNum = parseFloat(realLng);

  if (!isNaN(latNum) && !isNaN(lngNum) && latNum !== 0 && lngNum !== 0) {
    return { 
      lat: latNum, 
      lng: lngNum, 
      locationName: item.LocationName || item.locationName || 'Lokasi Terdeteksi' 
    };
  }

  // Fallback ke Mock Data jika koordinat tidak valid
  const spot = BALI_HOTSPOTS[index % BALI_HOTSPOTS.length];
  // Tambah sedikit random jitter agar tidak menumpuk persis
  const jitterLat = (Math.random() - 0.5) * 0.01; 
  const jitterLng = (Math.random() - 0.5) * 0.01;

  return {
    lat: spot.lat + jitterLat,
    lng: spot.lng + jitterLng,
    locationName: spot.name + ' (Estimasi)'
  };
};

// --- API FETCHERS ---

const gasFetch = async (payload: any) => {
  const isGet = payload.action === 'get_data';
  // Tambahkan timestamp agar tidak dicache browser
  const separator = API_URL.includes('?') ? '&' : '?';
  let url = `${API_URL}${separator}t=${Date.now()}`; 

  const options: RequestInit = { redirect: "follow" };

  if (isGet) {
    url += `&action=${payload.action}`;
    options.method = 'GET';
  } else {
    options.method = 'POST';
    options.headers = { "Content-Type": "text/plain;charset=utf-8" };
    options.body = JSON.stringify(payload);
  }

  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.error("Network Fetch Error:", error);
    throw error;
  }
};

// Retry logic untuk koneksi tidak stabil
const fetchWithRetry = async (fn: () => Promise<Response>, retries = 1, delay = 2000) => {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (!navigator.onLine) throw new Error("Tidak ada koneksi internet.");
      if (i < retries) await new Promise(res => setTimeout(res, delay));
    }
  }
  throw lastError;
};

export const fetchData = async (): Promise<DashboardData | null> => {
  if (!navigator.onLine) throw new Error("Koneksi Internet Terputus");

  if (!API_URL || API_URL.includes('YOUR_GOOGLE_SCRIPT')) {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_DATA), 1000));
  }

  try {
    const response = await fetchWithRetry(() => gasFetch({ action: 'get_data' }));
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const text = await response.text();
    
    // Cek jika response HTML (Error dari Google Script biasanya HTML)
    if (text.trim().startsWith('<') && !text.includes('status')) {
      console.warn("SERVER ERROR (HTML):", text);
      throw new Error("Server Google Error (HTML Response).");
    }

    try {
      const json = JSON.parse(text);
      if (json.status === 'error') throw new Error(json.message);

      const rawScreening = json.screening || [];
      
      // --- PROSES NORMALISASI DATA ---
      const normalizedScreening = rawScreening.map((item: any, idx: number) => {
        const loc = assignLocation(item, idx);
        return {
          timestamp: item.Timestamp || new Date().toISOString(),
          name: formatName(item.Name),
          age: parseInt(item.Age) || 0,
          pregnancyWeeks: parsePregnancyWeeks(item.PregnancyWeek || item.PregnancyWeeks),
          status: normalizeStatus(item.Status),
          riskFactors: item.RiskFactors || '',
          notes: item.Notes || '',
          lat: loc.lat,
          lng: loc.lng,
          locationName: loc.locationName
        };
      });

      return { 
        screening: normalizedScreening,
        questions: json.questions || [],
        analytics: json.analytics || { totalViews: 0 }
      };

    } catch (e: any) {
      if(e.message.includes('Server Google')) throw e;
      throw new Error("Format Data Salah (Invalid JSON).");
    }
  } catch (error) {
    console.warn("Fetch failed, falling back to mock data.", error);
    return MOCK_DATA; 
  }
};

export const updateSheetData = async (sheetName: string, data: any[]): Promise<boolean> => {
  try {
    const response = await fetchWithRetry(() => gasFetch({
      action: 'update_data',
      sheetName: sheetName,
      data: data
    }));
    
    const text = await response.text();
    if (text.startsWith('<')) throw new Error("Gagal Simpan: Server Error.");
    
    const res = JSON.parse(text);
    if (res.status === 'error') throw new Error(res.message);
    
    return true;
  } catch (error: any) {
    console.error("Update Exception:", error);
    throw error;
  }
};

export const uploadFile = async (file: File): Promise<string | null> => {
  return null;
};
