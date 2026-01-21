
import { API_URL } from '../constants';
import { DashboardData } from '../types';

// MOCK DATA (Fallback jika offline)
const MOCK_DATA: DashboardData = { screening: [], questions: [], analytics: { totalViews: 0 }, traffic: [] };

const gasFetch = async (payload: any) => {
  if (API_URL.includes('PASTE_URL')) throw new Error("URL API Belum Diisi");

  // Tambahkan timestamp agar tidak cache request
  let url = `${API_URL}${API_URL.includes('?') ? '&' : '?'}t=${Date.now()}`;
  
  const options: RequestInit = { redirect: "follow" };
  
  // Jika GET (ambil status), pakai method GET
  if (payload.action === 'get_system_status' || payload.action === 'get_data') {
    url += `&action=${payload.action}`;
    options.method = 'GET';
  } else {
    // Jika POST (ubah status/kirim data), pakai method POST
    options.method = 'POST';
    options.headers = { "Content-Type": "text/plain;charset=utf-8" };
    options.body = JSON.stringify(payload);
  }

  return await fetch(url, options);
};

// --- FUNGSI TRAFFIC ---
export const logTraffic = async (lat?: number, lng?: number) => {
  try {
    await gasFetch({ 
      action: 'log_traffic', 
      lat: lat || '', 
      lng: lng || '',
      ua: navigator.userAgent
    });
  } catch (e) {
    console.error("Traffic log failed", e);
  }
};

// --- FUNGSI PENGUNCIAN ---

export const getSystemStatus = async (): Promise<boolean> => {
  try {
    const res = await gasFetch({ action: 'get_system_status' });
    const json = await res.json();
    return json.isActive;
  } catch (e) {
    console.log("Gagal cek status, menggunakan default TRUE", e);
    return true; 
  }
};

export const toggleSystemStatus = async (isActive: boolean): Promise<boolean> => {
  try {
    const res = await gasFetch({ action: 'set_system_status', isActive: isActive });
    const json = await res.json();
    return json.isActive;
  } catch (e) {
    throw e;
  }
};

// --- HELPER: Normalize Status ---
const normalizeStatus = (rawStatus: any): 'ZONA HIJAU' | 'ZONA KUNING' | 'ZONA MERAH' => {
  const s = String(rawStatus || '').toUpperCase();
  if (s.includes('DANGER') || s.includes('MERAH') || s.includes('BAHAYA')) return 'ZONA MERAH';
  if (s.includes('WARNING') || s.includes('KUNING')) return 'ZONA KUNING';
  return 'ZONA HIJAU'; // Default SAFE/HIJAU
};

// --- FUNGSI DATA UTAMA ---

export const fetchData = async (): Promise<DashboardData | null> => {
  if (!navigator.onLine) return null;
  try {
    const res = await gasFetch({ action: 'get_data' });
    const json = await res.json();
    
    // 1. Format Data Screening
    const screening = (json.screening || []).map((item: any) => ({
      timestamp: item.Timestamp || new Date().toISOString(),
      name: item.Name || 'Tanpa Nama',
      age: parseInt(item.Age || 0),
      pregnancyWeeks: parseInt(item.PregnancyWeek || 0),
      status: normalizeStatus(item.Status), 
      riskFactors: '',
      notes: item.Notes || '',
      lat: parseFloat(item.Lat || 0),
      lng: parseFloat(item.Lng || 0),
      locationName: item.LocationName
    }));

    // 2. Format Data Traffic (Parse Angka dengan Aman)
    const traffic = (json.traffic || []).map((item: any) => {
      // Pastikan lat/lng diparse sebagai angka, jika string kosong jadi 0
      const rawLat = item.Lat;
      const rawLng = item.Lng;
      
      const lat = (rawLat === "" || rawLat === null || rawLat === undefined) ? 0 : Number(rawLat);
      const lng = (rawLng === "" || rawLng === null || rawLng === undefined) ? 0 : Number(rawLng);

      return {
        timestamp: item.Timestamp || new Date().toISOString(),
        lat: isNaN(lat) ? 0 : lat,
        lng: isNaN(lng) ? 0 : lng,
        userAgent: item.UserAgent || 'Unknown Device' 
      };
    });

    return { 
      screening, 
      questions: json.questions || [], 
      traffic, // Data yang sudah diformat
      analytics: { totalViews: 0 } 
    };
  } catch (e) {
    console.error("Fetch Data Error:", e);
    // Kembalikan Mock Data hanya jika benar-benar error fatal
    return MOCK_DATA;
  }
};

export const updateSheetData = async (sheetName: string, data: any) => {
  try {
    if (!API_URL.includes('PASTE_URL')) {
        await gasFetch({ action: 'update_data', sheetName, data });
    }
    return true;
  } catch (e) {
    console.error("Update failed", e);
    return false;
  }
};

export const uploadFile = async () => null;
