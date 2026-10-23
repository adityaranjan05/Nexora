import React from 'react';
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
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading institution dossier...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center max-w-lg mx-auto mt-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-rose-900">Institution Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          {error?.response?.data?.message || `ID "${id}" was not found in the central registry.`}
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => navigate('/institutions')}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg">
            Return to Institutions
          </button>
          <button onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/institutions')}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 font-sans">{institution.name}</h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-teal-50 text-teal-800 rounded border border-teal-200">
                {institution.aictePermanentId || 'PID Unassigned'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{institution.city}, {institution.state}</span>
              <span>•</span>
              <span>{institution.region} Region</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{institution.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            (institution.riskScore || 0) >= 70
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : (institution.riskScore || 0) >= 40
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            Risk Score: {institution.riskScore || 0}/100
          </span>
          <button onClick={() => refetch()} className="p-2 text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lifetime Complaints</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{institution.totalCasesCount || cases.length}</p>
          <span className="text-[11px] text-slate-400">Total historical dockets</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle border-l-4 border-l-blue-600">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Inquiries</span>
          <p className="text-2xl font-bold font-mono text-blue-700 mt-1">{activeCases.length}</p>
          <span className="text-[11px] text-slate-400">Currently open across bureaus</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle border-l-4 border-l-rose-600">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">SLA Breached</span>
          <p className="text-2xl font-bold font-mono text-rose-700 mt-1">{beyondTimelineCases.length}</p>
          <span className="text-[11px] text-slate-400">Overdue statutory timeline</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disposed / Closed</span>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{disposedCases.length}</p>
          <span className="text-[11px] text-slate-400">Orders issued with compliance</span>
        </div>
      </div>

      {/* Active Overlap Groups */}
      {overlaps.length > 0 && (
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-5 shadow-subtle space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-purple-700" />
              <h3 className="text-sm font-bold text-purple-950">
                Active Cross-Bureau Overlap Groups ({overlaps.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/overlaps')}
              className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
            >
              Open in Overlap Centre →
            </button>
          </div>

          <div className="divide-y divide-purple-200/60">
            {overlaps.map((ov) => (
              <div key={ov._id} className="pt-2 text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-purple-900">OVL-{ov._id.slice(-6).toUpperCase()}</span>
                  <OverlapBadge severity={ov.severity} />
                  <span className="text-purple-700">• {ov.cases?.length || 0} dockets</span>
                </div>
                <p className="text-purple-900 text-[11px]">{ov.triggerReason || 'Multiple concurrent bureau investigations'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated Cases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Cross-Bureau Associated Complaint Dockets ({cases.length})
            </h3>
            <p className="text-xs text-slate-500">All registered cases linked to this institution</p>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No complaint dockets registered against this institution.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Case ID</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Bureau / Cell</th>
                  <th className="py-2.5 px-4">Received</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/cases/${c._id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {c.caseId}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-medium text-slate-800 truncate">{c.category}</p>
                      <p className="text-[11px] text-slate-400">{c.sourceSystem}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <BureauBadge bureau={c.currentBureau?.name || c.currentBureau?.code || 'N/A'} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c._id}`); }}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200 cursor-pointer"
                      >
                        Inspect →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
