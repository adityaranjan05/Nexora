import React from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  AlertCircle, 
  ShieldAlert, 
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { institutionsApi } from '../api/client';
import { StatusBadge } from '../components/common/StatusBadge';
import { BureauBadge } from '../components/common/BureauBadge';
import { SlaIndicator } from '../components/common/SlaIndicator';
import { OverlapBadge } from '../components/common/OverlapBadge';

export const InstitutionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['institution-detail', id],
    queryFn: () => institutionsApi.getInstitutionById(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#101D35] rounded-xl border border-slate-700/80">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
        <p className="text-sm font-medium text-slate-500">Loading institution dossier...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-rose-500/5 border border-rose-500/30 rounded-xl text-center max-w-lg mx-auto mt-8">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-rose-300">Institution Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          {error?.response?.data?.message || `ID "${id}" was not found in the central registry.`}
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => navigate('/institutions')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg">
            Return to Institutions
          </button>
          <button onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-slate-500 bg-[#111F3A] border border-slate-700 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const institution = data?.data || {};
  const cases = institution.cases || [];
  const overlaps = institution.overlaps || [];

  const activeCases = cases.filter((c) => c.status !== 'disposed');
  const disposedCases = cases.filter((c) => c.status === 'disposed');
  const beyondTimelineCases = cases.filter((c) => c.isOverdue);

  return (
    <motion.div className="space-y-6 text-slate-200" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center space-x-3">
          <motion.button
            onClick={() => navigate('/institutions')}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.96 }}
            className="p-2 text-slate-500 hover:text-slate-100 bg-[#111F3A] border border-slate-700 rounded-lg hover:bg-[#0B1730] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-100 font-sans">{institution.name}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-500/10 text-blue-300 rounded border border-blue-500/30">
                {institution.aictePermanentId || 'PID Unassigned'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{institution.city}, {institution.state}</span>
              <span>•</span>
              <span>{institution.region} Region</span>
              <span>•</span>
              <span className="font-semibold text-slate-500">{institution.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            (institution.riskScore || 0) >= 70
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : (institution.riskScore || 0) >= 40
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
          }`}>
            Risk Score: {institution.riskScore || 0}/100
          </span>
          <motion.button onClick={() => refetch()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 text-slate-500 hover:text-slate-500 bg-[#111F3A] border border-slate-700 rounded-lg cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Summary KPI Cards */}
      <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} whileHover={{ y: -3 }} className="bg-[#101D35] p-4 rounded-xl border border-slate-700/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lifetime Complaints</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">{institution.totalCasesCount || cases.length}</p>
          <span className="text-[11px] text-slate-500">Total historical dockets</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} whileHover={{ y: -3 }} className="bg-[#101D35] p-4 rounded-xl border border-slate-700/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Inquiries</span>
          <p className="text-2xl font-bold font-mono text-blue-300 mt-1">{activeCases.length}</p>
          <span className="text-[11px] text-slate-500">Currently open across bureaus</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} whileHover={{ y: -3 }} className="bg-[#101D35] p-4 rounded-xl border border-slate-700/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">SLA Breached</span>
          <p className="text-2xl font-bold font-mono text-rose-300 mt-1">{beyondTimelineCases.length}</p>
          <span className="text-[11px] text-slate-500">Overdue statutory timeline</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} whileHover={{ y: -3 }} className="bg-[#101D35] p-4 rounded-xl border border-slate-700/80 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disposed / Closed</span>
          <p className="text-2xl font-bold font-mono text-blue-300 mt-1">{disposedCases.length}</p>
          <span className="text-[11px] text-slate-500">Orders issued with compliance</span>
        </motion.div>
      </motion.div>

      {/* Active Overlap Groups */}
      {overlaps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-purple-300" />
              <h3 className="text-sm font-bold text-purple-200">
                Active Cross-Bureau Overlap Groups ({overlaps.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/overlaps')}
              className="text-xs font-semibold text-purple-300 hover:text-purple-200 cursor-pointer"
            >
              Open in Overlap Centre →
            </button>
          </div>

          <div className="divide-y divide-purple-500/20">
            {overlaps.map((ov) => (
              <motion.div key={ov._id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }} className="pt-2 text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-purple-200">OVL-{ov._id.slice(-6).toUpperCase()}</span>
                  <OverlapBadge severity={ov.severity} />
                  <span className="text-purple-300">• {ov.cases?.length || 0} dockets</span>
                </div>
                <p className="text-purple-200 text-[11px]">{ov.triggerReason || 'Multiple concurrent bureau investigations'}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Associated Cases Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-[#101D35] rounded-xl border border-slate-700/80 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-700/80 bg-[#0B1730] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Cross-Bureau Associated Complaint Dockets ({cases.length})
            </h3>
            <p className="text-xs text-slate-500">All registered cases linked to this institution</p>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No complaint dockets registered against this institution.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B1730] border-b border-slate-700/80 text-slate-500 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Case ID</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Bureau / Cell</th>
                  <th className="py-2.5 px-4">Received</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/70">
                {cases.map((c) => (
                  <motion.tr
                    key={c._id}
                    onClick={() => navigate(`/cases/${c._id}`)}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-[#0B1730] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-100 whitespace-nowrap">
                      {c.caseId}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-medium text-slate-200 truncate">{c.category}</p>
                      <p className="text-[11px] text-slate-500">{c.sourceSystem}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <BureauBadge bureau={c.currentBureau?.name || c.currentBureau?.code || 'N/A'} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c._id}`); }}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded border border-blue-500/30 cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
