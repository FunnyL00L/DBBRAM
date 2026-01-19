import { API_URL } from '../constants';
import { DashboardData } from '../types';

// MOCK DATA (Fallback)
const MOCK_DATA: DashboardData = {
  screening: [],
  sop: [],
  medis: [],
  tips: [],
  questions: [],
  analytics: { totalViews: 0 }
};

const gasFetch = async (payload: any) => {
  try {
    const separator = API_URL.includes('?') ? '&' : '?';
    const url = `${API_URL}${separator}t=${Date.now()}`; 

    const response = await fetch(url, {
        method: 'POST',
        redirect: "follow", 
        headers: {
            "Content-Type": "text/plain;charset=utf-8", 
        },
        body: JSON.stringify(payload)
    });
    
    return response;
  } catch (error) {
    console.error("Network Fetch Error:", error);
    throw error;
  }
};

const fetchWithRetry = async (fn: () => Promise<Response>, retries = 1, delay = 2000) => {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (!navigator.onLine) throw new Error("Tidak ada koneksi internet (Offline).");
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
    
    // DETEKSI ERROR HTML GOOGLE (Bukan JSON)
    if (text.trim().startsWith('<') && !text.includes('status')) {
        console.error("SERVER ERROR (HTML):", text);
        throw new Error("Server Error: Script Google mengembalikan HTML (Cek Deployment ID / Permission).");
    }

    try {
        const json = JSON.parse(text);
        if (json.status === 'error') throw new Error(json.message);

        return { 
            screening: json.screening || [],
            sop: json.sop || [],
            medis: json.medis || [],
            tips: json.tips || [],
            questions: json.questions || [],
            analytics: json.analytics || { totalViews: 0 }
        };
    } catch (e: any) {
        if(e.message.includes('Server Error')) throw e;
        throw new Error("Format Data Salah (Invalid JSON).");
    }
  } catch (error) {
    throw error; 
  }
};

// MODIFIED: Now throws error instead of returning boolean/alerting internally
export const updateSheetData = async (sheetName: string, data: any[]): Promise<boolean> => {
  if (API_URL.includes('YOUR_GOOGLE_SCRIPT')) return true;

  try {
    console.log(`Saving ${sheetName}, count: ${data.length}`);
    
    const response = await fetchWithRetry(() => gasFetch({
      action: 'update_data',
      sheetName: sheetName,
      data: data
    }));
    
    const text = await response.text();
    
    if (text.startsWith('<')) {
        console.error("Save Failed (HTML Response):", text);
        throw new Error("Gagal Simpan: Server Google merespon dengan HTML (Mungkin URL Script salah atau Script Error).");
    }

    const res = JSON.parse(text);

    if (res.status === 'error') {
        throw new Error(`Ditolak Server: ${res.message}`);
    }
    
    return true; // Success
  } catch (error: any) {
    console.error("Update Exception:", error);
    throw error; // Lempar error ke UI agar bisa di-alert
  }
};

export const uploadFile = async (file: File): Promise<string | null> => {
  if (file.size > 3 * 1024 * 1024) {
    throw new Error(`File ${file.name} terlalu besar (>3MB).`);
  }

  if (API_URL.includes('YOUR_GOOGLE_SCRIPT')) return URL.createObjectURL(file); 

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
  });

  try {
      const base64Full = await toBase64(file);
      const base64Data = base64Full.split(',')[1]; 

      const response = await gasFetch({
        action: 'upload_image',
        data: base64Data,
        name: file.name,
        mimeType: file.type
      });
      
      const text = await response.text();
      if(text.startsWith('<')) throw new Error("Upload Gagal: Server Error HTML.");

      const res = JSON.parse(text);
      if (res.status === 'success') return res.url;
      throw new Error(res.message || "Upload gagal.");
  } catch (e: any) {
      console.error("Upload Error", e);
      throw new Error(`Gagal Upload ${file.name}: ${e.message}`);
  }
};