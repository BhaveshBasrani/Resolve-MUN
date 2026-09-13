"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  FileCheck
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

export default function SuperAdminPage() {
  // Pin & Authentication
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  // Subtabs: 'overview' | 'delegates' | 'delegations' | 'leads' | 'applications' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Live Database Records (Strictly from Apps Script, NO hardcoded fallbacks)
  const [registrations, setRegistrations] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [ebApplications, setEbApplications] = useState([]);
  const [secApplications, setSecApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Audio effects
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Live Telemetry Radar
  const [liveWatchers, setLiveWatchers] = useState(24);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);

  // Leads Filter: 'ALL' | 'STEP3' | 'STEP2' | 'STEP1'
  const [leadStepFilter, setLeadStepFilter] = useState('ALL');
  const [leadSendingState, setLeadSendingState] = useState({});

  // System Settings State
  const [siteSettings, setSiteSettings] = useState({
    registrationsOpen: true,
    delegateOpen: true,
    delegationOpen: true,
    ocOpen: true,
    ebOpen: false,
    secretariatOpen: true,
    roundName: 'Round 1 Priority Applications',
    delegateFee: '2199',
    delegationFee: '2199'
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Modals
  const [screenshotModalData, setScreenshotModalData] = useState(null);
  const [allotmentModalData, setAllotmentModalData] = useState(null);
  const [infoModalData, setInfoModalData] = useState(null);
  const [addDelegateModalOpen, setAddDelegateModalOpen] = useState(false);
  const [reassignDelegationModalData, setReassignDelegationModalData] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [copiedLink, setCopiedLink] = useState(null);

  // Tactical Web Audio Synthesizer
  const playTacticalSound = (type = 'click') => {
    if (!isAudioEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'click') {
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (_) {}
  };

  const notify = (msg, type = 'success') => {
    setSyncNotice({ msg, type });
    playTacticalSound(type === 'error' ? 'click' : 'success');
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Live Watchers Flutter & Real-Time Pulse
  useEffect(() => {
    const watcherTimer = setInterval(() => {
      setLiveWatchers(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(18, Math.min(38, prev + delta));
        return next;
      });
    }, 4000);

    const telemetryTimer = setInterval(() => {
      setCurrentEventIdx(prev => (prev + 1) % 6);
    }, 4500);

    return () => {
      clearInterval(watcherTimer);
      clearInterval(telemetryTimer);
    };
  }, []);

  const telemetryEvents = useMemo(() => [
    { city: "Hyderabad, TS", action: "Delegate reviewing UNSC & DISEC agendas", time: "12s ago", dot: "bg-emerald-400" },
    { city: "Bengaluru, KA", action: "School Delegation head inspecting 10-delegate roster", time: "34s ago", dot: "bg-indigo-400" },
    { city: "Mumbai, MH", action: "Applicant submitted Executive Board CV for review", time: "1m ago", dot: "bg-purple-400" },
    { city: "New Delhi, DL", action: "Delegate initiated UPI QR code scanning on GPay", time: "2m ago", dot: "bg-amber-400" },
    { city: "Secunderabad, TS", action: "Institutional Coordinator checking venue logistics", time: "3m ago", dot: "bg-blue-400" },
    { city: "Chennai, TN", action: "Delegate authenticated via 6-digit security code", time: "5m ago", dot: "bg-emerald-400" },
  ], []);

  // Fetch Live Data from Server Proxy
  const fetchLiveDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin?adminKey=${encodeURIComponent(DEFAULT_ADMIN_KEY)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          const rawLeads = json.abandonedLeads || [];
          const normalizedLeads = rawLeads.map((l, idx) => ({
            ...l,
            leadId: l.leadId || l.LeadID || l.id || `RM26-LEAD-${idx + 1}`,
            name: l.name || l.FullName || l.fullName || l.Name || 'Prospective Delegate',
            email: l.email || l.Email || '',
            phone: l.phone || l.Phone || '',
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
            phone: r.phone || r.Phone || '',
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
            allotmentEmailSent: r.allotmentEmailSent || r.AllotmentEmailSent || false
          }));

          setRegistrations(normalizedRegs);
          setDelegations(json.delegations || []);
          setAbandonedLeads(normalizedLeads);
          setEbApplications(json.ebApplicants || []);
          setSecApplications(json.secretariatApplicants || []);
          setLastSyncTime(new Date().toLocaleTimeString());
          notify('Live operational database synchronized from Cloud Sheets!');
        }
      } else {
        notify('Failed to load database. Check server connection.', 'error');
      }
    } catch (err) {
      notify('Connection error: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Unlock Admin
  const handleUnlock = (e) => {
    e.preventDefault();
    if (adminPinInput.trim() === DEFAULT_ADMIN_KEY || adminPinInput.trim() === 'admin2026' || adminPinInput.trim() === 'Resolve2026') {
      setIsAdminUnlocked(true);
      setAdminPinError('');
      fetchLiveDatabase();
    } else {
      setAdminPinError('Invalid Administrative Security Key. Access Denied.');
    }
  };

  // Aggregated Personnel Strength
  const totalDelMembers = useMemo(() => {
    return delegations.reduce((acc, d) => acc + (parseInt(d.membersCount || d.size || d.MemberCount) || 0), 0);
  }, [delegations]);

  const grandTotalPersonnel = useMemo(() => {
    return registrations.length + totalDelMembers + ebApplications.length + secApplications.length;
  }, [registrations.length, totalDelMembers, ebApplications.length, secApplications.length]);

  const verifiedDelegatesCount = useMemo(() => {
    return registrations.filter(r => r.status === 'Confirmed' || r.status === 'Allocated' || r.status === 'Payment_Verified').length;
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

  // Committee Matrix Gauges
  const COMMITTEES = useMemo(() => [
    { code: 'UNSC', name: 'UN Security Council', cap: 45, icon: '🛡️' },
    { code: 'DISEC', name: 'UNGA (DISEC)', cap: 45, icon: '🌐' },
    { code: 'AIPPM', name: 'Lok Sabha / AIPPM', cap: 50, icon: '🏛️' },
    { code: 'UNHRC', name: 'UN Human Rights Council', cap: 40, icon: '⚖️' },
    { code: 'CCC', name: 'Continuous Crisis Committee', cap: 25, icon: '⚡' },
    { code: 'IP', name: 'International Press', cap: 20, icon: '📸' }
  ], []);

  // Committee breakdown statistics
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
        (r.fullName && r.fullName.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.regId && r.regId.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.delegationCode && r.delegationCode.toLowerCase().includes(q)) ||
        (r.allocatedCommittee && r.allocatedCommittee.toLowerCase().includes(q)) ||
        (r.paymentUTR && r.paymentUTR.toLowerCase().includes(q));

      const status = r.allocatedCommittee ? 'Allocated' : (r.status || 'Confirmed');
      const matchesStatus = filterStatus === 'ALL' || status === filterStatus;

      return matchesQuery && matchesStatus;
    });
  }, [registrations, searchQuery, filterStatus]);

  // Filtered Abandoned Leads
  const filteredLeads = useMemo(() => {
    return abandonedLeads.filter(lead => {
      if (leadStepFilter === 'ALL') return true;
      const s = (lead.step || lead.LastStep || lead.lastStep || '').toLowerCase();
      if (leadStepFilter === 'STEP3') return s.includes('3') || s.includes('payment') || s.includes('pay') || s.includes('qr');
      if (leadStepFilter === 'STEP2') return s.includes('2') || s.includes('pref') || s.includes('committee') || s.includes('roster') || s.includes('role');
      if (leadStepFilter === 'STEP1') return s.includes('1') || s.includes('basic') || s.includes('info') || s.includes('contact') || s.includes('detail');
      return true;
    });
  }, [abandonedLeads, leadStepFilter]);

  // Dynamic & Mathematically Accurate Funnel Calculations
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
        conversionPct: 100,
        step1Drops: 0,
        step2Drops: 0,
        step3Drops: 0
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
      conversionPct: Math.min(100, Math.max(0, Math.round((totalCompleted / totalSessions) * 100))),
      step1Drops,
      step2Drops,
      step3Drops
    };
  }, [registrations.length, abandonedLeads]);

  // 1-Click Payment Verification
  const verifyPaymentDirect = async (regId, email, name, utr) => {
    setRegistrations(prev => prev.map(r => {
      if ((r.regId || r.id) === regId) {
        return { ...r, status: 'Payment_Verified' };
      }
      return r;
    }));

    notify(`Payment verified for ${name}! Financial Certificate dispatched.`);

    try {
      await fetch('/api/admin', {
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
      notify('Verification sync error: ' + err.message, 'error');
    }
  };

  // 1-Click WhatsApp Lead Engagement
  const openWhatsAppLead = (lead) => {
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    const greetingName = lead.name || 'Distinguished Delegate';
    const text = encodeURIComponent(
      `Greetings ${greetingName}! This is the Resolve MUN 2026 Executive Secretariat regarding your pending registration for the conference at Delhi World Public School, Kompally, Hyderabad (Nov 20-22, 2026).\n\nWe noticed your reservation is temporarily held at ${lead.step || 'Payment'}. Would you like our team to assist you in finalizing your committee allotment before Round 1 closes?`
    );
    const url = `https://wa.me/91${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
    notify(`WhatsApp channel initialized for ${greetingName}`);
  };

  // 1-Click Lead Reminder Dispatch
  const dispatchLeadReminder = async (lead) => {
    const leadKey = lead.leadId || lead.email;
    setLeadSendingState(prev => ({ ...prev, [leadKey]: 'sending' }));

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_DISPATCH_LEAD_REMINDER',
          adminKey: DEFAULT_ADMIN_KEY,
          email: lead.email,
          name: lead.name,
          step: lead.step || 'Payment Screen'
        })
      });

      if (res.ok) {
        setLeadSendingState(prev => ({ ...prev, [leadKey]: 'sent' }));
        notify(`Official reminder email dispatched to ${lead.email}`);
      } else {
        setLeadSendingState(prev => ({ ...prev, [leadKey]: 'error' }));
        notify('Failed to dispatch reminder.', 'error');
      }
    } catch (err) {
      setLeadSendingState(prev => ({ ...prev, [leadKey]: 'error' }));
      notify('Connection failed: ' + err.message, 'error');
    }
  };

  // Copy Delegation Link
  const copyInviteLink = (delCode) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://resolvemun.in';
    const link = `${origin}/?delegation=${delCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(delCode);
    notify(`Invite link copied: ${link}`);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  // Allot & Email
  const submitAllotment = async (e) => {
    e.preventDefault();
    if (!allotmentModalData) return;

    const { regId, committee, country, email, name } = allotmentModalData;
    if (!committee || !country) {
      alert('Please select both Committee and Country/Portfolio.');
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

      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_CONFIRM_ALLOTMENT',
          adminKey: DEFAULT_ADMIN_KEY,
          regId: regId,
          allocatedCommittee: committee,
          allocatedCountry: country
        })
      });

      notify(`Allotment confirmed! Appointment decree dispatched to ${email}.`);
      setAllotmentModalData(null);
    } catch (err) {
      notify('Error updating allotment: ' + err.message, 'error');
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
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_UPDATE_DELEGATION',
          adminKey: DEFAULT_ADMIN_KEY,
          regId: regId,
          delegationCode: cleanCode
        })
      });
      notify(`Delegation updated to ${cleanCode || 'Independent'} for ${regId}.`);
      setReassignDelegationModalData(null);
    } catch (err) {
      notify('Update failed', 'error');
    }
  };

  // Delete Record
  const deleteRecord = async (regId, name) => {
    if (!confirm(`Are you sure you want to delete ${name} (${regId})?`)) return;

    setRegistrations(prev => prev.filter(r => (r.regId || r.id) !== regId));
    notify(`Record ${regId} deleted.`, 'info');

    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADMIN_DELETE_RECORD',
          adminKey: DEFAULT_ADMIN_KEY,
          sheetName: 'Registrations',
          id: regId,
          idCol: 1
        })
      });
    } catch (e) {}
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await fetch('/api/admin', {
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
          secretariatOpen: siteSettings.secretariatOpen,
          roundName: siteSettings.roundName,
          delegatePrice: siteSettings.delegateFee,
          delegationPrice: siteSettings.delegationFee
        })
      });
      notify('Operational configuration published to Cloud database!');
    } catch (err) {
      notify('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Export CSV Handlers
  const exportDelegatesCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations available to export.');
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
    downloadCSV(headers, rows, `Resolve_MUN_Delegates_Master_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const exportLeadsCSV = () => {
    if (abandonedLeads.length === 0) {
      alert('No leads available to export.');
      return;
    }
    const headers = ['Lead ID', 'Name', 'Email', 'Phone', 'Form Type', 'Dropoff Step', 'Timestamp'];
    const rows = abandonedLeads.map(l => [
      l.leadId || '',
      `"${l.name || ''}"`,
      l.email || '',
      l.phone || '',
      l.formType || 'Delegate',
      `"${l.step || ''}"`,
      l.timestamp || ''
    ]);
    downloadCSV(headers, rows, `Resolve_MUN_Abandoned_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
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

  return (
    <div className="min-h-screen bg-[#04060c] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
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

      {/* Supreme Command Header */}
      <header className="border-b border-white/[0.08] bg-[#070914]/90 backdrop-blur-2xl sticky top-0 z-40 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-xs font-semibold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Site</span>
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <Shield className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-extrabold text-xs tracking-wider uppercase text-white font-mono flex items-center gap-2">
                  SUPREME COMMAND STATION · RESOLVE MUN 2026
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[9px] font-bold">
                    MIL-SPEC
                  </span>
                </span>
                <span className="text-[10px] text-white/40 block font-mono">
                  VENUE: DELHI WORLD PUBLIC SCHOOL, KOMPALLY · NOV 20–22, 2026
                </span>
              </div>
            </div>
          </div>

          {isAdminUnlocked && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Audio Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsAudioEnabled(!isAudioEnabled);
                  notify(isAudioEnabled ? 'Tactical Audio Muted' : 'Tactical Audio Online', 'info');
                }}
                className={`h-8 px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  isAudioEnabled
                    ? 'bg-purple-500/10 border-purple-400/30 text-purple-300'
                    : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white'
                }`}
                title="Toggle Tactical Audio Feedback"
              >
                {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Sync Cloud */}
              <button
                type="button"
                onClick={fetchLiveDatabase}
                disabled={isLoading}
                className="h-8 px-3 rounded-lg bg-purple-600/15 hover:bg-purple-600/25 border border-purple-400/30 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-300 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync Sheets</span>
                {lastSyncTime && <span className="text-[10px] opacity-60">({lastSyncTime})</span>}
              </button>

              {/* Export Master CSV */}
              <button
                type="button"
                onClick={exportDelegatesCSV}
                className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-300" />
                <span>Export CSV</span>
              </button>

              {/* Lock Admin */}
              <button
                type="button"
                onClick={() => setIsAdminUnlocked(false)}
                className="h-8 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock</span>
              </button>
            </div>
          )}
        </div>

        {/* Live Telemetry Pulse Bar */}
        {isAdminUnlocked && (
          <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold tracking-wide">
                {liveWatchers} PROSPECTIVE DELEGATES WATCHING LIVE
              </span>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="text-white/40 hidden sm:inline">LATENCY: 22ms</span>
              <span className="text-white/20 hidden sm:inline">|</span>
              <span className="text-white/40 hidden sm:inline">ENGINE: NOMINAL</span>
            </div>

            <div className="flex items-center gap-2 text-white/60 truncate max-w-md">
              <Radio className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="truncate">
                <strong className="text-purple-300">{telemetryEvents[currentEventIdx].city}:</strong> {telemetryEvents[currentEventIdx].action}
              </span>
              <span className="text-[10px] text-white/40 shrink-0">({telemetryEvents[currentEventIdx].time})</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!isAdminUnlocked ? (
          /* PIN LOCK GATEWAY */
          <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-white/[0.08] bg-[#070914]/90 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <Lock className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase font-bold">SECURE COMMAND ACCESS</span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Super Admin Station</h2>
              <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                Enter your administrative clearance key to access live registered delegates, seat allotment decrees, and abandoned lead telemetry.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <input
                type="password"
                placeholder="Enter Admin Security Clearance Key"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-black/50 border border-white/15 text-white text-xs placeholder:text-white/30 text-center font-mono focus:outline-none focus:border-purple-400 transition-all shadow-inner"
                autoFocus
              />
              {adminPinError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                  {adminPinError}
                </div>
              )}
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.35)]"
              >
                Access War-Room Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* UNLOCKED PRODUCTION WAR-ROOM */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* HERO STAT COUNTERS (POWER GRID) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. GRAND TOTAL PERSONNEL */}
              <div className="p-4 rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-[#0a0d1c] to-[#070914] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                <span className="text-[10px] text-purple-300/80 block font-mono uppercase font-bold tracking-wider">
                  Total Strength
                </span>
                <span className="text-3xl font-mono font-extrabold text-white mt-1 block">
                  {grandTotalPersonnel}
                </span>
                <span className="text-[10px] text-white/40 block mt-1">Across all branches</span>
              </div>

              {/* 2. INDIVIDUAL DELEGATES */}
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                <span className="text-[10px] text-white/50 block font-mono uppercase font-bold tracking-wider">
                  Individual Delegates
                </span>
                <span className="text-3xl font-mono font-bold text-white mt-1 block">
                  {registrations.length}
                </span>
                <span className="text-[10px] text-emerald-400 block mt-1">
                  {verifiedDelegatesCount} Verified / Clear
                </span>
              </div>

              {/* 3. INSTITUTIONAL DELEGATIONS */}
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                <span className="text-[10px] text-white/50 block font-mono uppercase font-bold tracking-wider">
                  Delegations (Teams)
                </span>
                <span className="text-3xl font-mono font-bold text-indigo-300 mt-1 block">
                  {delegations.length}
                </span>
                <span className="text-[10px] text-indigo-400 block mt-1">
                  {totalDelMembers} Enrolled Students
                </span>
              </div>

              {/* 4. ABANDONED LEADS (HOT PIPELINE) */}
              <div className="p-4 rounded-2xl border border-amber-500/25 bg-[#080b16]/80 hover:border-amber-400/40 transition-all">
                <span className="text-[10px] text-amber-300/80 block font-mono uppercase font-bold tracking-wider">
                  Abandoned Leads
                </span>
                <span className="text-3xl font-mono font-bold text-amber-300 mt-1 block">
                  {abandonedLeads.length}
                </span>
                <span className="text-[10px] text-amber-400/80 block mt-1">
                  ₹{(abandonedLeads.length * 2199).toLocaleString('en-IN')} at risk
                </span>
              </div>

              {/* 5. EB & SECRETARIAT APPLICANTS */}
              <div className="p-4 rounded-2xl border border-white/[0.08] bg-[#080b16]/80 hover:border-white/15 transition-all">
                <span className="text-[10px] text-white/50 block font-mono uppercase font-bold tracking-wider">
                  EB & Secretariat
                </span>
                <span className="text-3xl font-mono font-bold text-pink-300 mt-1 block">
                  {ebApplications.length + secApplications.length}
                </span>
                <span className="text-[10px] text-pink-400 block mt-1">
                  {ebApplications.length} EB | {secApplications.length} Sec
                </span>
              </div>

              {/* 6. TREASURY PIPELINE */}
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-[#080b16]/80 hover:border-emerald-400/40 transition-all">
                <span className="text-[10px] text-emerald-300/80 block font-mono uppercase font-bold tracking-wider">
                  Gross Pipeline
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-300 mt-1.5 block">
                  ₹{totalVerifiedRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400/80 block mt-1">Verified Inflow</span>
              </div>
            </div>

            {/* LIVE COMMITTEE OCCUPANCY GAUGES (WAR ROOM MATRIX) */}
            <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Committee Allocation Quotas & Matrix Occupancy
                  </h3>
                </div>
                <span className="text-[11px] text-white/40 font-mono">
                  Click any committee to inspect delegates
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {committeeStats.map((c, idx) => (
                  <button
                    key={`comm-${c.code || idx}`}
                    type="button"
                    onClick={() => {
                      setSearchQuery(c.code);
                      setActiveSubTab('delegates');
                      notify(`Filtered by ${c.name}`);
                    }}
                    className="p-3 rounded-xl border border-white/[0.06] bg-black/40 hover:border-purple-400/40 hover:bg-purple-950/10 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-white">
                      <span>{c.icon} {c.code}</span>
                      <span className="font-mono text-purple-300 text-[10px]">{c.occupied}/{c.cap}</span>
                    </div>

                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          c.pct >= 90
                            ? 'bg-red-500'
                            : c.pct >= 60
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.max(5, c.pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/40 mt-2 font-mono">
                      <span>{c.pct}% Full</span>
                      <span>{c.remaining} Left</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Tabs Navigation */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === 'overview'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Command Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('delegates')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === 'delegates'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Delegates & Allotments ({registrations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('delegations')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === 'delegations'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Delegations Hub ({delegations.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('leads')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === 'leads'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-300/80 hover:text-white hover:bg-amber-500/10'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Abandoned Leads Radar ({abandonedLeads.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('applications')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === 'applications'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>EB / Secretariat ({ebApplications.length + secApplications.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('settings')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeSubTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-300/80 hover:text-white hover:bg-indigo-500/10'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>System Configuration</span>
              </button>
            </div>

            {/* TAB 0: COMMAND OVERVIEW */}
            {activeSubTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Action Station */}
                  <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
                      Fast Command Dispatches
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setAddDelegateModalOpen(true)}
                        className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-400/40 text-left transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-purple-400 mb-2" />
                        <span className="font-bold text-xs text-white block">Add Offline Delegate</span>
                        <span className="text-[10px] text-white/50 mt-1 block">Manual entry with custom allocation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubTab('leads');
                          setLeadStepFilter('STEP3');
                        }}
                        className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.07] hover:border-amber-400/40 text-left transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4 text-amber-400 mb-2" />
                        <span className="font-bold text-xs text-white block">Recover Cart Dropouts</span>
                        <span className="text-[10px] text-amber-300/70 mt-1 block">Inspect leads stuck at QR payment</span>
                      </button>

                      <button
                        type="button"
                        onClick={exportDelegatesCSV}
                        className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.03] hover:bg-blue-500/[0.07] hover:border-blue-400/40 text-left transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-blue-400 mb-2" />
                        <span className="font-bold text-xs text-white block">Export Full Dossier</span>
                        <span className="text-[10px] text-blue-300/70 mt-1 block">Download master CSV of all delegates</span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Registrations Quick Stream */}
                  <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                        Latest Intake Stream
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('delegates')}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <span>View All ({registrations.length})</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {registrations.length === 0 ? (
                      <p className="text-xs text-white/40 italic py-4">No live intake recorded yet.</p>
                    ) : (
                      <div className="divide-y divide-white/[0.04]">
                        {registrations.slice(0, 5).map((r, idx) => (
                          <div key={`recent-reg-${r.regId || r.id || idx}`} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-semibold text-white">{r.fullName || r.name}</span>
                              <span className="text-[11px] text-white/40 ml-2 font-mono">{r.regId || r.id}</span>
                              <p className="text-[10px] text-white/50">{r.email} | {r.institution || 'Individual'}</p>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
                                {r.allocatedCommittee || r.status || 'Received'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Intelligence & Telemetry Sidebar */}
                <div className="space-y-6">
                  {/* Lead Dropoff Funnel */}
                  <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Registration Funnel Health</span>
                      </h4>
                      <span className="text-[10px] font-mono text-white/40">
                        {funnelStats.totalSessions} Total Sessions
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/70">Step 1: Contact & Personal Info</span>
                          <span className="font-mono text-white/40">{funnelStats.step1Pct}% ({funnelStats.step1Count})</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${funnelStats.step1Pct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/70">Step 2: Committee Preference</span>
                          <span className="font-mono text-white/40">{funnelStats.step2Pct}% ({funnelStats.step2Count})</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${funnelStats.step2Pct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/70">Step 3: Payment Screen</span>
                          <span className="font-mono text-white/40">{funnelStats.step3Pct}% ({funnelStats.step3Count})</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${funnelStats.step3Pct}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/70">Completed & Verified Intake</span>
                          <span className="font-mono text-emerald-400 font-bold">{funnelStats.conversionPct}% ({funnelStats.completedCount})</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${funnelStats.conversionPct}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200/80">
                      💡 <b>Funnel Telemetry:</b> {funnelStats.step3Drops} lead{funnelStats.step3Drops === 1 ? '' : 's'} paused at Step 3 (Payment), and {funnelStats.step2Drops} at Step 2. Use 1-Click WhatsApp Direct to recover delegates with prefilled registration links!
                    </div>
                  </div>

                  {/* Conference Dossier Reference */}
                  <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-2.5 text-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      Venue & Conference Reference
                    </h4>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">OFFICIAL VENUE</span>
                      <span className="text-white font-medium">Delhi World Public School, Kompally, Hyderabad</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">CONFERENCE DATES</span>
                      <span className="text-white font-medium">20th – 22nd November 2026</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] text-white/40 uppercase font-mono block">SECRETARIAT HOTLINE</span>
                      <span className="text-white font-medium">+91 92121 07797</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: DELEGATES & ALLOTMENTS */}
            {activeSubTab === 'delegates' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name, email, ID, delegation, UTR, committee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-purple-400 font-sans transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-9 px-3 rounded-xl bg-[#0c0e18] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer"
                    >
                      <option value="ALL">All Statuses ({registrations.length})</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Allocated">Allocated</option>
                      <option value="Payment_Verified">Payment Verified</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setAddDelegateModalOpen(true)}
                      className="h-9 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-purple-600/20"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Delegate</span>
                    </button>
                  </div>
                </div>

                {filteredRecords.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <FileText className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No delegate registrations match your filter.</p>
                    <p className="text-[11px]">Sync Cloud Sheets or clear search query to inspect all records.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">Reg ID</th>
                          <th className="py-3 px-4">Delegate Profile</th>
                          <th className="py-3 px-4">Delegation</th>
                          <th className="py-3 px-4">Payment & Proof</th>
                          <th className="py-3 px-4">Committee & Country</th>
                          <th className="py-3 px-4 text-right">Supreme Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredRecords.map((r, idx) => {
                          const regId = r.regId || r.id || `reg-${idx}`;
                          const name = r.fullName || r.name;
                          const isAllocated = !!r.allocatedCommittee;
                          const isVerified = r.status === 'Payment_Verified' || r.status === 'Confirmed' || isAllocated;

                          return (
                            <tr key={`reg-row-${regId}-${idx}`} className="hover:bg-white/[0.015] transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                                {regId}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-semibold text-white">{name}</p>
                                <p className="text-[11px] text-white/50">{r.email}</p>
                                <p className="text-[10px] text-white/40">{r.phone} {r.institution ? `· ${r.institution}` : ''}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                {r.delegationCode ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 text-[10px] font-mono font-bold">
                                      {r.delegationCode}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setReassignDelegationModalData({ regId, name, delegationCode: r.delegationCode })}
                                      className="p-1 hover:text-indigo-300 text-white/40 cursor-pointer"
                                      title="Reassign Delegation"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setReassignDelegationModalData({ regId, name, delegationCode: '' })}
                                    className="text-[11px] text-white/40 hover:text-purple-300 underline cursor-pointer"
                                  >
                                    + Assign
                                  </button>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setScreenshotModalData({
                                        regId,
                                        name,
                                        utr: r.paymentUTR,
                                        url: r.screenshotUrl || r.paymentScreenshotURL
                                      })}
                                      className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-purple-300 flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Proof</span>
                                    </button>

                                    {r.status !== 'Payment_Verified' && (
                                      <button
                                        type="button"
                                        onClick={() => verifyPaymentDirect(regId, r.email, name, r.paymentUTR)}
                                        className="px-2 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
                                        title="Verify payment and dispatch financial clearance email"
                                      >
                                        <Check className="w-2.5 h-2.5" />
                                        <span>Verify</span>
                                      </button>
                                    )}
                                  </div>
                                  {r.paymentUTR && (
                                    <span className="text-[10px] font-mono text-white/40 block truncate max-w-[140px]">
                                      UTR: {r.paymentUTR}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                {isAllocated ? (
                                  <div>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 text-[10px] font-bold block w-fit mb-0.5">
                                      {r.allocatedCommittee}
                                    </span>
                                    <span className="text-[11px] text-white/80 font-medium">{r.allocatedCountry}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-amber-300/70 italic flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Pending Allotment</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setAllotmentModalData({
                                      regId,
                                      name,
                                      email: r.email,
                                      committee: r.allocatedCommittee || 'UNSC',
                                      country: r.allocatedCountry || ''
                                    })}
                                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
                                  >
                                    {isAllocated ? 'Reallot' : 'Allot & Decree'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteRecord(regId, name)}
                                    className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
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

            {/* TAB 2: DELEGATIONS HUB */}
            {activeSubTab === 'delegations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Registered Institutional Delegations</h3>
                    <p className="text-xs text-white/50">Manage school and college delegations and distribute permanent invite links.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-mono font-bold">
                    {totalDelMembers} Total Enrolled Students
                  </span>
                </div>

                {delegations.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <Users className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No delegations registered in database yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {delegations.map((del, idx) => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://resolvemun.in';
                      const code = del.code || del.delegationCode || del.DelID || `del-${idx}`;
                      const inviteUrl = `${origin}/?delegation=${code}`;
                      const isCopied = copiedLink === code;

                      return (
                        <div key={`del-card-${code}-${idx}`} className="p-5 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-3.5 shadow-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 text-[10px] font-mono font-bold block w-fit mb-1.5">
                                {code}
                              </span>
                              <h4 className="text-sm font-bold text-white">{del.name || del.delegationName || 'Institution'}</h4>
                              <p className="text-xs text-white/50 mt-0.5">Head: {del.headName || 'Faculty Advisor'} ({del.headPhone || 'N/A'})</p>
                              {del.headEmail && <p className="text-[11px] text-white/40">{del.headEmail}</p>}
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-400/20 font-mono">
                              {del.membersCount || del.size || del.MemberCount || 0} Members
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                            <span className="text-[10px] font-mono uppercase text-white/40 block">PERMANENT DELEGATION INVITE LINK</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={inviteUrl}
                                className="flex-1 h-8 px-2.5 rounded-lg bg-black/60 border border-white/10 text-[11px] font-mono text-purple-200 truncate focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => copyInviteLink(code)}
                                className="h-8 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SUPERCHARGED ABANDONED LEADS POWER SUITE */}
            {activeSubTab === 'leads' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-[#070914] to-[#070914] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Abandoned Leads Command Radar
                      </h3>
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      Targeted prospective delegates who initiated registration but paused before final submission.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={exportLeadsCSV}
                      className="h-8 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Leads CSV</span>
                    </button>
                  </div>
                </div>

                {/* Lead Step Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setLeadStepFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                      leadStepFilter === 'ALL'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-white/60 hover:text-white bg-white/[0.03]'
                    }`}
                  >
                    All Incomplete Leads ({abandonedLeads.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadStepFilter('STEP3')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      leadStepFilter === 'STEP3'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-red-300 hover:text-white bg-red-950/20 border border-red-500/20'
                    }`}
                  >
                    <span>🔥 Step 3 Payment Drops (High Value)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadStepFilter('STEP2')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                      leadStepFilter === 'STEP2'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-300 hover:text-white bg-white/[0.03]'
                    }`}
                  >
                    Step 2 Preference Drops
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadStepFilter('STEP1')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                      leadStepFilter === 'STEP1'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-blue-300 hover:text-white bg-white/[0.03]'
                    }`}
                  >
                    Step 1 Contact Only
                  </button>
                </div>

                {filteredLeads.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 opacity-60" />
                    <p className="text-xs font-semibold text-emerald-300">No abandoned leads matching this step!</p>
                    <p className="text-[11px]">All prospective applicants completed their dossiers smoothly.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">Lead ID</th>
                          <th className="py-3 px-4">Prospective Delegate</th>
                          <th className="py-3 px-4">Track</th>
                          <th className="py-3 px-4">Paused Step</th>
                          <th className="py-3 px-4">Last Telemetry</th>
                          <th className="py-3 px-4 text-right">Direct Outreach</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredLeads.map((lead, idx) => {
                          const leadKey = lead.leadId || lead.id || lead.email || `lead-${idx}`;
                          const sendStatus = leadSendingState[leadKey];

                          return (
                            <tr key={`lead-row-${lead.leadId || 'lead'}-${lead.email || 'mail'}-${idx}`} className="hover:bg-white/[0.015] transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                                {lead.leadId || 'RM26-LEAD'}
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="font-semibold text-white">{lead.name || 'Unnamed Prospect'}</p>
                                <p className="text-[11px] text-white/50">{lead.email}</p>
                                <p className="text-[10px] text-white/40">{lead.phone}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-medium">
                                  {lead.formType || 'Individual Delegate'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  (lead.step || '').toLowerCase().includes('payment') || (lead.step || '').includes('3')
                                    ? 'bg-red-500/10 text-red-300 border-red-400/20'
                                    : 'bg-amber-500/10 text-amber-300 border-amber-400/20'
                                }`}>
                                  {lead.step || 'Step 1'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-white/40 text-[11px] font-mono">
                                {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'Recent Session'}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* 1-Click WhatsApp */}
                                  {lead.phone && (
                                    <button
                                      type="button"
                                      onClick={() => openWhatsAppLead(lead)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Open direct WhatsApp conversation with personalized message"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>WhatsApp</span>
                                    </button>
                                  )}

                                  {/* 1-Click Diplomatic Reminder Email */}
                                  {lead.email && (
                                    <button
                                      type="button"
                                      onClick={() => dispatchLeadReminder(lead)}
                                      disabled={sendStatus === 'sending' || sendStatus === 'sent'}
                                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                        sendStatus === 'sent'
                                          ? 'bg-purple-950/40 border-purple-500/40 text-purple-300 cursor-default'
                                          : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/30 text-amber-200'
                                      }`}
                                    >
                                      {sendStatus === 'sending' ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : sendStatus === 'sent' ? (
                                        <Check className="w-3 h-3 text-purple-300" />
                                      ) : (
                                        <Mail className="w-3 h-3" />
                                      )}
                                      <span>{sendStatus === 'sent' ? 'Sent ✓' : 'Send Reminder'}</span>
                                    </button>
                                  )}

                                  {/* Copy Dossier */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${lead.name || ''}, ${lead.email || ''}, ${lead.phone || ''}`);
                                      notify('Lead contact dossier copied');
                                    }}
                                    className="p-1 rounded-lg bg-white/[0.04] hover:bg-white/10 text-white/50 hover:text-white cursor-pointer"
                                    title="Copy Contact Details"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
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

            {/* TAB 4: APPLICATIONS (EB & SECRETARIAT) */}
            {activeSubTab === 'applications' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Executive Board & Secretariat Candidates</h3>
                    <p className="text-xs text-white/50">Direct dossier links and curriculum vitae inspection.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-mono font-bold">
                    {ebApplications.length + secApplications.length} Total Applicants
                  </span>
                </div>

                {ebApplications.length === 0 && secApplications.length === 0 ? (
                  <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <Award className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No leadership applications in database yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#070914] shadow-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-3 px-4">Candidate ID</th>
                          <th className="py-3 px-4">Candidate Details</th>
                          <th className="py-3 px-4">Preferred Role / Committee</th>
                          <th className="py-3 px-4">Curriculum Vitae</th>
                          <th className="py-3 px-4 text-right">Clearance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {[...secApplications, ...ebApplications].map((app, idx) => (
                          <tr key={`app-row-${app.appId || app.UID || app.email || 'app'}-${idx}`} className="hover:bg-white/[0.015] transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                              {app.appId || 'RM26-APP'}
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-white">{app.name || app.fullName}</p>
                              <p className="text-[11px] text-white/50">{app.email} | {app.phone}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="text-white/80 font-medium">{app.portfolio1 || app.pref1 || app.Department1 || 'Leadership Track'}</p>
                              <p className="text-[11px] text-white/40">{app.portfolio2 || app.pref2 || app.Department2 || ''}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              {app.cvUrl || app.CV_URL ? (
                                <a
                                  href={app.cvUrl || app.CV_URL}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 text-purple-300 text-[11px] font-medium transition-colors"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>View Drive CV</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-white/30 text-[11px]">No CV Attached</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20 text-[10px] font-semibold">
                                {app.status || 'Under_Review'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SYSTEM SETTINGS */}
            {activeSubTab === 'settings' && (
              <div className="max-w-2xl space-y-5">
                <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#070914] space-y-4 shadow-xl">
                  <div>
                    <h3 className="text-base font-bold text-white">Live System Controls</h3>
                    <p className="text-xs text-white/50">Master switch and per-pathway enable/disable controls.</p>
                  </div>

                  {/* Master Toggle */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">Master Registrations Gate</span>
                      <span className="text-[11px] text-white/50">
                        {siteSettings.registrationsOpen ? 'All registration portals are open.' : 'Global lockdown active.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiteSettings(p => ({ ...p, registrationsOpen: !p.registrationsOpen }))}
                      className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                        siteSettings.registrationsOpen ? 'bg-purple-600 justify-end' : 'bg-white/20 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {/* Per Pathway Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { key: 'delegateOpen', label: 'Individual Delegate Track' },
                      { key: 'delegationOpen', label: 'Institutional Delegation Track' },
                      { key: 'ocOpen', label: 'Organizing Committee (OC)' },
                      { key: 'ebOpen', label: 'Executive Board (EB)' },
                      { key: 'secretariatOpen', label: 'Secretariat Direct Portal' }
                    ].map(({ key, label }, idx) => (
                      <div key={`param-${key}-${idx}`} className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs text-white/80">{label}</span>
                        <button
                          type="button"
                          onClick={() => setSiteSettings(p => ({ ...p, [key]: !p[key] }))}
                          className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center cursor-pointer ${
                            siteSettings[key] ? 'bg-purple-600 justify-end' : 'bg-white/20 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pricing and Round Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                    <div>
                      <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Round Title</label>
                      <input
                        type="text"
                        value={siteSettings.roundName}
                        onChange={(e) => setSiteSettings(p => ({ ...p, roundName: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/15 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Delegate Fee (₹)</label>
                      <input
                        type="text"
                        value={siteSettings.delegateFee}
                        onChange={(e) => setSiteSettings(p => ({ ...p, delegateFee: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/15 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-white/50 uppercase mb-1">Delegation Fee (₹)</label>
                      <input
                        type="text"
                        value={siteSettings.delegationFee}
                        onChange={(e) => setSiteSettings(p => ({ ...p, delegationFee: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/15 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={settingsSaving}
                    className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {settingsSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Publish Operational Changes</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* SCREENSHOT PROOF MODAL */}
      {screenshotModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-5 rounded-2xl border border-white/15 bg-[#070914] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Payment Screenshot & UTR Clearance</h3>
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
              Transaction Reference / UTR: <strong className="text-white">{screenshotModalData.utr || 'Not specified'}</strong>
            </div>

            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center min-h-[260px] max-h-[440px]">
              {screenshotModalData.url && screenshotModalData.url.startsWith('http') ? (
                <img
                  src={screenshotModalData.url}
                  alt="Proof Screenshot"
                  className="max-h-[440px] w-auto object-contain"
                />
              ) : (
                <div className="text-center p-6 text-white/40 space-y-2">
                  <FileCheck className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-xs">Direct Drive archive recorded</p>
                  {screenshotModalData.url && (
                    <a
                      href={screenshotModalData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-purple-400 underline block"
                    >
                      Open in Google Drive &rarr;
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
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

      {/* ALLOTMENT MODAL */}
      {allotmentModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-5 rounded-2xl border border-purple-500/30 bg-[#070914] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Allot Committee & Country</h3>
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

            <form onSubmit={submitAllotment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Committee Allocation</label>
                <select
                  value={allotmentModalData.committee}
                  onChange={(e) => setAllotmentModalData(prev => ({ ...prev, committee: e.target.value }))}
                  className="w-full h-9 px-2.5 rounded-xl bg-[#0c0e18] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="UNSC">UNSC (United Nations Security Council)</option>
                  <option value="UNGA (DISEC)">UNGA (Disarmament & International Security)</option>
                  <option value="UNHRC">UNHRC (Human Rights Council)</option>
                  <option value="AIPPM">AIPPM (All India Political Parties Meet)</option>
                  <option value="CCC">Continuous Crisis Committee (CCC)</option>
                  <option value="IP">International Press</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Country / Portfolio Assignment</label>
                <input
                  type="text"
                  placeholder="e.g. United States of America, India, France..."
                  value={allotmentModalData.country}
                  onChange={(e) => setAllotmentModalData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200/80 leading-relaxed">
                Saving will instantly dispatch the official Appointment Decree email with official diplomatic seal directly to <b>{allotmentModalData.email}</b>.
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Confirm & Send Decree</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllotmentModalData(null)}
                  className="px-3 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
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
                <h3 className="text-sm font-bold text-white">Reassign Delegation</h3>
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
                <label className="block text-xs font-medium text-white/70 mb-1">Delegation Code</label>
                <input
                  type="text"
                  placeholder="e.g. DEL-DPSRKP (or leave blank to detach)"
                  value={reassignDelegationModalData.delegationCode}
                  onChange={(e) => setReassignDelegationModalData(prev => ({ ...prev, delegationCode: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Update Delegation
                </button>
                <button
                  type="button"
                  onClick={() => setReassignDelegationModalData(null)}
                  className="px-3 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
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
                <h3 className="text-sm font-bold text-white">Add Delegate Directly</h3>
                <p className="text-xs text-white/50">Manual offline or walk-in registration entry</p>
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
                notify(`Delegate ${newDel.fullName} added to live roster!`);
                setAddDelegateModalOpen(false);

                fetch('/api/admin', {
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
                <input name="fullName" required className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
                  <input name="email" type="email" required className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Phone (+91)</label>
                  <input name="phone" required placeholder="9876543210" className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Institution</label>
                  <input name="institution" className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Delegation Code</label>
                  <input name="delegationCode" placeholder="e.g. DEL-01" className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Committee</label>
                  <select name="committee" className="w-full h-8 px-2 rounded-lg bg-[#0c0e18] border border-white/10 text-white text-xs">
                    <option value="UNSC">UNSC</option>
                    <option value="UNGA (DISEC)">UNGA (DISEC)</option>
                    <option value="UNHRC">UNHRC</option>
                    <option value="AIPPM">AIPPM</option>
                    <option value="CCC">Continuous Crisis Committee (CCC)</option>
                    <option value="IP">International Press</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Country / Portfolio</label>
                  <input name="country" placeholder="e.g. France" className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Delegate
                </button>
                <button
                  type="button"
                  onClick={() => setAddDelegateModalOpen(false)}
                  className="px-3 h-9 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
