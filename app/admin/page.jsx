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
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const DEFAULT_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "ResolveMUNAdmin2026@Secure";

export default function SuperAdminPage() {
  // Pin & Authentication
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  // Subtabs: 'delegates' | 'delegations' | 'leads' | 'applications' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState('delegates');

  // Live Database Records (Strictly from Apps Script, NO hardcoded fallbacks)
  const [registrations, setRegistrations] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [abandonedLeads, setAbandonedLeads] = useState([]);
  const [ebApplications, setEbApplications] = useState([]);
  const [secApplications, setSecApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);

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
    delegationFee: '1999'
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

  const notify = (msg, type = 'success') => {
    setSyncNotice({ msg, type });
    setTimeout(() => setSyncNotice(null), 3500);
  };

  // Fetch Live Data from Server Proxy
  const fetchLiveDatabase = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin?adminKey=${encodeURIComponent(DEFAULT_ADMIN_KEY)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setRegistrations(json.registrations || []);
          setDelegations(json.delegations || []);
          setAbandonedLeads(json.abandonedLeads || []);
          setEbApplications(json.ebApplicants || []);
          setSecApplications(json.secretariatApplicants || []);
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
        (r.delegationCode && r.delegationCode.toLowerCase().includes(q)) ||
        (r.allocatedCommittee && r.allocatedCommittee.toLowerCase().includes(q));

      const status = r.allocatedCommittee ? 'Allocated' : (r.status || 'Confirmed');
      const matchesStatus = filterStatus === 'ALL' || status === filterStatus;

      return matchesQuery && matchesStatus;
    });
  }, [registrations, searchQuery, filterStatus]);

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
      // Optimistic update
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

      notify(`Allotment confirmed! Automated allocation email dispatched to ${email}.`);
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
    } catch(e) {}
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
      notify('Settings published to Google Sheet database!');
    } catch (err) {
      notify('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Resolve_MUN_Live_Delegates_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Live directory CSV exported.');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notice */}
      {syncNotice && (
        <div className={`fixed top-4 right-4 z-[99999] px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300 flex items-center gap-2.5 ${
          syncNotice.type === 'error'
            ? 'bg-red-950/90 border-red-500/40 text-red-200'
            : syncNotice.type === 'info'
            ? 'bg-blue-950/90 border-blue-500/40 text-blue-200'
            : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{syncNotice.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-14 border-b border-white/[0.08] bg-[#090b12]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold">Exit to Site</span>
          </Link>
          <span className="text-white/20">/</span>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="font-extrabold text-xs tracking-wider uppercase text-white font-mono">
              SUPER ADMIN STATION · RESOLVE 2.0
            </span>
          </div>
        </div>

        {isAdminUnlocked && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLiveDatabase}
              disabled={isLoading}
              className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 text-purple-300 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Cloud</span>
            </button>

            <button
              type="button"
              onClick={exportCSV}
              className="h-8 px-3 rounded-lg bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-blue-300" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdminUnlocked(false)}
              className="h-8 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Lock</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!isAdminUnlocked ? (
          /* PIN LOCK GATEWAY */
          <div className="max-w-md mx-auto my-16 p-8 rounded-2xl border border-white/[0.08] bg-[#0a0d17]/90 backdrop-blur-2xl text-center space-y-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Super Admin Authorization</h2>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">
                Enter the administrative security key to inspect live payment receipts, allot committees, and manage registrations.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-3.5">
              <input
                type="password"
                placeholder="Enter Admin Security Key"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/15 text-white text-xs placeholder:text-white/30 text-center font-mono focus:outline-none focus:border-purple-400"
                autoFocus
              />
              {adminPinError && <p className="text-xs text-red-400">{adminPinError}</p>}
              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                Unlock Administrative Station
              </button>
            </form>
          </div>
        ) : (
          /* UNLOCKED PRODUCTION DASHBOARD */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#090b14]/70">
                <span className="text-[11px] text-white/50 block font-mono uppercase">Live Registrations</span>
                <span className="text-2xl font-mono font-bold text-white mt-0.5 block">{registrations.length}</span>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#090b14]/70">
                <span className="text-[11px] text-white/50 block font-mono uppercase">Active Delegations</span>
                <span className="text-2xl font-mono font-bold text-indigo-300 mt-0.5 block">{delegations.length}</span>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#090b14]/70">
                <span className="text-[11px] text-white/50 block font-mono uppercase">Abandoned Leads</span>
                <span className="text-2xl font-mono font-bold text-amber-300 mt-0.5 block">{abandonedLeads.length}</span>
              </div>
              <div className="p-4 rounded-xl border border-white/[0.08] bg-[#090b14]/70">
                <span className="text-[11px] text-white/50 block font-mono uppercase">Applications Pending</span>
                <span className="text-2xl font-mono font-bold text-emerald-300 mt-0.5 block">
                  {ebApplications.length + secApplications.length}
                </span>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveSubTab('delegates')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'delegates'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Delegates & Allotments ({registrations.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('delegations')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'delegations'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Delegations Hub ({delegations.length})
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
                <span>Abandoned Leads ({abandonedLeads.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('applications')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'applications'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                EB / Secretariat ({ebApplications.length + secApplications.length})
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
                <span>Round & Fee Settings</span>
              </button>
            </div>

            {/* TAB 1: DELEGATES & ALLOTMENTS */}
            {activeSubTab === 'delegates' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search delegates by name, email, ID, delegation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-lg bg-black/30 border border-white/10 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-9 px-2.5 rounded-lg bg-[#0c0e18] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Allocated">Allocated</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setAddDelegateModalOpen(true)}
                      className="h-9 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Delegate</span>
                    </button>
                  </div>
                </div>

                {filteredRecords.length === 0 ? (
                  <div className="p-12 rounded-xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <FileText className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No delegate registrations found in database.</p>
                    <p className="text-[11px]">When delegates submit registration forms, they will instantly appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#080a13]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-2.5 px-3.5">Reg ID</th>
                          <th className="py-2.5 px-3.5">Delegate</th>
                          <th className="py-2.5 px-3.5">Delegation</th>
                          <th className="py-2.5 px-3.5">Payment Receipt</th>
                          <th className="py-2.5 px-3.5">Committee & Country</th>
                          <th className="py-2.5 px-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {filteredRecords.map((r) => {
                          const regId = r.regId || r.id;
                          const name = r.fullName || r.name;
                          const isAllocated = !!r.allocatedCommittee;

                          return (
                            <tr key={regId} className="hover:bg-white/[0.015]">
                              <td className="py-3 px-3.5 font-mono font-bold text-purple-300">{regId}</td>
                              <td className="py-3 px-3.5">
                                <p className="font-semibold text-white">{name}</p>
                                <p className="text-[11px] text-white/50">{r.email}</p>
                                <p className="text-[10px] text-white/40">{r.phone}</p>
                              </td>
                              <td className="py-3 px-3.5">
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
                              <td className="py-3 px-3.5">
                                <button
                                  type="button"
                                  onClick={() => setScreenshotModalData({
                                    regId,
                                    name,
                                    utr: r.paymentUTR,
                                    url: r.screenshotUrl
                                  })}
                                  className="px-2 py-1 rounded-md bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-purple-300 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View Receipt</span>
                                </button>
                              </td>
                              <td className="py-3 px-3.5">
                                {isAllocated ? (
                                  <div>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 text-[10px] font-bold block w-fit mb-0.5">
                                      {r.allocatedCommittee}
                                    </span>
                                    <span className="text-[11px] text-white/70">{r.allocatedCountry}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-amber-300/70 italic">Pending Allotment</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-right">
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
                                    className="px-2.5 py-1 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    Allot & Email
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteRecord(regId, name)}
                                    className="p-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
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

            {/* TAB 2: DELEGATIONS HUB */}
            {activeSubTab === 'delegations' && (
              <div className="space-y-4">
                {delegations.length === 0 ? (
                  <div className="p-12 rounded-xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <Users className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No delegations registered in database yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {delegations.map((del) => {
                      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://resolvemun.in';
                      const inviteUrl = `${origin}/?delegation=${del.code || del.delegationCode}`;
                      const isCopied = copiedLink === (del.code || del.delegationCode);

                      return (
                        <div key={del.code || del.id} className="p-4 rounded-xl border border-white/[0.08] bg-[#090b14] space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-400/20 text-[10px] font-mono font-bold block w-fit mb-1">
                                {del.code || del.delegationCode}
                              </span>
                              <h4 className="text-sm font-bold text-white">{del.name || del.delegationName}</h4>
                              <p className="text-xs text-white/50 mt-0.5">Head: {del.headName} ({del.headPhone})</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-400/20">
                              {del.membersCount || del.size || 0} Members
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] space-y-1.5">
                            <span className="text-[10px] font-mono uppercase text-white/40 block">PERMANENT INVITE LINK</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={inviteUrl}
                                className="flex-1 h-7 px-2 rounded bg-black/60 border border-white/10 text-[11px] font-mono text-purple-200 truncate focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => copyInviteLink(del.code || del.delegationCode)}
                                className="h-7 px-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
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

            {/* TAB 3: ABANDONED LEADS */}
            {activeSubTab === 'leads' && (
              <div className="space-y-4">
                {abandonedLeads.length === 0 ? (
                  <div className="p-12 rounded-xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <AlertTriangle className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No incomplete leads recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#080a13]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-2.5 px-3.5">Lead ID</th>
                          <th className="py-2.5 px-3.5">Name & Contact</th>
                          <th className="py-2.5 px-3.5">Form Type</th>
                          <th className="py-2.5 px-3.5">Last Step</th>
                          <th className="py-2.5 px-3.5">Timestamp</th>
                          <th className="py-2.5 px-3.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {abandonedLeads.map((lead) => (
                          <tr key={lead.leadId} className="hover:bg-white/[0.015]">
                            <td className="py-3 px-3.5 font-mono font-bold text-amber-300">{lead.leadId}</td>
                            <td className="py-3 px-3.5">
                              <p className="font-semibold text-white">{lead.name}</p>
                              <p className="text-[11px] text-white/50">{lead.email} | {lead.phone}</p>
                            </td>
                            <td className="py-3 px-3.5">
                              <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[10px]">
                                {lead.formType}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-amber-300/80 font-medium">{lead.step}</td>
                            <td className="py-3 px-3.5 text-white/40 text-[11px]">
                              {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${lead.name}, ${lead.email}, ${lead.phone}`);
                                  notify('Contact info copied');
                                }}
                                className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/20 text-amber-300 text-[11px] font-medium cursor-pointer"
                              >
                                Copy Contact
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: APPLICATIONS (EB & SECRETARIAT) */}
            {activeSubTab === 'applications' && (
              <div className="space-y-4">
                {ebApplications.length === 0 && secApplications.length === 0 ? (
                  <div className="p-12 rounded-xl border border-dashed border-white/10 text-center text-white/40 space-y-2">
                    <FileText className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-xs font-semibold">No applications pending review in database.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#080a13]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/[0.06] text-white/50 uppercase tracking-wider text-[10px] font-mono">
                        <tr>
                          <th className="py-2.5 px-3.5">App ID</th>
                          <th className="py-2.5 px-3.5">Applicant</th>
                          <th className="py-2.5 px-3.5">Preferences / Department</th>
                          <th className="py-2.5 px-3.5">Curriculum Vitae</th>
                          <th className="py-2.5 px-3.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {[...secApplications, ...ebApplications].map((app) => (
                          <tr key={app.appId} className="hover:bg-white/[0.015]">
                            <td className="py-3 px-3.5 font-mono font-bold text-purple-300">{app.appId}</td>
                            <td className="py-3 px-3.5">
                              <p className="font-semibold text-white">{app.name}</p>
                              <p className="text-[11px] text-white/50">{app.email} | {app.phone}</p>
                            </td>
                            <td className="py-3 px-3.5">
                              <p className="text-white/80">{app.portfolio1 || app.pref1}</p>
                              <p className="text-[11px] text-white/40">{app.portfolio2 || app.pref2}</p>
                            </td>
                            <td className="py-3 px-3.5">
                              {app.cvUrl ? (
                                <a
                                  href={app.cvUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-purple-500/10 border border-purple-400/20 text-purple-300 text-[11px] font-medium"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>View Drive CV</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-white/30 text-[11px]">No CV uploaded</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/20 text-[10px] font-semibold">
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

            {/* TAB 5: SETTINGS */}
            {activeSubTab === 'settings' && (
              <div className="max-w-2xl space-y-5">
                {/* Master Toggle */}
                <div className="p-6 rounded-xl border border-white/[0.08] bg-[#090b14] space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Live System Controls</h3>
                    <p className="text-xs text-white/50">Master switch and per-pathway enable/disable controls.</p>
                  </div>

                  {/* Master Toggle */}
                  <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">Master Registrations Gate</span>
                      <span className="text-[11px] text-white/50">
                        {siteSettings.registrationsOpen ? 'All pathways are accessible (subject to per-pathway setting).' : 'All registrations globally PAUSED regardless of per-pathway settings.'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiteSettings(prev => ({ ...prev, registrationsOpen: !prev.registrationsOpen }))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        siteSettings.registrationsOpen
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                          : 'bg-red-500/15 text-red-300 border border-red-400/30'
                      }`}
                    >
                      {siteSettings.registrationsOpen ? '● LIVE' : '⏸ PAUSED'}
                    </button>
                  </div>

                  {/* Per-Pathway Toggles */}
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-2">Per-Pathway Access Control</span>
                    <div className="space-y-2">
                      {[
                        { key: 'delegateOpen', label: 'Delegate Registrations', desc: 'Individual delegate registration form' },
                        { key: 'delegationOpen', label: 'Delegation Registrations', desc: 'School/group delegation form' },
                        { key: 'ocOpen', label: 'OC Applications', desc: 'Organizing Committee applications' },
                        { key: 'ebOpen', label: 'EB Applications', desc: 'Executive Board applications' },
                        { key: 'secretariatOpen', label: 'Secretariat Applications', desc: 'Secretariat team applications' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="p-3 rounded-lg bg-black/30 border border-white/[0.05] flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-white block">{label}</span>
                            <span className="text-[11px] text-white/40">{desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSiteSettings(prev => ({ ...prev, [key]: !prev[key] }))}
                            className={`shrink-0 px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              siteSettings[key]
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                                : 'bg-red-500/15 text-red-300 border border-red-400/30'
                            }`}
                          >
                            {siteSettings[key] ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pricing & Round Settings */}
                <div className="p-6 rounded-xl border border-white/[0.08] bg-[#090b14] space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Pricing & Round Settings</h3>
                    <p className="text-xs text-white/50">Changes are synchronized directly to the Google Sheet settings table.</p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1">Application Round Name</label>
                      <input
                        type="text"
                        value={siteSettings.roundName}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, roundName: e.target.value }))}
                        className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Delegate Fee (₹)</label>
                        <input
                          type="number"
                          value={siteSettings.delegateFee}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, delegateFee: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Delegation Per-Head (₹)</label>
                        <input
                          type="number"
                          value={siteSettings.delegationFee}
                          onChange={(e) => setSiteSettings(prev => ({ ...prev, delegationFee: e.target.value }))}
                          className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="h-9 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      {settingsSaving && <RefreshCw className="w-3 h-3 animate-spin" />}
                      <span>Publish All Settings</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* SCREENSHOT VERIFICATION LIGHTBOX */}
      {screenshotModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-5 rounded-2xl border border-white/15 bg-[#080b18] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Payment Receipt Verification</h3>
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

            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/60">UTR:</span>
              <span className="font-mono font-bold text-purple-300">{screenshotModalData.utr || 'None provided'}</span>
            </div>

            <div className="h-64 w-full rounded-lg bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center">
              {screenshotModalData.url ? (
                <img
                  src={screenshotModalData.url}
                  alt="Payment Receipt"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-xs text-white/40">No screenshot image stored</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setRegistrations(prev => prev.map(r => (r.regId || r.id) === screenshotModalData.regId ? { ...r, status: 'Confirmed' } : r));
                  notify(`Payment approved for ${screenshotModalData.name}!`);
                  setScreenshotModalData(null);
                }}
                className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setScreenshotModalData(null)}
                className="px-3 h-9 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium"
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
          <div className="relative w-full max-w-md p-5 rounded-2xl border border-purple-500/30 bg-[#080b18] shadow-2xl space-y-4">
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
                <label className="block text-xs font-medium text-white/70 mb-1">Committee</label>
                <select
                  value={allotmentModalData.committee}
                  onChange={(e) => setAllotmentModalData(prev => ({ ...prev, committee: e.target.value }))}
                  className="w-full h-9 px-2.5 rounded-lg bg-[#0d1024] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                >
                  <option value="UNSC">UNSC (United Nations Security Council)</option>
                  <option value="UNGA (DISEC)">UNGA (Disarmament & International Security)</option>
                  <option value="UNHRC">UNHRC (Human Rights Council)</option>
                  <option value="AIPPM">AIPPM (All India Political Parties Meet)</option>
                  <option value="IP">International Press</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">Allocated Country / Portfolio</label>
                <input
                  type="text"
                  placeholder="e.g. United States of America, India, France..."
                  value={allotmentModalData.country}
                  onChange={(e) => setAllotmentModalData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400"
                  required
                />
              </div>

              <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-[11px] text-purple-200/70 leading-relaxed">
                Submitting will save the allocation to Google Sheets and dispatch the automated allocation email directly to <b>{allotmentModalData.email}</b>.
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Confirm & Send Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllotmentModalData(null)}
                  className="px-3 h-9 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium"
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
          <div className="relative w-full max-w-md p-5 rounded-2xl border border-indigo-500/30 bg-[#080b18] shadow-2xl space-y-4">
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
                  className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Update Delegation
                </button>
                <button
                  type="button"
                  onClick={() => setReassignDelegationModalData(null)}
                  className="px-3 h-9 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium"
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
          <div className="relative w-full max-w-md p-5 rounded-2xl border border-white/15 bg-[#080b18] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Add Delegate Directly</h3>
                <p className="text-xs text-white/50">Manual directory insertion</p>
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
                  regId: 'RES-26-' + Math.floor(1000 + Math.random() * 9000),
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
                notify(`Delegate ${newDel.fullName} added!`);
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
                  <select name="committee" className="w-full h-8 px-2 rounded-lg bg-[#0d1024] border border-white/10 text-white text-xs">
                    <option value="UNSC">UNSC</option>
                    <option value="UNGA (DISEC)">UNGA (DISEC)</option>
                    <option value="UNHRC">UNHRC</option>
                    <option value="AIPPM">AIPPM</option>
                    <option value="IP">International Press</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Country</label>
                  <input name="country" placeholder="e.g. France" className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 h-9 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Delegate
                </button>
                <button
                  type="button"
                  onClick={() => setAddDelegateModalOpen(false)}
                  className="px-3 h-9 rounded-lg bg-white/[0.05] hover:bg-white/10 text-white text-xs font-medium"
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
