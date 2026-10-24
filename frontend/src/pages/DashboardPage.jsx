import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FolderArchive, 
  Clock, 
  Hourglass, 
  CheckCircle2, 
  ArrowRightLeft, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  DownloadCloud,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { dashboardApi, reportsApi, overlapsApi, casesApi } from '../api/client';
import { KpiCard } from '../components/common/KpiCard';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaIndicator } from '../components/common/SlaIndicator';
import { OverlapBadge } from '../components/common/OverlapBadge';

export const DashboardPage = () => {
  const { selectedDateRange, triggerRefresh, isRefreshing } = useApp();
  const navigate = useNavigate();

  // Queries
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
  });

  const workloadQuery = useQuery({
    queryKey: ['dashboard-bureau-workload'],
    queryFn: dashboardApi.getBureauWorkload,
  });

  const regionsQuery = useQuery({
    queryKey: ['dashboard-regions'],
    queryFn: () => reportsApi.getReportData('region'),
  });

  const ageingQuery = useQuery({
    queryKey: ['dashboard-ageing'],
    queryFn: () => reportsApi.getReportData('ageing'),
  });

  const overlapsQuery = useQuery({
    queryKey: ['dashboard-overlaps'],
    queryFn: () => overlapsApi.getOverlaps({ status: 'open' }),
  });

  const casesQuery = useQuery({
    queryKey: ['dashboard-recent-cases'],
    queryFn: () => casesApi.getCases({ limit: 40 }),
  });

  const isLoading = summaryQuery.isLoading || workloadQuery.isLoading;
  const isError = summaryQuery.isError || workloadQuery.isError;
  const errorMessage = summaryQuery.error?.message || workloadQuery.error?.message || 'Error connecting to central backend service.';

  const handleManualRefresh = async () => {
    await Promise.all([
      summaryQuery.refetch(),
      workloadQuery.refetch(),
      regionsQuery.refetch(),
      ageingQuery.refetch(),
      overlapsQuery.refetch(),
      casesQuery.refetch(),
      triggerRefresh(),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-slate-400 bg-gradient-to-br from-[#14283B] via-[#101D30] to-[#0D1728] rounded-xl border border-[#263E54]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-300 mb-3" />
        <p className="text-sm font-semibold text-slate-100">Loading Central Monitoring Dashboard...</p>
        <p className="text-xs text-slate-500 mt-1">Fetching live bureau workload, SLA status, and overlap groups</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-[#241B2A] border border-rose-500/30 rounded-xl text-center max-w-2xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-200">Dashboard Unavailable</h3>
        <p className="text-xs text-rose-300 mt-1">{errorMessage}</p>
        <p className="text-xs text-slate-500 mt-2">Could not retrieve live metrics from backend.</p>
        <button
          onClick={handleManualRefresh}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Summary Metrics
  const summary = summaryQuery.data?.data || {};
  const totalCases = summary.totalReceived || 0;
  const pendingCases = summary.pending || 0;
  const underProcessCases = summary.underProcess || 0;
  const disposedCases = summary.disposed || 0;
  const transferredCases = summary.transferred || 0;
  const escalatedCases = summary.escalated || 0;
  const beyondTimelineCases = summary.beyondTimeline || 0;

  // Donut chart status breakdown
  const statusPieData = [
    { name: 'Pending', value: pendingCases, color: '#2DD4BF' },
    { name: 'Under Process', value: underProcessCases, color: '#60A5FA' },
    { name: 'Disposed', value: disposedCases, color: '#8B5CF6' },
    { name: 'Transferred', value: transferredCases, color: '#A78BFA' },
    { name: 'Escalated', value: escalatedCases, color: '#F472B6' },
  ];

  // Bureau Workload formatted for Stacked Bar Chart
  const rawWorkload = workloadQuery.data?.data || [];
  const bureauChartData = rawWorkload.map((b) => ({
    code: b.code || b.name,
    name: b.name,
    pending: b.pending || 0,
    process: b.under_process || 0,
    disposed: b.disposed || 0,
    transferred: b.transferred || 0,
    escalated: b.escalated || 0,
    total: b.total || 0,
  }));

  // Regional Distribution
  const rawRegions = regionsQuery.data?.data || [];
  const regionalChartData = rawRegions.map((r) => ({
    region: r._id || 'General',
    cases: r.totalCases || 0,
    pending: r.pendingCases || 0,
    disposed: r.disposedCases || 0,
    escalated: r.escalatedCases || 0,
  }));

  // Ageing Breakdown for Trend / Ageing chart
  const ageingData = ageingQuery.data?.data?.summary || [];
  const ageingChartData = ageingData.map((a) => ({
    bucket: a.name,
    count: a.count,
  }));

  // Cases and Deadlines
  const recentCasesList = casesQuery.data?.data || [];
  const upcomingDeadlines = recentCasesList
    .filter((c) => c.status !== 'disposed' && c.expectedDisposalDate)
    .sort((a, b) => new Date(a.expectedDisposalDate).getTime() - new Date(b.expectedDisposalDate).getTime())
    .slice(0, 4);

  // Active Overlaps
  const activeOverlaps = (overlapsQuery.data?.data || []).slice(0, 5);

  const handleExportSummary = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Count\n' +
      `Total Received,${totalCases}\n` +
      `Pending,${pendingCases}\n` +
      `Under Process,${underProcessCases}\n` +
      `Disposed,${disposedCases}\n` +
      `Transferred,${transferredCases}\n` +
      `Escalated,${escalatedCases}\n` +
      `Beyond Timeline,${beyondTimelineCases}\n` +
      `Disposal Rate,${summary.disposalRate || '0%'}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_Nexora_Executive_Summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Welcome & Monitoring Header */}
      <div className="bg-gradient-to-br from-[#17384B] via-[#12263A] to-[#0D182A] rounded-xl border border-[#31566A] p-5 sm:p-6 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-200 border border-blue-400/25">
              AICTE Integrated Grievance Cell
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-gray-300 font-medium">Monitoring Window: {selectedDateRange}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 font-sans">
            Complaint Monitoring Overview
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-0.5">
            Monitor institutional complaints, statutory deadlines, and cross-bureau coordination.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleExportSummary}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-200 bg-[#1B2D42] hover:bg-[#243951] rounded-lg transition-colors border border-[#30465D]"
          >
            <DownloadCloud className="w-3.5 h-3.5 text-slate-300" />
            <span>Executive CSV</span>
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Activity className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Synchronize Bureaus</span>
          </button>
        </div>
      </div>

      {/* 7 KPI Analytical Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <KpiCard
          label="Total Cases"
          value={totalCases}
          sublabel="All active dockets"
          icon={FolderArchive}
          variant="default"
          onClick={() => navigate('/cases')}
        />
        <KpiCard
          label="Pending"
          value={pendingCases}
          sublabel="Awaiting initial triage"
          icon={Clock}
          variant="pending"
          onClick={() => navigate('/cases?status=pending')}
        />
        <KpiCard
          label="Under Process"
          value={underProcessCases}
          sublabel="Inquiry / scrutiny active"
          icon={Hourglass}
          variant="process"
          onClick={() => navigate('/cases?status=under_process')}
        />
        <KpiCard
          label="Disposed"
          value={disposedCases}
          sublabel="Closure order issued"
          icon={CheckCircle2}
          variant="disposed"
          trend={{ value: `${summary.disposalRate || '0%'} rate`, isUpward: true, isGood: true }}
          onClick={() => navigate('/cases?status=disposed')}
        />
        <KpiCard
          label="Transferred"
          value={transferredCases}
          sublabel="Inter-bureau routed"
          icon={ArrowRightLeft}
          variant="transferred"
          onClick={() => navigate('/cases?status=transferred')}
        />
        <KpiCard
          label="Escalated"
          value={escalatedCases}
          sublabel="Elevated to Directorate"
          icon={AlertTriangle}
          variant="escalated"
          onClick={() => navigate('/cases?status=escalated')}
        />
        <KpiCard
          label="Beyond Timeline"
          value={beyondTimelineCases}
          sublabel="SLA breach statutory"
          icon={AlertOctagon}
          variant="danger"
          onClick={() => navigate('/cases?sla=overdue')}
        />
      </div>

      {/* Main Analytics Grid (Stacked Bars & Donut) */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Bureau Workload Stacked Bar Chart */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#14283B] via-[#101D30] to-[#0D1728]
p-5 rounded-xl border border-[#263E54] shadow-subtle flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#26394F]">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Bureau & Cell Case Distribution</h3>
              <p className="text-xs text-slate-400">Cross-departmental volume classified by status</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-300 bg-[#1B2D42] border border-[#30465D] px-2 py-0.5 rounded">
              Active AICTE Entities
            </span>
          </div>

          <div className="h-72 mt-4 w-full">
            {bureauChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={bureauChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#26394F" />
                  <XAxis 
                    dataKey="code" 
                    tick={{ fontSize: 11, fill: '#A9BDD0' }} 
                    axisLine={{ stroke: '#334B63' }} 
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#A9BDD0' }} 
                    axisLine={{ stroke: '#334B63' }} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101D35',
                      border: '1px solid #294158',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => [value, name === 'process' ? 'Under Process' : name]}
                   wrapperStyle={{ outline: 'none', zIndex: 20 }}  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '11px' }} 
                  />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="#60A5FA" barSize={24} />
                  <Bar dataKey="process" name="Under Process" stackId="a" fill="#60A5FA" barSize={24} />
                  <Bar dataKey="disposed" name="Disposed" stackId="a" fill="#8B5CF6" barSize={24} />
                  <Bar dataKey="transferred" name="Transferred" stackId="a" fill="#A78BFA" barSize={24} />
                  <Bar dataKey="escalated" name="Escalated" stackId="a" fill="#F472B6" barSize={24} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No bureau workload data available.
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 text-right">
            RB: Regulatory • PGRC: Grievances • APPROVAL: Approval • ACADEMIC: Academic
          </div>
        </div>

        {/* Case Status Distribution Donut */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#14283B] via-[#101D30] to-[#0D1728] p-5 rounded-xl border border-[#263E54] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#26394F]">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Status Allocation</h3>
              <p className="text-xs text-slate-400">Live composition of all cases</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-200 bg-[#1B2D42] border border-[#30465D] px-2 py-0.5 rounded">
              {totalCases} Cases
            </span>
          </div>

          <div className="h-56 relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#101D35',
                    border: '1px solid #294158',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                  }}
                 wrapperStyle={{ outline: 'none', zIndex: 20 }}  cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-mono text-slate-100">{totalCases}</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-[#26394F] pt-3">
            {statusPieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="font-mono font-semibold text-slate-100 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Secondary Analytics Row: Regional Distribution & Ageing Bucket */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Regional Distribution */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#14283B] via-[#101D30] to-[#0D1728] p-5 rounded-xl border border-[#263E54] shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-[#26394F]">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Regional Case Load</h3>
              <p className="text-xs text-slate-400">Distribution across administrative zones</p>
            </div>
            <span className="text-xs text-blue-200 bg-[#172B46] px-2 py-0.5 rounded font-medium">
              Live Regional Aggregation
            </span>
          </div>

          <div className="h-64 mt-3">
            {regionalChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionalChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#26394F" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#A9BDD0' }} />
                  <YAxis dataKey="region" type="category" tick={{ fontSize: 11, fill: '#A9BDD0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101D35',
                      border: '1px solid #294158',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                   wrapperStyle={{ outline: 'none', zIndex: 20 }}  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                  <Bar dataKey="cases" name="Complaint Cases" fill="#60A5FA" barSize={14} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="pending" name="Open Cases" fill="#A78BFA" barSize={14} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No regional data available.
              </div>
            )}
          </div>
        </div>

        {/* Complaint Ageing Breakdown */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#14283B] via-[#101D30] to-[#0D1728] p-5 rounded-xl border border-[#263E54] shadow-subtle">
          <div className="flex items-center justify-between pb-3 border-b border-[#26394F]">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Complaint Ageing Distribution</h3>
              <p className="text-xs text-slate-400">Days open since registration</p>
            </div>
            <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-200 bg-[#15382F] px-2 py-0.5 rounded">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Disposal Rate: {summary.disposalRate || '0%'}</span>
            </div>
          </div>

          <div className="h-64 mt-3">
            {ageingChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageingChartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#26394F" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#A9BDD0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#A9BDD0' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101D35',
                      border: '1px solid #294158',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                   wrapperStyle={{ outline: 'none', zIndex: 20 }}  cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                  <Bar dataKey="count" name="Open Complaints" fill="#60A5FA" barSize={20} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No ageing data available.
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Priority & Coordination Section */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Prominent Potential Overlapping Cases Panel */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#252744] via-[#1A2038] to-[#11182B] rounded-xl border border-[#414365] shadow-subtle p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#26394F]">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-500/15 text-purple-200 rounded-lg">
                  <ShieldAlert className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Potential Overlapping Cases Queue</h3>
                  <p className="text-xs text-slate-400">Cross-bureau correlation flags requiring administrative alignment</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/overlaps')}
                className="text-xs font-semibold text-purple-300 hover:text-purple-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Overlap Centre</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#26394F] mt-2">
              {activeOverlaps.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active cross-bureau overlap groups detected.
                </div>
              ) : (
                activeOverlaps.map((ov) => {
                  const instName = ov.institution?.name || 'Institutional Case Group';
                  const permId = ov.institution?.aictePermanentId || 'AICTE-RECORD';
                  const bureausList = (ov.cases || [])
                    .map((c) => c.currentBureau?.name || c.currentBureau?.code)
                    .filter(Boolean);
                  const distinctBureaus = Array.from(new Set(bureausList));

                  return (
                    <div key={ov._id} className="py-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-purple-200 bg-[#292544] px-2 py-0.5 rounded border border-[#493568]">
                              {ov._id.substring(ov._id.length - 8).toUpperCase()}
                            </span>
                            <span className="text-xs font-bold text-slate-100">{instName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Permanent ID: <span className="font-mono font-medium text-slate-200">{permId}</span>
                          </p>
                        </div>
                        <OverlapBadge severity={ov.severity} />
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 bg-[#121C30] p-2 rounded border border-[#2A354D]">
                        {ov.resolutionRemarks || `Institution has ${ov.cases?.length || 0} active cases across ${distinctBureaus.length} different bureau dockets.`}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-semibold text-slate-500">Involved:</span>
                          <div className="flex flex-wrap gap-1">
                            {distinctBureaus.map((b) => (
                              <BureauBadge key={b} bureau={b} showCodeOnly />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] text-slate-400">
                            Updated: {ov.updatedAt ? new Date(ov.updatedAt).toLocaleDateString() : 'Recent'}
                          </span>
                          <button
                            onClick={() => navigate('/overlaps')}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-200 bg-[#292544] hover:bg-[#353056] rounded border border-[#493568] transition-colors cursor-pointer"
                          >
                            Review Overlap →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-[#211F3B] rounded-lg border border-[#493568] text-[11px] text-purple-200 mt-3 flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <p>
              <strong>Coordination Notice:</strong> An overlap flag highlights co-occurring bureau actions on a single institution.
              Administrative nodal officers must coordinate joint hearings before independent orders are issued.
            </p>
          </div>
        </div>

        {/* Upcoming Deadlines & Recent Activity Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-gradient-to-br from-[#14283B] via-[#101D30] to-[#0D1728] rounded-xl border border-[#263E54] shadow-subtle p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#26394F]">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Upcoming SLA Deadlines</h3>
                <p className="text-xs text-slate-400">Statutory resolution countdowns</p>
              </div>
              <button
                onClick={() => navigate('/cases')}
                className="text-xs font-semibold text-blue-300 hover:text-blue-200 cursor-pointer"
              >
                All Urgencies
              </button>
            </div>

            <div className="divide-y divide-[#26394F] mt-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No cases due soon.
                </div>
              ) : (
                upcomingDeadlines.map((c) => {
                  const now = new Date();
                  const targetDate = new Date(c.expectedDisposalDate);
                  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const slaStatus = diffDays < 0 ? 'Beyond Timeline' : diffDays <= 3 ? 'Due Soon' : 'Within Timeline';

                  return (
                    <div
                      key={c._id}
                      onClick={() => navigate(`/cases/${encodeURIComponent(c._id)}`)}
                      className="py-2.5 flex items-center justify-between hover:bg-[#1B2D42] p-2 rounded cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-100">{c.caseId}</span>
                          <BureauBadge bureau={c.currentBureau?.name || c.currentBureau?.code || 'Bureau'} showCodeOnly />
                        </div>
                        <p className="text-xs text-slate-300 truncate mt-0.5">
                          {c.institution?.name || c.rawInstitutionName}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Assigned: {c.assignedOfficer?.name || 'Unassigned'}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <SlaIndicator
                          slaStatus={slaStatus}
                          daysRemaining={diffDays}
                          expectedDate={new Date(c.expectedDisposalDate).toLocaleDateString()}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Due: {new Date(c.expectedDisposalDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Guidance Card */}
          <div className="bg-gradient-to-br from-[#14283B] to-[#101D35] text-white rounded-xl shadow-subtle p-5">
            <h4 className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">
              AICTE Central Guidance
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Disposal timelines are governed by AICTE Gazette norms. Cases flagged as overlapping across multiple bureaus
              require coordination before individual orders are issued.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Monitored Bureaus:</span>
              <span className="font-bold text-blue-300 font-mono">6 Bureaus & Cells</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
