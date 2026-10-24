import React, { useState } from 'react';
import { 
  Check, 
  HelpCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Inbox,
  Clock,
  Building,
  User,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useApp } from '../../../context/AppContext';
import { casesApi } from '../../../api/client';
import { Modal } from '../../common/Modal';
import { EmptyState } from '../../common/EmptyState';
import { BureauBadge } from '../../common/BureauBadge';
import { OverlapBadge } from '../../common/OverlapBadge';
import { studentIntakeStore } from './studentIntakeStore';
import { 
  getBureauForCategory, 
  getExpectedDisposalDate 
} from './config';

export const PortalSubmissions = ({ onViewAllCases }) => {
  const { bureaus, cases, setCases, addToast, setAlerts } = useApp();
  const queryClient = useQueryClient();

  // Load submissions from store
  const [submissions, setSubmissions] = useState(() => studentIntakeStore.getSubmissions());
  const [expandedId, setExpandedId] = useState(null);

  // Modal State for Request Info & Reject
  const [activeModal, setActiveModal] = useState(null); // { type: 'request_info' | 'reject', item: ... }
  const [modalReason, setModalReason] = useState('');
  const [modalError, setModalError] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  // Reload local state helper
  const refreshList = () => {
    setSubmissions(studentIntakeStore.getSubmissions());
  };

  // ACCEPT ACTION: Converts submission into real case
  const handleAccept = async (sub) => {
    try {
      setActionInProgress(true);
      const generatedCaseId = studentIntakeStore.getNextCaseId();
      const targetBureau = getBureauForCategory(sub.category, bureaus);
      const expectedDisposal = getExpectedDisposalDate(sub.category);

      // Overlap check
      const instCases = (cases || []).filter(
        (c) => 
          (c.institution?._id === sub.institutionId || c.rawInstitutionName === sub.institutionName) &&
          c.status !== 'disposed'
      );
      const triggersOverlap = instCases.length >= 1;

      const payload = {
        studentName: sub.studentName,
        enrollmentNo: sub.enrollmentNo,
        email: sub.email,
        phone: sub.phone,
        institutionId: sub.institutionId,
        rawInstitutionName: sub.institutionName,
        rawState: sub.region || 'Central',
        category: sub.category,
        subject: sub.subject,
        description: sub.description,
        sourceSystem: 'GEN',
        evidenceFiles: (sub.evidenceFiles || []).map((f) => f.name),
      };

      let createdDocket = null;
      try {
        const response = await casesApi.createCase(payload);
        if (response?.data) {
          createdDocket = response.data;
        }
      } catch (apiErr) {
        console.warn('API fallback to client state for portal submission accept:', apiErr?.message);
      }

      if (!createdDocket) {
        createdDocket = {
          _id: 'case_' + Date.now(),
          caseId: generatedCaseId,
          institution: {
            _id: sub.institutionId || 'inst_' + Date.now(),
            name: sub.institutionName,
            aictePermanentId: sub.aictePermanentId,
            region: sub.region,
          },
          rawInstitutionName: sub.institutionName,
          category: sub.category,
          status: 'pending',
          currentBureau: {
            _id: targetBureau._id || 'bureau_' + targetBureau.code,
            code: targetBureau.code,
            name: targetBureau.name,
          },
          filingDate: new Date().toISOString(),
          receivedDate: new Date().toISOString(),
          expectedDisposalDate: expectedDisposal.toISOString(),
          hasOverlap: triggersOverlap,
          overlapSeverity: triggersOverlap ? 'high' : null,
          isOverdue: false,
          isDueSoon: false,
          description: `[${sub.subject}] ${sub.description}`,
          complainantType: 'Student',
        };
      }

      // Remove from submissions queue in store
      studentIntakeStore.acceptSubmission(sub.id);
      refreshList();

      // Update AppContext cases immediately
      setCases((prev) => [createdDocket, ...prev]);

      // Invalidate react-query cache so cases table refreshes immediately
      queryClient.invalidateQueries({ queryKey: ['cases-list'] });
      queryClient.setQueriesData({ queryKey: ['cases-list'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: [createdDocket, ...(old.data || [])],
          pagination: {
            ...old.pagination,
            total: (old.pagination?.total || 0) + 1,
          },
        };
      });

      // Push Alert
      setAlerts((prev) => [
        {
          id: `alert-accept-${Date.now()}`,
          alertId: `alert-accept-${Date.now()}`,
          isRead: false,
          timestamp: new Date().toLocaleString(),
          severity: triggersOverlap ? 'high' : 'medium',
          title: triggersOverlap
            ? `Multi-Bureau Overlap: Case ${createdDocket.caseId}`
            : `Portal Submission Accepted: ${createdDocket.caseId}`,
          description: `Student submission ${sub.trackingId} verified and admitted as formal case assigned to ${targetBureau.name}.`,
          relatedCaseId: createdDocket.caseId,
          institutionName: sub.institutionName,
        },
        ...prev,
      ]);

      addToast(
        'Submission Accepted',
        `Created formal case ${createdDocket.caseId} assigned to ${targetBureau.name}.`,
        'success'
      );
    } catch (err) {
      console.error('Accept failed:', err);
      addToast('Action Failed', err?.message || 'Failed to accept submission.', 'danger');
    } finally {
      setActionInProgress(false);
    }
  };

  // Open modal for Request Info
  const openRequestInfoModal = (sub) => {
    setActiveModal({ type: 'request_info', item: sub });
    setModalReason('');
    setModalError('');
  };

  // Open modal for Reject
  const openRejectModal = (sub) => {
    setActiveModal({ type: 'reject', item: sub });
    setModalReason('');
    setModalError('');
  };

  // Confirm Modal Action (Request Info or Reject)
  const handleConfirmModal = () => {
    if (!modalReason.trim() || modalReason.trim().length < 10) {
      setModalError('Please specify a detailed reason (at least 10 characters).');
      return;
    }

    const { type, item } = activeModal;
    if (type === 'request_info') {
      studentIntakeStore.requestInfo(item.id, modalReason.trim());
      addToast(
        'Clarification Requested',
        `Submission ${item.trackingId} moved to Needs Info. Student notified.`,
        'info'
      );
    } else if (type === 'reject') {
      studentIntakeStore.rejectSubmission(item.id, modalReason.trim());
      addToast(
        'Complaint Rejected',
        `Submission ${item.trackingId} has been rejected with recorded reason.`,
        'warning'
      );
    }

    setActiveModal(null);
    setModalReason('');
    setModalError('');
    refreshList();
  };

  if (submissions.length === 0) {
    return (
      <EmptyState
        title="All Portal Submissions Reviewed"
        description="There are no pending student complaints in the verification queue. All portal submissions have been triaged or actioned."
        icon={Inbox}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="bg-[#151618] rounded-xl border border-[#232427] overflow-hidden">
        <div className="px-4 py-3 bg-[#0F1011] border-b border-[#232427] flex items-center justify-between text-xs text-[#71717A]">
          <span className="font-semibold text-[#F4F4F5]">
            Unreviewed Portal Submissions ({submissions.length})
          </span>
          <span>Click any row to expand grievance narrative and review evidence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A1A1AA] divide-y divide-[#232427]">
            <thead className="bg-[#0F1011] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Submitted On</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232427] font-sans">
              {submissions.map((sub) => {
                const isExpanded = expandedId === sub.id;
                const formattedDate = new Date(sub.submittedOn).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <React.Fragment key={sub.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      className={`hover:bg-[#1A1B1E] transition-colors cursor-pointer ${
                        isExpanded ? 'bg-[#1A1B1E]' : ''
                      }`}
                    >
                      {/* Tracking ID */}
                      <td className="px-4 py-3 font-mono font-bold text-[#F4F4F5] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#00E676]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
                          )}
                          <span>{sub.trackingId}</span>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-[#F4F4F5]">{sub.studentName}</div>
                        <div className="text-[11px] text-[#71717A] font-mono">
                          {sub.enrollmentNo} • {sub.phone}
                        </div>
                      </td>

                      {/* Institution */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-[#F4F4F5] truncate">
                          {sub.institutionName}
                        </div>
                        <div className="text-[11px] text-[#71717A] font-mono">
                          PID: {sub.aictePermanentId} • {sub.region}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1F2023] text-[#F4F4F5] border border-[#2D2E32]">
                          {sub.category}
                        </span>
                      </td>

                      {/* Submitted On */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-[#A1A1AA]">
                        {formattedDate}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#8A99B5]/20 text-[#8A99B5] border border-[#8A99B5]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8A99B5] animate-pulse" />
                          Awaiting Verification
                        </span>
                      </td>

                      {/* Row Actions: Accept, Request Info, Reject */}
                      <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Accept Button */}
                          <button
                            type="button"
                            onClick={() => handleAccept(sub)}
                            disabled={actionInProgress}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-black bg-[#00E676] hover:bg-[#00c864] rounded-md transition disabled:opacity-50"
                            title="Accept complaint and create official case docket"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>

                          {/* Request Info Button */}
                          <button
                            type="button"
                            onClick={() => openRequestInfoModal(sub)}
                            disabled={actionInProgress}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#6C7BFF] bg-[#6C7BFF]/10 hover:bg-[#6C7BFF]/20 border border-[#6C7BFF]/30 rounded-md transition"
                            title="Request clarification or additional documentation from student"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Request Info</span>
                          </button>

                          {/* Reject Button */}
                          <button
                            type="button"
                            onClick={() => openRejectModal(sub)}
                            disabled={actionInProgress}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#FF4D79] bg-[#FF4D79]/10 hover:bg-[#FF4D79]/20 border border-[#FF4D79]/30 rounded-md transition"
                            title="Reject complaint with recorded justification"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Detail Accordion */}
                    {isExpanded && (
                      <tr className="bg-[#0F1011] border-b border-[#232427]">
                        <td colSpan={7} className="p-4 sm:p-5">
                          <div className="bg-[#151618] border border-[#232427] rounded-xl p-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232427] pb-2">
                              <div>
                                <span className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold">
                                  Subject
                                </span>
                                <h4 className="text-sm font-semibold text-[#F4F4F5]">
                                  {sub.subject}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#71717A]">Target Bureau:</span>
                                <BureauBadge bureau={getBureauForCategory(sub.category, bureaus).name} />
                              </div>
                            </div>

                            {/* Description narrative */}
                            <div>
                              <span className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold block mb-1">
                                Full Grievance Narrative
                              </span>
                              <p className="text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-wrap bg-[#0A0A0B] p-3 rounded-lg border border-[#232427]">
                                {sub.description}
                              </p>
                            </div>

                            {/* Attached Evidence Files */}
                            <div>
                              <span className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold block mb-1">
                                Attached Evidence Files ({sub.evidenceFiles?.length || 0})
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {sub.evidenceFiles?.map((file, i) => (
                                  <div
                                    key={i}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0A0B] border border-[#232427] text-xs text-[#F4F4F5]"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#00E676]" />
                                    <span>{file.name}</span>
                                    <span className="text-[10px] text-[#71717A] font-mono">({file.size})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Request Info or Reject */}
      <Modal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={
          activeModal?.type === 'request_info'
            ? 'Request Clarification from Student'
            : 'Reject Complaint Submission'
        }
        subtitle={
          activeModal?.item
            ? `Tracking ID: ${activeModal.item.trackingId} • ${activeModal.item.studentName}`
            : ''
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#A1A1AA] mb-1">
              {activeModal?.type === 'request_info'
                ? 'Information / Documents Requested *'
                : 'Reason for Rejection *'}
            </label>
            <textarea
              rows={4}
              value={modalReason}
              onChange={(e) => {
                setModalReason(e.target.value);
                setModalError('');
              }}
              placeholder={
                activeModal?.type === 'request_info'
                  ? 'Detail the missing documents or clarification needed from the complainant...'
                  : 'State the statutory reason why this complaint cannot be admitted into central registry...'
              }
              className={`w-full p-3 bg-[#0F1011] border rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition ${
                modalError ? 'border-[#FF4D79]' : 'border-[#232427]'
              }`}
            />
            {modalError && (
              <p className="text-[10px] text-[#FF4D79] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {modalError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232427]">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-3.5 py-1.5 rounded-lg bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-[#F4F4F5] text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmModal}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
                activeModal?.type === 'request_info'
                  ? 'bg-[#6C7BFF] hover:bg-[#5867E8]'
                  : 'bg-[#FF4D79] hover:bg-[#E63965]'
              }`}
            >
              {activeModal?.type === 'request_info' ? 'Send Request to Student' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PortalSubmissions;
