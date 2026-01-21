
import { API_URL } from '../constants';
import { DashboardData } from '../types';

// MOCK DATA (Fallback)
const MOCK_DATA: DashboardData = { screening: [], questions: [], analytics: { totalViews: 0 } };

const gasFetch = async (payload: any) => {
  if (API_URL.includes('PASTE_URL')) throw new Error("URL API Belum Diisi");

  // Tambahkan timestamp agar tidak cache
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

// --- FUNGSI PENGUNCIAN ---

export const getSystemStatus = async (): Promise<boolean> => {
  try {
    const res = await gasFetch({ action: 'get_system_status' });
    const json = await res.json();
    // Server akan kirim { isActive: true/false }
    return json.isActive;
  } catch (e) {
    console.log("Gagal cek status", e);
    return true; // Default nyala jika error koneksi
  }
};

export const toggleSystemStatus = async (isActive: boolean): Promise<boolean> => {
  try {
    // Kirim status baru (true/false) ke server
    const res = await gasFetch({ action: 'set_system_status', isActive: isActive });
    const json = await res.json();
    return json.isActive;
  } catch (e) {
    throw e;
  }
};

// --- HELPER: Normalize Status (DANGER -> ZONA MERAH) ---
const normalizeStatus = (rawStatus: any): 'ZONA HIJAU' | 'ZONA KUNING' | 'ZONA MERAH' => {
  const s = String(rawStatus || '').toUpperCase();
  if (s.includes('DANGER') || s.includes('MERAH') || s.includes('BAHAYA')) return 'ZONA MERAH';
  if (s.includes('WARNING') || s.includes('KUNING')) return 'ZONA KUNING';
  return 'ZONA HIJAU'; // Default SAFE/HIJAU
};

// --- FUNGSI DATA ---

export const fetchData = async (): Promise<DashboardData | null> => {
  if (!navigator.onLine) return null;
  try {
    const res = await gasFetch({ action: 'get_data' });
    const json = await res.json();
    
    // Format data agar sesuai UI
    const screening = (json.screening || []).map((item: any) => ({
      timestamp: item.Timestamp || new Date().toISOString(),
      name: item.Name || 'Tanpa Nama',
      age: parseInt(item.Age || 0),
      pregnancyWeeks: parseInt(item.PregnancyWeek || 0),
      status: normalizeStatus(item.Status), // Pakai normalizer biar support DANGER/WARNING
      riskFactors: '',
      notes: item.Notes || '',
      lat: parseFloat(item.Lat || 0),
      lng: parseFloat(item.Lng || 0),
      locationName: item.LocationName
    }));

    return { screening, questions: json.questions || [], analytics: { totalViews: 0 } };
  } catch (e) {
    return MOCK_DATA;
  }
};

export const updateSheetData = async (sheetName: string, data: any) => {
  try {
    // Implementasi jika diperlukan untuk CMS
    if (!API_URL.includes('PASTE_URL')) {
        await gasFetch({ action: 'update_sheet_data', sheetName, data });
    }
    return true;
  } catch (e) {
    return true;
  }
};

export const uploadFile = async () => null;
