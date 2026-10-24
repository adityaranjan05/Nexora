import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Building, Clock, ArrowRight, FileText } from 'lucide-react';
import { studentApi } from '../../../shared/api/studentApi';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function StudentClosedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'cases'],
    queryFn: () => studentApi.getCases(),
  });

  const cases = (data?.data || []).filter((c) => ['disposed', 'rejected'].includes(c.status));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
            Case Archive
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Resolved &amp; Closed Complaints</h1>
        <p className="text-xs text-[#71717A] mt-0.5">
          Complaints that have been disposed or rejected by the AICTE investigation team.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader className="h-20 w-full" />
          <SkeletonLoader className="h-20 w-full" />
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-[#0F1011] border border-[#232427] rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-white">No closed complaints yet</h3>
          <p className="text-xs text-[#71717A] mt-1">Complaints resolved by AICTE will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const isResolved = c.status === 'disposed';
            return (
              <Link
                key={c._id}
                to={`/student/cases/${c._id}`}
                className="block bg-[#0F1011] border border-[#232427] hover:border-[#34363B] p-5 rounded-2xl transition-all hover:bg-[#151618]/50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white bg-[#151618] px-2.5 py-0.5 rounded border border-[#232427]">
                        {c.caseId || c._id.slice(-8)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-[#232427] text-[#A1A1AA] font-medium">
                        {c.category}
                      </span>
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-[#E4E4E7] flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-[#71717A]" />
                      <span>{c.institution?.name || c.rawInstitutionName || 'Institution'}</span>
                    </div>
                    {c.disposedDate && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
                        <Clock className="w-3 h-3" />
                        <span>Closed: {new Date(c.disposedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#151618] text-[#71717A] flex items-center justify-center shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentClosedPage;
