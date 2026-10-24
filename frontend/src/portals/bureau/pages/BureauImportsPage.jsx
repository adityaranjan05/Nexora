import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Database,
  ArrowRight,
} from 'lucide-react';
import { bureauApi } from '../../../shared/api/bureauApi';

export function BureauImportsPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  // File Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => bureauApi.uploadBulkFile(formData),
    onSuccess: (data) => {
      setSuccessMsg(`File "${file.name}" uploaded successfully!`);
      setUploadResult(data.data || data);
      setErrorMsg('');
      setFile(null);
      queryClient.invalidateQueries(['bureau', 'cases']);
      queryClient.invalidateQueries(['bureau', 'dashboard']);
    },
    onError: (err) => {
      setErrorMsg(
        err.response?.data?.message || 'File upload failed. Ensure file is .csv or .xlsx and under 5 MB.'
      );
      setSuccessMsg('');
    },
  });

  // Manual Sync Mutation
  const syncMutation = useMutation({
    mutationFn: () => bureauApi.runManualSync(),
    onSuccess: (data) => {
      setSuccessMsg(data.message || 'Manual data synchronization completed successfully.');
      setErrorMsg('');
      queryClient.invalidateQueries(['bureau', 'cases']);
      queryClient.invalidateQueries(['bureau', 'dashboard']);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || 'Failed to trigger manual sync.');
      setSuccessMsg('');
    },
  });

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Check size limit: 5 MB = 5 * 1024 * 1024 bytes
    if (selected.size > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds 5 MB limit. Please select a smaller file.');
      setFile(null);
      return;
    }

    // Check extension
    const name = selected.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      setErrorMsg('Invalid file type. Only CSV and Excel (.xlsx, .xls) files are accepted.');
      setFile(null);
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setFile(selected);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
            Data Ingestion
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Bulk Import &amp; Data Sync</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload offline grievance logs or batch spreadsheets (.csv, .xlsx max 5MB) directly into your bureau repository.
        </p>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#FF4D79]/15 border border-[#FF4D79]/30 text-xs text-rose-300 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 text-xs text-emerald-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-blue-300" />
          <span>Upload Grievance Spreadsheet</span>
        </h2>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 rounded-2xl p-8 text-center bg-[#0B1730]/60 transition-colors">
            <input
              type="file"
              id="bureau-file-upload"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="bureau-file-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-300 flex items-center justify-center mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <span className="text-sm font-semibold text-white">
                {file ? file.name : 'Choose a file or drag & drop here'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                CSV or Excel (.xlsx) format • Maximum file size 5 MB
              </span>
            </label>
          </div>

          {file && (
            <div className="bg-[#0B1730] p-3 rounded-xl flex items-center justify-between text-xs">
              <span className="text-white font-mono">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-rose-300 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || uploadMutation.isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              {uploadMutation.isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Ingesting File...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Start Bulk Ingestion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Manual Sync Trigger */}
      <div className="bg-[#101D35] border border-slate-700/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-300" />
            <span>AICTE Nexora Background Sync</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-md">
            Trigger an on-demand reconciliation of offline complaint records, duplicate detection scans, and SLA index counters.
          </p>
        </div>

        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isLoading}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#172846] hover:bg-[#203657] text-slate-100 border border-slate-700/80 transition-colors flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isLoading ? 'animate-spin text-emerald-300' : ''}`} />
          <span>{syncMutation.isLoading ? 'Syncing...' : 'Run Sync Now'}</span>
        </button>
      </div>
    </div>
  );
}

export default BureauImportsPage;
