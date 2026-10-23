import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
  CheckCheck, 
  AlertOctagon, 
  Clock, 
  GitMerge, 
  AlertTriangle, 
  ArrowRightLeft, 
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { alertsApi } from '../api/client';
import { useApp } from '../context/AppContext';

export const AlertsPage = () => {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAlerts,
    refetchInterval: 60000, // auto-refresh every minute
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => alertsApi.markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = (data?.data || []).filter((a) => !a.isRead);
      await Promise.all(unread.map((a) => alertsApi.markAlertRead(a._id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      addToast('Alerts Cleared', 'All alerts marked as read', 'success');
    },
  });

  const alerts = data?.data || [];

  const filteredAlerts = alerts.filter((a) => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Unread' && !a.isRead) ||
      (activeTab === 'Overlaps' && a.type === 'overlap') ||
      (activeTab === 'SLA' && (a.type === 'sla_breach' || a.type === 'deadline_approaching')) ||
      (activeTab === 'Escalations' && a.type === 'escalation');

    const matchesSeverity = filterSeverity === 'All' || a.severity === filterSeverity;

    return matchesTab && matchesSeverity;
  });

  const getAlertIcon = (type) => {
    switch (type) {
      case 'sla_breach':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'deadline_approaching':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'overlap':
        return <GitMerge className="w-4 h-4 text-purple-600" />;
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300">
            Critical Action
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            Warning
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-100 text-slate-700 border border-slate-300">
            Notice
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">
            Operational Alerts Centre
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Real-time notifications for statutory SLA breaches, imminent deadlines, and cross-bureau conflicts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || alerts.filter((a) => !a.isRead).length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-subtle transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-teal-600" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Unread', 'Overlaps', 'SLA', 'Escalations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
              {tab === 'Unread' && alerts.filter((a) => !a.isRead).length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  {alerts.filter((a) => !a.isRead).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading alerts...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-900">Failed to load alerts</h3>
          <p className="text-xs text-slate-500 mt-1">{error?.message || 'Server error'}</p>
          <button onClick={() => refetch()} className="mt-3 text-xs font-semibold text-teal-700 hover:underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle divide-y divide-slate-100 overflow-hidden">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert._id}
                onClick={() => {
                  markReadMutation.mutate(alert._id);
                  if (alert.type === 'overlap') {
                    navigate('/overlaps');
                  } else if (alert.case) {
                    navigate(`/cases/${typeof alert.case === 'string' ? alert.case : alert.case._id}`);
                  }
                }}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                  !alert.isRead ? 'bg-amber-50/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-50 border border-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-indigo-50 border border-indigo-200'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className={`text-xs sm:text-sm font-bold ${
                        alert.severity === 'critical' ? 'text-rose-900' : 'text-slate-900'
                      }`}>
                        {alert.title}
                      </h3>
                      {getSeverityBadge(alert.severity)}
                      {!alert.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {alert.description || alert.message}
                    </p>

                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">
                        {alert.institution?.name || 'AICTE Central Registry'}
                      </span>
                      {alert.case && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-teal-700 font-semibold">
                            {typeof alert.case === 'string' ? alert.case : alert.case?.caseId}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  <span className="text-xs font-semibold text-teal-700 hover:text-teal-900 hidden sm:inline-flex items-center gap-1">
                    <span>Inspect Docket</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs">
              No operational alerts matching active filter criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
