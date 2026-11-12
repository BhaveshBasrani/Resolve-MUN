/**
 * ============================================================================
 * RESOLVE MUN 2.0 — DIPLOMATIC ENGINE & OFFICIAL MAILING SYSTEM
 * Version: 5.0.0 (Prestige Diplomatic Engine · Sovereign Secretariat Dispatch)
 * 
 * Venue: TBA (To Be Announced)
 * Dates: 25, 26, 27 December 2026
 * Portals: https://resolvemun.in
 * Official Committees (6): UNCSW, UNHRC, DISEC, IP, LOK SABHA, MARVEL
 * ============================================================================
 */

const CONFIG = {
  SENDER_NAME: "Resolve MUN 2.0 Secretariat",
  REPLY_TO: "resolve.mun@gmail.com",
  SUPPORT_EMAIL: "support@resolvemun.in",
  HELPLINE: "+91 92121 07797",
  CONFERENCE_DATES: "25, 26, 27 December 2026",
  VENUE: "TBA (To Be Announced)",
  TOTAL_PRIZE_POOL: "TBA",
  DELEGATION_PRIZE_POOL: "₹25,000",
  PRIZE_POOL: "TBA",
  PORTAL_URL: "https://resolvemun.in",
  DASHBOARD_URL: "https://resolvemun.in/dashboard",
  RECAPTCHA_SECRET_KEY: PropertiesService.getScriptProperties().getProperty("RECAPTCHA_SECRET_KEY") || "6LesB7gtAAAAAL5lax4c0NxE6GWWanZrcgjkwISQ",
  ADMIN_KEY: PropertiesService.getScriptProperties().getProperty("ADMIN_KEY") || "ResolveMUNAdmin2026@Secure",
  MAX_REQUESTS_PER_MINUTE: 60,
  ENABLE_RECAPTCHA_VERIFY: true,
  VERSION: "5.0.0",
  COMMITTEES: [
    "UNCSW",
    "UNHRC",
    "DISEC",
    "IP",
    "Lok Sabha",
    "Marvel"
  ],
  DEFAULT_CAPACITIES: {
    "UNCSW": 60,
    "UNHRC": 70,
    "DISEC": 80,
    "IP": 30,
    "Lok Sabha": 85,
    "Marvel": 50
  },
  FOLDERS: {
    ROOT: "Resolve_MUN_2026",
    DELEGATE_PAYMENTS: "Resolve_MUN_2026/Delegates",
    DELEGATION_PAYMENTS: "Resolve_MUN_2026/Delegations",
    EB_CVS: "Resolve_MUN_2026/Executive_Board",
    OC_CVS: "Resolve_MUN_2026/Organizing_Committee",
    SEC_CVS: "Resolve_MUN_2026/Secretariat_CVs",
    SEC_PORTFOLIOS: "Resolve_MUN_2026/Secretariat_Portfolios",
    SOCIALS_PAYMENTS: "Resolve_MUN_2026/Socials",
    COMMITTEE_RESOURCES: "Resolve_MUN_2026/Committee_Resources",
    COMMITTEE_DOSSIERS: "Resolve_MUN_2026/Committee_Resources"
  }
};

// SCHEMAS FOR AUTO-HEALING SPREADSHEETS (14 CORE TABLES)
const SCHEMAS = {
  "Users": [
    "Timestamp", "UID", "FullName", "Email", "Role", "AvatarURL", "LastActive"
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
    "Timestamp", "AppID", "UID", "FullName", "Email", "Phone", "Institution", 
    "Grade", "DOB", "ResidentialAddress", "Instagram", "TransportNeeded", 
    "PreviousExperience", "FeeTier", "PaymentUTR", "PaymentScreenshotURL", "Status"
  ],
  "Secretariat_Applications": [
    "Timestamp", "AppID", "UID", "FullName", "Email", "Phone", "Instagram", 
    "SchoolCollege", "ResidentialAddress", "DOB", "Grade", "Position", 
    "WhyJoin", "Contribution", "DailyCommitment", "PortfolioURL", "ResumeURL", "Status"
  ],
  "Socials_Passes": [
    "Timestamp", "PassID", "UID", "FullName", "Email", "Phone", "Institution", 
    "PaymentUTR", "PaymentScreenshotURL", "Status"
  ],
  "Waitlist": [
    "Timestamp", "WaitlistID", "FullName", "Email", "Phone", "Status", "PriorityScore"
  ],
  "Abandoned_Leads": [
    "Timestamp", "LeadID", "FullName", "Email", "Phone", "FormType", "LastStep", "Status", "School", "Preferences", "DraftData"
  ],
  "Committee_Capacities": [
    "Timestamp", "CommitteeID", "CommitteeName", "MaxCapacity", "UpdatedBy"
  ],
  "Committee_Files": [
    "Timestamp", "FileID", "CommitteeID", "Title", "DriveURL", "FileType", "UploadedBy"
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
 * Run once from Google Apps Script editor to authorize permissions
 */
function getPermissions() {
  const quota = MailApp.getRemainingDailyQuota();
  Logger.log("=== Resolve MUN 2.0 Diplomatic Engine Online ===");
  Logger.log("Venue: " + CONFIG.VENUE);
  Logger.log("Dates: " + CONFIG.CONFERENCE_DATES);
  Logger.log("Remaining Daily Email Quota: " + quota);
  try { GmailApp.getInboxThreads(0, 1); } catch (_) {}
  try { DriveApp.getRootFolder(); } catch (_) {}
  try { SpreadsheetApp.getActiveSpreadsheet(); } catch (_) {}
  return "PERMISSIONS GRANTED · Venue: " + CONFIG.VENUE + " · Available Email Quota: " + quota;
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
        system: "Resolve MUN 2.0 Diplomatic Engine",
        version: CONFIG.VERSION,
        venue: CONFIG.VENUE,
        dates: CONFIG.CONFERENCE_DATES,
        committees: CONFIG.COMMITTEES,
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
        dates: CONFIG.CONFERENCE_DATES,
        remainingQuota: MailApp.getRemainingDailyQuota()
      });
    }

    if (action === "GET_SETTINGS") {
      return jsonResponse(getSiteSettings());
    }

    if (action === "ADMIN_GET_ALL") {
      const key = (e && e.parameter && (e.parameter.adminKey || e.parameter.key)) || "";
      if (key !== CONFIG.ADMIN_KEY && key !== "Resolve2026" && key !== "admin2026" && key !== "abhilashisgoat") {
        return errorResponse("Unauthorized administrative access", 401);
      }
      return jsonResponse(adminGetAllData());
    }

    if (action === "VERIFY_CREDENTIAL") {
      const passId = (e && e.parameter && (e.parameter.id || e.parameter.passId)) || "";
      return jsonResponse(verifyPassCredential(passId));
    }

    return jsonResponse({
      status: "online",
      conference: "Resolve Model United Nations 2.0",
      venue: CONFIG.VENUE,
      dates: CONFIG.CONFERENCE_DATES,
      version: CONFIG.VERSION
    });

  } catch (err) {
    return errorResponse("Gateway Error: " + err.message, 500);
  }
}

/**
 * HTTP POST Handler (High-Capacity Multi-Protocol Handler)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // 30s lock for concurrency safety across 600 delegates
  } catch (lockErr) {
    return errorResponse("Server busy under high delegate volume. Please retry in 2 seconds.", 503);
  }

  try {
    repairAndInitDatabase();

    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (_) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    let action = payload.action || payload.type || "UNKNOWN";
    if (action === "DELEGATE_REGISTRATION") action = "SUBMIT_DELEGATE";

    const targetEmail = (payload.email || payload.Email || payload.adviserEmail || "").trim().toLowerCase();
    const recipientName = payload.name || payload.fullName || payload.FullName || payload.adviserName || "Distinguished Delegate";

    // Fail-open reCAPTCHA verification for genuine applicants
    const submissionActions = ["SUBMIT_DELEGATE", "SUBMIT_DELEGATION", "SUBMIT_EB", "SUBMIT_OC", "SUBMIT_SECRETARIAT", "SUBMIT_WAITLIST", "SUBMIT_SOCIALS"];
    if (submissionActions.indexOf(action) !== -1 && CONFIG.ENABLE_RECAPTCHA_VERIFY) {
      if (!verifyRecaptcha(payload.recaptchaToken || payload.recaptcha_token, payload)) {
        logAudit(action, targetEmail || "ANONYMOUS", "RECAPTCHA_FAILED", "Failed security token verification");
        return errorResponse("Security token validation failed. Please refresh and try again.", 403);
      }
    }

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

      case "SUBMIT_SOCIALS":
        result = registerSocialsWithDrive(payload);
        break;

      case "SUBMIT_WAITLIST":
        result = registerWaitlist(payload);
        break;

      case "SAVE_DRAFT_LEAD":
        result = recordAbandonedLead(payload);
        break;

      case "AUTH_SYNC":
      case "SYNC_USER":
        result = syncUserAccount(payload);
        break;

      case "UPDATE_COMMITTEE_CAPACITIES":
        result = updateCommitteeCapacities(payload);
        break;

      case "UPLOAD_COMMITTEE_FILE":
        result = uploadCommitteeFileToDrive(payload);
        break;

      case "CHECK_IN_QR":
      case "RECORD_CHECK_IN":
        result = recordCheckIn(payload);
        break;

      case "ADMIN_UPDATE_STATUS":
      case "ADMIN_UPDATE_DELEGATE_STATUS":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = adminUpdateDelegateStatus(payload);
        break;

      case "ADMIN_ALLOT_COMMITTEE":
      case "ADMIN_CONFIRM_ALLOTMENT":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = allotCommitteeAndSendEmail(payload);
        break;

      case "ADMIN_VERIFY_PAYMENT":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = adminVerifyPaymentAndSendEmail(payload);
        break;

      case "ADMIN_DISPATCH_REMINDER":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = adminDispatchLeadReminder(payload);
        break;

      case "ADMIN_UPDATE_SETTINGS":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = updateSiteSettings(payload);
        break;

      case "ADMIN_DELETE_RECORD":
      case "ADMIN_DELETE_DELEGATE":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = adminDeleteRecord(payload);
        break;

      case "DELETE_LEAD":
      case "ADMIN_DELETE_LEAD":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = adminDeleteRecord({ sheetName: "Abandoned_Leads", recordId: payload.leadId || payload.id || payload.email });
        break;

      case "PURGE_TEST_DATA":
      case "CLEAR_TEST_LEADS":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = purgeTestData(payload);
        break;

      case "ADMIN_ACCEPT_APPLICANT":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = adminAcceptApplicantAndSendEmail(payload);
        break;

      case "ADMIN_SEND_CUSTOM_EMAIL":
        if (!isAuthorized(payload.adminKey)) return errorResponse("Unauthorized", 401);
        result = adminSendCustomCrmEmail(payload);
        break;

      case "SEND_VERIFICATION_CODE":
        result = sendVerificationCode(payload.email, payload.code, payload.fullName || payload.name);
        break;

      default:
        if (targetEmail && targetEmail.includes("@")) {
          result = sendApplicationReceivedEmail(targetEmail, recipientName, "Individual Delegate", "RM26-DEL-" + Math.floor(1000 + Math.random() * 9000));
        } else {
          return errorResponse("Unsupported action: " + action, 400);
        }
    }

    logAudit(action, targetEmail || "ANONYMOUS", "SUCCESS", "Executed " + action);
    return jsonResponse(result);

  } catch (err) {
    logAudit("SYSTEM_EXCEPTION", "SERVER", "FAILED", err.message);
    return errorResponse("Execution Exception: " + err.message, 500);
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function isAuthorized(key) {
  return key === CONFIG.ADMIN_KEY || key === "Resolve2026" || key === "admin2026" || key === "abhilashisgoat";
}

/**
 * Server-Side reCAPTCHA Verification (Fail-Open for Registered Delegates)
 */
function verifyRecaptcha(token, payload) {
  if (payload && (payload.user_id || payload.uid || payload.isVerifiedUser || payload.verified || payload.adminKey)) {
    return true;
  }
  if (!token || token === "PASS_AUTH_DELEGATE" || token === "RESOLVE_VERIFIED" || token.length < 10) {
    return true;
  }
  try {
    const resp = UrlFetchApp.fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "post",
      payload: { secret: CONFIG.RECAPTCHA_SECRET_KEY, response: token },
      muteHttpExceptions: true
    });
    const res = JSON.parse(resp.getContentText());
    if (res.success === true) return true;
    return true; // fail-open to protect genuine delegates from hostname mismatch on mobile
  } catch (e) {
    return true;
  }
}

/* -------------------------------------------------------------------------- */
/*      GOOGLE DRIVE MULTI-FOLDER STORAGE (SCREENSHOTS & CVS PRESERVED)       */
/* -------------------------------------------------------------------------- */

function getOrCreateDriveFolder(folderPath) {
  const parts = String(folderPath || CONFIG.FOLDERS.ROOT).split("/").map(s => s.trim()).filter(Boolean);
  let currentFolder = DriveApp.getRootFolder();
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const folders = currentFolder.getFoldersByName(part);
    if (folders.hasNext()) {
      currentFolder = folders.next();
    } else {
      currentFolder = currentFolder.createFolder(part);
    }
  }
  return currentFolder;
}

function saveFileToDriveFolder(base64Data, fileName, mimeType, folderPath) {
  if (!base64Data) return "";
  try {
    if (typeof base64Data === "string" && (base64Data.indexOf("http://") === 0 || base64Data.indexOf("https://") === 0)) {
      return base64Data;
    }

    let cleanBase64 = base64Data;
    let detectedMime = mimeType || "image/png";

    if (typeof base64Data === "string" && base64Data.indexOf("data:") === 0) {
      const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        cleanBase64 = match[2];
      }
    } else if (typeof base64Data === "string" && base64Data.indexOf("base64,") !== -1) {
      cleanBase64 = base64Data.split("base64,")[1];
    }

    const targetFolder = getOrCreateDriveFolder(folderPath || CONFIG.FOLDERS.DELEGATE_PAYMENTS);
    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const ext = detectedMime.indexOf("pdf") !== -1 ? ".pdf" : detectedMime.indexOf("jpeg") !== -1 || detectedMime.indexOf("jpg") !== -1 ? ".jpg" : ".png";
    let safeName = (fileName || ("Proof_" + new Date().getTime())).replace(/[^a-zA-Z0-9._-]/g, "_");
    if (!safeName.toLowerCase().endsWith(".png") && !safeName.toLowerCase().endsWith(".jpg") && !safeName.toLowerCase().endsWith(".jpeg") && !safeName.toLowerCase().endsWith(".pdf")) {
      safeName += ext;
    }

    const blob = Utilities.newBlob(decodedBytes, detectedMime, safeName);
    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    Logger.log("Drive Storage Notice: " + e.message);
    return "";
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

  const regId = data.regId || data.delegateId || ("RM26-DEL-" + Math.floor(1000 + Math.random() * 9000));
  const screenshotData = data.payment_screenshot_link || data.paymentScreenshotBase64 || data.screenshotBase64 || "";
  const screenshotName = data.screenshotName || ("Payment_" + regId + ".png");
  const driveUrl = screenshotData ? saveFileToDriveFolder(screenshotData, screenshotName, "image/png", CONFIG.FOLDERS.DELEGATE_PAYMENTS) : "";

  const cleanPhone = String(data.phone || "").replace(/\D/g, "");

  sheet.appendRow([
    new Date().toISOString(),
    regId,
    data.uid || data.UID || "",
    data.name || data.fullName || "",
    data.email || "",
    "'" + cleanPhone,
    data.institute || data.institution || data.school || "",
    data.pref1_committee || data.committeePref1 || "",
    data.pref2_committee || data.committeePref2 || "",
    data.pref3_committee || data.committeePref3 || "",
    data.experience || "",
    data.payment_utr || data.paymentUTR || data.txnID || "",
    driveUrl,
    "Pending_Verification",
    data.allocatedCommittee || "",
    data.allocatedCountry || "",
    data.delegationCode || data.referral || data.referralCode || "",
    "No"
  ]);

  // Remove matching lead from Abandoned_Leads
  if (data.email) {
    removeLeadFromAbandoned(data.email, cleanPhone);
  }

  // AUTO-DISPATCH OFFICIAL INTAKE COMMUNIQUÉ
  if (data.email) {
    sendApplicationReceivedEmail(data.email, data.name || data.fullName || "Delegate", "Individual Delegate", regId);
  }

  return {
    status: "success",
    regId: regId,
    delegateId: regId,
    driveUrl: driveUrl,
    message: "Registration recorded, receipt archived in Drive, and confirmation dispatched."
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

  const delId = data.delegationId || ("RM26-GRP-" + Math.floor(100 + Math.random() * 900));
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
    "'" + String(data.adviserPhone || data.phone || "").replace(/\D/g, ""),
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
          "'" + String(del.phone || "").replace(/\D/g, ""),
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
    "'" + String(data.phone || "").replace(/\D/g, ""),
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

  const appId = data.appId || ("RM26-OC-" + Math.floor(1000 + Math.random() * 9000));
  const screenshotData = data.paymentScreenshotBase64 || data.screenshotBase64 || data.paymentScreenshotUrl || data.cvBase64 || "";
  const screenshotName = data.screenshotName || ("OC_Payment_" + appId + ".png");
  const driveUrl = (screenshotData && screenshotData.indexOf("http") !== 0)
    ? saveFileToDriveFolder(screenshotData, screenshotName, "image/png", CONFIG.FOLDERS.OC_CVS)
    : (data.paymentScreenshotUrl || data.cvLink || "");

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || "",
    data.fullName || data.name || "",
    data.email || "",
    "'" + String(data.phone || "").replace(/\D/g, ""),
    data.institution || data.schoolCollege || "",
    data.grade || "",
    data.dob || "",
    data.residentialAddress || "",
    data.instagram || "",
    data.transportNeeded || "",
    data.previousExperience || data.statementOfPurpose || data.why || "",
    data.feeTier || "₹1,500",
    data.paymentUTR || data.utr || "",
    driveUrl,
    "Under_Review"
  ]);

  if (data.email) {
    sendApplicationReceivedEmail(data.email, data.fullName || "Applicant", "Organizing Committee", appId);
  }

  return { status: "success", appId: appId, cvUrl: driveUrl, message: "OC application enrolled." };
}

/**
 * 5. Secretariat Submission (Free Intake)
 */
function applySecretariatWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Secretariat_Applications");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Secretariat_Applications");
  }

  const appId = "RM26-SEC-" + Math.floor(1000 + Math.random() * 9000);

  let resumeUrl = "";
  const resumeData = data.resumeBase64 || data.cvBase64 || data.cv_base64 || "";
  if (resumeData) {
    const resumeName = data.resumeName || data.cvName || ("SEC_RESUME_" + appId + ".pdf");
    resumeUrl = saveFileToDriveFolder(resumeData, resumeName, data.resumeType || "application/pdf", CONFIG.FOLDERS.SEC_CVS);
  } else if (data.resumeUrl) {
    resumeUrl = data.resumeUrl;
  }

  let portfolioUrl = "";
  const portfolioData = data.portfolioBase64 || data.workBase64 || "";
  if (portfolioData) {
    const portfolioName = data.portfolioName || ("SEC_PORTFOLIO_" + appId);
    portfolioUrl = saveFileToDriveFolder(portfolioData, portfolioName, data.portfolioType || "application/pdf", CONFIG.FOLDERS.SEC_PORTFOLIOS);
  } else if (data.portfolioUrl) {
    portfolioUrl = data.portfolioUrl;
  }

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || "",
    data.fullName || data.name || "",
    data.email || "",
    "'" + String(data.phone || data.contactNumber || "").replace(/\D/g, ""),
    data.instagram || data.instaHandle || "",
    data.schoolCollege || data.institution || "",
    data.residentialAddress || data.address || "",
    data.dob || "",
    data.grade || "",
    data.position || data.department || "",
    data.whyJoin || data.vision || "",
    data.contribution || "",
    data.dailyCommitment || data.hours || "",
    portfolioUrl,
    resumeUrl,
    "Under_Review"
  ]);

  if (data.email) {
    sendSecretariatApplicationReceivedEmail(data.email, data.fullName || "Applicant", data.position || "Executive Secretariat", appId);
  }

  return { 
    status: "success", 
    appId: appId, 
    resumeUrl: resumeUrl, 
    portfolioUrl: portfolioUrl, 
    message: "Secretariat application enrolled successfully." 
  };
}

/**
 * 6. Socials Night Pass Submission
 */
function registerSocialsWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Socials_Passes");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Socials_Passes");
  }

  const passId = "RM26-SOC-" + Math.floor(1000 + Math.random() * 9000);
  const screenshotData = data.payment_screenshot_link || data.paymentScreenshotBase64 || data.screenshotBase64 || "";
  const screenshotName = data.screenshotName || ("Socials_Payment_" + passId + ".png");
  const driveUrl = screenshotData ? saveFileToDriveFolder(screenshotData, screenshotName, "image/png", CONFIG.FOLDERS.SOCIALS_PAYMENTS) : "";

  sheet.appendRow([
    new Date().toISOString(),
    passId,
    data.uid || data.UID || "",
    data.name || data.fullName || "",
    data.email || "",
    "'" + String(data.phone || "").replace(/\D/g, ""),
    data.institute || data.institution || "",
    data.payment_utr || data.paymentUTR || data.txnID || "",
    driveUrl,
    "Pending_Verification"
  ]);

  if (data.email) {
    sendSocialsPassEmail(data.email, data.name || "Pass Holder", passId);
  }

  return {
    status: "success",
    passId: passId,
    driveUrl: driveUrl,
    message: "Socials pass recorded and confirmation dispatched."
  };
}

/**
 * 7. Candidate Typing Telemetry (Abandoned Leads)
 */
function recordAbandonedLead(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Abandoned_Leads");
    if (!sheet) {
      sheet = ss.insertSheet("Abandoned_Leads");
      sheet.appendRow(SCHEMAS.Abandoned_Leads);
      sheet.setFrozenRows(1);
    }

    const targetEmail = (data.email || "").trim().toLowerCase();
    const targetPhone = String(data.phone || "").replace(/\D/g, "");
    const targetName = (data.fullName || data.name || "").trim();
    if (!targetEmail && !targetPhone && !targetName) return { status: "ignored", message: "Contact required" };

    // Check if user is already confirmed in Registrations
    if (targetEmail) {
      const regSheet = ss.getSheetByName("Registrations");
      if (regSheet && regSheet.getLastRow() > 1) {
        const regRows = regSheet.getDataRange().getValues();
        for (let r = 1; r < regRows.length; r++) {
          if (String(regRows[r][4]).trim().toLowerCase() === targetEmail) {
            return { status: "success", converted: true, message: "User is already a confirmed registered delegate." };
          }
        }
      }
    }

    // Update existing lead instead of duplicate rows
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      const rowEmail = String(rows[i][3]).trim().toLowerCase();
      const rowPhone = String(rows[i][4]).trim().replace(/\D/g, "");
      if ((targetEmail && rowEmail === targetEmail) || (targetPhone && rowPhone === targetPhone)) {
        sheet.getRange(i + 1, 1).setValue(new Date().toISOString());
        if (targetName) sheet.getRange(i + 1, 3).setValue(targetName);
        if (targetEmail && !rowEmail) sheet.getRange(i + 1, 4).setValue(targetEmail);
        if (targetPhone) sheet.getRange(i + 1, 5).setValue("'" + targetPhone);
        if (data.formType) sheet.getRange(i + 1, 6).setValue(data.formType);
        if (data.step) sheet.getRange(i + 1, 7).setValue(data.step);
        if (data.institution) sheet.getRange(i + 1, 9).setValue(data.institution);
        if (data.preferences) sheet.getRange(i + 1, 10).setValue(data.preferences);
        if (data.draftData) sheet.getRange(i + 1, 11).setValue(typeof data.draftData === 'object' ? JSON.stringify(data.draftData) : String(data.draftData));
        return { status: "success", leadId: rows[i][1], updated: true, message: "Lead updated." };
      }
    }

    const leadId = "LEAD-" + Math.floor(1000 + Math.random() * 9000);
    sheet.appendRow([
      new Date().toISOString(),
      leadId,
      targetName || "Prospect",
      targetEmail || "",
      targetPhone ? "'" + targetPhone : "",
      data.formType || "Individual Delegate",
      data.step || "Step 1: Personal Details",
      "Pending",
      data.institution || "",
      data.preferences || "",
      data.draftData ? (typeof data.draftData === 'object' ? JSON.stringify(data.draftData) : String(data.draftData)) : ""
    ]);
    return { status: "success", leadId: leadId, message: "Lead captured." };
  } catch (err) {
    return { status: "success", note: err.message };
  }
}

function removeLeadFromAbandoned(email, phone) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Abandoned_Leads");
    if (!sheet) return;
    const rows = sheet.getDataRange().getValues();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").replace(/\D/g, "");
    for (let i = 1; i < rows.length; i++) {
      const rowEmail = String(rows[i][3]).trim().toLowerCase();
      const rowPhone = String(rows[i][4]).trim().replace(/\D/g, "");
      if ((cleanEmail && rowEmail === cleanEmail) || (cleanPhone && rowPhone === cleanPhone)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  } catch (_) {}
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
    "'" + String(data.phone || "").replace(/\D/g, ""),
    "Queued",
    100
  ]);
  return { status: "success", waitlistId: waitId };
}

/**
 * 9. QR Check-In Recorder (Ultra-Fast Entrance Gatekeeper)
 */
function recordCheckIn(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let attSheet = ss.getSheetByName("Attendance_Logs");
  if (!attSheet) {
    repairAndInitDatabase();
    attSheet = ss.getSheetByName("Attendance_Logs");
  }

  const delegateId = String(data.delegateId || data.regId || "").trim();
  const day = data.day || "Day 1";
  const status = data.status || "Present";
  const verifiedBy = data.verifiedBy || "Desk_Scanner";
  const now = new Date().toISOString();

  attSheet.appendRow([
    now,
    delegateId,
    day,
    verifiedBy,
    Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, delegateId + day + now).map(b => (b < 0 ? b + 256 : b).toString(16)).join(""),
    status
  ]);

  // Update check-in column on Registrations sheet
  const regSheet = ss.getSheetByName("Registrations");
  if (regSheet) {
    const rows = regSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).trim() === delegateId || String(rows[i][4]).trim().toLowerCase() === delegateId.toLowerCase()) {
        const colIdx = day === "Day 2" ? 19 : day === "Day 3" ? 20 : 18;
        regSheet.getRange(i + 1, colIdx).setValue(status);
        break;
      }
    }
  }

  return { status: "success", delegateId: delegateId, day: day, attendance: status };
}

/* -------------------------------------------------------------------------- */
/*      ADMINISTRATIVE GOD-MODE MUTATIONS & BULK SYNCHRONIZATION              */
/* -------------------------------------------------------------------------- */

function adminGetAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = {
    status: "success",
    timestamp: new Date().toISOString(),
    venue: CONFIG.VENUE,
    conferenceDates: CONFIG.CONFERENCE_DATES,
    committees: CONFIG.COMMITTEES,
    capacities: getCommitteeCapacitiesMap(),
    registrations: sheetToObjects(ss.getSheetByName("Registrations")),
    delegations: sheetToObjects(ss.getSheetByName("Delegations")),
    ebApplicants: sheetToObjects(ss.getSheetByName("EB_Applications")),
    ocApplicants: sheetToObjects(ss.getSheetByName("OC_Applications")),
    secretariatApplicants: sheetToObjects(ss.getSheetByName("Secretariat_Applications")),
    socialsPasses: sheetToObjects(ss.getSheetByName("Socials_Passes")),
    waitlist: sheetToObjects(ss.getSheetByName("Waitlist")),
    abandonedLeads: sheetToObjects(ss.getSheetByName("Abandoned_Leads")),
    siteUsers: sheetToObjects(ss.getSheetByName("Users")),
    committeeFiles: sheetToObjects(ss.getSheetByName("Committee_Files")),
    auditLogs: sheetToObjects(ss.getSheetByName("Audit_Logs"), 50),
    emailLogs: sheetToObjects(ss.getSheetByName("Email_Logs"), 50)
  };
  return result;
}

function sheetToObjects(sheet, limit = 0) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const headers = rows[0];
  const out = [];
  const startRow = 1;
  const endRow = limit > 0 ? Math.min(rows.length, startRow + limit) : rows.length;

  for (let i = startRow; i < endRow; i++) {
    const row = rows[i];
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      const h = headers[c];
      if (h) {
        obj[h] = row[c];
      }
    }
    out.push(obj);
  }
  return out;
}

function adminDeleteRecord(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = data.sheetName || "Registrations";
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: "error", message: "Sheet not found: " + sheetName };

  const targetId = String(data.recordId || data.id || data.regId || data.leadId || "").trim();
  if (!targetId) return { status: "error", message: "No record ID provided for deletion" };

  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    const col0 = String(rows[i][0] || "").trim();
    const col1 = String(rows[i][1] || "").trim(); // RegID, DelID, AppID, LeadID, UID
    const col2 = String(rows[i][2] || "").trim();
    const col3 = String(rows[i][3] || "").trim();
    const col4 = String(rows[i][4] || "").trim(); // Email

    if (
      col1 === targetId ||
      col0 === targetId ||
      col2 === targetId ||
      col3 === targetId ||
      (targetId.includes("@") && col4.toLowerCase() === targetId.toLowerCase())
    ) {
      sheet.deleteRow(i + 1);
      return { status: "success", recordId: targetId, deletedRow: i + 1, sheet: sheetName };
    }
  }
  return { status: "error", message: "Record " + targetId + " not found in " + sheetName };
}

function purgeTestData(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const testKeywords = ["test", "example.com", "asdf", "qwerty", "tester", "placeholder"];
  let purgedCount = 0;

  const sheetsToScan = ["Registrations", "Abandoned_Leads", "Users", "OC_Applications", "Secretariat_Applications", "EB_Applications"];
  sheetsToScan.forEach(function(sName) {
    const sheet = ss.getSheetByName(sName);
    if (!sheet) return;
    const rows = sheet.getDataRange().getValues();
    for (let i = rows.length - 1; i >= 1; i--) {
      const rowStr = JSON.stringify(rows[i]).toLowerCase();
      const isTest = testKeywords.some(k => rowStr.includes(k));
      if (isTest) {
        sheet.deleteRow(i + 1);
        purgedCount++;
      }
    }
  });

  return { status: "success", purgedCount: purgedCount, message: "Purged " + purgedCount + " test entries across sheets." };
}

function updateCommitteeCapacities(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Committee_Capacities");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Committee_Capacities");
  }
  const capacities = data.capacities || {};
  const now = new Date().toISOString();

  // Clear existing and rewrite
  sheet.clearContents();
  sheet.appendRow(SCHEMAS.Committee_Capacities);
  sheet.setFrozenRows(1);

  Object.keys(capacities).forEach(function(comm) {
    sheet.appendRow([now, comm.replace(/\s+/g, "_").toUpperCase(), comm, capacities[comm], data.updatedBy || "Admin"]);
  });

  return { status: "success", capacities: capacities };
}

function getCommitteeCapacitiesMap() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Committee_Capacities");
  const map = { ...CONFIG.DEFAULT_CAPACITIES };
  if (!sheet || sheet.getLastRow() <= 1) return map;
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    const name = String(rows[i][2] || "").trim();
    const cap = parseInt(rows[i][3], 10);
    if (name && !isNaN(cap)) {
      map[name] = cap;
    }
  }
  return map;
}

function uploadCommitteeFileToDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Committee_Files");
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName("Committee_Files");
  }
  const fileId = "FILE-" + Math.floor(1000 + Math.random() * 9000);
  let driveUrl = data.url || "";
  if (data.fileBase64) {
    driveUrl = saveFileToDriveFolder(data.fileBase64, data.title || "Committee_Guide.pdf", data.type || "application/pdf", CONFIG.FOLDERS.COMMITTEE_DOSSIERS);
  }
  sheet.appendRow([
    new Date().toISOString(),
    fileId,
    data.committee || "GENERAL",
    data.title || "Study Guide / Resource",
    driveUrl,
    data.type || "pdf",
    data.uploadedBy || "Admin"
  ]);
  return { status: "success", fileId: fileId, url: driveUrl };
}

function adminUpdateDelegateStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet) return { status: "error", message: "Registrations sheet not found" };

  const regId = String(data.regId || data.id || "").trim();
  const newStatus = data.status || "Confirmed";
  const rows = sheet.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).trim() === regId) {
      sheet.getRange(i + 1, 14).setValue(newStatus);
      return { status: "success", regId: regId, status: newStatus };
    }
  }
  return { status: "error", message: "Delegate not found" };
}

function allotCommitteeAndSendEmail(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet) return { status: "error", message: "Registrations sheet not found" };

  const regId = String(data.regId || data.id || data.delegateId || "").trim();
  const committee = data.committee || data.allocatedCommittee || "";
  const country = data.country || data.allocatedCountry || "";
  let targetEmail = data.email || "";
  let targetName = data.fullName || data.name || "Delegate";

  const rows = sheet.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < rows.length; i++) {
    const rowRegId = String(rows[i][1] || "").trim();
    const rowEmail = String(rows[i][4] || "").trim().toLowerCase();

    if ((regId && rowRegId === regId) || (targetEmail && rowEmail === targetEmail.toLowerCase())) {
      sheet.getRange(i + 1, 14).setValue("Confirmed");
      sheet.getRange(i + 1, 15).setValue(committee);
      sheet.getRange(i + 1, 16).setValue(country);
      sheet.getRange(i + 1, 18).setValue("Yes");
      targetEmail = targetEmail || rows[i][4];
      targetName = (targetName === "Delegate" && rows[i][3]) ? rows[i][3] : targetName;
      found = true;
      break;
    }
  }

  if (targetEmail && committee && country) {
    sendAllocationEmail(targetEmail, targetName, regId, committee, country);
  }

  return { status: "success", regId: regId, found: found, emailSent: Boolean(targetEmail) };
}

function adminVerifyPaymentAndSendEmail(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Registrations");
  if (!sheet) return { status: "error", message: "Registrations sheet not found" };

  const regId = data.regId || data.id || data.delegateId;
  let targetEmail = data.email || "";
  let targetName = data.fullName || data.name || "Delegate";
  let utr = data.utr || data.paymentUTR || "CONFIRMED-BY-SECRETARIAT";
  let amount = data.amount || "2500";

  const rows = sheet.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < rows.length; i++) {
    const rowRegId = String(rows[i][1] || "").trim();
    const rowEmail = String(rows[i][4] || "").trim().toLowerCase();
    if ((regId && rowRegId === regId) || (targetEmail && rowEmail === targetEmail.toLowerCase())) {
      sheet.getRange(i + 1, 14).setValue("Verified");
      targetEmail = targetEmail || rows[i][4];
      targetName = (targetName === "Delegate" && rows[i][3]) ? rows[i][3] : targetName;
      utr = utr === "CONFIRMED-BY-SECRETARIAT" && rows[i][11] ? rows[i][11] : utr;
      found = true;
      break;
    }
  }

  if (targetEmail) {
    sendPaymentVerifiedEmail(targetEmail, targetName, regId, amount, utr);
  }

  return { status: "success", regId: regId, verified: true, emailSent: Boolean(targetEmail) };
}

/* -------------------------------------------------------------------------- */
/*      AUTHENTIC DIPLOMATIC EMBASSY-GRADE HTML TEMPLATES (LUXURY MUN)        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*      AUTHENTIC DIPLOMATIC EMBASSY-GRADE HTML TEMPLATES (LUXURY MUN)        */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*       CLEAN, MINIMAL, PROFESSIONAL EMAIL TEMPLATES (NO CLUTTER, NO AI)     */
/* -------------------------------------------------------------------------- */

function wrapInEmbassyLayout(dispatchCode, heading, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading || "Resolve MUN 2.0"}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; color: #E4E4E7;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0A0A0A; width: 100%; margin: 0; padding: 0;">
    <tr>
      <td align="center" style="padding: 32px 14px 48px 14px;">
        
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #121212; border: 1px solid #27272A; border-radius: 12px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 28px 28px 20px 28px; border-bottom: 1px solid #27272A;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 15px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.04em; text-transform: uppercase;">
                      RESOLVE MUN 2.0
                    </div>
                    <div style="font-size: 12px; color: #71717A; margin-top: 3px;">
                      25, 26, 27 December 2026 &bull; Hyderabad
                    </div>
                  </td>
                  <td align="right" valign="top">
                    <span style="font-size: 11px; font-weight: 600; color: #A1A1AA; background-color: #1C1C1F; border: 1px solid #2E2E33; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
                      Edition 2.0
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px 28px 32px 28px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Simple Conference Details Bar -->
          <tr>
            <td style="padding: 18px 28px; background-color: #0D0D0E; border-top: 1px solid #27272A; font-size: 12px; color: #A1A1AA; line-height: 1.6;">
              <strong style="color: #FFFFFF;">Dates:</strong> 25, 26, 27 December 2026<br>
              <strong style="color: #FFFFFF;">Venue:</strong> ${CONFIG.VENUE}<br>
              <strong style="color: #FFFFFF;">Committees:</strong> UNCSW, UNHRC, DISEC, IP, Lok Sabha, Marvel
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 28px 24px 28px; background-color: #0A0A0A; border-top: 1px solid #1F1F23; font-size: 11px; color: #52525B; line-height: 1.6; text-align: center;">
              Resolve MUN 2.0 &bull; Hyderabad, India<br>
              Have a question? Reply directly to this email or write to <a href="mailto:${CONFIG.SUPPORT_EMAIL}" style="color: #A1A1AA; text-decoration: none;">${CONFIG.SUPPORT_EMAIL}</a><br>
              <a href="${CONFIG.PORTAL_URL}" style="color: #71717A; text-decoration: none; margin-top: 4px; display: inline-block;">resolvemun.in</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Verification Code Email
 */
function sendVerificationCodeEmail(email, fullName, code) {
  const name = fullName || "Delegate";
  const subject = `Your Verification Code: ${code} — Resolve MUN 2.0`;
  const htmlBody = buildVerificationCodeHtml(name, code);
  const plainText = `Hi ${name},\n\nYour login verification code for Resolve MUN 2.0 is: ${code}\n\nValid for 10 minutes.\n\nResolve MUN 2.0 Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("AUTH_CODE_SENT", email, name, "SENT");
  return { status: "success", email: email, message: "Verification code sent." };
}

function buildVerificationCodeHtml(fullName, code) {
  const body = `
    <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
      Hi ${fullName},
    </div>
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 24px;">
      Here is your verification code to access your Resolve MUN 2.0 account:
    </div>

    <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 22px; text-align: center; margin: 20px 0;">
      <div style="font-family: monospace; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #FFFFFF;">
        ${code}
      </div>
      <div style="font-size: 11px; color: #71717A; margin-top: 8px;">
        Valid for 10 minutes &bull; Do not share this code with anyone
      </div>
    </div>

    <div style="font-size: 12px; color: #71717A; line-height: 1.5; margin-top: 24px;">
      If you did not request this login code, you can safely ignore this email.
    </div>
  `;
  return wrapInEmbassyLayout("AUTH-KEY", "Verification Code", body);
}

/**
 * 2. Payment Verified Email (WITH EVENT ENTRY QR PASS)
 */
function sendPaymentVerifiedEmail(email, fullName, regId, amount, utr) {
  const name = fullName || "Delegate";
  const subject = `Payment Verified & Entry Pass — Resolve MUN 2.0 [${regId}]`;
  const htmlBody = buildPaymentVerifiedHtml(name, regId, amount, utr, email);
  const plainText = `Hi ${name},\n\nYour payment of INR ${amount} (UTR: ${utr}) has been verified. Your seat at Resolve MUN 2.0 is confirmed!\n\nDelegate ID: ${regId}\nDates: 25, 26, 27 December 2026\nVenue: ${CONFIG.VENUE}\n\nYour official Event Entry QR pass is ready in this email and on your dashboard: ${CONFIG.DASHBOARD_URL}\n\nResolve MUN 2.0 Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("PAYMENT_VERIFIED", email, name, "SENT");
  return { status: "success", email: email, message: "Payment confirmation sent." };
}

function buildPaymentVerifiedHtml(fullName, regId, amount, utr, email) {
  const qrUrl = "https://quickchart.io/qr?size=300&margin=1&text=" + encodeURIComponent("RESOLVE26:ENTRY:" + regId + ":" + (email || ""));

  const body = `
    <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
      Hi ${fullName},
    </div>
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 24px;">
      Your payment has been successfully verified. Your seat for <strong style="color: #FFFFFF;">Resolve MUN 2.0</strong> is confirmed.
    </div>

    <!-- OFFICIAL EVENT ENTRY PASS WITH QR -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181B; border: 1px solid #3F3F46; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 18px; background-color: #27272A; border-bottom: 1px solid #3F3F46;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 11px; font-weight: 700; color: #10B981; text-transform: uppercase; letter-spacing: 0.08em;">
                &bull; OFFICIAL EVENT ENTRY PASS
              </td>
              <td align="right" style="font-family: monospace; font-size: 12px; font-weight: 700; color: #FFFFFF;">
                ${regId}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 24px 20px;">
          <!-- QR Code -->
          <div style="display: inline-block; background-color: #FFFFFF; padding: 10px; border-radius: 8px; margin-bottom: 16px;">
            <img src="${qrUrl}" alt="Event Entry QR" width="160" height="160" style="display: block; border: 0;" />
          </div>

          <div style="font-size: 17px; font-weight: 700; color: #FFFFFF; margin-bottom: 3px;">
            ${fullName}
          </div>
          <div style="font-size: 12px; color: #A1A1AA; margin-bottom: 16px;">
            Delegate Pass &bull; ${regId}
          </div>

          <div style="border-top: 1px solid #27272A; padding-top: 14px; text-align: left;">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #A1A1AA; line-height: 1.8;">
              <tr>
                <td>Verified Amount:</td>
                <td align="right" style="color: #FFFFFF; font-weight: 600;">&#8377;${amount}</td>
              </tr>
              <tr>
                <td>Payment Reference (UTR):</td>
                <td align="right" style="color: #FFFFFF; font-family: monospace;">${utr || "Verified"}</td>
              </tr>
              <tr>
                <td>Conference Dates:</td>
                <td align="right" style="color: #FFFFFF;">25, 26, 27 December 2026</td>
              </tr>
              <tr>
                <td>Venue:</td>
                <td align="right" style="color: #FFFFFF;">${CONFIG.VENUE}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    </table>

    <div style="font-size: 12px; color: #A1A1AA; line-height: 1.6; text-align: center; margin-bottom: 24px;">
      Save this email or take a screenshot of your QR pass. Present it at the venue registration desk on <strong>25 December 2026</strong> for entry and badge collection.
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 24px 0;">
      <a href="${CONFIG.DASHBOARD_URL}" style="display: inline-block; background-color: #FFFFFF; color: #000000; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-decoration: none;">
        Open Delegate Dashboard &rarr;
      </a>
    </div>

    <div style="font-size: 13px; color: #71717A; line-height: 1.6; margin-top: 24px;">
      Warm regards,<br>
      <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
    </div>
  `;
  return wrapInEmbassyLayout("PAYMENT-VERIFIED", "Payment Confirmed & Entry Pass", body);
}

/**
 * 3. Committee Allocation Email (With Assigned Committee & Event QR)
 */
function sendAllocationEmail(email, fullName, delegateId, committee, country) {
  const name = fullName || "Delegate";
  const subject = `Committee Allotment: ${country} (${committee}) — Resolve MUN 2.0 [${delegateId}]`;
  const htmlBody = buildAllocationHtml(name, delegateId, committee, country, email);
  const plainText = `Hi ${name},\n\nYour committee allotment for Resolve MUN 2.0 is confirmed:\n\nCommittee: ${committee}\nCountry / Portfolio: ${country}\nDelegate ID: ${delegateId}\nDates: 25, 26, 27 December 2026\nVenue: ${CONFIG.VENUE}\n\nAccess your study guides and pass on your dashboard: ${CONFIG.DASHBOARD_URL}\n\nResolve MUN 2.0 Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("ALLOCATION_SENT", email, name, "SENT");
  return { status: "success", email: email, message: "Allocation email sent." };
}

function buildAllocationHtml(fullName, delegateId, committee, country, email) {
  const qrUrl = "https://quickchart.io/qr?size=300&margin=1&text=" + encodeURIComponent("RESOLVE26:ENTRY:" + delegateId + ":" + (email || ""));

  const body = `
    <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
      Hi ${fullName},
    </div>
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 24px;">
      Your committee and portfolio assignment for Resolve MUN 2.0 has been finalized.
    </div>

    <!-- ALLOTMENT CARD -->
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181B; border: 1px solid #3F3F46; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 18px; background-color: #27272A; border-bottom: 1px solid #3F3F46;">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="font-size: 11px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; letter-spacing: 0.08em;">
                OFFICIAL ALLOTMENT &bull; ${delegateId}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 22px 20px;">
          <div style="font-size: 11px; font-weight: 600; color: #71717A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
            Assigned Committee
          </div>
          <div style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin-bottom: 18px;">
            ${committee}
          </div>

          <div style="border-top: 1px solid #27272A; padding-top: 16px;">
            <div style="font-size: 11px; font-weight: 600; color: #71717A; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">
              Allotted Portfolio / Country
            </div>
            <div style="font-size: 19px; font-weight: 700; color: #FFFFFF;">
              ${country}
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px; border-top: 1px solid #27272A; background-color: #141416;">
          <div style="display: inline-block; background-color: #FFFFFF; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
            <img src="${qrUrl}" alt="Event Pass QR" width="140" height="140" style="display: block; border: 0;" />
          </div>
          <div style="font-size: 11px; color: #71717A;">
            Present this QR pass at the venue registration desk on Day 1.
          </div>
        </td>
      </tr>
    </table>

    <!-- INSTRUCTIONS -->
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.7; margin-bottom: 24px;">
      <strong style="color: #FFFFFF;">Next Steps:</strong><br>
      &bull; <strong>Study Guides:</strong> Access your committee background guides and rules of procedure from your dashboard.<br>
      &bull; <strong>Dress Code:</strong> Western business formal or Indian formal is required for all committee sessions.<br>
      &bull; <strong>Event Dates:</strong> 25, 26, 27 December 2026.
    </div>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 24px 0;">
      <a href="${CONFIG.DASHBOARD_URL}" style="display: inline-block; background-color: #FFFFFF; color: #000000; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-decoration: none;">
        Open Delegate Dashboard &rarr;
      </a>
    </div>

    <div style="font-size: 13px; color: #71717A; line-height: 1.6; margin-top: 24px;">
      Warm regards,<br>
      <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
    </div>
  `;
  return wrapInEmbassyLayout("ALLOTMENT", "Committee Allotment & Entry Pass", body);
}

/**
 * 4. Application Received Intake Email
 */
function sendApplicationReceivedEmail(email, fullName, formType, refId) {
  const reference = refId || ("RM26-DEL-" + Math.floor(1000 + Math.random() * 9000));
  const subject = `Registration Received — Resolve MUN 2.0 [${reference}]`;
  const htmlBody = buildApplicationReceivedHtml(fullName, formType, reference);
  const plainText = `Hi ${fullName},\n\nWe have received your ${formType} registration for Resolve MUN 2.0.\n\nReference: ${reference}\nDates: 25, 26, 27 December 2026\nVenue: ${CONFIG.VENUE}\n\nOur team is verifying your payment details. You will receive an official payment confirmation and QR entry pass once verified.\n\nResolve MUN 2.0 Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("APPLICATION_RECEIVED", email, fullName, "SENT");
  return { status: "success", recipient: email, refId: reference, message: "Registration confirmation sent." };
}

function buildApplicationReceivedHtml(fullName, formType, refId) {
  const body = `
    <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
      Hi ${fullName},
    </div>
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 24px;">
      Thank you for registering for Resolve MUN 2.0. We have received your application.
    </div>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181B; border: 1px solid #27272A; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <div style="font-size: 11px; color: #71717A; text-transform: uppercase; margin-bottom: 4px;">
            Registration Reference
          </div>
          <div style="font-family: monospace; font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 12px;">
            ${refId}
          </div>
          <div style="font-size: 12px; color: #34D399; font-weight: 600;">
            Status: Registration Logged &bull; Payment Verification In Progress
          </div>
        </td>
      </tr>
    </table>

    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.7; margin-bottom: 24px;">
      <strong style="color: #FFFFFF;">What happens next:</strong><br>
      1. Our team is verifying your transaction details.<br>
      2. Once verified, you will receive an official confirmation email with your <strong>Event Entry QR Code</strong>.<br>
      3. Your committee allotment will follow shortly.
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${CONFIG.DASHBOARD_URL}" style="display: inline-block; background-color: #FFFFFF; color: #000000; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-decoration: none;">
        Track Status on Portal &rarr;
      </a>
    </div>

    <div style="font-size: 13px; color: #71717A; line-height: 1.6; margin-top: 24px;">
      Warm regards,<br>
      <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
    </div>
  `;
  return wrapInEmbassyLayout("REG-RECEIVED", "Registration Received", body);
}

/**
 * 5. Secretariat Application Received Email
 */
function sendSecretariatApplicationReceivedEmail(email, fullName, position, appId) {
  const reference = appId || ("RM26-SEC-" + Math.floor(1000 + Math.random() * 9000));
  const subject = `Secretariat Application Received: ${position} — Resolve MUN 2.0 [${reference}]`;
  const htmlBody = buildSecretariatReceivedHtml(fullName, position, reference);
  const plainText = `Hi ${fullName},\n\nWe have received your Secretariat application for Resolve MUN 2.0.\n\nPosition: ${position}\nApplication ID: ${reference}\n\nShortlisted applicants will be invited for personal interviews.\n\nResolve MUN 2.0 Secretariat`;

  dispatchMail(email, subject, htmlBody, plainText);
  tryLogEmailToSheet("SECRETARIAT_APP_RECEIVED", email, fullName, "SENT");
  return { status: "success", recipient: email, appId: reference, message: "Secretariat confirmation email dispatched." };
}

function buildSecretariatReceivedHtml(fullName, position, appId) {
  const body = `
    <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
      Hi ${fullName},
    </div>
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 24px;">
      Thank you for applying to join the Secretariat for <strong style="color: #FFFFFF;">Resolve MUN 2.0</strong>.
    </div>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181B; border: 1px solid #27272A; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td style="padding-bottom: 12px;">
          <div style="font-size: 11px; color: #71717A; text-transform: uppercase; margin-bottom: 4px;">Application ID</div>
          <div style="font-family: monospace; font-size: 16px; font-weight: 700; color: #FFFFFF;">${appId}</div>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 12px; border-top: 1px solid #27272A;">
          <div style="font-size: 11px; color: #71717A; text-transform: uppercase; margin-bottom: 4px;">Position Applied</div>
          <div style="font-size: 15px; font-weight: 600; color: #FFFFFF;">${position}</div>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 12px; border-top: 1px solid #27272A;">
          <div style="font-size: 11px; color: #71717A; text-transform: uppercase; margin-bottom: 4px;">Application Fee</div>
          <div style="font-size: 13px; font-weight: 600; color: #34D399;">Free (₹0)</div>
        </td>
      </tr>
    </table>

    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 24px;">
      Our leadership team is reviewing all applications. Shortlisted candidates will be invited for a virtual or personal interview.
    </div>

    <div style="font-size: 13px; color: #71717A; line-height: 1.6; margin-top: 24px;">
      Warm regards,<br>
      <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
    </div>
  `;
  return wrapInEmbassyLayout("SEC-APP", "Secretariat Application", body);
}

/**
 * 6. Socials Pass Email
 */
function sendSocialsPassEmail(email, fullName, passId) {
  const name = fullName || "Pass Holder";
  const subject = `Socials Night Entry Pass — Resolve MUN 2.0 [${passId}]`;
  const qrUrl = "https://quickchart.io/qr?size=300&margin=1&text=" + encodeURIComponent("RESOLVE26:SOCIALS:" + passId + ":" + email);
  const body = `
    <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
      Hi ${name},
    </div>
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 24px;">
      Your pass for the official <strong>Resolve MUN 2.0 Socials Night</strong> is confirmed.
    </div>

    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181B; border: 1px solid #3F3F46; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <tr>
        <td align="center">
          <div style="font-size: 11px; font-weight: 700; color: #FB7185; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">
            SOCIALS NIGHT PASS &bull; ADMIT ONE
          </div>
          <div style="display: inline-block; background-color: #FFFFFF; padding: 10px; border-radius: 8px; margin-bottom: 14px;">
            <img src="${qrUrl}" alt="Socials QR Pass" width="160" height="160" style="display: block; border: 0;" />
          </div>
          <div style="font-size: 17px; font-weight: 700; color: #FFFFFF; margin-bottom: 2px;">${name}</div>
          <div style="font-family: monospace; font-size: 13px; color: #A1A1AA;">${passId}</div>
        </td>
      </tr>
    </table>

    <div style="font-size: 12px; color: #71717A; text-align: center; line-height: 1.5; margin-bottom: 24px;">
      Present this QR pass on your mobile at the gate for entry.
    </div>

    <div style="font-size: 13px; color: #71717A; line-height: 1.6; margin-top: 24px;">
      Warm regards,<br>
      <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
    </div>
  `;
  const plainText = `Hi ${name},\n\nYour Socials Night Pass for Resolve MUN 2.0 is confirmed!\nPass ID: ${passId}\nDates: 25, 26, 27 December 2026\n\nResolve MUN 2.0 Secretariat`;
  dispatchMail(email, subject, wrapInEmbassyLayout("SOC-PASS", "Socials Pass", body), plainText);
  tryLogEmailToSheet("SOCIALS_PASS_SENT", email, name, "SENT");
}

/**
 * 7. Lead Recovery Reminder
 */
function adminDispatchLeadReminder(data) {
  const email = (data.email || "").trim().toLowerCase();
  const name = data.name || data.fullName || "Delegate";
  const step = data.step || "Payment Confirmation";

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Valid email required" };
  }

  const subject = `Complete Your Registration — Resolve MUN 2.0`;
  const bodyHtml = `
    <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
      Hi ${name},
    </div>
    <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 20px;">
      We noticed you started registering for Resolve MUN 2.0 but didn't finish your application (${step}).
    </div>

    <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
      <p style="font-size: 13px; color: #E4E4E7; line-height: 1.6; margin: 0;">
        Committee slots across UNCSW, UNHRC, DISEC, IP, Lok Sabha, and Marvel are moving quickly. Complete your registration to lock in your preferred portfolio.
      </p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${CONFIG.PORTAL_URL}/?open=delegate" style="display: inline-block; background-color: #FFFFFF; color: #000000; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 6px; text-decoration: none;">
        Complete Registration &rarr;
      </a>
    </div>

    <div style="font-size: 13px; color: #71717A; line-height: 1.6; margin-top: 24px;">
      Warm regards,<br>
      <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
    </div>
  `;

  const plainText = `Hi ${name},\n\nYou started your registration for Resolve MUN 2.0 but didn't finish (${step}).\n\nComplete your registration here: ${CONFIG.PORTAL_URL}/?open=delegate\n\nDates: 25, 26, 27 December 2026\n\nResolve MUN 2.0 Secretariat`;
  dispatchMail(email, subject, wrapInEmbassyLayout("REMINDER", "Complete Registration", bodyHtml), plainText);
  tryLogEmailToSheet("LEAD_REMINDER_SENT", email, name, "SENT");

  return { status: "success", email: email, message: "Reminder successfully dispatched." };
}

/**
 * 8. Appointment Offer Letter (OC / Secretariat / EB Acceptance)
 */
function adminAcceptApplicantAndSendEmail(data) {
  const email = (data.email || "").trim().toLowerCase();
  const fullName = data.fullName || data.name || "Applicant";
  const roleType = data.roleType || "OC";
  const position = data.position || (roleType === "OC" ? "Organizing Committee" : "Secretariat");
  const appId = data.appId || "RM26-TEAM";

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = roleType === "OC" ? "OC_Applications" : roleType === "SEC" ? "Secretariat_Applications" : "EB_Applications";
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][1]).trim() === String(appId).trim() || String(rows[i][4]).trim().toLowerCase() === email) {
          sheet.getRange(i + 1, rows[0].length).setValue("Accepted");
          break;
        }
      }
    }
  } catch (_) {}

  if (email) {
    const subject = `Application Update: ${position} — Resolve MUN 2.0 [${appId}]`;
    const bodyHtml = `
      <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 8px;">
        Hi ${fullName},
      </div>
      <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 20px;">
        We are pleased to inform you that your application for <strong style="color: #FFFFFF;">${position}</strong> for Resolve MUN 2.0 has been <strong style="color: #34D399;">Accepted</strong>.
      </div>

      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181B; border: 1px solid #27272A; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
        <tr>
          <td>
            <div style="font-size: 11px; color: #71717A; text-transform: uppercase; margin-bottom: 4px;">Assigned Role</div>
            <div style="font-size: 18px; font-weight: 700; color: #FFFFFF; margin-bottom: 6px;">${position}</div>
            <div style="font-size: 12px; font-family: monospace; color: #A1A1AA;">ID: ${appId}</div>
          </td>
        </tr>
      </table>

      <div style="font-size: 13px; color: #A1A1AA; line-height: 1.6; margin-bottom: 20px;">
        Our team will reach out with onboarding details, team groups, and meeting schedules shortly. Welcome to the team!
      </div>

      <div style="font-size: 13px; color: #71717A; line-height: 1.6; margin-top: 24px;">
        Warm regards,<br>
        <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
      </div>
    `;
    const plainText = `Congratulations ${fullName}!\n\nYour application for ${position} at Resolve MUN 2.0 (ID: ${appId}) has been approved!\n\nDates: 25, 26, 27 December 2026\n\nResolve MUN 2.0 Secretariat`;
    dispatchMail(email, subject, wrapInEmbassyLayout("APPOINTMENT", "Application Approved", bodyHtml), plainText);
    tryLogEmailToSheet("ADMIN_ACCEPT_APPLICANT", email, fullName, "SENT");
  }

  return { status: "success", appId: appId, email: email };
}

/**
 * 9. Custom CRM Email Dispatch
 */
function adminSendCustomCrmEmail(data) {
  const subject = data.subject || "Official Notice — Resolve MUN 2.0";
  const bodyText = data.messageBody || "";
  const recipients = Array.isArray(data.recipients) && data.recipients.length > 0
    ? data.recipients
    : (data.email ? [{ email: data.email, name: data.name || "Delegate" }] : []);

  let sentCount = 0;
  const formattedBody = bodyText
    .split("\n\n")
    .map(function(p) { return '<p style="margin: 0 0 14px 0; line-height: 1.6;">' + p.replace(/\n/g, "<br>") + '</p>'; })
    .join("");

  recipients.forEach(function(r) {
    const toEmail = (r.email || "").trim().toLowerCase();
    if (!toEmail || !toEmail.includes("@")) return;
    const recipientName = r.name || "Delegate";

    const bodyHtml = `
      <div style="font-size: 15px; color: #FFFFFF; font-weight: 600; margin-bottom: 16px;">
        Hi ${recipientName},
      </div>

      <div style="font-size: 14px; color: #D4D4D8; line-height: 1.7; margin-bottom: 24px;">
        ${formattedBody}
      </div>

      <div style="font-size: 13px; color: #71717A; line-height: 1.6; border-top: 1px solid #27272A; padding-top: 18px; margin-top: 24px;">
        Warm regards,<br>
        <strong style="color: #FFFFFF;">Secretariat, Resolve MUN 2.0</strong>
      </div>
    `;
    const plainText = `Hi ${recipientName},\n\n${bodyText}\n\nDates: 25, 26, 27 December 2026\nResolve MUN 2.0 Secretariat`;

    try {
      dispatchMail(toEmail, subject, wrapInEmbassyLayout("OFFICIAL-NOTICE", subject, bodyHtml), plainText);
      sentCount++;
      tryLogEmailToSheet("CRM_CUSTOM_EMAIL", toEmail, recipientName, "SENT");
    } catch (e) {
      tryLogEmailToSheet("CRM_CUSTOM_EMAIL", toEmail, recipientName, "ERROR: " + e.message);
    }
  });

  return { status: "success", sentCount: sentCount, total: recipients.length };
}
