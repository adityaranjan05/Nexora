import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Download, 
  Eye, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  Calendar,
  Filter,
  Layers
} from 'lucide-react';
import { casesApi, adminApi } from '../api/client';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaIndicator } from '../components/common/SlaIndicator';
import { OverlapBadge } from '../components/common/OverlapBadge';
import { EmptyState } from '../components/common/EmptyState';
import { SectionHeader } from '../components/common/SectionHeader';

export const CasesPage = () => {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search & Filter State
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [caseId, setCaseId] = useState('');
  const [aicteId, setAicteId] = useState('');
  const [bureau, setBureau] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);

  // Fetch Bureaus for filter dropdown
  const bureausQuery = useQuery({
    queryKey: ['admin-bureaus'],
    queryFn: adminApi.getBureaus,
  });

  // Query Cases with full server-side filters
  const casesQuery = useQuery({
    queryKey: ['cases-list', { q, aicteId, caseId, bureau, region, category, status, dateFrom, dateTo, page, limit }],
    queryFn: () => casesApi.getCases({
      q: q || undefined,
      aicteId: aicteId || undefined,
      caseId: caseId || undefined,
      bureau: bureau || undefined,
      region: region || undefined,
      category: category || undefined,
      status: status || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      limit,
    }),
  });

  const regionsList = ['Northern', 'Southern', 'Western', 'Eastern', 'Central'];
  const categoriesList = [
    'Faculty Shortage',
    'Fake Documents',
    'Fee Issues',
    'Harassment',
    'Infrastructure Deficiency',
    'Admission Irregularity',
    'Capitation Fee',
    'Certificate Retention',
  ];

  const handleResetFilters = () => {
    setQ('');
    setCaseId('');
    setAicteId('');
    setBureau('');
    setRegion('');
    setCategory('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleExportCSV = () => {
    const list = casesQuery.data?.data || [];
    if (list.length === 0) {
      addToast('No Data', 'No cases to export with current filters', 'warning');
      return;
    }

    const headers = [
      'Case ID',
      'AICTE Permanent ID',
      'Institution Name',
      'Current Bureau',
      'Region',
      'Category',
      'Status',
      'Filing Date',
      'Expected Disposal',
      'Overdue',
    ];

    const rows = list.map((c) => [
      `"${c.caseId || ''}"`,
      `"${c.institution?.aictePermanentId || ''}"`,
      `"${(c.institution?.name || c.rawInstitutionName || '').replace(/"/g, '""')}"`,
      `"${c.currentBureau?.name || c.currentBureau?.code || ''}"`,
      `"${c.institution?.region || c.rawState || ''}"`,
      `"${c.category || ''}"`,
      `"${c.status || ''}"`,
      `"${c.filingDate ? new Date(c.filingDate).toISOString().split('T')[0] : ''}"`,
      `"${c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toISOString().split('T')[0] : ''}"`,
      `"${c.isOverdue ? 'YES' : 'NO'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AICTE_Cases_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Cases Exported', `Generated CSV docket of ${list.length} cases`, 'success');
  };

  const casesList = casesQuery.data?.data || [];
  const pagination = casesQuery.data?.pagination || { total: 0, page: 1, limit: 15, pages: 1 };

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-panel p-4 sm:p-6 space-y-5 select-none-off text-[#F4F4F5]">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] font-sans tracking-tight">
            Case Dossier Registry
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
            Institutional grievance tracking, inter-bureau routing, and statutory SLA enforcement.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-[#F4F4F5] bg-[#151618] border border-[#232427] rounded-lg hover:bg-[#1A1B1E] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Export Table CSV</span>
          </button>
        </div>
      </div>

      {/* Preset Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#232427] pb-3">
        <button
          onClick={() => { setStatus(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            status === ''
              ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold border border-[#2D2E32]'
              : 'bg-[#151618] text-[#71717A] hover:bg-[#1A1B1E] hover:text-[#A1A1AA] border border-[#232427]'
          }`}
        >
          All Cases
        </button>
        <button
          onClick={() => { setStatus('pending'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            status === 'pending'
              ? 'bg-[#8A99B5]/20 text-[#8A99B5] font-semibold border border-[#8A99B5]/40'
              : 'bg-[#151618] text-[#71717A] hover:bg-[#1A1B1E] hover:text-[#A1A1AA] border border-[#232427]'
          }`}
        >
          Pending Triage
        </button>
        <button
          onClick={() => { setStatus('under_process'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            status === 'under_process'
              ? 'bg-[#6C7BFF]/20 text-[#6C7BFF] font-semibold border border-[#6C7BFF]/40'
              : 'bg-[#151618] text-[#71717A] hover:bg-[#1A1B1E] hover:text-[#A1A1AA] border border-[#232427]'
          }`}
        >
          Under Process
        </button>
        <button
          onClick={() => { setStatus('escalated'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            status === 'escalated'
              ? 'bg-[#FF4D79]/20 text-[#FF4D79] font-semibold border border-[#FF4D79]/40'
              : 'bg-[#151618] text-[#71717A] hover:bg-[#1A1B1E] hover:text-[#A1A1AA] border border-[#232427]'
          }`}
        >
          Escalated
        </button>
        <button
          onClick={() => { setStatus('disposed'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            status === 'disposed'
              ? 'bg-[#19D3A2]/20 text-[#19D3A2] font-semibold border border-[#19D3A2]/40'
              : 'bg-[#151618] text-[#71717A] hover:bg-[#1A1B1E] hover:text-[#A1A1AA] border border-[#232427]'
          }`}
        >
          Disposed
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#151618] rounded-card border border-[#232427] p-4 space-y-3">
        {/* Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search keyword (q)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition"
            />
          </div>
          <div>
            <input
              type="text"
              value={caseId}
              onChange={(e) => { setCaseId(e.target.value); setPage(1); }}
              placeholder="Case ID (e.g. AICTE-RB-2026-01000)"
              className="w-full px-3 py-2 text-xs bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition font-mono"
            />
          </div>
          <div>
            <input
              type="text"
              value={aicteId}
              onChange={(e) => { setAicteId(e.target.value); setPage(1); }}
              placeholder="AICTE Permanent ID (e.g. 1-438920194)"
              className="w-full px-3 py-2 text-xs bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676] transition font-mono"
            />
          </div>
        </div>

        {/* Multi-Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Bureau */}
          <div>
            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">Bureau / Cell</label>
            <select
              value={bureau}
              onChange={(e) => { setBureau(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] text-xs focus:outline-none focus:border-[#00E676]"
            >
              <option value="">All Bureaus</option>
              {(bureausQuery.data?.data || []).map((b) => (
                <option key={b._id} value={b._id} className="bg-[#151618] text-[#F4F4F5]">{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] text-xs focus:outline-none focus:border-[#00E676]"
            >
              <option value="">All Regions</option>
              {regionsList.map((r) => (
                <option key={r} value={r} className="bg-[#151618] text-[#F4F4F5]">{r}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] text-xs focus:outline-none focus:border-[#00E676]"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat} className="bg-[#151618] text-[#F4F4F5]">{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] text-xs focus:outline-none focus:border-[#00E676]"
            >
              <option value="">All Statuses</option>
              <option value="pending" className="bg-[#151618] text-[#F4F4F5]">Pending</option>
              <option value="under_process" className="bg-[#151618] text-[#F4F4F5]">Under Process</option>
              <option value="transferred" className="bg-[#151618] text-[#F4F4F5]">Transferred</option>
              <option value="escalated" className="bg-[#151618] text-[#F4F4F5]">Escalated</option>
              <option value="disposed" className="bg-[#151618] text-[#F4F4F5]">Disposed</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[10px] font-semibold text-[#71717A] mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] text-xs focus:outline-none focus:border-[#00E676]"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(q || caseId || aicteId || bureau || region || category || status || dateFrom || dateTo) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#FF4D79] hover:text-[#FF4D79]/80 font-semibold inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table / State Container */}
      <div className="bg-[#151618] rounded-card border border-[#232427] overflow-hidden">
        {casesQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center p-14 text-[#71717A]">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E676] mb-2" />
            <p className="text-xs font-semibold text-[#F4F4F5]">Retrieving case records from central registry...</p>
          </div>
        ) : casesQuery.isError ? (
          <div className="p-8 text-center text-[#FF4D79]">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-[#FF4D79]" />
            <h3 className="font-bold text-sm">Failed to Load Cases</h3>
            <p className="text-xs text-[#71717A] mt-1">
              {casesQuery.error?.response?.data?.message || casesQuery.error?.message || 'Error communicating with backend.'}
            </p>
            <button
              onClick={() => casesQuery.refetch()}
              className="mt-3 px-3 py-1.5 bg-[#FF4D79] hover:bg-[#FF4D79]/80 text-white rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : casesList.length === 0 ? (
          <EmptyState
            title="No Matching Complaints"
            description="No complaint dockets matched your specific search filters. Adjust filters to broaden query."
            actionLabel="Reset Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A1A1AA] divide-y divide-[#232427]">
              <thead className="bg-[#0F1011] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Case ID</th>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Current Bureau</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">SLA Timeline</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232427] font-sans">
                {casesList.map((c) => {
                  const now = new Date();
                  const targetDate = c.expectedDisposalDate ? new Date(c.expectedDisposalDate) : null;
                  const diffDays = targetDate ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  const slaStatus = c.isOverdue ? 'Beyond Timeline' : c.isDueSoon ? 'Due Soon' : 'Within Timeline';

                  return (
                    <tr
                      key={c._id}
                      onClick={() => navigate(`/cases/${c._id}`)}
                      className="hover:bg-[#1A1B1E] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-[#F4F4F5] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{c.caseId}</span>
                          {c.hasOverlap && <OverlapBadge severity={c.overlapSeverity} compact />}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-[#F4F4F5] truncate">
                          {c.institution?.name || c.rawInstitutionName}
                        </p>
                        <p className="text-[11px] text-[#71717A] font-mono">
                          PID: {c.institution?.aictePermanentId || 'Unlinked'}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[#A1A1AA]">{c.institution?.region || c.rawState || 'Central'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[#F4F4F5] line-clamp-1">{c.category || 'General'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <BureauBadge bureau={c.currentBureau?.name || c.currentBureau?.code || 'Central'} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <SlaIndicator
                          slaStatus={slaStatus}
                          daysRemaining={diffDays}
                          expectedDate={c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toLocaleDateString() : 'N/A'}
                        />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cases/${c._id}`);
                          }}
                          className="p-1.5 text-[#71717A] hover:text-[#00E676] hover:bg-[#1F2023] rounded-lg transition"
                          title="View Case Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-[#232427] bg-[#0F1011] flex items-center justify-between text-xs text-[#71717A]">
            <div>
              Showing <span className="font-semibold text-[#F4F4F5]">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-semibold text-[#F4F4F5]">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of <span className="font-semibold text-[#F4F4F5]">{pagination.total}</span> cases
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={pagination.page <= 1}
                className="px-2.5 py-1 border border-[#232427] rounded-lg bg-[#151618] hover:bg-[#1A1B1E] text-[#F4F4F5] disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1 shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-mono text-[#F4F4F5] px-1">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                disabled={pagination.page >= pagination.pages}
                className="px-2.5 py-1 border border-[#232427] rounded-lg bg-[#151618] hover:bg-[#1A1B1E] text-[#F4F4F5] disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1 shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesPage;
