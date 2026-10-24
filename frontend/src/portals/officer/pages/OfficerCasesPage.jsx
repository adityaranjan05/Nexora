import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  FileText,
  Clock,
  ArrowRight,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Calendar,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { BureauBadge } from '../../../shared/components/BureauBadge';
import { OverlapBadge } from '../../../shared/components/OverlapBadge';
import { SlaIndicator } from '../../../shared/components/SlaIndicator';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerCasesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [bureau, setBureau] = useState(searchParams.get('bureau') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const { data: bureausData } = useQuery({
    queryKey: ['officer-bureaus'],
    queryFn: officerApi.getBureaus,
  });
  const bureaus = bureausData?.data || [];

  const queryParams = {
    q: q || undefined,
    status: status || undefined,
    bureau: bureau || undefined,
    category: category || undefined,
    page,
    limit: 15,
  };

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['officer-cases', queryParams],
    queryFn: () => officerApi.getCases(queryParams),
    keepPreviousData: true,
  });

  const cases = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setPage(1);
    refetch();
  };

  const handleClearFilters = () => {
    setQ('');
    setStatus('');
    setBureau('');
    setCategory('');
    setPage(1);
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>All Complaints Directory</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#101D35] text-slate-300 border border-slate-700/80">
              {pagination.total} Dockets
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full oversight of institutional complaints across AICTE bureaus, regional offices and cells.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101D35] hover:bg-[#172846] border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-xl p-3 mb-4 shrink-0">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by Docket ID, Institution Name, or keyword..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#101D35] border border-slate-700/80 rounded-lg text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-[#101D35] border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_process">Under Process</option>
              <option value="needs_info">Needs Info</option>
              <option value="transferred">Transferred</option>
              <option value="escalated">Escalated</option>
              <option value="disposed">Disposed / Done</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={bureau}
              onChange={(e) => {
                setBureau(e.target.value);
                setPage(1);
              }}
              className="w-full py-1.5 px-2.5 bg-[#101D35] border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Bureaus</option>
              <option value="unassigned">Unassigned Only</option>
              {bureaus.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="flex-1 py-1.5 px-2.5 bg-[#101D35] border border-slate-700/80 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">All Categories</option>
              <option value="Fee Issues">Fee Issues</option>
              <option value="Faculty Shortage">Faculty Shortage</option>
              <option value="Fake Documents">Fake Documents</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Admission Irregularities">Admission Irregularities</option>
              <option value="Harassment">Harassment</option>
            </select>
            {(q || status || bureau || category) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2 py-1.5 rounded-lg bg-[#172846] hover:bg-[#223653] text-[11px] text-slate-300 hover:text-white transition whitespace-nowrap cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Cases Table */}
      <div className="flex-1 min-h-0 bg-[#101D35] border border-slate-700/80 rounded-2xl overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-4">
            <SkeletonLoader count={8} />
          </div>
        ) : cases.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <FileText className="w-10 h-10 text-slate-500 mb-2" />
            <h3 className="text-sm font-semibold text-white">No complaints found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your keyword search or filter parameters.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#0B1730] border-b border-slate-700/80 z-10 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Docket ID</th>
                  <th className="py-2.5 px-3">Institution &amp; Region</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Current Bureau</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">SLA Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2023]">
                {cases.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/officer/cases/${c._id}`)}
                    className="hover:bg-[#101D35] transition cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                      {c.caseId}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate">
                      <div className="font-semibold text-white truncate">{c.rawInstitutionName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{c.institution?.region || c.rawState || 'Unknown Region'}</span>
                        {c.hasOverlap && <OverlapBadge severity={c.overlapSeverity || 'high'} />}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{c.category}</td>
                    <td className="py-3 px-3">
                      {c.currentBureau ? (
                        <BureauBadge bureau={c.currentBureau.name} />
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3 px-3">
                      {c.isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue</span>
                        </span>
                      ) : c.isDueSoon ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B]">
                          <Clock className="w-3 h-3" />
                          <span>Due Soon</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/officer/cases/${c._id}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#101D35] group-hover:bg-blue-600 text-slate-300 group-hover:text-black border border-slate-700/80 group-hover:border-blue-500 text-[11px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-700/70 bg-[#0B1730] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
            Showing page <span className="font-bold text-white">{pagination.page}</span> of{' '}
            <span className="font-bold text-white">{pagination.pages || 1}</span> ({pagination.total} total)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-[#101D35] border border-slate-700/80 hover:bg-[#172846] disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
              className="p-1.5 rounded-lg bg-[#101D35] border border-slate-700/80 hover:bg-[#172846] disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerCasesPage;
