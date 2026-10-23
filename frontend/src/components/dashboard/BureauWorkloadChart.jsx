import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Table as TableIcon, 
  TrendingUp, 
  Filter, 
  Info,
  CheckCircle2,
  Clock,
  Hourglass,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';

// Custom Interactive Dark Tooltip
const CustomTooltip = ({ active, payload, label, dataMap }) => {
  if (!active || !payload || !payload.length) return null;

  const item = dataMap[label] || {};
  const total = item.total || 0;
  const disposalRate = total > 0 ? Math.round(((item.disposed || 0) / total) * 100) : 0;

  return (
    <div className="bg-[#0F1011] text-[#F4F4F5] rounded-xl p-3.5 shadow-2xl border border-[#232427] text-xs min-w-[220px]">
      <div className="flex items-center justify-between pb-2 border-b border-[#232427]">
        <div>
          <span className="font-bold text-[#F4F4F5] text-sm">{item.name || label}</span>
          <span className="block text-[11px] text-[#71717A] font-mono">Code: {label}</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#19D3A2]/15 text-[#19D3A2] border border-[#19D3A2]/30">
          {disposalRate}% Disposed
        </span>
      </div>

      <div className="space-y-1.5 pt-2">
        {payload.map((entry) => {
          const count = entry.value || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={entry.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[#A1A1AA] text-[11px]">{entry.name}</span>
              </div>
              <span className="font-mono font-bold text-[#F4F4F5] text-[11px]">
                {count} <span className="text-[#71717A] font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2 border-t border-[#232427] flex items-center justify-between text-[11px]">
        <span className="text-[#71717A]">Total Docket Volume:</span>
        <span className="font-mono font-bold text-[#19D3A2] text-xs">{total}</span>
      </div>
    </div>
  );
};

export const BureauWorkloadChart = ({ data = [], isLoading = false }) => {
  const [viewMode, setViewMode] = useState('stacked'); // 'stacked' | 'grouped' | 'rate'
  const [showTable, setShowTable] = useState(false);

  // Map for fast tooltip lookups
  const dataMap = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      map[d.code] = d;
    });
    return map;
  }, [data]);

  // Derived metrics for summary cards above chart
  const summaryMetrics = useMemo(() => {
    if (!data.length) return null;
    let maxVolumeBureau = data[0];
    let topEfficiencyBureau = data[0];
    let totalAll = 0;
    let totalActive = 0;

    data.forEach((b) => {
      totalAll += b.total || 0;
      totalActive += (b.pending || 0) + (b.process || 0) + (b.escalated || 0);
      if ((b.total || 0) > (maxVolumeBureau.total || 0)) {
        maxVolumeBureau = b;
      }
      const bRate = b.total > 0 ? (b.disposed || 0) / b.total : 0;
      const topRate = topEfficiencyBureau.total > 0 ? (topEfficiencyBureau.disposed || 0) / topEfficiencyBureau.total : 0;
      if (bRate > topRate) {
        topEfficiencyBureau = b;
      }
    });

    return {
      maxVolumeBureau,
      topEfficiencyBureau,
      totalAll,
      totalActive,
    };
  }, [data]);

  // Data formatted for Disposal Rate view
  const rateData = useMemo(() => {
    return data.map((b) => {
      const rate = b.total > 0 ? Math.round(((b.disposed || 0) / b.total) * 100) : 0;
      return {
        code: b.code,
        name: b.name,
        rate,
        disposed: b.disposed,
        total: b.total,
      };
    });
  }, [data]);

  // Data formatted for Active vs Disposed comparison view
  const comparisonData = useMemo(() => {
    return data.map((b) => ({
      code: b.code,
      name: b.name,
      active: (b.pending || 0) + (b.process || 0) + (b.escalated || 0),
      disposed: b.disposed || 0,
      total: b.total || 0,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-[#151618] p-5 rounded-card border border-[#232427] flex flex-col justify-center items-center h-96">
        <div className="w-8 h-8 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#F4F4F5]">Aggregating Bureau Workloads...</p>
        <p className="text-[11px] text-[#71717A] mt-1">Cross-referencing live bureau registers</p>
      </div>
    );
  }

  return (
    <div className="bg-[#151618] p-5 rounded-card border border-[#232427] flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#232427] gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-[#F4F4F5] font-sans">
              Bureau & Cell Caseload Distribution
            </h3>
            <span className="text-[10px] font-semibold text-[#A1A1AA] bg-[#0F1011] px-2 py-0.5 rounded border border-[#232427]">
              Live Workload
            </span>
          </div>
          <p className="text-xs text-[#71717A] mt-0.5">
            Comparative analysis of grievance and petition volume across AICTE operational divisions
          </p>
        </div>

        {/* View Mode & Table Toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="inline-flex items-center p-0.5 bg-[#0F1011] rounded-lg text-xs font-medium border border-[#232427]">
            <button
              onClick={() => { setViewMode('stacked'); setShowTable(false); }}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                viewMode === 'stacked' && !showTable
                  ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold border border-[#2D2E32]'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              Stacked Breakdown
            </button>
            <button
              onClick={() => { setViewMode('grouped'); setShowTable(false); }}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                viewMode === 'grouped' && !showTable
                  ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold border border-[#2D2E32]'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              Active vs Closed
            </button>
            <button
              onClick={() => { setViewMode('rate'); setShowTable(false); }}
              className={`px-2.5 py-1 rounded-md transition-all text-[11px] ${
                viewMode === 'rate' && !showTable
                  ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold border border-[#2D2E32]'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              Disposal %
            </button>
          </div>

          <button
            onClick={() => setShowTable(!showTable)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors ${
              showTable
                ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/30 font-semibold'
                : 'bg-[#0F1011] text-[#A1A1AA] border-[#232427] hover:bg-[#1A1B1E] hover:text-[#F4F4F5]'
            }`}
            title={showTable ? 'Switch to Chart View' : 'View Accessible Data Table'}
            aria-label="Toggle accessible data table view"
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Micro-metrics */}
      {summaryMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 pb-2 text-xs">
          <div className="p-2.5 bg-[#0F1011] rounded-lg border border-[#232427]">
            <span className="text-[10px] text-[#71717A] block font-medium uppercase tracking-wider">Total Bureaus</span>
            <span className="text-sm font-bold font-mono text-[#F4F4F5]">{data.length} Divisions</span>
          </div>
          <div className="p-2.5 bg-[#0F1011] rounded-lg border border-[#232427]">
            <span className="text-[10px] text-[#71717A] block font-medium uppercase tracking-wider">Active Inquiries</span>
            <span className="text-sm font-bold font-mono text-[#6C7BFF]">{summaryMetrics.totalActive} Active</span>
          </div>
          <div className="p-2.5 bg-[#0F1011] rounded-lg border border-[#232427]">
            <span className="text-[10px] text-[#71717A] block font-medium uppercase tracking-wider">Highest Caseload</span>
            <span className="text-sm font-bold text-[#F4F4F5] truncate block" title={summaryMetrics.maxVolumeBureau.name}>
              {summaryMetrics.maxVolumeBureau.name}
            </span>
          </div>
          <div className="p-2.5 bg-[#0F1011] rounded-lg border border-[#232427]">
            <span className="text-[10px] text-[#19D3A2] block font-medium uppercase tracking-wider">Top Disposal Rate</span>
            <span className="text-sm font-bold text-[#19D3A2] truncate block" title={summaryMetrics.topEfficiencyBureau.name}>
              {summaryMetrics.topEfficiencyBureau.code} ({summaryMetrics.topEfficiencyBureau.total > 0 ? Math.round(((summaryMetrics.topEfficiencyBureau.disposed || 0) / summaryMetrics.topEfficiencyBureau.total) * 100) : 0}%)
            </span>
          </div>
        </div>
      )}

      {/* Main Chart or Accessible Table View */}
      {showTable ? (
        /* Accessible Table Alternative */
        <div className="mt-4 border border-[#232427] rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Bureau Caseload Data Table">
            <thead className="bg-[#0F1011] border-b border-[#232427] text-[#71717A] font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Bureau Code</th>
                <th className="py-2.5 px-3">Bureau Name</th>
                <th className="py-2.5 px-3 text-right">Total Cases</th>
                <th className="py-2.5 px-3 text-right">Pending</th>
                <th className="py-2.5 px-3 text-right">Under Process</th>
                <th className="py-2.5 px-3 text-right">Disposed</th>
                <th className="py-2.5 px-3 text-right">Escalated</th>
                <th className="py-2.5 px-3 text-right">Disposal Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232427] font-mono text-[11px] bg-[#151618]">
              {data.map((b) => {
                const rate = b.total > 0 ? Math.round(((b.disposed || 0) / b.total) * 100) : 0;
                return (
                  <tr key={b.code} className="hover:bg-[#1A1B1E] transition-colors">
                    <td className="py-2 px-3 font-bold text-[#00E676] font-sans">{b.code}</td>
                    <td className="py-2 px-3 font-sans font-medium text-[#F4F4F5]">{b.name}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#F4F4F5]">{b.total}</td>
                    <td className="py-2 px-3 text-right text-[#8A99B5]">{b.pending || 0}</td>
                    <td className="py-2 px-3 text-right text-[#6C7BFF]">{b.process || 0}</td>
                    <td className="py-2 px-3 text-right text-[#19D3A2] font-bold">{b.disposed || 0}</td>
                    <td className="py-2 px-3 text-right text-[#FF4D79] font-bold">{b.escalated || 0}</td>
                    <td className="py-2 px-3 text-right font-bold text-[#00E676]">{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Recharts Interactive Visualizer */
        <div className="h-72 mt-3 w-full" role="region" aria-label="Bureau Caseload Bar Chart">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'stacked' ? (
                /* 1. Stacked Caseload View */
                <BarChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B1C20" />
                  <XAxis 
                    dataKey="code" 
                    tick={{ fontSize: 11, fill: '#71717A', fontWeight: 500 }} 
                    axisLine={{ stroke: '#232427' }} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#71717A' }} 
                    axisLine={{ stroke: '#232427' }} 
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomTooltip dataMap={dataMap} />}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={34} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '2px', color: '#A1A1AA' }} 
                  />
                  <Bar dataKey="pending" name="Pending Triage" stackId="a" fill="#8A99B5" />
                  <Bar dataKey="process" name="Under Process" stackId="a" fill="#6C7BFF" />
                  <Bar dataKey="disposed" name="Disposed (Closed)" stackId="a" fill="#19D3A2" />
                  <Bar dataKey="transferred" name="Transferred" stackId="a" fill="#B07CFF" />
                  <Bar dataKey="escalated" name="Escalated" stackId="a" fill="#FF4D79" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : viewMode === 'grouped' ? (
                /* 2. Active vs Closed Comparison */
                <BarChart
                  data={comparisonData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B1C20" />
                  <XAxis 
                    dataKey="code" 
                    tick={{ fontSize: 11, fill: '#71717A', fontWeight: 500 }} 
                    axisLine={{ stroke: '#232427' }} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#71717A' }} 
                    axisLine={{ stroke: '#232427' }} 
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1011',
                      borderColor: '#232427',
                      borderRadius: '12px',
                      color: '#F4F4F5',
                      fontSize: '12px',
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={34} 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: '11px', color: '#A1A1AA' }} 
                  />
                  <Bar dataKey="active" name="Active / In-Flight Inquiries" fill="#6C7BFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="disposed" name="Disposed / Order Issued" fill="#19D3A2" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                /* 3. Disposal Rate % Efficiency Benchmark */
                <BarChart
                  data={rateData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1B1C20" />
                  <XAxis 
                    dataKey="code" 
                    tick={{ fontSize: 11, fill: '#71717A', fontWeight: 500 }} 
                    axisLine={{ stroke: '#232427' }} 
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 11, fill: '#71717A' }} 
                    unit="%" 
                    axisLine={{ stroke: '#232427' }} 
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, 'Disposal Rate']}
                    contentStyle={{
                      backgroundColor: '#0F1011',
                      borderColor: '#232427',
                      borderRadius: '12px',
                      color: '#F4F4F5',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="rate" name="Resolution Rate (%)" fill="#00E676" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-[#71717A]">
              No bureau workload figures recorded in this monitoring period.
            </div>
          )}
        </div>
      )}

      {/* Footer Notes & Legend Key */}
      <div className="pt-3 border-t border-[#232427] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#71717A] gap-2">
        <div className="flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-[#71717A]" />
          <span>RB: Regulation • PGRC: Public Grievance • AB: Approval • RIFD: Research • AVC: Vigilance • SDC: Student Dev</span>
        </div>
        <span className="text-right">Synced with central AICTE PostgreSQL/Mongo registry</span>
      </div>
    </div>
  );
};

export default BureauWorkloadChart;
