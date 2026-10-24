import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  GitMerge,
  AlertTriangle,
  ShieldAlert,
  Share2,
  CheckCircle2,
  ExternalLink,
  User,
  Plus,
  Loader2,
  X,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { BureauBadge } from '../../../shared/components/BureauBadge';
import { OverlapBadge } from '../../../shared/components/OverlapBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerCaseDetailPage() {
  const { id: caseId } = useParams();
  const navigate = useNavigate();

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Form states
  const [targetBureauId, setTargetBureauId] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [escalateRemarks, setEscalateRemarks] = useState('');
  const [linkCaseBId, setLinkCaseBId] = useState('');
  const [linkType, setLinkType] = useState('related');
  const [linkRemarks, setLinkRemarks] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['officer-case-detail', caseId],
    queryFn: () => officerApi.getCaseById(caseId),
  });

  const { data: historyData } = useQuery({
    queryKey: ['officer-case-history', caseId],
    queryFn: () => officerApi.getCaseHistory(caseId),
  });

  const { data: bureausData } = useQuery({
    queryKey: ['officer-bureaus'],
    queryFn: officerApi.getBureaus,
  });

  const c = data?.data;
  const history = historyData?.data || [];
  const bureaus = bureausData?.data || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonLoader count={8} />
      </div>
    );
  }

  if (!c) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-white">Docket Not Found</h2>
        <p className="text-xs text-slate-400 mt-1">The requested complaint record does not exist or was moved.</p>
        <button
          onClick={() => navigate('/officer/cases')}
          className="mt-4 px-3 py-1.5 rounded-lg bg-[#101D35] text-xs text-white border border-slate-700/80"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  // Calculate SLA countdown
  const now = new Date();
  const expDate = c.expectedDisposalDate ? new Date(c.expectedDisposalDate) : null;
  const diffDays = expDate ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Handle Assign / Reassign Submit
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!targetBureauId) return;
    try {
      setSubmitting(true);
      setActionError('');
      await officerApi.assignCase(c._id, {
        bureauId: targetBureauId,
        remarks: assignRemarks,
        dueDate: assignDueDate || undefined,
      });
      setActionSuccess('Case assigned successfully!');
      setTimeout(() => {
        setShowAssignModal(false);
        setActionSuccess('');
        refetch();
      }, 900);
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to assign case');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Escalate Submit
  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setActionError('');
      await officerApi.escalateCase(c._id, { remarks: escalateRemarks });
      setActionSuccess('Case escalated to Senior Management queue!');
      setTimeout(() => {
        setShowEscalateModal(false);
        setActionSuccess('');
        refetch();
      }, 900);
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to escalate case');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Link Cases Submit
  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    if (!linkCaseBId) return;
    try {
      setSubmitting(true);
      setActionError('');
      await officerApi.linkCases({
        caseAId: c._id,
        caseBId: linkCaseBId,
        linkType,
        remarks: linkRemarks,
      });
      setActionSuccess('Cases linked successfully!');
      setTimeout(() => {
        setShowLinkModal(false);
        setActionSuccess('');
        refetch();
      }, 900);
    } catch (err) {
      setActionError(err?.response?.data?.message || err?.message || 'Failed to link case');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </button>

        {/* Action Buttons: Assign, Escalate, Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTargetBureauId(bureaus[0]?._id || '');
              setAssignRemarks('');
              setAssignDueDate('');
              setShowAssignModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            {c.currentBureau ? 'Reassign Bureau' : 'Assign to Bureau'}
          </button>
          <button
            onClick={() => {
              setEscalateRemarks('');
              setShowEscalateModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#101D35] hover:bg-[#FF4D79]/15 text-rose-400 border border-slate-700/80 hover:border-[#FF4D79]/30 text-xs font-semibold transition cursor-pointer"
          >
            Escalate
          </button>
          <button
            onClick={() => {
              setLinkCaseBId('');
              setLinkRemarks('');
              setShowLinkModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#101D35] hover:bg-[#172846] text-white border border-slate-700/80 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Link Case</span>
          </button>
        </div>
      </div>

      {/* OVERLAP WARNING BANNER AT THE TOP */}
      {c.overlap && (
        <div className="p-4 rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30 text-[#F59E0B] shadow-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#F59E0B]" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wide">
                Active Statutory Overlap Detected
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[#D97706]/20 border border-[#D97706]/40">
                Severity: {c.overlap.severity?.toUpperCase() || 'HIGH'}
              </span>
            </div>
            <p className="text-xs text-[#FDE68A] mt-1 leading-relaxed">
              This institution ({c.rawInstitutionName}) has active dockets pending across multiple AICTE bureaus simultaneously. Coordinate findings before issuing statutory orders or disposal directives.
            </p>
            <button
              onClick={() => navigate(`/officer/overlaps`)}
              className="mt-2 text-xs font-semibold text-[#F59E0B] hover:text-[#FBBF24] flex items-center gap-1 underline cursor-pointer"
            >
              <span>View Overlap Cluster in Overlap Centre</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Docket Header Card */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/70">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-mono text-blue-400">{c.caseId}</h1>
              <StatusBadge status={c.status} />
              {c.currentBureau ? (
                <BureauBadge bureau={c.currentBureau.name} />
              ) : (
                <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold">
                  Unassigned
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Category: <span className="text-white font-medium">{c.category}</span> &bull; Source: <span className="font-mono">{c.sourceSystem}</span>
            </p>
          </div>

          {/* SLA Countdown Badge */}
          <div className="flex items-center gap-4 bg-[#0B1730] border border-slate-700/80 rounded-xl px-4 py-2.5 self-start lg:self-auto">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">SLA Target</div>
              <div className="text-xs font-semibold text-white mt-0.5">
                {expDate ? expDate.toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="h-7 w-px bg-[#232427]" />
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Timeline Status</div>
              <div className="text-xs font-bold mt-0.5">
                {c.isOverdue ? (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Overdue by {Math.abs(diffDays)}d
                  </span>
                ) : diffDays !== null && diffDays <= 3 ? (
                  <span className="text-[#F59E0B] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due in {diffDays}d
                  </span>
                ) : (
                  <span className="text-blue-400">Within Target ({diffDays}d left)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details & Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="md:col-span-2 space-y-2">
            <div className="font-semibold text-slate-400 uppercase text-[10px]">Grievance Narrative</div>
            <p className="text-slate-100 leading-relaxed bg-[#0B1730] p-3.5 rounded-xl border border-slate-700/70">
              {c.description}
            </p>
          </div>
          <div className="space-y-3 bg-[#0B1730] p-3.5 rounded-xl border border-slate-700/70">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Complainant Type</div>
              <div className="text-white font-medium mt-0.5">{c.complainantType || 'Student'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Filing Date</div>
              <div className="text-white font-medium mt-0.5">{new Date(c.receivedDate).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Officer</div>
              <div className="text-white font-medium mt-0.5">{c.assignedOfficer?.name || 'Unassigned'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Institution Details & Other Cases Across Bureaus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Institution Info */}
        <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Institution Profile</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="text-sm font-bold text-white">{c.rawInstitutionName}</div>
            <div className="text-slate-300">
              Location: {c.institution?.city || c.rawCity || 'N/A'}, {c.institution?.state || c.rawState || 'N/A'}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              AICTE Permanent ID: {c.institution?.aictePermanentId || 'Pending Verification'}
            </div>
            <div className="text-[11px] text-slate-400">
              Region: <span className="text-white font-medium">{c.institution?.region || c.rawState || 'Central'}</span>
            </div>
            {c.institution?._id && (
              <button
                onClick={() => navigate(`/officer/institutions/${c.institution._id}`)}
                className="mt-2 text-xs text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Institution Master Profile</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Other Open Cases Across Bureaus for Same Institution */}
        <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Other Open Cases for this Institution ({c.otherInstitutionCases?.length || 0})
              </h3>
            </div>
          </div>

          {(!c.otherInstitutionCases || c.otherInstitutionCases.length === 0) ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-[#0B1730] rounded-xl border border-slate-700/70">
              No other concurrent open dockets for this institution.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {c.otherInstitutionCases.map((other) => (
                <div
                  key={other._id}
                  onClick={() => navigate(`/officer/cases/${other._id}`)}
                  className="p-2.5 rounded-xl bg-[#0B1730] hover:bg-[#101D35] border border-slate-700/70 transition flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-white">{other.caseId}</div>
                    <div className="text-[10px] text-slate-400">{other.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {other.currentBureau && <BureauBadge bureau={other.currentBureau.name} />}
                    <StatusBadge status={other.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit History Timeline */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span>Statutory Audit Trail &amp; Case History</span>
        </h3>

        {history.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">No historical action logs recorded yet.</div>
        ) : (
          <div className="space-y-4 pl-2 border-l border-slate-700/80">
            {history.map((act) => (
              <div key={act._id} className="relative pl-5">
                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-[#121315]" />
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#172846]">
                      {act.actionType}
                    </span>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                    {act.performedBy && (
                      <span className="text-slate-400 text-[10px]">
                        by {act.performedBy.name} ({act.performedBy.role})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#D4D4D8] mt-1 bg-[#0B1730] p-2 rounded-lg border border-slate-700/70">
                    {act.remarks}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ASSIGN / REASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1730] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-1">Assign / Reassign Bureau</h2>
            <p className="text-xs text-slate-400 mb-4">Route docket to an operational cell or bureau.</p>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-rose-400 text-xs">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs">
                {actionSuccess}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Select Target Bureau *</label>
                <select
                  value={targetBureauId}
                  onChange={(e) => setTargetBureauId(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-[#101D35] border border-slate-700/80 rounded-lg text-white"
                >
                  {bureaus.map((b) => {
                    const officerEmail = b.code === 'RB' ? 'officer.rb@aicte.gov.in' : b.code === 'APPROVAL' ? 'officer.approval@aicte.gov.in' : b.code === 'ACADEMIC' ? 'officer.academic@aicte.gov.in' : b.code === 'PGRC' ? 'officer.pgrc@aicte.gov.in' : `officer.${b.code?.toLowerCase()}@aicte.gov.in`;
                    return (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.code}) — Login: {officerEmail}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-[#8A99B5] mt-1.5 leading-relaxed bg-[#101D35] p-2 rounded border border-slate-700/80">
                  💡 <strong>Bureau Access:</strong> To view this case after assignment, log into the <strong>Bureau Portal</strong> (<code className="text-blue-400">/bureau/login</code>) as the officer of the selected bureau.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Disposal Due Date (Optional)</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full py-1.5 px-3 bg-[#101D35] border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Allocation Remarks</label>
                <textarea
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  rows={3}
                  placeholder="Instructions for the assigned bureau officer..."
                  className="w-full py-1.5 px-3 bg-[#101D35] border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/70">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#101D35] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1730] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEscalateModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-1">Escalate Docket</h2>
            <p className="text-xs text-slate-400 mb-4">
              Escalate to Senior Management for regulatory hearing or expedited action.
            </p>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-rose-400 text-xs">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs">
                {actionSuccess}
              </div>
            )}

            <form onSubmit={handleEscalateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Escalation Justification</label>
                <textarea
                  value={escalateRemarks}
                  onChange={(e) => setEscalateRemarks(e.target.value)}
                  rows={3}
                  required
                  placeholder="Reason for immediate senior management intervention..."
                  className="w-full py-1.5 px-3 bg-[#101D35] border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/70">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#101D35] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#FF4D79] text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Escalating...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK CASE MODAL */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1730] border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLinkModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-1">Link to Another Docket</h2>
            <p className="text-xs text-slate-400 mb-4">Establish statutory relationship between complaints.</p>

            {actionError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-rose-400 text-xs">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs">
                {actionSuccess}
              </div>
            )}

            <form onSubmit={handleLinkSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Case ID (Mongo ID or Docket ID) *</label>
                <input
                  type="text"
                  value={linkCaseBId}
                  onChange={(e) => setLinkCaseBId(e.target.value)}
                  placeholder="Enter other case _id"
                  required
                  className="w-full py-1.5 px-3 bg-[#101D35] border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Relationship Type</label>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  className="w-full py-1.5 px-3 bg-[#101D35] border border-slate-700/80 rounded-lg text-white"
                >
                  <option value="related">Related Matter</option>
                  <option value="duplicate">Potential Duplicate</option>
                  <option value="parent_child">Parent / Child Branch</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Remarks</label>
                <textarea
                  value={linkRemarks}
                  onChange={(e) => setLinkRemarks(e.target.value)}
                  rows={2}
                  className="w-full py-1.5 px-3 bg-[#101D35] border border-slate-700/80 rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-700/70">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#101D35] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Linking...' : 'Establish Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficerCaseDetailPage;
