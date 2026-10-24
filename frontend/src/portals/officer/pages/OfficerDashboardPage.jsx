import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderArchive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GitMerge,
  ShieldAlert,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  Building2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { KpiCard } from '../../../shared/components/KpiCard';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { BureauBadge } from '../../../shared/components/BureauBadge';
import { OverlapBadge } from '../../../shared/components/OverlapBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerDashboardPage() {
  const navigate = useNavigate();

  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['officer-summary'],
    queryFn: officerApi.getSummary,
  });

  const { data: workloadData, isLoading: workloadLoading, refetch: refetchWorkload } = useQuery({
    queryKey: ['officer-bureau-workload'],
    queryFn: officerApi.getBureauWorkload,
  });

  const { data: institutionData, isLoading: instLoading, refetch: refetchInst } = useQuery({
    queryKey: ['officer-institution-status'],
    queryFn: officerApi.getInstitutionStatus,
  });

  const summary = summaryData?.data || {};
  const workload = workloadData?.data || [];
  const institutions = institutionData?.data || [];

  const handleRefresh = () => {
    refetchSummary();
    refetchWorkload();
    refetchInst();
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Statutory Oversight Dashboard</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/30">
              Live Feed
            </span>
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Real-time cross-bureau institutional complaint monitoring, overlap detection &amp; disposal analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-xs font-medium text-[#A1A1AA] hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/officer/assignment-queue')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00c864] text-black text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-black" />
            <span>Assignment Queue</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {summaryLoading ? (
        <SkeletonLoader count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard
            title="Total Dockets Filed"
            value={summary.totalReceived ?? 0}
            icon={FolderArchive}
            changeText="Across all AICTE bureaus"
            trend="neutral"
            color="indigo"
          />
          <KpiCard
            title="Active Overlap Clusters"
            value={summary.activeOverlaps ?? 0}
            icon={GitMerge}
            changeText="Multi-bureau institution overlaps"
            trend="down"
            color="amber"
            onClick={() => navigate('/officer/overlaps')}
          />
          <KpiCard
            title="SLA Timeline Breached"
            value={summary.beyondTimeline ?? 0}
            icon={AlertTriangle}
            changeText="Immediate escalation priority"
            trend="up"
            color="rose"
            onClick={() => navigate('/officer/cases?status=escalated')}
          />
          <KpiCard
            title="Disposal Resolution Rate"
            value={summary.disposalRate || '0%'}
            icon={CheckCircle2}
            changeText={`${summary.disposed || 0} total cases disposed`}
            trend="up"
            color="teal"
          />
        </div>
      )}

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#151618] border border-[#232427]">
          <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Unassigned / Pending</div>
          <div className="text-xl font-bold text-white mt-1">{summary.pending ?? 0}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-0.5">Awaiting bureau routing</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#151618] border border-[#232427]">
          <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Under Process</div>
          <div className="text-xl font-bold text-[#6C7BFF] mt-1">{summary.underProcess ?? 0}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-0.5">Active bureau enquiry</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#151618] border border-[#232427]">
          <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Needs Student Info</div>
          <div className="text-xl font-bold text-[#F59E0B] mt-1">{summary.needsInfo ?? 0}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-0.5">Awaiting complainant reply</div>
        </div>
        <div className="p-3.5 rounded-xl bg-[#151618] border border-[#232427]">
          <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">Escalated Cases</div>
          <div className="text-xl font-bold text-[#FF4D79] mt-1">{summary.escalated ?? 0}</div>
          <div className="text-[10px] text-[#A1A1AA] mt-0.5">Senior management attention</div>
        </div>
      </div>

      {/* Bureau Workload Table */}
      <div className="bg-[#121315] border border-[#232427] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00E676]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Bureau Workload Distribution</h2>
          </div>
          <span className="text-xs text-[#71717A]">
            Active complaints allocated per AICTE cell
          </span>
        </div>

        {workloadLoading ? (
          <SkeletonLoader count={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232427] text-[#71717A] text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Bureau / Cell</th>
                  <th className="py-2.5 px-3 text-center">Pending</th>
                  <th className="py-2.5 px-3 text-center">In Progress</th>
                  <th className="py-2.5 px-3 text-center">Needs Info</th>
                  <th className="py-2.5 px-3 text-center">Disposed</th>
                  <th className="py-2.5 px-3 text-center font-bold text-white">Total Load</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2023]">
                {workload.map((b) => (
                  <tr key={b.id} className="hover:bg-[#151618] transition">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      <div>{b.name}</div>
                      <div className="text-[10px] text-[#71717A] font-mono">{b.code} &bull; {b.type}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#A1A1AA]">{b.pending}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#6C7BFF]">{b.under_process}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#F59E0B]">{b.needs_info}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#00E676]">{b.disposed}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">{b.total}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/officer/cases?bureau=${b.id}`)}
                        className="px-2 py-1 rounded-lg bg-[#151618] hover:bg-[#232427] text-[#A1A1AA] hover:text-white border border-[#232427] text-[11px] font-medium transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Institutions Status */}
      <div className="bg-[#121315] border border-[#232427] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#6C7BFF]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Top Institutions by Complaint Density</h2>
          </div>
          <button
            onClick={() => navigate('/officer/institutions')}
            className="text-xs text-[#00E676] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {instLoading ? (
          <SkeletonLoader count={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232427] text-[#71717A] text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-3">Institution Name</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3 text-center">Open Dockets</th>
                  <th className="py-2.5 px-3 text-center">Disposed</th>
                  <th className="py-2.5 px-3 text-center">Cross-Bureau Overlap</th>
                  <th className="py-2.5 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2023]">
                {institutions.slice(0, 7).map((inst) => (
                  <tr key={inst.id} className="hover:bg-[#151618] transition">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white truncate max-w-xs">{inst.name}</div>
                      <div className="text-[10px] text-[#71717A] font-mono">ID: {inst.aicteId} &bull; {inst.city}</div>
                    </td>
                    <td className="py-2.5 px-3 text-[#A1A1AA]">{inst.region}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">{inst.openCases}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#00E676]">{inst.disposedCases}</td>
                    <td className="py-2.5 px-3 text-center">
                      {inst.hasOverlap ? (
                        <OverlapBadge severity={inst.overlapSeverity || 'high'} />
                      ) : (
                        <span className="text-[11px] text-[#71717A]">&mdash;</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => navigate(`/officer/institutions/${inst.id}`)}
                        className="px-2 py-1 rounded-lg bg-[#151618] hover:bg-[#232427] text-[#A1A1AA] hover:text-white border border-[#232427] text-[11px] font-medium transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerDashboardPage;
