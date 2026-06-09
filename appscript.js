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
