/**
 * ==========================================================================
 * RESOLVE MUN 2.0 — ENTERPRISE SELF-HEALING BACKEND ENGINE
 * Version: 2.5.0
 * Features:
 *   - Google Drive multi-folder routing for screenshots & CVs
 *   - Automated HTML allocation emails upon committee & country assignment
 *   - Dynamic site settings (Round Name, Delegate Price, Registrations Toggle)
 *   - Abandoned leads tracking ("started form but never submitted")
 *   - ReCAPTCHA v2/v3 server verification
 *   - Rate limiting via CacheService & LockService concurrency control
 * ==========================================================================
 */

const CONFIG = {
  RECAPTCHA_SECRET_KEY: PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET_KEY') || '6LesB7gtAAAAAL5lax4c0NxE6GWWanZrcgjkwISQ',
  ADMIN_KEY: PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || 'ResolveMUNAdmin2026@Secure',
  MAX_REQUESTS_PER_MINUTE: 25,
  ENABLE_RECAPTCHA_VERIFY: true,
  VERSION: '2.5.0',
  FOLDERS: {
    DELEGATE_PAYMENTS: 'Resolve_MUN_Delegate_Payments',
    DELEGATION_PAYMENTS: 'Resolve_MUN_Delegation_Payments',
    EB_CVS: 'Resolve_MUN_EB_CVs',
    OC_CVS: 'Resolve_MUN_OC_CVs',
    SEC_CVS: 'Resolve_MUN_Secretariat_CVs'
  }
};

// SCHEMAS FOR ALL SELF-PROVISIONING SHEETS
const SCHEMAS = {
  'Users': [
    'Timestamp', 'UID', 'DisplayName', 'Email', 'PhotoURL', 'Role', 'Status', 'LastLogin'
  ],
  'Registrations': [
    'Timestamp', 'RegID', 'UID', 'FullName', 'Email', 'Phone', 'Institution', 
    'CommitteePref1', 'CommitteePref2', 'CommitteePref3', 'Experience', 'PaymentUTR', 
    'PaymentScreenshotURL', 'Status', 'AllocatedCommittee', 'AllocatedCountry', 
    'DelegationCode', 'AllotmentEmailSent'
  ],
  'Delegations': [
    'Timestamp', 'DelID', 'DelegationCode', 'DelegationName', 'HeadName', 'HeadEmail', 
    'HeadPhone', 'MemberCount', 'PaymentUTR', 'PaymentScreenshotURL', 'Status', 'Notes'
  ],
  'EB_Applications': [
    'Timestamp', 'AppID', 'UID', 'FullName', 'Email', 'Phone', 'PrefCommittee1', 
    'PrefCommittee2', 'MUNExperience', 'ExecutiveSummary', 'CV_URL', 'Status'
  ],
  'OC_Applications': [
    'Timestamp', 'AppID', 'UID', 'FullName', 'Email', 'Phone', 'Department1', 
    'Department2', 'StatementOfPurpose', 'CV_URL', 'Status'
  ],
  'Secretariat_Applications': [
    'Timestamp', 'AppID', 'UID', 'FullName', 'Email', 'Phone', 'Portfolio1', 
    'Portfolio2', 'StatementOfPurpose', 'CV_URL', 'Status'
  ],
  'Waitlist': [
    'Timestamp', 'WaitlistID', 'FullName', 'Email', 'Phone', 'Status', 'PriorityScore'
  ],
  'Abandoned_Leads': [
    'Timestamp', 'LeadID', 'FullName', 'Email', 'Phone', 'FormType', 'LastStep', 'Status'
  ],
  'Site_Settings': [
    'SettingKey', 'SettingValue', 'LastUpdated', 'UpdatedBy'
  ],
  'Attendance_Logs': [
    'Timestamp', 'DelegateID', 'Day', 'VerifiedBy', 'SecurityHash', 'Status'
  ],
  'Audit_Logs': [
    'Timestamp', 'Action', 'ActorEmail', 'Status', 'Details'
  ]
};

/**
 * HTTP GET Handler
 */
function doGet(e) {
  try {
    repairAndInitDatabase();
    const action = e.parameter ? e.parameter.action : 'HEALTH_CHECK';

    if (action === 'HEALTH_CHECK') {
      return jsonResponse({
        status: 'success',
        system: 'Resolve MUN 2.0 Enterprise Engine',
        version: CONFIG.VERSION,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'GET_SETTINGS') {
      return jsonResponse(getSiteSettings());
    }

    if (action === 'GET_DELEGATE' || action === 'GET_DELEGATE_DATA') {
      const email = e.parameter.email;
      if (!email) return errorResponse('Email required', 400);
      return jsonResponse(getDelegateByEmail(email));
    }

    if (action === 'ADMIN_GET_ALL' || action === 'GET_ADMIN_DATA') {
      if (e.parameter.adminKey !== CONFIG.ADMIN_KEY) return errorResponse('Unauthorized', 401);
      return jsonResponse(adminGetAllRecords());
    }

    if (action === 'ADMIN_GET_LEADS') {
      if (e.parameter.adminKey !== CONFIG.ADMIN_KEY) return errorResponse('Unauthorized', 401);
      return jsonResponse(adminGetAbandonedLeads());
    }

    return errorResponse('Unknown GET action', 400);
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
    lock.waitLock(25000);
    repairAndInitDatabase();

    if (!e || !e.postData || !e.postData.contents) {
      return errorResponse('Missing POST body', 400);
    }

    let payload = {};
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return errorResponse('Malformed JSON', 400);
    }

    // Normalize action and aliases from frontend
    let action = payload.action || payload.type || 'UNKNOWN';
    if (action === 'DELEGATE_REGISTRATION') action = 'SUBMIT_DELEGATE';
    if (action === 'DELEGATION_APPLICATION') action = 'SUBMIT_DELEGATION';
    if (action === 'EB_APPLICATION') action = 'SUBMIT_EB';
    if (action === 'OC_APPLICATION') action = 'SUBMIT_OC';
    if (action === 'SECRETARIAT_APPLICATION') action = 'SUBMIT_SECRETARIAT';
    if (action === 'WAITLIST_SUBMISSION') action = 'SUBMIT_WAITLIST';

    // Normalize field aliases
    if (!payload.screenshotBase64 && payload.fileBase64) payload.screenshotBase64 = payload.fileBase64;
    if (!payload.cvBase64 && payload.fileBase64) payload.cvBase64 = payload.fileBase64;
    if (!payload.fullName && payload.name) payload.fullName = payload.name;
    if (!payload.fullName && payload.adviserName) payload.fullName = payload.adviserName;
    if (!payload.phone && payload.adviserPhone) payload.phone = payload.adviserPhone;
    if (!payload.email && payload.adviserEmail) payload.email = payload.adviserEmail;
    if (!payload.institution && payload.instName) payload.institution = payload.instName;
    if (!payload.recaptchaToken && payload.recaptcha_token) payload.recaptchaToken = payload.recaptcha_token;
    const clientKey = payload.email || 'ANONYMOUS';

    // 1. Rate Limiting
    if (!checkRateLimit(clientKey)) {
      logAudit('RATE_LIMIT_EXCEEDED', clientKey, 'BLOCKED', 'Throttled request');
      return errorResponse('Rate limit exceeded. Please wait 60 seconds.', 429);
    }

    // 2. ReCAPTCHA verification for submission endpoints
    const publicSubmits = ['SUBMIT_DELEGATE', 'SUBMIT_DELEGATION', 'SUBMIT_EB', 'SUBMIT_OC', 'SUBMIT_SECRETARIAT', 'SUBMIT_WAITLIST'];
    if (publicSubmits.indexOf(action) !== -1 && CONFIG.ENABLE_RECAPTCHA_VERIFY) {
      if (!verifyRecaptcha(payload.recaptchaToken)) {
        logAudit(action, clientKey, 'SECURITY_BLOCK', 'Failed reCAPTCHA token check');
        return errorResponse('Security verification failed. Please try again.', 403);
      }
    }

    // 3. Indian Phone Number Safeguard (10 digits)
    if (payload.phone) {
      const cleanPhone = String(payload.phone).replace(/[^0-9]/g, '');
      const tenDigitPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
      if (!/^[6-9]\d{9}$/.test(tenDigitPhone)) {
        return errorResponse('Invalid Indian phone number. Must be a valid 10-digit number starting with 6, 7, 8, or 9.', 400);
      }
      payload.validatedPhone = '+91 ' + tenDigitPhone;
    }

    // 4. Action Routing
    let result = {};
    switch (action) {
      case 'AUTH_SYNC':
        result = syncUserAccount(payload);
        break;

      case 'SAVE_DRAFT_LEAD':
        result = recordAbandonedLead(payload);
        break;

      case 'SUBMIT_DELEGATE':
        result = registerDelegateWithDrive(payload);
        break;

      case 'SUBMIT_DELEGATION':
        result = registerDelegationWithDrive(payload);
        break;

      case 'SUBMIT_EB':
        result = applyEBWithDrive(payload);
        break;

      case 'SUBMIT_OC':
        result = applyOCWithDrive(payload);
        break;

      case 'SUBMIT_SECRETARIAT':
        result = applySecretariatWithDrive(payload);
        break;

      case 'ADMIN_UPDATE_DELEGATION':
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse('Unauthorized', 401);
        result = adminUpdateDelegation(payload);
        break;

      case 'ADMIN_ADD_DELEGATE':
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse('Unauthorized', 401);
        result = adminAddDelegate(payload);
        break;

      case 'SUBMIT_WAITLIST':
        result = registerWaitlist(payload);
        break;

      case 'CHECK_IN_QR':
        result = recordCheckIn(payload);
        break;

      case 'ADMIN_CONFIRM_ALLOTMENT':
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse('Unauthorized', 401);
        result = allotCommitteeAndSendEmail(payload);
        break;

      case 'ADMIN_UPDATE_SETTINGS':
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse('Unauthorized', 401);
        result = updateSiteSettings(payload);
        break;

      case 'ADMIN_DELETE_RECORD':
        if (payload.adminKey !== CONFIG.ADMIN_KEY) return errorResponse('Unauthorized', 401);
        result = adminDeleteRecord(payload);
        break;

      default:
        return errorResponse('Unsupported action: ' + action, 400);
    }

    logAudit(action, clientKey, 'SUCCESS', 'Executed ' + action);
    return jsonResponse(result);

  } catch (err) {
    logAudit('ERROR', 'SYSTEM', 'FAILED', err.message);
    return errorResponse('Engine Error: ' + err.message, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Google Drive Multi-Folder Storage Utility
 * Checks root Drive for the target folder, creates it if absent,
 * decodes base64 file, sets public view permissions, and returns URL.
 */
function saveFileToDriveFolder(base64Data, fileName, mimeType, folderName) {
  if (!base64Data) return '';
  try {
    // Strip data URI prefix if present (e.g. data:image/png;base64,...)
    let cleanBase64 = base64Data;
    if (base64Data.indexOf('base64,') !== -1) {
      cleanBase64 = base64Data.split('base64,')[1];
    }

    const folders = DriveApp.getFoldersByName(folderName);
    let targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(folderName);
    }

    const decodedBytes = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decodedBytes, mimeType || 'application/octet-stream', fileName);
    const file = targetFolder.createFile(blob);
    
    // Set file accessible via link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (err) {
    logAudit('DRIVE_UPLOAD_ERROR', 'SYSTEM', 'FAILED', err.message);
    return 'Upload failed: ' + err.message;
  }
}

/**
 * Register Delegate with Payment Screenshot in Drive
 */
function registerDelegateWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registrations');
  const regId = 'RES-DEL-' + Math.floor(100000 + Math.random() * 900000);

  // Upload screenshot to Resolve_MUN_Delegate_Payments folder
  let screenshotUrl = '';
  if (data.paymentScreenshotBase64) {
    screenshotUrl = saveFileToDriveFolder(
      data.paymentScreenshotBase64,
      regId + '_PaymentReceipt.png',
      data.paymentScreenshotMime || 'image/png',
      CONFIG.FOLDERS.DELEGATE_PAYMENTS
    );
  }

  sheet.appendRow([
    new Date().toISOString(),
    regId,
    data.uid || '',
    data.fullName || '',
    data.email || '',
    data.validatedPhone || data.phone || '',
    data.institution || '',
    data.pref1 || '',
    data.pref2 || '',
    data.pref3 || '',
    data.experience || '',
    data.paymentUTR || '',
    screenshotUrl,
    'Pending_Verification',
    '', // Allocated Committee
    '', // Allocated Country
    data.delegationCode || 'INDIVIDUAL',
    'No' // AllotmentEmailSent
  ]);

  return { 
    status: 'success', 
    message: 'Registration submitted successfully!', 
    regId: regId, 
    screenshotUrl: screenshotUrl 
  };
}

/**
 * Register Delegation with Group Screenshot in Drive
 */
function registerDelegationWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Delegations');
  const delId = 'RES-GRP-' + Math.floor(100000 + Math.random() * 900000);
  const delegationCode = 'DEL-' + (data.delegationName ? data.delegationName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) : 'GROUP') + '-' + Math.floor(100 + Math.random() * 900);

  let screenshotUrl = '';
  if (data.paymentScreenshotBase64) {
    screenshotUrl = saveFileToDriveFolder(
      data.paymentScreenshotBase64,
      delId + '_GroupReceipt.png',
      data.paymentScreenshotMime || 'image/png',
      CONFIG.FOLDERS.DELEGATION_PAYMENTS
    );
  }

  sheet.appendRow([
    new Date().toISOString(),
    delId,
    delegationCode,
    data.delegationName || 'Unnamed Delegation',
    data.headName || '',
    data.headEmail || '',
    data.validatedPhone || data.headPhone || '',
    data.delegationSize || 8,
    data.paymentUTR || '',
    screenshotUrl,
    'Pending_Verification',
    data.notes || ''
  ]);

  return {
    status: 'success',
    message: 'Delegation registered successfully!',
    delId: delId,
    delegationCode: delegationCode,
    inviteLink: 'https://resolvemun.in/?delegation=' + delegationCode
  };
}

/**
 * Apply EB with CV in Drive
 */
function applyEBWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('EB_Applications');
  const appId = 'RES-EB-' + Math.floor(100000 + Math.random() * 900000);

  let cvUrl = '';
  if (data.cvBase64) {
    cvUrl = saveFileToDriveFolder(
      data.cvBase64,
      appId + '_CV.pdf',
      data.cvMime || 'application/pdf',
      CONFIG.FOLDERS.EB_CVS
    );
  }

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || '',
    data.fullName || '',
    data.email || '',
    data.validatedPhone || data.phone || '',
    data.pref1 || '',
    data.pref2 || '',
    data.experience || '',
    data.executiveSummary || '',
    cvUrl,
    'Under_Review'
  ]);

  return { status: 'success', message: 'Executive Board application submitted!', appId: appId, cvUrl: cvUrl };
}

/**
 * Apply OC with CV in Drive
 */
function applyOCWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('OC_Applications');
  const appId = 'RES-OC-' + Math.floor(100000 + Math.random() * 900000);

  let cvUrl = '';
  if (data.cvBase64) {
    cvUrl = saveFileToDriveFolder(
      data.cvBase64,
      appId + '_CV.pdf',
      data.cvMime || 'application/pdf',
      CONFIG.FOLDERS.OC_CVS
    );
  }

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || '',
    data.fullName || '',
    data.email || '',
    data.validatedPhone || data.phone || '',
    data.dept1 || '',
    data.dept2 || '',
    data.sop || '',
    cvUrl,
    'Under_Review'
  ]);

  return { status: 'success', message: 'Organizing Committee application submitted!', appId: appId, cvUrl: cvUrl };
}


/**
 * Apply Secretariat with CV in Drive
 */
function applySecretariatWithDrive(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Secretariat_Applications');
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName('Secretariat_Applications');
  }
  const appId = 'RES-SEC-' + Math.floor(100000 + Math.random() * 900000);

  let cvUrl = '';
  if (data.cvBase64) {
    cvUrl = saveFileToDriveFolder(
      data.cvBase64,
      appId + '_CV.pdf',
      data.cvMime || 'application/pdf',
      CONFIG.FOLDERS.SEC_CVS
    );
  }

  sheet.appendRow([
    new Date().toISOString(),
    appId,
    data.uid || '',
    data.fullName || '',
    data.email || '',
    data.validatedPhone || data.phone || '',
    data.portfolio1 || data.dept1 || '',
    data.portfolio2 || data.dept2 || '',
    data.sop || data.statementOfPurpose || '',
    cvUrl,
    'Under_Review'
  ]);

  return { status: 'success', message: 'Secretariat application submitted successfully!', appId: appId, cvUrl: cvUrl };
}

/**
 * Super Admin: Update Delegation Assignment or Delegation Record
 */
function adminUpdateDelegation(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = ss.getSheetByName('Registrations');
  const targetRegId = data.regId;
  const newDelegation = data.delegationCode || '';

  if (targetRegId) {
    const rows = regSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][1]) === String(targetRegId)) {
        regSheet.getRange(i + 1, 17).setValue(newDelegation); // Col 17 is DelegationCode
        return { status: 'success', message: 'Delegation updated for ' + targetRegId, delegationCode: newDelegation };
      }
    }
  }
  return errorResponse('Delegate not found for delegation update', 404);
}

/**
 * Super Admin: Manually Add Delegate
 */
function adminAddDelegate(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registrations');
  const regId = 'RES-' + Math.floor(100000 + Math.random() * 900000);

  sheet.appendRow([
    new Date().toISOString(),
    regId,
    data.uid || 'ADMIN_ENTRY',
    data.fullName || 'Delegate',
    data.email || '',
    data.validatedPhone || data.phone || '',
    data.institution || '',
    data.pref1 || 'UNSC',
    data.pref2 || 'UNGA',
    data.pref3 || 'UNHRC',
    data.experience || 'Admin Added',
    data.utr || 'ADMIN_OVERRIDE',
    data.screenshotUrl || '',
    data.status || 'Confirmed',
    data.allocatedCommittee || '',
    data.allocatedCountry || '',
    data.delegationCode || '',
    'NO'
  ]);

  return { status: 'success', message: 'Delegate added successfully', regId: regId };
}

/**
 * Track Abandoned Leads ("Started but never submitted")
 */
function recordAbandonedLead(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Abandoned_Leads');
  const email = data.email || '';
  if (!email) return { status: 'ignored' };

  // Check if lead already exists
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][3] === email) {
      sheet.getRange(i + 1, 1).setValue(new Date().toISOString());
      sheet.getRange(i + 1, 7).setValue(data.step || 'Step 1');
      return { status: 'updated' };
    }
  }

  const leadId = 'LEAD-' + Math.floor(10000 + Math.random() * 90000);
  sheet.appendRow([
    new Date().toISOString(),
    leadId,
    data.fullName || 'Prospect',
    email,
    data.validatedPhone || data.phone || '',
    data.formType || 'Delegate_Form',
    data.step || 'Step 1',
    'Incomplete'
  ]);

  return { status: 'recorded', leadId: leadId };
}

/**
 * Allot Committee & Country + Send Automated Beautiful Allocation Email
 */

/**
 * Lookup Delegate Record by Email
 */
function getDelegateByEmail(email) {
  if (!email) return { found: false, message: 'Email required' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Registrations');
  if (!sheet) return { found: false, message: 'Registrations sheet not initialized' };

  const targetEmail = String(email).trim().toLowerCase();
  const rows = sheet.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    const rowEmail = String(rows[i][4]).trim().toLowerCase();
    if (rowEmail === targetEmail) {
      return {
        found: true,
        regId: rows[i][1],
        fullName: rows[i][3],
        email: rows[i][4],
        phone: rows[i][5],
        institution: rows[i][6],
        pref1: rows[i][7],
        pref2: rows[i][8],
        pref3: rows[i][9],
        experience: rows[i][10],
        paymentUTR: rows[i][11],
        screenshotUrl: rows[i][12],
        status: rows[i][13] || 'Confirmed',
        allocatedCommittee: rows[i][14] || '',
        allocatedCountry: rows[i][15] || '',
        delegationCode: rows[i][16] || '',
        timestamp: rows[i][0]
      };
    }
  }
  return { found: false, message: 'No registration found for ' + email };
}

function allotCommitteeAndSendEmail(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regSheet = ss.getSheetByName('Registrations');
  const rows = regSheet.getDataRange().getValues();
  const regId = data.regId;
  const committee = data.committee;
  const country = data.country;
  const sendEmail = data.sendEmail !== false;

  let delegateName = '';
  let delegateEmail = '';
  let rowIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === regId) {
      rowIndex = i + 1;
      delegateName = rows[i][3];
      delegateEmail = rows[i][4];
      break;
    }
  }

  if (rowIndex === -1) return errorResponse('Delegate ID not found', 404);

  // Update status, committee, country, email sent flag
  regSheet.getRange(rowIndex, 14).setValue('Confirmed_Allotted');
  regSheet.getRange(rowIndex, 15).setValue(committee);
  regSheet.getRange(rowIndex, 16).setValue(country);
  regSheet.getRange(rowIndex, 18).setValue('Yes');

  // Send automated HTML allocation email
  if (sendEmail && delegateEmail) {
    try {
      const emailSubject = 'Official Committee Allotment | Resolve MUN 2.0';
      const emailBodyHtml = createAllocationEmailHtml(delegateName, regId, committee, country);
      MailApp.sendEmail({
        to: delegateEmail,
        subject: emailSubject,
        htmlBody: emailBodyHtml,
        name: 'Resolve MUN 2.0 Secretariat'
      });
      logAudit('EMAIL_DISPATCH', delegateEmail, 'SENT', 'Sent allotment email for ' + regId);
    } catch (e) {
      logAudit('EMAIL_DISPATCH_FAIL', delegateEmail, 'FAILED', e.message);
    }
  }

  return {
    status: 'success',
    message: 'Allotment saved and allocation email dispatched to ' + delegateEmail,
    regId: regId,
    committee: committee,
    country: country
  };
}

/**
 * Responsive HTML Email Template for Allocation
 */
function createAllocationEmailHtml(name, regId, committee, country) {
  return '<!DOCTYPE html>' +
  '<html>' +
  '<head><meta charset="utf-8"/><style>' +
  'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #050714; color: #ffffff; margin: 0; padding: 20px; }' +
  '.card { max-width: 580px; margin: 0 auto; background: #080b20; border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 40px 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }' +
  '.header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 24px; margin-bottom: 28px; }' +
  '.logo-text { font-size: 26px; font-weight: 900; letter-spacing: 2px; color: #ffffff; margin: 0; }' +
  '.badge { display: inline-block; padding: 4px 14px; border-radius: 999px; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.4); color: #93c5fd; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }' +
  '.content { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.8); }' +
  '.highlight-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 20px; margin: 24px 0; }' +
  '.row { display: flex; justify-content: space-between; margin-bottom: 10px; }' +
  '.label { font-size: 12px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 600; }' +
  '.value { font-size: 14px; font-weight: 700; color: #ffffff; }' +
  '.btn { display: block; text-align: center; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding: 14px 24px; border-radius: 999px; margin-top: 28px; }' +
  '.footer { text-align: center; font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; }' +
  '</style></head>' +
  '<body>' +
    '<div class="card">' +
      '<div class="header">' +
        '<h1 class="logo-text">RESOLVE MUN 2.0</h1>' +
        '<span class="badge">Official Committee Allotment</span>' +
      '</div>' +
      '<div class="content">' +
        '<p>Dear <strong>' + (name || 'Delegate') + '</strong>,</p>' +
        '<p>On behalf of the Secretariat, we are honored to confirm your official allocation for <strong>Resolve MUN 2.0</strong>. Your diplomatic prowess will shape the debates of our upcoming conference.</p>' +
        '<div class="highlight-box">' +
          '<div class="row"><span class="label">Delegate ID</span><span class="value">' + regId + '</span></div>' +
          '<div class="row"><span class="label">Allocated Committee</span><span class="value" style="color: #60a5fa;">' + committee + '</span></div>' +
          '<div class="row"><span class="label">Country / Portfolio</span><span class="value" style="color: #c084fc;">' + country + '</span></div>' +
          '<div class="row"><span class="label">Conference Venue</span><span class="value">Hyderabad, India</span></div>' +
        '</div>' +
        '<p>Please visit your <strong>Delegate Dashboard</strong> to review the background study guide, study the rules of procedure, and access your digital QR check-in pass.</p>' +
        '<a href="https://resolvemun.in/dashboard" class="btn">ACCESS DELEGATE DASHBOARD</a>' +
      '</div>' +
      '<div class="footer">' +
        '<p>Resolve MUN 2.0 • Resolve · Reform · Reconcile • Hyderabad</p>' +
        '<p>For queries, contact secretariat@resolvemun.in or @mun.resolve</p>' +
      '</div>' +
    '</div>' +
  '</body>' +
  '</html>';
}

/**
 * Dynamic Site Settings Read/Write
 */
function getSiteSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Site_Settings');
  if (!sheet) return defaultSettings();

  const rows = sheet.getDataRange().getValues();
  const settings = defaultSettings();
  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    const val = rows[i][1];
    if (key) settings[key] = val;
  }
  return settings;
}

function defaultSettings() {
  return {
    roundName: 'Early Bird Applications',
    delegateFee: 2199,
    delegationFee: 1899,
    registrationsOpen: true,
    ebApplicationsOpen: true
  };
}

function updateSiteSettings(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Site_Settings');
  
  // Clear and rewrite settings
  sheet.clearContents();
  sheet.appendRow(SCHEMAS['Site_Settings']);

  const keys = ['roundName', 'delegateFee', 'delegationFee', 'registrationsOpen', 'ebApplicationsOpen'];
  keys.forEach(k => {
    if (payload[k] !== undefined) {
      sheet.appendRow([k, payload[k], new Date().toISOString(), payload.adminKey ? 'Admin' : 'System']);
    }
  });

  return { status: 'success', message: 'Settings updated successfully', settings: getSiteSettings() };
}

/**
 * Get Abandoned Leads for Admin
 */
function adminGetAbandonedLeads() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Abandoned_Leads');
  const rows = sheet.getDataRange().getValues();
  return {
    status: 'success',
    leads: rows.slice(1).map(r => ({
      timestamp: r[0],
      leadId: r[1],
      name: r[2],
      email: r[3],
      phone: r[4],
      formType: r[5],
      lastStep: r[6]
    }))
  };
}

/**
 * Admin Get All Records (enhanced with screenshots & delegation grouping)
 */
function adminGetAllRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const regs = ss.getSheetByName('Registrations').getDataRange().getValues();
  const dels = ss.getSheetByName('Delegations').getDataRange().getValues();
  const waitlist = ss.getSheetByName('Waitlist').getDataRange().getValues();
  const eb = ss.getSheetByName('EB_Applications').getDataRange().getValues();
  const oc = ss.getSheetByName('OC_Applications').getDataRange().getValues();

  return {
    status: 'success',
    totalRegistrations: Math.max(0, regs.length - 1),
    totalDelegations: Math.max(0, dels.length - 1),
    totalWaitlist: Math.max(0, waitlist.length - 1),
    totalEB: Math.max(0, eb.length - 1),
    totalOC: Math.max(0, oc.length - 1),
    registrations: regs.slice(1).map(r => ({
      regId: r[1],
      name: r[3],
      email: r[4],
      phone: r[5],
      institution: r[6],
      pref1: r[7],
      pref2: r[8],
      pref3: r[9],
      paymentUTR: r[11],
      screenshotUrl: r[12],
      status: r[13],
      committee: r[14] || 'Pending',
      country: r[15] || 'Pending',
      delegationCode: r[16] || 'INDIVIDUAL',
      emailSent: r[17] || 'No'
    })),
    delegations: dels.slice(1).map(d => ({
      delId: d[1],
      delegationCode: d[2],
      name: d[3],
      headName: d[4],
      headEmail: d[5],
      headPhone: d[6],
      size: d[7],
      paymentUTR: d[8],
      screenshotUrl: d[9],
      status: d[10]
    })),
    ebApplicants: eb.slice(1).map(e => ({
      appId: e[1],
      name: e[3],
      email: e[4],
      phone: e[5],
      pref1: e[6],
      pref2: e[7],
      cvUrl: e[10],
      status: e[11]
    })),
    secretariatApplicants: (ss.getSheetByName('Secretariat_Applications') ? ss.getSheetByName('Secretariat_Applications').getDataRange().getValues().slice(1).map(s => ({
      appId: s[1],
      name: s[3],
      email: s[4],
      phone: s[5],
      portfolio1: s[6],
      portfolio2: s[7],
      cvUrl: s[9],
      status: s[10]
    })) : []),
    abandonedLeads: (ss.getSheetByName('Abandoned_Leads') ? ss.getSheetByName('Abandoned_Leads').getDataRange().getValues().slice(1).map(l => ({
      timestamp: l[0],
      leadId: l[1],
      name: l[2],
      email: l[3],
      phone: l[4],
      formType: l[5],
      step: l[6],
      status: l[7]
    })) : [])
  };
}

/**
 * Delete Record
 */
function adminDeleteRecord(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = data.sheetName || 'Registrations';
  const sheet = ss.getSheetByName(sheetName);
  const idCol = data.idCol || 1; // 1-based column index
  const targetId = data.id;

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idCol]) === String(targetId)) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Record ' + targetId + ' deleted from ' + sheetName };
    }
  }
  return errorResponse('Record not found', 404);
}

/**
 * Self-Healing Database Provisioner
 */

/**
 * Sync User Account on Auth
 */
function syncUserAccount(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Users');
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName('Users');
  }
  const uid = data.uid || '';
  const email = (data.email || '').toLowerCase().trim();
  if (!uid && !email) return { status: 'ignored' };

  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(uid) || String(rows[i][3]).toLowerCase() === email) {
      sheet.getRange(i + 1, 8).setValue(new Date().toISOString()); // LastLogin
      return { status: 'synced', uid: uid };
    }
  }

  sheet.appendRow([
    new Date().toISOString(),
    uid,
    data.displayName || 'Delegate',
    email,
    data.photoURL || '',
    data.role || 'Delegate',
    'Active',
    new Date().toISOString()
  ]);

  return { status: 'registered', uid: uid };
}

/**
 * Register to Priority Waitlist
 */
function registerWaitlist(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Waitlist');
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName('Waitlist');
  }
  const waitlistId = 'WAIT-' + Math.floor(10000 + Math.random() * 90000);

  sheet.appendRow([
    new Date().toISOString(),
    waitlistId,
    data.fullName || data.name || '',
    data.email || '',
    data.validatedPhone || data.phone || '',
    'Pending',
    data.priorityScore || 50
  ]);

  return { status: 'success', message: 'Added to priority waitlist', waitlistId: waitlistId };
}

/**
 * Record On-Desk QR Check-In
 */
function recordCheckIn(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Attendance_Logs');
  if (!sheet) {
    repairAndInitDatabase();
    sheet = ss.getSheetByName('Attendance_Logs');
  }
  const delegateId = data.delegateId || data.regId || '';
  const actionType = data.actionType || data.type || 'ENTRY';
  const timestamp = data.timestamp || new Date().toISOString();

  sheet.appendRow([
    timestamp,
    delegateId,
    actionType,
    data.verifiedBy || 'Secretariat Scanner Desk',
    Utilities.base64Encode(delegateId + '_' + actionType + '_' + new Date().getTime()),
    actionType === 'EXIT' ? 'Checked_Out' : 'Checked_In'
  ]);

  return { 
    status: 'success', 
    message: 'Attendance recorded: ' + actionType + ' for ' + delegateId, 
    actionType: actionType, 
    timestamp: timestamp 
  };
}

function repairAndInitDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const sheetName in SCHEMAS) {
    let sheet = ss.getSheetByName(sheetName);
    const headers = SCHEMAS[sheetName];

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#06091a');
      headerRange.setFontColor('#60a5fa');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#06091a');
      headerRange.setFontColor('#60a5fa');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
}

/**
 * ReCAPTCHA Verification
 */
function verifyRecaptcha(token) {
  if (!token) return false;
  try {
    const resp = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: CONFIG.RECAPTCHA_SECRET_KEY, response: token },
      muteHttpExceptions: true
    });
    const res = JSON.parse(resp.getContentText());
    return res.success === true;
  } catch (e) {
    return false;
  }
}

/**
 * Token-bucket rate limiter via CacheService
 */
function checkRateLimit(key) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'rl_' + Utilities.base64Encode(key).slice(0, 32);
  const currentCount = cache.get(cacheKey);

  if (!currentCount) {
    cache.put(cacheKey, '1', 60);
    return true;
  }

  const count = parseInt(currentCount, 10);
  if (count >= CONFIG.MAX_REQUESTS_PER_MINUTE) return false;
  cache.put(cacheKey, String(count + 1), 60);
  return true;
}

/**
 * Utilities
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg, code) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', code: code || 400, message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function logAudit(action, actor, status, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Audit_Logs');
    if (sheet) sheet.appendRow([new Date().toISOString(), action, actor, status, details]);
  } catch (e) {}
}
