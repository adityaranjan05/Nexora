import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, AlertTriangle, GitMerge, Check, CheckCheck, RefreshCw, Clock } from 'lucide-react';
import { officerApi } from '../../../shared/api/officerApi';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function OfficerAlertsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['officer-alerts'],
    queryFn: officerApi.getAlerts,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => officerApi.markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['officer-alerts']);
      refetch();
    },
  });

  const alerts = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Statutory Monitoring Alerts</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {unreadCount} Unread
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            SLA overdue warnings, high-severity overlap occurrences, and regulatory escalation alerts.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101D35] hover:bg-[#172846] border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="flex-1 min-h-0 bg-[#0B1730] border border-slate-700/80 rounded-2xl overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-4">
            <SkeletonLoader count={6} />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Bell className="w-12 h-12 text-slate-500 mb-2" />
            <h3 className="text-base font-bold text-white">No active alerts</h3>
            <p className="text-xs text-slate-400 mt-1">All SLA thresholds are compliant and no critical escalations require attention.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.map((item) => {
              const alert = item.alert || {};
              const isOverdue = alert.alertType?.includes('breach') || alert.severity === 'high';

              return (
                <div
                  key={item.notificationId || alert._id}
                  className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                    item.isRead
                      ? 'bg-[#101D35] border-slate-700/80 opacity-75'
                      : 'bg-[#101D35] border-blue-500/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isOverdue
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-[#F59E0B]/30'
                      }`}
                    >
                      {isOverdue ? <AlertTriangle className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {alert.alertType?.replace(/_/g, ' ')?.toUpperCase() || 'SYSTEM ALERT'}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold capitalize ${
                            alert.severity === 'high'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {alert.severity || 'Medium'} Severity
                        </span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed">{alert.message}</p>

                      <div className="text-[10px] text-slate-400 flex items-center gap-3">
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        {alert.case?.caseId && (
                          <span>Docket: <span className="font-mono text-white">{alert.case.caseId}</span></span>
                        )}
                        {alert.institution?.name && (
                          <span>Institution: <span className="text-white">{alert.institution.name}</span></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!item.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(item.notificationId || alert._id)}
                      className="px-2.5 py-1 rounded-lg bg-[#172846] hover:bg-[#203453] text-xs text-slate-300 hover:text-white transition shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Dismiss</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerAlertsPage;