
// ==========================================
// LOVINAMOM: BACKEND SCRIPT
// COPY CODE INI KE GOOGLE APPS SCRIPT EDITOR
// LALU KLIK DEPLOY > NEW DEPLOYMENT > WHO HAS ACCESS: ANYONE
// ==========================================

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(10000); } catch (e) { return response({ status: 'error', message: 'Server Busy' }); }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let action = e.parameter.action;
    let payload = {};

    // Parsing Payload dari React
    if (e.postData && e.postData.contents) {
      const json = JSON.parse(e.postData.contents);
      if (json.action) action = json.action;
      payload = json;
    }

    // =================================================
    // 1. SISTEM LOCK (Cek Status Buka/Tutup)
    // =================================================
    if (action === 'get_system_status') {
      const sheet = getSheet(ss, 'SYSTEM_CONFIG');
      const val = sheet.getRange("B2").getValue();
      const isActive = (val == 1 || String(val) == '1' || String(val).toLowerCase() == 'true');
      return response({ status: 'success', isActive: isActive });
    }

    if (action === 'set_system_status') {
      const sheet = getSheet(ss, 'SYSTEM_CONFIG');
      const newState = payload.isActive; 
      const writeValue = (newState === true || newState === 1) ? 1 : 0;
      sheet.getRange("B2").setValue(writeValue);
      sheet.getRange("C2").setValue("Updated: " + new Date());
      SpreadsheetApp.flush();
      return response({ status: 'success', isActive: writeValue === 1 });
    }

    // =================================================
    // 2. INPUT DATA SCREENING (PENTING: Urutan Kolom)
    // =================================================
    if (action === 'submit_screening') {
      const sheet = getSheet(ss, 'SCREENING_RESULTS');
      const d = payload.data;
      
      // Jika sheet kosong, buat header sesuai gambar Anda
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Timestamp', 'Lat', 'Lng', 'LocationName', 'Name', 'Age', 'PregnancyWeek', 'Status', 'Notes']);
      }

      // Normalisasi Status ke Bahasa Inggris (Sesuai Gambar Sheet)
      let statusEnglish = 'SAFE';
      const s = (d.status || '').toUpperCase();
      if (s.includes('MERAH') || s.includes('BAHAYA') || s.includes('DANGER')) statusEnglish = 'DANGER';
      else if (s.includes('KUNING') || s.includes('WARNING')) statusEnglish = 'WARNING';
      else statusEnglish = 'SAFE';

      // MEMASUKKAN DATA (URUTAN HARUS SESUAI GAMBAR)
      // A: Timestamp, B: Lat, C: Lng, D: LocName, E: Name, F: Age, G: Week, H: Status, I: Notes
      sheet.appendRow([
        new Date(),       // A
        d.lat || 0,       // B
        d.lng || 0,       // C
        d.locationName || 'Unknown', // D
        d.name,           // E
        d.age,            // F
        d.pregnancyWeeks, // G
        statusEnglish,    // H
        d.riskFactors || '' // I (Notes berisi faktor risiko)
      ]);
      
      return response({ status: 'success', message: 'Data saved' });
    }

    // =================================================
    // 3. GET DATA (Untuk Dashboard Admin)
    // =================================================
    if (action === 'get_data') {
      const sheet = getSheet(ss, 'SCREENING_RESULTS');
      const data = sheet.getDataRange().getValues();
      const rows = data.slice(1); // Skip header
      
      const formatted = rows.map(r => {
        return {
           Timestamp: r[0], 
           Lat: r[1],       
           Lng: r[2],       
           LocationName: r[3],
           Name: r[4],      
           Age: r[5],       
           PregnancyWeek: r[6],
           Status: r[7],    
           Notes: r[8] || '' 
        };
      });
      
      // Ambil juga pertanyaan
      const qSheet = getSheet(ss, 'SCREENING_QUESTIONS');
      const qData = qSheet.getDataRange().getValues().slice(1);
      const questions = qData.map(q => ({
        id: q[0], index: q[1], text_id: q[2], text_en: q[3], type: q[4], safe_answer: q[5]
      }));

      return response({ screening: formatted, questions: questions });
    }
    
    // Update Data Pertanyaan (CMS)
    if (action === 'update_sheet_data') {
       const sheetName = payload.sheetName;
       const dataRaw = payload.data; // Array of objects
       const sheet = getSheet(ss, sheetName);
       
       // Clear old data except header
       if (sheet.getLastRow() > 1) {
         sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getLastColumn()).clearContent();
       }
       
       if (dataRaw && dataRaw.length > 0) {
         // Convert objects back to array rows based on simple mapping
         // Assumes Q Structure: id, index, text_id, text_en, type, safe_answer
         const rows = dataRaw.map(x => [x.id, x.index, x.text_id, x.text_en, x.type, x.safe_answer]);
         sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
       }
       return response({ status: 'success' });
    }

    return response({ status: 'error', message: 'Action unknown' });

  } catch (err) {
    return response({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
