import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HelpCircle, MessageSquare, ArrowRight, Building, Clock } from 'lucide-react';
import { studentApi } from '../../../shared/api/studentApi';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function StudentNeedsReplyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['student', 'cases'],
    queryFn: () => studentApi.getCases(),
  });

  const cases = (data?.data || []).filter((c) => c.status === 'needs_info');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
            Action Required
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Information Requested by Officer</h1>
        <p className="text-xs text-[#71717A] mt-0.5">
          AICTE officers have requested additional documents or clarifications on these complaints. Please respond promptly to avoid delays.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonLoader className="h-32 w-full" />
          <SkeletonLoader className="h-32 w-full" />
        </div>
      ) : cases.length === 0 ? (
        <div className="bg-[#0F1011] border border-[#232427] rounded-2xl p-16 text-center">
          <HelpCircle className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-white">No replies needed</h3>
          <p className="text-xs text-[#71717A] mt-1">None of your complaints are awaiting your response right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((c) => (
            <div key={c._id} className="bg-[#0F1011] border border-[#F59E0B]/30 rounded-2xl p-5 hover:border-[#F59E0B]/50 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white bg-[#151618] px-2.5 py-1 rounded border border-[#232427]">
                      {c.caseId || c._id.slice(-8)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-semibold">
                      Awaiting Your Reply
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{c.institution?.name || c.rawInstitutionName || 'Institution'}</span>
                  </div>
                  {c.lastActionText && (
                    <p className="text-xs text-[#D1D5DB] bg-[#F59E0B]/10 border border-[#F59E0B]/20 p-3 rounded-xl leading-relaxed">
                      <span className="font-semibold text-[#F59E0B]">Officer's request: </span>
                      {c.lastActionText.replace('Information requested: ', '')}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
                    <Clock className="w-3 h-3" />
                    <span>Filed: {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link
                  to={`/student/cases/${c._id}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#F59E0B] text-black hover:bg-[#D97706] transition-all shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Reply to Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentNeedsReplyPage;
