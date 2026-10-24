import React, { useState } from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  User, 
  Building2, 
  FileText, 
  HelpCircle,
  Inbox
} from 'lucide-react';
import { EmptyState } from '../../common/EmptyState';
import { studentIntakeStore } from './studentIntakeStore';

export const NeedsInfoRejected = () => {
  const [items, setItems] = useState(() => studentIntakeStore.getNeedsInfoRejected());

  if (items.length === 0) {
    return (
      <EmptyState
        title="No Items in Clarification or Rejected Archive"
        description="There are currently no complaints marked for student clarification or statutory rejection."
        icon={Inbox}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#151618] rounded-xl border border-[#232427] overflow-hidden">
        <div className="px-4 py-3 bg-[#0F1011] border-b border-[#232427] flex items-center justify-between text-xs text-[#71717A]">
          <span className="font-semibold text-[#F4F4F5]">
            Student Clarifications & Rejected Submissions ({items.length})
          </span>
          <span>Official audit record of returned or dismissed portal filings</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A1A1AA] divide-y divide-[#232427]">
            <thead className="bg-[#0F1011] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Decision</th>
                <th className="px-4 py-3">Official Reason / Clarification</th>
                <th className="px-4 py-3">Date Actioned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232427] font-sans">
              {items.map((item) => {
                const isNeedsInfo = item.decision === 'Needs Info';
                const formattedDate = new Date(item.actionDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={item.id || item.trackingId} className="hover:bg-[#1A1B1E] transition-colors">
                    {/* Tracking ID */}
                    <td className="px-4 py-3 font-mono font-bold text-[#F4F4F5] whitespace-nowrap">
                      {item.trackingId}
                    </td>

                    {/* Student */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-[#F4F4F5]">{item.studentName}</div>
                      <div className="text-[11px] text-[#71717A] font-mono">
                        {item.enrollmentNo}
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-[#F4F4F5] truncate">
                        {item.institutionName}
                      </div>
                      <div className="text-[11px] text-[#71717A] font-mono">
                        PID: {item.aictePermanentId || 'N/A'} • {item.region || 'Central'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1F2023] text-[#F4F4F5] border border-[#2D2E32]">
                        {item.category}
                      </span>
                    </td>

                    {/* Decision Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isNeedsInfo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#6C7BFF]/20 text-[#6C7BFF] border border-[#6C7BFF]/40">
                          <HelpCircle className="w-3 h-3" />
                          Needs Info
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FF4D79]/20 text-[#FF4D79] border border-[#FF4D79]/40">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* Reason / Notes */}
                    <td className="px-4 py-3 max-w-md">
                      <div className="p-2.5 bg-[#0F1011] border border-[#232427] rounded-lg">
                        <p className="text-xs text-[#F4F4F5] leading-relaxed line-clamp-2">
                          {item.reason}
                        </p>
                        <p className="text-[10px] text-[#71717A] mt-1">
                          By: {item.actionBy || 'Bureau Officer'}
                        </p>
                      </div>
                    </td>

                    {/* Date Actioned */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[#71717A] text-[11px]">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NeedsInfoRejected;
