import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { OverlapBadge } from '../../../shared/components/OverlapBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerAssignmentQueuePage() {
  const navigate = useNavigate();

  const [selectedCase, setSelectedCase] = useState(null);
  const [bureauId, setBureauId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch unassigned complaints
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['officer-assignment-queue'],
    queryFn: () => officerApi.getCases({ bureau: 'unassigned', limit: 50 }),
  });

  // Fetch available bureaus
  const { data: bureausData } = useQuery({
    queryKey: ['officer-bureaus'],
    queryFn: officerApi.getBureaus,
  });

  const cases = data?.data || [];
  const bureaus = bureausData?.data || [];

  const handleOpenAssignModal = (c) => {
    setSelectedCase(c);
    setBureauId(bureaus[0]?._id || '');
    setRemarks(`Allocated to bureau for investigation.`);
    setDueDate('');
    setAssignError('');
    setSuccessMsg('');
  };

  const handleAssignSubmit = async (e) => {
    e?.preventDefault();
    if (!bureauId) {
      setAssignError('Please select a target Bureau.');
      return;
    }

    try {
      setSubmitting(true);
      setAssignError('');
      await officerApi.assignCase(selectedCase._id, {
        bureauId,
        remarks,
        dueDate: dueDate || undefined,
      });

      setSuccessMsg(`Case ${selectedCase.caseId} assigned successfully!`);
      setTimeout(() => {
        setSelectedCase(null);
        refetch();
      }, 1000);
    } catch (err) {
      setAssignError(err?.response?.data?.message || err?.message || 'Failed to assign case.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Intake &amp; Assignment Queue</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FF4D79]/15 text-[#FF4D79] border border-[#FF4D79]/30">
              {cases.length} Unassigned
            </span>
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Newly registered student complaints and unrouted dockets awaiting allocation to an AICTE bureau.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-xs font-medium text-[#A1A1AA] hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#00E676]' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 bg-[#121315] border border-[#232427] rounded-2xl overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-4">
            <SkeletonLoader count={6} />
          </div>
        ) : cases.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#00E676] mb-3" />
            <h3 className="text-base font-bold text-white">Queue is Clear!</h3>
            <p className="text-xs text-[#71717A] mt-1 max-w-sm">
              All incoming grievance dockets and student submissions have been successfully allocated to their respective bureaus.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cases.map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-xl bg-[#0F1011] border border-[#232427] hover:border-[#383A40] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00E676]">{c.caseId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2023] text-[#A1A1AA]">
                      {c.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF4D79]/15 text-[#FF4D79] font-bold">
                      Awaiting Allocation
                    </span>
                    {c.hasOverlap && <OverlapBadge severity={c.overlapSeverity || 'high'} />}
                  </div>

                  <h3 className="text-sm font-semibold text-white truncate">{c.rawInstitutionName}</h3>
                  <p className="text-xs text-[#A1A1AA] line-clamp-2 max-w-2xl">{c.description}</p>

                  <div className="text-[10px] text-[#71717A] flex items-center gap-3">
                    <span>Filed: {new Date(c.receivedDate).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span>Region: {c.institution?.region || c.rawState || 'Unknown'}</span>
                    <span>&bull;</span>
                    <span>Complainant: {c.complainantType || 'Student'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => navigate(`/officer/cases/${c._id}`)}
                    className="px-3 py-1.5 rounded-lg bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-xs font-medium text-[#A1A1AA] hover:text-white transition cursor-pointer"
                  >
                    Inspect
                  </button>
                  <button
                    onClick={() => handleOpenAssignModal(c)}
                    className="px-3 py-1.5 rounded-lg bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Assign Bureau</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1011] border border-[#232427] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute top-4 right-4 p-1 text-[#71717A] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-mono font-bold text-[#00E676]">
                {selectedCase.caseId}
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Assign Complaint to Bureau</h2>
              <p className="text-xs text-[#71717A] truncate">{selectedCase.rawInstitutionName}</p>
            </div>

            {assignError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-[#FF4D79] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Target AICTE Bureau / Cell *
                </label>
                <select
                  value={bureauId}
                  onChange={(e) => setBureauId(e.target.value)}
                  required
                  className="w-full py-2 px-3 bg-[#151618] border border-[#232427] rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
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
                <p className="text-[11px] text-[#8A99B5] mt-1.5 leading-relaxed bg-[#151618] p-2 rounded border border-[#232427]">
                  💡 <strong>Bureau Access:</strong> To view this case after assignment, log into the <strong>Bureau Portal</strong> (<code className="text-[#6C7BFF]">/bureau/login</code>) as the officer of the selected bureau.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Expected Disposal Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full py-1.5 px-3 bg-[#151618] border border-[#232427] rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Allocation Remarks &amp; Instructions
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full py-1.5 px-3 bg-[#151618] border border-[#232427] rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1F2023]">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-3 py-1.5 rounded-lg bg-[#151618] text-[#A1A1AA] text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      <span>Allocating...</span>
                    </>
                  ) : (
                    <span>Confirm Assignment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficerAssignmentQueuePage;
