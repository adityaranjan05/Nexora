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
    <div className="h-full w-full overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-panel p-4 sm:p-6 space-y-5 select-none-off text-[#F4F4F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] font-sans tracking-tight">
            Bulk Complaint Docket Ingestion & Live Sync
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
            Ingest structured bureau spreadsheets, CPGRAMS dumps, or trigger automated connector synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-black bg-[#00E676] hover:bg-[#00c864] rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            <span>{syncMutation.isPending ? 'Syncing...' : 'Trigger Sync'}</span>
          </button>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-[#F4F4F5] bg-[#151618] border border-[#232427] rounded-lg hover:bg-[#1A1B1E] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#71717A]" />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* Sync Status Alert if just synced */}
      {syncResult && (
        <div className="p-4 bg-[#19D3A2]/10 border border-[#19D3A2]/30 rounded-card flex items-start justify-between text-xs text-[#19D3A2]">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#19D3A2] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Sync Completed Successfully</p>
              <p className="text-[#A1A1AA] mt-0.5">
                Fetched: {syncResult.fetched} records • Created: {syncResult.created} new cases • Updated: {syncResult.updated} • Failed: {syncResult.failed}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSyncResult(null)}
            className="text-[#19D3A2] hover:underline font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Settings Bar */}
      <div className="bg-[#151618] rounded-card border border-[#232427] p-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#71717A]" />
          <span className="font-semibold text-[#A1A1AA]">Default Target Bureau:</span>
        </div>
        <select
          value={sourceBureau}
          onChange={(e) => setSourceBureau(e.target.value)}
          className="px-3 py-1.5 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none focus:border-[#00E676] font-medium"
        >
          <option value="Approval Bureau" className="bg-[#151618]">Approval Bureau</option>
          <option value="Grievance Redressal Cell" className="bg-[#151618]">Grievance Redressal Cell</option>
          <option value="Regulation Bureau" className="bg-[#151618]">Regulation Bureau</option>
          <option value="RIFD Bureau" className="bg-[#151618]">RIFD Bureau</option>
          <option value="Administration & Vigilance" className="bg-[#151618]">Administration & Vigilance</option>
          <option value="Student Development Cell" className="bg-[#151618]">Student Development Cell</option>
        </select>
        <span className="text-[11px] text-[#71717A]">
          Incoming complaints will be automatically assigned to this bureau by default.
        </span>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`bg-[#151618] rounded-card border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-[#00E676] bg-[#00E676]/5 ring-4 ring-[#00E676]/10'
            : 'border-[#232427] hover:border-[#71717A]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-[#0F1011] text-[#00E676] rounded-xl border border-[#232427]">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#F4F4F5]">
              Drop AICTE compliant CSV or Excel spreadsheet here
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Supports .csv, .xlsx formatted files up to 15MB per batch
            </p>
          </div>

          <label className="cursor-pointer">
            <span className="px-4 py-2 text-xs font-bold text-black bg-[#00E676] hover:bg-[#00c864] rounded-lg transition-colors inline-block">
              Browse Local File
            </span>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <span className="text-[11px] text-[#71717A]">
            Validated against AICTE PID regex format and duplicate checking
          </span>
        </div>
      </div>

      {/* Processing Loader */}
      {uploadMutation.isPending && (
        <div className="p-8 bg-[#151618] rounded-card border border-[#232427] text-center space-y-2">
          <RefreshCw className="w-7 h-7 text-[#00E676] animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-[#F4F4F5]">Processing File & Ingesting Dockets...</h4>
          <p className="text-xs text-[#71717A]">Checking duplicate cases, verifying Permanent IDs, and computing match scores</p>
        </div>
      )}

      {/* Import Error Message */}
      {uploadMutation.isError && (
        <div className="p-4 bg-[#151618] border border-[#FF4D79]/40 rounded-card flex items-center space-x-2 text-xs text-[#FF4D79]">
          <AlertCircle className="w-5 h-5 text-[#FF4D79] shrink-0" />
          <span>{uploadMutation.error?.response?.data?.message || uploadMutation.error?.message || 'Upload failed'}</span>
        </div>
      )}

      {/* Import Results Summary Table */}
      {uploadResult && !uploadMutation.isPending && (
        <div className="bg-[#151618] rounded-card border border-[#232427] overflow-hidden space-y-4 p-5">
          {/* Summary metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232427]">
            <div>
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-[#00E676]" />
                <h3 className="text-sm font-bold text-[#F4F4F5]">
                  Batch Ingestion Report: {uploadResult.fileName}
                </h3>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Total: {uploadResult.total} • Created: {uploadResult.created} • Updated: {uploadResult.updated} • Failed: {uploadResult.failed}
              </p>
            </div>

            <button
              onClick={() => {
                setUploadResult(null);
                setSelectedFile(null);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-[#71717A] hover:text-[#F4F4F5] bg-[#0F1011] border border-[#232427] rounded-lg hover:bg-[#1F2023]"
            >
              Clear Report
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-[#0F1011] rounded-lg border border-[#232427]">
              <span className="text-[#71717A] text-[11px] block">Total Processed</span>
              <span className="text-lg font-bold font-mono text-[#F4F4F5]">{uploadResult.total}</span>
            </div>
            <div className="p-3 bg-[#0F1011] rounded-lg border border-[#232427]">
              <span className="text-[#19D3A2] text-[11px] block">Created (New)</span>
              <span className="text-lg font-bold font-mono text-[#19D3A2]">{uploadResult.created}</span>
            </div>
            <div className="p-3 bg-[#0F1011] rounded-lg border border-[#232427]">
              <span className="text-[#6C7BFF] text-[11px] block">Updated</span>
              <span className="text-lg font-bold font-mono text-[#6C7BFF]">{uploadResult.updated}</span>
            </div>
            <div className="p-3 bg-[#0F1011] rounded-lg border border-[#232427]">
              <span className="text-[#FF4D79] text-[11px] block">Failed / Errors</span>
              <span className="text-lg font-bold font-mono text-[#FF4D79]">{uploadResult.failed}</span>
            </div>
          </div>

          {/* Errors table if any */}
          {uploadResult.errors && uploadResult.errors.length > 0 ? (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-[#FF4D79] mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#FF4D79]" />
                <span>Row Diagnostic Errors ({uploadResult.errors.length}):</span>
              </h4>
              <div className="border border-[#232427] rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0F1011] text-[#FF4D79] font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Row #</th>
                      <th className="py-2 px-3">Reason / Validation Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232427]">
                    {uploadResult.errors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-[#1A1B1E]">
                        <td className="py-2 px-3 font-mono font-bold text-[#F4F4F5]">{err.row || idx + 1}</td>
                        <td className="py-2 px-3 text-[#FF4D79]">{err.reason || JSON.stringify(err)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#19D3A2]/10 rounded-lg border border-[#19D3A2]/30 flex items-center space-x-2 text-xs text-[#19D3A2]">
              <CheckCircle2 className="w-4 h-4 text-[#19D3A2]" />
              <span>All records were validated and ingested without errors.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportsPage;
