import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Download,
  Printer,
  Loader2,
  TrendingUp,
  Clock,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerReportsPage() {
  const [reportType, setReportType] = useState('bureau');
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['officer-reports', reportType],
    queryFn: () => officerApi.getReportData(reportType),
  });

  const reportData = data?.data;

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const blob = await officerApi.exportReportFile(reportType, 'csv');
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `aicte_statutory_report_${reportType}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Export failed: ' + (err?.message || 'Server error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden bg-[#0B1730] text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Statutory Intelligence Reports</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30">
              Official Exports
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-bureau disposal rates, statutory ageing buckets, and regional compliance matrices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Download className="w-3.5 h-3.5 text-white" />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto pb-1">
        {[
          { id: 'bureau', label: 'Bureau Workload Matrix' },
          { id: 'region', label: 'Regional Performance' },
          { id: 'ageing', label: 'Statutory Ageing Analysis' },
          { id: 'disposal-rate', label: 'Disposal Rate Trends' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              reportType === tab.id
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'bg-[#101D35] text-slate-300 hover:text-white border border-slate-700/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 bg-[#101D35] border border-slate-700/80 rounded-2xl overflow-y-auto p-5">
        {isLoading ? (
          <SkeletonLoader count={8} />
        ) : !reportData ? (
          <div className="p-8 text-center text-xs text-slate-400">No report records generated.</div>
        ) : Array.isArray(reportData) ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-700/80 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3 text-center">Total Cases</th>
                  <th className="py-2.5 px-3 text-center">Pending / In Progress</th>
                  <th className="py-2.5 px-3 text-center">Disposed</th>
                  <th className="py-2.5 px-3 text-center">Disposal Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#172846] transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      {row.name || row._id || `Bureau Item ${idx + 1}`}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-slate-100">{row.totalCases || row.total || 0}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-amber-400">{row.pendingCases || row.pending || 0}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-400">{row.disposedCases || row.disposed || 0}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-100">
                      {row.disposalRate ? `${row.disposalRate}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : typeof reportData === 'object' ? (
          <div className="space-y-4">
            <pre className="p-4 rounded-xl bg-[#0B1730] border border-slate-700/80 font-mono text-xs text-slate-300 overflow-x-auto">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default OfficerReportsPage;