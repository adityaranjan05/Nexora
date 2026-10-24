import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  Send,
  FileText,
  Paperclip,
  AlertCircle,
  AlertTriangle,
  User,
} from 'lucide-react';
import { studentApi } from '../../../shared/api/studentApi';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

const PLAIN_STATUS = {
  pending: { label: 'Submitted — Awaiting Assignment', color: '#8A99B5' },
  under_process: { label: 'Under Investigation by AICTE', color: '#6C7BFF' },
  needs_info: { label: 'Officer Requested More Information From You', color: '#F59E0B' },
  transferred: { label: 'Transferred to Another AICTE Bureau', color: '#B07CFF' },
  escalated: { label: 'Escalated to Senior AICTE Management', color: '#FF4D79' },
  disposed: { label: 'Resolved & Closed by AICTE', color: '#00E676' },
  rejected: { label: 'Complaint Rejected', color: '#EF4444' },
};

export function StudentCaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [replyMessage, setReplyMessage] = useState('');
  const [replyAttachmentName, setReplyAttachmentName] = useState('');
  const [replyAttachmentUrl, setReplyAttachmentUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ['student', 'case', id],
    queryFn: () => studentApi.getCaseById(id),
    retry: false,
  });

  const replyMutation = useMutation({
    mutationFn: (payload) => studentApi.replyCase(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['student', 'case', id]);
      queryClient.invalidateQueries(['student', 'cases']);
      setReplyMessage('');
      setReplyAttachmentName('');
      setReplyAttachmentUrl('');
      setErrorMsg('');
      setSuccessMsg('Your reply has been sent to the investigating officer.');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to send reply. Please try again.');
    },
  });

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      setErrorMsg('Please write your response message.');
      return;
    }
    const attachments = replyAttachmentUrl.trim()
      ? [{ originalName: replyAttachmentName || 'Attachment', fileUrl: replyAttachmentUrl.trim() }]
      : [];
    replyMutation.mutate({ message: replyMessage.trim(), attachments });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <SkeletonLoader className="h-8 w-48" />
        <SkeletonLoader className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-12 text-center max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white">Complaint Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">This complaint may not exist or does not belong to your account.</p>
        <button onClick={() => navigate('/student')} className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500">
          Return to My Complaints
        </button>
      </div>
    );
  }

  const c = caseData?.data || {};
  const statusInfo = PLAIN_STATUS[c.status] || { label: c.status, color: '#A1A1AA' };
  const timeline = c.timeline || [];
  const infoRequests = c.infoRequests || [];
  const latestInfoRequest = infoRequests.length > 0 ? infoRequests[infoRequests.length - 1] : null;
  const isNeedsInfo = c.status === 'needs_info';
  const isClosed = ['disposed', 'rejected'].includes(c.status);

  return (
    <div className="space-y-6 max-w-3xl pb-12 mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to my complaints</span>
      </button>

      {/* Complaint Summary Card */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-bold text-white bg-[#0B1730] px-3 py-1 rounded border border-slate-700/80">
                {c.caseId || c._id}
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-[#172846] text-slate-300">{c.category}</span>
            </div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-300" />
              <span>{c.institution?.name || c.rawInstitutionName || 'Institution'}</span>
            </div>
          </div>
        </div>

        {/* Plain-language status indicator */}
        <div
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: `${statusInfo.color}10`,
            borderColor: `${statusInfo.color}30`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: statusInfo.color }} />
            <span className="text-sm font-bold text-white">{statusInfo.label}</span>
          </div>
          {c.status === 'pending' && (
            <p className="text-xs mt-2" style={{ color: statusInfo.color }}>
              Your complaint has been received and is in the queue for assignment to an investigation bureau.
            </p>
          )}
          {c.status === 'under_process' && (
            <p className="text-xs mt-2" style={{ color: statusInfo.color }}>
              AICTE officers are actively reviewing your complaint and coordinating with the institution.
            </p>
          )}
          {c.status === 'disposed' && (
            <p className="text-xs mt-2" style={{ color: statusInfo.color }}>
              Your complaint has been resolved. Review the timeline below for details of the outcome.
            </p>
          )}
          {c.status === 'rejected' && (
            <p className="text-xs mt-2" style={{ color: statusInfo.color }}>
              Your complaint could not be processed. Please see the officer's remarks in the timeline below.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Your Complaint</div>
          <p className="text-xs text-slate-200 leading-relaxed bg-[#0B1730] p-4 rounded-xl border border-slate-700/80">
            {c.description || 'No description provided.'}
          </p>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0B1730] p-3 rounded-xl border border-slate-700/80">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Date Filed</div>
            <div className="text-white font-medium flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" />
              {c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'Not recorded'}
            </div>
          </div>
          {c.disposedDate && (
            <div className="bg-[#0B1730] p-3 rounded-xl border border-slate-700/80">
              <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Date Closed</div>
              <div className="text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                {new Date(c.disposedDate).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Attached Evidence */}
        {c.evidenceFiles && c.evidenceFiles.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Your Submitted Documents
            </div>
            <div className="flex flex-wrap gap-2">
              {c.evidenceFiles.map((f, i) => (
                <a
                  key={i}
                  href={f.fileUrl || f.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1730] border border-slate-700/80 text-xs text-blue-300 hover:underline"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{f.originalName || `File ${i + 1}`}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Request Reply Box — Only when needs_info */}
      {isNeedsInfo && latestInfoRequest && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AICTE Officer Needs More Information</h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-3 rounded-xl mt-2">
                {latestInfoRequest.remarks}
              </p>
            </div>
          </div>

          {successMsg ? (
            <div className="p-4 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleReplySubmit} className="space-y-3">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Your Reply <span className="text-rose-300">*</span>
                </label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Provide the requested information, documents, or clarification..."
                  required
                  className="w-full bg-[#0B1730] border border-amber-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={replyAttachmentName}
                  onChange={(e) => setReplyAttachmentName(e.target.value)}
                  placeholder="Document name (optional)"
                  className="bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
                <input
                  type="text"
                  value={replyAttachmentUrl}
                  onChange={(e) => setReplyAttachmentUrl(e.target.value)}
                  placeholder="Attachment URL (Google Drive / PDF link)"
                  className="bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={replyMutation.isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{replyMutation.isLoading ? 'Sending...' : 'Send Reply to AICTE'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Public Updates Timeline */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-700/80 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-300" />
          <h3 className="text-sm font-bold text-white">Complaint Progress Timeline</h3>
        </div>

        {timeline.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No public updates have been recorded yet. Check back as your complaint progresses.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#172846]">
              {timeline.map((action, i) => {
                const isLatest = i === timeline.length - 1;
                return (
                  <div key={action._id || i} className="relative">
                    <div
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isLatest ? 'bg-blue-500/15 border-blue-400' : 'bg-[#101D35] border-slate-700/80'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-[#B07CFF]' : 'bg-[#71717A]'}`} />
                    </div>

                    <div className="bg-[#0B1730] border border-slate-700/80 p-4 rounded-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-white capitalize">
                          {action.actionType === 'info_requested'
                            ? '📋 Information Requested from You'
                            : action.actionType === 'info_replied'
                            ? '✉️ Your Reply Received'
                            : action.actionType === 'status_change'
                            ? '🔄 Status Updated'
                            : action.actionType === 'disposed'
                            ? '✅ Case Resolved'
                            : action.actionType === 'rejected'
                            ? '❌ Case Rejected'
                            : action.actionType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(action.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {action.remarks && (
                        <p className="text-xs text-slate-200 leading-relaxed">{action.remarks}</p>
                      )}

                      {action.toStatus && (
                        <div className="mt-2 text-[11px] text-slate-400">
                          Status changed to:{' '}
                          <span className="text-white font-medium">{PLAIN_STATUS[action.toStatus]?.label || action.toStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCaseDetailPage;
