import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PlusCircle,
  Building,
  FileText,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { studentApi } from '../../../shared/api/studentApi';

const CATEGORIES = [
  'Ragging',
  'Fee/Refund',
  'Harassment',
  'Infrastructure',
  'Admission',
  'Faculty',
  'Academic',
  'Other',
];

export function StudentNewComplaintPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [institutionSearch, setInstitutionSearch] = useState('');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [manualInstitutionName, setManualInstitutionName] = useState('');
  const [manualState, setManualState] = useState('');
  const [useManualInstitution, setUseManualInstitution] = useState(false);

  const [category, setCategory] = useState('Fee/Refund');
  const [description, setDescription] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);

  const [errorMsg, setErrorMsg] = useState('');

  // Fetch AICTE Approved Institutions
  const { data: institutionsData, isLoading: instLoading } = useQuery({
    queryKey: ['student', 'institutions', institutionSearch],
    queryFn: () => studentApi.getInstitutions({ q: institutionSearch, limit: 20 }),
  });

  const institutions = institutionsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload) => studentApi.createCase(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['student', 'cases']);
      navigate(`/student/cases/${data.data._id}`);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to submit grievance. Please try again.');
    },
  });

  const handleAddEvidence = () => {
    if (!evidenceUrl.trim()) return;
    setEvidenceList((prev) => [
      ...prev,
      {
        originalName: evidenceName.trim() || 'Document Attachment',
        fileUrl: evidenceUrl.trim(),
        fileType: 'application/pdf',
      },
    ]);
    setEvidenceName('');
    setEvidenceUrl('');
  };

  const handleRemoveEvidence = (index) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Please describe your grievance in detail.');
      return;
    }

    if (!useManualInstitution && !selectedInstitutionId) {
      setErrorMsg('Please select an institution or enter your college name manually.');
      return;
    }

    if (useManualInstitution && !manualInstitutionName.trim()) {
      setErrorMsg('Please provide your college/institution name.');
      return;
    }

    const payload = {
      category,
      description: description.trim(),
      evidenceFiles: evidenceList,
      institutionId: useManualInstitution ? undefined : selectedInstitutionId,
      rawInstitutionName: useManualInstitution ? manualInstitutionName.trim() : undefined,
      rawState: useManualInstitution ? manualState.trim() : undefined,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-3xl pb-12 mx-auto">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel &amp; return to grievances</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
            AICTE Grievance Intake
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">File a New Grievance</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit your complaint directly to the AICTE oversight bureau. Your submission is protected and tracked under AICTE citizen charter timelines.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Institution Details */}
        <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-300" />
              <span>1. Institution / College Information</span>
            </h2>

            <button
              type="button"
              onClick={() => setUseManualInstitution(!useManualInstitution)}
              className="text-xs text-blue-300 hover:underline"
            >
              {useManualInstitution ? 'Select from AICTE directory' : 'College not in list? Enter manually'}
            </button>
          </div>

          {!useManualInstitution ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={institutionSearch}
                  onChange={(e) => setInstitutionSearch(e.target.value)}
                  placeholder="Filter colleges by name, city or state..."
                  className="w-full bg-[#0B1730] border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Select Your Institution <span className="text-rose-300">*</span>
                </label>
                <select
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  required={!useManualInstitution}
                  className="w-full bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose an institution from the list...</option>
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name} {inst.city ? `(${inst.city}, ${inst.state})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Full Institution Name <span className="text-rose-300">*</span>
                </label>
                <input
                  type="text"
                  value={manualInstitutionName}
                  onChange={(e) => setManualInstitutionName(e.target.value)}
                  placeholder="e.g. Apex Institute of Technology"
                  required={useManualInstitution}
                  className="w-full bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  State / Region
                </label>
                <input
                  type="text"
                  value={manualState}
                  onChange={(e) => setManualState(e.target.value)}
                  placeholder="e.g. Maharashtra, Karnataka..."
                  className="w-full bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Grievance Category & Details */}
        <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-300" />
            <span>2. Nature of Complaint</span>
          </h2>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Complaint Category <span className="text-rose-300">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                    category === cat
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/40 font-semibold shadow-sm'
                      : 'bg-[#0B1730] text-slate-300 border-slate-700/80 hover:bg-[#172846] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Detailed Description <span className="text-rose-300">*</span>
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the facts clearly: include dates, semester/roll details, interactions with college administration, and the specific relief requested..."
              required
              className="w-full bg-[#0B1730] border border-slate-700/80 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Step 3: Supporting Evidence Documents */}
        <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-blue-300" />
            <span>3. Supporting Evidence (Optional)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
              placeholder="Document title (e.g. Fee Receipt 2025)"
              className="bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Cloud URL (Google Drive, Dropbox, PDF link)"
                className="flex-1 bg-[#0B1730] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#172846] hover:bg-[#203657] text-white"
              >
                Attach
              </button>
            </div>
          </div>

          {evidenceList.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Attached Files:</div>
              {evidenceList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B1730] border border-slate-700/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Paperclip className="w-3.5 h-3.5 text-blue-300" />
                    <span>{item.originalName}</span>
                    <span className="text-slate-400 text-[11px]">({item.fileUrl})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(idx)}
                    className="text-rose-300 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submission Confirmation & Actions */}
        <div className="bg-[#0B1730] border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Complaints are authenticated and logged into the AICTE centralized ledger.</span>
          </div>

          <button
            type="submit"
            disabled={createMutation.isLoading}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all shadow-lg shadow-[#B07CFF]/20 flex items-center gap-2 shrink-0"
          >
            {createMutation.isLoading ? 'Registering...' : 'Submit Grievance'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentNewComplaintPage;
