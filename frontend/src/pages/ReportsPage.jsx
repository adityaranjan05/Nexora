import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Loader2, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { reportsApi } from '../api/client';
import { useApp } from '../context/AppContext';

export const ReportsPage = () => {
  const { addToast } = useApp();

  const [dateRange, setDateRange] = useState('Current Quarter (Q3 2026)');
  const [bureauFilter, setBureauFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [reportType, setReportType] = useState('bureau');
  const [isExporting, setIsExporting] = useState(false);

  // Queries for real backend report data
  const { 
    data: bureauData, 
    isLoading: isBureauLoading, 
    isError: isBureauError,
    error: bureauError 
  } = useQuery({
    queryKey: ['report-bureau', dateRange],
    queryFn: () => reportsApi.getReportData('bureau', { period: dateRange }),
  });

  const { 
    data: ageingData, 
    isLoading: isAgeingLoading 
  } = useQuery({
    queryKey: ['report-ageing', dateRange],
    queryFn: () => reportsApi.getReportData('ageing', { period: dateRange }),
  });

  const { 
    data: disposalData 
  } = useQuery({
    queryKey: ['report-disposal-rate', dateRange],
    queryFn: () => reportsApi.getReportData('disposal-rate', { period: dateRange }),
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const blob = await reportsApi.exportReportFile(reportType, 'csv', dateRange);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AICTE_Performance_Report_${reportType}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      addToast('Report Exported', `Downloaded ${reportType} CSV Report`, 'success');
    } catch (err) {
      addToast('Export Failed', err?.message || 'Failed to export CSV report', 'danger');
    } finally {
      setIsExporting(false);
    }
  };

  // Compute ageing buckets from backend data or fallbacks
  const ageingSummary = ageingData?.data?.summary || [];
  const totalAgeingCases = ageingData?.data?.cases?.length || 0;

  const ageingColors = {
    '0-15 days': 'bg-emerald-500',
    '16-30 days': 'bg-blue-500',
    '31-60 days': 'bg-amber-500',
    '60+ days': 'bg-rose-500',
  };

  // Format bureau report items
  const rawBureauList = bureauData?.data || [];
  const bureauRows = rawBureauList
    .map((b) => {
      const total = b.total || 0;
      const statuses = b.statuses || [];
      const pending = statuses.find((s) => s.status === 'pending')?.count || 0;
      const process = 
        (statuses.find((s) => s.status === 'under_process')?.count || 0) +
        (statuses.find((s) => s.status === 'open')?.count || 0);
      const disposed = statuses.find((s) => s.status === 'disposed')?.count || 0;
      const escalated = statuses.find((s) => s.status === 'escalated')?.count || 0;
      const disposalRate = total > 0 ? Math.round((disposed / total) * 100) : 0;

      return {
        code: b._id || 'N/A',
        bureau: b.name || b._id || 'Unknown Bureau',
        total,
        pending,
        process,
        disposed,
        escalated,
        disposalRate,
      };
    })
    .filter((b) => (bureauFilter === 'All' ? true : b.bureau === bureauFilter));

  const totalOverallCases = bureauRows.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
            Statutory Compliance & Performance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit-ready reporting across AICTE Bureaus, case ageing buckets, regional caseloads, and disposal indices.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 no-print">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report / PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-wrap items-center gap-3 text-xs no-print">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Time Horizon</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Current Quarter (Q3 2026)">Current Quarter (Q3 2026)</option>
            <option value="FY 2026-27">FY 2026-27 (Year to Date)</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Bureau Focus</label>
          <select
            value={bureauFilter}
            onChange={(e) => setBureauFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="All">All Bureaus Combined</option>
            <option value="Approval Bureau">Approval Bureau</option>
            <option value="Grievance Redressal Cell">Grievance Redressal Cell</option>
            <option value="Regulation Bureau">Regulation Bureau</option>
            <option value="RIFD Bureau">RIFD Bureau</option>
            <option value="Administration & Vigilance">Administration & Vigilance</option>
            <option value="Student Development Cell">Student Development Cell</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">Export Target</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="bureau">Bureau Performance Report</option>
            <option value="ageing">Ageing & SLA Report</option>
            <option value="region">Regional Caseload Report</option>
            <option value="disposal-rate">Disposal Rate Report</option>
          </select>
        </div>

        {disposalData?.data?.overallRate && (
          <div className="ml-auto flex items-center space-x-2 pl-4 border-l border-slate-100">
            <span className="text-slate-500 font-medium">Council Disposal Rate:</span>
            <span className="font-mono font-bold text-teal-700 text-sm">{disposalData.data.overallRate}</span>
          </div>
        )}
      </div>

      {/* Printable Report Header for Official Submissions */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
          All India Council for Technical Education (AICTE)
        </h2>
        <p className="text-xs text-slate-600">Integrated Institutional Grievance & Complaint Tracking Cell</p>
        <p className="text-xs text-slate-500 mt-1">Generated: {new Date().toLocaleString()} • Confidential Administration Record</p>
      </div>

      {/* Ageing Buckets Analysis Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Case Ageing Analysis & SLA Buckets</h3>
            <p className="text-xs text-slate-500">Classification of pending dockets by calendar days since registration</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {totalAgeingCases} Total Active Dockets
          </span>
        </div>

        {isAgeingLoading ? (
          <div className="py-8 flex justify-center items-center text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-teal-600" />
            Loading ageing distribution...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ageingSummary.map((bucket) => {
              const count = bucket.count || 0;
              const pct = totalAgeingCases > 0 ? Math.round((count / totalAgeingCases) * 100) : 0;
              const color = ageingColors[bucket.name] || 'bg-slate-400';

              return (
                <div key={bucket.name} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600 capitalize">{bucket.name}</span>
                    <span className="font-mono text-xs font-bold text-slate-900">{pct}%</span>
                  </div>
                  <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{count}</p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Active Inquiries</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bureau-wise Detailed Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bureau & Cell Performance Index</h3>
            <p className="text-xs text-slate-500">Comparative disposal rates and timeline compliance across council units</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600">
            {bureauRows.length} Reporting Units
          </span>
        </div>

        {isBureauLoading && (
          <div className="py-12 flex justify-center items-center text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mr-2 text-teal-600" />
            Loading bureau metrics...
          </div>
        )}

        {isBureauError && (
          <div className="p-6 bg-rose-50 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Failed to load bureau performance report: {bureauError?.message}</span>
          </div>
        )}

        {!isBureauLoading && !isBureauError && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Bureau / Cell Name</th>
                  <th className="py-3 px-4 text-center">Total Cases</th>
                  <th className="py-3 px-4 text-center">Pending Triage</th>
                  <th className="py-3 px-4 text-center">Under Process</th>
                  <th className="py-3 px-4 text-center">Disposed</th>
                  <th className="py-3 px-4 text-center">Escalated</th>
                  <th className="py-3 px-4 text-right">Disposal Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {bureauRows.length > 0 ? (
                  bureauRows.map((b) => (
                    <tr key={b.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {b.bureau} ({b.code})
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900">{b.total}</td>
                      <td className="py-3 px-4 text-center text-slate-600">{b.pending}</td>
                      <td className="py-3 px-4 text-center text-blue-700 font-medium">{b.process}</td>
                      <td className="py-3 px-4 text-center text-emerald-700 font-bold">{b.disposed}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          b.escalated > 0 ? 'bg-rose-100 text-rose-800' : 'text-slate-400'
                        }`}>
                          {b.escalated}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-teal-800">{b.disposalRate}%</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No bureau data available for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
