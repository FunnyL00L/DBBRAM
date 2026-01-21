
// ==========================================
// PROJECT: LOCOMOTION (Guest Tracker System)
// VERSION: 5.1 (Traffic & Email Alerts)
// ==========================================

const SHEET_CONFIG = {
  SCREENING_RESULTS: ['Timestamp', 'Lat', 'Lng', 'LocationName', 'Name', 'Age', 'PregnancyWeek', 'Status', 'RiskFactors', 'Notes'],
  SCREENING_QUESTIONS: ['id', 'index', 'text_id', 'text_en', 'type', 'safe_answer'],
  SYSTEM_CONFIG: ['Key', 'Value', 'LastUpdated'],
  TRAFFIC_LOGS: ['Timestamp', 'DateStr', 'Lat', 'Lng', 'UserAgent']
};

// EMAIL ADMIN CONFIG
const ADMIN_EMAIL = 'gedebramanda155@gmail.com';

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return responseJSON({ status: 'error', message: 'Server busy' });
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let payload = {};
    const action = e.parameter ? e.parameter.action : null;
    
    if (e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (err) {}
    }
    
    const finalAction = payload.action || action;

    // --- 1. GET SYSTEM STATUS ---
    if (finalAction === 'get_system_status') {
      const status = getSystemStatusValue(ss);
      return responseJSON({ status: 'success', isActive: status === 1 });
    }

    // --- 2. SET SYSTEM STATUS ---
    if (finalAction === 'set_system_status') {
      let val = payload.isActive;
      let newStatus = (val === true || val === 1 || String(val).toLowerCase() === 'true' || String(val) === '1') ? 1 : 0;
      
      updateSystemStatusValue(ss, newStatus);
      return responseJSON({ status: 'success', isActive: newStatus === 1 });
    }

    // --- 3. SUBMIT SCREENING & EMAIL ALERT (100 USER CHECK) ---
    if (finalAction === 'submit_screening') {
      const isActive = getSystemStatusValue(ss);
      if (isActive === 0) return responseJSON({ status: 'error', message: 'LOCKED' });

      const sheet = getOrCreateSheet(ss, 'SCREENING_RESULTS');
      const data = payload.data;
      
      sheet.appendRow([
        new Date(), data.lat, data.lng, data.locationName, data.name, 
        data.age, data.pregnancyWeeks, data.status, data.riskFactors, data.notes
      ]);

      // LOGIKA EMAIL: KELIPATAN 100 USER
      // (Row 1 Header, jadi Row 101 = 100 data)
      const totalData = sheet.getLastRow() - 1; 
      if (totalData > 0 && totalData % 100 === 0) {
        sendEmailAlert("ALERT: Data Screening Mencapai " + totalData + " User!", 
          `Halo Admin Locomotion,\n\nLaporan otomatis: Total data screening masuk telah mencapai ${totalData} user.\nSilakan cek dashboard untuk detailnya.`);
      }

      return responseJSON({ status: 'success', message: 'Saved' });
    }

    // --- 4. LOG TRAFFIC & EMAIL ALERT (1000 DAILY VISITS) ---
    if (finalAction === 'log_traffic') {
       const sheet = getOrCreateSheet(ss, 'TRAFFIC_LOGS');
       const now = new Date();
       const dateStr = Utilities.formatDate(now, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
       
       sheet.appendRow([now, dateStr, payload.lat || '', payload.lng || '', payload.ua || '']);
       
       // Cek Trafik Hari Ini
       const data = sheet.getDataRange().getValues();
       // Kolom B (index 1) adalah DateStr
       const todayCount = data.filter(r => r[1] === dateStr).length;

       if (todayCount === 1000) {
          sendEmailAlert("URGENT: Trafik Web Tembus 1000 User Hari Ini!", 
          `Halo Admin Locomotion,\n\nTerdeteksi lonjakan trafik. Web tamu telah diakses oleh 1000 user pada tanggal ${dateStr}.\nMohon pantau performa server dan kuota API Google.`);
       }

       return responseJSON({ status: 'success' });
    }

    // --- 5. GET DATA ---
    if (finalAction === 'get_data') {
      return responseJSON(getAllData(ss));
    }

    // --- 6. UPDATE DATA ---
    if (finalAction === 'update_data') {
      const sheet = getOrCreateSheet(ss, payload.sheetName);
      if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow()-1, sheet.getMaxColumns()).clearContent();
      
      if (payload.data && payload.data.length > 0) {
         const headers = SHEET_CONFIG[payload.sheetName];
         const rows = payload.data.map(item => headers.map(h => {
            if (h === 'id') return "'" + (item[h] || "");
            return item[h] || "";
         }));
         sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      }
      return responseJSON({ status: 'success' });
    }

    return responseJSON({ status: 'error', message: 'Unknown Action' });

  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- EMAIL SENDER ---
function sendEmailAlert(subject, body) {
  try {
    MailApp.sendEmail({
      to: ADMIN_EMAIL,
      subject: "[LOCOMOTION] " + subject,
      body: body
    });
  } catch (e) {
    Logger.log("Email failed: " + e.toString());
  }
}

// --- SYSTEM LOGIC ---

function getSystemStatusValue(ss) {
  const sheet = getOrCreateSheet(ss, 'SYSTEM_CONFIG');
  const finder = sheet.getRange("A:A").createTextFinder("guest_app_active").matchEntireCell(true);
  const cell = finder.findNext();
  if (cell) {
    const val = cell.offset(0, 1).getValue(); 
    return (val == 1 || String(val).toLowerCase() === 'true') ? 1 : 0;
  }
  return 1;
}

function updateSystemStatusValue(ss, val) {
  const sheet = getOrCreateSheet(ss, 'SYSTEM_CONFIG');
  const finder = sheet.getRange("A:A").createTextFinder("guest_app_active").matchEntireCell(true);
  const cell = finder.findNext();
  if (cell) {
    cell.offset(0, 1).setValue(val);
    cell.offset(0, 2).setValue(new Date()); 
  } else {
    sheet.appendRow(['guest_app_active', val, new Date()]);
  }
  SpreadsheetApp.flush();
}

// --- HELPERS ---

function getAllData(ss) {
  return {
    screening: getSheetData(ss, 'SCREENING_RESULTS'),
    questions: getSheetData(ss, 'SCREENING_QUESTIONS'),
    traffic: getSheetData(ss, 'TRAFFIC_LOGS'),
    systemStatus: getSystemStatusValue(ss),
    analytics: { totalViews: 0 }
  };
}

function getSheetData(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const raw = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const headers = raw[0];
  return raw.slice(1).map(r => {
    let obj = {};
    headers.forEach((h, i) => obj[String(h).trim()] = r[i]);
    return obj;
  });
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(SHEET_CONFIG[name]);
  }
  return sheet;
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
