import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Building2, GitMerge, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommandPalette = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, cases, institutions, overlaps } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const safeText = (value) => String(value ?? '').toLowerCase();

  const q = query.toLowerCase().trim();

  const filteredCases = q
  ? cases.filter(
      (c) =>
        safeText(c.id).includes(q) ||
        safeText(c.permanentId).includes(q) ||
        safeText(c.institutionName).includes(q) ||
        safeText(c.subject).includes(q) ||
        safeText(c.bureau).includes(q)
    ).slice(0, 5)
  : cases.slice(0, 3);

  const filteredInstitutions = q
  ? institutions.filter(
      (i) =>
        safeText(i.name).includes(q) ||
        safeText(i.permanentId).includes(q) ||
        safeText(i.city).includes(q) ||
        safeText(i.region).includes(q)
    ).slice(0, 4)
  : institutions.slice(0, 2);

  const filteredOverlaps = q
  ? overlaps.filter(
      (o) =>
        safeText(o.id).includes(q) ||
        safeText(o._id).includes(q) ||
        safeText(`OVL-${String(o._id ?? '').slice(-6).toUpperCase()}`).includes(q) ||
        safeText(o.institutionName).includes(q) ||
        safeText(o.triggerReason).includes(q)
    ).slice(0, 3)
  : overlaps.slice(0, 2);

  const handleSelectCase = (caseId) => {
    setCommandPaletteOpen(false);
    navigate(`/cases/${encodeURIComponent(caseId)}`);
  };

  const handleSelectInstitution = (instId) => {
    setCommandPaletteOpen(false);
    navigate(`/institutions/${instId}`);
  };

  const handleSelectOverlap = (overlapId) => {
    setCommandPaletteOpen(false);
    navigate('/overlaps');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div 
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-modal border border-slate-200 overflow-hidden z-10">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type case ID, institution name, or AICTE PID (e.g. 1-438920194)..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {/* Cases */}
          {filteredCases.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Complaints & Cases</span>
              </div>
              <div className="space-y-1">
                {filteredCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c.id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{c.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 font-medium text-slate-700">
                          {c.bureau}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">PID: {c.permanentId}</span>
                      </div>
                      <p className="text-slate-600 truncate mt-0.5">{c.institutionName}</p>
                      <p className="text-slate-500 text-[11px] truncate">{c.subject}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Institutions */}
          {filteredInstitutions.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>AICTE Approved Institutions</span>
              </div>
              <div className="space-y-1">
                {filteredInstitutions.map((inst) => (
                  <div
                    key={inst._id}
                    onClick={() => handleSelectInstitution(inst._id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 truncate">{inst.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-teal-50 text-teal-800 rounded border border-teal-200">
                          {inst.permanentId}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {inst.city}, {inst.state} ({inst.region} Region) • {inst.activeCases} active complaints
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overlaps */}
          {filteredOverlaps.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GitMerge className="w-3.5 h-3.5" />
                <span>Potential Cross-Bureau Overlaps</span>
              </div>
              <div className="space-y-1">
                {filteredOverlaps.map((ov) => (
                  <div
                    key={ov.id}
                    onClick={() => handleSelectOverlap(ov.id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-50/60 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-purple-900">{ov.id}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                          {ov.severity} Severity
                        </span>
                        <span className="text-slate-600 truncate">{ov.institutionName}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">{ov.triggerReason}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCases.length === 0 && filteredInstitutions.length === 0 && filteredOverlaps.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching records found for "{query}". Try searching by PID number (e.g. 1-438920194) or bureau.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono">ESC</kbd> to exit</span>
          </div>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3 text-slate-400" /> Click any result to view details
          </span>
        </div>
      </div>
    </div>
  );
};
