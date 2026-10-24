import React, { useState } from 'react';
import { 
  FileEdit, 
  Trash2, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  ArrowRight,
  FolderOpen
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { EmptyState } from '../../common/EmptyState';
import { BureauBadge } from '../../common/BureauBadge';
import { studentIntakeStore } from './studentIntakeStore';
import { getBureauForCategory } from './config';

export const Drafts = ({ onResumeDraft }) => {
  const { bureaus, addToast } = useApp();
  const [drafts, setDrafts] = useState(() => studentIntakeStore.getDrafts());

  const refreshDrafts = () => {
    setDrafts(studentIntakeStore.getDrafts());
  };

  const handleDelete = (draftId) => {
    studentIntakeStore.deleteDraft(draftId);
    refreshDrafts();
    addToast('Draft Deleted', 'The unsubmitted draft docket has been removed.', 'info');
  };

  if (drafts.length === 0) {
    return (
      <EmptyState
        title="No Saved Drafts"
        description="There are no partially completed complaints in your drafts folder. Any complaint saved with 'Save Draft' will appear here."
        icon={FolderOpen}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#151618] rounded-xl border border-[#232427] overflow-hidden">
        <div className="px-4 py-3 bg-[#0F1011] border-b border-[#232427] flex items-center justify-between text-xs text-[#71717A]">
          <span className="font-semibold text-[#F4F4F5]">
            Saved Complaint Drafts ({drafts.length})
          </span>
          <span>Click 'Resume' to restore and complete the filing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A1A1AA] divide-y divide-[#232427]">
            <thead className="bg-[#0F1011] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Draft ID</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Last Saved</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232427] font-sans">
              {drafts.map((d) => {
                const formattedDate = new Date(d.lastSaved).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={d.id || d.draftId} className="hover:bg-[#1A1B1E] transition-colors">
                    {/* Draft ID */}
                    <td className="px-4 py-3 font-mono font-bold text-[#F4F4F5] whitespace-nowrap">
                      {d.draftId || d.id}
                    </td>

                    {/* Student */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-[#F4F4F5]">
                        {d.studentName || <span className="italic text-[#71717A]">Unnamed</span>}
                      </div>
                      <div className="text-[11px] text-[#71717A] font-mono">
                        {d.enrollmentNo || 'No Roll No'}
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-[#F4F4F5] truncate">
                        {d.institutionName || <span className="italic text-[#71717A]">Unassigned</span>}
                      </div>
                      <div className="text-[11px] text-[#71717A] font-mono">
                        PID: {d.aictePermanentId || 'N/A'} • {d.region || 'Central'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#1F2023] text-[#F4F4F5] border border-[#2D2E32]">
                        {d.category || 'Fee Issues'}
                      </span>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-1 text-[#F4F4F5]">
                        {d.subject || <span className="italic text-[#71717A]">No subject draft</span>}
                      </p>
                      <p className="text-[11px] text-[#71717A]">
                        {d.evidenceFiles?.length || 0} file(s) attached
                      </p>
                    </td>

                    {/* Last Saved */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[#71717A] text-[11px]">
                      {formattedDate}
                    </td>

                    {/* Actions: Resume & Delete */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onResumeDraft(d)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-black bg-[#00E676] hover:bg-[#00c864] rounded-md transition"
                          title="Resume editing this draft"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                          <span>Resume</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(d.id || d.draftId)}
                          className="p-1.5 text-[#71717A] hover:text-[#FF4D79] hover:bg-[#FF4D79]/10 rounded-md transition"
                          title="Delete draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

export default Drafts;
