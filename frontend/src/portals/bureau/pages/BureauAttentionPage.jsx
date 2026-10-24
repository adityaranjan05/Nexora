import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  Briefcase,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { bureauApi } from '../../../shared/api/bureauApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function BureauAttentionPage() {
  // Query all active cases in bureau
  const { data, isLoading } = useQuery({
    queryKey: ['bureau', 'attentionCases'],
    queryFn: () => bureauApi.getCases({ limit: 100 }),
  });

  const allCases = data?.data || [];
  const now = new Date();

  // Split into Overdue and Due Soon (<= 3 days)
  const activeCases = allCases.filter(
    (c) => !['disposed', 'rejected'].includes(c.status)
  );

  const overdueCases = activeCases.filter(
    (c) => c.expectedDisposalDate && new Date(c.expectedDisposalDate) < now
  );

  const dueSoonCases = activeCases.filter((c) => {
    if (!c.expectedDisposalDate) return false;
    const diff = new Date(c.expectedDisposalDate).getTime() - now.getTime();
    return diff >= 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#FF4D79]/15 text-[#FF4D79] border border-[#FF4D79]/30">
            SLA Priority Queue
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cases Needing Attention</h1>
        <p className="text-xs text-[#71717A] mt-0.5">
          Complaints that have breached their resolution SLA or are nearing the 72-hour critical deadline.
        </p>
      </div>

      {/* Summary Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FF4D79]/10 border border-[#FF4D79]/20 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF4D79]/20 text-[#FF4D79] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#FF4D79] uppercase tracking-wider">
                Critical SLA Breach
              </div>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {isLoading ? <SkeletonLoader className="h-6 w-12" /> : overdueCases.length} Cases Overdue
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#F59E0B] uppercase tracking-wider">
                Upcoming Deadlines
              </div>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {isLoading ? <SkeletonLoader className="h-6 w-12" /> : dueSoonCases.length} Cases Due within 72h
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Cases Section */}
      <div className="bg-[#0F1011] border border-[#232427] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1F2023] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF4D79]" />
          <h2 className="text-sm font-bold text-white">Overdue Cases ({overdueCases.length})</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : overdueCases.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A]">
            <CheckCircle2 className="w-8 h-8 text-[#00E676] mx-auto mb-2 opacity-80" />
            No cases are currently overdue in your bureau. Great job!
          </div>
        ) : (
          <div className="divide-y divide-[#1F2023]">
            {overdueCases.map((c) => {
              const overdueDays = Math.ceil(
                (now.getTime() - new Date(c.expectedDisposalDate).getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div
                  key={c._id}
                  className="p-4 hover:bg-[#151618]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">
                        {c.sourceCaseRef || c._id.slice(-8)}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <span className="text-[11px] font-bold text-[#FF4D79] bg-[#FF4D79]/15 px-2 py-0.5 rounded border border-[#FF4D79]/30">
                        {overdueDays} day{overdueDays > 1 ? 's' : ''} overdue
                      </span>
                    </div>
                    <div className="text-xs text-[#E4E4E7] font-medium">
                      {c.institution?.name || c.rawInstitutionName || 'Unknown Institution'}
                    </div>
                    <p className="text-xs text-[#71717A] line-clamp-1 max-w-2xl">
                      {c.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/bureau/cases/${c._id}`}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FF4D79] text-white hover:bg-[#e03d67] transition-all flex items-center gap-1.5"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Due Soon Cases Section */}
      <div className="bg-[#0F1011] border border-[#232427] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1F2023] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-sm font-bold text-white">Due Soon (Next 72 Hours) ({dueSoonCases.length})</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : dueSoonCases.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71717A]">
            No cases due in the next 72 hours.
          </div>
        ) : (
          <div className="divide-y divide-[#1F2023]">
            {dueSoonCases.map((c) => {
              const hoursLeft = Math.max(
                0,
                Math.round((new Date(c.expectedDisposalDate).getTime() - now.getTime()) / (1000 * 60 * 60))
              );
              return (
                <div
                  key={c._id}
                  className="p-4 hover:bg-[#151618]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">
                        {c.sourceCaseRef || c._id.slice(-8)}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <span className="text-[11px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                        {hoursLeft}h remaining
                      </span>
                    </div>
                    <div className="text-xs text-[#E4E4E7] font-medium">
                      {c.institution?.name || c.rawInstitutionName || 'Unknown Institution'}
                    </div>
                    <p className="text-xs text-[#71717A] line-clamp-1 max-w-2xl">
                      {c.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to={`/bureau/cases/${c._id}`}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#232427] hover:bg-[#2E3035] text-white transition-all flex items-center gap-1.5"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BureauAttentionPage;
