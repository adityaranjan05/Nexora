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

  const q = query.toLowerCase().trim();

  const caseList = cases || [];
  const instList = institutions || [];
  const overlapList = overlaps || [];

  const filteredCases = q
    ? caseList.filter(
        (c) =>
          (c.id || c.caseId || '').toLowerCase().includes(q) ||
          (c.permanentId || c.institution?.aictePermanentId || '').toLowerCase().includes(q) ||
          (c.institutionName || c.institution?.name || '').toLowerCase().includes(q) ||
          (c.subject || c.category || '').toLowerCase().includes(q) ||
          (c.bureau || c.currentBureau?.name || '').toLowerCase().includes(q)
      ).slice(0, 5)
    : caseList.slice(0, 3);

  const filteredInstitutions = q
    ? instList.filter(
        (i) =>
          (i.name || '').toLowerCase().includes(q) ||
          (i.permanentId || i.aictePermanentId || '').toLowerCase().includes(q) ||
          (i.city || '').toLowerCase().includes(q) ||
          (i.region || '').toLowerCase().includes(q)
      ).slice(0, 4)
    : instList.slice(0, 2);

  const filteredOverlaps = q
    ? overlapList.filter(
        (o) =>
          (o.id || o._id || '').toLowerCase().includes(q) ||
          (o.institutionName || o.institution?.name || '').toLowerCase().includes(q) ||
          (o.triggerReason || '').toLowerCase().includes(q)
      ).slice(0, 3)
    : overlapList.slice(0, 2);

  const handleSelectCase = (caseObj) => {
    setCommandPaletteOpen(false);
    const targetId = caseObj._id || caseObj.id || caseObj.caseId;
    navigate(`/cases/${encodeURIComponent(targetId)}`);
  };

  const handleSelectInstitution = (instObj) => {
    setCommandPaletteOpen(false);
    const targetId = instObj._id || instObj.id;
    navigate(`/institutions/${targetId}`);
  };

  const handleSelectOverlap = () => {
    setCommandPaletteOpen(false);
    navigate('/overlaps');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div 
        className="fixed inset-0"
        onClick={() => setCommandPaletteOpen(false)}
        aria-hidden="true"
      />
      <div 
        className="relative w-full max-w-2xl bg-[#101D35] rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden z-10 text-slate-100">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-700/80 bg-[#172846]">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type case ID, institution name, or AICTE PID (e.g. 1-438920194)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
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
                {filteredCases.map((c, idx) => (
                  <div
                    key={c._id || c.id || idx}
                    onClick={() => handleSelectCase(c)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#172846] cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-100">{c.caseId || c.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600 font-medium text-slate-300">
                          {c.currentBureau?.name || c.currentBureau?.code || c.bureau || 'Bureau'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          PID: {c.institution?.aictePermanentId || c.permanentId || 'N/A'}
                        </span>
                      </div>
                      <p className="text-slate-300 truncate mt-0.5">{c.institution?.name || c.institutionName}</p>
                      <p className="text-slate-400 text-[11px] truncate">{c.subject || c.category}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-300 shrink-0" />
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
                {filteredInstitutions.map((inst, idx) => (
                  <div
                    key={inst._id || inst.id || idx}
                    onClick={() => handleSelectInstitution(inst)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#172846] cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-100 truncate">{inst.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/30">
                          {inst.aictePermanentId || inst.permanentId}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {inst.city}, {inst.state} ({inst.region} Region)
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-300 shrink-0" />
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
                {filteredOverlaps.map((ov, idx) => (
                  <div
                    key={ov._id || ov.id || idx}
                    onClick={() => handleSelectOverlap()}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-500/10 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-200">
                          OVL-{(ov._id || ov.id || '').slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30">
                          {ov.severity || 'High'} Severity
                        </span>
                        <span className="text-slate-300 truncate">{ov.institution?.name || ov.institutionName}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] truncate mt-0.5">{ov.triggerReason}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCases.length === 0 && filteredInstitutions.length === 0 && filteredOverlaps.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found for "{query}". Try searching by PID number (e.g. 1-438920194) or bureau.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-[#172846] border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-[#101D35] border border-slate-700/80 rounded font-mono text-slate-300">ESC</kbd> to exit</span>
          </div>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3 text-slate-500" /> Click any result to view details
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;