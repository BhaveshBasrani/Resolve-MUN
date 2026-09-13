/**
 * ============================================================================
 * RESOLVE MUN 2026 — DIPLOMATIC ENGINE & OFFICIAL MAILING SYSTEM
 * Version: 4.0.0 (Prestige Diplomatic Dispatch & Secure Storage Engine)
 * 
 * Venue: Delhi World Public School, Kompally, Hyderabad
 * Dates: 20th – 22nd November 2026
 * 
 * Features:
 *   - Official Security Verification Key (SEND_VERIFICATION_CODE)
 *   - Auto-Emails on Intake (Delegate, Delegation, EB, OC, Secretariat)
 *   - Financial Clearance & Receipt Confirmation (PAYMENT_VERIFIED)
 *   - Official Committee & Country Allotment Decrees (ALLOCATION_CONFIRMED)
 *   - Google Drive Multi-Folder Storage (Screenshots, Institutional Proof, CVs)
 *   - Full reCAPTCHA v2/v3 Verification
 *   - Dual Failover Dispatch (MailApp -> GmailApp)
 * ============================================================================
 */

const CONFIG = {
  SENDER_NAME: "Resolve MUN 2026 Secretariat",
  REPLY_TO: "resolve.mun@gmail.com",
  CONFERENCE_DATES: "20th – 22nd November 2026",
  VENUE: "Delhi World Public School, Kompally, Hyderabad",
  PORTAL_URL: "https://resolvemun.com/auth",
  RECAPTCHA_SECRET_KEY: PropertiesService.getScriptProperties().getProperty("RECAPTCHA_SECRET_KEY") || "6LesB7gtAAAAAL5lax4c0NxE6GWWanZrcgjkwISQ",
  ADMIN_KEY: PropertiesService.getScriptProperties().getProperty("ADMIN_KEY") || "ResolveMUNAdmin2026@Secure",
  MAX_REQUESTS_PER_MINUTE: 30,
  ENABLE_RECAPTCHA_VERIFY: true,
  VERSION: "4.0.0",
  FOLDERS: {
    DELEGATE_PAYMENTS: "Resolve_MUN_Delegate_Payments",
    DELEGATION_PAYMENTS: "Resolve_MUN_Delegation_Payments",
    EB_CVS: "Resolve_MUN_EB_CVs",
    OC_CVS: "Resolve_MUN_OC_CVs",
    SEC_CVS: "Resolve_MUN_Secretariat_CVs"
  }
};

// SCHEMAS FOR AUTO-HEALING SPREADSHEETS
const SCHEMAS = {
  "Users": [
    "Timestamp", "UID", "DisplayName", "Email", "PhotoURL", "Role", "Status", "LastLogin"
  ],
  "Registrations": [
    "Timestamp", "RegID", "UID", "FullName", "Email", "Phone", "Institution", 
    "CommitteePref1", "CommitteePref2", "CommitteePref3", "Experience", "PaymentUTR", 
    "PaymentScreenshotURL", "Status", "AllocatedCommittee", "AllocatedCountry", 
    "DelegationCode", "AllotmentEmailSent"
  ],
  "Delegations": [
    "Timestamp", "DelID", "DelegationCode", "DelegationName", "HeadName", "HeadEmail", 
    "HeadPhone", "MemberCount", "PaymentUTR", "PaymentScreenshotURL", "Status", "RosterJSON"
  ],
  "EB_Applications": [
    "Timestamp", "AppID", "UID", "FullName", "Email", "Phone", "PrefCommittee1", 
    "PrefCommittee2", "MUNExperience", "ExecutiveSummary", "CV_URL", "Status"
  ],
  "OC_Applications": [
    "Timestamp", "AppID", "UID", "FullName", "Email", "Phone", "Department1", 
    "Department2", "StatementOfPurpose", "CV_URL", "Status"
  ],
  "Secretariat_Applications": [
    "Timestamp", "AppID", "UID", "FullName", "Email", "Phone", "Department", 
    "Experience", "StatementOfPurpose", "CV_URL", "Status"
  ],
  "Waitlist": [
    "Timestamp", "WaitlistID", "FullName", "Email", "Phone", "Status", "PriorityScore"
  ],
  "Abandoned_Leads": [
    "Timestamp", "LeadID", "FullName", "Email", "Phone", "FormType", "LastStep", "Status"
  ],
  "Site_Settings": [
    "SettingKey", "SettingValue", "LastUpdated", "UpdatedBy"
  ],
  "Attendance_Logs": [
    "Timestamp", "DelegateID", "Day", "VerifiedBy", "SecurityHash", "Status"
  ],
  "Audit_Logs": [
    "Timestamp", "Action", "ActorEmail", "Status", "Details"
  ],
  "Email_Logs": [
    "Timestamp", "Action", "RecipientEmail", "RecipientName", "Status"
  ]
};

/**
 * Run once from the Google Apps Script editor to authorize all permissions
 */
function getPermissions() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("=== Resolve MUN 2026 Engine Online ===");
  Logger.log("Venue: " + CONFIG.VENUE);
  Logger.log("Remaining Daily Email Quota: " + quota);
  try { GmailApp.getInboxThreads(0, 1); } catch (_) {}
  try { DriveApp.getRootFolder(); } catch (_) {}
  try { SpreadsheetApp.getActiveSpreadsheet(); } catch (_) {}
  return "PERMISSIONS GRANTED. Venue: " + CONFIG.VENUE + ". Available Email Quota: " + quota;
}

function grantPermissions() {
  return getPermissions();
}

/**
 * HTTP GET Handler
 */
function doGet(e) {
  try {
    repairAndInitDatabase();
    const action = (e && e.parameter && e.parameter.action) || "HEALTH_CHECK";

    if (action === "HEALTH_CHECK") {
      return jsonResponse({
        status: "success",
        system: "Resolve MUN 2026 Secretariat Engine",
        version: CONFIG.VERSION,
        venue: CONFIG.VENUE,
        dates: CONFIG.CONFERENCE_DATES,
        remainingDailyEmailQuota: MailApp.getRemainingDailyQuota(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "TEST_EMAIL" && e.parameter && e.parameter.email) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      sendVerificationCode(e.parameter.email, code, "Distinguished Delegate");
      return jsonResponse({
        status: "success",
        message: "Test verification dispatch transmitted to " + e.parameter.email,
        code: code,
        venue: CONFIG.VENUE,
        remainingQuota: MailApp.getRemainingDailyQuota()
      });
    }

    if (action === "GET_SETTINGS") {
      return jsonResponse(getSiteSettings());
    }

    if (action === "GET_DELEGATE" || action === "GET_DELEGATE_DATA") {
      const email = e.parameter.email;
      if (!email) return errorResponse("Email required", 400);
      return jsonResponse(getDelegateByEmail(email));
    }

    if (action === "ADMIN_GET_ALL" || action === "GET_ADMIN_DATA") {
      if (e.parameter.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
      return jsonResponse(adminGetAllRecords());
    }

    if (action === "ADMIN_GET_LEADS") {
      if (e.parameter.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
      return jsonResponse(adminGetAbandonedLeads());
    }

    return errorResponse("Unknown GET action: " + action, 400);
  } catch (err) {
    return errorResponse(err.message, 500);
  }
}

/**
 * HTTP POST Handler
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    try { lock.waitLock(20000); } catch (_) {}
    repairAndInitDatabase();

    if (!e || !e.postData || !e.postData.contents) {
      return errorResponse("Missing POST request body", 400);
    }

    let payload = {};
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return errorResponse("Malformed JSON payload", 400);
    }

    let action = payload.action || payload.type || "UNKNOWN";
    if (action === "DELEGATE_REGISTRATION") action = "SUBMIT_DELEGATE";
    if (action === "DELEGATION_APPLICATION") action = "SUBMIT_DELEGATION";
    if (action === "EB_APPLICATION") action = "SUBMIT_EB";
    if (action === "OC_APPLICATION") action = "SUBMIT_OC";
    if (action === "SECRETARIAT_APPLICATION") action = "SUBMIT_SECRETARIAT";

    if (!payload.fullName && payload.name) payload.fullName = payload.name;
    if (!payload.fullName && payload.adviserName) payload.fullName = payload.adviserName;
    if (!payload.phone && payload.adviserPhone) payload.phone = payload.adviserPhone;
    if (!payload.email && payload.adviserEmail) payload.email = payload.adviserEmail;
    if (!payload.institution && payload.instName) payload.institution = payload.instName;
    if (!payload.recaptchaToken && payload.recaptcha_token) payload.recaptchaToken = payload.recaptcha_token;

    const targetEmail = (payload.email || payload.adviserEmail || "").trim();
    const recipientName = (payload.fullName || "Delegate").trim();

    /* ---------------------------------------------------------------------- */
    /* 1. TRANSACTIONAL COMMUNICATIONS (Verification Codes & Manual Triggers)  */
    /* ---------------------------------------------------------------------- */

    // 1A. 6-DIGIT VERIFICATION KEY
    if (action === "SEND_VERIFICATION_CODE" || action === "EMAIL_VERIFICATION_CODE" || action === "VERIFICATION_CODE") {
      if (!targetEmail) return errorResponse("Recipient email required", 400);
      const code = String(payload.code || Math.floor(100000 + Math.random() * 900000)).trim();
      const mailRes = sendVerificationCode(targetEmail, code, recipientName);
      logAudit(action, targetEmail, "SUCCESS", "Dispatched security verification key");
      return jsonResponse(mailRes);
    }

    // 1B. FINANCIAL CLEARANCE CONFIRMATION
    if (action === "PAYMENT_VERIFIED" || action === "SEND_PAYMENT_VERIFIED" || action === "CONFIRM_PAYMENT") {
      if (!targetEmail) return errorResponse("Recipient email required", 400);
      const regId = payload.regId || payload.registrationId || payload.delId || "RM26-DEL-" + Math.floor(1000 + Math.random() * 9000);
      const amount = payload.amount || payload.totalAmount || "2,199";
      const utr = payload.paymentUTR || payload.utr || payload.txnID || "BANK-CONFIRMED";
      const mailRes = sendPaymentVerifiedEmail(targetEmail, recipientName, regId, amount, utr);
      logAudit(action, targetEmail, "SUCCESS", "Dispatched financial clearance certificate: " + regId);
      return jsonResponse(mailRes);
    }

    // 1C. ALLOCATION & CREDENTIAL DECREE
    if (action === "ALLOCATION_CONFIRMED" || action === "SEND_ALLOCATION_EMAIL" || action === "SEND_ALLOCATION") {
      if (!targetEmail) return errorResponse("Recipient email required", 400);
      const delegateId = payload.delegateId || payload.regId || "RM26-DEL-" + Math.floor(100 + Math.random() * 900);
      const committee = payload.committee || payload.allocatedCommittee || "DISEC";
      const country = payload.country || payload.allocatedCountry || payload.portfolio || "Republic of India";
      const mailRes = sendAllocationEmail(targetEmail, recipientName, delegateId, committee, country);
      logAudit(action, targetEmail, "SUCCESS", "Dispatched allocation decree: " + delegateId);
      return jsonResponse(mailRes);
    }

    // 1D. ABANDONED DRAFT LEAD CAPTURE
    if (action === "SAVE_DRAFT_LEAD") {
      const leadRes = recordAbandonedLead(payload);
      return jsonResponse(leadRes);
    }

    /* ---------------------------------------------------------------------- */
    /* 2. RECAPTCHA VERIFICATION FOR FORM SUBMISSIONS                          */
    /* ---------------------------------------------------------------------- */
    const submissionActions = ["SUBMIT_DELEGATE", "SUBMIT_DELEGATION", "SUBMIT_EB", "SUBMIT_OC", "SUBMIT_SECRETARIAT", "SUBMIT_WAITLIST"];
    if (submissionActions.indexOf(action) !== -1 && CONFIG.ENABLE_RECAPTCHA_VERIFY) {
      if (!verifyRecaptcha(payload.recaptchaToken)) {
        logAudit(action, targetEmail || "ANONYMOUS", "RECAPTCHA_FAILED", "Failed security reCAPTCHA token verification");
        return errorResponse("Security token verification failed. Please refresh and try again.", 403);
      }
    }

    /* ---------------------------------------------------------------------- */
    /* 3. SUBMISSION PIPELINES (Drive Storage + Sheet Record + Auto-Email)    */
    /* ---------------------------------------------------------------------- */
    let result = {};
    switch (action) {
      case "SUBMIT_DELEGATE":
        result = registerDelegateWithDrive(payload);
        break;

      case "SUBMIT_DELEGATION":
        result = registerDelegationWithDrive(payload);
        break;

      case "SUBMIT_EB":
        result = applyEBWithDrive(payload);
        break;

      case "SUBMIT_OC":
        result = applyOCWithDrive(payload);
        break;

      case "SUBMIT_SECRETARIAT":
        result = applySecretariatWithDrive(payload);
        break;

      case "SUBMIT_WAITLIST":
        result = registerWaitlist(payload);
        break;

      case "AUTH_SYNC":
        result = syncUserAccount(payload);
        break;

      case "CHECK_IN_QR":
        result = recordCheckIn(payload);
        break;

      case "ADMIN_CONFIRM_ALLOTMENT":
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
        result = allotCommitteeAndSendEmail(payload);
        break;

      case "ADMIN_VERIFY_PAYMENT":
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
        result = adminVerifyPaymentAndSendEmail(payload);
        break;

      case "ADMIN_DISPATCH_LEAD_REMINDER":
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
        result = adminDispatchLeadReminder(payload);
        break;

      case "ADMIN_UPDATE_DELEGATION":
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
        result = adminUpdateDelegation(payload);
        break;

      case "ADMIN_ADD_DELEGATE":
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
        result = adminAddDelegate(payload);
        break;

      case "ADMIN_UPDATE_SETTINGS":
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
        result = updateSiteSettings(payload);
        break;

      case "ADMIN_DELETE_RECORD":
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse("Unauthorized", 401);
        result = adminDeleteRecord(payload);
        break;

      default:
        if (targetEmail && targetEmail.includes("@")) {
          result = sendApplicationReceivedEmail(targetEmail, recipientName, "Conference Registration", "RM26-IN-" + Math.floor(1000 + Math.random() * 9000));
        } else {
          return errorResponse("Unsupported action: " + action, 400);
        }
    }

    logAudit(action, targetEmail || "ANONYMOUS", "SUCCESS", "Executed " + action);
    return jsonResponse(result);

  } catch (err) {
    logAudit("SYSTEM_EXCEPTION", "SERVER", "FAILED", err.message);
    return errorResponse("System Exception: " + err.message, 500);
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/**
 * Server-Side reCAPTCHA Verification
 */
function verifyRecaptcha(token) {
  if (!token) return false;
  try {
    const resp = UrlFetchApp.fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "post",
      payload: { secret: CONFIG.RECAPTCHA_SECRET_KEY, response: token },
      muteHttpExceptions: true
    });
    const res = JSON.parse(resp.getContentText());
    return res.success === true;
  } catch (e) {
    Logger.log("reCAPTCHA validation error: " + e.message);
    return true; // fail-open in transient network glitches to preserve applicant data
  }
}

/* -------------------------------------------------------------------------- */
/*      GOOGLE DRIVE MULTI-FOLDER STORAGE (SCREENSHOTS & CVS PRESERVED)       */
/* -------------------------------------------------------------------------- */

function saveFileToDriveFolder(base64Data, fileName, mimeType, folderName) {
  if (!base64Data) return "";
  try {
    let cleanBase64 = base64Data;
    if (base64Data.indexOf("base64,") !== -1) {
      cleanBase64 = base64Data.split("base64,")[1];
    }

    const folders = DriveApp.getFoldersByName(folderName);
    let targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(folderName);
    }

    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const safeName = (fileName || ("Dossier_" + new Date().getTime())).replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = Utilities.newBlob(decodedBytes, mimeType || "application/octet-stream", safeName);
    const file = targetFolder.createFile(blob);

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    Logger.log("Drive Storage Notice: " + e.message);
    return "Drive Archive Skipped: " + e.message;
  }
}

/* -------------------------------------------------------------------------- */
/*             FORM SUBMISSION HANDLERS WITH AUTOMATIC DISPATCH               */
/* -------------------------------------------------------------------------- */

/**
 * 1. Individual Delegate Submission
 */
function registerDelegateWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Registrations");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Registrations");
  }

  const regId = "RM26-DEL-" + Math.floor(1000 + Math.random() * 9000);
  const screenshotData = data.payment_screenshot_link || data.paymentScreenshotBase64 || data.screenshotBase64 || "";
  const screenshotName = data.screenshotName || ("Payment_" + regId + ".png");
  const driveUrl = screenshotData ? saveFileToDriveFolder(screenshotData, screenshotName, "image/png", CONFIG.FOLDERS.DELEGATE_PAYMENTS) : "";

  sheet.appendRow([
    new Date().toISOString(),
    regId,
    data.uid || data.UID || "",
    data.name || data.fullName || "",
    data.email || "",
    data.phone || "",
    data.institute || data.institution || "",
    data.pref1_committee || data.committeePref1 || "",
    data.pref2_committee || data.committeePref2 || "",
    data.pref3_committee || data.committeePref3 || "",
    data.experience || "",
    data.payment_utr || data.paymentUTR || data.txnID || "",
    driveUrl,
    "Pending_Verification",
    "",
    "",
    data.delegationCode || "",
    "No"
  ]);

  // AUTO-DISPATCH OFFICIAL INTAKE COMMUNIQUÉ
  if (data.email) {
    sendApplicationReceivedEmail(data.email, data.name || "Delegate", "Individual Delegate", regId);
  }

  return {
    status: "success",
    regId: regId,
    driveUrl: driveUrl,
    message: "Registration recorded and official confirmation dispatched."
  };
}

/**
 * 2. Institutional Delegation Submission
 */
function registerDelegationWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Delegations");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Delegations");
  }

  const delId = "RM26-GRP-" + Math.floor(100 + Math.random() * 900);
  const delegationCode = "DEL-" + (data.instName || data.institution || "INST").replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
  
  const screenshotData = data.screenshotBase64 || data.payment_screenshot_link || "";
  const screenshotName = data.screenshotName || ("Delegation_Payment_" + delId + ".png");
  const driveUrl = screenshotData ? saveFileToDriveFolder(screenshotData, screenshotName, "image/png", CONFIG.FOLDERS.DELEGATION_PAYMENTS) : "";

  sheet.appendRow([
    new Date().toISOString(),
    delId,
    delegationCode,
    data.instName || data.institution || "",
    data.adviserName || data.fullName || "",
    data.adviserEmail || data.email || "",
    data.adviserPhone || data.phone || "",
    data.size || (data.delegates ? data.delegates.length : 8),
    data.payment_utr || data.utr || data.txnID || "",
    driveUrl,
    "Pending_Verification",
    JSON.stringify(data.delegates || [])
  ]);

  // Enroll sub-delegates into Registrations tab
  if (Array.isArray(data.delegates) && data.delegates.length > 0) {
    const regSheet = ss.getSheetByName("Registrations");
    if (regSheet) {
      data.delegates.forEach(function(del, idx) {
        regSheet.appendRow([
          new Date().toISOString(),
          delId + "-D" + (idx + 1),
          "",
          del.name || "",
          del.email || "",
          del.phone || "",
          data.instName || "",
          del.pref || "",
          "",
          "",
          "",
          data.payment_utr || "",
          driveUrl,
          "Delegation_Member",
          "",
          del.country || "",
          delegationCode,
          "No"
        ]);
      });
    }
  }

  // AUTO-DISPATCH OFFICIAL DELEGATION COMMUNIQUÉ
  const headEmail = data.adviserEmail || data.email;
  if (headEmail) {
    sendApplicationReceivedEmail(headEmail, data.adviserName || "Faculty Adviser", "Institutional Delegation", delId);
  }

  return {
    status: "success",
    delId: delId,
    delegationCode: delegationCode,
    driveUrl: driveUrl,
    message: "Institutional delegation enrolled and communique dispatched."
  };
}

/**
 * 3. Executive Board Submission
 */
function applyEBWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("EB_Applications");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("EB_Applications");
  }

  const appId = "RM26-EB-" + Math.floor(100 + Math.random() * 900);
  const cvData = data.cvBase64 || data.cv_base64 || "";
  const cvName = data.cvName || ("EB_CV_" + appId + ".pdf");
  const driveUrl = cvData ? saveFileToDriveFolder(cvData, cvName, "application/pdf", CONFIG.FOLDERS.EB_CVS) : (data.cvLink || "");

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || "",
    data.fullName || data.name || "",
    data.email || "",
    data.phone || "",
    data.prefCommittee1 || data.pref1 || "",
    data.prefCommittee2 || data.pref2 || "",
    data.munExperience || data.experience || "",
    data.executiveSummary || data.summary || "",
    driveUrl,
    "Under_Review"
  ]);

  if (data.email) {
    sendApplicationReceivedEmail(data.email, data.fullName || "Applicant", "Executive Board", appId);
  }

  return { status: "success", appId: appId, cvUrl: driveUrl, message: "EB application enrolled." };
}

/**
 * 4. Organizing Committee Submission
 */
function applyOCWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("OC_Applications");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("OC_Applications");
  }

  const appId = "RM26-OC-" + Math.floor(100 + Math.random() * 900);
  const cvData = data.cvBase64 || data.cv_base64 || "";
  const cvName = data.cvName || ("OC_CV_" + appId + ".pdf");
  const driveUrl = cvData ? saveFileToDriveFolder(cvData, cvName, "application/pdf", CONFIG.FOLDERS.OC_CVS) : (data.cvLink || "");

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || "",
    data.fullName || data.name || "",
    data.email || "",
    data.phone || "",
    data.department1 || data.dept1 || "",
    data.department2 || data.dept2 || "",
    data.statementOfPurpose || data.why || "",
    driveUrl,
    "Under_Review"
  ]);

  if (data.email) {
    sendApplicationReceivedEmail(data.email, data.fullName || "Applicant", "Organizing Committee", appId);
  }

  return { status: "success", appId: appId, cvUrl: driveUrl, message: "OC application enrolled." };
}

/**
 * 5. Secretariat Submission
 */
function applySecretariatWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Secretariat_Applications");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Secretariat_Applications");
  }

  const appId = "RM26-SEC-" + Math.floor(100 + Math.random() * 900);
  const cvData = data.cvBase64 || data.cv_base64 || "";
  const cvName = data.cvName || ("SEC_CV_" + appId + ".pdf");
  const driveUrl = cvData ? saveFileToDriveFolder(cvData, cvName, "application/pdf", CONFIG.FOLDERS.SEC_CVS) : (data.portfolio || "");

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || "",
    data.fullName || data.name || "",
    data.email || "",
    data.phone || "",
    data.department || data.portfolio1 || "",
    data.experience || data.portfolio2 || "",
    data.vision || data.statementOfPurpose || "",
    driveUrl,
    "Under_Review"
  ]);

  if (data.email) {
    sendApplicationReceivedEmail(data.email, data.fullName || "Applicant", "Secretariat Directorate", appId);
  }

  return { status: "success", appId: appId, cvUrl: driveUrl, message: "Secretariat application enrolled." };
}

/**
 * 6. Lead Logging
 */
function recordAbandonedLead(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Abandoned_Leads");
    if (!sheet) {
      sheet = ss.insertSheet("Abandoned_Leads");
      sheet.appendRow(SCHEMAS.Abandoned_Leads);
    }
    const leadId = "LEAD-" + Math.floor(1000 + Math.random() * 9000);
    sheet.appendRow([
      new Date().toISOString(),
      leadId,
      data.fullName || "Prospect",
      data.email || "",
      data.phone || "",
      data.formType || "Delegate Registration",
      data.step || "Step 1",
      "Pending"
    ]);
    return { status: "success", leadId: leadId, message: "Lead captured." };
  } catch (err) {
    return { status: "success", note: err.message };
  }
}

/**
 * 7. User Sync
 */
function syncUserAccount(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Users");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Users");
  }
  const email = data.email || "";
  const uid = data.uid || "";
  if (!email && !uid) return { status: "error", message: "Identifier required" };

  sheet.appendRow([
    new Date().toISOString(),
    uid,
    data.displayName || "Delegate",
    email,
    data.photoURL || "",
    data.role || "Delegate",
    "Active",
    new Date().toISOString()
  ]);
  return { status: "success", message: "Account profile synced." };
}

/**
 * 8. Waitlist
 */
function registerWaitlist(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Waitlist");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Waitlist");
  }
  const waitId = "WL-" + Math.floor(1000 + Math.random() * 9000);
  sheet.appendRow([
    new Date().toISOString(),
    waitId,
    data.fullName || "Waitlist Delegate",
    data.email || "",
    data.phone || "",
    "Queued",
    100
  ]);
  return { status: "success", waitlistId: waitId };
}

/**
 * 9. QR Check-In
 */
function recordCheckIn(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Attendance_Logs");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Attendance_Logs");
  }
  const delegateId = data.delegateId || data.regId || "";
  const actionType = data.actionType || data.type || "ENTRY";
  const timestamp = data.timestamp || new Date().toISOString();

  sheet.appendRow([
    timestamp,
    delegateId,
    actionType,
    data.verifiedBy || "Secretariat Scanner Desk",
    Utilities.base64Encode(delegateId + "_" + actionType + "_" + new Date().getTime()),
    actionType === "EXIT" ? "Checked_Out" : "Checked_In"
  ]);

  return { status: "success", message: "Check-in logged for " + delegateId };
}

/* -------------------------------------------------------------------------- */
/*             PRESTIGE DIPLOMATIC EMAIL DISPATCHERS & TEMPLATES              */
/* -------------------------------------------------------------------------- */

/**
 * Dispatches 6-digit cryptographic security key
 */
function sendVerificationCode(email, code, fullName) {
  const subject = `AUTHENTICATION KEY: ${code} — Resolve MUN 2026`;
  const htmlBody = buildVerificationCodeHtml(fullName, code);
  const plainText = `RESOLVE MUN 2026 · SECURITY DISPATCH\n\nAttention: ${fullName}\n\nYour 6-digit identity authentication code is:\n\n${code}\n\nValid for 10 minutes. Enter on the portal to authenticate.\nVenue: ${CONFIG.VENUE}\nDates: ${CONFIG.CONFERENCE_DATES}\n\nThe Executive Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("SEND_VERIFICATION_CODE", email, fullName, "SENT");

  return { status: "success", recipient: email, code: code, message: "Security key dispatched." };
}

/**
 * Dispatches formal Financial Clearance Certificate
 */
function sendPaymentVerifiedEmail(email, fullName, regId, amount, utr) {
  const subject = `FINANCIAL CLEARANCE CERTIFICATE [${regId}] — Resolve MUN 2026`;
  const htmlBody = buildPaymentVerifiedHtml(fullName, regId, amount, utr);
  const plainText = `RESOLVE MUN 2026 · TREASURY COMMUNIQUÉ\n\nTo: ${fullName}\nRegistration ID: ${regId}\nAmount Cleared: ₹${amount}\nTransaction Reference: ${utr}\nVenue: ${CONFIG.VENUE}\n\nYour delegate registration is formally confirmed.\n\nDirectorate of Finance`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("PAYMENT_VERIFIED", email, fullName, "SENT");

  return { status: "success", recipient: email, regId: regId, message: "Clearance certificate dispatched." };
}

/**
 * Dispatches Official Committee & Country Allotment Decree
 */
function sendAllocationEmail(email, fullName, delegateId, committee, country) {
  const subject = `APPOINTMENT DECREE: ${committee} (${country}) — Resolve MUN 2026`;
  const htmlBody = buildAllocationHtml(fullName, delegateId, committee, country);
  const plainText = `RESOLVE MUN 2026 · EXECUTIVE DECREE\n\nTo the Distinguished Delegate: ${fullName}\nDelegate Identifier: ${delegateId}\n\nCommittee Assignment: ${committee}\nRepresentation Portfolio: ${country}\nVenue: ${CONFIG.VENUE}\nDates: ${CONFIG.CONFERENCE_DATES}\n\nAccess portal: ${CONFIG.PORTAL_URL}\n\nThe Executive Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("ALLOCATION_CONFIRMED", email, fullName, "SENT");

  return { status: "success", recipient: email, delegateId: delegateId, message: "Allocation decree dispatched." };
}

/**
 * Dispatches Official Intake Communiqué
 */
function sendApplicationReceivedEmail(email, fullName, formType, refId) {
  const reference = refId || ("RM26-REC-" + Math.floor(1000 + Math.random() * 9000));
  const subject = `COMMUNIQUÉ: Registration Dossier Logged [${reference}] — Resolve MUN 2026`;
  const htmlBody = buildApplicationReceivedHtml(fullName, formType, reference);
  const plainText = `RESOLVE MUN 2026 · ADMISSIONS COMMUNIQUÉ\n\nAttention: ${fullName}\nDossier Reference: ${reference}\nIntake Track: ${formType}\nVenue: ${CONFIG.VENUE}\nDates: ${CONFIG.CONFERENCE_DATES}\n\nYour dossier has been registered with the Secretariat.\n\nThe Executive Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("APPLICATION_RECEIVED", email, fullName, "SENT");

  return { status: "success", recipient: email, refId: reference, message: "Intake communique dispatched." };
}

/**
 * Admin: Assign committee, country and dispatch allotment letter
 */
function allotCommitteeAndSendEmail(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet) return { status: "error", message: "Registrations sheet not found" };

  const regId = data.regId;
  const committee = data.committee;
  const country = data.country;
  let targetEmail = data.email || "";
  let targetName = data.fullName || "Delegate";

  const rows = sheet.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === regId) {
      sheet.getRange(i + 1, 14).setValue("Confirmed");
      sheet.getRange(i + 1, 15).setValue(committee);
      sheet.getRange(i + 1, 16).setValue(country);
      sheet.getRange(i + 1, 18).setValue("Yes");
      targetEmail = targetEmail || rows[i][4];
      targetName = targetName === "Delegate" ? rows[i][3] : targetName;
      found = true;
      break;
    }
  }

  if (targetEmail) {
    sendAllocationEmail(targetEmail, targetName, regId, committee, country);
  }

  return { status: "success", regId: regId, found: found, emailSent: Boolean(targetEmail) };
}

/**
 * Admin: Formally verify payment and dispatch Financial Clearance Certificate email
 */
function adminVerifyPaymentAndSendEmail(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet) return { status: "error", message: "Registrations sheet not found" };

  const regId = data.regId;
  let targetEmail = data.email || "";
  let targetName = data.fullName || data.name || "Delegate";
  let utr = data.utr || "CONFIRMED-BY-ADMIN";
  let amount = data.amount || "2199";

  const rows = sheet.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === regId) {
      sheet.getRange(i + 1, 14).setValue("Payment_Verified");
      targetEmail = targetEmail || rows[i][4];
      targetName = (targetName === "Delegate" && rows[i][3]) ? rows[i][3] : targetName;
      utr = (utr === "CONFIRMED-BY-ADMIN" && rows[i][11]) ? rows[i][11] : utr;
      found = true;
      break;
    }
  }

  if (targetEmail) {
    sendPaymentVerifiedEmail(targetEmail, targetName, regId, amount, utr);
  }

  return { status: "success", regId: regId, verified: true, emailSent: Boolean(targetEmail) };
}

/**
 * Admin: Dispatch warm diplomatic reminder to abandoned leads
 */
function adminDispatchLeadReminder(data) {
  const email = data.email;
  const name = data.name || "Distinguished Delegate";
  const step = data.step || "Payment Confirmation";

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Valid email required" };
  }

  const subject = `ACTION REQUIRED: Complete Your Delegate Seat Reservation — Resolve MUN 2026`;
  const bodyHtml = `
    <p>Dear ${name},</p>
    <p>The Executive Secretariat of Resolve Model United Nations 2026 noticed that you initiated registration but have not yet finalized your dossier at <strong>${step}</strong>.</p>
    <div style="margin: 20px 0; padding: 16px; background: #0c0e18; border-left: 3px solid #d4af37; border-radius: 4px;">
      <p style="margin: 0 0 8px 0; color: #d4af37; font-weight: 700; font-size: 13px;">OFFICIAL INVITATION NOTICE</p>
      <p style="margin: 0; font-size: 13px; line-height: 1.6;">Your preferred committee allocation is currently reserved on a provisional basis. Round 1 allocations are filling rapidly across all councils at Delhi World Public School, Kompally.</p>
    </div>
    <p>To finalize your delegate credentials and secure your portfolio assignment, please complete your submission on the portal:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="https://resolvemun.in/auth" style="display: inline-block; background: #d4af37; color: #080a13; padding: 12px 28px; text-decoration: none; font-weight: 800; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 4px;">Complete Registration Now &rarr;</a>
    </p>
    <p style="font-size: 12px; color: #8a90a4;">Venue: Delhi World Public School, Kompally, Hyderabad<br>Dates: 20th &ndash; 22nd November 2026<br>Assistance Helpline: +91 92121 07797</p>
  `;

  const plainText = `RESOLVE MUN 2026 · REGISTRATION NOTICE\n\nDear ${name},\n\nYou initiated your registration but have not finalized your submission at ${step}.\n\nYour provisional seat reservation is active. Please complete your registration at https://resolvemun.in/auth\n\nVenue: Delhi World Public School, Kompally, Hyderabad\nDates: 20th - 22nd November 2026\n\nExecutive Secretariat, Resolve MUN 2026`;

  dispatchMail(email, subject, wrapInEmbassyLayout("COMM-REM-LEAD", "RESERVATION NOTICE", bodyHtml), plainText);
  tryLogEmailToSheet("LEAD_REMINDER_SENT", email, name, "SENT");

  return { status: "success", email: email, message: "Reminder successfully dispatched." };
}

/**
 * Mail Dispatcher with Dual Failover (MailApp -> GmailApp)
 */
function dispatchMail(to, subject, htmlBody, plainText) {
  try {
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody,
      body: plainText,
      name: CONFIG.SENDER_NAME,
      replyTo: CONFIG.REPLY_TO
    });
  } catch (err) {
    Logger.log("MailApp primary dispatch notice, using GmailApp fallback: " + err.message);
    GmailApp.sendEmail(to, subject, plainText, {
      htmlBody: htmlBody,
      name: CONFIG.SENDER_NAME,
      replyTo: CONFIG.REPLY_TO
    });
  }
}

/* -------------------------------------------------------------------------- */
/*      AUTHENTIC DIPLOMATIC EMBASSY-GRADE HTML TEMPLATES (NON-AI LOOK)       */
/* -------------------------------------------------------------------------- */

function wrapInEmbassyLayout(dispatchCode, heading, bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #05060a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #05060a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #05060a; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 14px;">
        
        <!-- Main Document Chassis -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 590px; background-color: #0a0c16; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 14px; overflow: hidden;">
          
          <!-- Diplomatic Header Seal -->
          <tr>
            <td style="padding: 26px 30px 22px 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); background-color: #0e1120;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-family: 'Courier New', monospace; font-size: 10px; font-weight: 700; color: #818cf8; letter-spacing: 0.18em; text-transform: uppercase;">
                      COMMUNIQUÉ SERIAL: ${dispatchCode}
                    </div>
                    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 21px; font-weight: 700; color: #ffffff; letter-spacing: 0.04em; text-transform: uppercase; margin-top: 4px;">
                      RESOLVE MODEL UNITED NATIONS 2.0
                    </div>
                    <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5); margin-top: 2px;">
                      ${CONFIG.VENUE}
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <div style="display: inline-block; padding: 4px 10px; border: 1px solid rgba(129, 140, 248, 0.35); border-radius: 6px; background: rgba(99, 102, 241, 0.1); font-family: monospace; font-size: 10px; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.1em;">
                      HYD 2026
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Document Body -->
          <tr>
            <td style="padding: 32px 30px 36px 30px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Official Diplomatic Sign-Off Block -->
          <tr>
            <td style="padding: 22px 30px; background-color: #07080f; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.08em;">
                      The Executive Secretariat
                    </div>
                    <div style="font-size: 11px; color: rgba(255, 255, 255, 0.45); line-height: 1.5; margin-top: 2px;">
                      Directorate of Admissions &amp; Diplomatic Affairs<br>
                      Venue: ${CONFIG.VENUE} · ${CONFIG.CONFERENCE_DATES}
                    </div>
                  </td>
                  <td align="right" valign="bottom">
                    <div style="font-family: monospace; font-size: 9px; color: rgba(255, 255, 255, 0.25); text-transform: uppercase;">
                      OFFICIAL DIPLOMATIC CORRESPONDENCE
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * 1. Verification Key Template
 */
function buildVerificationCodeHtml(fullName, code) {
  const serial = "SEC-KEY-" + Math.floor(10000 + Math.random() * 90000);
  const body = `
    <div style="font-size: 11px; font-family: monospace; color: #a5b4fc; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
      AUTHENTICATION PROTOCOL
    </div>
    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 14px;">
      Delegate Identity Verification
    </div>
    <p style="font-size: 13px; color: rgba(255, 255, 255, 0.75); line-height: 1.6; margin: 0 0 24px 0;">
      Attention: <strong style="color: #ffffff;">${fullName}</strong>. You have initiated an authentication request for the Resolve MUN 2026 conference portal. Transmit the following 6-digit security key on your screen to verify your delegate account:
    </p>

    <!-- KEY BOX -->
    <div style="background-color: #0f1224; border: 1px solid rgba(129, 140, 248, 0.4); border-radius: 10px; padding: 22px; text-align: center; margin: 20px 0;">
      <div style="font-size: 10px; font-family: monospace; letter-spacing: 0.25em; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 6px;">
        TEMPORARY PASS KEY
      </div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #ffffff; text-shadow: 0 0 16px rgba(255, 255, 255, 0.5);">
        ${code}
      </div>
      <div style="font-size: 10px; font-family: monospace; color: #818cf8; margin-top: 8px;">
        Expires in 10 minutes · Single session usage
      </div>
    </div>

    <div style="border-left: 2px solid rgba(129, 140, 248, 0.6); padding-left: 14px; margin-top: 24px;">
      <p style="font-size: 11px; color: rgba(255, 255, 255, 0.45); line-height: 1.5; margin: 0;">
        Conference Venue: <strong>${CONFIG.VENUE}</strong>.<br>
        Security Advisory: Never disclose this pass key. The Secretariat will never ask for your verification code.
      </p>
    </div>
  `;
  return wrapInEmbassyLayout(serial, "Identity Verification Key", body);
}

/**
 * 2. Payment Verified & Cleared Certificate
 */
function buildPaymentVerifiedHtml(fullName, regId, amount, utr) {
  const serial = "TREAS-" + regId;
  const body = `
    <div style="font-size: 11px; font-family: monospace; color: #34d399; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
      TREASURY AUDIT · FORMAL RECEIPT
    </div>
    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 14px;">
      Intake Fee Verification &amp; Seat Confirmation
    </div>
    <p style="font-size: 13px; color: rgba(255, 255, 255, 0.75); line-height: 1.6; margin: 0 0 20px 0;">
      This communiqué certifies that the conference intake fee for delegate <strong style="color: #ffffff;">${fullName}</strong> has been audited, cleared, and permanently logged with the Finance Directorate.
    </p>

    <!-- RECEIPT TABLE -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f1224; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: rgba(255, 255, 255, 0.5);">Registration Serial</td>
        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-family: monospace; font-size: 12px; font-weight: 700; color: #ffffff;">${regId}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: rgba(255, 255, 255, 0.5);">Amount Cleared</td>
        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px; font-weight: 700; color: #34d399;">₹${amount}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: rgba(255, 255, 255, 0.5);">Bank Reference / UTR</td>
        <td align="right" style="padding: 12px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-family: monospace; font-size: 12px; color: rgba(255, 255, 255, 0.85);">${utr}</td>
      </tr>
      <tr>
        <td style="padding: 12px 18px; font-size: 12px; color: rgba(255, 255, 255, 0.5);">Audit Status</td>
        <td align="right" style="padding: 12px 18px; font-family: monospace; font-size: 11px; font-weight: 700; color: #34d399;">CLEARED &amp; ARCHIVED</td>
      </tr>
    </table>

    <p style="font-size: 12px; color: rgba(255, 255, 255, 0.6); line-height: 1.6; margin: 0;">
      <strong>Operational Directives:</strong> Your committee and portfolio allocation are in draft stage by the Executive Board. Official appointment letters will be issued via email. Conference venue: <strong>${CONFIG.VENUE}</strong>.
    </p>
  `;
  return wrapInEmbassyLayout(serial, "Financial Clearance", body);
}

/**
 * 3. Allocation & Appointment Decree Template
 */
function buildAllocationHtml(fullName, delegateId, committee, country) {
  const serial = "DECREE-" + delegateId;
  const body = `
    <div style="font-size: 11px; font-family: monospace; color: #93c5fd; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
      EXECUTIVE SECRETARIAT · OFFICIAL ALLOTMENT
    </div>
    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 14px;">
      Diplomatic Representation Decree
    </div>
    <p style="font-size: 13px; color: rgba(255, 255, 255, 0.75); line-height: 1.6; margin: 0 0 22px 0;">
      By authority of the Executive Secretariat, <strong style="color: #ffffff;">${fullName}</strong> has been appointed to represent the following credentials at Resolve MUN 2.0:
    </p>

    <!-- CREDENTIALS TABLE -->
    <div style="background-color: #0f1224; border: 1px solid rgba(129, 140, 248, 0.35); border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding-bottom: 10px;">
            <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.12em;">Allocated Committee</div>
            <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 2px;">${committee}</div>
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.12em;">Assigned Country / Portfolio</div>
            <div style="font-size: 17px; font-weight: 700; color: #a5b4fc; margin-top: 2px;">${country}</div>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 10px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.12em;">Delegate Accreditation ID</div>
            <div style="font-size: 14px; font-family: monospace; font-weight: 700; color: #38bdf8; margin-top: 2px;">${delegateId}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Reporting Directives -->
    <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
        Reporting Venue &amp; Schedule
      </div>
      <div style="font-size: 12px; color: rgba(255, 255, 255, 0.65); line-height: 1.5;">
        Location: <strong>${CONFIG.VENUE}</strong><br>
        Dates: <strong>${CONFIG.CONFERENCE_DATES}</strong><br>
        Access your online delegate portal to download background study guides and procedural rules.
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${CONFIG.PORTAL_URL}" style="display: inline-block; padding: 12px 26px; background-color: #ffffff; color: #000000; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; border-radius: 6px;">
        Access Delegate Portal &rarr;
      </a>
    </div>
  `;
  return wrapInEmbassyLayout(serial, "Appointment Decree", body);
}

/**
 * 4. Application Intake Communiqué Template
 */
function buildApplicationReceivedHtml(fullName, formType, refId) {
  const serial = "INTAKE-" + refId;
  const body = `
    <div style="font-size: 11px; font-family: monospace; color: #a5b4fc; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 8px;">
      REGISTRATION DOSSIER CONFIRMATION
    </div>
    <div style="font-family: 'Times New Roman', Georgia, serif; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 14px;">
      ${formType} Dossier Registered
    </div>
    <p style="font-size: 13px; color: rgba(255, 255, 255, 0.75); line-height: 1.6; margin: 0 0 20px 0;">
      Attention: <strong style="color: #ffffff;">${fullName}</strong>. The Admissions Directorate confirms that your official submission for <strong style="color: #a5b4fc;">${formType}</strong> has been logged with reference number <strong style="font-family: monospace; color: #ffffff;">${refId}</strong>.
    </p>

    <!-- PROTOCOL BOX -->
    <div style="background-color: #0f1224; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 18px 20px; margin-bottom: 22px;">
      <div style="font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px;">
        Official Evaluation Cycle
      </div>
      <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6); line-height: 1.5;">
        Submissions undergo vetting by the Admissions Directorate on a rolling basis. You will receive further official communications upon payment audit and committee assignments.
      </div>
    </div>

    <div style="font-size: 11px; color: rgba(255, 255, 255, 0.45); line-height: 1.5;">
      Conference Dates: <strong>${CONFIG.CONFERENCE_DATES}</strong><br>
      Host Venue: <strong>${CONFIG.VENUE}</strong>
    </div>
  `;
  return wrapInEmbassyLayout(serial, "Dossier Logged", body);
}

/* -------------------------------------------------------------------------- */
/*             ADMINISTRATIVE & REPAIR UTILITIES                             */
/* -------------------------------------------------------------------------- */

function repairAndInitDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;
  for (const sheetName in SCHEMAS) {
    let sheet = ss.getSheetByName(sheetName);
    const headers = SCHEMAS[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#080a14");
      headerRange.setFontColor("#818cf8");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#080a14");
      headerRange.setFontColor("#818cf8");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }
}

function getSiteSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Site_Settings");
  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      roundName: "Round 2",
      delegatePrice: 2199,
      venue: CONFIG.VENUE,
      dates: CONFIG.CONFERENCE_DATES,
      registrationsOpen: true
    };
  }
  const rows = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < rows.length; i++) {
    settings[rows[i][0]] = rows[i][1];
  }
  return settings;
}

function updateSiteSettings(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Site_Settings");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Site_Settings");
  }
  for (const key in data.settings || {}) {
    sheet.appendRow([key, data.settings[key], new Date().toISOString(), data.updatedBy || "Admin"]);
  }
  return { status: "success", message: "Settings updated" };
}

function adminGetAllRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {};
  for (const sheetName in SCHEMAS) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() <= 1) {
      result[sheetName] = [];
      continue;
    }
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    result[sheetName] = data.slice(1).map(function(row) {
      const obj = {};
      headers.forEach(function(h, idx) {
        obj[h] = row[idx];
      });
      return obj;
    });
  }
  return result;
}

function adminGetAbandonedLeads() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Abandoned_Leads");
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  return data.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(h, idx) {
      obj[h] = row[idx];
    });
    return obj;
  });
}

function adminUpdateDelegation(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Delegations");
  if (!sheet) return { status: "error", message: "Sheet not found" };
  const delId = data.delId;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === delId) {
      if (data.status) sheet.getRange(i + 1, 11).setValue(data.status);
      if (data.notes) sheet.getRange(i + 1, 12).setValue(data.notes);
      return { status: "success", delId: delId };
    }
  }
  return { status: "error", message: "Delegation ID not found" };
}

function adminAddDelegate(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet) return { status: "error", message: "Sheet not found" };
  const regId = "RM26-MAN-" + Math.floor(1000 + Math.random() * 9000);
  sheet.appendRow([
    new Date().toISOString(),
    regId,
    data.uid || "",
    data.fullName || "",
    data.email || "",
    data.phone || "",
    data.institution || "",
    data.pref1 || "",
    data.pref2 || "",
    data.pref3 || "",
    data.experience || "",
    data.paymentUTR || "MANUAL-ENTRY",
    data.screenshotUrl || "",
    "Manual_Approved",
    data.committee || "",
    data.country || "",
    data.delegationCode || "",
    "No"
  ]);
  return { status: "success", regId: regId };
}

function adminDeleteRecord(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(data.sheetName);
  if (!sheet) return { status: "error", message: "Sheet not found" };
  const idCol = data.idColIndex || 2;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][idCol - 1] === data.recordId) {
      sheet.deleteRow(i + 1);
      return { status: "success", recordId: data.recordId };
    }
  }
  return { status: "error", message: "Record not found" };
}

function getDelegateByEmail(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet || sheet.getLastRow() <= 1) return { found: false };
  const rows = sheet.getDataRange().getValues();
  const cleanTarget = (email || "").trim().toLowerCase();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][4]).trim().toLowerCase() === cleanTarget) {
      return {
        found: true,
        regId: rows[i][1],
        fullName: rows[i][3],
        email: rows[i][4],
        phone: rows[i][5],
        institution: rows[i][6],
        status: rows[i][13],
        allocatedCommittee: rows[i][14],
        allocatedCountry: rows[i][15],
        paymentScreenshotURL: rows[i][12],
        paymentUTR: rows[i][11]
      };
    }
  }
  return { found: false };
}

function tryLogEmailToSheet(action, email, name, status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    let sheet = ss.getSheetByName("Email_Logs");
    if (!sheet) {
      sheet = ss.insertSheet("Email_Logs");
      sheet.appendRow(SCHEMAS.Email_Logs);
    }
    sheet.appendRow([new Date().toISOString(), action, email, name, status]);
  } catch (_) {}
}

function logAudit(action, actor, status, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return;
    const sheet = ss.getSheetByName("Audit_Logs");
    if (sheet) sheet.appendRow([new Date().toISOString(), action, actor, status, details]);
  } catch (_) {}
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg, code) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    error: msg,
    code: code || 400,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}
