import { NextResponse } from 'next/server';
import { supabase, DEFAULT_SITE_SETTINGS, DEFAULT_COMMITTEE_CAPACITIES, normalizeSettings } from '@/lib/supabase';
import { buildResolveEmailHtml } from '@/lib/emailTemplates';
import { enforceRateLimit } from '@/lib/rateLimit';

const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_APP_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyoC8dZ2L6h1Es_n3Rx3LRSwuiy_8iLklKerZK2jWseNBDzD4i3Gr7JHDNdS7jJzhuWEA/exec";
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
  const rl = enforceRateLimit(request, { keyPrefix: 'admin_get', limit: 90, windowMs: 60_000 });
  if (rl) return rl;
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
          const [siteRes, sysRes] = await Promise.all([
            supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle(),
            supabase.from('system_settings').select('*').eq('id', 'global').maybeSingle(),
          ]);
          const merged = { ...(sysRes?.data || {}), ...(siteRes?.data || {}) };
          if (Object.keys(merged).length > 0) settings = normalizeSettings(merged);
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

    // 0. Fetch System Settings from Supabase (merge site_settings + system_settings)
    let liveSettings = { ...DEFAULT_SITE_SETTINGS };
    if (supabase) {
      try {
        const [siteRes, sysRes] = await Promise.all([
          supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle(),
          supabase.from('system_settings').select('*').eq('id', 'global').maybeSingle(),
        ]);
        const merged = { ...(sysRes?.data || {}), ...(siteRes?.data || {}) };
        if (Object.keys(merged).length > 0) {
          liveSettings = normalizeSettings(merged);
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
    let sbDraftLeads = [];

    if (supabase) {
      try {
        const [appDelRes, realDelegRes, delegRes, ocRes, ebRes, secRes, profRes, draftLeadsRes] = await Promise.all([
          supabase.from('delegate_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('delegations').select('*').order('created_at', { ascending: false }),
          supabase.from('delegation_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('oc_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('eb_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('secretariat_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
          supabase.from('draft_leads').select('*').order('timestamp', { ascending: false }),
        ]);

        const rawAllDelegates = appDelRes.data || [];
        if (rawAllDelegates.length > 0) {
          sbDelegates = rawAllDelegates.map(d => {
            const rawCode = d.reg_id || d.delegate_id || d.id;
            const shortCode = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(rawCode || ''))
              ? `RM-${String(rawCode).replace(/-/g, '').slice(0, 4).toUpperCase()}`
              : String(rawCode || '').replace(/^RM26-DEL-/i, 'RM-');
            return ({
            ...d,
            id: shortCode,
            _id: shortCode,
            regId: shortCode,
            delegateId: shortCode,
            fullName: d.name || d.full_name || 'Delegate',
            name: d.name || d.full_name || 'Delegate',
            email: d.email || '',
            phone: d.phone ? String(d.phone) : '',
            institution: d.institute || d.school || 'Individual',
            school: d.school || d.institute || 'Individual',
            grade: d.grade || '',
            dob: d.dob || d.birth_date || '',
            address: d.address || d.residential_address || '',
            transport: d.transport || d.transport_needed || '',
            experience: d.experience || d.mun_experience || '',
            emergencyName: d.emergency_name || d.parent_name || '',
            emergencyPhone: d.emergency_phone ? String(d.emergency_phone) : (d.parent_phone ? String(d.parent_phone) : ''),
            pref1_committee: d.pref1_committee || '',
            pref1_country: d.pref1_country || d.pref1_portfolio1 || '',
            pref2_committee: d.pref2_committee || '',
            pref2_country: d.pref2_country || d.pref2_portfolio1 || '',
            pref3_committee: d.pref3_committee || '',
            pref3_country: d.pref3_country || d.pref3_portfolio1 || '',
            preferencesUpdatedCount: Number(d.preferences_updated_count || 0),
            preferencesLocked: Number(d.preferences_updated_count || 0) >= 1,
            allocatedCommittee: d.allocated_committee || '',
            allocatedCountry: d.allocated_country || '',
            paymentUTR: d.payment_utr || '',
            paymentScreenshotURL: d.payment_screenshot_url || '',
            paymentStatus: (() => {
              const raw = String(d.payment_status || d.paymentStatus || '').toUpperCase().trim();
              const st = String(d.status || '').toUpperCase().trim();
              if (raw.includes('FAIL') || raw.includes('REJECT') || st.includes('FAIL')) return 'FAILED';
              if (raw.includes('PENDING') || raw.includes('REVIEW')) return 'PENDING';
              if (raw === 'VERIFIED' || raw === 'PAID' || raw === 'APPROVED' || raw === 'CONFIRMED') return 'VERIFIED';
              return 'PENDING';
            })(),
            paymentVerified: (() => {
              const raw = String(d.payment_status || d.paymentStatus || '').toUpperCase().trim();
              const st = String(d.status || '').toUpperCase().trim();
              if (raw.includes('FAIL') || raw.includes('REJECT') || st.includes('FAIL')) return 'Failed';
              if (raw.includes('PENDING') || raw.includes('REVIEW')) return 'Pending';
              if (raw === 'VERIFIED' || raw === 'PAID' || raw === 'APPROVED' || raw === 'CONFIRMED') return 'verified';
              return 'Pending';
            })(),
            status: d.status || (d.allocated_committee ? 'ALLOTTED' : 'Confirmed'),
            checkInDay1: d.check_in_day1 || 'Absent',
            checkInDay2: d.check_in_day2 || 'Absent',
            checkInDay3: d.check_in_day3 || 'Absent',
            timestamp: d.created_at,
          });
          });
        }
        const rawAllDelegations = [...(realDelegRes?.data || []), ...(delegRes?.data || [])];
        if (rawAllDelegations.length > 0) {
          sbDelegations = rawAllDelegations.map(d => ({
            ...d,
            id: d.delegation_id || d.id,
            _id: d.delegation_id || d.id,
            delegationId: d.delegation_id || d.id,
            instName: d.inst_name || d.institution_name || d.delegation_name || 'Delegation',
            institutionName: d.inst_name || d.institution_name || d.delegation_name || 'Delegation',
            adviserName: d.adviser_name || d.advisor_name || d.head_delegate_name || '',
            adviserEmail: d.adviser_email || d.advisor_email || '',
            adviserPhone: d.adviser_phone || d.advisor_phone || '',
            size: d.size || d.delegate_count || 6,
            delegateCount: d.size || d.delegate_count || 6,
            totalAmount: d.total_amount || 0,
            paymentUTR: d.payment_utr || '',
            paymentScreenshotURL: d.payment_screenshot_url || '',
            paymentStatus: (() => {
              const raw = String(d.payment_status || 'PENDING_VERIFICATION').toUpperCase();
              if (raw.includes('FAIL') || raw.includes('REJECT')) return 'FAILED';
              if (raw === 'VERIFIED' || raw.includes('VERIF')) return 'VERIFIED';
              return 'PENDING';
            })(),
            status: d.status || 'Pending',
            timestamp: d.created_at,
          }));
        }
        if (ocRes.data) {
          sbOc = ocRes.data.map(o => ({
            ...o,
            id: o.id,
            _id: o.id,
            appId: o.app_id || o.id,
            fullName: o.full_name || o.name || "OC Candidate",
            name: o.full_name || o.name || "OC Candidate",
            email: o.email || "",
            phone: o.phone ? String(o.phone) : "",
            institution: o.institute || o.school || "Individual",
            school: o.school || o.institute || "Individual",
            grade: o.grade || "",
            dob: o.dob || "",
            residentialAddress: o.residential_address || o.address || "",
            instagram: o.instagram || "",
            transportNeeded: o.transport_needed || o.transport || "No",
            department1: o.department1 || "",
            department2: o.department2 || "",
            sop: o.sop || o.why || "",
            previousExperience: o.previous_experience || o.experience || "",
            feeTier: o.fee_tier || o.payment_tier || "1500_FULL",
            paymentUTR: o.payment_utr || "",
            paymentScreenshotURL: o.payment_screenshot_url || o.cv_url || "",
            cvUrl: o.cv_url || o.payment_screenshot_url || "",
            status: o.status || "Under Review",
            allocatedDepartment: o.allocated_department || "",
            timestamp: o.created_at,
          }));
        }
        if (ebRes.data) {
          sbEb = ebRes.data.map(e => ({
            ...e,
            id: e.id,
            _id: e.id,
            appId: e.app_id || e.id,
            fullName: e.full_name || e.name || "EB Candidate",
            name: e.full_name || e.name || "EB Candidate",
            email: e.email || "",
            phone: e.phone ? String(e.phone) : "",
            institution: e.institute || e.school || "Individual",
            school: e.school || e.institute || "Individual",
            dob: e.dob || "",
            position: e.role_preference || e.position || "Executive Board",
            prefCommittee1: e.pref_committee1 || (e.committees ? e.committees.split(" & ")[0] : "") || "",
            prefCommittee2: e.pref_committee2 || (e.committees ? e.committees.split(" & ")[1] : "") || "",
            committees: e.committees || "",
            munExperience: e.experience || "",
            experience: e.experience || "",
            executiveSummary: e.why_join || e.why || e.executive_summary || "",
            why: e.why_join || e.why || e.executive_summary || "",
            whyJoin: e.why_join || e.why || e.executive_summary || "",
            cvUrl: e.cv_url || e.cvUrl || e.drive_url || "",
            status: e.status || "Under Review",
            allocatedCommittee: e.allocated_committee || "",
            timestamp: e.created_at,
          }));
        }
        if (secRes.data) {
          sbSec = secRes.data.map(s => ({
            ...s,
            id: s.id,
            _id: s.id,
            appId: s.app_id || s.id,
            fullName: s.full_name || s.name || "Secretariat Candidate",
            name: s.full_name || s.name || "Secretariat Candidate",
            email: s.email || "",
            phone: s.phone ? String(s.phone) : "",
            institution: s.school_college || s.school || s.institute || "Individual",
            schoolCollege: s.school_college || s.school || s.institute || "Individual",
            residentialAddress: s.residential_address || s.address || "",
            dob: s.dob || "",
            grade: s.grade || "",
            instagram: s.instagram || "",
            position: s.position || "Secretariat",
            previousExperiences: s.previous_experiences || s.experience || "",
            whyJoin: s.why_join || s.why || "",
            contribution: s.contribution || "",
            dailyCommitment: s.daily_commitment || "",
            portfolioUrl: s.portfolio_url || "",
            resumeUrl: s.resume_url || s.portfolio_url || "",
            cvUrl: s.resume_url || s.portfolio_url || "",
            status: s.status || "Under Review",
            allocatedRole: s.allocated_role || "",
            timestamp: s.created_at,
          }));
        }
        if (profRes.data) {
          // Only include real Firebase Auth synced accounts
          sbProfiles = profRes.data
            .filter(p => p && p.email && String(p.email).includes('@'))
            .map(p => ({
              id: p.firebase_uid || p.id,
              uid: p.firebase_uid || p.id,
              firebaseUid: p.firebase_uid || '',
              name: p.full_name || p.email.split('@')[0] || 'User',
              fullName: p.full_name || p.email.split('@')[0] || 'User',
              email: p.email.trim().toLowerCase(),
              role: (p.role || (ADMIN_EMAILS.includes(p.email.trim().toLowerCase()) ? 'ADMIN' : 'DELEGATE')).toUpperCase(),
              avatarUrl: p.avatar_url || '',
              avatar: p.avatar_url || '',
              phone: p.phone || '',
              lastActive: p.updated_at || p.created_at || new Date().toISOString(),
            }));
        }
        if (draftLeadsRes?.data) {
          sbDraftLeads = draftLeadsRes.data;
        }
      } catch (sbErr) {
        console.warn("Supabase fetch notice:", sbErr.message);
      }
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
      dob: r.DOB || r.dob || r.BirthDate || '',
      address: r.ResidentialAddress || r.Address || r.address || r.residential_address || '',
      transport: r.TransportNeeded || r.Transport || r.transport || '',
      experience: r.Experience || r.MUNExperience || r.mun_experience || r.experience || '',
      institution: r.School || r.Institute || r.institution || 'Individual',
      school: r.School || r.Institute || r.institution || 'Individual',
      pref1_committee: r.Pref1_Committee || r.pref1_committee || r.CommitteePref1 || '',
      pref1_country: r.Pref1_Country || r.pref1_country || '',
      pref2_committee: r.Pref2_Committee || r.pref2_committee || r.CommitteePref2 || '',
      pref2_country: r.Pref2_Country || r.pref2_country || '',
      pref3_committee: r.Pref3_Committee || r.pref3_committee || r.CommitteePref3 || '',
      pref3_country: r.Pref3_Country || r.pref3_country || '',
      allocatedCommittee: r.AllocatedCommittee || r.allocatedCommittee || '',
      allocatedCountry: r.AllocatedCountry || r.allocatedCountry || '',
      paymentUTR: r.PaymentUTR || r.paymentUTR || r.utr || '',
      paymentScreenshotURL: r.PaymentScreenshotURL || r.paymentScreenshotURL || r.payment_screenshot_url || r.Payment_Screenshot_URL || r.PaymentScreenshot || r.Screenshot || r.DriveURL || r.driveUrl || r.payment_screenshot_link || '',
      paymentStatus: (() => {
        const raw = String(r.PaymentStatus || r.paymentStatus || r.Status || r.status || '').toUpperCase();
        if (raw === 'VERIFIED' || raw.includes('VERIF')) return 'VERIFIED';
        return 'PENDING';
      })(),
      paymentVerified: (() => {
        const raw = String(r.PaymentStatus || r.paymentStatus || r.Status || r.status || '').toUpperCase();
        if (raw === 'VERIFIED' || raw.includes('VERIF')) return 'verified';
        return 'Pending';
      })(),
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

    // Filter and normalize Abandoned Draft Leads (Supabase `draft_leads` primary + in-memory + Google Sheets)
    const rawLeads = asData.abandonedLeads || asData.Abandoned_Leads || [];
    const normalizedLeadsMap = new Map();

    // 1. Populate from live Supabase `draft_leads` table
    (sbDraftLeads || []).forEach((l, i) => {
      const email = (l.email || "").trim().toLowerCase();
      const phone = (l.phone ? String(l.phone) : "").trim();
      const name = (l.full_name || "").trim();
      if (!email && !phone && !name) return;

      const parsedDraft = typeof l.draft_data === "object" && l.draft_data ? l.draft_data : {};
      const key = email || phone || String(l.id || `sb_lead_${i}`);
      if (normalizedLeadsMap.has(key)) return;

      normalizedLeadsMap.set(key, {
        id: l.id,
        leadId: l.id,
        fullName: name || "Prospective Candidate",
        name: name || "Prospective Candidate",
        email,
        phone,
        formType: l.form_type || "Delegate Registration",
        lastStep: l.last_step || "Step 1: Personal Details",
        status: "Draft In Progress",
        institution: l.institution || parsedDraft.regInstitute || parsedDraft.delInstName || "Individual",
        preferences:
          l.preferences ||
          [parsedDraft.pref1_committee, parsedDraft.pref2_committee, parsedDraft.pref3_committee]
            .filter(Boolean)
            .join(" · ") ||
          "Awaiting Selection",
        grade: l.grade || parsedDraft.regGrade || "",
        timestamp: l.timestamp || l.created_at || new Date().toISOString(),
        draftData: parsedDraft,
      });
    });

    // 2. Populate from live in-memory telemetry draft beacons
    inMemoryDraftLeads.forEach((lead, key) => {
      const k = key.toLowerCase();
      if (!normalizedLeadsMap.has(k)) {
        normalizedLeadsMap.set(k, lead);
      }
    });

    // 3. Merge from Google Sheets
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
      ...o,
      id: o.AppID || o.id || o.appId,
      appId: o.AppID || o.id || o.appId,
      fullName: o.FullName || o.fullName || o.name || "OC Candidate",
      name: o.FullName || o.fullName || o.name || "OC Candidate",
      email: o.Email || o.email || "",
      phone: o.Phone && o.Phone !== "#ERROR!" ? String(o.Phone) : "",
      institution: o.Institution || o.SchoolCollege || o.schoolCollege || o.institution || "",
      grade: o.Grade || o.grade || "",
      dob: o.DOB || o.dob || "",
      residentialAddress: o.ResidentialAddress || o.residentialAddress || o.address || "",
      instagram: o.Instagram || o.instagram || "",
      transportNeeded: o.TransportNeeded || o.transportNeeded || "",
      previousExperience: o.PreviousExperience || o.previousExperience || o.StatementOfPurpose || o.sop || "",
      feeTier: o.FeeTier || o.feeTier || "₹1,500",
      paymentUTR: o.PaymentUTR || o.paymentUTR || o.utr || "",
      paymentScreenshotURL: o.PaymentScreenshotURL || o.paymentScreenshotURL || o.CV_URL || o.cvUrl || o.screenshotUrl || "",
      cvUrl: o.CV_URL || o.cvUrl || o.PaymentScreenshotURL || o.paymentScreenshotURL || "",
      department1: o.Department1 || o.department1 || "",
      department2: o.Department2 || o.department2 || "",
      sop: o.StatementOfPurpose || o.sop || o.PreviousExperience || "",
      status: o.Status || o.status || "Under Review",
      timestamp: o.Timestamp || o.timestamp || new Date().toISOString(),
    }));

    const rawEb = asData.ebApplicants || asData.EB_Applications || [];
    const asEbApplicants = rawEb.map(e => ({
      ...e,
      id: e.AppID || e.id || e.appId,
      appId: e.AppID || e.id || e.appId,
      fullName: e.FullName || e.fullName || e.name || "EB Candidate",
      name: e.FullName || e.fullName || e.name || "EB Candidate",
      email: e.Email || e.email || "",
      phone: e.Phone && e.Phone !== "#ERROR!" ? String(e.Phone) : "",
      prefCommittee1: e.PrefCommittee1 || e.prefCommittee1 || e.pref1 || e.RolePreference || "",
      prefCommittee2: e.PrefCommittee2 || e.prefCommittee2 || e.pref2 || "",
      munExperience: e.MUNExperience || e.munExperience || e.Experience || e.experience || "",
      executiveSummary: e.ExecutiveSummary || e.executiveSummary || e.WhyJoin || e.why || "",
      position: e.PrefCommittee1 || e.RolePreference || e.role_preference || "Executive Board",
      experience: e.MUNExperience || e.Experience || e.experience || "",
      why: e.ExecutiveSummary || e.WhyJoin || e.why_join || "",
      cvUrl: e.CV_URL || e.cv_url || e.cvUrl || e.DriveURL || e.driveUrl || "",
      status: e.Status || e.status || "Under Review",
      timestamp: e.Timestamp || e.timestamp || new Date().toISOString(),
    }));

    const rawSec = asData.secretariatApplicants || asData.Secretariat_Applications || [];
    const asSecApplicants = rawSec.map(s => ({
      ...s,
      id: s.AppID || s.id || s.appId,
      appId: s.AppID || s.id || s.appId,
      fullName: s.FullName || s.fullName || s.name || "Secretariat Candidate",
      name: s.FullName || s.fullName || s.name || "Secretariat Candidate",
      email: s.Email || s.email || "",
      phone: s.Phone && s.Phone !== "#ERROR!" ? String(s.Phone) : "",
      instagram: s.Instagram || s.instagram || "",
      schoolCollege: s.SchoolCollege || s.schoolCollege || s.institution || "",
      residentialAddress: s.ResidentialAddress || s.residentialAddress || "",
      dob: s.DOB || s.dob || "",
      grade: s.Grade || s.grade || "",
      position: s.Position || s.position || "",
      whyJoin: s.WhyJoin || s.whyJoin || s.why || "",
      contribution: s.Contribution || s.contribution || "",
      dailyCommitment: s.DailyCommitment || s.dailyCommitment || "",
      portfolioUrl: s.PortfolioURL || s.portfolio_url || s.portfolioUrl || "",
      resumeUrl: s.ResumeURL || s.resume_url || s.resumeUrl || s.CV_URL || s.cvUrl || "",
      cvUrl: s.ResumeURL || s.resume_url || s.resumeUrl || s.CV_URL || s.cvUrl || "",
      status: s.Status || s.status || "Under Review",
      timestamp: s.Timestamp || s.timestamp || new Date().toISOString(),
    }));

    const asWaitlist = asData.waitlist || asData.Waitlist || [];
    const siteUsers = asData.siteUsers || asData.Users || [];

    // Deduplication helper - strictly skips items with no identifying key
    const dedupeByEmailOrId = (lists, idKey = 'regId') => {
      const seen = new Set();
      const out = [];
      for (const list of lists) {
        if (!Array.isArray(list)) continue;
        for (const item of list) {
          if (!item) continue;
          const k = ((item[idKey] || item.email || item.id || '') + '').toLowerCase().trim();
          if (!k) continue; // Skip blank / unidentifiable rows
          if (seen.has(k)) continue;
          seen.add(k);
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

    // Note: Do NOT overwrite Supabase rows with stale memoryUpdatedDelegates so delegate dashboard updates (DOB, preferences) always reflect live in Admin Panel
    const sbEmails = new Set(sbDelegates.map((d) => String(d.email || '').trim().toLowerCase()).filter(Boolean));
    mergedRegistrations = mergedRegistrations.map((d) => {
      const emailKey = (d.email || '').trim().toLowerCase();
      if (sbEmails.has(emailKey)) return d;
      const key = (d.regId || d.id || d.delegateId || '').trim();
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

    const mergedDelegations = dedupeByEmailOrId([sbDelegations, asDelegations], 'delegationId')
      .filter(d => !memoryDeletedIds.has(d.id) && !memoryDeletedIds.has(d.delegationId));
    const mergedOc = dedupeByEmailOrId([sbOc, asOcApplicants], 'email')
      .filter(a => !memoryDeletedIds.has(a.id) && !memoryDeletedIds.has(a.appId) && !memoryDeletedIds.has((a.email || '').toLowerCase().trim()));
    const mergedEb = dedupeByEmailOrId([sbEb, asEbApplicants], 'email')
      .filter(a => !memoryDeletedIds.has(a.id) && !memoryDeletedIds.has(a.appId) && !memoryDeletedIds.has((a.email || '').toLowerCase().trim()));
    const mergedSec = dedupeByEmailOrId([sbSec, asSecApplicants], 'email')
      .filter(a => !memoryDeletedIds.has(a.id) && !memoryDeletedIds.has(a.appId) && !memoryDeletedIds.has((a.email || '').toLowerCase().trim()));

    // Exclude any draft leads whose email/phone has already completed registration
    const completedEmails = new Set(
      [
        ...mergedRegistrations.map((r) => r.email),
        ...mergedDelegations.map((d) => d.adviserEmail),
        ...mergedOc.map((o) => o.email),
        ...mergedEb.map((e) => e.email),
        ...mergedSec.map((s) => s.email),
      ]
        .map((em) => String(em || '').trim().toLowerCase())
        .filter(Boolean)
    );
    const activeAbandonedLeads = normalizedLeads.filter((l) => {
      const em = String(l.email || '').trim().toLowerCase();
      if (em && completedEmails.has(em)) return false;
      if (em && memoryDeletedIds.has(em)) return false;
      return true;
    });

    // Site Accounts: strictly Firebase Auth accounts synced to Supabase `profiles`
    const mergedUsers = dedupeByEmailOrId([sbProfiles], 'email')
      .filter(u => u && u.email && typeof u.email === 'string' && u.email.trim().includes('@') && !memoryDeletedIds.has(u.email.toLowerCase()));

    let sbRoster = [];
    if (supabase) {
      try {
        const { data: rosterRows } = await supabase
          .from('secretariat_roster')
          .select('*')
          .order('created_at', { ascending: false });
        sbRoster = (rosterRows || []).map((r) => ({
          id: r.id,
          email: r.email,
          fullName: r.full_name || '',
          allottedRole: r.allotted_role || 'Secretariat Member',
          department: r.department || '',
          phone: r.phone || '',
          school: r.school || '',
          grade: r.grade || '',
          upiId: r.upi_id || '',
          instagram: r.instagram || '',
          onboarded: Boolean(r.onboarded),
          onboardedAt: r.onboarded_at || null,
          createdAt: r.created_at,
        }));
      } catch (_) {}
    }

    const resultPayload = {
      status: 'success',
      settings: liveSettings,
      siteSettings: liveSettings,
      registrations: mergedRegistrations,
      delegations: mergedDelegations,
      abandonedLeads: activeAbandonedLeads,
      ebApplicants: mergedEb,
      ocApplicants: mergedOc,
      secretariatApplicants: mergedSec,
      secretariatRoster: sbRoster,
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
  const rl = enforceRateLimit(request, { keyPrefix: 'admin_post', limit: 45, windowMs: 60_000 });
  if (rl) return rl;
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

      // Persist live draft lead to Supabase `draft_leads` table
      if (supabase && (targetEmail || targetPhone || targetName)) {
        try {
          let existingId = null;
          if (targetEmail) {
            const { data: ex } = await supabase
              .from('draft_leads')
              .select('id')
              .ilike('email', targetEmail)
              .limit(1)
              .maybeSingle();
            existingId = ex?.id || null;
          }
          if (!existingId && targetPhone) {
            const { data: ex } = await supabase
              .from('draft_leads')
              .select('id')
              .eq('phone', targetPhone)
              .limit(1)
              .maybeSingle();
            existingId = ex?.id || null;
          }

          const dbRow = {
            full_name: targetName || 'Prospective Candidate',
            email: targetEmail || null,
            phone: targetPhone || null,
            institution: institution || 'Individual',
            grade: grade || null,
            form_type: formType,
            last_step: lastStep,
            preferences: preferences || null,
            draft_data: draftData || {},
            timestamp: new Date().toISOString(),
          };

          if (existingId) {
            await supabase.from('draft_leads').update(dbRow).eq('id', existingId);
            leadObj.id = existingId;
            leadObj.leadId = existingId;
          } else {
            const { data: ins } = await supabase.from('draft_leads').insert([dbRow]).select('id').maybeSingle();
            if (ins?.id) {
              leadObj.id = ins.id;
              leadObj.leadId = ins.id;
            }
          }
        } catch (ldErr) {
          console.warn('[Supabase] draft_leads save notice:', ldErr.message);
        }
      }

      adminDataCache = null;

      return NextResponse.json({ status: 'success', lead: leadObj });
    }

    // 0b. AUTH SYNC: SYNC_USER (Strictly Real Firebase Auth -> Supabase profiles)
    if (action === 'SYNC_USER') {
      const user = body.user || body;
      const uid = String(user.uid || user.id || '').trim();
      const email = (user.email || '').toLowerCase().trim();
      const name = user.displayName || user.fullName || user.name || (email ? email.split('@')[0] : 'User');
      const avatarUrl = user.photoURL || user.avatarUrl || user.avatar || '';

      // Only sync real Firebase Auth accounts (must have a Firebase uid and valid email)
      if (email && uid && !uid.startsWith('usr_del_') && supabase) {
        try {
          const isAdmin = ADMIN_EMAILS.includes(email);

          await supabase.from('profiles').upsert(
            {
              firebase_uid: uid,
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

      return NextResponse.json({ status: 'success', message: 'Firebase account synced successfully' });
    }

    // 0c. PUBLIC REGISTRATION SUBMISSION: SUBMIT_DELEGATE
    if (action === 'SUBMIT_DELEGATE' || action === 'DELEGATE_REGISTRATION') {
      // Server-side registration gate: block submissions if registrations or delegate track are closed
      if (supabase && !body.adminOverride) {
        try {
          const { data: liveCfg } = await supabase
            .from('site_settings')
            .select('registrations_open, delegate_open')
            .eq('id', 'global')
            .maybeSingle();
          if (liveCfg && (liveCfg.registrations_open === false || liveCfg.delegate_open === false)) {
            return NextResponse.json(
              { status: 'error', message: 'Delegate registrations are currently closed.' },
              { status: 403 }
            );
          }
        } catch (_) {}
      }

      const generatedId = body.regId || body.delegateId || body.id || `RM-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const delegateName = (body.fullName || body.name || 'Delegate').trim();
      const phone = (body.phone ? String(body.phone) : '').trim();
      const emergencyName = (body.emergency_name || body.emergencyName || body.parent_name || body.parentName || '').trim();
      const emergencyPhone = (body.emergency_phone || body.emergencyPhone || body.parent_phone || body.parentPhone || '').trim();
      const cleanDelPhoneDigits = phone.replace(/\D/g, '').slice(-10);
      const cleanEmgPhoneDigits = emergencyPhone.replace(/\D/g, '').slice(-10);
      if (cleanDelPhoneDigits && cleanEmgPhoneDigits && cleanDelPhoneDigits === cleanEmgPhoneDigits && !body.adminOverride) {
        return NextResponse.json(
          { status: 'error', message: "Parent / Emergency number cannot be the same as the delegate's contact number." },
          { status: 400 }
        );
      }
      const institute = body.institute || body.institution || body.school || 'Individual';
      const grade = body.grade || '11';
      const utr = (body.payment_utr || body.paymentUTR || body.txnID || 'PENDING').trim();
      const screenshot = (body.payment_screenshot_url || body.payment_screenshot_link || body.paymentScreenshotBase64 || body.screenshotBase64 || '').trim();
      const fee = parseFloat(body.registration_fee) || 2500;
      const qrToken = `RESOLVE26:DELEGATE:${generatedId}:${cleanEmail}`;

      let finalScreenshotUrl = screenshot.startsWith('http') ? screenshot : '';

      // Server-side fallback: Convert base64 payment screenshot to Supabase Storage file
      if (!finalScreenshotUrl && screenshot.startsWith('data:') && supabase) {
        try {
          const match = screenshot.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            const buffer = Buffer.from(base64Data, 'base64');
            const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            const fileName = `payment-proofs/SS_${generatedId}_${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('resolve-uploads')
              .upload(fileName, buffer, { contentType: mimeType, upsert: true });
            if (!uploadErr && uploadData) {
              const { data: urlData } = supabase.storage
                .from('resolve-uploads')
                .getPublicUrl(fileName);
              if (urlData?.publicUrl) {
                finalScreenshotUrl = urlData.publicUrl;
              }
            }
          }
        } catch (upErr) {
          console.warn('[Storage] Payment screenshot upload notice:', upErr.message);
        }
      }

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
        emergencyName: emergencyName,
        emergencyPhone: emergencyPhone,
        pref1_committee: body.pref1_committee || '',
        pref1_country: body.pref1_country || '',
        pref2_committee: body.pref2_committee || '',
        pref2_country: body.pref2_country || '',
        pref3_committee: body.pref3_committee || '',
        pref3_country: body.pref3_country || '',
        paymentUTR: utr,
        paymentStatus: 'PENDING_VERIFICATION',
        paymentVerified: 'Pending',
        paymentScreenshotURL: finalScreenshotUrl,
        payment_screenshot_url: finalScreenshotUrl,
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      };

      // Add to in-memory store for instant visibility in admin panel
      memoryAddedDelegates.set(generatedId, newDelObj);
      memoryDeletedIds.delete(generatedId);
      if (cleanEmail) inMemoryDraftLeads.delete(cleanEmail);
      if (phone) inMemoryDraftLeads.delete(phone);
      adminDataCache = null;

      // Persist in Supabase 'delegate_applications' & sync profile
      if (supabase && cleanEmail) {
        try {
          const { data: existingApp } = await supabase
            .from('delegate_applications')
            .select('id')
            .ilike('email', cleanEmail)
            .maybeSingle();

          const appRecord = {
            reg_id: generatedId,
            name: delegateName,
            email: cleanEmail,
            phone: phone,
            institute: institute,
            grade: grade,
            registration_fee: fee,
            payment_utr: utr,
            payment_screenshot_url: finalScreenshotUrl,
            payment_status: 'PENDING_VERIFICATION',
            status: 'PENDING',
            pref1_committee: body.pref1_committee || '',
            pref1_country: body.pref1_country || '',
            pref2_committee: body.pref2_committee || '',
            pref2_country: body.pref2_country || '',
            pref3_committee: body.pref3_committee || '',
            pref3_country: body.pref3_country || '',
            address: body.address || '',
            transport: body.transport || 'No',
            experience: body.experience || '',
            dob: body.dob || '',
            referral: String(body.referral || body.referralCode || '').trim().toUpperCase(),
            emergency_name: emergencyName,
            emergency_phone: emergencyPhone,
            updated_at: new Date().toISOString(),
          };

          if (existingApp?.id) {
            await supabase
              .from('delegate_applications')
              .update(appRecord)
              .eq('id', existingApp.id);
          } else {
            await supabase
              .from('delegate_applications')
              .insert([appRecord]);
          }

          // Automatically remove completed registration from `draft_leads` so Abandoned Leads stays 100% accurate
          await supabase.from('draft_leads').delete().ilike('email', cleanEmail);
          if (phone) await supabase.from('draft_leads').delete().eq('phone', phone);

          // Only update `profiles` if a real Firebase Auth UID was provided
          const fbUid = String(body.uid || body.user_id || '').trim();
          if (fbUid && !fbUid.startsWith('usr_del_')) {
            await supabase.from('profiles').upsert({
              firebase_uid: fbUid,
              full_name: delegateName,
              email: cleanEmail,
              phone: phone,
              role: ADMIN_EMAILS.includes(cleanEmail) ? 'ADMIN' : 'DELEGATE',
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });
          }
        } catch (sbErr) {
          console.warn("[Supabase] Delegate application save notice:", sbErr.message);
        }
      }

      // Send ONLY ONE official Registration Received email (We are verifying your payment)
      let registrationEmailSent = false;
      if (cleanEmail && cleanEmail.includes('@')) {
        const regSubject = `Registration Received — Verifying Your Payment (${generatedId})`;
        const regBodyText = `Thank you for registering for Resolve MUN 2.0 (26, 27 December 2026 at Northfield International School, Hyderabad).\n\nWe have received your application (${generatedId}) and are currently verifying your UPI payment (UTR: ${utr || 'Submitted'}).\n\nAs soon as your payment is verified, you will receive your official QR Gate Pass and committee allocation updates.`;
        try {
          const regHtml = buildResolveEmailHtml({
            eyebrow: 'Step 1 of 3 · Payment Under Verification',
            title: 'We Are Verifying Your Payment',
            recipientName: delegateName,
            bodyText: regBodyText,
            ctaLabel: 'Open Delegate Dashboard',
            ctaUrl: 'https://resolvemun.in/dashboard',
            highlightBox: {
              label: 'Registration ID & Payment Reference',
              value: `${generatedId} · UTR: ${utr || 'Submitted'} · ₹${Number(fee || 2500).toLocaleString('en-IN')}`,
            },
          });

          if (process.env.RESEND_API_KEY) {
            const fromAddr = process.env.RESEND_FROM_EMAIL || 'Resolve MUN 2.0 <onboarding@resend.dev>';
            const r = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromAddr,
                to: [cleanEmail],
                subject: regSubject,
                text: regBodyText,
                html: regHtml,
              }),
            });
            registrationEmailSent = r.ok;
          } else {
            const r = await fetch(APPS_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'ADMIN_SEND_CUSTOM_EMAIL',
                adminKey: ADMIN_KEY,
                subject: regSubject,
                messageBody: regBodyText,
                htmlBody: regHtml,
                email: cleanEmail,
                recipients: [{ email: cleanEmail, name: delegateName }],
              }),
            });
            registrationEmailSent = r.ok;
          }
        } catch (mailErr) {
          console.warn('[SUBMIT_DELEGATE] Registration email notice:', mailErr.message);
        }
      }

      return NextResponse.json({
        status: 'success',
        regId: generatedId,
        delegateId: generatedId,
        id: generatedId,
        ticketId: generatedId,
        emailDispatched: registrationEmailSent,
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

    // 0a. SECRETARIAT ROSTER MANAGEMENT (Admin manually adds/removes allotted Secretariat members)
    if (action === 'ADMIN_ADD_SECRETARIAT_MEMBER') {
      const email = String(body.email || '').trim().toLowerCase();
      const fullName = String(body.fullName || body.name || '').trim();
      const allottedRole = String(body.allottedRole || body.role || 'Secretariat Member').trim();
      const department = String(body.department || '').trim();

      if (!email || !email.includes('@')) {
        return NextResponse.json({ status: 'error', message: 'Valid member email is required.' }, { status: 400 });
      }
      if (!allottedRole) {
        return NextResponse.json({ status: 'error', message: 'Allotted role is required.' }, { status: 400 });
      }

      if (supabase) {
        const nowIso = new Date().toISOString();
        const { data: savedRow, error: insErr } = await supabase
          .from('secretariat_roster')
          .upsert(
            {
              email,
              full_name: fullName,
              allotted_role: allottedRole,
              department,
              updated_at: nowIso,
            },
            { onConflict: 'email' }
          )
          .select('*')
          .single();

        if (insErr) {
          return NextResponse.json({ status: 'error', message: insErr.message }, { status: 500 });
        }

        return NextResponse.json({
          status: 'success',
          member: {
            id: savedRow.id,
            email: savedRow.email,
            fullName: savedRow.full_name || '',
            allottedRole: savedRow.allotted_role || allottedRole,
            department: savedRow.department || '',
            phone: savedRow.phone || '',
            school: savedRow.school || '',
            grade: savedRow.grade || '',
            upiId: savedRow.upi_id || '',
            instagram: savedRow.instagram || '',
            onboarded: Boolean(savedRow.onboarded),
            onboardedAt: savedRow.onboarded_at || null,
            createdAt: savedRow.created_at,
          },
          message: `${fullName || email} added to Secretariat Roster as ${allottedRole}.`,
        });
      }
      return NextResponse.json({ status: 'error', message: 'Supabase unavailable.' }, { status: 500 });
    }

    if (action === 'ADMIN_APPROVE_SECRETARIAT_MEMBER') {
      const id = String(body.id || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      if (!id && !email) {
        return NextResponse.json({ status: 'error', message: 'Member ID or email required.' }, { status: 400 });
      }
      if (supabase) {
        const nowIso = new Date().toISOString();
        let q = supabase.from('secretariat_roster').update({
          onboarded: true,
          onboarded_at: nowIso,
          updated_at: nowIso,
        });
        if (id) q = q.eq('id', id);
        else q = q.ilike('email', email);
        const { error: updErr } = await q;
        if (updErr) {
          return NextResponse.json({ status: 'error', message: updErr.message }, { status: 500 });
        }
        if (email) {
          await supabase
            .from('secretariat_applications')
            .update({ status: 'Accepted' })
            .ilike('email', email);
        }
      }
      return NextResponse.json({ status: 'success', message: 'Secretariat member approved!' });
    }

    if (action === 'ADMIN_DELETE_SECRETARIAT_MEMBER') {
      const id = String(body.id || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      if (!id && !email) {
        return NextResponse.json({ status: 'error', message: 'Member ID or email required.' }, { status: 400 });
      }
      if (supabase) {
        let q = supabase.from('secretariat_roster').delete();
        if (id) q = q.eq('id', id);
        else q = q.ilike('email', email);
        const { error: delErr } = await q;
        if (delErr) {
          return NextResponse.json({ status: 'error', message: delErr.message }, { status: 500 });
        }
      }
      return NextResponse.json({ status: 'success', message: 'Secretariat member removed.' });
    }

    // 0a2. DELEGATION CUSTOM QUOTE UPDATE (Secretariat sets custom price for 15+ delegation)
    if (action === 'ADMIN_UPDATE_DELEGATION_QUOTE') {
      const delegationId = String(body.delegationId || body.id || '').trim();
      const quotedFee = String(body.quotedFee || body.totalAmount || '').trim();
      const paymentStatus = String(body.paymentStatus || '').trim().toUpperCase();
      if (!delegationId) {
        return NextResponse.json({ status: 'error', message: 'Delegation ID is required.' }, { status: 400 });
      }
      if (supabase) {
        try {
          const patch = {};
          if (quotedFee) patch.total_amount = quotedFee;
          if (paymentStatus) patch.payment_status = paymentStatus;
          if (Object.keys(patch).length > 0) {
            await Promise.allSettled([
              supabase.from('delegations').update(patch).or(`delegation_id.eq.${delegationId},id.eq.${delegationId}`),
              supabase.from('delegation_applications').update(patch).or(`delegation_id.eq.${delegationId},id.eq.${delegationId}`),
            ]);
          }
          adminDataCache = null;
        } catch (e) {
          console.warn('[Supabase] Delegation quote update notice:', e.message);
        }
      }
      return NextResponse.json({
        status: 'success',
        delegationId,
        quotedFee,
        message: `Delegation ${delegationId} quote updated to ${quotedFee || 'Custom Quote'}.`,
      });
    }

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

    // 0c2. TEAM APPLICATION MANAGEMENT: ADMIN_UPDATE_APPLICANT_STATUS
    if (action === 'ADMIN_UPDATE_APPLICANT_STATUS') {
      const { appId, roleType, email, fullName, position, newStatus } = body;
      
      // 1. Update in Supabase
      if (supabase) {
        try {
          const tableName = roleType === 'OC' ? 'oc_applications' : roleType === 'SEC' ? 'secretariat_applications' : 'eb_applications';
          const patch = { status: newStatus };
          if (roleType === 'OC' && (newStatus === 'Approved' || newStatus === 'Accepted')) {
            patch.payment_status = 'VERIFIED';
          }
          await supabase.from(tableName).update(patch).or(`app_id.eq.${appId},email.eq.${email}`);
        } catch (err) {
          console.warn("[Supabase] Applicant status update notice:", err.message);
        }
      }

      // 2. Sync to Google Apps Script & dispatch official offer letter if Accepted
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_ACCEPT_APPLICANT',
          adminKey: ADMIN_KEY,
          appId,
          roleType,
          email,
          fullName,
          position: position || (roleType === 'OC' ? 'Organizing Committee' : roleType === 'EB' ? 'Executive Board' : 'Secretariat'),
          status: newStatus,
        }),
      }).catch(() => {});

      return NextResponse.json({ status: 'success', appId, newStatus, message: `Applicant updated to ${newStatus}` });
    }

    if (action === 'ADMIN_DELETE_APPLICATION' || action === 'DELETE_APPLICATION') {
      const { appId, roleType, email } = body;
      adminDataCache = null;

      const cleanAppId = appId ? String(appId).trim() : '';
      const cleanEmail = email ? String(email).trim().toLowerCase() : '';

      if (cleanAppId) memoryDeletedIds.add(cleanAppId);
      if (cleanEmail) memoryDeletedIds.add(cleanEmail);

      if (supabase) {
        try {
          const rType = (roleType || '').toUpperCase();
          const targetTables = rType === 'OC' ? ['oc_applications'] : rType === 'SEC' || rType === 'SECRETARIAT' ? ['secretariat_applications'] : rType === 'EB' ? ['eb_applications'] : ['oc_applications', 'secretariat_applications', 'eb_applications'];

          for (const tableName of targetTables) {
            if (cleanAppId) {
              await supabase.from(tableName).delete().or(`app_id.eq.${cleanAppId},id.eq.${cleanAppId}`);
            }
            if (cleanEmail) {
              await supabase.from(tableName).delete().ilike('email', cleanEmail);
            }
          }
        } catch (err) {
          console.warn("[Supabase] Delete application notice:", err.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'DELETE_APPLICATION',
          adminKey: ADMIN_KEY,
          appId: cleanAppId,
          roleType: roleType || 'OC',
          email: cleanEmail,
        }),
      }).catch(() => {});

      return NextResponse.json({ status: 'success', appId: cleanAppId, message: 'Application deleted successfully' });
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
      const referralCodes = Array.isArray(body.settings?.referralCodes)
        ? body.settings.referralCodes
        : normalized.referralCodes || [];
      if (supabase) {
        // Save all pathway toggles & pricing to public.site_settings (primary schema table)
        try {
          await supabase.from('site_settings').upsert({
            id: 'global',
            registrations_open: normalized.registrationsOpen,
            delegate_open: normalized.delegateOpen,
            delegation_open: normalized.delegationOpen,
            oc_open: normalized.ocOpen,
            eb_open: normalized.ebOpen,
            socials_open: normalized.socialsOpen,
            secretariat_open: normalized.secretariatOpen,
            round_name: normalized.roundName,
            delegate_fee: normalized.delegateFee,
            delegation_fee: normalized.delegationFee,
            oc_fee_full: normalized.ocFeeFull,
            oc_fee_no_transport: normalized.ocFeeNoTransport,
            oc_fee_basic: normalized.ocFeeBasic,
            socials_fee: normalized.socialsFee,
            upi_id: normalized.upiId,
            upi_payee: normalized.upiPayee,
            updated_at: new Date().toISOString(),
          });
        } catch (sbErr) {
          console.warn("Supabase site_settings update notice:", sbErr.message);
        }

        // Also sync extended conference metadata to system_settings (preserving Secretariat referral codes!)
        try {
          let mergedReferralCodes = referralCodes;
          try {
            const { data: existingSys } = await supabase
              .from('system_settings')
              .select('referral_codes')
              .eq('id', 'global')
              .maybeSingle();
            const existingArr = Array.isArray(existingSys?.referral_codes) ? existingSys.referral_codes : [];
            if (!Array.isArray(body.settings?.referralCodes) || body.settings.referralCodes.length === 0) {
              mergedReferralCodes = existingArr;
            } else {
              const incomingMap = new Map(
                referralCodes.map((c) => [String(c.code || '').trim().toUpperCase(), c])
              );
              for (const ex of existingArr) {
                const k = String(ex?.code || '').trim().toUpperCase();
                if (k && ex?.type === 'SECRETARIAT_CASH' && !incomingMap.has(k)) {
                  incomingMap.set(k, ex);
                }
              }
              mergedReferralCodes = Array.from(incomingMap.values());
            }
          } catch (_) {}

          await supabase.from('system_settings').upsert({
            id: 'global',
            registrations_open: normalized.registrationsOpen,
            round_name: normalized.roundName,
            delegate_base_fee: normalized.delegateFee,
            conference_dates: normalized.conferenceDates,
            conference_venue: normalized.conferenceVenue,
            venue_address: normalized.venueAddress,
            venue_map_url: normalized.venueMapUrl,
            total_prize_pool: normalized.totalPrizePool || normalized.prizePool,
            delegation_prize_pool: normalized.delegationPrizePool,
            prize_pool: normalized.totalPrizePool || normalized.prizePool,
            referral_codes: mergedReferralCodes,
            committee_capacities: normalized.committeeCapacities,
            committee_documents: {
              ...(normalized.committeeDocuments || {}),
              __liabilityFormUrl: normalized.liabilityFormUrl || "/liability-waiver.pdf",
            },
            updated_at: new Date().toISOString(),
          });
        } catch (sbErr) {
          console.warn("Supabase system_settings update notice:", sbErr.message);
        }
      }

      adminDataCache = null;

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_UPDATE_SETTINGS',
          adminKey: ADMIN_KEY,
          settings: normalized,
          conferenceDates: normalized.conferenceDates,
          conferenceVenue: normalized.conferenceVenue,
          venueAddress: normalized.venueAddress,
          totalPrizePool: normalized.totalPrizePool || normalized.prizePool,
          delegationPrizePool: normalized.delegationPrizePool,
          prizePool: normalized.totalPrizePool || normalized.prizePool,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', settings: { ...normalized, referralCodes } });
    }

    // 1b. UPDATE_REFERRAL_CODES
    if (action === 'UPDATE_REFERRAL_CODES') {
      const referralCodes = Array.isArray(body.referralCodes) ? body.referralCodes : [];
      if (supabase) {
        try {
          await supabase.from('system_settings').upsert({
            id: 'global',
            referral_codes: referralCodes,
            updated_at: new Date().toISOString()
          });
        } catch (sbErr) {
          console.warn("Supabase referral codes update notice:", sbErr.message);
        }
      }

      adminDataCache = null;
      return NextResponse.json({ status: 'success', referralCodes });
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

        // ADMIN_TEST_APPS_SCRIPT: Ping Apps Script to check connection and deployment permissions
    if (action === 'ADMIN_TEST_APPS_SCRIPT' || action === 'TEST_APPS_SCRIPT') {
      try {
        const asRes = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'PING', adminKey: ADMIN_KEY }),
        });
        const text = await asRes.text();
        if (asRes.status === 403 || text.includes('You need permission') || text.includes('accounts.google.com') || text.includes('docs-drivelogo')) {
          return NextResponse.json({
            status: 'warning',
            connected: false,
            code: 'APPS_SCRIPT_ACCESS_RESTRICTED',
            message: 'Google Apps Script deployment access is restricted (HTTP 403: "You need permission"). In Google Apps Script, click Deploy > Manage deployments > Edit (pencil icon) and set "Who has access" to "Anyone", then click Deploy to authorize email dispatches.',
          }, { status: 403 });
        }
        return NextResponse.json({
          status: 'success',
          connected: true,
          message: 'Connected to Resolve MUN Google Apps Script mailing engine successfully!',
        });
      } catch (err) {
        return NextResponse.json({
          status: 'error',
          connected: false,
          message: 'Apps Script connection test failed: ' + err.message,
        }, { status: 500 });
      }
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

      // Update Supabase underlying `delegate_applications` directly with schema-exact columns
      if (supabase) {
        try {
          const patch = { updated_at: new Date().toISOString() };

          const nameVal = body.fullName !== undefined ? body.fullName : body.name;
          if (nameVal !== undefined) patch.name = nameVal;
          if (body.phone !== undefined) patch.phone = body.phone;
          const instVal = body.institution !== undefined ? body.institution : body.school;
          if (instVal !== undefined) patch.institute = instVal;
          if (body.grade !== undefined) patch.grade = body.grade;
          if (body.dob !== undefined) patch.dob = body.dob;
          if (body.address !== undefined) patch.address = body.address;
          if (body.transport !== undefined) patch.transport = body.transport;
          if (body.experience !== undefined) patch.experience = body.experience;
          if (body.pref1_committee !== undefined) patch.pref1_committee = body.pref1_committee;
          if (body.pref1_country !== undefined) patch.pref1_country = body.pref1_country;
          if (body.pref2_committee !== undefined) patch.pref2_committee = body.pref2_committee;
          if (body.pref2_country !== undefined) patch.pref2_country = body.pref2_country;
          if (body.pref3_committee !== undefined) patch.pref3_committee = body.pref3_committee;
          if (body.pref3_country !== undefined) patch.pref3_country = body.pref3_country;
          if (body.preferences_updated_count !== undefined) patch.preferences_updated_count = Number(body.preferences_updated_count || 0);
          else if (body.preferencesUpdatedCount !== undefined) patch.preferences_updated_count = Number(body.preferencesUpdatedCount || 0);
          if (body.allocatedCommittee !== undefined) patch.allocated_committee = body.allocatedCommittee;
          if (body.allocatedCountry !== undefined) patch.allocated_country = body.allocatedCountry;
          if (body.paymentUTR !== undefined) patch.payment_utr = body.paymentUTR;
          if (body.paymentStatus !== undefined) {
            const rawPs = String(body.paymentStatus || '').toUpperCase();
            const ps = rawPs.includes('FAIL') || rawPs.includes('REJECT')
              ? 'FAILED'
              : rawPs === 'VERIFIED' || rawPs.includes('VERIF')
              ? 'VERIFIED'
              : 'PENDING_VERIFICATION';
            patch.payment_status = ps;
            if (ps === 'FAILED') patch.status = 'PAYMENT_FAILED';
          }
          if (body.allocatedCommittee && !patch.status) {
            patch.status = 'ALLOTTED';
          }

          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          if (Object.keys(patch).length > 1) {
            let q = supabase.from('delegate_applications').update(patch);
            if (isUuid) q = q.eq('id', targetId);
            else if (targetId && targetEmail) q = q.or(`reg_id.eq.${targetId},email.ilike.${targetEmail}`);
            else if (targetId) q = q.or(`reg_id.eq.${targetId},email.ilike.${targetId}`);
            else if (targetEmail) q = q.ilike('email', targetEmail);
            const { error: updErr } = await q;
            if (updErr) console.warn("[Supabase] Update delegate error:", updErr.message);
          }
          adminDataCache = null;
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
          const allotPatch = {
            allocated_committee: body.committee,
            allocated_country: body.country,
            status: 'ALLOTTED',
            updated_at: new Date().toISOString(),
          };

          let q = supabase.from('delegate_applications').update(allotPatch);
          if (isUuid) {
            q = q.eq('id', targetId);
          } else if (targetId && targetEmail) {
            q = q.or(`reg_id.eq.${targetId},email.ilike.${targetEmail}`);
          } else if (targetId) {
            q = q.eq('reg_id', targetId);
          } else if (targetEmail) {
            q = q.ilike('email', targetEmail);
          }
          await q;
          adminDataCache = null;
        } catch (e) {
          console.warn("[Supabase] Allotment notice:", e.message);
        }
      }

      // Fetch delegate metadata for email dispatch if missing
      let delEmail = targetEmail;
      let delName = body.fullName || body.name || '';
      let delRegId = targetId;
      if (supabase && (!delEmail || !delName || !delRegId)) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          let dq = supabase.from('delegate_applications').select('name, email, reg_id');
          if (isUuid) dq = dq.eq('id', targetId);
          else if (targetId && targetEmail) dq = dq.or(`reg_id.eq.${targetId},email.ilike.${targetEmail}`);
          else if (targetId) dq = dq.eq('reg_id', targetId);
          else if (targetEmail) dq = dq.ilike('email', targetEmail);
          const { data: dData } = await dq.limit(1).maybeSingle();
          if (dData) {
            delEmail = delEmail || dData.email;
            delName = delName || dData.name;
            delRegId = delRegId || dData.reg_id;
          }
        } catch (_) {}
      }

      const shortAllotId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(delRegId || ''))
        ? `RM-${String(delRegId).replace(/-/g, '').slice(0, 4).toUpperCase()}`
        : String(delRegId || 'RM-CONFIRMED').replace(/^RM26-DEL-/i, 'RM-');
      const allotQrPayload = `RESOLVE26:${shortAllotId}:${delEmail || ''}:${body.committee || ''}`;
      const allotQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&color=000000&bgcolor=ffffff&data=${encodeURIComponent(allotQrPayload)}`;

      // Send ONLY ONE official Allocation & QR Desk Pass email
      let dispatchStatus = 'sent';
      if (delEmail && delEmail.includes('@')) {
        const allotSubject = `Official Allocation: ${body.committee} (${body.country}) — Resolve MUN 2.0`;
        const allotText = `Your official committee and country allocation for Resolve MUN 2.0 is now confirmed:\n\nCommittee: ${body.committee}\nPortfolio / Country: ${body.country}\nDelegate ID: ${shortAllotId}\n\nPlease show the attached QR Gate Pass at the registration desk at Northfield International School on 26, 27 December 2026 for check-in.`;
        const allotHtml = buildResolveEmailHtml({
          eyebrow: 'Step 3 of 3 · Official Committee Allocation',
          title: `${body.committee} — ${body.country}`,
          recipientName: delName || 'Delegate',
          bodyText: allotText,
          ctaLabel: 'Open Digital Gate Pass',
          ctaUrl: 'https://resolvemun.in/dashboard',
          highlightBox: {
            label: 'Allotted Committee & Portfolio',
            value: `${body.committee} · ${body.country} (${shortAllotId})`,
          },
          qrCodeUrl: allotQrUrl,
          qrCaption: `Show this QR pass (${shortAllotId}) at the registration desk at Northfield International School`,
        });

        try {
          if (process.env.RESEND_API_KEY) {
            const fromAddr = process.env.RESEND_FROM_EMAIL || 'Resolve MUN 2.0 <onboarding@resend.dev>';
            const r = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromAddr,
                to: [delEmail],
                subject: allotSubject,
                text: allotText,
                html: allotHtml,
              }),
            });
            dispatchStatus = r.ok ? 'sent' : 'failed';
          } else {
            const asRes = await fetch(APPS_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'ADMIN_SEND_CUSTOM_EMAIL',
                adminKey: ADMIN_KEY,
                subject: allotSubject,
                messageBody: allotText,
                htmlBody: allotHtml,
                email: delEmail,
                recipients: [{ email: delEmail, name: delName || 'Delegate' }],
              }),
            });
            dispatchStatus = asRes.ok ? 'sent' : 'failed';
          }
        } catch (err) {
          dispatchStatus = 'failed: ' + err.message;
        }
      }

      return NextResponse.json({
        status: 'success',
        message: `Allotted ${body.country} in ${body.committee} to delegate`,
        dispatchStatus,
      });
    }

    // 4b. GOD-MODE: ADMIN_CLEAR_ALLOCATION / ADMIN_DEALLOCATE_DELEGATE
    if (action === 'ADMIN_CLEAR_ALLOCATION' || action === 'ADMIN_DEALLOCATE_DELEGATE') {
      const targetId = (body.regId || body.delegateId || body.id || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();

      // In-memory update
      const memoryKey = targetId || targetEmail;
      if (memoryKey) {
        const existing = memoryUpdatedDelegates.get(memoryKey) || {};
        memoryUpdatedDelegates.set(memoryKey, {
          ...existing,
          allocatedCommittee: '',
          allocatedCountry: '',
          status: 'PENDING',
        });
      }

      if (supabase) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          const delegatesClear = {
            allocated_committee: null,
            allocated_country: null,
            status: 'PENDING',
          };
          const legacyClear = {
            ...delegatesClear,
            updated_at: new Date().toISOString(),
          };

          let q1 = supabase.from('delegates').update(delegatesClear);
          let q2 = supabase.from('delegate_applications').update(legacyClear);

          if (isUuid) {
            q1 = q1.eq('id', targetId);
            q2 = q2.eq('id', targetId);
          } else if (targetId.startsWith('RM26-DEL-')) {
            q1 = q1.eq('delegate_id', targetId);
            q2 = q2.eq('reg_id', targetId);
          } else if (targetEmail) {
            q1 = q1.ilike('email', targetEmail);
            q2 = q2.ilike('email', targetEmail);
          }
          await Promise.allSettled([q1, q2]);
        } catch (e) {
          console.warn("[Supabase] Deallocation notice:", e.message);
        }
      }

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...body, action: 'ADMIN_CLEAR_ALLOCATION', adminKey: ADMIN_KEY }),
      }).catch(() => { });

      return NextResponse.json({
        status: 'success',
        message: `Cleared allocation for delegate`,
      });
    }

    // 5. GOD-MODE: ADMIN_VERIFY_PAYMENT
    if (action === 'ADMIN_VERIFY_PAYMENT') {
      const targetId = (body.regId || body.delegateId || body.id || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();
      const targetName = (body.fullName || body.name || 'Delegate').trim();
      const newStatus = (body.paymentStatus || 'VERIFIED').toUpperCase();
      const isVer = newStatus === 'VERIFIED';
      const statusVal = isVer ? 'VERIFIED' : 'FAILED';
      const verifiedVal = isVer ? 'verified' : 'Failed';
      const regStatusVal = isVer ? 'Confirmed' : 'PAYMENT_FAILED';

      adminDataCache = null;

      if (targetId) {
        const existing = memoryUpdatedDelegates.get(targetId) || {};
        memoryUpdatedDelegates.set(targetId, {
          ...existing,
          paymentStatus: statusVal,
          paymentVerified: verifiedVal,
          status: regStatusVal,
        });
      }
      if (targetEmail) {
        const existing = memoryUpdatedDelegates.get(targetEmail) || {};
        memoryUpdatedDelegates.set(targetEmail, {
          ...existing,
          paymentStatus: statusVal,
          paymentVerified: verifiedVal,
          status: regStatusVal,
        });
      }

      let resolvedEmail = targetEmail;
      let resolvedName = targetName;

      if (supabase) {
        try {
          const payPatch = {
            payment_status: statusVal,
            status: regStatusVal,
            updated_at: new Date().toISOString(),
          };
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

          let filter = '';
          if (isUuid) {
            filter = `id.eq.${targetId}`;
          } else if (targetId && targetEmail) {
            filter = `reg_id.eq.${targetId},email.ilike.${targetEmail}`;
          } else if (targetId) {
            filter = `reg_id.eq.${targetId}`;
          } else if (targetEmail) {
            filter = `email.ilike.${targetEmail}`;
          }

          // Lookup email/name/reg_id so notification email & QR always have exact short ID
          let resolvedRegId = targetId;
          if (filter) {
            const { data: foundRow } = await supabase.from('delegate_applications').select('email, name, reg_id').or(filter).limit(1).maybeSingle();
            if (foundRow?.email && !resolvedEmail) resolvedEmail = foundRow.email.trim().toLowerCase();
            if (foundRow?.name && (!resolvedName || resolvedName === 'Delegate')) resolvedName = foundRow.name;
            if (foundRow?.reg_id) resolvedRegId = foundRow.reg_id;
          }

          if (filter) {
            const { error: payErr } = await supabase.from('delegate_applications').update(payPatch).or(filter);
            if (payErr) console.warn("[Supabase] Payment verify error:", payErr.message);
          }

          const shortVerifyId = /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(resolvedRegId || ''))
            ? `RM-${String(resolvedRegId).replace(/-/g, '').slice(0, 4).toUpperCase()}`
            : String(resolvedRegId || 'RM-CONFIRMED').replace(/^RM26-DEL-/i, 'RM-');

          // Attach shortVerifyId for email block below
          body._resolvedShortId = shortVerifyId;
        } catch (e) {
          console.warn("[Supabase] Payment verify notice:", e.message);
        }
      }

      const shortIdForMail = body._resolvedShortId || String(targetId || 'RM-CONFIRMED').replace(/^RM26-DEL-/i, 'RM-');
      const verifyQrPayload = `RESOLVE26:${shortIdForMail}:${resolvedEmail || ''}`;
      const verifyQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&color=000000&bgcolor=ffffff&data=${encodeURIComponent(verifyQrPayload)}`;

      // Send ONLY ONE official email notification to the delegate (Verified with QR + Allocation Out Soon, or Failed)
      let emailDispatched = false;
      if (resolvedEmail && resolvedEmail.includes('@')) {
        const subject = isVer
          ? `Payment Verified & QR Pass (${shortIdForMail}) — Allocation Out Soon`
          : `Action Required: Payment Verification Failed (${shortIdForMail})`;
        const messageBody = isVer
          ? `Your UPI payment for Resolve MUN 2.0 (26, 27 December 2026 at Northfield International School, Hyderabad) has been verified and your delegate seat is officially confirmed.\n\nYour committee and country allocation will be out soon. Below is your official Digital QR Entry Pass (${shortIdForMail}) — keep it handy for check-in at the registration desk.`
          : `We could not verify the UPI payment / UTR submitted with your Resolve MUN 2.0 registration (${shortIdForMail}). Your payment status has been marked as FAILED and your Digital Gate Pass is currently on hold.\n\nPlease reply to this email or message us on WhatsApp at +91 92121 07797 with your valid 12-digit UPI UTR and payment screenshot so we can verify your seat immediately.`;

        try {
          const htmlBody = buildResolveEmailHtml({
            eyebrow: isVer ? 'Step 2 of 3 · Payment Verified' : 'Action Required · Payment Failed',
            title: isVer ? 'Payment Verified — Allocation Out Soon' : 'Payment Verification Failed',
            recipientName: resolvedName,
            bodyText: messageBody,
            ctaLabel: isVer ? 'Open Digital Gate Pass' : 'Check Dashboard Status',
            ctaUrl: 'https://resolvemun.in/dashboard',
            highlightBox: {
              label: 'Delegate ID & Payment Status',
              value: `${shortIdForMail} · ${isVer ? 'PAYMENT VERIFIED · ALLOCATION OUT SOON' : 'PAYMENT FAILED'}`,
            },
            qrCodeUrl: isVer ? verifyQrUrl : null,
            qrCaption: `Official Digital Gate Pass (${shortIdForMail}) · Show at the registration desk`,
          });

          if (process.env.RESEND_API_KEY) {
            const fromAddr = process.env.RESEND_FROM_EMAIL || 'Resolve MUN 2.0 <onboarding@resend.dev>';
            const r = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: fromAddr,
                to: [resolvedEmail],
                subject,
                text: messageBody,
                html: htmlBody,
              }),
            });
            emailDispatched = r.ok;
          } else {
            const mailRes = await fetch(APPS_SCRIPT_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'ADMIN_SEND_CUSTOM_EMAIL',
                adminKey: ADMIN_KEY,
                subject,
                messageBody,
                htmlBody,
                email: resolvedEmail,
                recipients: [{ email: resolvedEmail, name: resolvedName }],
              }),
            });
            emailDispatched = mailRes.ok;
          }
        } catch (mailErr) {
          console.warn('[ADMIN_VERIFY_PAYMENT] Email dispatch error:', mailErr.message);
        }
      }

      return NextResponse.json({
        status: 'success',
        paymentStatus: statusVal,
        emailDispatched,
        message: `Payment marked ${statusVal}${emailDispatched ? ` & email sent to ${resolvedEmail}` : ''}`,
      });
    }

    // 6. GOD-MODE: ADMIN_DELETE_RECORD / ADMIN_DELETE_DELEGATE
    if (action === 'ADMIN_DELETE_RECORD' || action === 'ADMIN_DELETE_DELEGATE') {
      const targetId = (body.regId || body.recordId || body.id || '').trim();
      let targetEmail = (body.email || '').trim().toLowerCase();
      let targetFileUrl = (body.fileUrl || body.paymentScreenshotURL || '').trim();

      if (targetId) {
        memoryDeletedIds.add(targetId);
        memoryAddedDelegates.delete(targetId);
        memoryUpdatedDelegates.delete(targetId);
        inMemoryDraftLeads.delete(targetId);
      }

      if (supabase) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

          // 1. Look up existing record first so we capture email, reg_id, and file URLs before deleting
          let findQ = supabase.from('delegate_applications').select('id, reg_id, email, phone, payment_screenshot_url');
          if (isUuid) findQ = findQ.eq('id', targetId);
          else if (targetId && targetEmail) findQ = findQ.or(`reg_id.eq.${targetId},email.ilike.${targetEmail}`);
          else if (targetId) findQ = findQ.eq('reg_id', targetId);
          else if (targetEmail) findQ = findQ.ilike('email', targetEmail);

          const { data: foundRow } = await findQ.limit(1).maybeSingle();
          if (foundRow) {
            if (foundRow.email && !targetEmail) targetEmail = foundRow.email.trim().toLowerCase();
            if (foundRow.payment_screenshot_url && !targetFileUrl) targetFileUrl = foundRow.payment_screenshot_url;
            if (foundRow.reg_id) {
              memoryDeletedIds.add(foundRow.reg_id);
              memoryAddedDelegates.delete(foundRow.reg_id);
              memoryUpdatedDelegates.delete(foundRow.reg_id);
            }
            if (foundRow.phone) inMemoryDraftLeads.delete(String(foundRow.phone).trim());
          }

          if (targetEmail) {
            memoryDeletedIds.add(targetEmail);
            memoryUpdatedDelegates.delete(targetEmail);
            inMemoryDraftLeads.delete(targetEmail);
          }

          // 2. Wipe uploaded payment screenshot from Supabase Storage bucket (`resolve-uploads`)
          if (targetFileUrl && targetFileUrl.includes('/resolve-uploads/')) {
            try {
              const storagePath = decodeURIComponent(targetFileUrl.split('/resolve-uploads/')[1].split('?')[0]);
              if (storagePath) {
                await supabase.storage.from('resolve-uploads').remove([storagePath]);
              }
            } catch (_) {}
          }

          // 3. Delete delegate rows completely from Supabase so it's as if they never filled the form
          const delOps = [];
          if (foundRow?.id) {
            delOps.push(supabase.from('delegate_applications').delete().eq('id', foundRow.id));
          } else if (isUuid) {
            delOps.push(supabase.from('delegate_applications').delete().eq('id', targetId));
          } else if (targetId) {
            delOps.push(supabase.from('delegate_applications').delete().eq('reg_id', targetId));
          }
          if (targetEmail) {
            delOps.push(supabase.from('delegate_applications').delete().ilike('email', targetEmail));
            delOps.push(supabase.from('draft_leads').delete().ilike('email', targetEmail));
          }
          await Promise.allSettled(delOps);
        } catch (e) {
          console.warn("[Supabase] Delete delegate notice:", e.message);
        }
      }

      adminDataCache = null;

      // 4. Wipe from Google Sheets (Registrations + Abandoned_Leads) AND trash file in Google Drive
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_RECORD',
          adminKey: ADMIN_KEY,
          sheetName: body.sheetName || 'Registrations',
          recordId: targetId || targetEmail,
          email: targetEmail,
          fileUrl: targetFileUrl,
          wipeDrive: true,
        }),
      }).catch(() => { });

      return NextResponse.json({
        status: 'success',
        message: 'Delegate registration, form drafts, and Drive/Storage files completely wiped.',
      });
    }

    // 6a2. USER & DATA PURGE: ADMIN_DELETE_USER / USER_DELETE_SELF
    if (action === 'ADMIN_DELETE_USER' || action === 'USER_DELETE_SELF') {
      const targetEmail = (body.email || '').trim().toLowerCase();
      const targetId = (body.id || body.userId || body.uid || '').trim();

      if (!targetEmail && !targetId) {
        return NextResponse.json({ status: 'error', message: 'User email or ID required' }, { status: 400 });
      }

      if (targetEmail) memoryDeletedIds.add(targetEmail);
      if (targetId) memoryDeletedIds.add(targetId);

      if (supabase) {
        try {
          const deletes = [];
          if (targetEmail) {
            deletes.push(supabase.from('profiles').delete().ilike('email', targetEmail));
            deletes.push(supabase.from('delegates').delete().ilike('email', targetEmail));
            deletes.push(supabase.from('delegations').delete().ilike('adviser_email', targetEmail));
            deletes.push(supabase.from('delegate_applications').delete().ilike('email', targetEmail));
            deletes.push(supabase.from('eb_applications').delete().ilike('email', targetEmail));
            deletes.push(supabase.from('oc_applications').delete().ilike('email', targetEmail));
            deletes.push(supabase.from('secretariat_applications').delete().ilike('email', targetEmail));
            deletes.push(supabase.from('delegation_applications').delete().ilike('advisor_email', targetEmail));
          }
          if (targetId) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
            if (isUuid) {
              deletes.push(supabase.from('profiles').delete().eq('id', targetId));
              deletes.push(supabase.from('delegates').delete().eq('user_id', targetId));
              deletes.push(supabase.from('delegate_applications').delete().eq('user_id', targetId));
            }
          }
          await Promise.allSettled(deletes);
        } catch (delErr) {
          console.warn("[Supabase] Purge user notice:", delErr.message);
        }
      }

      adminDataCache = null;

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_USER',
          adminKey: ADMIN_KEY,
          email: targetEmail,
          userId: targetId,
        }),
      }).catch(() => { });

      return NextResponse.json({ status: 'success', message: 'User and all associated registrations purged successfully' });
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

      if (supabase) {
        try {
          const ops = [];
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          if (isUuid) ops.push(supabase.from('draft_leads').delete().eq('id', targetId));
          if (targetEmail) ops.push(supabase.from('draft_leads').delete().ilike('email', targetEmail));
          if (targetPhone) ops.push(supabase.from('draft_leads').delete().eq('phone', targetPhone));
          if (ops.length > 0) await Promise.allSettled(ops);
        } catch (_) {}
      }
      adminDataCache = null;

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
            supabase.from('delegate_applications').delete().ilike('email', '%test%'),
            supabase.from('delegate_applications').delete().ilike('email', '%example.com%'),
            supabase.from('draft_leads').delete().ilike('email', '%test%'),
            supabase.from('draft_leads').delete().ilike('email', '%example.com%'),
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

    // 7. GOD-MODE: RECORD_CHECK_IN (Ultra-fast Gatekeeper & Bus Scanner)
    if (action === 'RECORD_CHECK_IN') {
      const targetId = (body.delegateId || body.regId || '').trim();
      const targetEmail = (body.email || '').trim().toLowerCase();
      const dayStr = body.day || 'Day 1';
      const scanMode = String(body.scanMode || 'GATE').toUpperCase();
      const isEntry = (body.actionType || 'ENTRY') === 'ENTRY';
      const statusValue = isEntry ? 'Present' : 'Absent';

      const dayCol = dayStr === 'Day 2' ? 'check_in_day2' : dayStr === 'Day 3' ? 'check_in_day3' : 'check_in_day1';
      const dayKey =
        scanMode === 'BUS'
          ? dayStr === 'Day 2'
            ? 'busDay2'
            : 'busDay1'
          : dayStr === 'Day 2'
          ? 'checkInDay2'
          : dayStr === 'Day 3'
          ? 'checkInDay3'
          : 'checkInDay1';

      if (targetId) {
        const existing = memoryUpdatedDelegates.get(targetId) || {};
        memoryUpdatedDelegates.set(targetId, { ...existing, [dayKey]: statusValue });
      }

      if (supabase && (targetId || targetEmail)) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          const nowIso = new Date().toISOString();
          const ops = [];

          if (scanMode !== 'BUS') {
            // 1. Update underlying delegate_applications table directly for Gate check-in
            let qLeg = supabase.from('delegate_applications').update({ [dayCol]: statusValue, last_check_in: nowIso, updated_at: nowIso });
            if (isUuid) qLeg = qLeg.eq('id', targetId);
            else if (targetEmail) qLeg = qLeg.ilike('email', targetEmail);
            else qLeg = qLeg.or(`reg_id.eq.${targetId},reg_id.eq.${targetId.replace(/^RM26-DEL-/i, 'RM-')},email.ilike.${targetId}`);
            ops.push(qLeg);

            // 2. Update OC / Secretariat / EB tables if scanning a team pass
            if (targetId.includes('-OC-') || targetEmail) {
              let qOc = supabase.from('oc_applications').update({ [dayCol]: statusValue, last_check_in: nowIso });
              if (targetEmail) qOc = qOc.ilike('email', targetEmail);
              else qOc = qOc.eq('app_id', targetId);
              ops.push(qOc);
            }
            if (targetId.includes('-SEC-') || targetEmail) {
              let qSec = supabase.from('secretariat_applications').update({ [dayCol]: statusValue, last_check_in: nowIso });
              if (targetEmail) qSec = qSec.ilike('email', targetEmail);
              else qSec = qSec.eq('app_id', targetId);
              ops.push(qSec);
            }
            if (targetId.includes('-EB-') || targetEmail) {
              let qEb = supabase.from('eb_applications').update({ [dayCol]: statusValue, last_check_in: nowIso });
              if (targetEmail) qEb = qEb.ilike('email', targetEmail);
              else qEb = qEb.eq('app_id', targetId);
              ops.push(qEb);
            }
          }

          // 3. Write audit log entry to check_in_logs (tracks GATE vs BUS)
          ops.push(
            supabase.from('check_in_logs').insert({
              delegate_id: targetId,
              full_name: body.fullName || body.name || '',
              email: targetEmail || body.email || '',
              role: scanMode === 'BUS' ? `BUS_${body.role || 'DELEGATE'}` : body.role || 'DELEGATE',
              day: scanMode === 'BUS' ? `Bus ${dayStr}` : dayStr,
              action_type: isEntry ? 'ENTRY' : 'EXIT',
              verified_by: body.verifiedBy || (scanMode === 'BUS' ? 'Transport Bus Scanner' : 'Secretariat Desk'),
            })
          );

          await Promise.allSettled(ops);
          adminDataCache = null;
        } catch (e) {
          console.warn("[Supabase] Check-in persistence notice:", e.message);
        }
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

    // 8. DIPLOMATIC BROADCAST & CRM EMAIL DISPATCH
    if (action === 'DISPATCH_COMMUNICATION' || action === 'ADMIN_SEND_CUSTOM_EMAIL') {
      const recipientMode = body.recipientMode || 'SINGLE';
      const emailTo = (body.emailTo || body.email || '').trim().toLowerCase();
      const subject = (body.subject || 'Official Notice — Resolve MUN 2.0').trim();
      const message = (body.message || body.messageBody || '').trim();

      if (!subject || !message) {
        return NextResponse.json(
          { status: 'error', message: 'Subject and Message content are required.' },
          { status: 400 }
        );
      }

      let recipients = [];

      if (recipientMode === 'SINGLE') {
        if (!emailTo || !emailTo.includes('@')) {
          return NextResponse.json(
            { status: 'error', message: 'Please provide a valid destination email address.' },
            { status: 400 }
          );
        }
        recipients.push({ email: emailTo, name: body.name || 'Delegate' });
      } else if (recipientMode === 'ALL_DELEGATES') {
        if (supabase) {
          const [r1, r2] = await Promise.allSettled([
            supabase.from('delegates').select('full_name, email'),
            supabase.from('delegate_applications').select('name, email'),
          ]);
          const rows = [
            ...(r1.status === 'fulfilled' ? r1.value.data || [] : []),
            ...(r2.status === 'fulfilled' ? r2.value.data || [] : []),
          ];
          recipients = rows
            .map(d => ({ email: (d.email || '').trim().toLowerCase(), name: d.full_name || d.name || 'Delegate' }))
            .filter(r => r.email && r.email.includes('@'));
        }
      } else if (recipientMode === 'UNASSIGNED_DELEGATES') {
        if (supabase) {
          const [r1, r2] = await Promise.allSettled([
            supabase.from('delegates').select('full_name, email').is('allocated_committee', null),
            supabase.from('delegate_applications').select('name, email').is('allocated_committee', null),
          ]);
          const rows = [
            ...(r1.status === 'fulfilled' ? r1.value.data || [] : []),
            ...(r2.status === 'fulfilled' ? r2.value.data || [] : []),
          ];
          recipients = rows
            .map(d => ({ email: (d.email || '').trim().toLowerCase(), name: d.full_name || d.name || 'Delegate' }))
            .filter(r => r.email && r.email.includes('@'));
        }
      } else if (recipientMode === 'OC_APPLICANTS') {
        if (supabase) {
          const { data } = await supabase.from('oc_applications').select('full_name, email');
          if (data && data.length > 0) {
            recipients = data.map(d => ({ email: (d.email || '').trim().toLowerCase(), name: d.full_name || 'Applicant' })).filter(r => r.email && r.email.includes('@'));
          }
        }
      } else if (recipientMode === 'SEC_APPLICANTS') {
        if (supabase) {
          const { data } = await supabase.from('secretariat_applications').select('full_name, email');
          if (data && data.length > 0) {
            recipients = data.map(d => ({ email: (d.email || '').trim().toLowerCase(), name: d.full_name || 'Applicant' })).filter(r => r.email && r.email.includes('@'));
          }
        }
      } else if (recipientMode === 'EB_APPLICANTS') {
        if (supabase) {
          const { data } = await supabase.from('eb_applications').select('full_name, email');
          if (data && data.length > 0) {
            recipients = data.map(d => ({ email: (d.email || '').trim().toLowerCase(), name: d.full_name || 'Applicant' })).filter(r => r.email && r.email.includes('@'));
          }
        }
      }

      if (recipients.length === 0) {
        return NextResponse.json(
          { status: 'error', message: 'No valid recipient email addresses found for the selected audience.' },
          { status: 400 }
        );
      }

      // Deduplicate recipients by email
      const uniqueRecipients = [];
      const seenEmails = new Set();
      for (const r of recipients) {
        if (!seenEmails.has(r.email)) {
          seenEmails.add(r.email);
          uniqueRecipients.push(r);
        }
      }

      const asPayload = {
        action: 'ADMIN_SEND_CUSTOM_EMAIL',
        adminKey: ADMIN_KEY,
        subject: subject,
        messageBody: message,
        email: uniqueRecipients[0]?.email,
        recipients: uniqueRecipients,
      };

      try {
        const asRes = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(asPayload),
        });

        const text = await asRes.text();
        let parsed = null;
        try {
          parsed = JSON.parse(text);
        } catch (_) { }

        if (text.includes('You need permission to access this item') || text.includes('accounts.google.com') || text.includes('docs-drivelogo') || asRes.status === 403) {
          return NextResponse.json({
            status: 'error',
            code: 'APPS_SCRIPT_ACCESS_RESTRICTED',
            message: 'Google Apps Script deployment access is currently restricted (HTTP 403: "You need permission"). In Google Apps Script (extensions > Apps Script), click Deploy > Manage deployments > Edit (pencil icon) and set "Who has access" to "Anyone", then click Deploy to authorize email dispatches.',
          }, { status: 502 });
        }

        if (parsed && (parsed.status === 'success' || parsed.sentCount !== undefined)) {
          return NextResponse.json({
            status: 'success',
            message: `Official communiqué dispatched successfully to ${uniqueRecipients.length} recipient(s).`,
            sentCount: parsed.sentCount || uniqueRecipients.length,
          });
        }

        return NextResponse.json({
          status: 'success',
          message: `Official communiqué dispatched to ${uniqueRecipients.length} recipient(s).`,
        });
      } catch (dispatchErr) {
        return NextResponse.json({
          status: 'error',
          message: `Email dispatch delivery failed: ${dispatchErr.message}`,
        }, { status: 500 });
      }
    }

    // 9. ADMIN_HEALTH_CHECK — Live Supabase & Backend Diagnostics
    if (action === 'ADMIN_HEALTH_CHECK') {
      const report = { supabaseConnected: Boolean(supabase), tables: {}, settingsSynced: false };
      if (supabase) {
        const tableNames = ['site_settings', 'delegates', 'delegations', 'oc_applications', 'secretariat_applications', 'eb_applications', 'check_in_logs'];
        await Promise.all(
          tableNames.map(async (tbl) => {
            try {
              const { count, error } = await supabase.from(tbl).select('*', { count: 'exact', head: true });
              report.tables[tbl] = error ? { ok: false, error: error.message } : { ok: true, count: count ?? 0 };
            } catch (e) {
              report.tables[tbl] = { ok: false, error: e.message };
            }
          })
        );
        report.settingsSynced = Boolean(report.tables.site_settings?.ok);
      }
      return NextResponse.json({ status: 'success', health: report });
    }

    // 10. ADMIN_BULK_ACTION — Instant Master Control Operations
    if (action === 'ADMIN_BULK_ACTION') {
      const bulkType = body.bulkType || '';
      if (!supabase) {
        return NextResponse.json({ status: 'error', message: 'Supabase not configured' }, { status: 500 });
      }

      if (bulkType === 'CLOSE_ALL_REGISTRATIONS' || bulkType === 'OPEN_ALL_REGISTRATIONS') {
        const isOpen = bulkType === 'OPEN_ALL_REGISTRATIONS';
        await Promise.allSettled([
          supabase.from('site_settings').upsert({
            id: 'global',
            registrations_open: isOpen,
            delegate_open: isOpen,
            delegation_open: isOpen,
            oc_open: isOpen,
            secretariat_open: isOpen,
            updated_at: new Date().toISOString(),
          }),
          supabase.from('system_settings').upsert({
            id: 'global',
            registrations_open: isOpen,
            updated_at: new Date().toISOString(),
          }),
        ]);
        adminDataCache = null;
        return NextResponse.json({
          status: 'success',
          registrationsOpen: isOpen,
          message: isOpen ? 'All registrations are now OPEN.' : 'All registrations are now CLOSED.',
        });
      }

      if (bulkType === 'VERIFY_ALL_PENDING_PAYMENTS') {
        await Promise.allSettled([
          supabase.from('delegates').update({ payment_status: 'VERIFIED' }).neq('payment_status', 'VERIFIED'),
          supabase.from('delegate_applications').update({ payment_status: 'VERIFIED', updated_at: new Date().toISOString() }).neq('payment_status', 'VERIFIED'),
        ]);
        adminDataCache = null;
        return NextResponse.json({
          status: 'success',
          message: 'All pending delegate payments have been marked VERIFIED.',
        });
      }

      return NextResponse.json({ status: 'error', message: `Unknown bulkType: ${bulkType}` }, { status: 400 });
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
