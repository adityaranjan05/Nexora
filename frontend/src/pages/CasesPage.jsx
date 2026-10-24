import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Calendar
} from 'lucide-react';
import { casesApi, adminApi } from '../api/client';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaIndicator } from '../components/common/SlaIndicator';
import { OverlapBadge } from '../components/common/OverlapBadge';
import { EmptyState } from '../components/common/EmptyState';

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
      'Region',
      'Category',
      'Bureau',
      'Status',
      'Received Date',
      'Expected Disposal',
      'Assigned Officer',
      'Has Overlap',
    ];

    const rows = list.map((c) => [
      `"${c.caseId || ''}"`,
      `"${c.institution?.aictePermanentId || ''}"`,
      `"${c.institution?.name || c.rawInstitutionName || ''}"`,
      `"${c.institution?.region || c.rawState || ''}"`,
      `"${c.category || ''}"`,
      `"${c.currentBureau?.name || ''}"`,
      `"${c.status || ''}"`,
      `"${c.receivedDate ? new Date(c.receivedDate).toISOString().split('T')[0] : ''}"`,
      `"${c.expectedDisposalDate ? new Date(c.expectedDisposalDate).toISOString().split('T')[0] : ''}"`,
      `"${c.assignedOfficer?.name || 'Unassigned'}"`,
      c.hasOverlap ? 'YES' : 'NO',
    ]);

    const csvString = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Page Title & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 font-sans">
            Complaint Cases Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Institutional grievance tracking, inter-bureau routing, and statutory SLA enforcement.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-[#111F3A] border border-slate-600/80 rounded-lg hover:bg-[#1B2D48] shadow-subtle transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span>Export Table CSV</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Preset Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/80 pb-3">
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStatus(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            status === ''
              ? 'bg-[#142B45] text-white font-semibold'
              : 'bg-[#101D35] text-slate-300 hover:bg-[#1B2D48] border border-slate-600/80'
          }`}
        >
          All Cases
        </motion.button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStatus('pending'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            status === 'pending'
              ? 'bg-[#334155] text-white font-semibold'
              : 'bg-[#101D35] text-slate-300 hover:bg-[#1B2D48] border border-slate-600/80'
          }`}
        >
          Pending Triage
        </motion.button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStatus('under_process'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            status === 'under_process'
              ? 'bg-[#2563EB] text-white font-semibold'
              : 'bg-[#101D35] text-slate-300 hover:bg-[#1B2D48] border border-slate-600/80'
          }`}
        >
          Under Process
        </motion.button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStatus('escalated'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            status === 'escalated'
              ? 'bg-[#E11D48] text-white font-semibold'
              : 'bg-[#101D35] text-slate-300 hover:bg-[#1B2D48] border border-slate-600/80'
          }`}
        >
          Escalated
        </motion.button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStatus('disposed'); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            status === 'disposed'
              ? 'bg-[#8B5CF6] text-white font-semibold'
              : 'bg-[#101D35] text-slate-300 hover:bg-[#1B2D48] border border-slate-600/80'
          }`}
        >
          Disposed
        </motion.button>
      </div>

      {/* Filter Control Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-gradient-to-br from-[#111F3A] via-[#101D35] to-[#0B1730] rounded-xl border border-slate-700/80 p-4 shadow-subtle space-y-3"
      >
        {/* Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Search keyword (q)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0B1730] border border-slate-600/80 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-[#111F3A] transition"
            />
          </div>
          <div>
            <input
              type="text"
              value={caseId}
              onChange={(e) => { setCaseId(e.target.value); setPage(1); }}
              placeholder="Case ID (e.g. AICTE-RB-2026-01000)"
              className="w-full px-3 py-2 text-xs bg-[#0B1730] border border-slate-600/80 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-[#111F3A] transition"
            />
          </div>
          <div>
            <input
              type="text"
              value={aicteId}
              onChange={(e) => { setAicteId(e.target.value); setPage(1); }}
              placeholder="AICTE Permanent ID (e.g. 1-438920194)"
              className="w-full px-3 py-2 text-xs bg-[#0B1730] border border-slate-600/80 rounded-lg text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-[#111F3A] transition"
            />
          </div>
        </div>

        {/* Multi-Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Bureau */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Bureau / Cell</label>
            <select
              value={bureau}
              onChange={(e) => { setBureau(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0B1730] border border-slate-600/80 rounded-md text-slate-200 text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">All Bureaus</option>
              {(bureausQuery.data?.data || []).map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => { setRegion(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0B1730] border border-slate-600/80 rounded-md text-slate-200 text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">All Regions</option>
              {regionsList.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0B1730] border border-slate-600/80 rounded-md text-slate-200 text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full px-2.5 py-1.5 bg-[#0B1730] border border-slate-600/80 rounded-md text-slate-200 text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_process">Under Process</option>
              <option value="transferred">Transferred</option>
              <option value="escalated">Escalated</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 bg-[#0B1730] border border-slate-600/80 rounded-md text-slate-200 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full px-2 py-1 bg-[#0B1730] border border-slate-600/80 rounded-md text-slate-200 text-xs focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {(q || caseId || aicteId || bureau || region || category || status || dateFrom || dateTo) && (
          <div className="flex justify-end pt-1">
            <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}
              onClick={handleResetFilters}
              className="text-xs text-rose-300 hover:text-rose-200 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Main Table / State Container */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="bg-gradient-to-b from-[#101D35] to-[#0B1730] rounded-xl border border-slate-700/80 shadow-subtle overflow-hidden"
      >
        {casesQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
            <p className="text-xs font-semibold">Retrieving case records from central registry...</p>
          </div>
        ) : casesQuery.isError ? (
          <div className="p-8 text-center text-rose-300">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-500" />
            <h3 className="font-bold text-sm">Failed to Load Cases</h3>
            <p className="text-xs text-slate-400 mt-1">
              {casesQuery.error?.response?.data?.message || casesQuery.error?.message || 'Error communicating with backend.'}
            </p>
            <button
              onClick={() => casesQuery.refetch()}
              className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold cursor-pointer"
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
            <table className="w-full text-left text-xs text-slate-300 divide-y divide-[#26394F]">
              <thead className="bg-[#111F3A] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
              <tbody className="divide-y divide-[#26394F] font-sans">
                {casesList.map((c) => {
                  const now = new Date();
                  const targetDate = c.expectedDisposalDate ? new Date(c.expectedDisposalDate) : null;
                  const diffDays = targetDate ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  const slaStatus = c.isOverdue ? 'Beyond Timeline' : c.isDueSoon ? 'Due Soon' : 'Within Timeline';

                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      key={c._id}
                      onClick={() => navigate(`/cases/${c._id}`)}
                      className="hover:bg-[#182844] transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{c.caseId}</span>
                          {c.hasOverlap && <OverlapBadge severity={c.overlapSeverity} />}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-slate-100 truncate">
                          {c.institution?.name || c.rawInstitutionName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          PID: {c.institution?.aictePermanentId || 'Unlinked'}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-slate-300">{c.institution?.region || c.rawState || 'Central'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-300 line-clamp-1">{c.category || 'General'}</span>
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
                          className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-[#1B2D48] rounded-md transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="px-4 py-3 border-t border-slate-700/80 bg-[#0B1730] flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-100">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-semibold text-slate-100">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of <span className="font-semibold text-slate-100">{pagination.total}</span> cases
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={pagination.page <= 1}
                className="px-2.5 py-1 border border-slate-600/80 rounded bg-[#111F3A] text-slate-200 hover:bg-[#1B2D48] disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-mono text-slate-200">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                disabled={pagination.page >= pagination.pages}
                className="px-2.5 py-1 border border-slate-600/80 rounded bg-[#111F3A] text-slate-200 hover:bg-[#1B2D48] disabled:opacity-40 disabled:cursor-not-allowed transition inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CasesPage;
