import React, { useState, useMemo } from 'react';
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
        <AlertTriangle className="w-3 h-3 mr-1 text-rose-600" />
        High Risk
      </span>
    );
  }
  if (riskScore >= 40) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
        Moderate Attention
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
      <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-100 font-sans">
            AICTE Approved Institutions Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor institutional compliance history, cross-bureau dockets, and risk indicators.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-subtle flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name, AICTE Permanent ID, or city..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto text-xs">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r} Region</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* State Rendering */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading institutions directory...</p>
        </div>
      )}

      {isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-900">Failed to load institutions</h3>
          <p className="text-xs text-slate-500 mt-1">{error?.message || 'Server error'}</p>
          <button onClick={() => refetch()} className="mt-3 text-xs font-semibold text-teal-700 hover:underline">
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && institutions.length === 0 && (
        <div className="py-16 bg-white rounded-xl border border-slate-200 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No institutions found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Institution Cards Grid */}
      {!isLoading && !isError && institutions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {institutions.map((inst) => (
            <div
              key={inst._id}
              onClick={() => navigate(`/institutions/${inst._id}`)}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle hover:border-teal-500 hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 truncate max-w-[60%]">
                    {inst.aictePermanentId || 'PID Unassigned'}
                  </span>
                  {getComplianceBadge(inst.riskScore || 0)}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2.5 group-hover:text-teal-700 transition-colors line-clamp-2">
                  {inst.name}
                </h3>

                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{inst.city}, {inst.state} ({inst.region} Region)</span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <p className="text-[11px] text-slate-400">Type:</p>
                  <p className="text-slate-700 font-medium mt-0.5">{inst.type || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Open Dockets:</span>
                  <span className={`ml-1 font-mono font-bold ${(inst.openCasesCount || 0) > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {inst.openCasesCount || 0} Active
                  </span>
                </div>

                <span className="text-teal-700 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
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
