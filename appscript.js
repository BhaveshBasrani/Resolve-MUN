/**

 * RESOLVE MUN - INTEGRATED BACKEND SYSTEM

 * Version: 2.2 (Round One Alignment & Data Integrity)

 * * Instructions:

 * 1. Replace RECAPTCHA_SECRET_KEY with your actual secret.

 * 2. Ensure Sheet1 has the new "DOB" column inserted after "Email Address".

 * 3. Save and deploy as a new Web App version.

 */



const RECAPTCHA_SECRET_KEY = "6LfocLUqAAAAAJTci06PqHsSNjlRV67PwosL939_";



const SHEET_NAMES = {

    WAITLIST: "Sheet",               // Tab for Waitlist

    DELEGATE: "Sheet1",              // Tab for Individual Delegates

    OC: "Sheet2",                    // Tab for OC Applications

    DELEGATION: "Sheet3",            // Tab for Group Delegations

    EB: "Sheet4"                     // Tab for EB Applications

};



function grantPermissions() {

    DriveApp.getRootFolder();

    MailApp.getRemainingDailyQuota();

}



function doPost(e) {

    try {

        const data = JSON.parse((e && e.postData && e.postData.contents) ? e.postData.contents : "{}");

        const ss = SpreadsheetApp.getActiveSpreadsheet();



        // ROUTE DASHBOARD ACTIONS FIRST (bypass normal registration recaptcha)

        if (data.action) {

            return handleDashboardActions(ss, data);

        }



        // 1. RECAPTCHA V3 VERIFICATION

        if (!data.recaptcha_token) throw new Error("Security verification missing.");

        const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

        const recaptchaResp = UrlFetchApp.fetch(verifyUrl, {

            method: "post",

            payload: { secret: RECAPTCHA_SECRET_KEY, response: data.recaptcha_token }

        });

        if (!JSON.parse(recaptchaResp.getContentText()).success) throw new Error("reCAPTCHA Failed.");



        let emailType = "";

        let recipientName = data.name || "Delegate";

        let targetEmail = data.email || data.adviserEmail;



        // 2. ROUTING LOGIC



        // --- WAITLIST ---

        if (data.type === 'WAITLIST_ENTRY') {

            const sheet = getOrCreateSheet(ss, SHEET_NAMES.WAITLIST);

            sheet.appendRow([new Date(), data.email]);

            emailType = "WAITLIST";

        }



        // --- INDIVIDUAL DELEGATE (31 COLUMNS - Includes DOB) ---

        else if (data.type === "DELEGATE_REGISTRATION") {

            const sheet = getOrCreateSheet(ss, SHEET_NAMES.DELEGATE);

            const fileUrl = saveFileToDrive(data.payment_screenshot_link, (data.name || "Delegate") + "_Payment", "Delegate Payments");



            sheet.appendRow([

                new Date(),                 // 1. Timestamp

                data.name || "",            // 2. Full Name

                data.grade || "",           // 3. Grade / Class

                data.phone || "",           // 4. Phone Number

                data.email || "",           // 5. Email Address

                data.dob || "",             // 6. DOB (Newly added to frontend and sheet)

                data.institute || "",       // 7. School / Institution

                data.address || "",         // 8. Residential Address

                data.transport || "",       // 9. Transport Requirement

                data.experience || "",      // 10. Previous MUN Experience

                data.pref1_committee || "", // 11. Preference 1 Committee

                data.pref1_country || "",   // 12. Preference 1 Country

                data.pref2_committee || "", // 13. Preference 2 Committee

                data.pref2_country || "",   // 14. Preference 2 Country

                data.pref3_committee || "", // 15. Preference 3 Committee

                data.pref3_country || "",   // 16. Preference 3 Country

                "UPI",                      // 17. Payment Method

                data.amount || "2999",      // 18. Payment Amount (Round One Default)

                data.payment_utr || data.txn_id || "", // 19. Transaction ID / UTR Number

                fileUrl,                    // 20. Payment Screenshot Link

                new Date().toLocaleDateString(), // 21. Payment Date

                "Pending",                  // 22. Application Status

                "",                         // 23. Delegate ID

                "",                         // 24. Allocation Committee

                "",                         // 25. Allocation Country

                "Pending",                  // 26. Payment Verified

                "Not Checked",              // 27. Check-in Status

                data.emergency_name || "",  // 28. Emergency Contact Name

                data.emergency_phone || "", // 29. Emergency Contact Phone

                "",                         // 30. Secretariat Notes

                data.referral || ""         // 31. Referral Source

            ]);

            emailType = "DELEGATE";

        }



        // --- OC APPLICATION (14 COLUMNS) ---

        else if (data.type === "OC_APPLICATION") {

            const sheet = getOrCreateSheet(ss, SHEET_NAMES.OC);

            const fileUrl = saveFileToDrive(data.payment_screenshot_link, (data.name || "OC") + "_Payment", "OC Registrations");



            sheet.appendRow([

                new Date(),                 // 1. Timestamp

                data.name || "",            // 2. Full Name

                data.grade || "",           // 3. Grade / Class

                data.phone || "",           // 4. Phone Number

                data.email || "",           // 5. Email Address

                data.dob || "",             // 6. DOB

                data.institute || "",       // 7. School / Institution

                data.instagram || "",       // 8. Instagram ID

                data.munCount || "",        // 9. Previous MUN Experience

                data.why || "",             // 10. Why OC?

                data.attributes || "",      // 11. Attributes

                data.payment_utr || data.txn_id || "", // 12. Transaction ID

                fileUrl,                    // 13. Payment Screenshot Link

                "Pending"                   // 14. Payment Verified (Matches Sheet2 layout)

            ]);

            emailType = "OC";

        }



        // --- DELEGATION (DYNAMIC COLUMNS) ---

        else if (data.type === "DELEGATION_APPLICATION") {

            const sheet = getOrCreateSheet(ss, SHEET_NAMES.DELEGATION);

            const fileUrl = saveFileToDrive(data.driveLink, (data.instName || "Group") + "_Payment", "Group Payments");

            data.driveLink = fileUrl;

            appendDelegationRow(sheet, data);

            emailType = "DELEGATION";

            recipientName = data.adviserName || "Faculty Adviser";

        }



        // --- EB APPLICATION (13 COLUMNS) ---

        else if (data.type === "EB_APPLICATION") {

            const sheet = getOrCreateSheet(ss, SHEET_NAMES.EB);

            const fileUrl = saveFileToDrive(data.cv_file, (data.name || "EB") + "_CV", "EB Portfolios");



            sheet.appendRow([

                new Date(),                 // 1. Timestamp

                data.name || "",            // 2. Full Name

                data.dob || "",             // 3. Age / DOB

                data.phone || "",           // 4. Phone Number

                data.email || "",           // 5. Email Address

                data.institute || "",       // 6. Institution

                data.position || "",        // 7. Position Applied For

                data.committees || "",      // 8. Preferred Committee

                data.munCount || "",        // 9. Total MUNs

                data.experience || "",      // 10. Previous EB Experience

                data.why || "",             // 11. Why EB?

                fileUrl,                    // 12. Link to Portfolio

                "Pending Review"            // 13. Application Status

            ]);

            emailType = "EB";

        }



        // 3. SEND EMAIL

        if (targetEmail && emailType) {

            const emailContent = generateLightEmail(emailType, recipientName);

            MailApp.sendEmail({

                to: targetEmail,

                subject: emailContent.subject,

                htmlBody: emailContent.html

            });

        }



        return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);



    } catch (err) {

        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);

    }

}



// ==========================================

// FILE UPLOAD HELPER

// ==========================================

function saveFileToDrive(dataUrl, fileName, folderName) {

    if (!dataUrl || !dataUrl.startsWith("data:")) return dataUrl || "";

    try {

        const parts = dataUrl.split(',');

        const mime = parts[0].split(':')[1].split(';')[0];

        const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];

        const blob = Utilities.newBlob(Utilities.base64Decode(parts[1]), mime, `${fileName}.${ext}`);



        let folder;

        const folders = DriveApp.getFoldersByName(folderName);

        folder = folders.hasNext() ? folders.next() : DriveApp.getRootFolder().createFolder(folderName);



        const file = folder.createFile(blob);

        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        return file.getUrl();

    } catch (e) { return "Upload Error: " + e.toString(); }

}



// ==========================================

// HELPER FUNCTIONS

// ==========================================

function getOrCreateSheet(ss, sheetName) {

    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) sheet = ss.insertSheet(sheetName);

    return sheet;

}



function appendDelegationRow(sheet, data) {

    const fixedHeaders = ["Timestamp", "Institution Name", "Faculty Adviser Name", "Adviser Phone", "Adviser Email", "Number of Delegates", "Transaction ID", "Payment Screenshot Link", "Total Amount"];

    const delegates = Array.isArray(data.delegates) ? data.delegates : [];

    const safeSize = Math.max(Number(data.size) || delegates.length || 0, delegates.length);



    ensureDynamicColumns(sheet, fixedHeaders, safeSize);



    const row = [new Date(), data.instName || "", data.adviserName || "", data.adviserPhone || "", data.adviserEmail || "", safeSize, data.txnID || "", data.driveLink || "", data.totalAmount || ""];

    for (let i = 0; i < safeSize; i++) {

        const d = delegates[i] || {};

        row.push(d.name || "", d.phone || "", d.email || "", d.pref || "", d.country || "");

    }

    sheet.appendRow(row);

}



function ensureDynamicColumns(sheet, fixedHeaders, delegateCount) {

    const perDelegateCols = 5;

    const requiredCols = fixedHeaders.length + (delegateCount * perDelegateCols);

    if (sheet.getMaxColumns() < requiredCols) {

        sheet.insertColumnsAfter(sheet.getMaxColumns(), requiredCols - sheet.getMaxColumns());

    }

    const expectedHeaders = fixedHeaders.slice();

    for (let i = 1; i <= delegateCount; i++) {

        expectedHeaders.push(`Delegate ${i} Name`, `Delegate ${i} Phone`, `Delegate ${i} Email`, `Delegate ${i} Committee Pref`, `Delegate ${i} Country/Role Pref`);

    }

    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);

}



// ==========================================

// EMAIL GENERATOR

// ==========================================

function generateLightEmail(type, name) {

    const logoUrl = "https://resolvemun.in/images/Logo.png";

    const heroUrl = "https://resolvemun.in/images/OG.jpg";



    let subject = "Resolve MUN Update";

    let headerText = "Application Received.";

    let subtitle = "Forging the statesmen of tomorrow.";

    let bodyText = "";



    if (type === "WAITLIST") {

        subject = "Resolve MUN - Priority Waitlist Confirmed";

        headerText = "Waitlist Secured.";

        bodyText = `Dear ${name},<br><br>You have successfully registered your interest for Resolve MUN. We will notify you the moment Phase 1 registrations open so you can secure your preferred portfolio.`;

    } else if (type === "DELEGATE") {

        subject = "Resolve MUN - Registration Received";

        headerText = "Application Received.";

        bodyText = `Dear ${name},<br><br>Your individual delegate application has been submitted. Our Finance Directorate is verifying your transaction. You will receive an official confirmation and allocation shortly.`;

    } else if (type === "OC") {

        subject = "Resolve MUN - OC Application Logged";

        headerText = "Application Secured.";

        bodyText = `Dear ${name},<br><br>Thank you for applying to the Organizing Committee. Your payment and profile have been logged. We will reach out regarding interview schedules shortly.`;

    } else if (type === "DELEGATION") {

        subject = "Resolve MUN - Delegation Application Received";

        headerText = "Delegation Registered.";

        bodyText = `Dear ${name},<br><br>Your institution's application is now in our system. Our Secretariat is reviewing the payment and will coordinate allocations with you shortly.`;

    } else if (type === "EB") {

        subject = "Resolve MUN - EB Application Received";

        headerText = "EB Candidacy Registered.";

        bodyText = `Dear ${name},<br><br>Your EB application and portfolio have been received. The Secretariat will conduct a thorough review and contact you regarding the next steps.`;

    }



    const html = `

  <!DOCTYPE html>

  <html>

  <body style="background-color:#f4f4f5; margin:0; padding:40px 0; font-family:Arial, sans-serif;">

    <table width="100%" border="0" cellpadding="0" cellspacing="0">

      <tr>

        <td align="center">

          <table width="100%" style="max-width:600px; background-color:#ffffff; border: 1px solid #e5e5ea; border-radius: 12px; overflow: hidden;">

            <tr><td align="center" style="padding:40px 20px;"><img src="${logoUrl}" width="180"></td></tr>

            <tr>

              <td style="padding:20px 40px 40px 40px;">

                <p style="color:#8e8e93; font-size:12px; text-transform:uppercase; letter-spacing:1.5px; text-align:center;">${subtitle}</p>

                <h2 style="color:#111111; text-align:center;">${headerText}</h2>

                <hr style="border:0; border-top:1px solid #f0f0f0; margin:20px 0;">

                <p style="color:#3a3a3c; font-size:16px; line-height:1.6;">${bodyText}</p>

                <div align="center" style="margin-top:30px;">

                  <a href="https://www.instagram.com/mun.resolve/" style="background-color:#111111; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:8px; font-weight:bold;">Follow Updates</a>

                </div>

              </td>

            </tr>

            <tr><td align="center" style="padding:0 40px 40px 40px;"><img src="${heroUrl}" width="100%" style="border-radius:8px;"></td></tr>

            <tr>

              <td align="center" style="padding:30px; background-color:#fafafa;">

                <h3 style="margin:0; font-size:14px;">RESOLVE MUN</h3>

                <p style="color:#8e8e93; font-size:12px;">Elite Diplomatic Discourse.</p>

              </td>

            </tr>

          </table>

        </td>

      </tr>

    </table>

  </body>

  </html>`;



    return { subject, html };

}



// ==========================================

// DASHBOARD & DELEGATE PORTAL BACKEND LOGIC

// ==========================================



const ADMIN_SECRET_KEY = "ResolveMUNAdmin2026@Secure";



function handleDashboardActions(ss, data) {

    const action = data.action;



    try {

        // Delegate Login (No admin key needed, uses email/password)

        if (action === "DELEGATE_LOGIN") {

            return delegateLogin(ss, data);

        }



        // All other actions require admin_key validation

        if (data.admin_key !== ADMIN_SECRET_KEY) {

            return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Unauthorized access." })).setMimeType(ContentService.MimeType.JSON);

        }



        switch (action) {

            case "ADMIN_GET_DATA":

                return adminGetData(ss);

            case "ADMIN_APPROVE_DELEGATE":

                return adminApproveDelegate(ss, data);

            case "ADMIN_CHECKIN_DELEGATE":

                return adminCheckinDelegate(ss, data);

            default:

                return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Invalid action." })).setMimeType(ContentService.MimeType.JSON);

        }

    } catch (e) {

        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: e.toString() })).setMimeType(ContentService.MimeType.JSON);

    }

}



function delegateLogin(ss, data) {

    const email = String(data.email || "").trim().toLowerCase();

    const password = String(data.password || "").trim();



    if (!email || !password) {

        throw new Error("Email/ID and Password are required.");

    }



    const sheet = ss.getSheetByName(SHEET_NAMES.DELEGATE);

    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {

        throw new Error("No delegates registered yet.");

    }



    const maxCols = Math.max(sheet.getLastColumn(), 35);

    const values = sheet.getRange(2, 1, lastRow - 1, maxCols).getValues();



    for (let i = 0; i < values.length; i++) {

        const row = values[i];

        const rowEmail = String(row[4] || "").trim().toLowerCase();      // Column 5: Email Address

        const rowDelId = String(row[22] || "").trim().toLowerCase();     // Column 23: Delegate ID

        const rowPassword = String(row[31] || "").trim();               // Column 32: Password



        if ((email === rowEmail || email === rowDelId) && password === rowPassword) {

            const paymentVerified = String(row[25] || "").trim();       // Column 26: Payment Verified

            if (paymentVerified !== "Verified") {

                return ContentService.createTextOutput(JSON.stringify({ 

                    status: "error", 

                    message: "Your registration payment verification is pending. Please contact the Secretariat." 

                })).setMimeType(ContentService.MimeType.JSON);

            }



            const delegateData = {

                name: row[1],

                email: row[4],

                phone: row[3],

                delegateId: row[22],

                committee: row[23],

                country: row[24],

                checkinDay1: row[32] || "Absent",

                checkinDay2: row[33] || "Absent",

                checkinDay3: row[34] || "Absent"

            };



            return ContentService.createTextOutput(JSON.stringify({

                status: "success",

                delegate: delegateData

            })).setMimeType(ContentService.MimeType.JSON);

        }

    }



    return ContentService.createTextOutput(JSON.stringify({

        status: "error",

        message: "Invalid email/ID or password."

    })).setMimeType(ContentService.MimeType.JSON);

}



function adminGetData(ss) {

    const data = {

        waitlist: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.WAITLIST)),

        delegates: getSheetDataAsObjects(ss.getSheetByName(SHEET_NAMES.DELEGATE))

    };



    return ContentService.createTextOutput(JSON.stringify({

        status: "success",

        data: data

    })).setMimeType(ContentService.MimeType.JSON);

}



function adminApproveDelegate(ss, data) {

    const rowIndex = parseInt(data.rowIndex, 10);

    const committee = String(data.allocationCommittee || "").trim();

    const country = String(data.allocationCountry || "").trim();

    const notes = String(data.notes || "").trim();



    if (isNaN(rowIndex) || rowIndex <= 1) {

        throw new Error("Invalid row index.");

    }



    const sheet = ss.getSheetByName(SHEET_NAMES.DELEGATE);

    const currentMaxCols = sheet.getMaxColumns();

    if (currentMaxCols < 35) {

        sheet.insertColumnsAfter(currentMaxCols, 35 - currentMaxCols);

    }



    const lastCol = sheet.getLastColumn();

    const rowRange = sheet.getRange(rowIndex, 1, 1, Math.max(lastCol, 35));

    const rowValues = rowRange.getValues()[0];



    const recipientName = rowValues[1] || "Delegate";

    const targetEmail = rowValues[4];



    if (!targetEmail) {

        throw new Error("Delegate email not found on row " + rowIndex);

    }



    let delegateId = String(rowValues[22] || "").trim();

    let password = String(rowValues[31] || "").trim();



    if (!delegateId || delegateId === "") {

        delegateId = generateDelegateId(sheet);

    }

    if (!password || password === "") {

        password = generatePassword();

    }



    sheet.getRange(rowIndex, 22).setValue("Approved");

    sheet.getRange(rowIndex, 23).setValue(delegateId);

    sheet.getRange(rowIndex, 24).setValue(committee);

    sheet.getRange(rowIndex, 25).setValue(country);

    sheet.getRange(rowIndex, 26).setValue("Verified");

    sheet.getRange(rowIndex, 30).setValue(notes);

    sheet.getRange(rowIndex, 32).setValue(password);

    

    if (!sheet.getRange(rowIndex, 33).getValue()) sheet.getRange(rowIndex, 33).setValue("Absent");

    if (!sheet.getRange(rowIndex, 34).getValue()) sheet.getRange(rowIndex, 34).setValue("Absent");

    if (!sheet.getRange(rowIndex, 35).getValue()) sheet.getRange(rowIndex, 35).setValue("Absent");



    sendCredentialsEmail(targetEmail, recipientName, delegateId, password, committee, country);



    return ContentService.createTextOutput(JSON.stringify({

        status: "success",

        message: "Delegate approved and credentials email sent.",

        delegateId: delegateId,

        password: password

    })).setMimeType(ContentService.MimeType.JSON);

}







function adminCheckinDelegate(ss, data) {

    const delegateId = String(data.delegateId || "").trim();

    const day = parseInt(data.day, 10);

    const checkinStatus = String(data.status || "Checked In").trim();



    if (!delegateId) {

        throw new Error("Delegate ID is required.");

    }

    if (day !== 1 && day !== 2 && day !== 3) {

        throw new Error("Invalid day (must be 1, 2, or 3).");

    }



    const sheet = ss.getSheetByName(SHEET_NAMES.DELEGATE);

    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {

        throw new Error("No delegates registered yet.");

    }



    const ids = sheet.getRange(2, 23, lastRow - 1, 1).getValues().flat();

    let rowIndex = -1;

    for (let i = 0; i < ids.length; i++) {

        if (String(ids[i]).trim().toLowerCase() === delegateId.toLowerCase()) {

            rowIndex = i + 2;

            break;

        }

    }



    if (rowIndex === -1) {

        throw new Error("Delegate ID not found: " + delegateId);

    }



    const targetCol = 32 + day;

    sheet.getRange(rowIndex, targetCol).setValue(checkinStatus);



    return ContentService.createTextOutput(JSON.stringify({

        status: "success",

        message: "Delegate " + delegateId + " checked in for Day " + day + " as " + checkinStatus,

        delegateId: delegateId,

        day: day,

        checkinStatus: checkinStatus

    })).setMimeType(ContentService.MimeType.JSON);
}



function generateDelegateId(sheet) {

    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) return "RES-DEL-1001";

    const ids = sheet.getRange(2, 23, lastRow - 1, 1).getValues().flat();

    let maxNum = 1000;

    for (let i = 0; i < ids.length; i++) {

        const id = String(ids[i]);

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



function getSheetDataAsObjects(sheet) {

    if (!sheet) return [];

    const lastRow = sheet.getLastRow();

    const lastCol = sheet.getLastColumn();

    if (lastRow <= 1) return [];

    const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();

    const headers = values[0];

    const data = [];

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

        data.push(obj);

    }

    return data;

}



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
