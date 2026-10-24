import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Layers,
  Building,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Shield,
  Info,
  Calendar,
} from 'lucide-react';
import { bureauApi } from '../../../shared/api/bureauApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function BureauOverlapsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bureau', 'overlaps'],
    queryFn: () => bureauApi.getOverlaps(),
  });

  const overlaps = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#B07CFF]/15 text-[#B07CFF] border border-[#B07CFF]/30">
            Cross-Bureau Coordination
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Overlap Groups (Read-Only)</h1>
        <p className="text-xs text-[#71717A] mt-0.5">
          AICTE Nexora cluster detector: complaints filed across different bureaus regarding the same institution.
        </p>
      </div>

      {/* Info notice about bureau read-only scope */}
      <div className="bg-[#151618] border border-[#232427] p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-[#6C7BFF] shrink-0 mt-0.5" />
        <div className="text-xs text-[#A1A1AA] leading-relaxed">
          <span className="font-semibold text-white">Bureau Coordination Access:</span> You can view all linked complaints under your jurisdiction to avoid duplicate hearings or contradictory directives. Formal overlap merging and resolution is managed centrally by AICTE Officers.
        </div>
      </div>

      {/* Overlaps List */}
      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader className="h-32 w-full" />
          <SkeletonLoader className="h-32 w-full" />
        </div>
      ) : overlaps.length === 0 ? (
        <div className="bg-[#0F1011] border border-[#232427] rounded-2xl p-16 text-center">
          <Layers className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-white">No Active Overlaps</h3>
          <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
            None of your bureau's active cases currently overlap with complaints in other bureaus.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {overlaps.map((group) => {
            const primary = group.primaryCase;
            const cases = group.cases || [];

            return (
              <div
                key={group._id}
                className="bg-[#0F1011] border border-[#232427] rounded-2xl p-5 hover:border-[#34363B] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#1F2023]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#B07CFF]/15 text-[#B07CFF] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Cluster: {group.clusterName || `Group #${group._id.slice(-6)}`}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#232427] text-[#A1A1AA]">
                          {cases.length} cases linked
                        </span>
                      </h3>
                      <div className="text-xs text-[#71717A] flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-[#71717A]" />
                        <span>{primary?.institution?.name || group.institutionName || 'Target Institution'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#71717A]">Confidence:</span>
                    <span className="text-xs font-mono font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded border border-[#00E676]/20">
                      {Math.round((group.similarityScore || 0.85) * 100)}% Match
                    </span>
                  </div>
                </div>

                {/* Cases inside this overlap cluster */}
                <div className="pt-4 space-y-2">
                  <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider block mb-1">
                    Complaints In This Cluster
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cases.map((c) => (
                      <div
                        key={c._id}
                        className="bg-[#151618] border border-[#1F2023] p-3 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-white">
                              {c.sourceCaseRef || c._id.slice(-8)}
                            </span>
                            <StatusBadge status={c.status} size="sm" />
                          </div>
                          <div className="text-xs text-[#A1A1AA] truncate">
                            Bureau: <span className="text-white">{c.currentBureau?.name || 'Assigned'}</span>
                          </div>
                        </div>

                        <Link
                          to={`/bureau/cases/${c._id}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#232427] hover:bg-[#2E3035] text-white flex items-center gap-1 shrink-0"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BureauOverlapsPage;
