import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Building,
  ArrowRight,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { studentApi } from '../../../shared/api/studentApi';
import { useAuth } from '../../../context/AuthContext';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function StudentComplaintsPage() {
  const { getPortalAuth } = useAuth();
  const { user } = getPortalAuth('student');
  const [filterTab, setFilterTab] = useState('all');

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['student', 'cases'],
    queryFn: () => studentApi.getCases(),
  });

  const cases = data?.data || [];

  const pendingCount = cases.filter((c) =>
    ['pending', 'under_process'].includes(c.status)
  ).length;
  const needsReplyCount = cases.filter((c) => c.status === 'needs_info').length;
  const resolvedCount = cases.filter((c) =>
    ['disposed', 'rejected'].includes(c.status)
  ).length;

  const filteredCases = cases.filter((c) => {
    if (filterTab === 'active') return ['pending', 'under_process'].includes(c.status);
    if (filterTab === 'needs_reply') return c.status === 'needs_info';
    if (filterTab === 'closed') return ['disposed', 'rejected'].includes(c.status);
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Welcome / Header */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                Student Grievance Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Hello, {user?.name || 'Student'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Track your submitted complaints to AICTE, view official progress updates, and answer any inquiries from investigating officers.
            </p>
          </div>

          <Link
            to="/student/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-950/30 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Grievance</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#101D35] border border-slate-700/80 p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Filed</div>
          <div className="text-2xl font-extrabold text-white mt-1">
            {isLoading ? <SkeletonLoader className="h-6 w-10" /> : cases.length}
          </div>
        </div>

        <div className="bg-[#101D35] border border-slate-700/80 p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">In Review</div>
          <div className="text-2xl font-extrabold text-blue-300 mt-1">
            {isLoading ? <SkeletonLoader className="h-6 w-10" /> : pendingCount}
          </div>
        </div>

        <div className="bg-[#101D35] border border-slate-700/80 p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Needs Your Reply</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">
            {isLoading ? <SkeletonLoader className="h-6 w-10" /> : needsReplyCount}
          </div>
        </div>

        <div className="bg-[#101D35] border border-slate-700/80 p-4 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-extrabold text-emerald-300 mt-1">
            {isLoading ? <SkeletonLoader className="h-6 w-10" /> : resolvedCount}
          </div>
        </div>
      </div>

      {/* Needs Reply Alert Banner if any */}
      {needsReplyCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/20 text-amber-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Action Required: Officer Requested Information</div>
              <div className="text-xs text-[#D1D5DB] mt-0.5">
                You have {needsReplyCount} grievance{needsReplyCount > 1 ? 's' : ''} waiting on additional clarification or documents.
              </div>
            </div>
          </div>
          <Link
            to="/student/needs-reply"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shrink-0"
          >
            Reply Now
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-700/80 pb-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Complaints' },
            { id: 'active', label: 'In Review' },
            { id: 'needs_reply', label: 'Needs My Reply' },
            { id: 'closed', label: 'Resolved / Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterTab === tab.id
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => refetch()}
          className="text-slate-400 hover:text-white p-1"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-300' : ''}`} />
        </button>
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader className="h-20 w-full" />
          <SkeletonLoader className="h-20 w-full" />
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-white">No grievances found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filterTab === 'all'
              ? 'You have not submitted any complaints yet. Click "File New Grievance" to register an issue.'
              : 'There are no complaints under this filter.'}
          </p>
          {filterTab === 'all' && (
            <Link
              to="/student/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#B07CFF] text-white hover:bg-[#9955FF]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit First Complaint</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCases.map((c) => (
            <Link
              key={c._id}
              to={`/student/cases/${c._id}`}
              className="block bg-[#101D35] border border-slate-700/80 hover:border-blue-500/60 p-5 rounded-2xl transition-all hover:bg-[#172846]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-white bg-[#0B1730] px-2.5 py-0.5 rounded border border-slate-700/80">
                      {c.caseId || c._id.slice(-8)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#172846] text-slate-300 font-medium">
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} size="sm" />
                  </div>

                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-blue-300" />
                    <span>{c.institution?.name || c.rawInstitutionName || 'Institution'}</span>
                  </div>

                  {c.lastActionText && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      Latest Update: {c.lastActionText}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:self-center">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Submitted on</div>
                    <div className="text-xs font-mono text-slate-300">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#0B1730] text-slate-400 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentComplaintsPage;