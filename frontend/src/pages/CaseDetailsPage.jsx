import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Building2, 
  ShieldAlert, 
  Send, 
  ArrowRightLeft, 
  AlertTriangle, 
  Link2, 
  CheckCircle, 
  ExternalLink,
  Sparkles,
  Paperclip,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { casesApi, adminApi } from '../api/client';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaIndicator } from '../components/common/SlaIndicator';
import { OverlapBadge } from '../components/common/OverlapBadge';
import { Modal } from '../components/common/Modal';

export const CaseDetailsPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast, bureaus = [] } = useApp();

  // Modals state
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [disposeModalOpen, setDisposeModalOpen] = useState(false);

  // Form states
  const [remarkText, setRemarkText] = useState('');
  const [docRef, setDocRef] = useState('');
  const [targetBureauId, setTargetBureauId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [escalationLevel, setEscalationLevel] = useState('Bureau Head (Director)');
  const [escalateReason, setEscalateReason] = useState('');
  const [selectedCaseToLink, setSelectedCaseToLink] = useState('');
  const [linkReason, setLinkReason] = useState('');
  const [disposeOrderRef, setDisposeOrderRef] = useState('');
  const [disposeRemarks, setDisposeRemarks] = useState('');

  // Fetch case by ID from backend
  const caseQuery = useQuery({
    queryKey: ['case-detail', caseId],
    queryFn: () => casesApi.getCaseById(caseId),
    enabled: Boolean(caseId),
  });

  // Fetch case history (audit timeline)
  const historyQuery = useQuery({
    queryKey: ['case-history', caseId],
    queryFn: () => casesApi.getCaseHistory(caseId),
    enabled: Boolean(caseId),
  });

  // Bureaus for transfer dropdown
  const bureausQuery = useQuery({
    queryKey: ['admin-bureaus'],
    queryFn: adminApi.getBureaus,
  });

  // Available bureaus (excluding current one)
  const bureausList = bureausQuery.data?.data || bureaus;

  const invalidateCaseQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['case-detail', caseId] });
    queryClient.invalidateQueries({ queryKey: ['case-history', caseId] });
    queryClient.invalidateQueries({ queryKey: ['cases-list'] });
  };

  // Mutations
  const remarkMutation = useMutation({
    mutationFn: (data) => casesApi.addCaseAction(caseId, data),
    onSuccess: () => {
      addToast('Remark Recorded', 'Official case note successfully logged', 'success');
      invalidateCaseQueries();
      setRemarkText(''); setDocRef(''); setRemarkModalOpen(false);
    },
    onError: (err) => {
      addToast('Remark Failed', err?.response?.data?.message || err.message, 'danger');
    },
  });

  const transferMutation = useMutation({
    mutationFn: (data) => casesApi.transferCase(caseId, data),
    onSuccess: (res) => {
      addToast('Case Transferred', res.message || 'Case transferred successfully', 'info');
      invalidateCaseQueries();
      setTransferReason(''); setTransferModalOpen(false);
    },
    onError: (err) => {
      addToast('Transfer Failed', err?.response?.data?.message || err.message, 'danger');
    },
  });

  const escalateMutation = useMutation({
    mutationFn: (data) => casesApi.escalateCase(caseId, data),
    onSuccess: (res) => {
      addToast('Case Escalated', 'Case elevated to Senior Management', 'warning');
      invalidateCaseQueries();
      setEscalateReason(''); setEscalateModalOpen(false);
    },
    onError: (err) => {
      addToast('Escalation Failed', err?.response?.data?.message || err.message, 'danger');
    },
  });

  const linkMutation = useMutation({
    mutationFn: (data) => casesApi.linkCases(data),
    onSuccess: () => {
      addToast('Cases Linked', 'Bidirectional link established between cases', 'info');
      invalidateCaseQueries();
      setSelectedCaseToLink(''); setLinkReason(''); setLinkModalOpen(false);
    },
    onError: (err) => {
      addToast('Link Failed', err?.response?.data?.message || err.message, 'danger');
    },
  });

  const disposeMutation = useMutation({
    mutationFn: (data) => casesApi.updateCase(caseId, data),
    onSuccess: () => {
      addToast('Case Disposed', 'Case has been formally closed', 'success');
      invalidateCaseQueries();
      setDisposeOrderRef(''); setDisposeRemarks(''); setDisposeModalOpen(false);
    },
    onError: (err) => {
      addToast('Disposal Failed', err?.response?.data?.message || err.message, 'danger');
    },
  });

  // Handler wrappers
  const handleAddRemarkSubmit = (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;
    remarkMutation.mutate({
      actionType: 'remark',
      remarks: docRef.trim() ? `${remarkText.trim()} (Ref: ${docRef.trim()})` : remarkText.trim(),
    });
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!targetBureauId || !transferReason.trim()) return;
    transferMutation.mutate({ targetBureauId, remarks: transferReason.trim() });
  };

  const handleEscalateSubmit = (e) => {
    e.preventDefault();
    if (!escalateReason.trim()) return;
    escalateMutation.mutate({ remarks: `Escalated to ${escalationLevel}: ${escalateReason.trim()}` });
  };

  const handleLinkSubmit = (e) => {
    e.preventDefault();
    if (!selectedCaseToLink || !linkReason.trim()) return;
    linkMutation.mutate({
      caseAId: caseId,
      caseBId: selectedCaseToLink,
      linkType: 'related',
      remarks: linkReason.trim(),
    });
  };

  const handleDisposeSubmit = (e) => {
    e.preventDefault();
    if (!disposeRemarks.trim()) return;
    disposeMutation.mutate({
      status: 'disposed',
      remarks: `Closure Order Ref: ${disposeOrderRef || 'N/A'}. Determination: ${disposeRemarks.trim()}`,
    });
  };

  // Loading / Error states
  if (caseQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-semibold text-slate-800">Loading case docket...</p>
      </div>
    );
  }

  if (caseQuery.isError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-lg mx-auto mt-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-rose-900">Case Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          {caseQuery.error?.response?.data?.message || `Case ID "${caseId}" does not exist in the central repository.`}
        </p>
        <button
          onClick={() => navigate('/cases')}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg"
        >
          Return to Cases Table
        </button>
      </div>
    );
  }

  const caseItem = caseQuery.data?.data || {};
  const history = historyQuery.data?.data || [];
  const links = caseItem.links || [];
  const overlap = caseItem.overlap || null;

  const now = new Date();
  const targetDate = caseItem.expectedDisposalDate ? new Date(caseItem.expectedDisposalDate) : null;
  const diffDays = targetDate ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const slaStatus = caseItem.isOverdue ? 'Beyond Timeline' : caseItem.isDueSoon ? 'Due Soon' : 'Within Timeline';

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold font-mono text-slate-900">{caseItem.caseId}</h1>
              <StatusBadge status={caseItem.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: <span className="font-semibold text-slate-700">{caseItem.sourceSystem}</span> • Filed {caseItem.receivedDate ? new Date(caseItem.receivedDate).toLocaleDateString() : ''}
            </p>
          </div>
        </div>

        {/* Consequential Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRemarkModalOpen(true)}
            disabled={remarkMutation.isPending}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-teal-600" />
            <span>Add Remark</span>
          </button>

          <button
            onClick={() => setTransferModalOpen(true)}
            disabled={caseItem.status === 'disposed'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors cursor-pointer disabled:opacity-40"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
            <span>Transfer Case</span>
          </button>

          <button
            onClick={() => setEscalateModalOpen(true)}
            disabled={caseItem.status === 'disposed' || caseItem.status === 'escalated'}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-40"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Escalate</span>
          </button>

          <button
            onClick={() => setLinkModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Link Case</span>
          </button>

          {caseItem.status !== 'disposed' && (
            <button
              onClick={() => setDisposeModalOpen(true)}
              disabled={disposeMutation.isPending}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer disabled:opacity-40"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Dispose / Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Overlap Alert Banner */}
      {overlap && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-lg shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-purple-950">
                  Potential Cross-Bureau Overlap Flag Active
                </h4>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-purple-200/80 text-purple-900 rounded capitalize">
                  {overlap.severity} Severity
                </span>
              </div>
              <p className="text-xs text-purple-800 mt-0.5">
                Concurrent inquiries are active against this institution across {overlap.cases?.length || 0} bureau dockets. Coordinate before issuing unilateral sanctions.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/overlaps')}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            <span>Open Overlap Centre</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Complaint Details & Institution Card */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Complaint Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Complaint Subject
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">{caseItem.category}</h2>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Full Description / Representation Text
              </span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans">
                {caseItem.description || 'No description provided.'}
              </p>
            </div>

            {caseItem.nextActionText && (
              <div className="p-3.5 bg-teal-50/60 rounded-lg border border-teal-100 flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-teal-900">Next Action Requirement:</span>
                  <p className="text-teal-800 mt-0.5">{caseItem.nextActionText}</p>
                </div>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Investigating Bureau</span>
                <div className="mt-1">
                  <BureauBadge bureau={caseItem.currentBureau?.name || caseItem.currentBureau?.code || 'Central'} />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Complainant Category</span>
                <span className="font-semibold text-slate-800 mt-1 block">{caseItem.complainantType || 'N/A'}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-800 mt-1 block truncate" title={caseItem.category}>
                  {caseItem.category}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Received Date</span>
                <span className="font-mono font-medium text-slate-700 mt-1 block">
                  {caseItem.receivedDate ? new Date(caseItem.receivedDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Target SLA Deadline</span>
                <span className="font-mono font-medium text-slate-700 mt-1 block">
                  {caseItem.expectedDisposalDate ? new Date(caseItem.expectedDisposalDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Timeline Health</span>
                <div className="mt-1">
                  <SlaIndicator
                    slaStatus={slaStatus}
                    daysRemaining={diffDays}
                    expectedDate={caseItem.expectedDisposalDate ? new Date(caseItem.expectedDisposalDate).toLocaleDateString() : 'N/A'}
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Source Reference</span>
                <span className="font-mono text-slate-700 mt-1 block text-[11px]">{caseItem.sourceCaseRef || 'N/A'}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Match Status</span>
                <span className={`font-semibold mt-1 block capitalize text-[11px] ${caseItem.matchStatus === 'matched' ? 'text-emerald-700' : caseItem.matchStatus === 'review' ? 'text-amber-700' : 'text-slate-600'}`}>
                  {caseItem.matchStatus || 'pending'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Match Score</span>
                <span className="font-mono font-bold text-slate-700 mt-1 block">{caseItem.matchScore != null ? `${caseItem.matchScore}%` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Institution Card */}
          {caseItem.institution && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                    <Building2 className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{caseItem.institution.name}</h3>
                    <p className="text-xs text-slate-500 font-mono">
                      AICTE Permanent ID: {caseItem.institution.aictePermanentId || 'Unassigned'}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/institutions/${caseItem.institution._id}`}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                >
                  <span>Institution Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Location</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">
                    {caseItem.institution.city}, {caseItem.institution.state}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Region</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{caseItem.institution.region}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Type</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{caseItem.institution.type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Overlap Status</span>
                  <span className="mt-0.5 block">
                    {overlap ? <OverlapBadge severity={overlap.severity} /> : (
                      <span className="text-emerald-700 font-medium">No Active Overlap</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Unmatched institution banner */}
          {!caseItem.institution && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Institution Not Linked</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Raw name: <span className="font-mono">{caseItem.rawInstitutionName || 'Unknown'}</span> — {caseItem.rawCity}, {caseItem.rawState}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  This case is pending institution matching. Go to <Link to="/match-review" className="underline font-semibold">Match Review</Link> to resolve.
                </p>
              </div>
            </div>
          )}

          {/* Linked Cases Card */}
          {links.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-teal-600" />
                <span>Officially Linked Cases ({links.length})</span>
              </h3>
              <div className="divide-y divide-slate-100 mt-2">
                {links.map((link) => {
                  const relCase = link.caseA?._id === caseId ? link.caseB : link.caseA;
                  return (
                    <div
                      key={link._id}
                      onClick={() => navigate(`/cases/${relCase?._id}`)}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer p-2 rounded transition-colors text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-teal-800">{relCase?.caseId}</span>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{relCase?.description || relCase?.category}</p>
                        <p className="text-[10px] text-slate-400">Linked by {link.createdBy?.name || 'System'} — {link.linkType}</p>
                      </div>
                      {relCase?.currentBureau && <BureauBadge bureau={relCase.currentBureau?.name || relCase.currentBureau?.code} showCodeOnly />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Assigned Officer & Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Officer Assignment Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Designated Handling Official
            </h3>
            {caseItem.assignedOfficer ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                  {(caseItem.assignedOfficer.name || '?')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900">{caseItem.assignedOfficer.name}</p>
                  <p className="text-[11px] text-slate-500">{caseItem.assignedOfficer.role}</p>
                  <p className="text-[11px] text-slate-400">{caseItem.assignedOfficer.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Unassigned — pending bureau allocation.</p>
            )}

            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Last Action</span>
                <p className="font-medium text-slate-700 mt-0.5 text-[11px] line-clamp-2">{caseItem.lastActionText || 'No action yet'}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Last Action Date</span>
                <span className="font-mono text-slate-700 mt-0.5 block text-[11px]">
                  {caseItem.lastActionDate ? new Date(caseItem.lastActionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Chronological Action Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Case Audit Trail ({history.length} Events)
              </h3>
              <button
                onClick={() => setRemarkModalOpen(true)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                + Add Note
              </button>
            </div>

            {historyQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
              </div>
            ) : (
              <div className="relative pl-5 space-y-5 border-l-2 border-slate-200 mt-4">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No audit events recorded yet.</p>
                ) : (
                  [...history].reverse().map((event) => (
                    <div key={event._id} className="relative group">
                      <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-white" />
                      <div className="text-xs space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="font-bold text-slate-900 capitalize">
                            {event.actionType?.replace(/_/g, ' ') || 'Action'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                          </span>
                        </div>

                        <p className="text-slate-600 text-xs leading-relaxed bg-slate-50/70 p-2.5 rounded border border-slate-100">
                          {event.remarks}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-700">{event.performedBy?.name || 'System'}</span>
                            {event.performedByBureau && (
                              <>
                                <span>•</span>
                                <span className="text-slate-500">{event.performedByBureau?.name || event.performedByBureau?.code}</span>
                              </>
                            )}
                          </div>

                          {event.fromBureau && event.toBureau && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              {event.fromBureau?.code} → {event.toBureau?.code}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Add Official Remark */}
      <Modal
        isOpen={remarkModalOpen}
        onClose={() => setRemarkModalOpen(false)}
        title="Record Official Case Remark"
        subtitle={`Appends an immutable audit entry to ${caseItem.caseId}`}
      >
        <form onSubmit={handleAddRemarkSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Remark / Action Note <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="Record inquiry findings, institutional response summary, or committee directions..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supporting File Reference (Optional)
            </label>
            <input
              type="text"
              value={docRef}
              onChange={(e) => setDocRef(e.target.value)}
              placeholder="e.g. AICTE-NOT-2026-9021.pdf or Dispatch #482"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setRemarkModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={remarkMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 inline-flex items-center gap-1.5">
              {remarkMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Record Remark
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Inter-Bureau Transfer */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Inter-Bureau Case Transfer"
        subtitle={`Route jurisdiction of ${caseItem.caseId} to another AICTE Cell`}
      >
        <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Recipient Bureau <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={targetBureauId}
              onChange={(e) => setTargetBureauId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="">-- Select Bureau --</option>
              {bureausList.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mandatory Transfer Justification <span className="text-rose-500">*</span>
            </label>
            <textarea required rows={3} value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Detail reasons why subject matter falls under recipient bureau mandate..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setTransferModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={transferMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 rounded-lg hover:bg-purple-800 disabled:opacity-50 inline-flex items-center gap-1.5">
              {transferMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Confirm Bureau Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Escalate Case */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Case to Higher Authority"
        subtitle={`Flag high priority and escalate ${caseItem.caseId}`}
      >
        <form onSubmit={handleEscalateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Escalation Level <span className="text-rose-500">*</span>
            </label>
            <select value={escalationLevel} onChange={(e) => setEscalationLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500">
              <option value="Bureau Head (Director)">Bureau Head (Director / Advisor)</option>
              <option value="Standing Appellate Committee">Standing Appellate Committee</option>
              <option value="AICTE Member Secretary">AICTE Member Secretary</option>
              <option value="AICTE Chairman Secretariat">AICTE Chairman Secretariat</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Escalation Ground / Severity Reason <span className="text-rose-500">*</span>
            </label>
            <textarea required rows={3} value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="State institutional non-compliance, statutory timeline breach, or public urgency..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setEscalateModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={escalateMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 rounded-lg hover:bg-rose-800 disabled:opacity-50 inline-flex items-center gap-1.5">
              {escalateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Confirm Escalation
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Link Related Case */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Establish Case Cross-Reference Link"
        subtitle={`Connects related case docket with ${caseItem.caseId}`}
      >
        <form onSubmit={handleLinkSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Case ID of Related Case <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={selectedCaseToLink}
              onChange={(e) => setSelectedCaseToLink(e.target.value)}
              placeholder="Paste the MongoDB _id or Case ID of the related case..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Enter the related case's database ID (visible in the case details URL).</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Linkage Rationale <span className="text-rose-500">*</span>
            </label>
            <textarea required rows={3} value={linkReason}
              onChange={(e) => setLinkReason(e.target.value)}
              placeholder="Explain how this case relates (e.g. concurrent faculty issue, repeated petitioner)..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setLinkModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={linkMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 inline-flex items-center gap-1.5">
              {linkMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Create Case Link
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Dispose / Close Case */}
      <Modal
        isOpen={disposeModalOpen}
        onClose={() => setDisposeModalOpen(false)}
        title="Final Disposal / Closure Determination"
        subtitle={`Mark ${caseItem.caseId} as resolved with formal order details`}
      >
        <form onSubmit={handleDisposeSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              AICTE Disposal Order Reference No.
            </label>
            <input type="text" value={disposeOrderRef}
              onChange={(e) => setDisposeOrderRef(e.target.value)}
              placeholder="e.g. AICTE/DISP/2026/0892"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Determination Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea required rows={4} value={disposeRemarks}
              onChange={(e) => setDisposeRemarks(e.target.value)}
              placeholder="Specify the regulatory remedy, refund compliance, or final committee findings..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setDisposeModalOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" disabled={disposeMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1.5">
              {disposeMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Confirm Case Disposal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CaseDetailsPage;
