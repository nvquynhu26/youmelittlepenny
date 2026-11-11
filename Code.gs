/**
 * Google Apps Script Backend for Youmelittlepenny Terminal
 * Handles automated persistence, bidirectional sync, and yearly sheet partitioning.
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = ss.getSheetByName("Active_State") || initSheet(ss);
    const dataRange = activeSheet.getDataRange();
    const values = dataRange.getValues();
    
    let state = null;
    if (values.length > 1 && values[1][1]) {
      state = JSON.parse(values[1][1]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: state,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const postData = JSON.parse(e.postData.contents);
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Check & Handle Annual Partitioning
    checkYearPartition(ss, currentYear);
    
    // Write latest snapshot into Active_State
    const activeSheet = ss.getSheetByName("Active_State") || initSheet(ss);
    activeSheet.getRange(2, 1).setValue(now.toISOString());
    activeSheet.getRange(2, 2).setValue(JSON.stringify(postData));
    activeSheet.getRange(2, 3).setValue(postData.netWorthVND || 0);
    activeSheet.getRange(2, 4).setValue(postData.netWorthKRW || 0);
    activeSheet.getRange(2, 5).setValue(postData.netWorthUSD || 0);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      syncedAt: now.toISOString(),
      yearPartition: "Snapshot_" + currentYear
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function initSheet(ss) {
  let sheet = ss.getSheetByName("Active_State");
  if (!sheet) {
    sheet = ss.insertSheet("Active_State");
    sheet.getRange(1, 1, 1, 5).setValues([["Last_Updated", "JSON_State", "NetWorth_VND", "NetWorth_KRW", "NetWorth_USD"]]);
    sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  }
  return sheet;
}

function checkYearPartition(ss, currentYear) {
  const snapshotName = "Snapshot_" + currentYear;
  let snapshotSheet = ss.getSheetByName(snapshotName);
  if (!snapshotSheet) {
    snapshotSheet = ss.insertSheet(snapshotName);
    snapshotSheet.getRange(1, 1, 1, 5).setValues([["Timestamp", "JSON_Backup", "NetWorth_VND", "NetWorth_KRW", "NetWorth_USD"]]);
    snapshotSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#0f172a").setFontColor("#38bdf8");
  }
}
