
// COPAS KODE INI KE GOOGLE APPS SCRIPT EDITOR
// PENTING: Klik Deploy -> Manage Deployments -> Klik Icon Pensil -> Version: "New Version" -> Deploy

const SHEET_CONFIG = {
  SCREENING_RESULTS: ['Timestamp', 'Name', 'Age', 'PregnancyWeeks', 'Status', 'RiskFactors', 'Notes'],
  SCREENING_QUESTIONS: ['id', 'index', 'text_id', 'text_en', 'type', 'safe_answer'],
  ANALYTICS_LOG: ['Timestamp', 'Type', 'Info']
};

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (e) {
    return responseJSON({ status: 'error', message: 'Server busy, please try again.' });
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let payload = {};
    const action = e.parameter ? e.parameter.action : null;
    
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        if (!action) return responseJSON({ status: 'error', message: 'Invalid JSON' });
      }
    }
    
    const finalAction = payload.action || action;

    if (finalAction === 'test') {
      return responseJSON({ status: 'success', message: 'Connection OK' });
    }

    if (finalAction === 'get_data') {
      const data = getAllData(ss);
      return responseJSON(data);
    }

    if (finalAction === 'update_data') {
      const sheetName = payload.sheetName;
      const newData = payload.data;

      if (!SHEET_CONFIG[sheetName]) {
        return responseJSON({ status: 'error', message: 'Sheet not found' });
      }

      const sheet = getOrCreateSheet(ss, sheetName);
      
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getMaxColumns()).clearContent();
      }

      if (newData && newData.length > 0) {
        const headers = SHEET_CONFIG[sheetName];
        const rows = newData.map(item => {
          return headers.map(header => {
            const val = item[header];
            if (header === 'id') return "'" + (val || "");
            return val === undefined || val === null ? "" : val;
          });
        });
        
        if (rows.length > 0) {
          sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
        }
      }

      return responseJSON({ status: 'success', message: 'Data saved', count: newData ? newData.length : 0 });
    }

    return responseJSON({ status: 'error', message: 'Unknown Action: ' + finalAction });

  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function getAllData(ss) {
  return {
    screening: getSheetData(ss, 'SCREENING_RESULTS'),
    questions: getSheetData(ss, 'SCREENING_QUESTIONS'),
    analytics: { totalViews: 0 }
  };
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];
  
  const raw = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  const headers = raw[0].map(h => String(h).trim()); // Trim headers to avoid mismatch
  const rows = raw.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => {
      if (h) {
        // Map data to expected TypeScript keys (camelCase if necessary)
        let key = h;
        if (h === 'Timestamp') key = 'timestamp';
        if (h === 'Name') key = 'name';
        if (h === 'Age') key = 'age';
        if (h === 'PregnancyWeeks') key = 'pregnancyWeeks';
        if (h === 'Status') key = 'status';
        if (h === 'RiskFactors') key = 'riskFactors';
        if (h === 'Notes') key = 'notes';
        obj[key] = row[i];
      }
    });
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
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
