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

const STATUS_CHIPS = [
  { label: 'All Cases', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'under_process' },
  { label: 'Needs Info', value: 'needs_info' },
  { label: 'Done', value: 'disposed' },
  { label: 'Overdue', value: 'overdue' },
];

export function BureauCasesPage() {
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
            <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#6C7BFF]/15 text-[#6C7BFF] border border-[#6C7BFF]/30">
              Bureau Queue
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Assigned Cases</h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            Cases allocated specifically to your bureau for investigation and resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-[#0F1011] border border-[#232427] text-[#A1A1AA] hover:text-white hover:bg-[#151618] transition-colors"
            title="Refresh cases"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-[#6C7BFF]' : ''}`} />
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
                  ? 'bg-[#6C7BFF] text-white shadow-md shadow-[#6C7BFF]/20 font-semibold'
                  : 'bg-[#0F1011] text-[#A1A1AA] border border-[#232427] hover:bg-[#151618] hover:text-white'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter Controls */}
      <div className="bg-[#0F1011] border border-[#232427] p-3 rounded-2xl flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case ref, student name, description or institution..."
            className="w-full bg-[#151618] border border-[#232427] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#6C7BFF]"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="bg-[#151618] border border-[#232427] rounded-xl px-3 py-2 text-xs text-[#A1A1AA] focus:outline-none focus:border-[#6C7BFF]"
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
      <div className="bg-[#0F1011] border border-[#232427] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </div>
        ) : cases.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-white">No complaints match your criteria</h3>
            <p className="text-xs text-[#71717A] mt-1 max-w-sm mx-auto">
              There are no cases in your bureau matching the selected filter. Try switching filter chips or clearing search keywords.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1F2023] bg-[#151618]/50 text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
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
                    <tr key={c._id} className="hover:bg-[#151618]/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-white">
                        <Link to={`/bureau/cases/${c._id}`} className="hover:text-[#6C7BFF] transition-colors">
                          {c.sourceCaseRef || c._id.slice(-8)}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px] truncate text-[#E4E4E7]">
                        {c.institution?.name || c.rawInstitutionName || 'Unknown Institution'}
                      </td>
                      <td className="py-3.5 px-4 text-[#A1A1AA]">{c.category || 'General'}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        {c.expectedDisposalDate ? (
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                              isOverdue ? 'text-[#FF4D79] font-bold' : 'text-[#71717A]'
                            }`}
                          >
                            {isOverdue && <AlertTriangle className="w-3 h-3" />}
                            {new Date(c.expectedDisposalDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[#71717A]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71717A]">
                        {new Date(c.updatedAt || c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/bureau/cases/${c._id}`}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-[#232427] hover:bg-[#2E3035] text-white transition-colors"
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
          <div className="p-4 border-t border-[#1F2023] flex items-center justify-between text-xs text-[#71717A]">
            <span>
              Page {page} of {pagination.pages} ({pagination.total} cases)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg bg-[#151618] border border-[#232427] text-white disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg bg-[#151618] border border-[#232427] text-white disabled:opacity-40"
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
