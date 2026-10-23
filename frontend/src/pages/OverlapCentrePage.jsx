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
    <div className="space-y-6">
      {/* Statutory Authority Disclaimer Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-[#142B45] text-white rounded-xl p-5 shadow-elevated border border-purple-800/40">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 bg-white/10 rounded-lg shrink-0 mt-0.5 border border-white/20">
            <GitMerge className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-tight">
                AICTE Inter-Bureau Overlap Coordination Centre
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase">
                Human-in-the-Loop Protocol
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1 max-w-4xl leading-relaxed">
              <strong>Mandatory Protocol:</strong> An overlap flag indicates potential jurisdictional overlap or concurrent investigations across AICTE Bureaus/Cells.
              It is <em>not proof of duplicate complaints</em>. Automated case merging is strictly prohibited.
              Nodal officers must evaluate case merits and execute joint coordination directives before final determination.
            </p>
          </div>
        </div>
      </div>

      {/* Loading / Error States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading overlap review queue...</p>
        </div>
      )}

      {isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-900">Failed to load overlaps</h3>
          <p className="text-xs text-slate-500 mt-1">{error?.message || 'Server error'}</p>
          <button onClick={() => refetch()} className="mt-3 text-xs font-semibold text-teal-700 hover:underline">Retry</button>
        </div>
      )}

      {/* Main Two-Column Workflow Container */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Overlap Review Queue */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-subtle p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Overlap Review Queue ({filteredOverlaps.length})
                </h3>
                <p className="text-[11px] text-slate-500">Cross-bureau correlation triggers</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => refetch()} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded font-medium text-slate-700 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="coordinated">Coordinated</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {overlaps.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No overlap groups found for selected filter.</p>
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
                          ? 'border-purple-600 bg-purple-50/50 shadow-subtle ring-1 ring-purple-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-purple-950">
                          OVL-{ov._id.slice(-6).toUpperCase()}
                        </span>
                        <OverlapBadge severity={ov.severity} />
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                        {inst?.name || 'Unknown Institution'}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500">
                        {inst?.aictePermanentId || 'PID Unassigned'}
                      </p>

                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1.5 leading-snug">
                        {ov.triggerReason || 'Concurrent bureau investigations detected'}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 font-mono">{ov.cases?.length || 0} Dockets</span>
                        <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] capitalize ${
                          ov.status === 'coordinated'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ov.status === 'dismissed'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-purple-100 text-purple-800'
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
            <div className="lg:col-span-8 space-y-6">
              {/* Active Group Header & Actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-purple-950 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        OVL-{selectedGroup._id.slice(-6).toUpperCase()}
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedGroup.institution?.name || 'Unknown Institution'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      PID: <span className="font-mono font-semibold text-slate-700">
                        {selectedGroup.institution?.aictePermanentId || 'Unassigned'}
                      </span> • Flagged on {selectedGroup.createdAt ? new Date(selectedGroup.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      selectedGroup.status === 'coordinated'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : selectedGroup.status === 'dismissed'
                        ? 'bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-purple-100 text-purple-900 border border-purple-300'
                    }`}>
                      {selectedGroup.status}
                    </span>
                  </div>
                </div>

                {/* Trigger Rationale Box */}
                <div className="bg-purple-50/70 p-3.5 rounded-lg border border-purple-100 space-y-1">
                  <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                    <span>Why This Institution Was Flagged:</span>
                  </span>
                  <p className="text-xs text-purple-950 leading-relaxed font-sans">
                    {selectedGroup.triggerReason || 'Multiple concurrent bureau investigations detected for this institution.'}
                  </p>
                </div>

                {/* Resolved Details Banner */}
                {selectedGroup.status === 'coordinated' && selectedGroup.resolution && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Officially Coordinated</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">{selectedGroup.resolution.remarks}</p>
                    {selectedGroup.resolution.resolvedBy && (
                      <p className="text-[11px] font-medium text-emerald-700">
                        By: {selectedGroup.resolution.resolvedBy?.name} on {new Date(selectedGroup.resolution.resolvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {selectedGroup.status === 'dismissed' && selectedGroup.resolution && (
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 text-xs text-slate-700 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-slate-600" />
                      <span>Overlap Dismissed with Recorded Rationale</span>
                    </div>
                    <p className="text-[11px] text-slate-600">Reason: {selectedGroup.resolution.remarks}</p>
                  </div>
                )}

                {/* Action Workflow Buttons */}
                {selectedGroup.status === 'open' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setCoordinateModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Coordinated</span>
                      </button>

                      <button
                        onClick={() => linkMutation.mutate()}
                        disabled={groupCases.length < 2 || linkMutation.isPending}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Link2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Link Related Cases</span>
                      </button>

                      <button
                        onClick={() => setDismissModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Dismiss Overlap</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setHistoryModalOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
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
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-700" />
                    <span>Side-by-Side Docket Comparison ({groupCases.length} Concurrent Cases)</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Compare facts, dates, and handling officers</span>
                </div>

                <div className={`grid grid-cols-1 ${groupCases.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
                  {groupCases.map((c, idx) => (
                    <div
                      key={c._id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between pb-2 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Case Docket #{idx + 1}
                            </span>
                            <h4 className="font-mono text-xs font-bold text-slate-900 mt-0.5">{c.caseId}</h4>
                          </div>
                          <BureauBadge bureau={c.currentBureau?.name || c.currentBureau?.code || 'N/A'} />
                        </div>

                        <div className="flex items-center space-x-2 mt-2.5">
                          <StatusBadge status={c.status} size="sm" />
                        </div>

                        <div className="mt-2.5">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Category</span>
                          <p className="text-xs font-bold text-slate-800 line-clamp-2 mt-0.5">{c.category}</p>
                        </div>

                        <div className="mt-2">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Complaint Summary</span>
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-snug line-clamp-4 mt-0.5">
                            {c.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[11px] text-slate-400">Source:</span>
                            <span className="font-medium text-slate-700">{c.sourceSystem}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[11px] text-slate-400">Received:</span>
                            <span className="font-mono text-slate-700">
                              {c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] text-slate-400">SLA Deadline:</span>
                            <SlaIndicator
                              slaStatus={c.isOverdue ? 'Beyond Timeline' : 'Within Timeline'}
                              daysRemaining={0}
                              expectedDate={c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : 'N/A'}
                            />
                          </div>
                          {c.assignedOfficer && (
                            <div className="flex justify-between">
                              <span className="text-[11px] text-slate-400">Officer:</span>
                              <span className="font-semibold text-slate-800 truncate">{c.assignedOfficer.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/cases/${c._id}`)}
                          className="w-full py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
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
            <div className="lg:col-span-8 p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
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
          <form onSubmit={handleCoordinateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Lead Bureau
              </label>
              <input
                type="text"
                value={leadBureau}
                onChange={(e) => setLeadBureau(e.target.value)}
                placeholder="e.g. Approval Bureau"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joint Hearing Date (Optional)
              </label>
              <input type="date" value={jointHearingDate}
                onChange={(e) => setJointHearingDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Joint Coordination Directives <span className="text-rose-500">*</span>
              </label>
              <textarea required rows={4} value={coordinationRemarks}
                onChange={(e) => setCoordinationRemarks(e.target.value)}
                placeholder="Specify coordination plan (e.g. Joint Expert Visiting Committee inspection, synchronized hearing notice)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setCoordinateModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                Cancel
              </button>
              <button type="submit" disabled={coordinateMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 inline-flex items-center gap-1.5">
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
          <form onSubmit={handleDismissSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mandatory Dismissal Rationale <span className="text-rose-500">*</span>
              </label>
              <textarea required rows={4} value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="Detail why coordination is not warranted (e.g. unrelated academic terms, distinct campus departments)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setDismissModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                Cancel
              </button>
              <button type="submit" disabled={dismissMutation.isPending}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 rounded-lg hover:bg-rose-800 disabled:opacity-50 inline-flex items-center gap-1.5">
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
          <div className="relative pl-5 space-y-4 border-l-2 border-slate-200 text-xs">
            {selectedGroup.history?.length > 0 ? (
              selectedGroup.history.map((hist, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-purple-600 ring-4 ring-white" />
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold text-slate-900 capitalize">{hist.action || hist.actionType}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {hist.timestamp || hist.createdAt ? new Date(hist.timestamp || hist.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{hist.note || hist.remarks}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Recorded by: {hist.officer || hist.performedBy?.name || 'System'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 py-4">No audit events recorded for this overlap group.</p>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <button onClick={() => setHistoryModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
              Close History
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
