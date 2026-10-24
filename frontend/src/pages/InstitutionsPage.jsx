import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Search, 
  MapPin, 
  ArrowRight,
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  AlertCircle, 
  RefreshCw 
} from 'lucide-react';
import { institutionsApi } from '../api/client';

const getComplianceBadge = (riskScore) => {
  if (riskScore >= 70) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF4D79]/20 text-[#FF4D79] border border-[#FF4D79]/40 uppercase">
        <AlertTriangle className="w-3 h-3 mr-1 text-[#FF4D79]" />
        High Risk
      </span>
    );
  }
  if (riskScore >= 40) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 uppercase">
        Moderate
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#19D3A2]/20 text-[#19D3A2] border border-[#19D3A2]/40 uppercase">
      <ShieldCheck className="w-3 h-3 mr-1 text-[#19D3A2]" />
      Good Standing
    </span>
  );
};

export const InstitutionsPage = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const params = {};
  if (debouncedSearch) params.q = debouncedSearch;
  if (regionFilter !== 'All') params.region = regionFilter;
  if (typeFilter !== 'All') params.type = typeFilter;
  params.limit = 200;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['institutions', params],
    queryFn: () => institutionsApi.getInstitutions(params),
  });

  const institutions = data?.data || [];

  const regions = ['All', 'Southern', 'Western', 'Northern', 'South-Western', 'Central', 'Eastern', 'North-West'];
  const types = ['All', 'Govt', 'Govt-Aided', 'Self-Financing', 'Deemed University'];

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-panel p-4 sm:p-6 space-y-5 select-none-off text-[#F4F4F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] font-sans tracking-tight">
            AICTE Approved Institutions Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
            Monitor institutional compliance history, cross-bureau dockets, and risk indicators.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#F4F4F5] bg-[#151618] border border-[#232427] rounded-lg hover:bg-[#1A1B1E] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#71717A]" />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#151618] rounded-card border border-[#232427] p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name, AICTE Permanent ID, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] placeholder:text-[#71717A] focus:outline-none focus:border-[#00E676]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto text-xs">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none"
          >
            {regions.map((r) => (
              <option key={r} value={r} className="bg-[#151618]">{r} Region</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#0F1011] border border-[#232427] rounded-lg text-[#F4F4F5] focus:outline-none"
          >
            {types.map((t) => (
              <option key={t} value={t} className="bg-[#151618]">{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* State Rendering */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 bg-[#151618] rounded-card border border-[#232427]">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E676] mb-3" />
          <p className="text-sm font-medium text-[#71717A]">Loading institutions directory...</p>
        </div>
      )}

      {isError && (
        <div className="bg-[#151618] border border-[#FF4D79]/30 rounded-card p-6 text-center">
          <AlertCircle className="w-8 h-8 text-[#FF4D79] mx-auto mb-2" />
          <h3 className="text-sm font-bold text-[#F4F4F5]">Failed to load institutions</h3>
          <p className="text-xs text-[#71717A] mt-1">{error?.message || 'Server error'}</p>
          <button onClick={() => refetch()} className="mt-3 text-xs font-semibold text-[#00E676] hover:underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && institutions.length === 0 && (
        <div className="py-16 bg-[#151618] rounded-card border border-[#232427] text-center">
          <Building2 className="w-10 h-10 text-[#71717A] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[#F4F4F5]">No institutions found</p>
          <p className="text-xs text-[#71717A] mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Institution Cards Grid */}
      {!isLoading && !isError && institutions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {institutions.map((inst) => (
            <div
              key={inst._id}
              onClick={() => navigate(`/institutions/${inst._id}`)}
              className="bg-[#151618] rounded-card border border-[#232427] p-5 hover:border-[#2D2E32] hover:bg-[#1A1B1E] transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#0F1011] text-[#A1A1AA] rounded border border-[#232427] truncate max-w-[60%]">
                    {inst.aictePermanentId || 'PID Unassigned'}
                  </span>
                  {getComplianceBadge(inst.riskScore || 0)}
                </div>

                <h3 className="text-sm font-bold text-[#F4F4F5] mt-2.5 group-hover:text-[#00E676] transition-colors line-clamp-2">
                  {inst.name}
                </h3>

                <div className="flex items-center text-xs text-[#71717A] mt-1 space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                  <span className="truncate">{inst.city}, {inst.state} ({inst.region} Region)</span>
                </div>

                <div className="mt-3 pt-3 border-t border-[#232427] text-xs text-[#A1A1AA]">
                  <p className="text-[10px] text-[#71717A] uppercase font-semibold">Type:</p>
                  <p className="text-[#F4F4F5] font-medium mt-0.5">{inst.type || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#232427] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-[#71717A]">Open Dockets:</span>
                  <span className={`ml-1 font-mono font-bold ${(inst.openCasesCount || 0) > 0 ? 'text-[#FF4D79]' : 'text-[#A1A1AA]'}`}>
                    {inst.openCasesCount || 0} Active
                  </span>
                </div>

                <span className="text-[#00E676] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>View Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionsPage;
