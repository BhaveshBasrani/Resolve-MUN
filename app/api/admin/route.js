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

    if (supabase) {
      try {
        const [realDelRes, appDelRes, realDelegRes, delegRes, ocRes, ebRes, secRes, profRes] = await Promise.all([
          supabase.from('delegates').select('*').order('created_at', { ascending: false }),
          supabase.from('delegate_applications').select('*').order('created_at', { ascending: false }),
          supabase.from('delegations').select('*').order('created_at', { ascending: false }),
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
            dob: d.dob || d.birth_date || '',
            address: d.address || d.residential_address || '',
            transport: d.transport || d.transport_needed || '',
            experience: d.experience || d.mun_experience || '',
            pref1_committee: d.pref1_committee || '',
            pref1_country: d.pref1_country || d.pref1_portfolio1 || '',
            pref2_committee: d.pref2_committee || '',
            pref2_country: d.pref2_country || d.pref2_portfolio1 || '',
            pref3_committee: d.pref3_committee || '',
            pref3_country: d.pref3_country || d.pref3_portfolio1 || '',
            allocatedCommittee: d.allocated_committee || '',
            allocatedCountry: d.allocated_country || '',
            paymentUTR: d.payment_utr || '',
            paymentScreenshotURL: d.payment_screenshot_url || '',
            paymentStatus: (() => {
              const raw = String(d.payment_status || d.paymentStatus || d.status || '').toUpperCase();
              if (raw === 'VERIFIED' || raw.includes('VERIF')) return 'VERIFIED';
              return 'PENDING';
            })(),
            paymentVerified: (() => {
              const raw = String(d.payment_status || d.paymentStatus || d.status || '').toUpperCase();
              if (raw === 'VERIFIED' || raw.includes('VERIF')) return 'verified';
              return 'Pending';
            })(),
            status: d.status || (d.allocated_committee ? 'ALLOTTED' : 'Confirmed'),
            checkInDay1: d.check_in_day1 || 'Absent',
            checkInDay2: d.check_in_day2 || 'Absent',
            checkInDay3: d.check_in_day3 || 'Absent',
            timestamp: d.created_at,
          }));
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
            paymentStatus: (d.payment_status || 'PENDING_VERIFICATION').toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
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

    const mergedDelegations = dedupeByEmailOrId([sbDelegations, asDelegations], 'delegationId')
      .filter(d => !memoryDeletedIds.has(d.id) && !memoryDeletedIds.has(d.delegationId));
    const mergedOc = dedupeByEmailOrId([sbOc, asOcApplicants], 'email')
      .filter(a => !memoryDeletedIds.has(a.id) && !memoryDeletedIds.has(a.appId) && !memoryDeletedIds.has((a.email || '').toLowerCase().trim()));
    const mergedEb = dedupeByEmailOrId([sbEb, asEbApplicants], 'email')
      .filter(a => !memoryDeletedIds.has(a.id) && !memoryDeletedIds.has(a.appId) && !memoryDeletedIds.has((a.email || '').toLowerCase().trim()));
    const mergedSec = dedupeByEmailOrId([sbSec, asSecApplicants], 'email')
      .filter(a => !memoryDeletedIds.has(a.id) && !memoryDeletedIds.has(a.appId) && !memoryDeletedIds.has((a.email || '').toLowerCase().trim()));
    const mergedUsers = dedupeByEmailOrId([sbProfiles, siteUsers], 'email')
      .filter(u => u && u.email && typeof u.email === 'string' && u.email.trim().includes('@'));

    // Also synthesize site user profiles from confirmed delegate registrations so all registered accounts show up
    mergedRegistrations.forEach((r, idx) => {
      const email = (r.email || '').toLowerCase().trim();
      if (!email || !email.includes('@')) return;
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

      const generatedId = body.regId || body.delegateId || body.id || `RM26-DEL-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanEmail = (body.email || '').trim().toLowerCase();
      const delegateName = (body.fullName || body.name || 'Delegate').trim();
      const phone = (body.phone ? String(body.phone) : '').trim();
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
            referral: body.referral || '',
            emergency_name: body.emergency_name || '',
            emergency_phone: body.emergency_phone || '',
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

          // Ensure site user profile is present
          await supabase.from('profiles').upsert({
            full_name: delegateName,
            email: cleanEmail,
            phone: phone,
            role: 'DELEGATE',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });
        } catch (sbErr) {
          console.warn("[Supabase] Delegate application save notice:", sbErr.message);
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

    // 0c2. TEAM APPLICATION MANAGEMENT: ADMIN_UPDATE_APPLICANT_STATUS
    if (action === 'ADMIN_UPDATE_APPLICANT_STATUS') {
      const { appId, roleType, email, fullName, position, newStatus } = body;
      
      // 1. Update in Supabase
      if (supabase) {
        try {
          const tableName = roleType === 'OC' ? 'oc_applications' : roleType === 'SEC' ? 'secretariat_applications' : 'eb_applications';
          await supabase.from(tableName).update({ status: newStatus }).or(`app_id.eq.${appId},email.eq.${email}`);
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

        // Also sync extended conference metadata to system_settings if present
        try {
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
            referral_codes: referralCodes,
            committee_capacities: normalized.committeeCapacities,
            committee_documents: normalized.committeeDocuments,
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

      // Update Supabase with schema-exact payloads for both delegates & delegate_applications
      if (supabase) {
        try {
          const delPatch = {};
          const legPatch = { updated_at: new Date().toISOString() };

          const nameVal = body.fullName !== undefined ? body.fullName : body.name;
          if (nameVal !== undefined) { delPatch.full_name = nameVal; legPatch.name = nameVal; legPatch.full_name = nameVal; }
          if (body.phone !== undefined) { delPatch.phone = body.phone; legPatch.phone = body.phone; }
          const instVal = body.institution !== undefined ? body.institution : body.school;
          if (instVal !== undefined) { delPatch.school = instVal; legPatch.institute = instVal; legPatch.school = instVal; }
          if (body.grade !== undefined) { delPatch.grade = body.grade; legPatch.grade = body.grade; }
          if (body.dob !== undefined) { delPatch.dob = body.dob; legPatch.dob = body.dob; }
          if (body.address !== undefined) { delPatch.address = body.address; legPatch.address = body.address; legPatch.residential_address = body.address; }
          if (body.transport !== undefined) { delPatch.transport = body.transport; legPatch.transport = body.transport; legPatch.transport_needed = body.transport; }
          if (body.experience !== undefined) { delPatch.experience = body.experience; legPatch.experience = body.experience; legPatch.mun_experience = body.experience; }
          if (body.pref1_committee !== undefined) { delPatch.pref1_committee = body.pref1_committee; legPatch.pref1_committee = body.pref1_committee; }
          if (body.pref1_country !== undefined) { delPatch.pref1_portfolio1 = body.pref1_country; legPatch.pref1_country = body.pref1_country; legPatch.pref1_portfolio1 = body.pref1_country; }
          if (body.pref2_committee !== undefined) { delPatch.pref2_committee = body.pref2_committee; legPatch.pref2_committee = body.pref2_committee; }
          if (body.pref2_country !== undefined) { delPatch.pref2_portfolio1 = body.pref2_country; legPatch.pref2_country = body.pref2_country; legPatch.pref2_portfolio1 = body.pref2_country; }
          if (body.pref3_committee !== undefined) { delPatch.pref3_committee = body.pref3_committee; legPatch.pref3_committee = body.pref3_committee; }
          if (body.pref3_country !== undefined) { delPatch.pref3_portfolio1 = body.pref3_country; legPatch.pref3_country = body.pref3_country; legPatch.pref3_portfolio1 = body.pref3_country; }
          if (body.allocatedCommittee !== undefined) { delPatch.allocated_committee = body.allocatedCommittee; legPatch.allocated_committee = body.allocatedCommittee; }
          if (body.allocatedCountry !== undefined) { delPatch.allocated_country = body.allocatedCountry; legPatch.allocated_country = body.allocatedCountry; }
          if (body.paymentUTR !== undefined) { delPatch.payment_utr = body.paymentUTR; legPatch.payment_utr = body.paymentUTR; }
          if (body.paymentStatus !== undefined) {
            const ps = body.paymentStatus.toUpperCase() === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION';
            delPatch.payment_status = ps;
            legPatch.payment_status = ps;
          }
          if (body.allocatedCommittee && !delPatch.status) {
            delPatch.status = 'ALLOTTED';
            legPatch.status = 'ALLOTTED';
          }

          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          const ops = [];
          if (Object.keys(delPatch).length > 0) {
            let q1 = supabase.from('delegates').update(delPatch);
            if (isUuid) q1 = q1.eq('id', targetId);
            else if (targetId && targetEmail) q1 = q1.or(`delegate_id.eq.${targetId},email.ilike.${targetEmail}`);
            else if (targetId) q1 = q1.or(`delegate_id.eq.${targetId},email.ilike.${targetId}`);
            else if (targetEmail) q1 = q1.ilike('email', targetEmail);
            ops.push(q1);
          }
          if (Object.keys(legPatch).length > 1) {
            let q2 = supabase.from('delegate_applications').update(legPatch);
            if (isUuid) q2 = q2.eq('id', targetId);
            else if (targetId && targetEmail) q2 = q2.or(`reg_id.eq.${targetId},email.ilike.${targetEmail}`);
            else if (targetId) q2 = q2.or(`reg_id.eq.${targetId},email.ilike.${targetId}`);
            else if (targetEmail) q2 = q2.ilike('email', targetEmail);
            ops.push(q2);
          }
          await Promise.allSettled(ops);
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
          const delegatesUpdate = {
            allocated_committee: body.committee,
            allocated_country: body.country,
            status: 'ALLOTTED',
          };
          const legacyUpdate = {
            ...delegatesUpdate,
            updated_at: new Date().toISOString(),
          };

          let q1 = supabase.from('delegates').update(delegatesUpdate);
          let q2 = supabase.from('delegate_applications').update(legacyUpdate);

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
          adminDataCache = null;
        } catch (e) {
          console.warn("[Supabase] Allotment notice:", e.message);
        }
      }

      // Fetch delegate metadata for email dispatch if missing (check delegates first, then delegate_applications)
      let delEmail = targetEmail;
      let delName = body.fullName || body.name || '';
      let delRegId = targetId;
      if (supabase && (!delEmail || !delName)) {
        try {
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
          let q1 = supabase.from('delegates').select('full_name, email, delegate_id');
          if (isUuid) q1 = q1.eq('id', targetId);
          else if (targetId.startsWith('RM26-DEL-')) q1 = q1.eq('delegate_id', targetId);
          else if (targetEmail) q1 = q1.ilike('email', targetEmail);
          const { data: realData } = await q1.maybeSingle();
          if (realData) {
            delEmail = delEmail || realData.email;
            delName = delName || realData.full_name;
            delRegId = delRegId || realData.delegate_id;
          }
          if (!delEmail || !delName) {
            let dq = supabase.from('delegate_applications').select('name, email, reg_id');
            if (isUuid) dq = dq.eq('id', targetId);
            else if (targetId.startsWith('RM26-DEL-')) dq = dq.eq('reg_id', targetId);
            else if (targetEmail) dq = dq.ilike('email', targetEmail);
            const { data: dData } = await dq.maybeSingle();
            if (dData) {
              delEmail = delEmail || dData.email;
              delName = delName || dData.name;
              delRegId = delRegId || dData.reg_id;
            }
          }
        } catch (_) {}
      }

      // Dispatch allotment credential email via Apps Script
      let dispatchStatus = 'sent';
      try {
        const asRes = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            ...body,
            action: 'ADMIN_ALLOT_COMMITTEE',
            adminKey: ADMIN_KEY,
            email: delEmail,
            fullName: delName,
            name: delName,
            regId: delRegId,
            committee: body.committee,
            country: body.country,
          }),
        });
        const asText = await asRes.text();
        if (asRes.status === 403 || asText.includes('You need permission') || asText.includes('accounts.google.com')) {
          dispatchStatus = 'permission_required';
        }
      } catch (err) {
        dispatchStatus = 'failed: ' + err.message;
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
      const newStatus = (body.paymentStatus || 'VERIFIED').toUpperCase();
      const isVer = newStatus === 'VERIFIED';
      const statusVal = isVer ? 'VERIFIED' : 'FAILED';
      const verifiedVal = isVer ? 'verified' : 'Pending';

      adminDataCache = null;

      if (targetId) {
        const existing = memoryUpdatedDelegates.get(targetId) || {};
        memoryUpdatedDelegates.set(targetId, {
          ...existing,
          paymentStatus: statusVal,
          paymentVerified: verifiedVal,
        });
      }
      if (targetEmail) {
        const existing = memoryUpdatedDelegates.get(targetEmail) || {};
        memoryUpdatedDelegates.set(targetEmail, {
          ...existing,
          paymentStatus: statusVal,
          paymentVerified: verifiedVal,
        });
      }

      if (supabase) {
        try {
          const delPayload = {
            payment_status: isVer ? 'VERIFIED' : 'PENDING_VERIFICATION',
          };
          const legPayload = {
            payment_status: isVer ? 'VERIFIED' : 'PENDING_VERIFICATION',
            updated_at: new Date().toISOString(),
          };
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

          let delFilter = '';
          let legFilter = '';
          if (isUuid) {
            delFilter = `id.eq.${targetId}`;
            legFilter = `id.eq.${targetId}`;
          } else if (targetId && targetEmail) {
            delFilter = `delegate_id.eq.${targetId},email.ilike.${targetEmail}`;
            legFilter = `reg_id.eq.${targetId},email.ilike.${targetEmail}`;
          } else if (targetId) {
            delFilter = `delegate_id.eq.${targetId}`;
            legFilter = `reg_id.eq.${targetId}`;
          } else if (targetEmail) {
            delFilter = `email.ilike.${targetEmail}`;
            legFilter = `email.ilike.${targetEmail}`;
          }

          const ops = [];
          if (delFilter) ops.push(supabase.from('delegates').update(delPayload).or(delFilter));
          if (legFilter) ops.push(supabase.from('delegate_applications').update(legPayload).or(legFilter));
          if (ops.length > 0) await Promise.allSettled(ops);
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
        message: `Payment status set to ${statusVal}`,
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
          let qDel = supabase.from('delegates').delete();
          let qLeg = supabase.from('delegate_applications').delete();
          if (isUuid) {
            qDel = qDel.eq('id', targetId);
            qLeg = qLeg.eq('id', targetId);
          } else {
            if (targetId && targetEmail) {
              qDel = qDel.or(`delegate_id.eq.${targetId},email.ilike.${targetEmail}`);
              qLeg = qLeg.or(`reg_id.eq.${targetId},email.ilike.${targetEmail}`);
            } else if (targetId) {
              qDel = qDel.or(`delegate_id.eq.${targetId},email.ilike.${targetId}`);
              qLeg = qLeg.or(`reg_id.eq.${targetId},email.ilike.${targetId}`);
            } else if (targetEmail) {
              qDel = qDel.ilike('email', targetEmail);
              qLeg = qLeg.ilike('email', targetEmail);
            }
          }
          await Promise.allSettled([qDel, qLeg]);
        } catch (e) {
          console.warn("[Supabase] Delete delegate notice:", e.message);
        }
      }

      adminDataCache = null;

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
          const nowIso = new Date().toISOString();
          const ops = [];

          // 1. Update delegates table (uses delegate_id + last_check_in)
          let qDel = supabase.from('delegates').update({ [dayCol]: statusValue, last_check_in: nowIso });
          if (isUuid) qDel = qDel.eq('id', targetId);
          else qDel = qDel.or(`delegate_id.eq.${targetId},email.ilike.${targetId}`);
          ops.push(qDel);

          // 2. Update legacy delegate_applications table
          let qLeg = supabase.from('delegate_applications').update({ [dayCol]: statusValue, updated_at: nowIso });
          if (isUuid) qLeg = qLeg.eq('id', targetId);
          else qLeg = qLeg.or(`reg_id.eq.${targetId},email.ilike.${targetId}`);
          ops.push(qLeg);

          // 3. Update OC / Secretariat / EB tables if scanning a staff or EB badge
          if (targetId.startsWith('RM26-OC-') || targetId.includes('@')) {
            ops.push(supabase.from('oc_applications').update({ [dayCol]: statusValue }).or(`app_id.eq.${targetId},email.ilike.${targetId}`));
          }
          if (targetId.startsWith('RM26-SEC-') || targetId.includes('@')) {
            ops.push(supabase.from('secretariat_applications').update({ [dayCol]: statusValue }).or(`app_id.eq.${targetId},email.ilike.${targetId}`));
          }
          if (targetId.startsWith('RM26-EB-') || targetId.includes('@')) {
            ops.push(supabase.from('eb_applications').update({ [dayCol]: statusValue }).or(`app_id.eq.${targetId},email.ilike.${targetId}`));
          }

          // 4. Write audit log entry to check_in_logs
          ops.push(
            supabase.from('check_in_logs').insert({
              delegate_id: targetId,
              full_name: body.fullName || body.name || '',
              email: body.email || '',
              role: body.role || 'DELEGATE',
              day: dayStr,
              action_type: isEntry ? 'ENTRY' : 'EXIT',
              verified_by: body.verifiedBy || 'Secretariat Desk',
            })
          );

          await Promise.allSettled(ops);
          adminDataCache = null;
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
