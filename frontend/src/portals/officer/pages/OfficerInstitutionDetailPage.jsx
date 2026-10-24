import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  MapPin,
  GitMerge,
  AlertTriangle,
  FolderArchive,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { BureauBadge } from '../../../shared/components/BureauBadge';
import { OverlapBadge } from '../../../shared/components/OverlapBadge';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerInstitutionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['officer-institution-detail', id],
    queryFn: () => officerApi.getInstitutionById(id),
  });

  const item = data?.data;
  const inst = item?.institution;
  const cases = item?.cases || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonLoader count={8} />
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-base font-bold text-white">Institution Not Found</h2>
        <button
          onClick={() => navigate('/officer/institutions')}
          className="mt-4 px-3 py-1.5 rounded-lg bg-[#151618] text-xs text-white border border-[#232427]"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-5">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </button>
      </div>

      {/* Overlap alert banner if active */}
      {item.activeOverlap && (
        <div className="p-4 rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30 text-[#F59E0B] shadow-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#F59E0B]" />
          <div>
            <div className="font-bold text-xs uppercase tracking-wide">
              Active Cross-Bureau Overlap for this Institution
            </div>
            <p className="text-xs text-[#FDE68A] mt-1">
              Multiple AICTE bureaus currently have open proceedings against this institution.
            </p>
          </div>
        </div>
      )}

      {/* Institution Header Card */}
      <div className="bg-[#121315] border border-[#232427] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1F2023]">
          <div>
            <div className="flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#00E676]" />
              <h1 className="text-xl font-bold text-white">{inst.name}</h1>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              AICTE Permanent ID: <span className="font-mono text-white font-bold">{inst.aictePermanentId}</span>
            </p>
          </div>

          <div className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#151618] text-[#A1A1AA] border border-[#232427] self-start sm:self-auto">
            Region: {inst.region}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-4 text-center">
          <div className="p-3 rounded-xl bg-[#0F1011] border border-[#1F2023]">
            <div className="text-[10px] text-[#71717A] uppercase font-bold">Total Dockets</div>
            <div className="text-lg font-bold text-white mt-0.5">{item.totalCases || cases.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0F1011] border border-[#1F2023]">
            <div className="text-[10px] text-[#71717A] uppercase font-bold">Open Cases</div>
            <div className="text-lg font-bold text-[#6C7BFF] mt-0.5">{item.openCases || 0}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#0F1011] border border-[#1F2023]">
            <div className="text-[10px] text-[#71717A] uppercase font-bold">Disposed</div>
            <div className="text-lg font-bold text-[#00E676] mt-0.5">{item.disposedCases || 0}</div>
          </div>
        </div>
      </div>

      {/* Complaints for this institution */}
      <div className="bg-[#121315] border border-[#232427] rounded-2xl p-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Complaint Dockets on Record ({cases.length})
        </h2>

        {cases.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#71717A]">No complaints registered for this institution.</div>
        ) : (
          <div className="space-y-2">
            {cases.map((c) => (
              <div
                key={c._id}
                onClick={() => navigate(`/officer/cases/${c._id}`)}
                className="p-3.5 rounded-xl bg-[#0F1011] hover:bg-[#151618] border border-[#1F2023] hover:border-[#33353A] transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#00E676]">{c.caseId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1F2023] text-[#A1A1AA]">
                      {c.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] line-clamp-1">{c.description}</p>
                  <div className="text-[10px] text-[#71717A] mt-1">
                    Received: {new Date(c.receivedDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {c.currentBureau && <BureauBadge bureau={c.currentBureau.name || 'AICTE'} />}
                  <StatusBadge status={c.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerInstitutionDetailPage;
