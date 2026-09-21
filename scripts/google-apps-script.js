/**
 * =======================================================================================
 * GOOGLE APPS SCRIPT: COMPLETE FIREBASE AUTH & USER PROFILE RECEIVER WEBHOOK
 * =======================================================================================
 * Target Spreadsheet ID: 1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA
 * Spreadsheet URL: https://docs.google.com/spreadsheets/d/1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA/edit
 *
 * HOW TO INSTALL / UPDATE:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA/edit
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Replace all code in Code.gs with this entire file.
 * 4. Click "Deploy" (top right) -> "Manage deployments" -> Edit -> "New version" -> Deploy.
 *    (OR "Deploy" -> "New deployment" -> Web app -> Anyone -> Deploy).
 * =======================================================================================
 */

// 1. CONFIGURATION
const SPREADSHEET_ID = "1vc2xSb3i8RR1Pec0h6poBiwwa68VhN9aiJ7J8bShCNA";
const SHEET_TAB_NAME = "Users"; // Tab name inside the spreadsheet

// Comprehensive Auth & Profile Headers
const HEADERS = [
  "User ID (UID)",
  "Full Name",
  "Email Address",
  "Email Verified",
  "Phone Number",
  "Auth Provider",
  "Role",
  "Loyalty Points",
  "Account Status",
  "Created At",
  "Last Sign-In At",
  "Avatar / Photo URL",
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
      message: "Server is busy processing concurrent requests. Please try again."
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
    } else {
      // Ensure header row is up-to-date with 13 columns
      const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
      if (currentHeaders.length < HEADERS.length) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        formatHeaderRow(sheet);
      }
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
      const emailVerified = user.emailVerified === true ? "TRUE" : "FALSE";
      const phone = String(user.phone || user.phoneNumber || "N/A").trim();
      const provider = String(user.provider || "password").trim();
      const role = String(user.role || (email.includes("admin") ? "admin" : "trader")).trim();
      const points = Number(user.points || user.loyaltyPoints || 500);
      const status = user.disabled ? "Disabled" : "Active";
      const createdAt = String(user.createdAt || user.created_at || nowIso).trim();
      const lastSignInAt = String(user.lastSignInAt || user.lastLogin || nowIso).trim();
      const photoURL = String(user.photoURL || user.avatar || "N/A").trim();

      if (!uid && !email) return;

      const rowValues = [
        uid,
        name,
        email,
        emailVerified,
        phone,
        provider,
        role,
        points,
        status,
        createdAt,
        lastSignInAt,
        photoURL,
        nowIso
      ];

      // Check if user already exists
      const targetRow = uidRowMap.get(uid) || (email ? emailRowMap.get(email) : null);

      if (targetRow) {
        // Preserve phone if already set in sheet and not provided
        const existingPhone = sheet.getRange(targetRow, 5).getValue();
        if ((phone === "N/A" || !phone) && existingPhone && existingPhone !== "N/A") {
          rowValues[4] = existingPhone;
        }
        // Preserve createdAt if already in sheet
        const existingCreatedAt = sheet.getRange(targetRow, 10).getValue();
        if (existingCreatedAt) {
          rowValues[9] = existingCreatedAt;
        }

        sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([rowValues]);
        updatedCount++;
      } else {
        // Append brand new row
        sheet.appendRow(rowValues);
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
      headers: HEADERS,
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
    message: "Firebase All Auth Data to Google Sheets Webhook is active and operational.",
    targetSpreadsheetId: SPREADSHEET_ID,
    targetTab: SHEET_TAB_NAME,
    headers: HEADERS,
    timestamp: new Date().toISOString()
  });
}

/**
 * Format Sheet Header styling
 */
function formatHeaderRow(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#064E3B"); // Emerald 900
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
