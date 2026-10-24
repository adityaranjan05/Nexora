import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Users, 
  Clock, 
  ShieldCheck, 
  Save, 
  Loader2, 
  AlertCircle,
  Sliders
} from 'lucide-react';
import { adminApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const AdministrationPage = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useApp();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('sla');
  const [matchingThreshold, setMatchingThreshold] = useState(85);
  const [autoFlagOverlapDays, setAutoFlagOverlapDays] = useState(60);

  // SLA local edits state
  const [slaEdits, setSlaEdits] = useState({});

  // Queries
  const { 
    data: slaData, 
    isLoading: isSlaLoading, 
    isError: isSlaError, 
    error: slaError 
  } = useQuery({
    queryKey: ['admin-sla-rules'],
    queryFn: adminApi.getSlaRules,
  });

  const { 
    data: usersData, 
    isLoading: isUsersLoading, 
    isError: isUsersError, 
    error: usersError 
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  const rulesList = slaData?.data || [];

  // Initialize or sync slaEdits when rulesList loads
  useEffect(() => {
    if (rulesList.length > 0) {
      const initial = {};
      rulesList.forEach((rule) => {
        initial[rule.category] = {
          daysToDispose: rule.daysToDispose || 30,
          reminderAfterDays: rule.reminderAfterDays || 7,
          dueSoonDays: rule.dueSoonDays || 3,
          escalateAfterDaysOverdue: rule.escalateAfterDaysOverdue || 7,
        };
      });
      setSlaEdits(initial);
    }
  }, [rulesList]);

  // Save SLA Rule Mutation
  const saveSlaMutation = useMutation({
    mutationFn: async (category) => {
      const edit = slaEdits[category];
      if (!edit) return;
      return await adminApi.updateSlaRule({
        category,
        daysToDispose: edit.daysToDispose,
        reminderAfterDays: edit.reminderAfterDays,
        dueSoonDays: edit.dueSoonDays,
        escalateAfterDaysOverdue: edit.escalateAfterDaysOverdue,
      });
    },
    onSuccess: (data, category) => {
      addToast('Rule Saved', `SLA rule for "${category}" updated`, 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-sla-rules'] });
    },
    onError: (err) => {
      addToast('Save Failed', err?.response?.data?.message || 'Failed to update rule', 'danger');
    },
  });

  // Save All SLA Rules
  const handleSaveAll = async () => {
    try {
      for (const rule of rulesList) {
        const edit = slaEdits[rule.category];
        if (edit) {
          await adminApi.updateSlaRule({
            category: rule.category,
            daysToDispose: edit.daysToDispose,
            reminderAfterDays: edit.reminderAfterDays,
            dueSoonDays: edit.dueSoonDays,
            escalateAfterDaysOverdue: edit.escalateAfterDaysOverdue,
          });
        }
      }
      addToast('Configuration Saved', 'All statutory SLA thresholds and rules updated', 'success');
      queryClient.invalidateQueries({ queryKey: ['admin-sla-rules'] });
    } catch (err) {
      addToast('Save Error', err?.response?.data?.message || 'Failed to save all settings', 'danger');
    }
  };

  const handleSlaDaysChange = (category, value) => {
    setSlaEdits((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        daysToDispose: Number(value),
      },
    }));
  };

  const usersList = usersData?.data || [];

  return (
    <div className="h-full w-full overflow-y-auto bg-[#0F1011] border border-[#232427] rounded-panel p-4 sm:p-6 space-y-6 text-[#F4F4F5]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F4F4F5] font-sans tracking-tight">
            System Administration & Policy Rules
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] mt-0.5">
            Configure statutory resolution deadlines, institutional matching algorithms, and security roles.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-black bg-[#00E676] hover:bg-[#00c864] rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Policy Configuration</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#232427] pb-3 text-xs">
        <button
          onClick={() => setActiveTab('sla')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'sla'
              ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold border border-[#2D2E32]'
              : 'bg-[#151618] text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#1A1B1E] border border-[#232427]'
          }`}
        >
          SLA Statutory Rules
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'matching'
              ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold border border-[#2D2E32]'
              : 'bg-[#151618] text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#1A1B1E] border border-[#232427]'
          }`}
        >
          Institution Matching & Overlap Engine
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#1F2023] text-[#F4F4F5] font-semibold border border-[#2D2E32]'
              : 'bg-[#151618] text-[#71717A] hover:text-[#F4F4F5] hover:bg-[#1A1B1E] border border-[#232427]'
          }`}
        >
          Authorized Users & Roles
        </button>
      </div>

      {/* TAB 1: SLA Statutory Rules */}
      {activeTab === 'sla' && (
        <div className="bg-[#151618] rounded-xl border border-[#232427] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F4F4F5]">Mandatory Category Resolution Deadlines</h3>
              <p className="text-xs text-[#71717A] mt-0.5">
                Default statutory SLA limits applied during automated intake before an escalation warning fires.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#A1A1AA] bg-[#1F2023] border border-[#232427] px-2.5 py-1 rounded">
              {rulesList.length} Categories Configured
            </span>
          </div>

          {isSlaLoading && (
            <div className="py-12 flex justify-center items-center text-[#71717A] text-xs">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#00E676]" />
              Loading SLA policy rules...
            </div>
          )}

          {isSlaError && (
            <div className="p-4 bg-[#FF4D79]/10 text-[#FF4D79] text-xs flex items-center space-x-2 rounded-lg border border-[#FF4D79]/30">
              <AlertCircle className="w-4 h-4 text-[#FF4D79] shrink-0" />
              <span>Failed to load SLA rules: {slaError?.message}</span>
            </div>
          )}

          {!isSlaLoading && !isSlaError && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F1011] border-b border-[#232427] text-[#71717A] font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Complaint Category</th>
                    <th className="py-2.5 px-3">Designated Bureau</th>
                    <th className="py-2.5 px-3">Statutory Timeline (Days)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232427]">
                  {rulesList.map((item) => {
                    const currentVal = slaEdits[item.category]?.daysToDispose ?? item.daysToDispose;
                    return (
                      <tr key={item._id || item.category} className="hover:bg-[#1A1B1E]/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#F4F4F5]">{item.category}</td>
                        <td className="py-2.5 px-3 text-[#A1A1AA]">
                          {item.bureau?.name || item.bureau?.code || 'Lead Bureau'}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={currentVal}
                              onChange={(e) => handleSlaDaysChange(item.category, e.target.value)}
                              className="w-20 px-2 py-1 bg-[#0A0A0B] border border-[#232427] rounded font-mono font-bold text-[#F4F4F5] text-xs focus:outline-none focus:border-[#00E676] focus:ring-1 focus:ring-[#00E676]"
                            />
                            <span className="text-[#71717A]">Calendar Days</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            disabled={saveSlaMutation.isPending}
                            onClick={() => saveSlaMutation.mutate(item.category)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#00E676] bg-[#00E676]/10 hover:bg-[#00E676]/20 rounded border border-[#00E676]/30 transition-colors cursor-pointer"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Matching & Overlap Engine */}
      {activeTab === 'matching' && (
        <div className="bg-[#151618] rounded-xl border border-[#232427] p-5 space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-[#F4F4F5]">Fuzzy Institution Matching Threshold</h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Determines confidence cutoff for automated resolution vs routing into Human Match Review queue.
            </p>

            <div className="mt-4 p-4 bg-[#0F1011] rounded-lg border border-[#232427] max-w-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#F4F4F5]">Auto-Match Confidence Threshold:</span>
                <span className="font-mono text-base font-bold text-[#00E676]">{matchingThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                value={matchingThreshold}
                onChange={(e) => setMatchingThreshold(Number(e.target.value))}
                className="w-full accent-[#00E676] cursor-pointer"
              />
              <p className="text-[11px] text-[#71717A]">
                Matches with confidence &lt; {matchingThreshold}% require human officer confirmation before case registration.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#232427]">
            <h3 className="text-sm font-bold text-[#F4F4F5]">Cross-Bureau Overlap Correlation Window</h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Timeframe within which concurrent cases against the same Permanent ID trigger an Overlap Alert.
            </p>

            <div className="mt-4 p-4 bg-[#0F1011] rounded-lg border border-[#232427] max-w-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#F4F4F5]">Lookback Window:</span>
                <span className="font-mono text-base font-bold text-[#A78BFA]">{autoFlagOverlapDays} Days</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={autoFlagOverlapDays}
                onChange={(e) => setAutoFlagOverlapDays(Number(e.target.value))}
                className="w-full accent-[#7C3AED] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Users & Roles */}
      {activeTab === 'users' && (
        <div className="bg-[#151618] rounded-xl border border-[#232427] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#F4F4F5]">AICTE Nodal Officers & Access Hierarchy</h3>
              <p className="text-xs text-[#71717A] mt-0.5">Role permissions enforce multi-bureau confidentiality and action authority.</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#A1A1AA] bg-[#1F2023] border border-[#232427] px-2.5 py-1 rounded">
              {usersList.length} Active Accounts
            </span>
          </div>

          {isUsersLoading && (
            <div className="py-12 flex justify-center items-center text-[#71717A] text-xs">
              <Loader2 className="w-6 h-6 animate-spin mr-2 text-[#00E676]" />
              Loading authorized officers...
            </div>
          )}

          {isUsersError && (
            <div className="p-4 bg-[#FF4D79]/10 text-[#FF4D79] text-xs flex items-center space-x-2 rounded-lg border border-[#FF4D79]/30">
              <AlertCircle className="w-4 h-4 text-[#FF4D79] shrink-0" />
              <span>Failed to load users: {usersError?.message}</span>
            </div>
          )}

          {!isUsersLoading && !isUsersError && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F1011] border-b border-[#232427] text-[#71717A] font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Official Name</th>
                    <th className="py-2.5 px-3">Role Designation</th>
                    <th className="py-2.5 px-3">Bureau / Mandate</th>
                    <th className="py-2.5 px-3">Official Email</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232427]">
                  {usersList.map((user) => (
                    <tr key={user._id || user.id} className="hover:bg-[#1A1B1E]/60 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-[#F4F4F5]">{user.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-[#1F2023] border border-[#2D2E32] rounded text-[#A1A1AA] font-mono text-[11px]">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#A1A1AA]">
                        {user.bureau?.name || user.bureau?.code || user.region || 'Central HQ'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#71717A]">{user.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center text-[10px] font-bold text-[#19D3A2] bg-[#19D3A2]/10 px-2 py-0.5 rounded border border-[#19D3A2]/30">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdministrationPage;
