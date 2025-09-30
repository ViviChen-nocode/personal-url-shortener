// URL Shortener - Google Sheets Integration
// 請將 go.yourdomain.com 替換成你的實際網域
// 需要在 Script Properties 設定 API_SECRET

// Configuration
const API_BASE = 'https://go.yourdomain.com';

// Get API Secret from Script Properties
function getApiSecret() {
  return PropertiesService.getScriptProperties().getProperty('API_SECRET');
}

// Create custom menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('短網址工具')
    .addItem('同步設定到 Worker', 'syncConfig')
    .addToUi();
}

// Sync Settings to Worker
function syncConfig() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const settingsSheet = ss.getSheetByName('Settings');
  const logSheet = ss.getSheetByName('Log');
  
  if (!settingsSheet) {
    SpreadsheetApp.getUi().alert('錯誤', '找不到 Settings 工作表', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Read settings
  const data = settingsSheet.getDataRange().getValues();
  const config = {};
  
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    let value = data[i][1];
    
    if (!key) continue;
    
    // Convert to proper types
    if (value === 'TRUE' || value === 'true') value = true;
    else if (value === 'FALSE' || value === 'false') value = false;
    else if (!isNaN(value) && value !== '') value = Number(value);
    
    config[key] = value;
  }
  
  // Convert reserved_aliases from comma-separated string to array
  if (config.reserved_aliases && typeof config.reserved_aliases === 'string') {
    config.reserved_aliases = config.reserved_aliases.split(',').map(s => s.trim());
  }
  
  try {
    const response = UrlFetchApp.fetch(API_BASE + '/api/config', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-API-Secret': getApiSecret()
      },
      payload: JSON.stringify(config),
      muteHttpExceptions: true
    });
    
    const result = JSON.parse(response.getContentText());
    
    // Log
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'sync_config',
        '-',
        JSON.stringify(result),
        'sheet'
      ]);
    }
    
    if (response.getResponseCode() === 200) {
      SpreadsheetApp.getUi().alert('成功', '設定已同步到 Worker!', SpreadsheetApp.getUi().ButtonSet.OK);
    } else {
      SpreadsheetApp.getUi().alert('錯誤', '同步失敗: ' + result.error, SpreadsheetApp.getUi().ButtonSet.OK);
    }
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('錯誤', '同步失敗: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Handle checkbox trigger
function onEditTrigger(e) {
  // Check if edit is in Links sheet
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== 'Links') return;
  
  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();
  
  // Check if checkbox in column C (column 3) was checked
  if (col === 3 && row > 2) { // Skip header and description rows
    const checked = range.getValue();
    
    if (checked === true) {
      // Get data from this row
      const longUrl = sheet.getRange(row, 1).getValue();
      const alias = sheet.getRange(row, 2).getValue();
      
      if (!longUrl) {
        sheet.getRange(row, 5).setValue('Error: 沒有網址');
        return;
      }
      
      // Check if already has short URL
      const existingShortUrl = sheet.getRange(row, 4).getValue();
      if (existingShortUrl) {
        sheet.getRange(row, 5).setValue('已存在短網址');
        return;
      }
      
      // Create short URL
      createShortUrl(sheet, row, longUrl, alias);
    }
  }
}

// Create short URL for a specific row
function createShortUrl(sheet, row, longUrl, alias) {
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  
  try {
    const payload = { longUrl };
    if (alias) payload.alias = alias;
    
    const response = UrlFetchApp.fetch(API_BASE + '/api/shorten', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-API-Secret': getApiSecret()
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      // Update row: D=Short URL, E=Status, F=Created At, G=Source
      sheet.getRange(row, 4).setValue(result.shortUrl);
      sheet.getRange(row, 5).setValue('Success');
      sheet.getRange(row, 6).setValue(new Date());
      sheet.getRange(row, 7).setValue('sheet');
      
      // Log
      if (logSheet) {
        logSheet.appendRow([
          new Date(),
          'create',
          result.code,
          longUrl,
          'sheet'
        ]);
      }
    } else {
      sheet.getRange(row, 5).setValue('Error: ' + result.error);
    }
    
  } catch (error) {
    sheet.getRange(row, 5).setValue('Error: ' + error.message);
  }
}

// ========== Web App Functions ==========

// Web App entry point
function doGet(e) {
  // Get URL parameter if provided
  const urlParam = e.parameter.url || '';
  
  const template = HtmlService.createTemplateFromFile('Index');
  template.urlParam = urlParam;
  
  return template.evaluate()
    .setTitle('短網址產生器');
}

// API endpoint for Web App
function createShortUrlFromWebApp(longUrl, alias) {
  try {
    const payload = { longUrl };
    if (alias) payload.alias = alias;
    
    const response = UrlFetchApp.fetch(API_BASE + '/api/shorten', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'X-API-Secret': getApiSecret()
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      // Log to sheet
      const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
      if (logSheet) {
        logSheet.appendRow([
          new Date(),
          'create',
          result.code,
          longUrl,
          'webapp'
        ]);
      }
      
      return {
        success: true,
        shortUrl: result.shortUrl,
        code: result.code
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}