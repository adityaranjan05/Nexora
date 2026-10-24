import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  CheckCheck,
} from 'lucide-react';
import { bureauApi } from '../../../shared/api/bureauApi';
import { SkeletonLoader } from '../../../shared/components/SkeletonLoader';

export function BureauAlertsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['bureau', 'alerts'],
    queryFn: () => bureauApi.getAlerts(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => bureauApi.markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bureau', 'alerts']);
    },
  });

  const alerts = data?.data || [];
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded bg-[#6C7BFF]/15 text-[#6C7BFF] border border-[#6C7BFF]/30">
              Operational Alerts
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bureau Notifications</h1>
          <p className="text-xs text-[#71717A] mt-0.5">
            SLA breach warnings, student replies, and assignment notifications for your bureau.
          </p>
        </div>

        {unreadAlerts.length > 0 && (
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#6C7BFF]/15 text-[#6C7BFF] border border-[#6C7BFF]/30">
            {unreadAlerts.length} unread notification{unreadAlerts.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="bg-[#0F1011] border border-[#232427] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <SkeletonLoader className="h-14 w-full" />
            <SkeletonLoader className="h-14 w-full" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="w-12 h-12 text-[#71717A] mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-semibold text-white">All clear!</h3>
            <p className="text-xs text-[#71717A] mt-1">No alerts or warnings active for your bureau.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1F2023]">
            {alerts.map((alert) => {
              const isUrgent = alert.severity === 'critical' || alert.severity === 'high';
              return (
                <div
                  key={alert._id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    alert.isRead ? 'opacity-60 bg-[#0F1011]' : 'bg-[#151618]/60 hover:bg-[#151618]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isUrgent
                          ? 'bg-[#FF4D79]/15 text-[#FF4D79]'
                          : 'bg-[#6C7BFF]/15 text-[#6C7BFF]'
                      }`}
                    >
                      {isUrgent ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {alert.title || alert.type || 'Bureau Notification'}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#6C7BFF]" />
                        )}
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        {alert.message || alert.content}
                      </p>
                      <div className="text-[10px] text-[#71717A] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!alert.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(alert._id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#232427] hover:bg-[#2E3035] text-[#A1A1AA] hover:text-white transition-colors shrink-0 flex items-center gap-1"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Read</span>
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

export default BureauAlertsPage;
