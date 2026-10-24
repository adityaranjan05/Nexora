import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { matchReviewApi, casesApi } from '../api/client';
import { useApp } from '../context/AppContext';
import { BureauBadge } from '../components/common/BureauBadge';

export const MatchReviewPage = () => {
  const { addToast } = useApp();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Pending');

  const { data: queueResponse, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['match-review'],
    queryFn: matchReviewApi.getQueue,
  });

  const confirmMutation = useMutation({
    mutationFn: ({ caseId, institutionId, remarks }) =>
      matchReviewApi.confirmMatch(caseId, { institutionId, remarks }),
    onSuccess: (res) => {
      addToast('Institution Matched', res.message || 'Institution matched successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['match-review'] });
    },
    onError: (err) => {
      addToast('Match Confirmation Failed', err?.response?.data?.message || 'Failed to confirm match', 'danger');
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ caseId, remarks }) =>
      casesApi.addCaseAction(caseId, {
        actionType: 'remark',
        remarks: `Flagged for manual field verification: ${remarks}`,
      }),
    onSuccess: () => {
      addToast('Flagged for Manual Verification', 'Case queued for physical registry verification', 'warning');
      queryClient.invalidateQueries({ queryKey: ['match-review'] });
    },
    onError: (err) => {
      addToast('Flagging Failed', err?.response?.data?.message || 'Failed to flag case', 'danger');
    },
  });

  const items = queueResponse?.data || [];

  const filteredReviews = items.filter((item) => {
    if (activeTab === 'Pending') return item.matchStatus === 'review';
    if (activeTab === 'Confirmed') return item.matchStatus === 'matched';
    if (activeTab === 'Manual') return item.matchStatus === 'unmatched';
    return true;
  });

  const pendingCount = items.filter((m) => m.matchStatus === 'review').length;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans">
            Institution Identity Match Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Resolve fuzzy institution names from incoming petitions into authoritative AICTE Permanent IDs (PID).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg border border-slate-700 bg-[#101D35] hover:bg-[#172846] text-slate-300 transition-colors"
            title="Refresh queue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded-lg border border-amber-500/30 font-semibold">
            {pendingCount} Pending Human Review
          </span>
        </div>
      </div>

      {/* Human-in-the-Loop Protocol Notice */}
      <div className="bg-[#111F3A] border border-slate-700/80 text-slate-100 p-4 rounded-xl shadow-subtle flex items-start space-x-3 text-xs">
        <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white uppercase tracking-wide">
            Automated Ingestion vs. Human Confirmation Protocol:
          </span>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            AICTE regulations mandate that fuzzy matches below 98% certainty must be formally confirmed by a nodal officer
            before binding regulatory orders are issued. Confirming a match permanently links the complaint docket to the AICTE Master Registry.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/80 pb-3 text-xs">
        {['Pending', 'Confirmed', 'Manual', 'All'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#142B45] text-white font-semibold'
                : 'bg-[#101D35] text-slate-300 hover:bg-[#172846] border border-slate-700'
            }`}
          >
            {tab === 'Pending' ? 'Pending Review' : tab === 'Confirmed' ? 'Human Confirmed' : tab === 'Manual' ? 'Flagged Manual' : 'All Reviews'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#101D35] rounded-xl border border-slate-700/80">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading match review queue...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center justify-between text-rose-200 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Failed to load match review queue: {error?.message || 'Server error'}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Match Review Items */}
      {!isLoading && !isError && (
        <div className="space-y-5">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((item) => {
              const c = item.case || {};
              const candidates = item.suggestions || [];
              const rawAddress = [c.rawCity, c.rawState, c.rawPincode].filter(Boolean).join(', ') || 'Address not specified';
              const receivedFormatted = c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'N/A';
              const isConfirmed = item.matchStatus === 'matched';
              const isManual = item.matchStatus === 'unmatched';

              return (
                <div
                  key={c._id || item._id}
                  className="bg-[#101D35] rounded-xl border border-slate-700/80 shadow-subtle overflow-hidden"
                >
                  {/* Card Header: Raw Intake Data */}
                  <div className="p-4 sm:p-5 bg-[#0B1730] border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-100">{c.caseId}</span>
                        {c.currentBureau && (
                          <BureauBadge bureau={c.currentBureau.name || c.currentBureau.code} />
                        )}
                        <span className="text-xs text-slate-400">• Filed {receivedFormatted}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mt-1">
                        Petition Raw Name: <span className="text-rose-300 underline decoration-dotted">{c.rawInstitutionName || 'Unnamed Institution'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Provided Address: {rawAddress}</span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isConfirmed
                            ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                            : isManual
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isConfirmed ? 'Human Confirmed' : isManual ? 'Flagged Manual' : 'Pending Review'}
                      </span>
                    </div>
                  </div>

                  {/* Subject Snippet */}
                  <div className="px-5 py-3 border-b border-slate-700/70 text-xs bg-[#0D192F] text-slate-300">
                    <span className="font-bold text-slate-200">Complainant Subject:</span> {c.description || c.subject || 'No subject summary recorded'}
                  </div>

                  {/* Candidates Grid */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      AICTE Registry Candidates (Fuzzy Token Match Engine):
                    </span>

                    <div className="space-y-3">
                      {candidates.map((cand, idx) => {
                        const inst = cand.institution || {};
                        const candScore = cand.score || 0;
                        const isThisConfirmed = isConfirmed && (c.institution?._id === inst._id || c.institution === inst._id);

                        return (
                          <div
                            key={inst._id || idx}
                            className={`p-4 rounded-lg border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isThisConfirmed
                                ? 'border-blue-500/70 bg-blue-500/10 ring-1 ring-blue-500/30'
                                : 'border-slate-700/80 bg-[#0D192F] hover:border-slate-500 hover:bg-[#12213C]'
                            }`}
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                                  PID: {inst.aictePermanentId || 'PENDING'}
                                </span>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                                  {inst.name}
                                </h4>
                                <span className="text-xs text-slate-500">
                                  ({inst.city}, {inst.state})
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/70">
                                  ✓ Token Normalized Match
                                </span>
                                {c.rawCity && inst.city && c.rawCity.toLowerCase() === inst.city.toLowerCase() && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                                    ✓ City Exact Match
                                  </span>
                                )}
                                {inst.region && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                                    Region: {inst.region}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Confidence Metric & Action */}
                            <div className="flex flex-wrap items-center gap-4 shrink-0">
                              <div className="text-right">
                                <div className="flex items-center space-x-1 justify-end">
                                  <span className="font-mono text-base font-bold text-slate-100">
                                    {candScore}%
                                  </span>
                                  <span className="text-[10px] text-slate-400">Match</span>
                                </div>
                                <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full rounded-full ${
                                      candScore >= 90
                                        ? 'bg-blue-500'
                                        : candScore >= 70
                                        ? 'bg-amber-400'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${candScore}%` }}
                                  />
                                </div>
                              </div>

                              {!isConfirmed && (
                                <button
                                  disabled={confirmMutation.isPending}
                                  onClick={() =>
                                    confirmMutation.mutate({
                                      caseId: c._id,
                                      institutionId: inst._id,
                                      remarks: `Confirmed from review queue (Confidence: ${candScore}%)`,
                                    })
                                  }
                                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                                >
                                  {confirmMutation.isPending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  )}
                                  <span>Confirm PID</span>
                                </button>
                              )}

                              {isThisConfirmed && (
                                <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-300">
                                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                                  <span>Confirmed Match</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Secondary manual flag button */}
                    {!isConfirmed && (
                      <div className="pt-2 flex justify-end">
                        <button
                          disabled={flagMutation.isPending}
                          onClick={() =>
                            flagMutation.mutate({
                              caseId: c._id,
                              remarks: 'Candidate list does not match actual campus address. Requires manual field verification.',
                            })
                          }
                          className="text-xs font-semibold text-slate-400 hover:text-rose-300 disabled:opacity-50 transition-colors"
                        >
                          Cannot resolve? Flag for manual field verification →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs bg-[#101D35] rounded-xl border border-slate-700/80">
              No match reviews in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchReviewPage;
