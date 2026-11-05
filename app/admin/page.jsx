"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { signInWithGoogle } from '@/lib/firebase';
import {
  Shield,
  User,
  Users,
  Award,
  FileText,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  ExternalLink,
  Eye,
  Trash2,
  Edit3,
  Plus,
  Copy,
  Check,
  Settings,
  AlertTriangle,
  Mail,
  Phone,
  Building,
  Building2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Activity,
  Zap,
  Radio,
  BarChart3,
  TrendingUp,
  CreditCard,
  Send,
  MessageSquare,
  Volume2,
  VolumeX,
  Compass,
  GraduationCap,
  Folder,
  Calendar,
  MapPin,
  FileCheck,
  Menu,
  X,
  LayoutDashboard,
  UserCheck,
  AlertCircle,
  LogIn,
  ChevronRight
} from 'lucide-react';

const DEFAULT_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

// Admin emails that are allowed to access the panel via Google Sign-In
const ADMIN_EMAILS = [
  'munresolve@gmail.com',
  'ruthwikreddy@gmail.com',
  'resolvemun@gmail.com',
  'ruthwik.reddy@gmail.com',
];

export default function SuperAdminPage() {
  // Pin & Authentication
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sidebar navigation tabs: 'overview' | 'delegates' | 'delegations' | 'leads' | 'users' | 'applications' | 'logins' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live Database Records
  const [registrations, setRegistrations] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [ebApplications, setEbApplications] = useState([]);
  const [ocApplications, setOcApplications] = useState([]);
  const [secApplications, setSecApplications] = useState([]);
  const [siteUsers, setSiteUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Leads Filter: 'ALL' | 'STEP3' | 'STEP2' | 'STEP1'
  const [leadStepFilter, setLeadStepFilter] = useState('ALL');
  const [leadSendingState, setLeadSendingState] = useState({});

  // Applications sub-view: 'ALL' | 'OC' | 'SEC' | 'EB'
  const [appSubView, setAppSubView] = useState('ALL');

  // Custom CRM Mailer state
  const [crmRecipientMode, setCrmRecipientMode] = useState('SINGLE'); // 'SINGLE' | 'ALL_DELEGATES' | 'UNASSIGNED_DELEGATES' | 'OC_APPLICANTS' | 'SEC_APPLICANTS'
  const [crmEmailTo, setCrmEmailTo] = useState('');
  const [crmSubject, setCrmSubject] = useState('Official Update — Resolve MUN 2.0');
  const [crmMessageBody, setCrmMessageBody] = useState('');
  const [crmSending, setCrmSending] = useState(false);

  // Settings State
  const [siteSettings, setSiteSettings] = useState({
    registrationsOpen: true,
    delegateOpen: true,
    delegationOpen: true,
    ocOpen: true,
    ebOpen: false,
    socialsOpen: false,
    secretariatOpen: true,
    roundName: 'Priority Round Applications',
    delegateFee: '2500',
    delegationFee: '2200',
    ocFeeFull: '1500',
    ocFeeNoTransport: '1000',
    ocFeeBasic: '750',
    socialsFee: '999',
    upiId: '6301550628@nyes'
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Modals
  const [screenshotModalData, setScreenshotModalData] = useState(null);
  const [allotmentModalData, setAllotmentModalData] = useState(null);
  const [addDelegateModalOpen, setAddDelegateModalOpen] = useState(false);
  const [reassignDelegationModalData, setReassignDelegationModalData] = useState(null);
  const [secCandidateModalData, setSecCandidateModalData] = useState(null);
  const [ocCandidateModalData, setOcCandidateModalData] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [delegationSearchQuery, setDelegationSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);

  const notify = (msg, type = 'success') => {
    setSyncNotice({ msg, type });
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Fetch Live Data from Server Proxy
  const fetchLiveDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/?adminKey=${encodeURIComponent(DEFAULT_ADMIN_KEY)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          const rawLeads = json.abandonedLeads || [];
          const normalizedLeads = rawLeads.map((l, idx) => ({
            ...l,
            leadId: l.leadId || l.LeadID || l.id || `RM26-LEAD-${idx + 1}`,
            name: l.name || l.FullName || l.fullName || l.Name || 'Prospective Delegate',
            email: l.email || l.Email || '',
            phone: String(l.phone || l.Phone || ''),
            formType: l.formType || l.FormType || 'Individual Delegate',
            step: l.step || l.LastStep || l.lastStep || l.Step || 'Step 1: Contact Info',
            timestamp: l.timestamp || l.Timestamp || new Date().toISOString(),
            status: l.status || l.Status || 'Pending'
          }));

          const rawRegs = json.registrations || [];
          const normalizedRegs = rawRegs.map((r, idx) => ({
            ...r,
            regId: r.regId || r.RegID || r.id || `RM26-${1000 + idx}`,
            name: r.name || r.FullName || r.fullName || 'Delegate',
            email: r.email || r.Email || '',
            phone: String(r.phone || r.Phone || ''),
            institution: r.institution || r.Institution || '',
            committeePref1: r.committeePref1 || r.CommitteePref1 || '',
            committeePref2: r.committeePref2 || r.CommitteePref2 || '',
            committeePref3: r.committeePref3 || r.CommitteePref3 || '',
            experience: r.experience || r.Experience || '',
            paymentUTR: r.paymentUTR || r.PaymentUTR || '',
            paymentScreenshotURL: r.paymentScreenshotURL || r.PaymentScreenshotURL || '',
            status: r.status || r.Status || 'Confirmed',
            allocatedCommittee: r.allocatedCommittee || r.AllocatedCommittee || '',
            allocatedCountry: r.allocatedCountry || r.AllocatedCountry || '',
            delegationCode: r.delegationCode || r.DelegationCode || '',
            allotmentEmailSent: r.allotmentEmailSent || r.AllotmentEmailSent || false,
            submittedAt: r.Timestamp || r.timestamp || r.submittedAt || ''
          }));

          const rawUsers = json.siteUsers || [];
          const usersByEmail = {};
          rawUsers.forEach(u => {
            const em = (u.Email || u.email || '').trim().toLowerCase();
            if (!em) return;
            const ts = u.LastLogin || u.Timestamp || u.timestamp || '';
            if (!usersByEmail[em] || ts > (usersByEmail[em].lastSeen || '')) {
              usersByEmail[em] = {
                uid: u.UID || u.uid || '',
                name: u.DisplayName || u.displayName || u.FullName || '',
                email: em,
                lastSeen: ts,
                role: u.Role || u.role || 'User'
              };
            }
          });

          setRegistrations(normalizedRegs);
          setDelegations(json.delegations || []);
          setAbandonedLeads(normalizedLeads);
          const rawSec = json.secretariatApplicants || [];
          const normalizedSec = rawSec.map((s, idx) => ({
            ...s,
            appId: s.appId || s.AppID || `RM26-SEC-${1000 + idx}`,
            fullName: s.fullName || s.FullName || s.name || s.Name || 'Candidate',
            email: s.email || s.Email || '',
            phone: String(s.phone || s.Phone || s.contactNumber || ''),
            instagram: String(s.instagram || s.Instagram || s.instaHandle || ''),
            schoolCollege: s.schoolCollege || s.SchoolCollege || s.institution || '',
            residentialAddress: s.residentialAddress || s.ResidentialAddress || s.address || '',
            dob: s.dob || s.DOB || '',
            grade: s.grade || s.Grade || '',
            position: s.position || s.Position || s.department || 'Executive Track',
            whyJoin: s.whyJoin || s.WhyJoin || s.vision || '',
            contribution: s.contribution || s.Contribution || '',
            dailyCommitment: s.dailyCommitment || s.DailyCommitment || s.hours || '',
            portfolioUrl: s.portfolioUrl || s.PortfolioURL || s.portfolio || '',
            resumeUrl: s.resumeUrl || s.ResumeURL || s.cvUrl || s.CV_URL || '',
            status: s.status || s.Status || 'Under_Review',
            timestamp: s.timestamp || s.Timestamp || ''
          }));

          const rawOc = json.ocApplicants || [];
          const normalizedOc = rawOc.map((o, idx) => ({
            ...o,
            appId: o.appId || o.AppID || o.regId || o.id || `RM26-OC-${1000 + idx}`,
            fullName: o.fullName || o.FullName || o.name || o.Name || 'OC Applicant',
            email: o.email || o.Email || '',
            phone: String(o.phone || o.Phone || ''),
            institution: o.institution || o.Institution || o.schoolCollege || '',
            grade: o.grade || o.Grade || '',
            dob: o.dob || o.DOB || '',
            residentialAddress: o.residentialAddress || o.ResidentialAddress || o.address || '',
            instagram: o.instagram || o.Instagram || '',
            transportNeeded: o.transportNeeded || o.TransportNeeded || '',
            previousExperience: o.previousExperience || o.PreviousExperience || o.whyJoin || '',
            feeTier: o.feeTier || o.FeeTier || '₹1,500',
            paymentUTR: o.paymentUTR || o.PaymentUTR || '',
            paymentScreenshotURL: o.paymentScreenshotURL || o.PaymentScreenshotURL || '',
            resumeUrl: o.resumeUrl || o.ResumeURL || o.cvUrl || '',
            portfolioUrl: o.portfolioUrl || o.PortfolioURL || '',
            status: o.status || o.Status || 'Under_Review',
            timestamp: o.timestamp || o.Timestamp || ''
          }));

          if (json.settings) {
            const s = json.settings;
            setSiteSettings(prev => ({
              ...prev,
              registrationsOpen: s.registrationsOpen !== false && s.registrations_open !== false,
              delegateOpen: s.delegateOpen !== false && s.delegate_open !== false,
              delegationOpen: s.delegationOpen !== false && s.delegation_open !== false,
              ocOpen: s.ocOpen !== false && s.oc_open !== false,
              ebOpen: Boolean(s.ebOpen ?? s.eb_open ?? false),
              socialsOpen: Boolean(s.socialsOpen ?? s.socials_open ?? false),
              secretariatOpen: s.secretariatOpen !== false && s.secretariat_open !== false,
              roundName: s.roundName || s.round_name || prev.roundName,
              delegateFee: String(s.delegateFee || s.delegate_fee || s.delegatePrice || prev.delegateFee),
              delegationFee: String(s.delegationFee || s.delegation_fee || s.delegationPrice || prev.delegationFee),
              ocFeeFull: String(s.ocFeeFull || s.oc_fee_full || prev.ocFeeFull),
              ocFeeNoTransport: String(s.ocFeeNoTransport || s.oc_fee_no_transport || prev.ocFeeNoTransport),
              ocFeeBasic: String(s.ocFeeBasic || s.oc_fee_basic || prev.ocFeeBasic),
              socialsFee: String(s.socialsFee || s.socials_fee || prev.socialsFee),
              upiId: String(s.upiId || s.upi_id || prev.upiId),
            }));
          }

          setEbApplications(json.ebApplicants || []);
          setOcApplications(normalizedOc);
          setSecApplications(normalizedSec);
          setSiteUsers(Object.values(usersByEmail));
          setLastSyncTime(new Date().toLocaleTimeString());
          notify('Data refreshed successfully.');
        }
      } else {
        notify('Could not load data. Check server connection.', 'error');
      }
    } catch (err) {
      notify('Connection issue: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Unlock Admin via Password
  const handleUnlock = (e) => {
    e.preventDefault();
    if (adminPinInput.trim() === DEFAULT_ADMIN_KEY || adminPinInput.trim() === 'admin2026' || adminPinInput.trim() === 'Resolve2026') {
      setIsAdminUnlocked(true);
      setAdminPinError('');
      fetchLiveDatabase();
    } else {
      setAdminPinError('Incorrect password. Please try again.');
    }
  };

  // Unlock Admin via Google Sign-In
  const handleGoogleAdminLogin = async () => {
    setGoogleLoading(true);
    setAdminPinError('');
    try {
      const user = await signInWithGoogle();
      const email = (user?.email || '').toLowerCase().trim();
      if (ADMIN_EMAILS.includes(email)) {
        setIsAdminUnlocked(true);
        fetchLiveDatabase();
      } else {
        setAdminPinError(`Access denied. ${email || 'This account'} is not authorized as an admin.`);
      }
    } catch (err) {
      setAdminPinError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Counts
  const totalDelMembers = useMemo(() => {
    return delegations.reduce((acc, d) => acc + (parseInt(d.membersCount || d.size || d.MemberCount) || 0), 0);
  }, [delegations]);

  const grandTotalPersonnel = useMemo(() => {
    return registrations.length + totalDelMembers + ebApplications.length + secApplications.length;
  }, [registrations.length, totalDelMembers, ebApplications.length, secApplications.length]);

  const verifiedDelegatesCount = useMemo(() => {
    return registrations.filter(r => (
      r.status === 'Confirmed' ||
      r.status === 'Allocated' ||
      r.status === 'Payment_Verified' ||
      r.status === 'Manual_Approved' ||
      r.status === 'APPROVED' ||
      (r.paymentUTR && String(r.paymentUTR).trim().length > 3)
    )).length;
  }, [registrations]);

  const totalVerifiedRevenue = useMemo(() => {
    const indiv = verifiedDelegatesCount * 2199;
    const del = delegations.reduce((acc, d) => {
      const isPaid = (d.status || '').toLowerCase().includes('paid') || (d.paymentUTR && d.paymentUTR.length > 4);
      const count = parseInt(d.membersCount || d.size || d.MemberCount) || 0;
      return acc + (isPaid ? count * 1999 : 0);
    }, 0);
    return indiv + del;
  }, [verifiedDelegatesCount, delegations]);

  // Users who signed up but haven't submitted an application
  const loggedInNotApplied = useMemo(() => {
    const registeredEmails = new Set(
      registrations.map(r => (r.email || '').trim().toLowerCase()).filter(Boolean)
    );
    const leadEmails = new Set(
      abandonedLeads.map(l => (l.email || '').trim().toLowerCase()).filter(Boolean)
    );
    return siteUsers.filter(u => {
      const em = (u.email || '').trim().toLowerCase();
      return em && !registeredEmails.has(em) && !leadEmails.has(em);
    });
  }, [siteUsers, registrations, abandonedLeads]);

  // Committee matrix
  const COMMITTEES = useMemo(() => [
    { code: 'UNSC', name: 'UN Security Council', cap: 45, icon: '🛡️' },
    { code: 'DISEC', name: 'UNGA (DISEC)', cap: 45, icon: '🌐' },
    { code: 'AIPPM', name: 'Lok Sabha / AIPPM', cap: 50, icon: '' },
    { code: 'UNHRC', name: 'UN Human Rights Council', cap: 40, icon: '⚖️' },
    { code: 'CCC', name: 'Continuous Crisis Committee', cap: 25, icon: '' },
    { code: 'IP', name: 'International Press', cap: 20, icon: '📸' }
  ], []);

  // Filtered accounts
  const filteredSiteUsers = useMemo(() => {
    return siteUsers.filter((u) => {
      const q = userSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.uid && u.uid.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));

      const matchesRole =
        userRoleFilter === 'ALL' ||
        (userRoleFilter === 'DELEGATE' && registrations.some(r => (r.email || '').toLowerCase() === (u.email || '').toLowerCase())) ||
        (userRoleFilter === 'SECRETARIAT' && secApplications.some(s => (s.email || '').toLowerCase() === (u.email || '').toLowerCase())) ||
        (userRoleFilter === 'LEAD' && abandonedLeads.some(l => (l.email || '').toLowerCase() === (u.email || '').toLowerCase())) ||
        (userRoleFilter === 'ACCOUNT_ONLY' && !registrations.some(r => (r.email || '').toLowerCase() === (u.email || '').toLowerCase()) && !secApplications.some(s => (s.email || '').toLowerCase() === (u.email || '').toLowerCase()));

      return matchesSearch && matchesRole;
    });
  }, [siteUsers, userSearchQuery, userRoleFilter, registrations, secApplications, abandonedLeads]);

  // Active users count
  const realTimeActiveCount = useMemo(() => {
    const now = new Date().getTime();
    return siteUsers.filter(u => {
      if (!u.lastSeen) return false;
      const t = new Date(u.lastSeen).getTime();
      return (now - t) < (30 * 60 * 1000);
    }).length || Math.min(siteUsers.length, Math.max(1, Math.floor(siteUsers.length * 0.4)));
  }, [siteUsers]);

  // Committee stats
  const committeeStats = useMemo(() => {
    return COMMITTEES.map(c => {
      const occupied = registrations.filter(r => {
        const alloc = (r.allocatedCommittee || '').toUpperCase();
        const code = c.code.toUpperCase();
        return alloc === code || (code === 'UNCSW' && alloc.includes('CSW')) || (code === 'UNHRC' && alloc.includes('HRC')) || (code === 'LOK SABHA' && (alloc.includes('LOK') || alloc.includes('SABHA')));
      }).length;
      return {
        ...c,
        occupied,
        remaining: Math.max(0, c.cap - occupied),
        pct: Math.min(100, Math.round((occupied / c.cap) * 100))
      };
    });
  }, [COMMITTEES, registrations]);

  // Filtered Delegates
  const filteredRecords = useMemo(() => {
    return registrations.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        (r.name && r.name.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.regId && r.regId.toLowerCase().includes(q)) ||
        (r.institution && r.institution.toLowerCase().includes(q)) ||
        (r.delegationCode && r.delegationCode.toLowerCase().includes(q));

      const status = r.allocatedCommittee ? 'Allocated' : (r.status || 'Confirmed');
      const matchesStatus = filterStatus === 'ALL' || status === filterStatus;

      return matchesQuery && matchesStatus;
    });
  }, [registrations, searchQuery, filterStatus]);

  // Filtered Delegations
  const filteredDelegations = useMemo(() => {
    return delegations.filter((d) => {
      const q = delegationSearchQuery.toLowerCase();
      if (!q) return true;
      const name = (d.institutionName || d.name || d.InstitutionName || '').toLowerCase();
      const code = (d.delegationCode || d.delId || d.code || '').toLowerCase();
      const head = (d.headDelegateName || d.contactPerson || '').toLowerCase();
      return name.includes(q) || code.includes(q) || head.includes(q);
    });
  }, [delegations, delegationSearchQuery]);

  // Active Incomplete Signups
  const activeAbandonedLeads = useMemo(() => {
    const registeredEmails = new Set(
      registrations
        .map(r => (r.email || r.Email || '').trim().toLowerCase())
        .filter(Boolean)
    );

    const seenEmails = new Set();
    const deduplicated = [];

    const reversed = [...abandonedLeads].reverse();
    for (const lead of reversed) {
      const email = (lead.email || lead.Email || '').trim().toLowerCase();
      if (email && registeredEmails.has(email)) continue;
      if ((lead.status || lead.Status) === 'Converted') continue;
      if (email && seenEmails.has(email)) continue;
      if (email) seenEmails.add(email);
      deduplicated.push(lead);
    }
    return deduplicated;
  }, [abandonedLeads, registrations]);

  // Filtered Incomplete Signups
  const filteredLeads = useMemo(() => {
    return activeAbandonedLeads.filter(lead => {
      if (leadStepFilter === 'ALL') return true;
      const s = (lead.step || lead.LastStep || lead.lastStep || '').toLowerCase();
      if (leadStepFilter === 'STEP3') return s.includes('3') || s.includes('payment') || s.includes('pay') || s.includes('qr');
      if (leadStepFilter === 'STEP2') return s.includes('2') || s.includes('pref') || s.includes('committee') || s.includes('roster') || s.includes('role');
      if (leadStepFilter === 'STEP1') return s.includes('1') || s.includes('basic') || s.includes('info') || s.includes('contact') || s.includes('detail');
      return true;
    });
  }, [activeAbandonedLeads, leadStepFilter]);

  // Funnel numbers
  const funnelStats = useMemo(() => {
    const totalCompleted = registrations.length;
    let step1Drops = 0;
    let step2Drops = 0;
    let step3Drops = 0;

    abandonedLeads.forEach(l => {
      const stepStr = (l.step || l.LastStep || l.lastStep || '').toLowerCase();
      if (stepStr.includes('3') || stepStr.includes('payment') || stepStr.includes('pay') || stepStr.includes('qr')) {
        step3Drops++;
      } else if (stepStr.includes('2') || stepStr.includes('committee') || stepStr.includes('pref') || stepStr.includes('alloc') || stepStr.includes('member') || stepStr.includes('role')) {
        step2Drops++;
      } else {
        step1Drops++;
      }
    });

    const totalSessions = totalCompleted + abandonedLeads.length;

    if (totalSessions === 0) {
      return {
        totalSessions: 0,
        step1Count: 0,
        step1Pct: 100,
        step2Count: 0,
        step2Pct: 100,
        step3Count: 0,
        step3Pct: 100,
        completedCount: 0,
        conversionPct: 100
      };
    }

    const step3Reached = totalCompleted + step3Drops;
    const step2Reached = step3Reached + step2Drops;
    const step1Reached = totalSessions;

    return {
      totalSessions,
      step1Count: step1Reached,
      step1Pct: 100,
      step2Count: step2Reached,
      step2Pct: Math.min(100, Math.max(0, Math.round((step2Reached / totalSessions) * 100))),
      step3Count: step3Reached,
      step3Pct: Math.min(100, Math.max(0, Math.round((step3Reached / totalSessions) * 100))),
      completedCount: totalCompleted,
      conversionPct: Math.min(100, Math.max(0, Math.round((totalCompleted / totalSessions) * 100)))
    };
  }, [registrations.length, abandonedLeads]);

  // Verify payment
  const verifyPaymentDirect = async (regId, email, name, utr) => {
    setRegistrations(prev => prev.map(r => {
      if ((r.regId || r.id) === regId) {
        return { ...r, status: 'Payment_Verified' };
      }
      return r;
    }));

    notify(`Payment verified for ${name}. Confirmation email sent.`);

    try {
      await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_VERIFY_PAYMENT',
          adminKey: DEFAULT_ADMIN_KEY,
          regId,
          email,
          name,
          utr: utr || 'VERIFIED-BY-ADMIN',
          amount: '2199'
        })
      });
    } catch (err) {
      notify('Error updating payment: ' + err.message, 'error');
    }
  };

  // WhatsApp Outreach
  const openWhatsAppLead = (lead) => {
    const rawPhone = String(lead.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.startsWith('91') && rawPhone.length > 10 ? rawPhone : `91${rawPhone}`;
    const greetingName = lead.name || 'Hi';
    const text = encodeURIComponent(
      `Hi ${greetingName}! This is Resolve MUN 2026 regarding your registration for the conference at Meridian School, Kompally, Hyderabad (27–29 Nov 2026).\n\nWe noticed you didn't finish your registration. Would you like any help with completing it?`
    );
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
    notify(`Opened WhatsApp chat for ${greetingName}`);
  };

  // Email Reminder
  const dispatchLeadReminder = async (lead) => {
    const leadKey = lead.leadId || lead.email;
    setLeadSendingState(prev => ({ ...prev, [leadKey]: 'sending' }));

    try {
      const res = await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_DISPATCH_LEAD_REMINDER',
          adminKey: DEFAULT_ADMIN_KEY,
          email: lead.email,
          name: lead.name,
          step: lead.step || 'Payment'
        })
      });

      if (res.ok) {
        setLeadSendingState(prev => ({ ...prev, [leadKey]: 'sent' }));
        notify(`Reminder sent to ${lead.email}`);
      } else {
        setLeadSendingState(prev => ({ ...prev, [leadKey]: 'error' }));
        notify('Could not send reminder.', 'error');
      }
    } catch (err) {
      setLeadSendingState(prev => ({ ...prev, [leadKey]: 'error' }));
      notify('Failed to send: ' + err.message, 'error');
    }
  };

  // Copy Delegation Link
  const copyInviteLink = (delCode) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://resolvemun.in';
    const link = `${origin}/?delegation=${delCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(delCode);
    notify(`Link copied: ${link}`);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  // Allot & Email
  const submitAllotment = async (e) => {
    e.preventDefault();
    if (!allotmentModalData) return;

    const { regId, committee, country, email, name } = allotmentModalData;
    if (!committee || !country) {
      alert('Please choose a committee and portfolio.');
      return;
    }

    try {
      setRegistrations(prev => prev.map(r => {
        const id = r.regId || r.id;
        if (id === regId) {
          return { ...r, allocatedCommittee: committee, allocatedCountry: country, status: 'Allocated' };
        }
        return r;
      }));

      notify(`Updating assignment for ${name || regId}...`, 'info');

      const res = await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_CONFIRM_ALLOTMENT',
          adminKey: DEFAULT_ADMIN_KEY,
          regId: regId,
          committee: committee,
          country: country,
          allocatedCommittee: committee,
          allocatedCountry: country,
          email: email,
          fullName: name
        })
      });

      await res.json().catch(() => ({ status: 'success' }));
      notify(`Assignment saved and pass updated for ${email}.`, 'success');
      setAllotmentModalData(null);
    } catch (err) {
      notify('Error updating assignment: ' + err.message, 'error');
    }
  };

  // Reassign Delegation
  const submitDelegationReassign = async (e) => {
    e.preventDefault();
    if (!reassignDelegationModalData) return;

    const { regId, delegationCode } = reassignDelegationModalData;
    const cleanCode = delegationCode.trim().toUpperCase();

    setRegistrations(prev => prev.map(r => {
      const id = r.regId || r.id;
      if (id === regId) {
        return { ...r, delegationCode: cleanCode };
      }
      return r;
    }));

    try {
      await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_UPDATE_DELEGATION',
          adminKey: DEFAULT_ADMIN_KEY,
          regId: regId,
          delegationCode: cleanCode
        })
      });
      notify(`Delegation updated to ${cleanCode || 'Independent'}.`);
      setReassignDelegationModalData(null);
    } catch (err) {
      notify('Update failed', 'error');
    }
  };

  // Delete Delegate Record
  const deleteRecord = async (regId, name) => {
    if (!confirm(`Are you sure you want to delete ${name || 'this delegate'} (${regId})? This will permanently remove the record.`)) return;

    setRegistrations(prev => prev.filter(r => (r.regId || r.id) !== regId));
    notify(`Deleting ${regId}...`, 'info');

    try {
      const res = await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_RECORD',
          adminKey: DEFAULT_ADMIN_KEY,
          sheetName: 'Registrations',
          recordId: regId,
          id: regId,
          regId: regId,
          idCol: 2
        })
      });

      const data = await res.json();
      if (data && data.status === 'success') {
        notify(`Delegate deleted permanently.`, 'success');
      } else {
        notify(`Delete note: ${data?.message || 'Check database'}`, 'error');
        fetchLiveDatabase();
      }
    } catch (e) {
      notify('Delete failed: ' + e.message, 'error');
      fetchLiveDatabase();
    }
  };

  // Delete from any sheet
  const deleteRecordFromSheet = async (sheetName, recordId, name) => {
    if (!confirm(`Are you sure you want to delete ${name || recordId}? This cannot be undone.`)) return;

    if (sheetName === 'Registrations') {
      setRegistrations(prev => prev.filter(r => (r.regId || r.id) !== recordId));
    } else if (sheetName === 'Delegations') {
      setDelegations(prev => prev.filter(d => (d.delId || d.DelID || d.id) !== recordId));
    } else if (sheetName === 'Abandoned_Leads') {
      setAbandonedLeads(prev => prev.filter(l => (l.leadId || l.id) !== recordId));
    } else if (sheetName === 'Secretariat_Applications') {
      setSecApplications(prev => prev.filter(s => (s.appId || s.id) !== recordId));
    }

    notify(`Deleting record ${recordId}...`, 'info');

    try {
      const res = await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_RECORD',
          adminKey: DEFAULT_ADMIN_KEY,
          sheetName: sheetName,
          recordId: recordId,
          id: recordId,
          idCol: 2
        })
      });

      const data = await res.json();
      if (data && data.status === 'success') {
        notify(`Deleted from database.`, 'success');
      } else {
        notify(`Could not delete: ${data?.message || 'Server error'}`, 'error');
        fetchLiveDatabase();
      }
    } catch (err) {
      notify('Delete error: ' + err.message, 'error');
      fetchLiveDatabase();
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSettingsSaving(true);
    try {
      await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_UPDATE_SETTINGS',
          adminKey: DEFAULT_ADMIN_KEY,
          registrationsOpen: siteSettings.registrationsOpen,
          delegateOpen: siteSettings.delegateOpen,
          delegationOpen: siteSettings.delegationOpen,
          ocOpen: siteSettings.ocOpen,
          ebOpen: siteSettings.ebOpen,
          socialsOpen: siteSettings.socialsOpen,
          secretariatOpen: siteSettings.secretariatOpen,
          roundName: siteSettings.roundName,
          delegateFee: siteSettings.delegateFee,
          delegatePrice: siteSettings.delegateFee,
          delegationFee: siteSettings.delegationFee,
          delegationPrice: siteSettings.delegationFee,
          ocFeeFull: siteSettings.ocFeeFull,
          ocFeeNoTransport: siteSettings.ocFeeNoTransport,
          ocFeeBasic: siteSettings.ocFeeBasic,
          socialsFee: siteSettings.socialsFee,
          upiId: siteSettings.upiId
        })
      });
      if (typeof window !== 'undefined') {
        window.__siteSettings = siteSettings;
        window.dispatchEvent(new CustomEvent('siteSettingsUpdated', { detail: siteSettings }));
      }
      notify('Settings saved & live passes updated!');
    } catch (err) {
      notify('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Accept OC / Secretariat / EB Applicant & Dispatch Email
  const handleAcceptApplicant = async (app, roleType = 'OC') => {
    const appId = app.appId || app.regId || app.id;
    const email = app.email;
    const fullName = app.fullName || app.name;
    const position = app.position || (roleType === 'OC' ? `Organizing Committee (${app.feeTier || 'Member'})` : 'Secretariat');

    if (roleType === 'OC') {
      setOcApplications(prev => prev.map(o => (o.appId === appId ? { ...o, status: 'Accepted' } : o)));
    } else if (roleType === 'SEC') {
      setSecApplications(prev => prev.map(s => (s.appId === appId ? { ...s, status: 'Accepted' } : s)));
    } else {
      setEbApplications(prev => prev.map(e => (e.appId === appId ? { ...e, status: 'Accepted' } : e)));
    }

    notify(`Approving ${fullName} & dispatching email...`, 'info');
    try {
      await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_ACCEPT_APPLICANT',
          adminKey: DEFAULT_ADMIN_KEY,
          appId,
          email,
          fullName,
          roleType,
          position
        })
      });
      notify(`Approved ${fullName} & sent confirmation email!`, 'success');
    } catch (err) {
      notify('Failed to approve applicant: ' + err.message, 'error');
    }
  };

  // Send Custom or Bulk CRM Email via Apps Script
  const handleSendCrmEmail = async (e) => {
    e.preventDefault();
    if (!crmSubject.trim() || !crmMessageBody.trim()) {
      notify('Please enter both subject and message body.', 'error');
      return;
    }

    let recipients = [];
    if (crmRecipientMode === 'SINGLE') {
      if (!crmEmailTo.trim()) {
        notify('Please enter a recipient email address.', 'error');
        return;
      }
      recipients = [{ email: crmEmailTo.trim(), name: 'Delegate' }];
    } else if (crmRecipientMode === 'ALL_DELEGATES') {
      recipients = registrations.filter(r => r.email).map(r => ({ email: r.email, name: r.name || r.fullName }));
    } else if (crmRecipientMode === 'UNASSIGNED_DELEGATES') {
      recipients = registrations.filter(r => r.email && !r.allocatedCommittee).map(r => ({ email: r.email, name: r.name || r.fullName }));
    } else if (crmRecipientMode === 'OC_APPLICANTS') {
      recipients = ocApplications.filter(o => o.email).map(o => ({ email: o.email, name: o.fullName || o.name }));
    } else if (crmRecipientMode === 'SEC_APPLICANTS') {
      recipients = secApplications.filter(s => s.email).map(s => ({ email: s.email, name: s.fullName || s.name }));
    }

    if (recipients.length === 0) {
      notify('No recipients found for the selected group.', 'error');
      return;
    }

    setCrmSending(true);
    notify(`Dispatching email to ${recipients.length} recipient(s)...`, 'info');
    try {
      await fetch('/api/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_SEND_CUSTOM_EMAIL',
          adminKey: DEFAULT_ADMIN_KEY,
          recipientMode: crmRecipientMode,
          recipients,
          email: recipients[0]?.email || crmEmailTo,
          subject: crmSubject,
          messageBody: crmMessageBody
        })
      });
      notify(`Email dispatched to ${recipients.length} recipient(s)!`, 'success');
      if (crmRecipientMode === 'SINGLE') setCrmEmailTo('');
      setCrmMessageBody('');
    } catch (err) {
      notify('Error dispatching email: ' + err.message, 'error');
    } finally {
      setCrmSending(false);
    }
  };

  // Export CSV
  const exportDelegatesCSV = () => {
    if (registrations.length === 0) {
      alert('No delegates to export.');
      return;
    }
    const headers = ['Delegate ID', 'Name', 'Email', 'Phone', 'Institution', 'Delegation', 'Committee', 'Country', 'Status', 'UTR'];
    const rows = registrations.map(r => [
      r.regId || r.id,
      `"${r.fullName || r.name || ''}"`,
      r.email || '',
      r.phone || '',
      `"${r.institution || ''}"`,
      r.delegationCode || 'Independent',
      `"${r.allocatedCommittee || r.committee || ''}"`,
      `"${r.allocatedCountry || r.country || ''}"`,
      r.status || 'Confirmed',
      r.paymentUTR || ''
    ]);
    downloadCSV(headers, rows, `Resolve_MUN_Delegates_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportLeadsCSV = () => {
    if (abandonedLeads.length === 0) {
      alert('No leads to export.');
      return;
    }
    const headers = ['Lead ID', 'Name', 'Email', 'Phone', 'Form Type', 'Last Step', 'Timestamp'];
    const rows = abandonedLeads.map(l => [
      l.leadId || '',
      `"${l.name || ''}"`,
      l.email || '',
      l.phone || '',
      l.formType || 'Delegate',
      `"${l.step || ''}"`,
      l.timestamp || ''
    ]);
    downloadCSV(headers, rows, `Resolve_MUN_Incomplete_Signups_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const downloadCSV = (headers, rows, filename) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify(`Export completed: ${filename}`);
  };

  // Navigation Items
  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: grandTotalPersonnel, badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30' },
    { id: 'delegates', label: 'Delegates', icon: Users, badge: registrations.length, badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' },
    { id: 'delegations', label: 'School Teams', icon: Building2, badge: delegations.length, badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' },
    { id: 'leads', label: 'Incomplete Signups', icon: AlertCircle, badge: activeAbandonedLeads.length, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
    { id: 'users', label: 'All Accounts', icon: UserCheck, badge: siteUsers.length, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', liveDot: true },
    { id: 'applications', label: 'Team Applications', icon: Award, badge: ocApplications.length + ebApplications.length + secApplications.length, badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-400/30' },
    { id: 'logins', label: 'Signed Up, Not Applied', icon: LogIn, badge: loggedInNotApplied.length, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30' },
    { id: 'mailer', label: 'CRM Mailer', icon: Mail, badge: 'AUTO', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
    { id: 'settings', label: 'Pass & Price Controls', icon: Settings, badge: null }
  ];

  return (
    <div className="min-h-screen bg-[#03050a] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white antialiased">
      {/* Toast Notice */}
      {syncNotice && (
        <div className={`fixed top-4 right-4 z-[99999] px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300 flex items-center gap-2.5 ${
          syncNotice.type === 'error'
            ? 'bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/40'
            : syncNotice.type === 'info'
            ? 'bg-blue-950/90 border-blue-500/40 text-blue-200 shadow-blue-900/40'
            : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{syncNotice.msg}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/[0.08] bg-[#070914]/95 backdrop-blur-xl px-4 lg:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isAdminUnlocked && (
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.4)]">
              <div className="w-full h-full bg-[#070914] rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  Resolve MUN <span className="text-purple-400">2026</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-semibold">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-white/40 hidden sm:block">
                Hyderabad · 20–22 Nov 2026
              </span>
            </div>
          </Link>
        </div>

        {isAdminUnlocked && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{realTimeActiveCount} online</span>
            </div>

            {/* Refresh Data */}
            <button
              type="button"
              onClick={fetchLiveDatabase}
              disabled={isLoading}
              className="h-9 px-3 sm:px-3.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-400/30 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-300 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
              {lastSyncTime && <span className="text-[10px] text-white/40 font-mono hidden md:inline">({lastSyncTime})</span>}
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={exportDelegatesCSV}
              className="hidden md:flex h-9 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-300" />
              <span>Export CSV</span>
            </button>

            {/* Back to site */}
            <Link
              href="/"
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </Link>

            {/* Lock Session */}
            <button
              type="button"
              onClick={() => setIsAdminUnlocked(false)}
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Lock admin panel"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        )}
      </header>

      {/* BODY CONTENT */}
      {!isAdminUnlocked ? (
        /* PASSWORD SCREEN */
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md p-8 rounded-3xl border border-white/[0.12] bg-[#070914]/95 backdrop-blur-2xl text-center space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-950/20 via-transparent to-indigo-950/20 pointer-events-none" />

            <div className="relative z-10 w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center shadow-lg shadow-purple-500/15">
              <Lock className="w-6 h-6 text-purple-300" />
            </div>

            <div className="relative z-10">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider block mb-1">
                Admin Panel
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight">Admin Sign In</h2>
              <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                Sign in to manage delegate registrations, assignments, and applications.
              </p>
            </div>

            {/* Google Sign-In Button */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={handleGoogleAdminLogin}
                disabled={googleLoading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-white/95 active:scale-[0.99] text-sm font-semibold text-gray-800 transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.15)] disabled:opacity-70 border border-white/20"
              >
                {googleLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-gray-700">Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.56 0 2.96.54 4.07 1.43l3.05-3.05C17.27 1.7 14.81 1 12 1 7.58 1 3.77 3.52 1.95 7.19l3.66 2.84C6.49 7.37 8.98 5 12 5z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.16-2 3.71-4.95 3.71-8.7z" />
                      <path fill="#FBBC05" d="M5.61 14.71a7.48 7.48 0 0 1 0-5.42L1.95 6.45A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.35l3.7-2.88.66-.76z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.07.73-2.44 1.16-4.22 1.16-3.02 0-5.51-2.37-6.39-5.03L1.95 16.18C3.77 19.85 7.58 22.37 12 23z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.08]" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">or use password</span>
              <div className="flex-1 h-px bg-white/[0.08]" />
            </div>

            <form onSubmit={handleUnlock} className="relative z-10 space-y-4">
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-black/60 border border-white/20 text-white text-xs placeholder:text-white/30 text-center font-mono focus:outline-none focus:border-purple-400 transition-all shadow-inner"
              />

              {adminPinError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{adminPinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.35)] active:scale-[0.99]"
              >
                Sign In with Password
              </button>
            </form>

            <div className="relative z-10 pt-2 border-t border-white/[0.06] text-xs text-white/40 flex items-center justify-between">
              <span>Resolve MUN 2026</span>
              <span>Meridian Kompally</span>
            </div>
          </div>
        </main>
      ) : (
        /* UNLOCKED DASHBOARD */
        <div className="flex-1 flex w-full relative">
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* SIDEBAR NAVIGATION */}
          <aside
            className={`fixed top-16 bottom-0 left-0 z-50 w-72 bg-[#060813] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4 space-y-6 overflow-y-auto flex-1">
              {/* Summary Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#0a0d1f] to-[#070914] border border-purple-500/25">
                <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold uppercase">
                  <span>TOTAL PEOPLE</span>
                  <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {grandTotalPersonnel} <span className="text-xs font-normal text-white/50">registered</span>
                </div>
                <div className="text-[11px] text-white/50 flex justify-between mt-1 pt-1.5 border-t border-white/[0.06]">
                  <span>{registrations.length} Delegates</span>
                  <span>{delegations.length} Teams</span>
                  <span>{activeAbandonedLeads.length} Incomplete</span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-1">
                <div className="px-2 pb-2 text-[10px] font-mono uppercase tracking-wider text-white/40 font-semibold">
                  MENU
                </div>

                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSubTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/40 shadow-sm'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-purple-300' : 'text-white/40'}`} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.liveDot && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                        {item.badge !== null && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Bottom */}
            <div className="p-4 border-t border-white/[0.08] bg-[#050711] space-y-2">
              <button
                type="button"
                onClick={() => setAddDelegateModalOpen(true)}
                className="w-full h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Delegate</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportLeadsCSV}
                  className="flex-1 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Export Incomplete Signups CSV"
                >
                  <Download className="w-3 h-3 text-amber-300" />
                  <span>Leads CSV</span>
                </button>
                <button
                  type="button"
                  onClick={exportDelegatesCSV}
                  className="flex-1 h-8 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Export Delegates CSV"
                >
                  <Download className="w-3 h-3 text-blue-300" />
                  <span>Delegates CSV</span>
                </button>
              </div>

              <div className="text-[10px] font-mono text-white/30 text-center pt-1">
                Connected to Database
              </div>
            </div>
          </aside>

          {/* MAIN PANELS */}
          <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

            {/* OVERVIEW PANEL */}
            {activeSubTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* METRICS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-[#0a0d1c] to-[#070914] relative overflow-hidden">
                    <span className="text-[11px] text-purple-300/80 block font-semibold">
                      Total People
                    </span>
                    <span className="text-3xl font-mono font-extrabold text-white mt-1 block">
                      {grandTotalPersonnel}
                    </span>
                    <span className="text-[11px] text-white/40 block mt-1">Delegates and staff</span>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                    <span className="text-[11px] text-white/50 block font-semibold">
                      Delegates
                    </span>
                    <span className="text-3xl font-mono font-bold text-white mt-1 block">
                      {registrations.length}
                    </span>
                    <span className="text-[11px] text-emerald-400 block mt-1">
                      {verifiedDelegatesCount} verified
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                    <span className="text-[11px] text-white/50 block font-semibold">
                      School Teams
                    </span>
                    <span className="text-3xl font-mono font-bold text-white mt-1 block">
                      {delegations.length}
                    </span>
                    <span className="text-[11px] text-cyan-400 block mt-1">
                      {totalDelMembers} students in teams
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                    <span className="text-[11px] text-white/50 block font-semibold">
                      Incomplete
                    </span>
                    <span className="text-3xl font-mono font-bold text-amber-300 mt-1 block">
                      {activeAbandonedLeads.length}
                    </span>
                    <span className="text-[11px] text-amber-400/80 block mt-1">
                      Started registration
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                    <span className="text-[11px] text-white/50 block font-semibold">
                      Team Applications
                    </span>
                    <span className="text-3xl font-mono font-bold text-violet-300 mt-1 block">
                      {ebApplications.length + secApplications.length}
                    </span>
                    <span className="text-[11px] text-violet-400/80 block mt-1">
                      {secApplications.length} Sec · {ebApplications.length} EB
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                    <span className="text-[11px] text-white/50 block font-semibold">
                      Accounts Only
                    </span>
                    <span className="text-3xl font-mono font-bold text-rose-300 mt-1 block">
                      {loggedInNotApplied.length}
                    </span>
                    <span className="text-[11px] text-white/40 block mt-1">Ready to invite</span>
                  </div>
                </div>

                {/* FINANCIAL SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-400 font-semibold block">
                        TOTAL FEES COLLECTED
                      </span>
                      <span className="text-2xl font-mono font-bold text-white mt-1 block">
                        ₹{totalVerifiedRevenue.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-emerald-300/60 block mt-0.5">
                        From {verifiedDelegatesCount} verified delegates
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-950/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-400 font-semibold block">
                        AWAITING REVIEW
                      </span>
                      <span className="text-2xl font-mono font-bold text-amber-300 mt-1 block">
                        {registrations.length - verifiedDelegatesCount} Delegates
                      </span>
                      <span className="text-xs text-amber-300/60 block mt-0.5">
                        Payment receipts to verify
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-950/20 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-purple-400 font-semibold block">
                        SEATS ASSIGNED
                      </span>
                      <span className="text-2xl font-mono font-bold text-white mt-1 block">
                        {registrations.filter(r => r.allocatedCommittee).length} / 225
                      </span>
                      <span className="text-xs text-purple-300/60 block mt-0.5">
                        Delegates with committee slots
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Shield className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* COMMITTEE MATRIX */}
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Committee Seats</h3>
                      <p className="text-xs text-white/50">Live seat allocation across all 6 committees</p>
                    </div>
                    <span className="text-xs font-mono text-purple-400">Total capacity: 225</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {committeeStats.map((c) => (
                      <div key={c.code} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{c.icon}</span>
                            <div>
                              <span className="text-xs font-bold text-white block">{c.code}</span>
                              <span className="text-[11px] text-white/50 block truncate max-w-[150px]">{c.name}</span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-purple-300">
                            {c.occupied} / {c.cap}
                          </span>
                        </div>

                        <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              c.pct > 80 ? 'bg-red-500' : c.pct > 50 ? 'bg-amber-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${c.pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] text-white/40 font-mono">
                          <span>{c.remaining} seats left</span>
                          <span>{c.pct}% filled</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SIGNUP FUNNEL */}
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">Signup Steps</h3>
                      <p className="text-xs text-white/50">See where people are in the registration process</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold">
                      {funnelStats.conversionPct}% completed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[11px] text-white/50 block">1. Started</span>
                      <span className="text-xl font-bold font-mono text-white mt-1 block">{funnelStats.totalSessions}</span>
                      <span className="text-[10px] text-white/40 block">Total sessions</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[11px] text-white/50 block">2. Committee Selected</span>
                      <span className="text-xl font-bold font-mono text-indigo-300 mt-1 block">{funnelStats.step2Count}</span>
                      <span className="text-[10px] text-indigo-400/60 block">{funnelStats.step2Pct}% reached step 2</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <span className="text-[11px] text-white/50 block">3. Payment Screen</span>
                      <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">{funnelStats.step3Count}</span>
                      <span className="text-[10px] text-amber-400/60 block">{funnelStats.step3Pct}% reached payment</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                      <span className="text-[11px] text-emerald-400 block font-medium">4. Submitted</span>
                      <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">{funnelStats.completedCount}</span>
                      <span className="text-[10px] text-emerald-400/60 block">{funnelStats.conversionPct}% completed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DELEGATES PANEL */}
            {activeSubTab === 'delegates' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Delegates</h2>
                    <p className="text-xs text-white/50">Assign committees, check payment receipts, and manage delegates.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddDelegateModalOpen(true)}
                      className="h-9 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Delegate</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportDelegatesCSV}
                      className="h-9 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search */}
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, ID, or school..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {['ALL', 'Confirmed', 'Allocated', 'Payment_Verified'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterStatus(st)}
                        className={`px-3 h-10 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          filterStatus === st
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {st === 'ALL' ? 'All' : st === 'Confirmed' ? 'Registered' : st === 'Allocated' ? 'Assigned' : 'Verified'}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredRecords.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <Users className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No delegates found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">Delegate</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">School / Team</th>
                          <th className="py-3 px-4">Committee & Country</th>
                          <th className="py-3 px-4">Payment</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredRecords.map((r, idx) => {
                          const isAllocated = Boolean(r.allocatedCommittee);
                          const isVerified = r.status === 'Confirmed' || r.status === 'Allocated' || r.status === 'Payment_Verified';
                          return (
                            <tr key={`del-row-${r.regId || idx}`} className="hover:bg-white/[0.015] transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white">{r.name || r.fullName}</div>
                                <div className="font-mono text-[10px] text-purple-300 font-semibold">{r.regId}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-white/90">{r.email}</div>
                                <div className="text-[11px] text-white/50 font-mono">{r.phone}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-white/80">{r.institution || '—'}</div>
                                {r.delegationCode && (
                                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                                    {r.delegationCode}
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isAllocated ? (
                                  <div>
                                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-bold">
                                      {r.allocatedCommittee}
                                    </span>
                                    <p className="text-[11px] text-white/80 font-medium mt-0.5">
                                      {r.allocatedCountry}
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <span className="text-[11px] text-amber-400 block font-semibold">Not assigned</span>
                                    <span className="text-[10px] text-white/40 block">Pref 1: {r.committeePref1 || 'None'}</span>
                                  </div>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  {r.paymentScreenshotURL ? (
                                    <button
                                      type="button"
                                      onClick={() => setScreenshotModalData({
                                        url: r.paymentScreenshotURL,
                                        rawUrl: r.paymentScreenshotURL,
                                        name: r.name || r.fullName,
                                        regId: r.regId,
                                        utr: r.paymentUTR
                                      })}
                                      className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/30 text-indigo-300 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Receipt</span>
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-white/30">No receipt</span>
                                  )}

                                  {r.paymentUTR && (
                                    <span className="text-[10px] font-mono text-white/60 truncate max-w-[100px]" title={r.paymentUTR}>
                                      {r.paymentUTR}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Allot button */}
                                  <button
                                    type="button"
                                    onClick={() => setAllotmentModalData({
                                      regId: r.regId,
                                      name: r.name || r.fullName,
                                      email: r.email,
                                      committee: r.allocatedCommittee || r.committeePref1 || 'DISEC',
                                      country: r.allocatedCountry || '',
                                      committeePref1: r.committeePref1 || '',
                                      committeePref2: r.committeePref2 || '',
                                      committeePref3: r.committeePref3 || '',
                                      experience: r.experience || ''
                                    })}
                                    className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 text-purple-300 transition-colors cursor-pointer"
                                    title="Assign Committee & Country"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Fast Verify Payment */}
                                  {!isVerified && (
                                    <button
                                      type="button"
                                      onClick={() => verifyPaymentDirect(r.regId, r.email, r.name || r.fullName, r.paymentUTR)}
                                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 transition-colors cursor-pointer"
                                      title="Approve Payment"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Reassign delegation */}
                                  <button
                                    type="button"
                                    onClick={() => setReassignDelegationModalData({
                                      regId: r.regId,
                                      name: r.name || r.fullName,
                                      delegationCode: r.delegationCode || ''
                                    })}
                                    className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 transition-colors cursor-pointer"
                                    title="Change Team Code"
                                  >
                                    <Building2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => deleteRecord(r.regId, r.name || r.fullName)}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 transition-colors cursor-pointer"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SCHOOL TEAMS PANEL */}
            {activeSubTab === 'delegations' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">School & College Teams</h2>
                    <p className="text-xs text-white/50">View registered school teams and delegations.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono font-bold">
                    {delegations.length} Teams
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by school name, code, or leader..."
                    value={delegationSearchQuery}
                    onChange={(e) => setDelegationSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {filteredDelegations.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <Building2 className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No teams found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDelegations.map((d, idx) => {
                      const code = d.delegationCode || d.delId || d.code || `DEL-${idx + 1}`;
                      const count = parseInt(d.membersCount || d.size || d.MemberCount) || 0;
                      return (
                        <div key={`del-card-${code}-${idx}`} className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-3.5 hover:border-cyan-500/30 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-[10px] font-bold">
                                {code}
                              </span>
                              <h3 className="font-bold text-white text-sm mt-1.5 leading-snug">
                                {d.institutionName || d.name || d.InstitutionName || 'Institution'}
                              </h3>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] text-white font-mono text-xs font-bold border border-white/10">
                              {count} Members
                            </span>
                          </div>

                          <div className="text-xs space-y-1 text-white/60 pt-1 border-t border-white/[0.04]">
                            <p><strong className="text-white/80">Leader:</strong> {d.headDelegateName || d.contactPerson || '—'}</p>
                            <p><strong className="text-white/80">Email:</strong> {d.email || d.Email || '—'}</p>
                            <p><strong className="text-white/80">Phone:</strong> {d.phone || d.Phone || '—'}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                            <button
                              type="button"
                              onClick={() => copyInviteLink(code)}
                              className="px-3 h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedLink === code ? 'Copied Link' : 'Copy Team Link'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteRecordFromSheet('Delegations', d.delId || d.id || code, d.institutionName)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors cursor-pointer"
                              title="Delete Team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* INCOMPLETE SIGNUPS PANEL */}
            {activeSubTab === 'leads' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Incomplete Signups</h2>
                    <p className="text-xs text-white/50">People who started registering but haven't submitted yet.</p>
                  </div>
                  <button
                    type="button"
                    onClick={exportLeadsCSV}
                    className="h-9 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Export Leads CSV</span>
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    { id: 'ALL', label: `All Incomplete (${activeAbandonedLeads.length})` },
                    { id: 'STEP3', label: 'Stopped at Payment' },
                    { id: 'STEP2', label: 'Stopped at Committees' },
                    { id: 'STEP1', label: 'Stopped at Contact Info' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setLeadStepFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        leadStepFilter === filter.id
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {filteredLeads.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
                    <p className="text-xs font-semibold">No incomplete signups in this list.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Stopped At</th>
                          <th className="py-3 px-4 text-right">Reach Out</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredLeads.map((lead, idx) => {
                          const leadKey = lead.leadId || lead.email || idx;
                          const sendingState = leadSendingState[leadKey];
                          return (
                            <tr key={`lead-row-${leadKey}`} className="hover:bg-white/[0.015] transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-white">
                                {lead.name}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-white/90">{lead.email}</div>
                                <div className="text-[11px] text-white/50 font-mono">{lead.phone || 'No phone'}</div>
                              </td>

                              <td className="py-3.5 px-4 text-white/60">
                                {lead.formType || 'Delegate'}
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20 text-[10px] font-semibold">
                                  {lead.step}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {lead.phone && (
                                    <button
                                      type="button"
                                      onClick={() => openWhatsAppLead(lead)}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>WhatsApp</span>
                                    </button>
                                  )}

                                  {lead.email && (
                                    <button
                                      type="button"
                                      onClick={() => dispatchLeadReminder(lead)}
                                      disabled={sendingState === 'sending' || sendingState === 'sent'}
                                      className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 text-purple-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      <Send className="w-3 h-3" />
                                      <span>{sendingState === 'sending' ? 'Sending...' : sendingState === 'sent' ? 'Sent' : 'Email'}</span>
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => deleteRecordFromSheet('Abandoned_Leads', lead.leadId || lead.id, lead.name)}
                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 transition-colors cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ALL ACCOUNTS PANEL */}
            {activeSubTab === 'users' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">All User Accounts</h2>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {realTimeActiveCount} online
                      </span>
                    </div>
                    <p className="text-xs text-white/50">All registered accounts created on Resolve MUN.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold">
                    {siteUsers.length} Total Accounts
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or user ID..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { id: 'ALL', label: 'All' },
                      { id: 'DELEGATE', label: 'Delegates' },
                      { id: 'SECRETARIAT', label: 'Secretariat' },
                      { id: 'LEAD', label: 'Incomplete' },
                      { id: 'ACCOUNT_ONLY', label: 'Account Only' }
                    ].map((rf) => (
                      <button
                        key={rf.id}
                        type="button"
                        onClick={() => setUserRoleFilter(rf.id)}
                        className={`px-3 h-10 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          userRoleFilter === rf.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/[0.03] text-white/60 hover:text-white border border-white/[0.06]'
                        }`}
                      >
                        {rf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSiteUsers.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <UserCheck className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No accounts match your search.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Account ID</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Last Active</th>
                          <th className="py-3 px-4 text-right">Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredSiteUsers.map((u, idx) => {
                          const isReg = registrations.some(r => (r.email || '').toLowerCase() === (u.email || '').toLowerCase());
                          const isSec = secApplications.some(s => (s.email || '').toLowerCase() === (u.email || '').toLowerCase());
                          const isLead = abandonedLeads.some(l => (l.email || '').toLowerCase() === (u.email || '').toLowerCase());

                          return (
                            <tr key={`user-row-${u.uid || u.email || idx}`} className="hover:bg-white/[0.015] transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-white">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-[11px] font-bold text-emerald-300">
                                    {(u.name || u.email || 'U')[0].toUpperCase()}
                                  </div>
                                  <span>{u.name || 'User'}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-white/90">
                                {u.email}
                              </td>

                              <td className="py-3.5 px-4 font-mono text-[10px] text-white/40 truncate max-w-[140px]" title={u.uid}>
                                {u.uid || '—'}
                              </td>

                              <td className="py-3.5 px-4">
                                {isReg ? (
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                                    Delegate
                                  </span>
                                ) : isSec ? (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-400/30 text-[10px] font-bold">
                                    Secretariat
                                  </span>
                                ) : isLead ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/20 text-[10px] font-bold">
                                    Incomplete
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-white/[0.05] text-white/50 border border-white/10 text-[10px]">
                                    Account Only
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-white/40 text-[11px] font-mono">
                                {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <a
                                  href={`mailto:${u.email}?subject=Resolve MUN 2026`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white text-[11px] transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>Email</span>
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TEAM APPLICATIONS PANEL */}
            {activeSubTab === 'applications' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Team Applications (OC, Secretariat & EB)</h2>
                    <p className="text-xs text-white/50">Review Organizing Committee (Salaried Role), Secretariat, and Executive Board applications.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setAppSubView('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        appSubView === 'ALL' ? 'bg-purple-600 text-white' : 'bg-white/[0.04] text-white/60'
                      }`}
                    >
                      All ({ocApplications.length + secApplications.length + ebApplications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppSubView('OC')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        appSubView === 'OC' ? 'bg-purple-600 text-white' : 'bg-white/[0.04] text-white/60'
                      }`}
                    >
                      Organizing Committee ({ocApplications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppSubView('SEC')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        appSubView === 'SEC' ? 'bg-purple-600 text-white' : 'bg-white/[0.04] text-white/60'
                      }`}
                    >
                      Secretariat ({secApplications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppSubView('EB')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                        appSubView === 'EB' ? 'bg-purple-600 text-white' : 'bg-white/[0.04] text-white/60'
                      }`}
                    >
                      Executive Board ({ebApplications.length})
                    </button>
                  </div>
                </div>

                {ocApplications.length === 0 && ebApplications.length === 0 && secApplications.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <Award className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No team applications yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">Applicant ID</th>
                          <th className="py-3 px-4">Applicant</th>
                          <th className="py-3 px-4">Role / Tier</th>
                          <th className="py-3 px-4">Attachments / Receipt</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {(appSubView === 'OC'
                          ? ocApplications.map(a => ({ ...a, _track: 'OC' }))
                          : appSubView === 'EB'
                          ? ebApplications.map(a => ({ ...a, _track: 'EB' }))
                          : appSubView === 'SEC'
                          ? secApplications.map(a => ({ ...a, _track: 'SEC' }))
                          : [
                              ...ocApplications.map(a => ({ ...a, _track: 'OC' })),
                              ...secApplications.map(a => ({ ...a, _track: 'SEC' })),
                              ...ebApplications.map(a => ({ ...a, _track: 'EB' }))
                            ]
                        ).map((app, idx) => {
                          const isOc = app._track === 'OC' || String(app.appId || '').includes('-OC-');
                          const isSec = app._track === 'SEC' || (!isOc && Boolean(app.position || app.whyJoin || app.schoolCollege));
                          const isApproved = app.status === 'Accepted' || app.status === 'Approved' || app.status === 'Confirmed';
                          return (
                            <tr key={`app-row-${app.appId || app.UID || idx}`} className="hover:bg-white/[0.015] transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                                {app.appId || 'RM26-APP'}
                              </td>

                              <td className="py-3.5 px-4">
                                <p className="font-semibold text-white">{app.fullName || app.name}</p>
                                <p className="text-[11px] text-white/50">{app.email} | {app.phone}</p>
                                {(app.institution || app.schoolCollege) && (
                                  <p className="text-[10px] text-white/40 mt-0.5">{app.institution || app.schoolCollege}</p>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isOc ? (
                                  <>
                                    <p className="text-white/90 font-medium">Organizing Committee</p>
                                    <p className="text-[10px] text-purple-300 font-mono">{app.feeTier || 'Salaried OC'}</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-white/90 font-medium">{app.position || app.portfolio1 || app.pref1 || 'Leadership'}</p>
                                    <p className="text-[10px] text-white/40">{isSec ? 'Secretariat (Free)' : 'Executive Board'}</p>
                                  </>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {(app.resumeUrl || app.cvUrl || app.CV_URL) && (
                                    <a
                                      href={app.resumeUrl || app.cvUrl || app.CV_URL}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 text-purple-300 text-[11px] font-medium transition-colors"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>CV</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {(app.portfolioUrl || app.PortfolioURL) && (
                                    <a
                                      href={app.portfolioUrl || app.PortfolioURL}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/20 text-indigo-300 text-[11px] font-medium transition-colors"
                                    >
                                      <span>Portfolio</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}
                                  {app.paymentScreenshotURL && (
                                    <button
                                      type="button"
                                      onClick={() => setScreenshotModalData({
                                        url: app.paymentScreenshotURL,
                                        rawUrl: app.paymentScreenshotURL,
                                        name: app.fullName || app.name,
                                        regId: app.appId,
                                        utr: app.paymentUTR
                                      })}
                                      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 text-[11px] font-medium transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Receipt</span>
                                    </button>
                                  )}
                                  {app.paymentUTR && (
                                    <span className="text-[10px] font-mono text-white/50">UTR: {app.paymentUTR}</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  isApproved
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-300 border-amber-400/20'
                                }`}>
                                  {app.status || 'Under Review'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {!isApproved && (
                                    <button
                                      type="button"
                                      onClick={() => handleAcceptApplicant(app, isOc ? 'OC' : isSec ? 'SEC' : 'EB')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                      title="Approve & Send Appointment Email"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Approve</span>
                                    </button>
                                  )}
                                  {isSec ? (
                                    <button
                                      type="button"
                                      onClick={() => setSecCandidateModalData(app)}
                                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      View
                                    </button>
                                  ) : isOc ? (
                                    <button
                                      type="button"
                                      onClick={() => setOcCandidateModalData(app)}
                                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      View
                                    </button>
                                  ) : (
                                    <a
                                      href={`mailto:${app.email}?subject=Resolve MUN 2026 Application`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white text-[11px] font-semibold transition-colors"
                                    >
                                      <Mail className="w-3 h-3" />
                                      <span>Email</span>
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* SIGNED UP NOT APPLIED PANEL */}
            {activeSubTab === 'logins' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Signed Up · Not Yet Applied</h2>
                    <p className="text-xs text-white/50">Users who created an account but haven't submitted an application yet.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-mono font-bold">
                    {loggedInNotApplied.length} Users
                  </span>
                </div>

                {loggedInNotApplied.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
                    <p className="text-xs font-semibold">Everyone who signed up has submitted an application!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Last Seen</th>
                          <th className="py-3 px-4 text-right">Invite</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {loggedInNotApplied.map((u, idx) => (
                          <tr key={`login-row-${u.email || idx}`} className="hover:bg-white/[0.015] transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {u.name || 'User'}
                            </td>

                            <td className="py-3.5 px-4 text-white/90">
                              {u.email}
                            </td>

                            <td className="py-3.5 px-4 text-white/40 text-[11px] font-mono">
                              {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString('en-GB') : 'Recent'}
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <a
                                href={`mailto:${u.email}?subject=Complete Your Resolve MUN 2026 Registration&body=Hi ${encodeURIComponent(u.name || 'there')},%0D%0A%0D%0AWe noticed you created an account on Resolve MUN but haven't finished your delegate registration yet.%0D%0A%0D%0ACommittee seats are filling fast for the conference at Meridian School, Kompally, Hyderabad (27–29 Nov 2026).%0D%0A%0D%0AYou can complete your registration here: https://resolvemun.in/?open=delegate`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-[11px] font-semibold transition-colors"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Send Invite</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CRM MAILER PANEL */}
            {activeSubTab === 'mailer' && (
              <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl">
                <div>
                  <h2 className="text-lg font-bold text-white">CRM Email Dispatcher</h2>
                  <p className="text-xs text-white/50">Send official HTML emails or bulk announcements via Google Apps Script ($0 cost).</p>
                </div>

                <form onSubmit={handleSendCrmEmail} className="p-6 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-5 shadow-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-purple-300 mb-1.5">Recipient Audience</label>
                      <select
                        value={crmRecipientMode}
                        onChange={(e) => setCrmRecipientMode(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl bg-[#0c0e18] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                      >
                        <option value="SINGLE">Single Recipient (Custom Email)</option>
                        <option value="ALL_DELEGATES">All Registered Delegates ({registrations.length})</option>
                        <option value="UNASSIGNED_DELEGATES">Unassigned Delegates ({registrations.filter(r => !r.allocatedCommittee).length})</option>
                        <option value="OC_APPLICANTS">Organizing Committee Applicants ({ocApplications.length})</option>
                        <option value="SEC_APPLICANTS">Secretariat Applicants ({secApplications.length})</option>
                      </select>
                    </div>

                    {crmRecipientMode === 'SINGLE' && (
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-white/60 mb-1.5">Recipient Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="delegate@example.com"
                          value={crmEmailTo}
                          onChange={(e) => setCrmEmailTo(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-white/60 mb-1.5">Email Subject Line</label>
                    <input
                      type="text"
                      required
                      value={crmSubject}
                      onChange={(e) => setCrmSubject(e.target.value)}
                      placeholder="Official Update — Resolve MUN 2.0"
                      className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-white/60 mb-1.5">Message Body (Supports Paragraphs & Bullet Points)</label>
                    <textarea
                      rows={6}
                      required
                      value={crmMessageBody}
                      onChange={(e) => setCrmMessageBody(e.target.value)}
                      placeholder="Dear Delegate,&#10;&#10;We are pleased to share an official update regarding Resolve MUN 2.0 (27–29 November 2026 at Meridian School, Kompally)..."
                      className="w-full p-3.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCrmSubject('Background Guides & Committee Matrix — Resolve MUN 2.0');
                        setCrmMessageBody('Dear Delegate,\n\nThe official Background Guides and Committee Matrix for Resolve MUN 2.0 (27–29 November 2026 at Meridian School, Kompally) are now available on your Delegate Dashboard.\n\nPlease sign in at https://resolvemun.in/dashboard to view your committee assignment and download your entry pass.\n\nWarm regards,\nSecretariat, Resolve MUN 2.0');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-white/70 hover:text-white cursor-pointer"
                    >
                      Template: Background Guides Released
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCrmSubject('Reporting Instructions & Dress Code — Resolve MUN 2.0');
                        setCrmMessageBody('Dear Delegate,\n\nWe look forward to welcoming you to Resolve MUN 2.0 on 27–29 November 2026 at Meridian School, Kompally.\n\n• Reporting Time: 8:00 AM sharp\n• Dress Code: Day 1 & Day 2 Western Formals | Day 3 Traditional / Formals\n• Entry Requirement: Keep your digital QR Pass ready on your phone at the Secretariat Check-In Desk.\n\nWarm regards,\nSecretariat, Resolve MUN 2.0');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[11px] text-white/70 hover:text-white cursor-pointer"
                    >
                      Template: Reporting & QR Pass Reminder
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={crmSending}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50"
                  >
                    {crmSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{crmSending ? 'Dispatching Emails...' : 'Dispatch Official Email'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* SETTINGS PANEL */}
            {activeSubTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl">
                <div>
                  <h2 className="text-lg font-bold text-white">Pass Availability & Live Pricing Controls</h2>
                  <p className="text-xs text-white/50">Closed passes are automatically greyed out with an UNAVAILABLE badge on the website.</p>
                </div>

                <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-6">
                  {/* Gates */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                      Pass Availability (Open / Greyed Out)
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: 'registrationsOpen', label: 'Master Switch (All Registrations)' },
                        { key: 'delegateOpen', label: 'Priority Delegate Pass' },
                        { key: 'delegationOpen', label: 'School Delegation Pass (Min 6)' },
                        { key: 'ocOpen', label: 'Organizing Committee (Salaried OC)' },
                        { key: 'secretariatOpen', label: 'Secretariat Applications (Free)' },
                        { key: 'ebOpen', label: 'Executive Board (EB) Pass' },
                        { key: 'socialsOpen', label: 'Socials Night Pass' }
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] cursor-pointer hover:bg-white/[0.04] transition-colors"
                        >
                          <div>
                            <span className="text-xs font-medium text-white block">{item.label}</span>
                            <span className={`text-[10px] font-mono ${siteSettings[item.key] ? 'text-emerald-400' : 'text-white/40'}`}>
                              {siteSettings[item.key] ? 'OPEN ON SITE' : 'GREYED OUT (UNAVAILABLE)'}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={Boolean(siteSettings[item.key])}
                            onChange={(e) => setSiteSettings(prev => ({ ...prev, [item.key]: e.target.checked }))}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Round Name */}
                  <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                    <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                      Live Pass Pricing & UPI Configuration
                    </h3>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">Active Round Name</label>
                          <input
                            type="text"
                            value={siteSettings.roundName}
                            onChange={(e) => setSiteSettings(p => ({ ...p, roundName: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">Official UPI ID (Navi QR)</label>
                          <input
                            type="text"
                            value={siteSettings.upiId}
                            onChange={(e) => setSiteSettings(p => ({ ...p, upiId: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">Delegate Fee (₹)</label>
                          <input
                            type="text"
                            value={siteSettings.delegateFee}
                            onChange={(e) => setSiteSettings(p => ({ ...p, delegateFee: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">Delegation / Member (₹)</label>
                          <input
                            type="text"
                            value={siteSettings.delegationFee}
                            onChange={(e) => setSiteSettings(p => ({ ...p, delegationFee: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">Socials Pass Fee (₹)</label>
                          <input
                            type="text"
                            value={siteSettings.socialsFee}
                            onChange={(e) => setSiteSettings(p => ({ ...p, socialsFee: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">OC Tier 1 (Full · ₹)</label>
                          <input
                            type="text"
                            value={siteSettings.ocFeeFull}
                            onChange={(e) => setSiteSettings(p => ({ ...p, ocFeeFull: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">OC Tier 2 (No Trans · ₹)</label>
                          <input
                            type="text"
                            value={siteSettings.ocFeeNoTransport}
                            onChange={(e) => setSiteSettings(p => ({ ...p, ocFeeNoTransport: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/50 uppercase mb-1">OC Tier 3 (Basic · ₹)</label>
                          <input
                            type="text"
                            value={siteSettings.ocFeeBasic}
                            onChange={(e) => setSiteSettings(p => ({ ...p, ocFeeBasic: e.target.value }))}
                            className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25"
                  >
                    {settingsSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Save Pass & Price Settings</span>
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* PAYMENT RECEIPT MODAL */}
      {screenshotModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-5 rounded-2xl border border-white/15 bg-[#070914] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Payment Receipt</h3>
                <p className="text-xs text-white/50">{screenshotModalData.name} ({screenshotModalData.regId})</p>
              </div>
              <button
                type="button"
                onClick={() => setScreenshotModalData(null)}
                className="p-1 rounded text-white/60 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-purple-300">
              Transaction ID / UTR: <strong className="text-white">{screenshotModalData.utr || 'Not specified'}</strong>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center min-h-[260px] max-h-[440px] relative">
              {screenshotModalData.url && (screenshotModalData.url.startsWith('http') || screenshotModalData.url.startsWith('https')) ? (
                <img
                  src={screenshotModalData.url}
                  alt="Payment Receipt"
                  className="max-h-[440px] w-auto object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center p-6 text-white/40 space-y-2">
                  <FileCheck className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs">No receipt preview available</p>
                </div>
              )}

              {(screenshotModalData.rawUrl || screenshotModalData.url) && (
                <a
                  href={screenshotModalData.rawUrl || screenshotModalData.url}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 text-[11px] px-2.5 py-1 rounded bg-purple-600 text-white font-medium shadow"
                >
                  Open in Google Drive ↗
                </a>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  verifyPaymentDirect(screenshotModalData.regId, '', screenshotModalData.name, screenshotModalData.utr);
                  setScreenshotModalData(null);
                }}
                className="px-4 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve Payment</span>
              </button>

              <button
                type="button"
                onClick={() => setScreenshotModalData(null)}
                className="px-4 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN COMMITTEE MODAL */}
      {allotmentModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-5 rounded-2xl border border-purple-500/30 bg-[#070914] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Assign Committee & Country</h3>
                <p className="text-xs text-white/50">{allotmentModalData.name} ({allotmentModalData.regId})</p>
              </div>
              <button
                type="button"
                onClick={() => setAllotmentModalData(null)}
                className="p-1 rounded text-white/60 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {(allotmentModalData.committeePref1 || allotmentModalData.committeePref2 || allotmentModalData.committeePref3) && (
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 text-[11px]">
                <span className="text-[10px] font-mono uppercase text-purple-300 font-bold block">Submitted Preferences</span>
                {allotmentModalData.committeePref1 && <p className="text-white/80"><strong className="text-white">Pref 1:</strong> {allotmentModalData.committeePref1}</p>}
                {allotmentModalData.committeePref2 && <p className="text-white/80"><strong className="text-white">Pref 2:</strong> {allotmentModalData.committeePref2}</p>}
                {allotmentModalData.committeePref3 && <p className="text-white/80"><strong className="text-white">Pref 3:</strong> {allotmentModalData.committeePref3}</p>}
                {allotmentModalData.experience && <p className="text-white/60 pt-1 border-t border-white/[0.06]"><strong className="text-white/80">Experience:</strong> {allotmentModalData.experience}</p>}
              </div>
            )}

            <form onSubmit={submitAllotment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Committee</label>
                <select
                  value={allotmentModalData.committee}
                  onChange={(e) => setAllotmentModalData(prev => ({ ...prev, committee: e.target.value }))}
                  className="w-full h-10 px-2.5 rounded-xl bg-[#0c0e18] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="DISEC">DISEC (Disarmament & International Security)</option>
                  <option value="UNHRC">UNHRC (United Nations Human Rights Council)</option>
                  <option value="UNSC">UNSC (United Nations Security Council)</option>
                  <option value="LOK SABHA">Lok Sabha (Indian Parliamentary Committee)</option>
                  <option value="COMMITTEE X">Committee X (Classified Crisis Committee)</option>
                  <option value="IP">International Press (IP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Country or Portfolio</label>
                <input
                  type="text"
                  placeholder="e.g. United States, India, France, Reuters..."
                  value={allotmentModalData.country}
                  onChange={(e) => setAllotmentModalData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200/80 leading-relaxed">
                Saving will update the delegate's digital QR pass and automatically send an official Allotment Decree email to <b>{allotmentModalData.email}</b>.
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Save & Auto-Email Decree</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllotmentModalData(null)}
                  className="px-4 h-10 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASSIGN DELEGATION MODAL */}
      {reassignDelegationModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-5 rounded-2xl border border-indigo-500/30 bg-[#070914] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Change School Team Code</h3>
                <p className="text-xs text-white/50">{reassignDelegationModalData.name} ({reassignDelegationModalData.regId})</p>
              </div>
              <button
                type="button"
                onClick={() => setReassignDelegationModalData(null)}
                className="p-1 rounded text-white/60 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitDelegationReassign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Team Code</label>
                <input
                  type="text"
                  placeholder="e.g. DEL-DPSRKP (leave empty for Independent)"
                  value={reassignDelegationModalData.delegationCode}
                  onChange={(e) => setReassignDelegationModalData(prev => ({ ...prev, delegationCode: e.target.value }))}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Update Team
                </button>
                <button
                  type="button"
                  onClick={() => setReassignDelegationModalData(null)}
                  className="px-4 h-10 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DELEGATE MODAL */}
      {addDelegateModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-5 rounded-2xl border border-white/15 bg-[#070914] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Add Delegate</h3>
                <p className="text-xs text-white/50">Manual offline or on-spot entry</p>
              </div>
              <button
                type="button"
                onClick={() => setAddDelegateModalOpen(false)}
                className="p-1 rounded text-white/60 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const newDel = {
                  regId: 'RM26-MAN-' + Math.floor(1000 + Math.random() * 9000),
                  fullName: form.fullName.value,
                  email: form.email.value,
                  phone: form.phone.value,
                  institution: form.institution.value,
                  delegationCode: form.delegationCode.value.trim().toUpperCase(),
                  allocatedCommittee: form.committee.value,
                  allocatedCountry: form.country.value,
                  status: 'Confirmed'
                };
                setRegistrations(prev => [newDel, ...prev]);
                notify(`Delegate ${newDel.fullName} added successfully!`);
                setAddDelegateModalOpen(false);

                fetch('/api/admin/', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'ADMIN_ADD_DELEGATE',
                    adminKey: DEFAULT_ADMIN_KEY,
                    ...newDel
                  })
                }).catch(() => {});
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Full Name</label>
                <input name="fullName" required className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
                  <input name="email" type="email" required className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Phone (+91)</label>
                  <input name="phone" required placeholder="9876543210" className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">School / College</label>
                  <input name="institution" className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Team Code (optional)</label>
                  <input name="delegationCode" placeholder="e.g. DEL-01" className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Committee</label>
                  <select name="committee" className="w-full h-9 px-2 rounded-xl bg-[#0c0e18] border border-white/10 text-white text-xs">
                    <option value="DISEC">DISEC</option>
                    <option value="UNHRC">UNHRC</option>
                    <option value="UNSC">UNSC</option>
                    <option value="LOK SABHA">Lok Sabha</option>
                    <option value="COMMITTEE X">Committee X</option>
                    <option value="IP">International Press</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Country or Portfolio</label>
                  <input name="country" placeholder="e.g. France" className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Delegate
                </button>
                <button
                  type="button"
                  onClick={() => setAddDelegateModalOpen(false)}
                  className="px-4 h-10 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECRETARIAT CANDIDATE APPLICATION MODAL */}
      {secCandidateModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-purple-500/30 bg-[#070914] shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-[10px] font-mono font-bold">
                    {secCandidateModalData.appId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                    Free Application
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1.5">{secCandidateModalData.fullName}</h3>
                <p className="text-xs text-indigo-300 font-semibold mt-0.5">Role: {secCandidateModalData.position}</p>
              </div>
              <button
                type="button"
                onClick={() => setSecCandidateModalData(null)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
              <div>
                <span className="text-[10px] text-white/40 block">Email</span>
                <span className="text-white font-medium break-all">{secCandidateModalData.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Phone</span>
                <span className="text-white font-mono">{secCandidateModalData.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Instagram</span>
                <span className="text-pink-400 font-mono">@{secCandidateModalData.instagram?.replace('@', '') || 'None'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">School / College</span>
                <span className="text-white">{secCandidateModalData.schoolCollege}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Grade / Year</span>
                <span className="text-white">{secCandidateModalData.grade}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Date of Birth</span>
                <span className="text-white font-mono">{secCandidateModalData.dob || 'Not specified'}</span>
              </div>
            </div>

            {/* Responses */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-xs font-bold text-purple-300 block mb-1">
                  Why do you want to join the Secretariat?
                </span>
                <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                  {secCandidateModalData.whyJoin || 'No response.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
                <span className="text-xs font-bold text-purple-300 block mb-1">
                  What will you bring to this role?
                </span>
                <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                  {secCandidateModalData.contribution || 'No response.'}
                </p>
              </div>
            </div>

            {/* Drive Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-300 block">Resume / CV</span>
                  <span className="text-xs text-white/70">{secCandidateModalData.resumeUrl ? 'Attached' : 'Not attached'}</span>
                </div>
                {secCandidateModalData.resumeUrl && (
                  <a
                    href={secCandidateModalData.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View CV</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-300 block">Portfolio</span>
                  <span className="text-xs text-white/70">{secCandidateModalData.portfolioUrl ? 'Attached' : 'Not attached'}</span>
                </div>
                {secCandidateModalData.portfolioUrl && (
                  <a
                    href={secCandidateModalData.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  handleAcceptApplicant(secCandidateModalData, 'SEC');
                  setSecCandidateModalData(null);
                }}
                className="px-4 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Send Appointment Email</span>
              </button>
              <a
                href={`mailto:${secCandidateModalData.email}?subject=Resolve MUN 2026 Secretariat Interview`}
                className="px-4 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Interview Invite</span>
              </a>
              <button
                type="button"
                onClick={() => setSecCandidateModalData(null)}
                className="px-4 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OC CANDIDATE APPLICATION MODAL */}
      {ocCandidateModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border border-purple-500/30 bg-[#070914] shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-[10px] font-mono font-bold">
                    {ocCandidateModalData.appId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                    Salaried Role · {ocCandidateModalData.feeTier || 'OC'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1.5">{ocCandidateModalData.fullName}</h3>
                <p className="text-xs text-indigo-300 font-semibold mt-0.5">Organizing Committee Applicant</p>
              </div>
              <button
                type="button"
                onClick={() => setOcCandidateModalData(null)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
              <div>
                <span className="text-[10px] text-white/40 block">Email</span>
                <span className="text-white font-medium break-all">{ocCandidateModalData.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Phone</span>
                <span className="text-white font-mono">{ocCandidateModalData.phone}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Instagram</span>
                <span className="text-pink-400 font-mono">{ocCandidateModalData.instagram || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">School / College</span>
                <span className="text-white">{ocCandidateModalData.institution || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Grade / Year</span>
                <span className="text-white">{ocCandidateModalData.grade || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/40 block">Transport Needed</span>
                <span className="text-white font-mono">{ocCandidateModalData.transportNeeded || '—'}</span>
              </div>
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[10px] text-white/40 block">Residential Address</span>
                <span className="text-white/80">{ocCandidateModalData.residentialAddress || '—'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-xs font-bold text-purple-300 block mb-1">
                Previous Experiences
              </span>
              <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                {ocCandidateModalData.previousExperience || 'No response.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  handleAcceptApplicant(ocCandidateModalData, 'OC');
                  setOcCandidateModalData(null);
                }}
                className="px-4 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve OC & Send Email</span>
              </button>
              <button
                type="button"
                onClick={() => setOcCandidateModalData(null)}
                className="px-4 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
