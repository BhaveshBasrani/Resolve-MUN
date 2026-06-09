/**
 * RESOLVE MUN - MASTER SHEET BACKEND SYSTEM
 * Version: 1.0 (Secretariat Allocation & Check-in System)
 * 
 * Instructions:
 * 1. Install this script on your separate Master Allocation Sheet (Extensions > Apps Script).
 * 2. Deploy it as a Web App:
 *    - Execute as: Me (your email)
 *    - Who has access: Anyone
 * 3. Copy the Web App URL and paste it in `admin.html` and `portal.html`.
 */

const ADMIN_SECRET_KEY = "ResolveMUNAdmin2026@Secure";

// Headers required for full system functionality.
// If any are missing, the script will append them automatically on startup.
const REQUIRED_HEADERS = [
  "Delegate ID", 
  "Password", 
  "Allocation Committee", 
  "Allocation Country", 
  "Payment Verified", 
  "Check-in Day 1", 
  "Check-in Day 2", 
  "Check-in Day 3"
];

function grantPermissions() {
  DriveApp.getRootFolder();
  MailApp.getRemainingDailyQuota();
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : "{}");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Auto-detect and use the first sheet if "Master" sheet doesn't exist
    let sheet = ss.getSheetByName("Master") || ss.getSheetByName("Sheet1") || ss.getSheets()[0];
    if (!sheet) {
      throw new Error("No sheet found in the active spreadsheet.");
    }

    // Auto-create missing headers to ensure zero-setup required
    ensureHeaders(sheet);

    // Resolve column indexes dynamically based on header text
    const mapping = getHeaderMapping(sheet);

    // --- DELEGATE LOGIN (No admin key required) ---
    if (data.action === "DELEGATE_LOGIN") {
      return delegateLogin(sheet, mapping, data);
    }

    // --- ADMIN OPERATIONS (Security Key verification required) ---
    if (data.admin_key !== ADMIN_SECRET_KEY) {
      return returnJson({ status: "error", message: "Unauthorized access." });
    }

    switch (data.action) {
      case "ADMIN_GET_DATA":
        return adminGetData(sheet, mapping);
      case "ADMIN_APPROVE_DELEGATE":
        return adminApproveDelegate(sheet, mapping, data);
      case "ADMIN_CHECKIN_DELEGATE":
        return adminCheckinDelegate(sheet, mapping, data);
      default:
        return returnJson({ status: "error", message: "Invalid action." });
    }
  } catch (err) {
    return returnJson({ status: "error", message: err.toString() });
  }
}

// ==========================================
// CORE API ROUTE HANDLERS
// ==========================================

function delegateLogin(sheet, mapping, data) {
  const emailOrId = String(data.email || "").trim().toLowerCase();
  const password = String(data.password || "").trim();

  if (!emailOrId || !password) {
    throw new Error("Email/ID and Password are required.");
  }

  if (!mapping.email && !mapping.delegateId) {
    throw new Error("Spreadsheet missing columns for Email or Delegate ID.");
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("No delegates found in the sheet.");
  }

  const maxCols = sheet.getLastColumn();
  const values = sheet.getRange(2, 1, lastRow - 1, maxCols).getValues();

  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    
    const rowEmail = mapping.email ? String(row[mapping.email - 1] || "").trim().toLowerCase() : "";
    const rowDelId = mapping.delegateId ? String(row[mapping.delegateId - 1] || "").trim().toLowerCase() : "";
    const rowPassword = mapping.password ? String(row[mapping.password - 1] || "").trim() : "";

    if ((emailOrId === rowEmail || emailOrId === rowDelId) && password === rowPassword) {
      // Check payment status
      const paymentStatus = mapping.paymentVerified ? String(row[mapping.paymentVerified - 1] || "").trim() : "";
      if (paymentStatus.toLowerCase() !== "verified" && paymentStatus.toLowerCase() !== "approved") {
        return returnJson({ 
          status: "error", 
          message: "Your registration payment verification is pending. Please contact the Secretariat." 
        });
      }

      const delegateData = {
        name: mapping.name ? row[mapping.name - 1] : "Delegate",
        email: mapping.email ? row[mapping.email - 1] : "",
        phone: mapping.phone ? row[mapping.phone - 1] : "",
        delegateId: mapping.delegateId ? row[mapping.delegateId - 1] : "",
        committee: mapping.committee ? row[mapping.committee - 1] : "",
        country: mapping.country ? row[mapping.country - 1] : "",
        checkinDay1: mapping.day1 ? (row[mapping.day1 - 1] || "Absent") : "Absent",
        checkinDay2: mapping.day2 ? (row[mapping.day2 - 1] || "Absent") : "Absent",
        checkinDay3: mapping.day3 ? (row[mapping.day3 - 1] || "Absent") : "Absent"
      };

      return returnJson({ status: "success", delegate: delegateData });
    }
  }

  return returnJson({ status: "error", message: "Invalid email/ID or password." });
}

function adminGetData(sheet, mapping) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const dataList = [];

  if (lastRow > 1) {
    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = values[0];
    
    for (let r = 1; r < values.length; r++) {
      const obj = { rowIndex: r + 1 };
      for (let c = 0; c < headers.length; c++) {
        const headerName = headers[c] || ("Col_" + (c + 1));
        let val = values[r][c];
        if (val instanceof Date) {
          val = val.toISOString();
        }
        obj[headerName] = val;
      }
      dataList.push(obj);
    }
  }

  return returnJson({
    status: "success",
    data: {
      delegates: dataList
    }
  });
}

function adminApproveDelegate(sheet, mapping, data) {
  const rowIndex = parseInt(data.rowIndex, 10);
  const committee = String(data.allocationCommittee || "").trim();
  const country = String(data.allocationCountry || "").trim();
  const notes = String(data.notes || "").trim();

  if (isNaN(rowIndex) || rowIndex <= 1) {
    throw new Error("Invalid row index.");
  }

  const maxCols = sheet.getLastColumn();
  const rowValues = sheet.getRange(rowIndex, 1, 1, maxCols).getValues()[0];

  const name = mapping.name ? (rowValues[mapping.name - 1] || "Delegate") : "Delegate";
  const email = mapping.email ? rowValues[mapping.email - 1] : "";

  if (!email) {
    throw new Error("Delegate email not found on row " + rowIndex);
  }

  let delegateId = mapping.delegateId ? String(rowValues[mapping.delegateId - 1] || "").trim() : "";
  let password = mapping.password ? String(rowValues[mapping.password - 1] || "").trim() : "";

  if (!delegateId) {
    delegateId = generateDelegateId(sheet, mapping);
    if (mapping.delegateId) sheet.getRange(rowIndex, mapping.delegateId).setValue(delegateId);
  }
  if (!password) {
    password = generatePassword();
    if (mapping.password) sheet.getRange(rowIndex, mapping.password).setValue(password);
  }

  // Update sheet cells using mapping columns
  if (mapping.committee) sheet.getRange(rowIndex, mapping.committee).setValue(committee);
  if (mapping.country) sheet.getRange(rowIndex, mapping.country).setValue(country);
  if (mapping.paymentVerified) sheet.getRange(rowIndex, mapping.paymentVerified).setValue("Verified");
  if (mapping.status) sheet.getRange(rowIndex, mapping.status).setValue("Approved");
  if (mapping.notes) sheet.getRange(rowIndex, mapping.notes).setValue(notes);

  // Initialize day checks to Absent if blank
  if (mapping.day1 && !sheet.getRange(rowIndex, mapping.day1).getValue()) sheet.getRange(rowIndex, mapping.day1).setValue("Absent");
  if (mapping.day2 && !sheet.getRange(rowIndex, mapping.day2).getValue()) sheet.getRange(rowIndex, mapping.day2).setValue("Absent");
  if (mapping.day3 && !sheet.getRange(rowIndex, mapping.day3).getValue()) sheet.getRange(rowIndex, mapping.day3).setValue("Absent");

  // Send passcode email
  sendCredentialsEmail(email, name, delegateId, password, committee, country);

  return returnJson({
    status: "success",
    message: "Delegate approved and credentials email sent.",
    delegateId: delegateId,
    password: password
  });
}

function adminCheckinDelegate(sheet, mapping, data) {
  const delegateId = String(data.delegateId || "").trim();
  const day = parseInt(data.day, 10);
  const status = String(data.status || "Checked In").trim();

  if (!delegateId) {
    throw new Error("Delegate ID is required.");
  }
  if (day !== 1 && day !== 2 && day !== 3) {
    throw new Error("Invalid day parameter.");
  }
  if (!mapping.delegateId) {
    throw new Error("Delegate ID column is missing.");
  }

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    throw new Error("No delegates found.");
  }

  const ids = sheet.getRange(2, mapping.delegateId, lastRow - 1, 1).getValues().flat();
  let rowIndex = -1;
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i]).trim().toLowerCase() === delegateId.toLowerCase()) {
      rowIndex = i + 2;
      break;
    }
  }

  if (rowIndex === -1) {
    throw new Error("Delegate ID not found in sheet: " + delegateId);
  }

  // Update check-in column based on mapping
  const targetCol = mapping["day" + day];
  if (!targetCol) {
    throw new Error("Check-in Day " + day + " column mapping is missing.");
  }
  sheet.getRange(rowIndex, targetCol).setValue(status);

  return returnJson({
    status: "success",
    message: "Check-in updated successfully.",
    delegateId: delegateId,
    day: day,
    status: status
  });
}

// ==========================================
// DATA MAPPING & LAYOUT UTILITIES
// ==========================================

function getHeaderMapping(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const mapping = {};
  
  for (let i = 0; i < headers.length; i++) {
    const header = String(headers[i]).trim().toLowerCase();
    
    if (header === "full name" || header === "name") {
      mapping.name = i + 1;
    } else if (header === "email address" || header === "email" || header === "email id") {
      mapping.email = i + 1;
    } else if (header === "phone number" || header === "phone" || header === "contact" || header === "contact number") {
      mapping.phone = i + 1;
    } else if (header === "school / institution" || header === "school" || header === "institution" || header === "institute") {
      mapping.institute = i + 1;
    } else if (header === "delegate id" || header === "id") {
      mapping.delegateId = i + 1;
    } else if (header === "allocation committee" || header === "allocated committee" || header === "committee") {
      mapping.committee = i + 1;
    } else if (header === "allocation country" || header === "allocated country" || header === "country" || header === "role") {
      mapping.country = i + 1;
    } else if (header === "application status" || header === "status") {
      mapping.status = i + 1;
    } else if (header === "payment verified" || header === "verified" || header === "payment status") {
      mapping.paymentVerified = i + 1;
    } else if (header === "password" || header === "passcode") {
      mapping.password = i + 1;
    } else if (header === "check-in day 1" || header === "day 1 check-in" || header === "day 1") {
      mapping.day1 = i + 1;
    } else if (header === "check-in day 2" || header === "day 2 check-in" || header === "day 2") {
      mapping.day2 = i + 1;
    } else if (header === "check-in day 3" || header === "day 3 check-in" || header === "day 3") {
      mapping.day3 = i + 1;
    } else if (header === "secretariat notes" || header === "notes") {
      mapping.notes = i + 1;
    }
  }
  
  return mapping;
}

function ensureHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  const headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  const lowerHeaders = headers.map(h => String(h).trim().toLowerCase());
  
  const missing = [];
  REQUIRED_HEADERS.forEach(req => {
    if (lowerHeaders.indexOf(req.toLowerCase()) === -1) {
      missing.push(req);
    }
  });

  if (missing.length > 0) {
    const startCol = lastCol + 1;
    sheet.insertColumnsAfter(Math.max(lastCol, 1), missing.length);
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
  }
}

function generateDelegateId(sheet, mapping) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1 || !mapping.delegateId) return "RES-DEL-1001";
  
  const ids = sheet.getRange(2, mapping.delegateId, lastRow - 1, 1).getValues().flat();
  let maxNum = 1000;
  
  for (let i = 0; i < ids.length; i++) {
    const id = String(ids[i]).trim();
    if (id.startsWith("RES-DEL-")) {
      const num = parseInt(id.replace("RES-DEL-", ""), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return "RES-DEL-" + (maxNum + 1);
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

function returnJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// EMAIL NOTIFICATION SYSTEM
// ==========================================

function sendCredentialsEmail(email, name, delegateId, password, committee, country) {
  const logoUrl = "https://resolvemun.in/images/Logo.png";
  const heroUrl = "https://resolvemun.in/images/OG.jpg";
  const loginUrl = "https://resolvemun.in/portal.html";
  const whatsappUrl = "https://chat.whatsapp.com/L3mFzvabjWYJ2wz29Y0M33";

  const subject = "Resolve MUN 2026 - Your Delegate Credentials & Allocations";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="background-color:#050507; margin:0; padding:40px 0; font-family:'Inter', Arial, sans-serif; color:#f5f5f7;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:600px; background-color:#070712; border: 1px solid #330e5c; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(51, 14, 146, 0.25);">
            
            <!-- Header Logo -->
            <tr>
              <td align="center" style="padding:40px 20px; background: linear-gradient(180deg, #1f083d 0%, #070712 100%);">
                <img src="${logoUrl}" width="160" alt="Resolve MUN Logo" style="display:block;">
                <p style="color:#7c3aed; font-size:12px; text-transform:uppercase; letter-spacing:2px; margin-top:15px; font-weight:600; margin-bottom:0;">Elite Diplomatic Discourse</p>
              </td>
            </tr>
            
            <!-- Main Content -->
            <tr>
              <td style="padding:40px; background-color:#070712;">
                <h2 style="color:#ffffff; font-size:24px; font-weight:700; text-align:center; margin-top:0; margin-bottom:10px; font-family:'Crimson Pro', Georgia, serif;">Welcome to the Arena of Diplomacy</h2>
                <p style="color:rgba(255,255,255,0.7); font-size:15px; line-height:1.6; text-align:center; margin-bottom:30px;">Dear ${name}, your registration has been successfully verified! Below are your official delegate credentials and portfolio allocations.</p>
                
                <!-- Allocations Box -->
                <table width="100%" style="background-color:rgba(255,255,255,0.03); border: 1px solid rgba(124,58,237,0.2); border-radius: 12px; margin-bottom:25px; padding:20px;">
                  <tr>
                    <td style="color:#7c3aed; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding-bottom:5px;">Allocated Committee</td>
                  </tr>
                  <tr>
                    <td style="color:#ffffff; font-size:18px; font-weight:600; padding-bottom:15px;">${committee || "To Be Allocated"}</td>
                  </tr>
                  <tr>
                    <td style="color:#7c3aed; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; padding-bottom:5px;">Allocated Country / Role</td>
                  </tr>
                  <tr>
                    <td style="color:#ffffff; font-size:18px; font-weight:600;">${country || "To Be Allocated"}</td>
                  </tr>
                </table>

                <!-- Login Credentials Box -->
                <table width="100%" style="background: linear-gradient(135deg, rgba(51, 14, 92, 0.3) 0%, rgba(124, 58, 237, 0.1) 100%); border: 1px solid rgba(124,58,237,0.3); border-radius: 12px; margin-bottom:30px; padding:20px;">
                  <tr>
                    <td colspan="2" style="color:#ffffff; font-size:16px; font-weight:700; padding-bottom:15px; border-bottom: 1px solid rgba(255,255,255,0.1);">Your Login Credentials</td>
                  </tr>
                  <tr>
                    <td style="color:rgba(255,255,255,0.6); font-size:13px; padding-top:15px; padding-bottom:5px; width:40%;">Delegate ID / Email</td>
                    <td style="color:#ffffff; font-size:14px; font-weight:600; padding-top:15px; padding-bottom:5px; text-align:right;">${delegateId} <span style="color:rgba(255,255,255,0.4); font-size:12px;">(or ${email})</span></td>
                  </tr>
                  <tr>
                    <td style="color:rgba(255,255,255,0.6); font-size:13px; padding-bottom:5px;">Password</td>
                    <td style="color:#7c3aed; font-size:16px; font-weight:700; padding-bottom:5px; text-align:right; letter-spacing:1px;">${password}</td>
                  </tr>
                </table>

                <!-- CTA Buttons -->
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-top:20px; margin-bottom:20px;">
                  <tr>
                    <td align="center" style="padding-bottom:15px;">
                      <a href="${loginUrl}" style="display:inline-block; background: linear-gradient(90deg, #510e92 0%, #7c3aed 100%); color:#ffffff; padding:14px 30px; font-size:14px; font-weight:700; text-decoration:none; border-radius:8px; text-transform:uppercase; letter-spacing:1px; box-shadow: 0 4px 15px rgba(124,58,237,0.4);">Access Delegate Portal</a>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <a href="${whatsappUrl}" style="display:inline-block; background-color:#25d366; color:#ffffff; padding:10px 24px; font-size:13px; font-weight:700; text-decoration:none; border-radius:8px; box-shadow: 0 4px 12px rgba(37,211,102,0.3);">💬 Join Official WhatsApp Group</a>
                    </td>
                  </tr>
                </table>

                <p style="color:rgba(255,255,255,0.5); font-size:13px; line-height:1.5; text-align:center; margin-top:30px;">
                  Once logged in to the portal, you will be able to retrieve your unique QR check-in code, view your agenda, and track your attendance for the three days of the conference.
                </p>
              </td>
            </tr>
            
            <!-- Footer Graphic -->
            <tr>
              <td align="center" style="padding:0 30px 30px 30px;">
                <img src="${heroUrl}" width="100%" style="border-radius:10px; border:1px solid rgba(255,255,255,0.05);">
              </td>
            </tr>
            
            <!-- Footer Details -->
            <tr>
              <td align="center" style="padding:30px; background-color:#050507; border-top:1px solid rgba(255,255,255,0.05);">
                <h4 style="margin:0 0 5px 0; font-size:14px; color:#ffffff; font-family:'Oswald', sans-serif; letter-spacing:1px;">RESOLVE MUN 2026</h4>
                <p style="color:#8e8e93; font-size:11px; margin:0;">Laurus The Universal School, Bowrampet, Hyderabad.</p>
                <p style="color:rgba(124,58,237,0.6); font-size:11px; margin-top:5px; margin-bottom:0;">Please do not reply directly to this email.</p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: html
  });
}
