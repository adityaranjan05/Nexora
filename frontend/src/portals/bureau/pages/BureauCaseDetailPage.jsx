import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Building,
  User,
  Calendar,
  Send,
  ArrowRightLeft,
  AlertCircle,
  FileText,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { bureauApi } from '../../../shared/api/bureauApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { Modal } from '../../../shared/components/Modal';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function BureauCaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('note');
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionAttachment, setActionAttachment] = useState('');

  const [requestInfoModalOpen, setRequestInfoModalOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetBureauId, setTargetBureauId] = useState('');
  const [transferRemarks, setTransferRemarks] = useState('');

  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [escalateRemarks, setEscalateRemarks] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Case
  const {
    data: caseData,
    isLoading: caseLoading,
    error: caseError,
  } = useQuery({
    queryKey: ['bureau', 'case', id],
    queryFn: () => bureauApi.getCaseById(id),
    retry: false,
  });

  // Fetch Case History
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['bureau', 'caseHistory', id],
    queryFn: () => bureauApi.getCaseHistory(id),
    enabled: !!id && !caseError,
  });

  // Fetch Bureaus for transfer dropdown
  const { data: bureausData } = useQuery({
    queryKey: ['bureau', 'allBureaus'],
    queryFn: () => bureauApi.getBureaus(),
    enabled: transferModalOpen,
  });

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: (payload) => bureauApi.updateCaseStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['bureau', 'case', id]);
      queryClient.invalidateQueries(['bureau', 'caseHistory', id]);
      queryClient.invalidateQueries(['bureau', 'cases']);
      queryClient.invalidateQueries(['bureau', 'dashboard']);
      setStatusModalOpen(false);
      setStatusRemarks('');
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update case status.');
    },
  });

  // Add Action Mutation
  const actionMutation = useMutation({
    mutationFn: (payload) => bureauApi.addCaseAction(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['bureau', 'caseHistory', id]);
      setActionModalOpen(false);
      setActionRemarks('');
      setActionAttachment('');
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to add action.');
    },
  });

  // Request Info Mutation
  const requestInfoMutation = useMutation({
    mutationFn: (payload) => bureauApi.requestInfo(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['bureau', 'case', id]);
      queryClient.invalidateQueries(['bureau', 'caseHistory', id]);
      queryClient.invalidateQueries(['bureau', 'cases']);
      setRequestInfoModalOpen(false);
      setInfoMessage('');
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to request info.');
    },
  });

  // Transfer Mutation
  const transferMutation = useMutation({
    mutationFn: (payload) => bureauApi.transferCase(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['bureau', 'cases']);
      queryClient.invalidateQueries(['bureau', 'dashboard']);
      setTransferModalOpen(false);
      navigate('/bureau/cases');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to transfer case.');
    },
  });

  // Escalate Mutation
  const escalateMutation = useMutation({
    mutationFn: (payload) => bureauApi.escalateCase(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['bureau', 'case', id]);
      queryClient.invalidateQueries(['bureau', 'caseHistory', id]);
      setEscalateModalOpen(false);
      setEscalateRemarks('');
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to escalate case.');
    },
  });

  if (caseLoading) {
    return (
      <div className="p-8 space-y-6">
        <SkeletonLoader className="h-8 w-48" />
        <SkeletonLoader className="h-64 w-full" />
      </div>
    );
  }

  if (caseError) {
    return (
      <div className="p-12 text-center bg-[#0F1011] border border-[#232427] rounded-2xl max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-[#FF4D79] mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white">Access Denied or Not Found</h2>
        <p className="text-xs text-[#71717A] mt-2 mb-6">
          {caseError.response?.data?.message ||
            'This complaint does not belong to your assigned bureau or does not exist.'}
        </p>
        <button
          onClick={() => navigate('/bureau/cases')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6C7BFF] text-white hover:bg-[#5868F3]"
        >
          Return to My Bureau Cases
        </button>
      </div>
    );
  }

  const c = caseData?.data || {};
  const history = historyData?.data || [];
  const bureaus = bureausData?.data || [];

  const isOverdue =
    c.expectedDisposalDate &&
    new Date(c.expectedDisposalDate) < new Date() &&
    !['disposed', 'rejected'].includes(c.status);

  const handleStatusSelectChange = (newStatus) => {
    setSelectedNewStatus(newStatus);
    setStatusRemarks('');
    setErrorMsg('');
    setStatusModalOpen(true);
  };

  const submitStatusUpdate = (e) => {
    e.preventDefault();
    if (selectedNewStatus === 'disposed' && !statusRemarks.trim()) {
      setErrorMsg('A final remark is required to mark a case Done (disposed).');
      return;
    }
    statusMutation.mutate({
      status: selectedNewStatus,
      remarks: statusRemarks.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-medium text-[#71717A] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to list</span>
        </button>

        <div className="flex items-center gap-2">
          {c.isOverlap && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#B07CFF]/15 text-[#B07CFF] border border-[#B07CFF]/30">
              <Layers className="w-3.5 h-3.5" />
              <span>Overlap Detected</span>
            </span>
          )}
          <StatusBadge status={c.status} size="md" />
        </div>
      </div>

      {/* Main Case Header Card */}
      <div className="bg-[#0F1011] border border-[#232427] rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white bg-[#151618] px-3 py-1 rounded-lg border border-[#232427]">
                {c.sourceCaseRef || c._id}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-[#232427] text-[#A1A1AA]">
                {c.category || 'General'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white font-semibold text-base">
              <Building className="w-4 h-4 text-[#6C7BFF]" />
              <span>{c.institution?.name || c.rawInstitutionName || 'Institution Not Specified'}</span>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-wrap bg-[#151618] p-4 rounded-xl border border-[#1F2023]">
              {c.description || 'No complaint narrative provided.'}
            </p>

            {/* Evidence Files if any */}
            {c.evidenceFiles && c.evidenceFiles.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-[#71717A] font-medium uppercase tracking-wider block mb-2">
                  Uploaded Evidence ({c.evidenceFiles.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {c.evidenceFiles.map((f, i) => (
                    <a
                      key={i}
                      href={f.fileUrl || f.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151618] border border-[#232427] text-xs text-[#6C7BFF] hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{f.originalName || `Attachment #${i + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Controls & SLA Box */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            {/* SLA Box */}
            <div className={`p-4 rounded-xl border ${isOverdue ? 'bg-[#FF4D79]/10 border-[#FF4D79]/30' : 'bg-[#151618] border-[#232427]'}`}>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-[#71717A] uppercase tracking-wider">Resolution SLA</span>
                {isOverdue && (
                  <span className="font-bold text-[#FF4D79] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Overdue
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white">
                {c.expectedDisposalDate ? (
                  new Date(c.expectedDisposalDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                ) : (
                  'No SLA set'
                )}
              </div>
              <div className="text-[11px] text-[#71717A] mt-1">
                Filing Date: {new Date(c.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Quick Bureau Status Changer */}
            <div className="bg-[#151618] border border-[#232427] p-4 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-[#A1A1AA] block">
                Update Case Status
              </label>
              <select
                value={c.status}
                onChange={(e) => handleStatusSelectChange(e.target.value)}
                className="w-full bg-[#0F1011] border border-[#232427] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6C7BFF]"
              >
                <option value="pending">Pending</option>
                <option value="under_process">In Progress</option>
                <option value="needs_info">Needs Info</option>
                <option value="disposed">Done (Mark Disposed)</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Bureau Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setActionModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#232427] hover:bg-[#2E3035] text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-[#6C7BFF]" />
                <span>Log Action / Note</span>
              </button>

              <button
                onClick={() => setRequestInfoModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center justify-center gap-2 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Request Info from Student</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#B07CFF]/15 hover:bg-[#B07CFF]/25 text-[#B07CFF] border border-[#B07CFF]/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowRightLeft className="w-3 h-3" />
                  <span>Transfer</span>
                </button>

                <button
                  onClick={() => setEscalateModalOpen(true)}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#FF4D79]/15 hover:bg-[#FF4D79]/25 text-[#FF4D79] border border-[#FF4D79]/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                  <span>Escalate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Overlap Note if applicable */}
      {c.isOverlap && (
        <div className="bg-[#B07CFF]/10 border border-[#B07CFF]/30 rounded-2xl p-4 flex items-start gap-3">
          <Layers className="w-5 h-5 text-[#B07CFF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">Cross-Bureau Coordination Notice</h4>
            <p className="text-xs text-[#D1D5DB] leading-relaxed">
              This institution has similar active complaints under investigation across other AICTE bureaus. Officers have cross-linked these cases. Check the Overlaps tab to coordinate findings with partner bureaus.
            </p>
          </div>
        </div>
      )}

      {/* Case Action History & Audit Timeline */}
      <div className="bg-[#0F1011] border border-[#232427] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#1F2023] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#6C7BFF]" />
            <h3 className="text-sm font-bold text-white">Action &amp; Audit Timeline</h3>
          </div>
          <span className="text-xs text-[#71717A]">{history.length} records</span>
        </div>

        {historyLoading ? (
          <div className="p-6 space-y-3">
            <SkeletonLoader className="h-8 w-full" />
            <SkeletonLoader className="h-8 w-full" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A]">
            No action history recorded yet.
          </div>
        ) : (
          <div className="p-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#232427]">
              {history.map((action, i) => (
                <div key={action._id || i} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#0F1011] border-2 border-[#6C7BFF] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6C7BFF]" />
                  </div>

                  <div className="bg-[#151618] border border-[#1F2023] p-4 rounded-xl space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white capitalize">
                          {action.actionType?.replace(/_/g, ' ') || 'Action'}
                        </span>
                        {action.fromStatus && action.toStatus && (
                          <span className="text-[10px] text-[#A1A1AA] bg-[#232427] px-2 py-0.5 rounded">
                            {action.fromStatus} → {action.toStatus}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#71717A]">
                        {new Date(action.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {action.remarks && (
                      <p className="text-xs text-[#D4D4D8] leading-relaxed">
                        {action.remarks}
                      </p>
                    )}

                    <div className="text-[10px] text-[#71717A] pt-1">
                      By: {action.performedBy?.name || 'System / Officer'} (
                      {action.performedBy?.role || 'Staff'})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Update Status */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Change Status to ${selectedNewStatus.toUpperCase()}`}
      >
        <form onSubmit={submitStatusUpdate} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-[#FF4D79]">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">
              Remarks {selectedNewStatus === 'disposed' && <span className="text-[#FF4D79]">* (Required for Done)</span>}
            </label>
            <textarea
              rows={4}
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder={
                selectedNewStatus === 'disposed'
                  ? 'Enter comprehensive resolution summary before marking as Done...'
                  : 'Optional rationale for status change...'
              }
              className="w-full bg-[#151618] border border-[#232427] rounded-xl p-3 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#6C7BFF]"
              required={selectedNewStatus === 'disposed'}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs bg-[#232427] text-white hover:bg-[#2E3035]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={statusMutation.isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6C7BFF] text-white hover:bg-[#5868F3] disabled:opacity-40"
            >
              {statusMutation.isLoading ? 'Saving...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Add Case Action / Note */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title="Log Bureau Action / Case Note"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            actionMutation.mutate({
              actionType,
              remarks: actionRemarks,
              attachmentUrl: actionAttachment || undefined,
            });
          }}
          className="space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-[#FF4D79]">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full bg-[#151618] border border-[#232427] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="note">Internal Investigation Note</option>
              <option value="hearing">Hearing Conducted</option>
              <option value="field_visit">Inspection / Field Visit</option>
              <option value="warning_issued">Notice / Warning Issued</option>
              <option value="document_received">Document Received</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Findings / Remarks</label>
            <textarea
              rows={4}
              value={actionRemarks}
              onChange={(e) => setActionRemarks(e.target.value)}
              placeholder="Record details of findings, hearings, or communications..."
              required
              className="w-full bg-[#151618] border border-[#232427] rounded-xl p-3 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#6C7BFF]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Attachment URL (Optional)</label>
            <input
              type="text"
              value={actionAttachment}
              onChange={(e) => setActionAttachment(e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#151618] border border-[#232427] rounded-xl px-3 py-2 text-xs text-white placeholder-[#71717A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs bg-[#232427] text-white hover:bg-[#2E3035]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionMutation.isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6C7BFF] text-white hover:bg-[#5868F3] disabled:opacity-40"
            >
              {actionMutation.isLoading ? 'Recording...' : 'Record Action'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Request Info from Student */}
      <Modal
        isOpen={requestInfoModalOpen}
        onClose={() => setRequestInfoModalOpen(false)}
        title="Request Additional Information from Student"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestInfoMutation.mutate({ message: infoMessage });
          }}
          className="space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-[#FF4D79]">
              {errorMsg}
            </div>
          )}

          <p className="text-xs text-[#A1A1AA]">
            This message will be shown directly to the student on their grievance dashboard. Case status will transition to <span className="text-[#F59E0B] font-semibold">Needs Info</span> until they reply.
          </p>

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Query / Required Documents</label>
            <textarea
              rows={4}
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="Specify the fee receipts, semester dates, or affidavits needed..."
              required
              className="w-full bg-[#151618] border border-[#232427] rounded-xl p-3 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRequestInfoModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs bg-[#232427] text-white hover:bg-[#2E3035]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestInfoMutation.isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F59E0B] text-black hover:bg-[#D97706] disabled:opacity-40"
            >
              {requestInfoMutation.isLoading ? 'Sending...' : 'Send Request to Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Transfer Case */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Case to Another Bureau"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            transferMutation.mutate({ targetBureauId, remarks: transferRemarks });
          }}
          className="space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-[#FF4D79]">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Target AICTE Bureau</label>
            <select
              value={targetBureauId}
              onChange={(e) => setTargetBureauId(e.target.value)}
              required
              className="w-full bg-[#151618] border border-[#232427] rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">Select destination bureau...</option>
              {bureaus
                .filter((b) => b._id !== c.currentBureau?._id && b._id !== c.currentBureau)
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code || 'Bureau'})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Transfer Reason / Remarks</label>
            <textarea
              rows={3}
              value={transferRemarks}
              onChange={(e) => setTransferRemarks(e.target.value)}
              placeholder="Why is this case being transferred to this bureau?"
              required
              className="w-full bg-[#151618] border border-[#232427] rounded-xl p-3 text-xs text-white placeholder-[#71717A]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setTransferModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs bg-[#232427] text-white hover:bg-[#2E3035]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={transferMutation.isLoading || !targetBureauId}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#B07CFF] text-white hover:bg-[#9955FF] disabled:opacity-40"
            >
              {transferMutation.isLoading ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Escalate Case */}
      <Modal
        isOpen={escalateModalOpen}
        onClose={() => setEscalateModalOpen(false)}
        title="Escalate Case to Officer Oversight Queue"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            escalateMutation.mutate({ remarks: escalateRemarks });
          }}
          className="space-y-4"
        >
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-[#FF4D79]">
              {errorMsg}
            </div>
          )}

          <p className="text-xs text-[#A1A1AA]">
            Escalation flags this case for senior management and super admin intervention on the Officer oversight desk.
          </p>

          <div>
            <label className="text-xs font-medium text-[#A1A1AA] block mb-1.5">Escalation Reason</label>
            <textarea
              rows={4}
              value={escalateRemarks}
              onChange={(e) => setEscalateRemarks(e.target.value)}
              placeholder="Explain the jurisdictional deadlock, institutional non-cooperation, or severe urgency..."
              required
              className="w-full bg-[#151618] border border-[#232427] rounded-xl p-3 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#FF4D79]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEscalateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs bg-[#232427] text-white hover:bg-[#2E3035]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={escalateMutation.isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF4D79] text-white hover:bg-[#E03D67] disabled:opacity-40"
            >
              {escalateMutation.isLoading ? 'Escalating...' : 'Confirm Escalation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default BureauCaseDetailPage;
