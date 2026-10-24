import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  RefreshCw,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { bureauApi } from '../../../shared/api/bureauApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';
import { useAuth } from '../../../context/AuthContext';

const STATUS_CHIPS = [
  { label: 'All Cases', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'under_process' },
  { label: 'Needs Info', value: 'needs_info' },
  { label: 'Done', value: 'disposed' },
  { label: 'Overdue', value: 'overdue' },
];

export function BureauCasesPage() {
  const { getPortalAuth } = useAuth();
  const { user } = getPortalAuth('bureau');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const activeStatus = searchParams.get('status') || 'all';

  const queryParams = {
    page,
    limit: 15,
    q: searchQuery || undefined,
    category: selectedCategory || undefined,
  };

  if (activeStatus === 'overdue') {
    queryParams.overdue = 'true';
  } else if (activeStatus !== 'all') {
    queryParams.status = activeStatus;
  }

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['bureau', 'cases', queryParams],
    queryFn: () => bureauApi.getCases(queryParams),
    keepPreviousData: true,
  });

  const cases = data?.data || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  const handleStatusChange = (status) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (status === 'all') {
        p.delete('status');
      } else {
        p.set('status', status);
      }
      p.set('page', '1');
      return p;
    });
    setPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (searchQuery) p.set('q', searchQuery);
      else p.delete('q');
      p.set('page', '1');
      return p;
    });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
              {user?.bureau?.name || 'Bureau Queue'} ({user?.bureau?.code || 'BUREAU'})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">My Assigned Cases</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cases allocated specifically to <strong className="text-slate-400">{user?.bureau?.name || 'your bureau'}</strong> for investigation and resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-[#101D35] border border-slate-700/80 text-slate-400 hover:text-slate-100 hover:bg-[#172846] transition-colors"
            title="Refresh cases"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-blue-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_CHIPS.map((chip) => {
          const isActive = activeStatus === chip.value;
          return (
            <button
              key={chip.value}
              onClick={() => handleStatusChange(chip.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-slate-100 shadow-md shadow-blue-500/20 font-semibold'
                  : 'bg-[#101D35] text-slate-400 border border-slate-700/80 hover:bg-[#172846] hover:text-slate-100'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-[#101D35] border border-slate-700/80 p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case ref, student name, description or institution..."
            className="w-full bg-[#0B1730] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Ragging">Ragging</option>
            <option value="Fee/Refund">Fee / Refund</option>
            <option value="Harassment">Harassment</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Admission">Admission</option>
            <option value="Faculty">Faculty</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : cases.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-slate-100">No complaints match your criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no cases in your bureau matching the selected filter. Try switching filter chips or clearing search keywords.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700/80 bg-[#0B1730]/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Case Ref</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2023] text-xs">
                {cases.map((c) => {
                  const isOverdue =
                    c.expectedDisposalDate &&
                    new Date(c.expectedDisposalDate) < new Date() &&
                    !['disposed', 'rejected'].includes(c.status);

                  return (
                    <tr key={c._id} className="hover:bg-[#172846] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-100">
                        <Link to={`/bureau/cases/${c._id}`} className="hover:text-blue-300 transition-colors">
                          {c.sourceCaseRef || c._id.slice(-8)}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-100">
                        {c.institution?.name || c.rawInstitutionName || 'Unknown Institution'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{c.category || 'General'}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        {c.expectedDisposalDate ? (
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                              isOverdue ? 'text-[#FF4D79] font-bold' : 'text-slate-400'
                            }`}
                          >
                            {isOverdue && <AlertTriangle className="w-3 h-3" />}
                            {new Date(c.expectedDisposalDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/bureau/cases/${c._id}`}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#172846] hover:bg-[#203554] text-slate-100 transition-colors"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {pagination.pages} ({pagination.total} cases)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg bg-[#0B1730] border border-slate-700/80 text-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg bg-[#0B1730] border border-slate-700/80 text-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BureauCasesPage;
