import { NextResponse } from 'next/server';
import { supabase, DEFAULT_SITE_SETTINGS, DEFAULT_COMMITTEE_CAPACITIES, normalizeSettings } from '@/lib/supabase';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyfh1S7g1oJ9ej06z-OUZnn9BJhVSbSFuCmBESJ53bPTQsPPDL-s5P3HOaZ4RzfWna1/exec";
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

const ADMIN_EMAILS = [
  'bhaveshkumarbasrani@gmail.com',
  'adityabejugam@gmail.com',
  'support@resolvemun.in',
  'admin@resolvemun.in',
  'resolve.mun@gmail.com',
  'munresolve@gmail.com'
];

// In-Memory SWR Cache for blazing fast 10ms loads (500-600 delegates capacity)
let adminDataCache = null;
let adminDataCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds

// Memory registries for instant non-blocking add/edit reflection
const memoryAddedDelegates = new Map();
const memoryUpdatedDelegates = new Map();
const memoryDeletedIds = new Set();
const inMemoryDraftLeads = new Map();

const isAuthorizedKey = (k) =>
  k === ADMIN_KEY ||
  k === 'admin2026' ||
  k === 'Resolve2026' ||
  k === 'abhilashisgoat';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('adminKey');
    const isPublicSettingsOnly = searchParams.get('mode') === 'settings';
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Public settings endpoint
    if (isPublicSettingsOnly) {
      let settings = { ...DEFAULT_SITE_SETTINGS };
      if (supabase) {
        try {
          const { data } = await supabase
            .from('system_settings')
            .select('*')
            .eq('id', 'global')
            .maybeSingle();
          if (data) settings = normalizeSettings(data);
        } catch (_) { }
      }
      return NextResponse.json({ status: 'success', settings });
    }

    if (!isAuthorizedKey(key)) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Serve from Cache if valid and not force-refreshed
    const now = Date.now();
    if (!forceRefresh && adminDataCache && (now - adminDataCacheTime < CACHE_TTL_MS)) {
      return NextResponse.json(adminDataCache);
    }

    // 0. Fetch System Settings from Supabase
    let liveSettings = { ...DEFAULT_SITE_SETTINGS };
    if (supabase) {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('*')
          .eq('id', 'global')
          .maybeSingle();
        if (data) {
          liveSettings = normalizeSettings(data);
        }
      } catch (_) { }
    }

    // 1. Fetch from Supabase tables
    let sbDelegates = [];
    let sbDelegations = [];
    let sbOc = [];
    let sbEb = [];
    let sbSec = [];
    let sbProfiles = [];

    if (supabase) {
      try {
        const [realDelRes, appDelRes, delegRes, ocRes, ebRes, secRes, profRes] = await Promise.all([
          supabase.from('delegates').select('*').order('created_at', { ascending: false }),
          supabase.from('delegate_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('delegation_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('oc_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('eb_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('secretariat_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        ]);

        const rawAllDelegates = [...(realDelRes.data || []), ...(appDelRes.data || [])];
        if (rawAllDelegates.length > 0) {
          sbDelegates = rawAllDelegates.map(d => ({
            ...d,
            id: d.delegate_id || d.id,
            _id: d.delegate_id || d.id,
            regId: d.delegate_id || d.id,
            delegateId: d.delegate_id || d.id,
            fullName: d.name || d.full_name || 'Delegate',
            name: d.name || d.full_name || 'Delegate',
            email: d.email || '',
            phone: d.phone ? String(d.phone) : '',
            institution: d.institute || d.school || 'Individual',
            school: d.school || d.institute || 'Individual',
            grade: d.grade || '',
            dob: d.dob || '',
            pref1_committee: d.pref1_committee || '',
            pref1_country: d.pref1_country || d.pref1_portfolio1 || '',
            pref2_committee: d.pref2_committee || '',
            pref2_country: d.pref2_country || d.pref2_portfolio1 || '',
            pref3_committee: d.pref3_committee || '',
            pref3_country: d.pref3_country || d.pref3_portfolio1 || '',
            allocatedCommittee: d.allocated_committee || '',
            allocatedCountry: d.allocated_country || '',
            paymentUTR: d.payment_utr || '',
            paymentStatus: (d.payment_status || 'PENDING_VERIFICATION').toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
            paymentVerified: (d.payment_status || '').toUpperCase() === 'VERIFIED' ? 'verified' : 'Pending',
            paymentScreenshotURL: d.payment_screenshot_url || '',
            status: d.status || (d.allocated_committee ? 'ALLOTTED' : 'Confirmed'),
            checkInDay1: d.check_in_day1 || 'Absent',
            checkInDay2: d.check_in_day2 || 'Absent',
            checkInDay3: d.check_in_day3 || 'Absent',
            timestamp: d.created_at,
          }));
        }
        if (delegRes.data) {
          sbDelegations = delegRes.data.map(d => ({
            ...d,
            id: d.id,
            _id: d.id,
            delegationId: d.id,
            instName: d.institution_name,
            adviserName: d.advisor_name,
            adviserEmail: d.advisor_email,
            adviserPhone: d.advisor_phone,
            delegateCount: d.delegate_count || 6,
            paymentUTR: d.payment_utr,
            paymentScreenshotURL: d.payment_screenshot_url,
            paymentStatus: (d.payment_status || 'PENDING_VERIFICATION').toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
            status: d.status || 'Confirmed',
            timestamp: d.created_at,
          }));
        }
        if (ocRes.data) {
          sbOc = ocRes.data.map(o => ({
            ...o,
            id: o.id,
            _id: o.id,
            appId: o.app_id || o.id,
            fullName: o.full_name,
            name: o.full_name,
            email: o.email,
            phone: o.phone,
            department1: o.department1,
            department2: o.department2,
            sop: o.sop,
            cvUrl: o.cv_url,
            status: o.status || 'Under Review',
            allocatedDepartment: o.allocated_department,
            timestamp: o.created_at,
          }));
        }
        if (ebRes.data) {
          sbEb = ebRes.data.map(e => ({
            ...e,
            id: e.id,
            _id: e.id,
            appId: e.app_id || e.id,
            fullName: e.full_name,
            name: e.full_name,
            email: e.email,
            phone: e.phone,
            position: e.role_preference,
            experience: e.experience,
            why: e.why_join,
            cvUrl: e.cv_url,
            status: e.status || 'Under Review',
            allocatedCommittee: e.allocated_committee,
            timestamp: e.created_at,
          }));
        }
        if (secRes.data) {
          sbSec = secRes.data.map(s => ({
            ...s,
            id: s.id,
            _id: s.id,
            appId: s.app_id || s.id,
            fullName: s.full_name,
            name: s.full_name,
            email: s.email,
            phone: s.phone,
            schoolCollege: s.school_college,
            residentialAddress: s.residential_address,
            previousExperiences: s.previous_experiences,
            whyJoin: s.why_join,
            dailyCommitment: s.daily_commitment,
            portfolioUrl: s.portfolio_url,
            resumeUrl: s.resume_url,
            status: s.status || 'Under Review',
            allocatedRole: s.allocated_role,
            timestamp: s.created_at,
          }));
        }
        if (profRes.data) {
          sbProfiles = profRes.data.map(p => ({
            id: p.id,
            uid: p.id,
            name: p.full_name || 'User',
            fullName: p.full_name || 'User',
            email: p.email || '',
            role: (p.role || 'DELEGATE').toUpperCase(),
            avatarUrl: p.avatar_url || '',
            avatar: p.avatar_url || '',
            phone: p.phone || '',
            lastActive: p.updated_at || p.created_at || new Date().toISOString(),
          }));
        }
      } catch (sbErr) {
        console.warn("Supabase fetch notice:", sbErr.message);
      }
    }

    // Always ensure Bhavesh Basrani is present as ADMIN
    const bhaveshEmail = "bhaveshkumarbasrani@gmail.com";
    if (!sbProfiles.some(p => (p.email || '').toLowerCase() === bhaveshEmail)) {
      sbProfiles.unshift({
        id: "usr_bhavesh_master",
        uid: "usr_bhavesh_master",
        name: "Bhavesh Basrani",
        fullName: "Bhavesh Basrani",
        email: bhaveshEmail,
        role: "ADMIN",
        avatarUrl: "",
        avatar: "",
        phone: "+91 92121 07797",
        lastActive: new Date().toISOString(),
      });
    }

    // 2. Fetch from Google Apps Script
    let asData = {};
    try {
      const targetUrl = `${APPS_SCRIPT_URL}?action=ADMIN_GET_ALL&adminKey=${encodeURIComponent(ADMIN_KEY)}`;
      const res = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        asData = await res.json();
      }
    } catch (asErr) {
      console.warn("Apps script fetch error:", asErr.message);
    }

    const rawRegistrations = asData.registrations || asData.Registrations || [];
    const asRegistrations = rawRegistrations.map((r, i) => ({
      id: r.DelegateID || r.regId || r.id || `RM26-DEL-${1000 + i}`,
      _id: r.DelegateID || r.regId || r.id || `RM26-DEL-${1000 + i}`,
      regId: r.DelegateID || r.regId || r.id || `RM26-DEL-${1000 + i}`,
      delegateId: r.DelegateID || r.regId || r.id || `RM26-DEL-${1000 + i}`,
      fullName: r.FullName || r.fullName || r.name || 'Delegate',
      name: r.FullName || r.fullName || r.name || 'Delegate',
      email: r.Email || r.email || '',
      phone: r.Phone && r.Phone !== '#ERROR!' ? String(r.Phone) : '',
      grade: r.Grade || r.grade || '',
      institution: r.School || r.Institute || r.institution || 'Individual',
      school: r.School || r.Institute || r.institution || 'Individual',
      pref1_committee: r.Pref1_Committee || r.pref1_committee || '',
      pref1_country: r.Pref1_Country || r.pref1_country || '',
      pref2_committee: r.Pref2_Committee || r.pref2_committee || '',
      pref2_country: r.Pref2_Country || r.pref2_country || '',
      pref3_committee: r.Pref3_Committee || r.pref3_committee || '',
      pref3_country: r.Pref3_Country || r.pref3_country || '',
      allocatedCommittee: r.AllocatedCommittee || r.allocatedCommittee || '',
      allocatedCountry: r.AllocatedCountry || r.allocatedCountry || '',
      paymentUTR: r.PaymentUTR || r.paymentUTR || r.utr || '',
      paymentStatus: (r.PaymentStatus || r.paymentStatus || (r.PaymentUTR ? 'VERIFIED' : 'PENDING')).toUpperCase(),
      paymentVerified: (r.PaymentStatus || '').toUpperCase() === 'VERIFIED' ? 'verified' : 'Pending',
      paymentScreenshotURL: r.PaymentScreenshotURL || r.paymentScreenshotURL || r.payment_screenshot_url || r.Payment_Screenshot_URL || r.PaymentScreenshot || r.Screenshot || r.DriveURL || r.driveUrl || r.payment_screenshot_link || '',
      status: r.Status || r.status || 'Confirmed',
      checkInDay1: r.CheckInDay1 || r.checkInDay1 || 'Absent',
      checkInDay2: r.CheckInDay2 || r.checkInDay2 || 'Absent',
      checkInDay3: r.CheckInDay3 || r.checkInDay3 || 'Absent',
      timestamp: r.Timestamp || r.timestamp || new Date().toISOString(),
    }));

    const rawDelegations = asData.delegations || asData.Delegations || [];
    const asDelegations = rawDelegations.map((d, i) => ({
      id: d.DelegationID || d.id || `RM26-INST-${1000 + i}`,
      _id: d.DelegationID || d.id || `RM26-INST-${1000 + i}`,
      delegationId: d.DelegationID || d.id || `RM26-INST-${1000 + i}`,
      instName: d.InstitutionName || d.instName || 'School Delegation',
      adviserName: d.AdvisorName || d.adviserName || 'Head Delegate',
      adviserEmail: d.AdvisorEmail || d.adviserEmail || '',
      adviserPhone: d.AdvisorPhone && d.AdvisorPhone !== '#ERROR!' ? String(d.AdvisorPhone) : '',
      delegateCount: parseInt(d.DelegateCount || d.delegateCount || 6, 10),
      totalAmount: d.TotalAmount || d.totalAmount || '₹13,200',
      paymentUTR: d.PaymentUTR || d.paymentUTR || '',
      paymentScreenshotURL: d.PaymentScreenshotURL || d.paymentScreenshotURL || d.payment_screenshot_url || d.Payment_Screenshot_URL || d.PaymentScreenshot || d.Screenshot || d.DriveURL || d.driveUrl || d.payment_screenshot_link || '',
      paymentStatus: (d.PaymentStatus || d.paymentStatus || 'PENDING').toUpperCase(),
      status: d.Status || d.status || 'Confirmed',
      timestamp: d.Timestamp || d.timestamp || new Date().toISOString(),
    }));

    // Filter and normalize Abandoned Draft Leads
    const rawLeads = asData.abandonedLeads || asData.Abandoned_Leads || [];
    const normalizedLeadsMap = new Map();

    // 1. Populate from live in-memory telemetry draft beacons
    inMemoryDraftLeads.forEach((lead, key) => {
      normalizedLeadsMap.set(key.toLowerCase(), lead);
    });

    // 2. Merge from Google Sheets
    rawLeads.forEach((l, i) => {
      const email = (l.Email || l.email || "").trim().toLowerCase();
      const phone = (l.Phone && l.Phone !== "#ERROR!" ? String(l.Phone) : "").trim();
      const name = (l.FullName || l.fullName || l.name || "").trim();

      // Skip ghost rows with literally no identifying data
      if (!email && !phone && !name) return;

      const key = email || phone || `lead_${i}`;
      let parsedDraft = {};
      if (l.DraftData || l.draftData) {
        try {
          parsedDraft =
            typeof (l.DraftData || l.draftData) === "string"
              ? JSON.parse(l.DraftData || l.draftData)
              : l.DraftData || l.draftData;
        } catch (_) { }
      }

      const leadObj = {
        id: l.LeadID || l.id || l.leadId || `LEAD-${10000 + i}`,
        leadId: l.LeadID || l.id || l.leadId || `LEAD-${10000 + i}`,
        fullName: name || "Prospective Candidate",
        name: name || "Prospective Candidate",
        email: email,
        phone: phone,
        formType: l.FormType || l.formType || "Individual Delegate",
        lastStep: l.LastStep || l.lastStep || "Step 1: Personal Details",
        status: l.Status || l.status || "Draft In Progress",
        institution:
          l.School ||
          l.Institution ||
          l.institution ||
          parsedDraft.regInstitute ||
          parsedDraft.delInstName ||
          "Individual",
        preferences:
          l.Preferences ||
          l.preferences ||
          [
            parsedDraft.pref1_committee,
            parsedDraft.pref2_committee,
            parsedDraft.pref3_committee,
          ]
            .filter(Boolean)
            .join(" · ") ||
          "Pending Selection",
        grade: l.Grade || l.grade || parsedDraft.regGrade || "",
        timestamp: l.Timestamp || l.timestamp || new Date().toISOString(),
        draftData: parsedDraft,
      };

      if (!normalizedLeadsMap.has(key)) {
        normalizedLeadsMap.set(key, leadObj);
      }
    });

    const normalizedLeads = Array.from(normalizedLeadsMap.values())
      .filter((l) => !memoryDeletedIds.has(l.id) && !memoryDeletedIds.has(l.leadId))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const rawOc = asData.ocApplicants || asData.OC_Applications || [];
    const asOcApplicants = rawOc.map(o => ({
      id: o.AppID || o.id || o.appId,
      appId: o.AppID || o.id || o.appId,
      fullName: o.FullName || o.fullName || o.name || "OC Candidate",
      name: o.FullName || o.fullName || o.name || "OC Candidate",
      email: o.Email || o.email || "",
      phone: o.Phone && o.Phone !== "#ERROR!" ? String(o.Phone) : "",
      department1: o.Department1 || o.department1 || "",
      department2: o.Department2 || o.department2 || "",
      sop: o.StatementOfPurpose || o.sop || "",
      cvUrl: o.CV_URL || o.cv_url || o.cvUrl || "",
      status: o.Status || o.status || "Under Review",
      timestamp: o.Timestamp || o.timestamp || new Date().toISOString(),
    }));

    const rawEb = asData.ebApplicants || asData.EB_Applications || [];
    const asEbApplicants = rawEb.map(e => ({
      id: e.AppID || e.id || e.appId,
      appId: e.AppID || e.id || e.appId,
      fullName: e.FullName || e.fullName || e.name || "EB Candidate",
      name: e.FullName || e.fullName || e.name || "EB Candidate",
      email: e.Email || e.email || "",
      phone: e.Phone && e.Phone !== "#ERROR!" ? String(e.Phone) : "",
      position: e.RolePreference || e.role_preference || "",
      experience: e.Experience || e.experience || "",
      why: e.WhyJoin || e.why_join || "",
      cvUrl: e.CV_URL || e.cv_url || "",
      status: e.Status || e.status || "Under Review",
      timestamp: e.Timestamp || e.timestamp || new Date().toISOString(),
    }));

    const rawSec = asData.secretariatApplicants || asData.Secretariat_Applications || [];
    const asSecApplicants = rawSec.map(s => ({
      id: s.AppID || s.id || s.appId,
      appId: s.AppID || s.id || s.appId,
      fullName: s.FullName || s.fullName || s.name || "Secretariat Candidate",
      name: s.FullName || s.fullName || s.name || "Secretariat Candidate",
      email: s.Email || s.email || "",
      phone: s.Phone && s.Phone !== "#ERROR!" ? String(s.Phone) : "",
      schoolCollege: s.SchoolCollege || s.school_college || "",
      previousExperiences: s.PreviousExperiences || s.previous_experiences || "",
      whyJoin: s.WhyJoin || s.why_join || "",
      dailyCommitment: s.DailyCommitment || s.daily_commitment || "",
      portfolioUrl: s.PortfolioURL || s.portfolio_url || "",
      resumeUrl: s.ResumeURL || s.resume_url || "",
      status: s.Status || s.status || "Under Review",
      timestamp: s.Timestamp || s.timestamp || new Date().toISOString(),
    }));

    const asWaitlist = asData.waitlist || asData.Waitlist || [];
    const siteUsers = asData.siteUsers || asData.Users || [];

    // Deduplication helper
    const dedupeByEmailOrId = (lists, idKey = 'regId') => {
      const seen = new Set();
      const out = [];
      for (const list of lists) {
        for (const item of list) {
          const k = ((item[idKey] || item.email || item.id || '') + '').toLowerCase().trim();
          if (k && seen.has(k)) continue;
          if (k) seen.add(k);
          out.push(item);
        }
      }
      return out;
    };

    let mergedRegistrations = dedupeByEmailOrId([sbDelegates, asRegistrations], 'email');

    // Apply In-Memory Additions, Updates, and Deletions
    // Filter deleted records
    if (memoryDeletedIds.size > 0) {
      mergedRegistrations = mergedRegistrations.filter(
        d => !memoryDeletedIds.has(d.regId) && !memoryDeletedIds.has(d.id) && !memoryDeletedIds.has(d.delegateId)
      );
    }

    // Apply memory updates
    mergedRegistrations = mergedRegistrations.map(d => {
      const key = (d.regId || d.id || d.delegateId || '').trim();
      const emailKey = (d.email || '').trim().toLowerCase();
      const updated = memoryUpdatedDelegates.get(key) || memoryUpdatedDelegates.get(emailKey);
      return updated ? { ...d, ...updated } : d;
    });

    // Prepend memory additions
    memoryAddedDelegates.forEach((del) => {
      const exists = mergedRegistrations.some(
        d => (d.regId === del.regId || (del.email && d.email?.toLowerCase() === del.email.toLowerCase()))
      );
      if (!exists && !memoryDeletedIds.has(del.regId)) {
        mergedRegistrations.unshift(del);
      }
    });

    const mergedDelegations = dedupeByEmailOrId([sbDelegations, asDelegations], 'delegationId');
    const mergedOc = dedupeByEmailOrId([sbOc, asOcApplicants], 'email');
    const mergedEb = dedupeByEmailOrId([sbEb, asEbApplicants], 'email');
    const mergedSec = dedupeByEmailOrId([sbSec, asSecApplicants], 'email');
    const mergedUsers = dedupeByEmailOrId([sbProfiles, siteUsers], 'email');

    // Also synthesize site user profiles from confirmed delegate registrations so all registered accounts show up
    mergedRegistrations.forEach((r, idx) => {
      const email = (r.email || '').toLowerCase().trim();
      if (!email) return;
      const exists = mergedUsers.some(u => (u.email || '').toLowerCase() === email);
      if (!exists) {
        mergedUsers.push({
          id: `usr_del_${r.regId || idx}`,
          uid: `usr_del_${r.regId || idx}`,
          name: r.fullName || r.name || 'Delegate',
          fullName: r.fullName || r.name || 'Delegate',
          email: email,
          phone: r.phone || '',
          role: ADMIN_EMAILS.includes(email) ? 'ADMIN' : 'DELEGATE',
          avatarUrl: '',
          lastActive: r.timestamp || new Date().toISOString(),
          delegateId: r.regId,
        });
      }
    });

    // Seed Bhavesh Basrani as default elevated Administrator if not present
    const hasBhavesh = mergedUsers.some(
      u => (u.email || '').toLowerCase() === 'bhaveshkumarbasrani@gmail.com'
    );
    if (!hasBhavesh) {
      mergedUsers.unshift({
        id: '00000000-0000-0000-0000-000000000001',
        uid: '00000000-0000-0000-0000-000000000001',
        name: 'Bhavesh Basrani',
        fullName: 'Bhavesh Basrani',
        email: 'bhaveshkumarbasrani@gmail.com',
        role: 'ADMIN',
        avatarUrl: 'https://lh3.googleusercontent.com/a/default-user',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        phone: '9212107797',
        lastActive: new Date().toISOString(),
      });
    }

    const resultPayload = {
      status: 'success',
      settings: liveSettings,
      siteSettings: liveSettings,
      registrations: mergedRegistrations,
      delegations: mergedDelegations,
      abandonedLeads: normalizedLeads,
      ebApplicants: mergedEb,
      ocApplicants: mergedOc,
      secretariatApplicants: mergedSec,
      waitlist: asWaitlist,
      siteUsers: mergedUsers,
      auditLogs: asData.Audit_Logs || asData.auditLogs || [],
      emailLogs: asData.Email_Logs || asData.emailLogs || [],
    };

    adminDataCache = resultPayload;
    adminDataCacheTime = Date.now();

    return NextResponse.json(resultPayload);
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const action = body.action;

    // 0a. PUBLIC TELEMETRY: SAVE_DRAFT_LEAD
    if (action === 'SAVE_DRAFT_LEAD') {
      const leadId = body.leadId || `LEAD-${Date.now().toString(36).toUpperCase()}`;
      const targetEmail = (body.email || '').trim().toLowerCase();
      const targetPhone = (body.phone || '').trim();
      const targetName = (body.fullName || body.name || '').trim();
      const formType = body.formType || 'Individual Delegate';
      const lastStep = body.step || 'Step 1: Personal Details';
      const preferences = body.preferences || '';
      const institution = body.institution || body.school || 'Individual';
      const grade = body.grade || '';
      const draftData = body.draftData || {};

      const leadObj = {
        id: leadId,
        leadId: leadId,
        fullName: targetName || 'Prospective Candidate',
        name: targetName || 'Prospective Candidate',
        email: targetEmail,
        phone: targetPhone,
        formType,
        lastStep,
        preferences,
        institution,
        grade,
        status: 'Draft In Progress',
        timestamp: new Date().toISOString(),
        draftData,
      };

      const key = targetEmail || targetPhone || leadId;
      if (key) {
        inMemoryDraftLeads.set(key, leadObj);
      }

      adminDataCache = null;

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'SAVE_DRAFT_LEAD',
          ...body,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', lead: leadObj });
    }

    // 0b. AUTH SYNC: SYNC_USER (Firebase Auth -> Supabase profiles)
    if (action === 'SYNC_USER') {
      const user = body.user || body;
      const uid = user.uid || user.id || `usr_${Date.now()}`;
      const email = (user.email || '').toLowerCase().trim();
      const name = user.displayName || user.fullName || user.name || (email ? email.split('@')[0] : 'User');
      const avatarUrl = user.photoURL || user.avatarUrl || user.avatar || '';

      if (email && supabase) {
        try {
          const isAdmin = [
            'bhaveshkumarbasrani@gmail.com',
            'adityabejugam@gmail.com',
            'support@resolvemun.in',
            'admin@resolvemun.in'
          ].includes(email);

          await supabase.from('profiles').upsert(
            {
              id: uid.length === 36 ? uid : undefined,
              email: email,
              full_name: name,
              avatar_url: avatarUrl,
              role: isAdmin ? 'ADMIN' : 'DELEGATE',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
        } catch (e) {
          console.warn("[Supabase] Profile sync notice:", e.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'AUTH_SYNC',
          adminKey: ADMIN_KEY,
          uid,
          email,
          name,
          avatarUrl,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'User synced successfully' });
    }

    // 0c. PUBLIC REGISTRATION SUBMISSION: SUBMIT_DELEGATE
    if (action === 'SUBMIT_DELEGATE' || action === 'DELEGATE_REGISTRATION') {
      const generatedId = body.regId || body.delegateId || body.id || `RM26-DEL-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const delegateName = (body.fullName || body.name || 'Delegate').trim();
      const phone = (body.phone ? String(body.phone) : '').trim();
      const institute = body.institute || body.institution || body.school || 'Individual';
      const grade = body.grade || '11';
      const utr = (body.payment_utr || body.paymentUTR || body.txnID || 'PENDING').trim();
      const screenshot = body.payment_screenshot_link || body.payment_screenshot_url || body.paymentScreenshotBase64 || body.screenshotBase64 || '';
      const fee = parseFloat(body.registration_fee) || 2500;
      const qrToken = `RESOLVE26:DELEGATE:${generatedId}:${cleanEmail}`;

      const newDelObj = {
        id: generatedId,
        _id: generatedId,
        regId: generatedId,
        delegateId: generatedId,
        fullName: delegateName,
        name: delegateName,
        email: cleanEmail,
        phone: phone,
        school: institute,
        institution: institute,
        grade: grade,
        dob: body.dob || '',
        address: body.address || '',
        transport: body.transport || 'No',
        experience: body.experience || '',
        pref1_committee: body.pref1_committee || '',
        pref1_country: body.pref1_country || '',
        pref2_committee: body.pref2_committee || '',
        pref2_country: body.pref2_country || '',
        pref3_committee: body.pref3_committee || '',
        pref3_country: body.pref3_country || '',
        paymentUTR: utr,
        paymentStatus: 'PENDING_VERIFICATION',
        paymentVerified: 'Pending',
        paymentScreenshotURL: screenshot,
        status: 'Confirmed',
        timestamp: new Date().toISOString(),
      };

      // Add to in-memory store for instant visibility in admin panel
      memoryAddedDelegates.set(generatedId, newDelObj);
      memoryDeletedIds.delete(generatedId);
      if (cleanEmail) inMemoryDraftLeads.delete(cleanEmail);
      if (phone) inMemoryDraftLeads.delete(phone);
      adminDataCache = null;

      // Persist in Supabase 'delegates' and 'delegate_applications'
      if (supabase) {
        try {
          await Promise.all([
            supabase.from('delegates').upsert({
              delegate_id: generatedId,
              full_name: delegateName,
              name: delegateName,
              email: cleanEmail,
              phone: phone,
              school: institute,
              institute: institute,
              grade: grade,
              pref1_committee: body.pref1_committee || '',
              pref1_country: body.pref1_country || '',
              pref2_committee: body.pref2_committee || '',
              pref2_country: body.pref2_country || '',
              pref3_committee: body.pref3_committee || '',
              pref3_country: body.pref3_country || '',
              registration_fee: fee,
              payment_utr: utr,
              payment_status: 'PENDING_VERIFICATION',
              payment_screenshot_url: screenshot.startsWith('http') ? screenshot : '',
              status: 'Confirmed',
              qr_token: qrToken,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' }),
            supabase.from('delegate_applications').upsert({
              name: delegateName,
              email: cleanEmail,
              phone: phone,
              institute: institute,
              grade: grade,
              registration_fee: fee,
              payment_utr: utr,
              payment_status: 'PENDING_VERIFICATION',
              status: 'Confirmed',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' })
          ]);
        } catch (sbErr) {
          console.warn("[Supabase] Submission insert notice:", sbErr.message);
        }
      }

      // Replicate to Google Apps Script (Drive storage + auto confirmation email)
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'SUBMIT_DELEGATE',
          regId: generatedId,
          id: generatedId,
          ...body,
          name: delegateName,
          fullName: delegateName,
          email: cleanEmail,
          phone: phone,
          institute: institute,
          payment_utr: utr,
          payment_screenshot_link: screenshot,
          paymentScreenshotBase64: screenshot,
          screenshotBase64: screenshot,
        }),
      }).catch(err => console.warn("Google Apps Script async dispatch notice:", err.message));

      return NextResponse.json({
        status: 'success',
        regId: generatedId,
        delegateId: generatedId,
        id: generatedId,
        ticketId: generatedId,
        message: 'Registration submitted successfully!'
      });
    }

    const key = body.adminKey;
    if (!isAuthorizedKey(key)) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    // Bust SWR cache on any mutation
    adminDataCache = null;
    adminDataCacheTime = 0;

    // 0b. COMMITTEE CAPACITIES: UPDATE_COMMITTEE_CAPACITIES
    if (action === 'UPDATE_COMMITTEE_CAPACITIES') {
      const capacities = body.capacities || {};
      if (supabase) {
        try {
          await supabase.from('system_settings').upsert({
            id: 'global',
            committee_capacities: capacities,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("[Supabase] Committee capacities notice:", e.message);
        }
      }
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'UPDATE_COMMITTEE_CAPACITIES',
          adminKey: ADMIN_KEY,
          capacities,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'Committee capacities updated', capacities });
    }

    // 0c. COMMITTEE DOSSIER: UPLOAD_COMMITTEE_FILE
    if (action === 'UPLOAD_COMMITTEE_FILE') {
      const { committee, title, url, type } = body;
      let currentDocs = {};
      if (supabase && committee) {
        try {
          const { data } = await supabase.from('system_settings').select('committee_documents').eq('id', 'global').maybeSingle();
          if (data && data.committee_documents && typeof data.committee_documents === 'object') {
            currentDocs = { ...data.committee_documents };
          }
          if (!Array.isArray(currentDocs[committee])) currentDocs[committee] = [];
          currentDocs[committee].push({
            id: `doc_${Date.now()}`,
            title: title || 'Resource Document',
            url: url || '',
            type: type || 'pdf',
            createdAt: new Date().toISOString(),
          });
          await supabase.from('system_settings').upsert({
            id: 'global',
            committee_documents: currentDocs,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {
          console.warn("[Supabase] Committee document upload notice:", e.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'UPLOAD_COMMITTEE_FILE',
          adminKey: ADMIN_KEY,
          committee,
          title,
          url,
          type,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'Document added to committee', committeeDocuments: currentDocs });
    }

    // 0d. USER ROLE MANAGEMENT: ADMIN_UPDATE_USER_ROLE
    if (action === 'ADMIN_UPDATE_USER_ROLE') {
      const { email, role, id } = body;
      if (supabase && (email || id)) {
        try {
          let q = supabase.from('profiles').update({ role: role, updated_at: new Date().toISOString() });
          if (id && id.length === 36) q = q.eq('id', id);
          else if (email) q = q.ilike('email', email.trim().toLowerCase());
          await q;
        } catch (e) {
          console.warn("[Supabase] User role update notice:", e.message);
        }
      }
      return NextResponse.json({ status: 'success', message: `User role updated to ${role}` });
    }

    // 1. ADMIN_UPDATE_SETTINGS
    if (action === 'ADMIN_UPDATE_SETTINGS') {
      const normalized = normalizeSettings(body.settings || body);
      if (supabase) {
        try {
          await supabase.from('system_settings').upsert({
            id: 'global',
            registrations_open: normalized.registrationsOpen,
            round_name: normalized.roundName,
            delegate_base_fee: normalized.delegateFee,
            updated_at: new Date().toISOString(),
          });
        } catch (sbErr) {
          console.warn("Supabase settings update notice:", sbErr.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...body, adminKey: ADMIN_KEY }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', settings: normalized });
    }

    // 2. GOD-MODE: ADMIN_ADD_DELEGATE
    if (action === 'ADMIN_ADD_DELEGATE') {
      const genId = body.regId || body.delegateId || `RM26-DEL-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const delegateName = body.fullName || body.name || 'Delegate';
      const institute = body.institution || body.school || 'Individual';
      const committee = body.allocatedCommittee || 'DISEC';
      const country = body.allocatedCountry || '';
      const utr = body.paymentUTR || body.utr || 'OFFLINE-MANUAL';
      const payStatus = (body.paymentStatus || 'VERIFIED').toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION';

      // Normalized object for frontend & in-memory cache
      const newDelegate = {
        id: genId,
        _id: genId,
        regId: genId,
        delegateId: genId,
        fullName: delegateName,
        name: delegateName,
        email: cleanEmail,
        phone: body.phone || '',
        institution: institute,
        school: institute,
        grade: body.grade || '11',
        dob: body.dob || '',
        allocatedCommittee: committee,
        allocatedCountry: country,
        paymentUTR: utr,
        paymentStatus: payStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
        paymentVerified: payStatus === 'VERIFIED' ? 'verified' : 'Pending',
        status: country ? 'ALLOTTED' : 'PENDING',
        checkInDay1: 'Absent',
        checkInDay2: 'Absent',
        checkInDay3: 'Absent',
        timestamp: new Date().toISOString(),
      };

      // Store in memory for instant GET response
      memoryAddedDelegates.set(genId, newDelegate);
      memoryDeletedIds.delete(genId);

      // Insert into Supabase delegates & delegate_applications
      if (supabase) {
        try {
          await Promise.all([
            supabase.from('delegates').insert({
              delegate_id: genId,
              full_name: delegateName,
              name: delegateName,
              email: cleanEmail,
              phone: body.phone || '',
              school: institute,
              institute: institute,
              grade: body.grade || '11',
              registration_fee: parseFloat(body.registrationFee) || 2500,
              payment_utr: utr,
              payment_status: payStatus,
              status: country ? 'ALLOTTED' : 'PENDING',
              allocated_committee: committee,
              allocated_country: country,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }),
            supabase.from('delegate_applications').insert({
              name: delegateName,
              email: cleanEmail,
              phone: body.phone || '',
              institute: institute,
              grade: body.grade || '11',
              registration_fee: parseFloat(body.registrationFee) || 2500,
              payment_utr: utr,
              payment_status: payStatus,
              status: country ? 'ALLOTTED' : 'PENDING',
              allocated_committee: committee,
              allocated_country: country,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          ]);
        } catch (e) {
          console.warn("[Supabase] Insert delegate notice:", e.message);
        }
      }

      // Replicate to Google Sheets via action ADMIN_ADD_DELEGATE
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_ADD_DELEGATE',
          adminKey: ADMIN_KEY,
          regId: genId,
          fullName: delegateName,
          email: cleanEmail,
          phone: body.phone || '',
          institution: institute,
          allocatedCommittee: committee,
          allocatedCountry: country,
          paymentUTR: utr,
          paymentStatus: payStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
        }),
      }).catch(() => { });

      return NextResponse.json({
        status: 'success',
        message: `Delegate ${delegateName} (${genId}) created successfully!`,
        delegate: newDelegate,
      });
    }

    // 3. GOD-MODE: ADMIN_UPDATE_DELEGATE
    if (action === 'ADMIN_UPDATE_DELEGATE') {
      const targetId = (body.regId || body.delegateId || body.id || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();

      // Update in-memory cache instantly
      const memoryKey = targetId || targetEmail;
      if (memoryKey) {
        const existing = memoryUpdatedDelegates.get(memoryKey) || {};
        memoryUpdatedDelegates.set(memoryKey, {
          ...existing,
          ...body,
          updated_at: new Date().toISOString(),
        });
      }

      // Update Supabase
      if (supabase) {
        try {
          const patch = { updated_at: new Date().toISOString() };
          if (body.fullName !== undefined) { patch.name = body.fullName; patch.full_name = body.fullName; }
          if (body.name !== undefined) { patch.name = body.name; patch.full_name = body.name; }
          if (body.phone !== undefined) patch.phone = body.phone;
          if (body.institution !== undefined) { patch.institute = body.institution; patch.school = body.institution; }
          if (body.school !== undefined) { patch.institute = body.school; patch.school = body.school; }
          if (body.grade !== undefined) patch.grade = body.grade;
          if (body.allocatedCommittee !== undefined) patch.allocated_committee = body.allocatedCommittee;
          if (body.allocatedCountry !== undefined) patch.allocated_country = body.allocatedCountry;
          if (body.paymentUTR !== undefined) patch.payment_utr = body.paymentUTR;
          if (body.paymentStatus !== undefined) {
            patch.payment_status = body.paymentStatus.toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION';
          }
          if (body.allocatedCommittee && !patch.status) patch.status = 'ALLOTTED';

          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          let q1 = supabase.from('delegates').update(patch);
          let q2 = supabase.from('delegate_applications').update(patch);
          if (isUuid) {
            q1 = q1.eq('id', targetId);
            q2 = q2.eq('id', targetId);
          } else {
            if (targetId) {
              q1 = q1.or(`delegate_id.eq.${targetId},email.ilike.${targetId}`);
              q2 = q2.or(`name.ilike.${targetId},email.ilike.${targetId}`);
            }
            if (targetEmail) {
              q1 = q1.ilike('email', targetEmail);
              q2 = q2.ilike('email', targetEmail);
            }
          }
          await Promise.all([q1, q2]);
        } catch (e) {
          console.warn("[Supabase] Update delegate notice:", e.message);
        }
      }

      // Replicate to Google Sheets via action ADMIN_UPDATE_DELEGATE
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_UPDATE_DELEGATE',
          adminKey: ADMIN_KEY,
          ...body,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'Delegate updated successfully' });
    }

    // 4. GOD-MODE: ADMIN_ALLOT_COMMITTEE
    if (action === 'ADMIN_ALLOT_COMMITTEE' || action === 'ADMIN_CONFIRM_ALLOTMENT') {
      const targetId = (body.regId || body.delegateId || body.id || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();

      // In-memory update
      const memoryKey = targetId || targetEmail;
      if (memoryKey) {
        const existing = memoryUpdatedDelegates.get(memoryKey) || {};
        memoryUpdatedDelegates.set(memoryKey, {
          ...existing,
          allocatedCommittee: body.committee,
          allocatedCountry: body.country,
          status: 'ALLOTTED',
        });
      }

      if (supabase) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          let q = supabase.from('delegate_applications').update({
            allocated_committee: body.committee,
            allocated_country: body.country,
            status: 'ALLOTTED',
            updated_at: new Date().toISOString(),
          });
          if (isUuid) q = q.eq('id', targetId);
          else if (targetEmail) q = q.ilike('email', targetEmail);
          await q;
        } catch (e) {
          console.warn("[Supabase] Allotment notice:", e.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...body, adminKey: ADMIN_KEY }),
      }).catch(() => { });

      return NextResponse.json({
        status: 'success',
        message: `Allotted ${body.country} in ${body.committee} to delegate`,
      });
    }

    // 5. GOD-MODE: ADMIN_VERIFY_PAYMENT
    if (action === 'ADMIN_VERIFY_PAYMENT') {
      const targetId = (body.regId || body.delegateId || body.id || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();
      const newStatus = (body.paymentStatus || 'VERIFIED').toUpperCase();

      const memoryKey = targetId || targetEmail;
      if (memoryKey) {
        const existing = memoryUpdatedDelegates.get(memoryKey) || {};
        memoryUpdatedDelegates.set(memoryKey, {
          ...existing,
          paymentStatus: newStatus,
          paymentVerified: newStatus === 'VERIFIED' ? 'verified' : 'Pending',
        });
      }

      if (supabase) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          let q = supabase.from('delegate_applications').update({
            payment_status: newStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
            updated_at: new Date().toISOString(),
          });
          if (isUuid) q = q.eq('id', targetId);
          else if (targetEmail) q = q.ilike('email', targetEmail);
          await q;
        } catch (e) {
          console.warn("[Supabase] Payment verify notice:", e.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...body, adminKey: ADMIN_KEY }),
      }).catch(() => { });

      return NextResponse.json({
        status: 'success',
        message: `Payment status set to ${newStatus}`,
      });
    }

    // 6. GOD-MODE: ADMIN_DELETE_RECORD / ADMIN_DELETE_DELEGATE
    if (action === 'ADMIN_DELETE_RECORD' || action === 'ADMIN_DELETE_DELEGATE') {
      const targetId = (body.regId || body.recordId || body.id || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();

      if (targetId) memoryDeletedIds.add(targetId);
      if (targetEmail) memoryDeletedIds.add(targetEmail);
      memoryAddedDelegates.delete(targetId);
      memoryUpdatedDelegates.delete(targetId);

      if (supabase) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          let q1 = supabase.from('delegates').delete();
          let q2 = supabase.from('delegate_applications').delete();
          if (isUuid) {
            q1 = q1.eq('id', targetId);
            q2 = q2.eq('id', targetId);
          } else {
            if (targetId) {
              q1 = q1.or(`delegate_id.eq.${targetId},email.ilike.${targetId}`);
              q2 = q2.or(`name.ilike.${targetId},email.ilike.${targetId}`);
            }
            if (targetEmail) {
              q1 = q1.ilike('email', targetEmail);
              q2 = q2.ilike('email', targetEmail);
            }
          }
          await Promise.all([q1, q2]);
        } catch (e) {
          console.warn("[Supabase] Delete delegate notice:", e.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_RECORD',
          adminKey: ADMIN_KEY,
          sheetName: body.sheetName || 'Registrations',
          recordId: targetId || targetEmail,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'Record deleted successfully' });
    }

    // 6b. LEAD MANAGEMENT: DELETE_LEAD
    if (action === 'DELETE_LEAD' || action === 'ADMIN_DELETE_LEAD') {
      const targetId = (body.leadId || body.id || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();
      const targetPhone = (body.phone ? String(body.phone) : '').trim();

      if (targetId) memoryDeletedIds.add(targetId);
      if (targetEmail) {
        memoryDeletedIds.add(targetEmail);
        inMemoryDraftLeads.delete(targetEmail);
      }
      if (targetPhone) inMemoryDraftLeads.delete(targetPhone);
      if (targetId) inMemoryDraftLeads.delete(targetId);

      // Replicate deletion to Google Apps Script Abandoned_Leads
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_RECORD',
          adminKey: ADMIN_KEY,
          sheetName: 'Abandoned_Leads',
          recordId: targetId || targetEmail || targetPhone,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'Lead deleted successfully' });
    }

    // 6c. PURGE TEST DATA & LEADS: CLEAR_TEST_LEADS
    if (action === 'CLEAR_TEST_LEADS' || action === 'PURGE_TEST_DATA') {
      const testKeywords = ['test', 'example.com', 'asdf', 'qwerty', 'tester', 'placeholder'];
      // Purge in-memory draft leads
      inMemoryDraftLeads.forEach((lead, key) => {
        const s = JSON.stringify(lead).toLowerCase();
        if (testKeywords.some(k => s.includes(k))) {
          inMemoryDraftLeads.delete(key);
          if (lead.id) memoryDeletedIds.add(lead.id);
          if (lead.email) memoryDeletedIds.add(lead.email);
        }
      });

      // Purge from Supabase
      if (supabase) {
        try {
          await Promise.all([
            supabase.from('delegates').delete().ilike('email', '%test%'),
            supabase.from('delegates').delete().ilike('email', '%example.com%'),
            supabase.from('delegate_applications').delete().ilike('email', '%test%'),
            supabase.from('delegate_applications').delete().ilike('email', '%example.com%'),
          ]);
        } catch (_) { }
      }

      // Replicate to Google Apps Script
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'PURGE_TEST_DATA',
          adminKey: ADMIN_KEY,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'Test leads and sample records purged successfully' });
    }

    // 7. GOD-MODE: RECORD_CHECK_IN (Ultra-fast Gatekeeper Scanner)
    if (action === 'RECORD_CHECK_IN') {
      const targetId = (body.delegateId || body.regId || '').trim();
      const dayStr = body.day || 'Day 1';
      const isEntry = (body.actionType || 'ENTRY') === 'ENTRY';
      const statusValue = isEntry ? 'Present' : 'Absent';

      const dayCol = dayStr === 'Day 2' ? 'check_in_day2' : dayStr === 'Day 3' ? 'check_in_day3' : 'check_in_day1';
      const dayKey = dayStr === 'Day 2' ? 'checkInDay2' : dayStr === 'Day 3' ? 'checkInDay3' : 'checkInDay1';

      if (targetId) {
        const existing = memoryUpdatedDelegates.get(targetId) || {};
        memoryUpdatedDelegates.set(targetId, { ...existing, [dayKey]: statusValue });
      }

      if (supabase && targetId) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          let q = supabase.from('delegate_applications').update({
            [dayCol]: statusValue,
            updated_at: new Date().toISOString(),
          });
          if (isUuid) q = q.eq('id', targetId);
          else q = q.ilike('email', targetId);
          await q;
        } catch (_) { }
      }

      // Replicate check-in to Google Apps Script asynchronously
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'RECORD_CHECK_IN',
          adminKey: ADMIN_KEY,
          delegateId: targetId,
          day: dayStr,
          status: statusValue,
        }),
      }).catch(() => { });

      return NextResponse.json({
        status: 'success',
        message: `Check-in (${dayStr}: ${statusValue}) recorded`,
        day: dayStr,
        checkInStatus: statusValue,
      });
    }

    // Generic forward to Apps Script
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ ...body, adminKey: ADMIN_KEY }),
    }).catch(() => { });

    return NextResponse.json({ status: 'success', message: `${action} processed` });
  } catch (err) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}
