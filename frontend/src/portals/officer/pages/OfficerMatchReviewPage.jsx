import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { BureauBadge } from '../../../shared/components/BureauBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerMatchReviewPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Pending');
  const [remarks, setRemarks] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['officer-match-review'],
    queryFn: officerApi.getMatchReviewQueue,
  });

  const confirmMutation = useMutation({
    mutationFn: ({ caseId, institutionId, remarks }) =>
      officerApi.confirmMatch(caseId, { institutionId, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries(['officer-match-review']);
      setConfirmingId(null);
      setRemarks('');
      refetch();
    },
  });

  const items = data?.data || [];
  const filtered = items.filter((item) => {
    if (activeTab === 'Pending') return item.matchStatus === 'review';
    if (activeTab === 'Confirmed') return item.matchStatus === 'matched';
    if (activeTab === 'Unmatched') return item.matchStatus === 'unmatched';
    return true;
  });

  const handleConfirm = (caseId, institutionId) => {
    setConfirmingId(caseId);
    confirmMutation.mutate({
      caseId,
      institutionId,
      remarks: remarks || 'Confirmed by officer in Match Review queue',
    });
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Fuzzy Match Verification Queue</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
              AI Institution Normalizer
            </span>
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Validate automated fuzzy-name matching between raw complaint submissions and registered AICTE permanent institutes.
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

      {/* Tabs */}
      <div className="flex gap-2 mb-4 shrink-0">
        {['Pending', 'Confirmed', 'Unmatched'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === tab
                ? 'bg-[#00E676] text-black font-bold shadow-sm'
                : 'bg-[#151618] text-[#A1A1AA] hover:text-white border border-[#232427]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 bg-[#121315] border border-[#232427] rounded-2xl overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-4">
            <SkeletonLoader count={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <CheckCheck className="w-12 h-12 text-[#52525B] mb-2" />
            <h3 className="text-base font-bold text-white">No dockets in {activeTab} review</h3>
            <p className="text-xs text-[#71717A] mt-1">All institution references are currently classified.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-xl bg-[#0F1011] border border-[#232427] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00E676]">{item.caseId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2023] text-[#A1A1AA]">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D97706]/15 text-[#F59E0B] border border-[#D97706]/30">
                      Score: {item.matchScore}%
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Raw Input Name:</span>
                    <h3 className="text-sm font-semibold text-white">{item.rawInstitutionName}</h3>
                    <div className="text-[10px] text-[#71717A]">
                      City: {item.rawCity || 'N/A'} &bull; State: {item.rawState || 'N/A'}
                    </div>
                  </div>

                  {item.suggestedInstitution && (
                    <div className="p-2.5 rounded-lg bg-[#151618] border border-[#232427] text-xs">
                      <span className="text-[10px] text-[#00E676] uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Suggested Permanent Registry Match:
                      </span>
                      <div className="font-semibold text-white mt-0.5">{item.suggestedInstitution.name}</div>
                      <div className="text-[10px] text-[#71717A]">
                        AICTE ID: {item.suggestedInstitution.aictePermanentId} &bull; Region: {item.suggestedInstitution.region}
                      </div>
                    </div>
                  )}
                </div>

                {item.suggestedInstitution && item.matchStatus !== 'matched' && (
                  <div className="shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleConfirm(item._id, item.suggestedInstitution._id)}
                      disabled={confirmMutation.isPending && confirmingId === item._id}
                      className="px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {confirmMutation.isPending && confirmingId === item._id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                          <span>Confirming...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Match</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerMatchReviewPage;
