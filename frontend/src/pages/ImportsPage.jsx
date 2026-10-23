import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Download, 
  RefreshCw,
  FileCheck,
  AlertCircle,
  Database,
  Layers
} from 'lucide-react';
import { importSyncApi } from '../api/client';
import { useApp } from '../context/AppContext';

export const ImportsPage = () => {
  const { addToast, reloadSharedData } = useApp();
  const queryClient = useQueryClient();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sourceBureau, setSourceBureau] = useState('Approval Bureau');
  const [uploadResult, setUploadResult] = useState(null);
  const [syncResult, setSyncResult] = useState(null);

  // Mutation for File Upload
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sourceBureau', sourceBureau);
      return await importSyncApi.uploadBulkFile(formData);
    },
    onSuccess: (data) => {
      setUploadResult({
        fileName: selectedFile?.name,
        total: data.summary?.total || 0,
        created: data.summary?.created || 0,
        updated: data.summary?.updated || 0,
        failed: data.summary?.failed || 0,
        errors: data.summary?.errors || [],
        message: data.message,
      });
      addToast('Upload Complete', data.message || 'File processed successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      reloadSharedData?.();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'File upload failed';
      addToast('Upload Failed', msg, 'danger');
    },
  });

  // Mutation for Manual Connector Sync
  const syncMutation = useMutation({
    mutationFn: importSyncApi.runManualSync,
    onSuccess: (data) => {
      setSyncResult(data);
      addToast('Sync Complete', data.message || 'Live connectors synchronized successfully', 'info');
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      reloadSharedData?.();
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Connector sync failed';
      addToast('Sync Failed', msg, 'danger');
    },
  });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setUploadResult(null);
    uploadMutation.mutate(file);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'CaseID',
      'AICTE_Permanent_ID',
      'InstitutionName',
      'City',
      'State',
      'Pincode',
      'Category',
      'Description',
      'ComplainantType',
      'SourceBureau'
    ];
    const sample = [
      'CASE-2026-901',
      '1-438920194',
      'Sri Venkateswara Institute of Technology & Management',
      'Bangalore',
      'Karnataka',
      '560001',
      'Infrastructure & Lab Deficiency',
      'Shortage of CAD simulation licenses in mechanical lab',
      'Faculty Member',
      'Approval Bureau'
    ];

    const csvContent = headers.join(',') + '\n' + sample.map((s) => `"${s}"`).join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'AICTE_Bulk_Case_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-sans">
            Bulk Complaint Docket Ingestion & Live Sync
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ingest structured bureau spreadsheets, CPGRAMS dumps, or trigger automated connector synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{syncMutation.isPending ? 'Syncing...' : 'Trigger Connectors Sync'}</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Sync Status Alert if just synced */}
      {syncResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start justify-between text-xs text-emerald-900">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sync Completed Successfully</p>
              <p className="text-emerald-700 mt-0.5">
                Fetched: {syncResult.fetched} records • Created: {syncResult.created} new cases • Updated: {syncResult.updated} • Failed: {syncResult.failed}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSyncResult(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Settings Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Source Bureau Tag:</span>
        </div>
        <select
          value={sourceBureau}
          onChange={(e) => setSourceBureau(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
        >
          <option value="Approval Bureau">Approval Bureau</option>
          <option value="Grievance Redressal Cell">Grievance Redressal Cell</option>
          <option value="Regulation Bureau">Regulation Bureau</option>
          <option value="RIFD Bureau">RIFD Bureau</option>
          <option value="Administration & Vigilance">Administration & Vigilance</option>
          <option value="Student Development Cell">Student Development Cell</option>
        </select>
        <span className="text-[11px] text-slate-400">
          Incoming complaints will be automatically assigned to this bureau by default.
        </span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`bg-white rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-teal-500 bg-teal-50/30 ring-4 ring-teal-50'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Drop AICTE compliant CSV or Excel spreadsheet here
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports .csv, .xlsx formatted files up to 15MB per batch
            </p>
          </div>

          <label className="cursor-pointer">
            <span className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors inline-block">
              Browse Local File
            </span>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <span className="text-[11px] text-slate-400">
            Validated against AICTE PID regex format and duplicate checking
          </span>
        </div>
      </div>

      {/* Processing Loader */}
      {uploadMutation.isPending && (
        <div className="p-8 bg-white rounded-xl border border-slate-200 shadow-subtle text-center space-y-2">
          <RefreshCw className="w-7 h-7 text-teal-600 animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Processing File & Ingesting Dockets...</h4>
          <p className="text-xs text-slate-500">Checking duplicate cases, verifying Permanent IDs, and computing match scores</p>
        </div>
      )}

      {/* Import Error Message */}
      {uploadMutation.isError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-800">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{uploadMutation.error?.response?.data?.message || uploadMutation.error?.message || 'Upload failed'}</span>
        </div>
      )}

      {/* Import Results Summary Table */}
      {uploadResult && !uploadMutation.isPending && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden space-y-4 p-5">
          {/* Summary metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Batch Ingestion Report: {uploadResult.fileName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Rows: {uploadResult.total} • Successfully Created: {uploadResult.created} • Updated: {uploadResult.updated} • Failed: {uploadResult.failed}
              </p>
            </div>

            <button
              onClick={() => {
                setUploadResult(null);
                setSelectedFile(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Clear Report
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[11px] block">Total Processed</span>
              <span className="text-lg font-bold font-mono text-slate-900">{uploadResult.total}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-700 text-[11px] block">Created (New)</span>
              <span className="text-lg font-bold font-mono text-emerald-800">{uploadResult.created}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-blue-700 text-[11px] block">Updated</span>
              <span className="text-lg font-bold font-mono text-blue-800">{uploadResult.updated}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-rose-700 text-[11px] block">Failed / Errors</span>
              <span className="text-lg font-bold font-mono text-rose-800">{uploadResult.failed}</span>
            </div>
          </div>

          {/* Errors table if any */}
          {uploadResult.errors && uploadResult.errors.length > 0 ? (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Row Diagnostic Errors ({uploadResult.errors.length}):</span>
              </h4>
              <div className="border border-rose-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50 text-rose-800 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Row #</th>
                      <th className="py-2 px-3">Reason / Validation Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {uploadResult.errors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">{err.row || idx + 1}</td>
                        <td className="py-2 px-3 text-rose-700">{err.reason || JSON.stringify(err)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All records were validated and ingested without errors.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportsPage;
