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
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0F1011] rounded-panel border border-[#232427] p-8">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E676] mb-3" />
        <p className="text-sm font-medium text-[#71717A]">Loading institution dossier...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#0F1011] rounded-panel border border-[#232427] p-8">
        <div className="p-8 bg-[#FF4D79]/10 border border-[#FF4D79]/30 rounded-xl text-center max-w-lg mx-auto">
          <AlertCircle className="w-10 h-10 text-[#FF4D79] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#F4F4F5]">Institution Not Found</h3>
          <p className="text-xs text-[#71717A] mt-1">
            {error?.response?.data?.message || `ID "${id}" was not found in the central registry.`}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button 
              onClick={() => navigate('/institutions')}
              className="px-4 py-2 text-xs font-semibold text-black bg-[#00E676] hover:bg-[#00c864] rounded-lg transition-colors cursor-pointer"
            >
              Return to Institutions
            </button>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F4F4F5] bg-[#151618] border border-[#232427] hover:bg-[#1A1B1E] rounded-lg transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
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
    <div className="h-full w-full overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-panel p-4 sm:p-6 space-y-6 text-[#F4F4F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/institutions')}
            className="p-2 text-[#A1A1AA] hover:text-[#F4F4F5] bg-[#151618] border border-[#232427] rounded-lg hover:bg-[#1A1B1E] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] font-sans tracking-tight">
                {institution.name}
              </h1>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#00E676]/10 text-[#00E676] rounded border border-[#00E676]/30">
                {institution.aictePermanentId || 'PID Unassigned'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-[#71717A] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#52525B]" />
              <span>{institution.city}, {institution.state}</span>
              <span>•</span>
              <span>{institution.region} Region</span>
              <span>•</span>
              <span className="font-semibold text-[#A1A1AA]">{institution.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            (institution.riskScore || 0) >= 70
              ? 'bg-[#FF4D79]/15 text-[#FF4D79] border border-[#FF4D79]/30'
              : (institution.riskScore || 0) >= 40
              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
              : 'bg-[#19D3A2]/15 text-[#19D3A2] border border-[#19D3A2]/30'
          }`}>
            Risk Score: {institution.riskScore || 0}/100
          </span>
          <button 
            onClick={() => refetch()} 
            className="p-2 text-[#A1A1AA] hover:text-[#F4F4F5] bg-[#151618] border border-[#232427] hover:bg-[#1A1B1E] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#151618] p-4 rounded-xl border border-[#232427]">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Lifetime Complaints</span>
          <p className="text-2xl font-bold font-mono text-[#F4F4F5] mt-1">{institution.totalCasesCount || cases.length}</p>
          <span className="text-[11px] text-[#52525B]">Total historical dockets</span>
        </div>

        <div className="bg-[#151618] p-4 rounded-xl border border-[#232427] border-l-4 border-l-[#6C7BFF]">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Active Inquiries</span>
          <p className="text-2xl font-bold font-mono text-[#6C7BFF] mt-1">{activeCases.length}</p>
          <span className="text-[11px] text-[#52525B]">Currently open across bureaus</span>
        </div>

        <div className="bg-[#151618] p-4 rounded-xl border border-[#232427] border-l-4 border-l-[#FF4D79]">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">SLA Breached</span>
          <p className="text-2xl font-bold font-mono text-[#FF4D79] mt-1">{beyondTimelineCases.length}</p>
          <span className="text-[11px] text-[#52525B]">Overdue statutory timeline</span>
        </div>

        <div className="bg-[#151618] p-4 rounded-xl border border-[#232427] border-l-4 border-l-[#19D3A2]">
          <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Disposed / Closed</span>
          <p className="text-2xl font-bold font-mono text-[#19D3A2] mt-1">{disposedCases.length}</p>
          <span className="text-[11px] text-[#52525B]">Orders issued with compliance</span>
        </div>
      </div>

      {/* Active Overlap Groups */}
      {overlaps.length > 0 && (
        <div className="bg-[#7C3AED]/10 rounded-xl border border-[#7C3AED]/30 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-[#A78BFA]" />
              <h3 className="text-sm font-bold text-[#E9D5FF]">
                Active Cross-Bureau Overlap Groups ({overlaps.length})
              </h3>
            </div>
            <button
              onClick={() => navigate('/overlaps')}
              className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] transition-colors cursor-pointer"
            >
              Open in Overlap Centre →
            </button>
          </div>

          <div className="divide-y divide-[#7C3AED]/20">
            {overlaps.map((ov) => (
              <div key={ov._id} className="pt-2 text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-[#E9D5FF]">OVL-{ov._id.slice(-6).toUpperCase()}</span>
                  <OverlapBadge severity={ov.severity} />
                  <span className="text-[#A78BFA]">• {ov.cases?.length || 0} dockets</span>
                </div>
                <p className="text-[#C4B5FD] text-[11px]">{ov.triggerReason || 'Multiple concurrent bureau investigations'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Associated Cases Table */}
      <div className="bg-[#151618] rounded-xl border border-[#232427] overflow-hidden">
        <div className="p-4 border-b border-[#232427] bg-[#0F1011] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F4F4F5]">
              Cross-Bureau Associated Complaint Dockets ({cases.length})
            </h3>
            <p className="text-xs text-[#71717A]">All registered cases linked to this institution</p>
          </div>
        </div>

        {cases.length === 0 ? (
          <div className="py-12 text-center">
            <Building2 className="w-8 h-8 text-[#52525B] mx-auto mb-2" />
            <p className="text-xs text-[#71717A]">No complaint dockets registered against this institution.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F1011] border-b border-[#232427] text-[#71717A] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Case ID</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Bureau / Cell</th>
                  <th className="py-2.5 px-4">Received</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232427]">
                {cases.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/cases/${c._id}`)}
                    className="hover:bg-[#1A1B1E]/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#F4F4F5] whitespace-nowrap">
                      {c.caseId}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-medium text-[#F4F4F5] truncate">{c.category}</p>
                      <p className="text-[11px] text-[#71717A]">{c.sourceSystem}</p>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <BureauBadge bureau={c.currentBureau?.name || c.currentBureau?.code || 'N/A'} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-[#A1A1AA]">
                      {c.receivedDate ? new Date(c.receivedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c._id}`); }}
                        className="px-2.5 py-1 text-xs font-semibold text-[#00E676] bg-[#00E676]/10 hover:bg-[#00E676]/20 rounded border border-[#00E676]/30 transition-colors cursor-pointer"
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

export default InstitutionDetailsPage;
