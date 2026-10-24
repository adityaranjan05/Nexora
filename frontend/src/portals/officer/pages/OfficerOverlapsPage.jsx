import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  GitMerge,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  Building2,
  Clock,
  X,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { BureauBadge } from '../../../shared/components/BureauBadge';
import { OverlapBadge } from '../../../shared/components/OverlapBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerOverlapsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedOverlapId, setSelectedOverlapId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('open');
  const [resolveModal, setResolveModal] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState('coordinated');
  const [remarks, setRemarks] = useState('');
  const [resolveError, setResolveError] = useState('');

  const params = filterStatus !== 'all' ? { status: filterStatus } : {};

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['officer-overlaps', params],
    queryFn: () => officerApi.getOverlaps(params),
  });

  const overlaps = data?.data || [];
  const selectedGroup = overlaps.find((o) => o._id === (selectedOverlapId || overlaps[0]?._id)) || overlaps[0];
  const groupCases = selectedGroup?.cases || [];

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }) => officerApi.resolveOverlap(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['officer-overlaps']);
      setResolveModal(false);
      setRemarks('');
      setResolveError('');
      refetch();
    },
    onError: (err) => {
      setResolveError(err?.response?.data?.message || err?.message || 'Resolution failed');
    },
  });

  const handleOpenResolve = (statusVal) => {
    setResolutionStatus(statusVal);
    setRemarks(
      statusVal === 'coordinated'
        ? 'Cross-bureau inquiry consolidated. Regulatory Bureau appointed as lead cell.'
        : 'Overlap reviewed and dismissed. Separate unrelated grounds.'
    );
    setResolveError('');
    setResolveModal(true);
  };

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    resolveMutation.mutate({
      id: selectedGroup._id,
      data: { status: resolutionStatus, remarks },
    });
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Statutory Overlap Coordination Centre</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#D97706]/15 text-[#F59E0B] border border-[#D97706]/30">
              {overlaps.length} Clusters
            </span>
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Identify institutions with concurrent cases across multiple AICTE cells to prevent contradictory orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-[#121315] border border-[#232427] p-0.5 text-xs">
            {['open', 'coordinated', 'dismissed', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition cursor-pointer ${
                  filterStatus === st ? 'bg-[#00E676] text-black font-bold' : 'text-[#71717A] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-[#A1A1AA] hover:text-white transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#00E676]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      {isLoading ? (
        <div className="p-4">
          <SkeletonLoader count={6} />
        </div>
      ) : overlaps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#121315] border border-[#232427] rounded-2xl">
          <GitMerge className="w-12 h-12 text-[#52525B] mb-2" />
          <h3 className="text-base font-bold text-white">No Overlaps in this filter</h3>
          <p className="text-xs text-[#71717A] mt-1">Select another filter status or check back as complaints arrive.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel: Overlap Clusters List */}
          <div className="lg:col-span-5 bg-[#121315] border border-[#232427] rounded-2xl p-3 flex flex-col overflow-hidden">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#71717A] px-2 py-1 mb-2">
              Overlap Groups ({overlaps.length})
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {overlaps.map((ov) => {
                const isSelected = ov._id === selectedGroup?._id;
                return (
                  <div
                    key={ov._id}
                    onClick={() => setSelectedOverlapId(ov._id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#151618] border-[#00E676]/40 shadow-md'
                        : 'bg-[#0F1011] border-[#1F2023] hover:border-[#2E3035]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <OverlapBadge severity={ov.severity || 'high'} />
                      <span className="text-[10px] font-mono text-[#71717A]">
                        {ov.cases?.length || 0} Open Cases
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white truncate">
                      {ov.institution?.name || 'Institution Record'}
                    </h3>
                    <div className="text-[10px] text-[#71717A] mt-0.5">
                      {ov.institution?.city || 'Location N/A'} &bull; Status: <span className="capitalize text-[#A1A1AA]">{ov.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Detailed Coordination View */}
          <div className="lg:col-span-7 bg-[#121315] border border-[#232427] rounded-2xl p-5 flex flex-col overflow-hidden">
            {selectedGroup ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header & Status */}
                <div className="pb-4 border-b border-[#1F2023] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-white">
                        {selectedGroup.institution?.name}
                      </h2>
                      <OverlapBadge severity={selectedGroup.severity || 'high'} />
                    </div>
                    <div className="text-xs text-[#71717A]">
                      AICTE ID: <span className="font-mono text-white">{selectedGroup.institution?.aictePermanentId || 'Pending'}</span> &bull; Region: <span className="text-white">{selectedGroup.institution?.region || 'Central'}</span>
                    </div>
                  </div>

                  {/* Resolve Actions (Officer only) */}
                  {selectedGroup.status === 'open' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenResolve('coordinated')}
                        className="px-3 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Coordinate</span>
                      </button>
                      <button
                        onClick={() => handleOpenResolve('dismissed')}
                        className="px-3 py-1.5 rounded-xl bg-[#151618] hover:bg-[#232427] text-[#A1A1AA] hover:text-white border border-[#232427] text-xs font-medium transition cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>

                {selectedGroup.status !== 'open' && (
                  <div className="my-3 p-3 rounded-xl bg-[#151618] border border-[#232427] text-xs">
                    <span className="font-bold text-[#00E676] capitalize">{selectedGroup.status}: </span>
                    <span className="text-[#A1A1AA]">{selectedGroup.resolutionRemarks || 'Resolved by statutory officer.'}</span>
                  </div>
                )}

                {/* Overlapping Cases in this Group */}
                <div className="flex-1 overflow-y-auto mt-4 space-y-3">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Concurrent Cases Across Bureaus ({groupCases.length})
                  </div>
                  {groupCases.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => navigate(`/officer/cases/${c._id}`)}
                      className="p-3.5 rounded-xl bg-[#0F1011] hover:bg-[#151618] border border-[#1F2023] hover:border-[#33353A] transition cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-[#00E676]">{c.caseId}</span>
                          <span className="text-[10px] text-[#A1A1AA]">&bull; {c.category}</span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] line-clamp-1">{c.description || 'Regulatory matter'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {c.currentBureau && <BureauBadge bureau={c.currentBureau.name} />}
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-[#71717A]">
                Select an overlap group to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* RESOLVE OVERLAP MODAL */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F1011] border border-[#232427] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setResolveModal(false)}
              className="absolute top-4 right-4 p-1 text-[#71717A] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-1">
              {resolutionStatus === 'coordinated' ? 'Mark Overlap Coordinated' : 'Dismiss Overlap'}
            </h2>
            <p className="text-xs text-[#71717A] mb-4">
              {resolutionStatus === 'coordinated'
                ? 'Consolidate multiple bureau investigations under a lead cell.'
                : 'Dismiss this cluster if investigations are completely unrelated.'}
            </p>

            {resolveError && (
              <div className="mb-4 p-3 rounded-lg bg-[#FF4D79]/10 border border-[#FF4D79]/30 text-[#FF4D79] text-xs">
                {resolveError}
              </div>
            )}

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A1A1AA] mb-1 font-medium">Statutory Resolution Remarks *</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  required
                  className="w-full py-1.5 px-3 bg-[#151618] border border-[#232427] rounded-lg text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#1F2023]">
                <button
                  type="button"
                  onClick={() => setResolveModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#151618] text-[#A1A1AA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolveMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-[#00E676] text-black font-bold disabled:opacity-50"
                >
                  {resolveMutation.isPending ? 'Saving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfficerOverlapsPage;
