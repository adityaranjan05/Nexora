import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  GitMerge, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Link2, 
  History, 
  FileText, 
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { overlapsApi, casesApi } from '../api/client';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaIndicator } from '../components/common/SlaIndicator';
import { OverlapBadge } from '../components/common/OverlapBadge';
import { Modal } from '../components/common/Modal';

export const OverlapCentrePage = () => {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedOverlapId, setSelectedOverlapId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals state
  const [coordinateModalOpen, setCoordinateModalOpen] = useState(false);
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Form states
  const [leadBureau, setLeadBureau] = useState('');
  const [coordinationRemarks, setCoordinationRemarks] = useState('');
  const [jointHearingDate, setJointHearingDate] = useState('');
  const [dismissReason, setDismissReason] = useState('');

  // Fetch all overlaps
  const params = {};
  if (filterStatus !== 'All') params.status = filterStatus.toLowerCase();
  
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['overlaps', params],
    queryFn: () => overlapsApi.getOverlaps(params),
  });

  const overlaps = data?.data || [];
  
  // Auto-select first overlap
  const effectiveSelectedId = selectedOverlapId || overlaps[0]?._id;
  const selectedGroup = overlaps.find((ov) => ov._id === effectiveSelectedId) || overlaps[0];

  const filteredOverlaps = overlaps;
  const groupCases = selectedGroup?.cases || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['overlaps'] });

  const coordinateMutation = useMutation({
    mutationFn: (data) => overlapsApi.resolveOverlap(selectedGroup._id, { status: 'coordinated', ...data }),
    onSuccess: () => {
      addToast('Overlap Coordinated', 'Joint inquiry directives issued', 'success');
      invalidate();
      setCoordinationRemarks(''); setCoordinateModalOpen(false);
    },
    onError: (err) => addToast('Failed', err?.response?.data?.message || err.message, 'danger'),
  });

  const dismissMutation = useMutation({
    mutationFn: (data) => overlapsApi.resolveOverlap(selectedGroup._id, { status: 'dismissed', ...data }),
    onSuccess: () => {
      addToast('Overlap Dismissed', 'Dismissal rationale recorded', 'info');
      invalidate();
      setDismissReason(''); setDismissModalOpen(false);
    },
    onError: (err) => addToast('Failed', err?.response?.data?.message || err.message, 'danger'),
  });

  const linkMutation = useMutation({
    mutationFn: () => {
      if (groupCases.length >= 2) {
        return casesApi.linkCases({
          caseAId: groupCases[0]._id,
          caseBId: groupCases[1]._id,
          linkType: 'overlap',
          remarks: `Linked via Overlap Group: Concurrent investigation coordination.`,
        });
      }
      return Promise.resolve();
    },
    onSuccess: () => addToast('Cases Linked', 'Cross-reference established between overlap dockets', 'info'),
    onError: (err) => addToast('Link Failed', err?.response?.data?.message || err.message, 'danger'),
  });

  const handleCoordinateSubmit = (e) => {
    e.preventDefault();
    if (!coordinationRemarks.trim()) return;
    coordinateMutation.mutate({ remarks: coordinationRemarks, leadBureau, jointHearingDate });
  };

  const handleDismissSubmit = (e) => {
    e.preventDefault();
    if (!dismissReason.trim()) return;
    dismissMutation.mutate({ remarks: dismissReason });
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-panel p-4 sm:p-6 space-y-6 select-none-off text-[#F4F4F5]">
      {/* Statutory Authority Disclaimer Banner (Image 1 style deep purple) */}
      <div className="bg-gradient-to-r from-[#2E1065] via-[#3B0764] to-[#1E1B4B] text-white rounded-card p-5 border border-[#581C87] shadow-lg">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-white/10 rounded-xl shrink-0 mt-0.5 border border-white/20">
            <GitMerge className="w-6 h-6 text-[#C084FC]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-tight text-[#F4F4F5]">
                AICTE Inter-Bureau Overlap Coordination Centre
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#7C3AED]/40 text-[#E9D5FF] border border-[#A855F7]/40 uppercase">
                Human-in-the-Loop Protocol
              </span>
            </div>
            <p className="text-xs text-[#D8B4FE] mt-1 max-w-4xl leading-relaxed">
              <strong>Mandatory Protocol:</strong> An overlap flag indicates potential jurisdictional overlap or concurrent investigations across AICTE Bureaus/Cells.
              It is <em>not proof of duplicate complaints</em>. Automated case merging is strictly prohibited.
              Nodal officers must evaluate case merits and execute joint coordination directives before final determination.
            </p>
          </div>
        </div>
      </div>

      {/* Loading / Error States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 bg-[#151618] rounded-card border border-[#232427]">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E676] mb-3" />
          <p className="text-sm font-medium text-[#71717A]">Loading overlap review queue...</p>
        </div>
      )}

      {isError && (
        <div className="bg-[#151618] border border-[#FF4D79]/40 rounded-card p-6 text-center">
          <AlertCircle className="w-8 h-8 text-[#FF4D79] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#F4F4F5]">Failed to load overlaps</h3>
          <p className="text-xs text-[#71717A] mt-1">{error?.message || 'Server error'}</p>
          <button onClick={() => refetch()} className="mt-3 text-xs font-semibold text-[#00E676] hover:underline">Retry</button>
        </div>
      )}

      {/* Main Two-Column Workflow Container */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Overlap Review Queue */}
          <div className="lg:col-span-4 bg-[#151618] rounded-card border border-[#232427] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#232427]">
              <div>
                <h3 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider">
                  Overlap Review Queue ({filteredOverlaps.length})
                </h3>
                <p className="text-[11px] text-[#71717A]">Cross-bureau correlation triggers</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => refetch()} className="p-1 text-[#71717A] hover:text-[#F4F4F5] cursor-pointer">
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs px-2 py-1 bg-[#0F1011] border border-[#232427] rounded-lg font-medium text-[#F4F4F5] focus:outline-none"
                >
                  <option value="All" className="bg-[#151618]">All Statuses</option>
                  <option value="open" className="bg-[#151618]">Open</option>
                  <option value="coordinated" className="bg-[#151618]">Coordinated</option>
                  <option value="dismissed" className="bg-[#151618]">Dismissed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {overlaps.length === 0 ? (
                <p className="text-xs text-[#71717A] py-6 text-center">No overlap groups found for selected filter.</p>
              ) : (
                filteredOverlaps.map((ov) => {
                  const isSelected = ov._id === effectiveSelectedId;
                  const inst = ov.institution;
                  return (
                    <div
                      key={ov._id}
                      onClick={() => setSelectedOverlapId(ov._id)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#7C3AED] bg-[#7C3AED]/15 shadow-sm ring-1 ring-[#7C3AED]'
                          : 'border-[#232427] bg-[#0F1011] hover:border-[#2D2E32] hover:bg-[#1A1B1E]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#C084FC]">
                          OVL-{ov._id.slice(-6).toUpperCase()}
                        </span>
                        <OverlapBadge severity={ov.severity} />
                      </div>

                      <h4 className="text-xs font-bold text-[#F4F4F5] mt-1 line-clamp-1">
                        {inst?.name || 'Unknown Institution'}
                      </h4>
                      <p className="text-[11px] font-mono text-[#71717A]">
                        {inst?.aictePermanentId || 'PID Unassigned'}
                      </p>

                      <p className="text-[11px] text-[#A1A1AA] line-clamp-2 mt-1.5 leading-snug">
                        {ov.triggerReason || 'Concurrent bureau investigations detected'}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#232427] text-[11px]">
                        <span className="text-[#71717A] font-mono">{ov.cases?.length || 0} Dockets</span>
                        <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] capitalize ${
                          ov.status === 'coordinated'
                            ? 'bg-[#19D3A2]/20 text-[#19D3A2]'
                            : ov.status === 'dismissed'
                            ? 'bg-[#232427] text-[#71717A]'
                            : 'bg-[#7C3AED]/20 text-[#C084FC]'
                        }`}>
                          {ov.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Deep Side-by-Side Comparison & Action Pane */}
          {selectedGroup ? (
            <div className="lg:col-span-8 space-y-5">
              {/* Active Group Header & Actions */}
              <div className="bg-[#151618] rounded-card border border-[#232427] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232427]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-[#C084FC] bg-[#7C3AED]/15 px-2 py-0.5 rounded border border-[#7C3AED]/30">
                        OVL-{selectedGroup._id.slice(-6).toUpperCase()}
                      </span>
                      <h2 className="text-base font-bold text-[#F4F4F5]">
                        {selectedGroup.institution?.name || 'Unknown Institution'}
                      </h2>
                    </div>
                    <p className="text-xs text-[#71717A] mt-0.5">
                      PID: <span className="font-mono font-semibold text-[#A1A1AA]">
                        {selectedGroup.institution?.aictePermanentId || 'Unassigned'}
                      </span> • Flagged on {selectedGroup.createdAt ? new Date(selectedGroup.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      selectedGroup.status === 'coordinated'
                        ? 'bg-[#19D3A2]/20 text-[#19D3A2] border border-[#19D3A2]/40'
                        : selectedGroup.status === 'dismissed'
                        ? 'bg-[#232427] text-[#71717A] border border-[#2D2E32]'
                        : 'bg-[#7C3AED]/20 text-[#C084FC] border border-[#7C3AED]/40'
                    }`}>
                      {selectedGroup.status}
                    </span>
                  </div>
                </div>

                {/* Trigger Rationale Box */}
                <div className="bg-[#7C3AED]/10 p-3.5 rounded-lg border border-[#7C3AED]/30 space-y-1">
                  <span className="text-[11px] font-bold text-[#C084FC] uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Why This Institution Was Flagged:</span>
                  </span>
                  <p className="text-xs text-[#E9D5FF] leading-relaxed font-sans">
                    {selectedGroup.triggerReason || 'Multiple concurrent bureau investigations detected for this institution.'}
                  </p>
                </div>

                {/* Resolved Details Banner */}
                {selectedGroup.status === 'coordinated' && selectedGroup.resolution && (
                  <div className="p-3 bg-[#19D3A2]/10 rounded-lg border border-[#19D3A2]/30 text-xs text-[#19D3A2] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#19D3A2]" />
                      <span>Officially Coordinated</span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">{selectedGroup.resolution.remarks}</p>
                    {selectedGroup.resolution.resolvedBy && (
                      <p className="text-[11px] font-medium text-[#71717A]">
                        By: {selectedGroup.resolution.resolvedBy?.name} on {new Date(selectedGroup.resolution.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {selectedGroup.status === 'dismissed' && selectedGroup.resolution && (
                  <div className="p-3 bg-[#0F1011] rounded-lg border border-[#232427] text-xs text-[#71717A] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-[#71717A]" />
                      <span>Overlap Dismissed with Recorded Rationale</span>
                    </div>
                    <p className="text-[11px] text-[#71717A]">Reason: {selectedGroup.resolution.remarks}</p>
                  </div>
                )}

                {/* Action Workflow Buttons */}
                {selectedGroup.status === 'open' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setCoordinateModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-black bg-[#00E676] hover:bg-[#00c864] rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Coordinated</span>
                      </button>

                      <button
                        onClick={() => linkMutation.mutate()}
                        disabled={groupCases.length < 2 || linkMutation.isPending}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#F4F4F5] bg-[#1F2023] border border-[#232427] rounded-lg hover:bg-[#2A2B30] transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Link2 className="w-3.5 h-3.5 text-[#71717A]" />
                        <span>Link Related Cases</span>
                      </button>

                      <button
                        onClick={() => setDismissModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#FF4D79] bg-[#FF4D79]/15 border border-[#FF4D79]/30 rounded-lg hover:bg-[#FF4D79]/25 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-[#FF4D79]" />
                        <span>Dismiss Overlap</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setHistoryModalOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] bg-[#0F1011] border border-[#232427] rounded-lg hover:bg-[#1F2023] transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Audit History</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Side-by-Side Comparison */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#F4F4F5] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#C084FC]" />
                    <span>Side-by-Side Docket Comparison ({groupCases.length} Concurrent Cases)</span>
                  </h3>
                  <span className="text-[11px] text-[#71717A]">Compare facts, dates, and handling officers</span>
                </div>

                <div className={`grid grid-cols-1 ${groupCases.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                  {groupCases.map((c, idx) => (
                    <div
                      key={c._id}
                      className="bg-[#151618] rounded-card border border-[#232427] p-4 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between pb-2 border-b border-[#232427]">
                          <div>
                            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                              Case Docket #{idx + 1}
                            </span>
                            <h4 className="font-mono text-xs font-bold text-[#F4F4F5] mt-0.5">{c.caseId}</h4>
                          </div>
                          <BureauBadge bureau={c.currentBureau?.name || c.currentBureau?.code || 'N/A'} />
                        </div>

                        <div className="flex items-center space-x-2 mt-2.5">
                          <StatusBadge status={c.status} size="sm" />
                        </div>

                        <div className="mt-2.5">
                          <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Category</span>
                          <p className="text-xs font-bold text-[#F4F4F5] line-clamp-2 mt-0.5">{c.category}</p>
                        </div>

                        <div className="mt-2">
                          <span className="text-[10px] text-[#71717A] block uppercase font-semibold">Complaint Summary</span>
                          <p className="text-[11px] text-[#A1A1AA] bg-[#0F1011] p-2.5 rounded-lg border border-[#232427] leading-snug line-clamp-4 mt-0.5">
                            {c.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-3 pt-3 border-t border-[#232427] text-xs">
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#71717A]">Source:</span>
                            <span className="font-medium text-[#F4F4F5]">{c.sourceSystem}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[11px] text-[#71717A]">Received:</span>
                            <span className="font-mono text-[#F4F4F5]">
                              {c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-[#71717A]">SLA Deadline:</span>
                            <SlaIndicator
                              slaStatus={c.isOverdue ? 'Beyond Timeline' : 'Within Timeline'}
                              daysRemaining={0}
                              expectedDate={c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : 'N/A'}
                            />
                          </div>
                          {c.assignedOfficer && (
                            <div className="flex justify-between">
                              <span className="text-[11px] text-[#71717A]">Officer:</span>
                              <span className="font-semibold text-[#F4F4F5] truncate">{c.assignedOfficer.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#232427]">
                        <button
                          onClick={() => navigate(`/cases/${c._id}`)}
                          className="w-full py-1.5 text-xs font-semibold text-[#00E676] bg-[#00E676]/10 hover:bg-[#00E676]/20 rounded-lg border border-[#00E676]/30 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <span>Open Complete Docket</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 p-12 bg-[#151618] rounded-card border border-[#232427] text-center text-[#71717A] text-xs">
              Select an overlap group from the queue to inspect side-by-side case facts.
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Mark Coordinated */}
      {selectedGroup && (
        <Modal
          isOpen={coordinateModalOpen}
          onClose={() => setCoordinateModalOpen(false)}
          title="Mark Cases as Coordinated"
          subtitle="Assign Lead Bureau and establish joint inquiry directives"
        >
          <form onSubmit={handleCoordinateSubmit} className="space-y-4 text-xs text-[#F4F4F5]">
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Designated Lead Bureau
              </label>
              <input
                type="text"
                value={leadBureau}
                onChange={(e) => setLeadBureau(e.target.value)}
                placeholder="e.g. Approval Bureau"
                className="w-full px-3 py-2 text-xs bg-[#151618] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#00E676]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Joint Hearing Date (Optional)
              </label>
              <input 
                type="date" 
                value={jointHearingDate}
                onChange={(e) => setJointHearingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#151618] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#00E676]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Mandatory Joint Coordination Directives <span className="text-[#FF4D79]">*</span>
              </label>
              <textarea 
                required 
                rows={4} 
                value={coordinationRemarks}
                onChange={(e) => setCoordinationRemarks(e.target.value)}
                placeholder="Specify coordination plan (e.g. Joint Expert Visiting Committee inspection, synchronized hearing notice)..."
                className="w-full px-3 py-2 text-xs bg-[#151618] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#00E676]"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                type="button" 
                onClick={() => setCoordinateModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-[#71717A] hover:text-[#F4F4F5] bg-[#151618] border border-[#232427] rounded-lg hover:bg-[#1F2023]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={coordinateMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-black bg-[#00E676] rounded-lg hover:bg-[#00c864] disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {coordinateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm Coordination
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: Dismiss Overlap */}
      {selectedGroup && (
        <Modal
          isOpen={dismissModalOpen}
          onClose={() => setDismissModalOpen(false)}
          title="Dismiss Potential Overlap Flag"
          subtitle="Requires written justification for why these dockets are legally independent"
        >
          <form onSubmit={handleDismissSubmit} className="space-y-4 text-xs text-[#F4F4F5]">
            <div>
              <label className="block text-xs font-semibold text-[#71717A] mb-1">
                Mandatory Dismissal Rationale <span className="text-[#FF4D79]">*</span>
              </label>
              <textarea 
                required 
                rows={4} 
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="Detail why coordination is not warranted (e.g. unrelated academic terms, distinct campus departments)..."
                className="w-full px-3 py-2 text-xs bg-[#151618] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#00E676]"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                type="button" 
                onClick={() => setDismissModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-[#71717A] hover:text-[#F4F4F5] bg-[#151618] border border-[#232427] rounded-lg hover:bg-[#1F2023]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={dismissMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#FF4D79] rounded-lg hover:bg-[#FF4D79]/80 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {dismissMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm Dismissal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: Overlap Audit History */}
      {selectedGroup && (
        <Modal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          title={`Action History: OVL-${selectedGroup._id.slice(-6).toUpperCase()}`}
          subtitle="Audit log of all officer interventions on this overlap group"
        >
          <div className="relative pl-5 space-y-4 border-l-2 border-[#232427] text-xs">
            {selectedGroup.history?.length > 0 ? (
              selectedGroup.history.map((hist, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#7C3AED] ring-4 ring-[#0F1011]" />
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-[#F4F4F5] capitalize">{hist.action || hist.actionType}</span>
                      <span className="text-[10px] text-[#71717A] font-mono">
                        {hist.timestamp || hist.createdAt ? new Date(hist.timestamp || hist.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-[#A1A1AA] mt-0.5">{hist.note || hist.remarks}</p>
                    <p className="text-[10px] text-[#71717A] mt-1">
                      Recorded by: {hist.officer || hist.performedBy?.name || 'System'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#71717A] py-4">No audit events recorded for this overlap group.</p>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t border-[#232427] mt-4">
            <button 
              onClick={() => setHistoryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#F4F4F5] bg-[#151618] border border-[#232427] rounded-lg hover:bg-[#1F2023]"
            >
              Close History
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OverlapCentrePage;
