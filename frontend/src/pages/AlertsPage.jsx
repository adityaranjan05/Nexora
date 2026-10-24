import React, { useState } from 'react';
import { motion } from 'motion/react';
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
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'deadline_approaching':
        return <Clock className="w-4 h-4 text-amber-300" />;
      case 'overlap':
        return <GitMerge className="w-4 h-4 text-purple-300" />;
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'transfer':
        return <ArrowRightLeft className="w-4 h-4 text-indigo-300" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-300 border border-rose-500/30">
            Critical Action
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Warning
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-700/60 text-slate-300 border border-slate-300">
            Notice
          </span>
        );
    }
  };

  return (
    <motion.div className="space-y-6 text-slate-200" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">
            Operational Alerts Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time notifications for statutory SLA breaches, imminent deadlines, and cross-bureau conflicts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#111F3A] border border-slate-700 rounded-lg hover:bg-[#0B1730] shadow-subtle transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || alerts.filter((a) => !a.isRead).length === 0}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-[#111F3A] border border-slate-700 rounded-lg hover:bg-[#0B1730] shadow-subtle transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-blue-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs & Filter Bar */}
      <motion.div className="bg-[#101D35] rounded-xl border border-slate-700/80 p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3 text-xs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.06 }}>
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Unread', 'Overlaps', 'SLA', 'Escalations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:bg-slate-700/60'
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
            className="px-2 py-1 bg-[#0B1730] border border-slate-700/80 rounded text-slate-300 text-xs focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </motion.div>

      {/* Alerts List */}
      {isLoading ? (
        <motion.div className="flex flex-col items-center justify-center py-16 bg-[#101D35] rounded-xl border border-slate-700/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
          <p className="text-sm font-medium text-slate-400">Loading alerts...</p>
        </motion.div>
      ) : isError ? (
        <motion.div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-rose-300">Failed to load alerts</h3>
          <p className="text-xs text-slate-400 mt-1">{error?.message || 'Server error'}</p>
          <button onClick={() => refetch()} className="mt-3 text-xs font-semibold text-blue-300 hover:underline">
            Retry
          </button>
        </motion.div>
      ) : (
        <motion.div className="bg-[#101D35] rounded-xl border border-slate-700/80 shadow-subtle divide-y divide-slate-700/70 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(filteredAlerts.indexOf(alert) * 0.035, 0.25) }}
                whileHover={{ backgroundColor: "#0B1730" }}
                onClick={() => {
                  markReadMutation.mutate(alert._id);
                  if (alert.type === 'overlap') {
                    navigate('/overlaps');
                  } else if (alert.case) {
                    navigate(`/cases/${typeof alert.case === 'string' ? alert.case : alert.case._id}`);
                  }
                }}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-[#0B1730] transition-colors ${
                  !alert.isRead ? 'bg-amber-500/10/20' : ''
                }`}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-500/10 border border-rose-500/30'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-indigo-500/10 border border-indigo-500/30'
                  }`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className={`text-xs sm:text-sm font-bold ${
                        alert.severity === 'critical' ? 'text-rose-300' : 'text-slate-100'
                      }`}>
                        {alert.title}
                      </h3>
                      {getSeverityBadge(alert.severity)}
                      {!alert.isRead && (
                        <span className="inline-block w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {alert.description || alert.message}
                    </p>

                    <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {alert.institution?.name || 'AICTE Central Registry'}
                      </span>
                      {alert.case && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-blue-300 font-semibold">
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
                  <span className="text-xs font-semibold text-blue-300 hover:text-blue-200 hidden sm:inline-flex items-center gap-1">
                    <span>Inspect Docket</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div className="p-12 text-center text-slate-400 text-xs" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              No operational alerts matching active filter criteria.
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
