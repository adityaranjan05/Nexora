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

  useEffect(() => {
    if (!commandPaletteOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCases = q
    ? cases.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.permanentId.toLowerCase().includes(q) ||
          c.institutionName.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.bureau.toLowerCase().includes(q)
      ).slice(0, 5)
    : cases.slice(0, 3);

  const filteredInstitutions = q
    ? institutions.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.permanentId.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q) ||
          i.region.toLowerCase().includes(q)
      ).slice(0, 4)
    : institutions.slice(0, 2);

  const filteredOverlaps = q
    ? overlaps.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.institutionName.toLowerCase().includes(q) ||
          o.triggerReason.toLowerCase().includes(q)
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#050B16]/75 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24">
      <button
        type="button"
        className="fixed inset-0 h-full w-full cursor-default"
        onClick={() => setCommandPaletteOpen(false)}
        aria-label="Close command palette"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search records"
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700/80 bg-[#101D35] text-slate-100 shadow-2xl shadow-black/40"
      >
        {/* Search Input Box */}
        <div className="flex items-center border-b border-slate-700/80 bg-[#0B1730]/80 px-4 py-3.5">
          <Search className="mr-3 h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type case ID, institution name, or AICTE PID (e.g. 1-438920194)..."
            aria-label="Search cases, institutions, and overlaps"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            aria-label="Close search"
            className="ml-2 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-3 text-xs">
          {/* Cases */}
          {filteredCases.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <FileText className="h-3.5 w-3.5 text-blue-300" aria-hidden="true" />
                <span>Complaints &amp; Cases</span>
              </div>
              <div className="space-y-1">
                {filteredCases.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleSelectCase(c.id)}
                    className="group flex w-full items-center justify-between rounded-xl border border-transparent p-2.5 text-left transition-colors hover:border-blue-400/20 hover:bg-[#172844] focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-slate-100">{c.id}</span>
                        <span className="rounded border border-slate-600/70 bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                          {c.bureau}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">PID: {c.permanentId}</span>
                      </div>
                      <p className="mt-0.5 truncate text-slate-300">{c.institutionName}</p>
                      <p className="truncate text-[11px] text-slate-500">{c.subject}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-blue-300" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Institutions */}
          {filteredInstitutions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Building2 className="h-3.5 w-3.5 text-blue-300" aria-hidden="true" />
                <span>AICTE Approved Institutions</span>
              </div>
              <div className="space-y-1">
                {filteredInstitutions.map((inst) => (
                  <button
                    type="button"
                    key={inst.id}
                    onClick={() => handleSelectInstitution(inst.id)}
                    className="group flex w-full items-center justify-between rounded-xl border border-transparent p-2.5 text-left transition-colors hover:border-blue-400/20 hover:bg-[#172844] focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-slate-100">{inst.name}</span>
                        <span className="rounded border border-blue-400/25 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-200">
                          {inst.permanentId}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {inst.city}, {inst.state} ({inst.region} Region) • {inst.activeCases} active complaints
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-blue-300" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Overlaps */}
          {filteredOverlaps.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <GitMerge className="h-3.5 w-3.5 text-purple-300" aria-hidden="true" />
                <span>Potential Cross-Bureau Overlaps</span>
              </div>
              <div className="space-y-1">
                {filteredOverlaps.map((ov) => (
                  <button
                    type="button"
                    key={ov.id}
                    onClick={() => handleSelectOverlap(ov.id)}
                    className="group flex w-full items-center justify-between rounded-xl border border-transparent p-2.5 text-left transition-colors hover:border-purple-400/20 hover:bg-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-400/60"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-purple-200">{ov.id}</span>
                        <span className="rounded border border-purple-400/25 bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-purple-200">
                          {ov.severity} Severity
                        </span>
                        <span className="truncate text-slate-300">{ov.institutionName}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{ov.triggerReason}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-purple-300" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredCases.length === 0 && filteredInstitutions.length === 0 && filteredOverlaps.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <Search className="mx-auto mb-3 h-6 w-6 text-slate-600" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-200">No matching records found</p>
              <p className="mt-1 text-xs text-slate-500">
                No results for &quot;{query}&quot;. Try a PID number or bureau name.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-700/80 bg-[#0B1730]/80 px-4 py-2 text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>
              Press <kbd className="rounded border border-slate-600 bg-[#172844] px-1.5 py-0.5 font-mono text-slate-300">ESC</kbd> to exit
            </span>
          </div>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3 text-slate-500" aria-hidden="true" /> Click any result to view details
          </span>
        </div>
      </div>
    </div>
  );
};
