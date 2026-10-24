import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Inbox, 
  FolderOpen, 
  Archive, 
  ShieldAlert, 
  FileText, 
  Sparkles 
} from 'lucide-react';
import { NewComplaintForm } from './NewComplaintForm';
import { PortalSubmissions } from './PortalSubmissions';
import { Drafts } from './Drafts';
import { NeedsInfoRejected } from './NeedsInfoRejected';
import { studentIntakeStore } from './studentIntakeStore';

export const StudentIntakeTab = ({ onViewAllCases }) => {
  const [activeSubTab, setActiveSubTab] = useState('new-complaint');
  const [resumedDraft, setResumedDraft] = useState(null);

  // Counts for badge indicators
  const [counts, setCounts] = useState({
    unreviewedSubmissions: studentIntakeStore.getUnreviewedCount(),
    drafts: studentIntakeStore.getDrafts().length,
    needsInfoRejected: studentIntakeStore.getNeedsInfoRejected().length,
  });

  const updateCounts = () => {
    setCounts({
      unreviewedSubmissions: studentIntakeStore.getUnreviewedCount(),
      drafts: studentIntakeStore.getDrafts().length,
      needsInfoRejected: studentIntakeStore.getNeedsInfoRejected().length,
    });
  };

  useEffect(() => {
    updateCounts();
    const handleUpdate = () => updateCounts();
    window.addEventListener('student-intake-update', handleUpdate);
    return () => window.removeEventListener('student-intake-update', handleUpdate);
  }, []);

  const handleResumeDraft = (draftData) => {
    setResumedDraft(draftData);
    setActiveSubTab('new-complaint');
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Sub-tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151618] border border-[#232427] rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Sub-tab 1: New Complaint */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('new-complaint');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'new-complaint'
                ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/10'
                : 'text-[#A1A1AA] hover:bg-[#1A1B1E] hover:text-[#F4F4F5]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Complaint</span>
          </button>

          {/* Sub-tab 2: Portal Submissions */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('portal-submissions');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'portal-submissions'
                ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/10'
                : 'text-[#A1A1AA] hover:bg-[#1A1B1E] hover:text-[#F4F4F5]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Portal Submissions</span>
            {counts.unreviewedSubmissions > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeSubTab === 'portal-submissions'
                    ? 'bg-black text-[#00E676]'
                    : 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                }`}
              >
                {counts.unreviewedSubmissions}
              </span>
            )}
          </button>

          {/* Sub-tab 3: Drafts */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('drafts');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'drafts'
                ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/10'
                : 'text-[#A1A1AA] hover:bg-[#1A1B1E] hover:text-[#F4F4F5]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Drafts</span>
            {counts.drafts > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeSubTab === 'drafts'
                    ? 'bg-black text-[#00E676]'
                    : 'bg-[#1F2023] text-[#A1A1AA] border border-[#2D2E32]'
                }`}
              >
                {counts.drafts}
              </span>
            )}
          </button>

          {/* Sub-tab 4: Needs Info / Rejected */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('needs-info-rejected');
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'needs-info-rejected'
                ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/10'
                : 'text-[#A1A1AA] hover:bg-[#1A1B1E] hover:text-[#F4F4F5]'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Needs Info / Rejected</span>
            {counts.needsInfoRejected > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeSubTab === 'needs-info-rejected'
                    ? 'bg-black text-[#00E676]'
                    : 'bg-[#1F2023] text-[#A1A1AA] border border-[#2D2E32]'
                }`}
              >
                {counts.needsInfoRejected}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-[#71717A] px-2">
          <ShieldAlert className="w-4 h-4 text-[#00E676]" />
          <span>Student Ingestion & Verification Portal</span>
        </div>
      </div>

      {/* Sub-tab Contents */}
      {activeSubTab === 'new-complaint' && (
        <NewComplaintForm
          initialData={resumedDraft}
          onViewAllCases={onViewAllCases}
          onClearInitialData={() => setResumedDraft(null)}
        />
      )}

      {activeSubTab === 'portal-submissions' && (
        <PortalSubmissions onViewAllCases={onViewAllCases} />
      )}

      {activeSubTab === 'drafts' && (
        <Drafts onResumeDraft={handleResumeDraft} />
      )}

      {activeSubTab === 'needs-info-rejected' && (
        <NeedsInfoRejected />
      )}
    </div>
  );
};

export default StudentIntakeTab;
