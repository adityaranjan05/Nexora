import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerInstitutionsPage() {
  const navigate = useNavigate();

  const [q, setQ] = useState('');
  const [region, setRegion] = useState('All');
  const [debouncedQ, setDebouncedQ] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(timer);
  }, [q]);

  const params = {
    q: debouncedQ || undefined,
    region: region !== 'All' ? region : undefined,
    limit: 100,
  };

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['officer-institutions', params],
    queryFn: () => officerApi.getInstitutions(params),
  });

  const institutions = data?.data || [];

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Approved Institutions Registry</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#151618] text-[#A1A1AA] border border-[#232427]">
              {institutions.length} Institutes
            </span>
          </h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            AICTE permanent approved colleges, polytechnics, and universities across all statutory regions.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151618] hover:bg-[#1A1B1E] border border-[#232427] text-xs font-medium text-[#A1A1AA] hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#00E676]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121315] border border-[#232427] rounded-xl p-3 mb-4 shrink-0 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search institute name, permanent ID, or city..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#151618] border border-[#232427] rounded-lg text-xs text-white placeholder-[#52525B] focus:outline-none focus:border-[#00E676]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="py-1.5 px-3 bg-[#151618] border border-[#232427] rounded-lg text-xs text-white focus:outline-none focus:border-[#00E676]"
          >
            <option value="All">All Regions</option>
            <option value="Northern">Northern</option>
            <option value="Southern">Southern</option>
            <option value="Western">Western</option>
            <option value="Eastern">Eastern</option>
            <option value="Central">Central</option>
          </select>
          {(q || region !== 'All') && (
            <button
              onClick={() => {
                setQ('');
                setRegion('All');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#1F2023] text-[11px] text-[#A1A1AA] hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Institutions Table */}
      <div className="flex-1 min-h-0 bg-[#121315] border border-[#232427] rounded-2xl overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-4">
            <SkeletonLoader count={8} />
          </div>
        ) : institutions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Building2 className="w-10 h-10 text-[#52525B] mb-2" />
            <h3 className="text-sm font-semibold text-white">No institutions match your search</h3>
            <p className="text-xs text-[#71717A] mt-1">Try another keyword or select All Regions.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#0F1011] border-b border-[#232427] z-10 text-[#71717A] text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Permanent ID</th>
                  <th className="py-2.5 px-3">Institution Name</th>
                  <th className="py-2.5 px-3">Region</th>
                  <th className="py-2.5 px-3">City &amp; State</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2023]">
                {institutions.map((inst) => (
                  <tr
                    key={inst._id}
                    onClick={() => navigate(`/officer/institutions/${inst._id}`)}
                    className="hover:bg-[#151618] transition cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#00E676] whitespace-nowrap">
                      {inst.aictePermanentId}
                    </td>
                    <td className="py-3 px-3 font-semibold text-white max-w-sm truncate">
                      {inst.name}
                    </td>
                    <td className="py-3 px-3 text-[#A1A1AA]">{inst.region}</td>
                    <td className="py-3 px-3 text-[#71717A]">
                      {inst.city}, {inst.state}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/officer/institutions/${inst._id}`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#151618] group-hover:bg-[#00E676] text-[#A1A1AA] group-hover:text-black border border-[#232427] group-hover:border-[#00E676] text-[11px] font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerInstitutionsPage;
