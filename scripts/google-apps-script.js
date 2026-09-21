/**
 * =======================================================================================
 * GOOGLE APPS SCRIPT: FIREBASE AUTH TO GOOGLE SHEETS RECEIVER WEBHOOK
 * =======================================================================================
 * Target Spreadsheet ID: 1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA
 * Spreadsheet URL: https://docs.google.com/spreadsheets/d/1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA/edit
 *
 * HOW TO INSTALL:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA/edit
 * 2. Click on "Extensions" in the top menu -> "Apps Script".
 * 3. Delete any default code in Code.gs and paste this entire file.
 * 4. Click "Deploy" (top right) -> "New deployment".
 * 5. Select type "Web app":
 *    - Description: "Firebase Auth Sync Receiver"
 *    - Execute as: "Me (your_email@gmail.com)"
 *    - Who has access: "Anyone"
 * 6. Click "Deploy", authorize permissions when prompted, and copy the "Web app URL".
 * 7. Set this URL in your Next.js `.env.local` as `GOOGLE_SHEETS_WEBHOOK_URL` or in the Admin Settings.
 * =======================================================================================
 */

// 1. CONFIGURATION
const SPREADSHEET_ID = "1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA";
const SHEET_TAB_NAME = "Users"; // Tab name inside the spreadsheet

// Expected Columns in Order:
const HEADERS = [
  "User ID (UID)",
  "Full Name",
  "Email Address",
  "Phone Number",
  "Auth Provider",
  "Created At",
  "Last Synced At"
];

/**
 * Handle incoming HTTP POST requests from Next.js API route or Firebase Client
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  
  // Wait up to 30 seconds for lock to avoid race conditions during concurrent signups
  try {
    lock.waitLock(30000);
  } catch (lockError) {
    return createJsonResponse({
      status: "error",
      message: "Server is busy processing concurrent signups. Please try again."
    }, 429);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: "error",
        message: "No payload received in POST request."
      }, 400);
    }

    // Parse JSON payload
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        status: "error",
        message: "Invalid JSON format in payload: " + parseErr.toString()
      }, 400);
    }

    // Open target spreadsheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_TAB_NAME);

    // If tab doesn't exist, create it and add formatted headers
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_TAB_NAME);
      sheet.appendRow(HEADERS);
      formatHeaderRow(sheet);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      formatHeaderRow(sheet);
    }

    // Check if payload is a batch array or single user
    const usersToProcess = Array.isArray(data.users) ? data.users : [data];
    let insertedCount = 0;
    let updatedCount = 0;

    // Read all existing rows to perform deduplication by UID (Col A) and Email (Col C)
    const existingData = sheet.getDataRange().getValues();
    const uidRowMap = new Map();
    const emailRowMap = new Map();

    for (let r = 1; r < existingData.length; r++) {
      const rowUid = String(existingData[r][0] || "").trim();
      const rowEmail = String(existingData[r][2] || "").trim().toLowerCase();
      if (rowUid) uidRowMap.set(rowUid, r + 1); // 1-indexed sheet row
      if (rowEmail) emailRowMap.set(rowEmail, r + 1);
    }

    const nowIso = new Date().toISOString();

    usersToProcess.forEach(function (user) {
      const uid = String(user.uid || "").trim();
      const name = String(user.name || user.displayName || "Anonymous Trader").trim();
      const email = String(user.email || "").trim().toLowerCase();
      const phone = String(user.phone || user.phoneNumber || "N/A").trim();
      const provider = String(user.provider || "password").trim();
      const createdAt = String(user.createdAt || nowIso).trim();

      if (!uid && !email) return;

      // Check if user already exists
      const targetRow = uidRowMap.get(uid) || (email ? emailRowMap.get(email) : null);

      if (targetRow) {
        // Update existing row
        sheet.getRange(targetRow, 1, 1, 7).setValues([[
          uid,
          name,
          email,
          phone !== "N/A" ? phone : sheet.getRange(targetRow, 4).getValue() || "N/A",
          provider,
          sheet.getRange(targetRow, 6).getValue() || createdAt,
          nowIso
        ]]);
        updatedCount++;
      } else {
        // Append brand new row
        sheet.appendRow([
          uid,
          name,
          email,
          phone,
          provider,
          createdAt,
          nowIso
        ]);
        const newRowIdx = sheet.getLastRow();
        if (uid) uidRowMap.set(uid, newRowIdx);
        if (email) emailRowMap.set(email, newRowIdx);
        insertedCount++;
      }
    });

    return createJsonResponse({
      status: "success",
      inserted: insertedCount,
      updated: updatedCount,
      totalProcessed: usersToProcess.length,
      timestamp: nowIso
    });

  } catch (err) {
    return createJsonResponse({
      status: "error",
      message: err.toString()
    }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle HTTP GET for status health check and verification
 */
function doGet(e) {
  return createJsonResponse({
    status: "online",
    message: "Firebase to Google Sheets Webhook is active and operational.",
    targetSpreadsheetId: SPREADSHEET_ID,
    targetTab: SHEET_TAB_NAME,
    timestamp: new Date().toISOString()
  });
}

/**
 * Format Sheet Header styling
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#0F4C2C"); // Dark Green / Emerald
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Plus Jakarta Sans");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  for (let c = 1; c <= HEADERS.length; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Helper to build JSON responses
 */
function createJsonResponse(dataObj, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(dataObj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
