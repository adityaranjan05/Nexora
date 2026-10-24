import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  casesApi, 
  institutionsApi, 
  overlapsApi, 
  alertsApi, 
  matchReviewApi,
  adminApi
} from '../api/client';
import { useAuth } from './AuthContext';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();

  const [cases, setCases] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [overlaps, setOverlaps] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [matchReviews, setMatchReviews] = useState([]);
  const [bureaus, setBureaus] = useState([]);
  
  const [selectedDateRange, setSelectedDateRange] = useState('Current Quarter (Q3 2026)');
  const [selectedBureauFilter, setSelectedBureauFilter] = useState('All Bureaus');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Global shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (title, message = '', type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch central shared data from backend
  const loadSharedData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const [casesRes, instRes, ovRes, alertRes, mrRes, bureauRes] = await Promise.allSettled([
        casesApi.getCases({ limit: 50 }),
        institutionsApi.getInstitutions({ limit: 50 }),
        overlapsApi.getOverlaps({ status: 'open' }),
        alertsApi.getAlerts(),
        matchReviewApi.getQueue(),
        adminApi.getBureaus(),
      ]);

      if (casesRes.status === 'fulfilled' && casesRes.value?.success) {
        setCases(casesRes.value.data || []);
      }
      if (instRes.status === 'fulfilled' && instRes.value?.success) {
        setInstitutions(instRes.value.data || []);
      }
      if (ovRes.status === 'fulfilled' && ovRes.value?.success) {
        setOverlaps(ovRes.value.data || []);
      }
      if (alertRes.status === 'fulfilled' && alertRes.value?.success) {
        const rawAlerts = alertRes.value.data || [];
        setAlerts(
          rawAlerts.map((item) => ({
            id: item.notificationId || item.alert?._id,
            alertId: item.alert?._id,
            isRead: item.isRead,
            timestamp: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
            severity: item.alert?.severity || 'medium',
            title: item.alert?.message || 'Operational Alert',
            description: item.alert?.message,
            relatedCaseId: item.alert?.case?.caseId || item.alert?.case?._id,
            institutionName: item.alert?.institution?.name || item.alert?.case?.rawInstitutionName,
          }))
        );
      }
      if (mrRes.status === 'fulfilled' && mrRes.value?.success) {
        setMatchReviews(mrRes.value.data || []);
      }
      if (bureauRes.status === 'fulfilled' && bureauRes.value?.success) {
        setBureaus(bureauRes.value.data || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSharedData();
    }
  }, [isAuthenticated, loadSharedData]);

  // Actions wired to backend
  const addRemark = async (caseId, remarks, documentRef = '') => {
    try {
      const res = await casesApi.addCaseAction(caseId, {
        actionType: 'remark',
        remarks: documentRef ? `${remarks} (Ref: ${documentRef})` : remarks,
      });
      if (res?.success) {
        addToast('Remark Recorded', `Official case note successfully logged for ${caseId}`, 'success');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Remark Failed', err?.response?.data?.message || 'Failed to record remark', 'danger');
      throw err;
    }
  };

  const transferCase = async (caseId, targetBureauId, reason) => {
    try {
      const res = await casesApi.transferCase(caseId, {
        targetBureauId,
        remarks: reason,
      });
      if (res?.success) {
        addToast('Case Transferred', res.message || `Case transferred successfully`, 'info');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Transfer Failed', err?.response?.data?.message || 'Failed to transfer case', 'danger');
      throw err;
    }
  };

  const escalateCase = async (caseId, escalationLevel, reason) => {
    try {
      const res = await casesApi.escalateCase(caseId, {
        remarks: `Escalated to ${escalationLevel}: ${reason}`,
      });
      if (res?.success) {
        addToast('Case Escalated', `Case marked as Escalated to Senior Management`, 'warning');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Escalation Failed', err?.response?.data?.message || 'Failed to escalate case', 'danger');
      throw err;
    }
  };

  const linkCases = async (primaryCaseId, secondaryCaseId, reason) => {
    try {
      const res = await casesApi.linkCases({
        caseAId: primaryCaseId,
        caseBId: secondaryCaseId,
        linkType: 'related',
        remarks: reason,
      });
      if (res?.success) {
        addToast('Cases Linked', `Bidirectional link established between cases`, 'info');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Link Failed', err?.response?.data?.message || 'Failed to link cases', 'danger');
      throw err;
    }
  };

  const updateCaseStatus = async (caseId, status, remarks) => {
    try {
      const normalizedStatus = status.toLowerCase().replace(/ /g, '_');
      const res = await casesApi.updateCase(caseId, {
        status: normalizedStatus,
        remarks,
      });
      if (res?.success) {
        addToast('Status Updated', `Case updated to ${status}`, 'success');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Update Failed', err?.response?.data?.message || 'Failed to update case status', 'danger');
      throw err;
    }
  };

  const coordinateOverlap = async (groupId, leadBureau, remarks, jointHearingDate = '') => {
    try {
      const fullRemarks = `Lead Bureau: ${leadBureau}. ${jointHearingDate ? `Joint Hearing: ${jointHearingDate}. ` : ''}${remarks || ''}`;
      const res = await overlapsApi.resolveOverlap(groupId, {
        status: 'coordinated',
        remarks: fullRemarks,
      });
      if (res?.success) {
        addToast('Overlap Coordinated', `Overlap Group marked as Coordinated`, 'success');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Coordination Failed', err?.response?.data?.message || 'Failed to resolve overlap', 'danger');
      throw err;
    }
  };

  const dismissOverlap = async (groupId, reason) => {
    try {
      const res = await overlapsApi.resolveOverlap(groupId, {
        status: 'dismissed',
        remarks: reason,
      });
      if (res?.success) {
        addToast('Overlap Dismissed', `Overlap flag dismissed with recorded justification`, 'info');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Dismissal Failed', err?.response?.data?.message || 'Failed to dismiss overlap', 'danger');
      throw err;
    }
  };

  const confirmMatchCandidate = async (caseId, candidateInstitutionId, remarks) => {
    try {
      const res = await matchReviewApi.confirmMatch(caseId, {
        institutionId: candidateInstitutionId,
        remarks: remarks || 'Confirmed manual match from review queue',
      });
      if (res?.success) {
        addToast('Institution Matched', res.message || 'Institution matched successfully', 'success');
        loadSharedData();
        return res.data;
      }
    } catch (err) {
      addToast('Match Confirmation Failed', err?.response?.data?.message || 'Failed to confirm match', 'danger');
      throw err;
    }
  };

  const flagUnmatchedReview = async (caseId, reason) => {
    try {
      addToast('Flagged for Manual Investigation', `Case queued for physical registry verification: ${reason}`, 'warning');
      loadSharedData();
    } catch (err) {
      addToast('Action Failed', err?.message || 'Failed to flag case', 'danger');
    }
  };

  const markAlertRead = async (alertId) => {
    try {
      await alertsApi.markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId || a.alertId === alertId ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error('Failed to mark alert as read', err);
    }
  };

  const markAllAlertsRead = async () => {
    try {
      for (const a of alerts.filter((al) => !al.isRead)) {
        await alertsApi.markAlertRead(a.id || a.alertId);
      }
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      addToast('Alerts Cleared', 'All pending notifications marked as read', 'info');
    } catch (err) {
      console.error('Failed to clear alerts', err);
    }
  };

  const addImportedCases = (newCases) => {
    loadSharedData();
    addToast('Bulk Import Complete', `Data refreshed with newly imported complaints`, 'success');
  };

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    await loadSharedData();
    setIsRefreshing(false);
    addToast('Data Synchronized', 'AICTE Central Monitoring Layer refreshed across all bureau dockets', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser: authUser,
        setCurrentUser: () => {},
        cases,
        setCases,
        institutions,
        setInstitutions,
        overlaps,
        setOverlaps,
        alerts,
        setAlerts,
        matchReviews,
        setMatchReviews,
        bureaus,
        selectedDateRange,
        setSelectedDateRange,
        selectedBureauFilter,
        setSelectedBureauFilter,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toasts,
        addToast,
        removeToast,
        addRemark,
        transferCase,
        escalateCase,
        linkCases,
        updateCaseStatus,
        coordinateOverlap,
        dismissOverlap,
        confirmMatchCandidate,
        flagUnmatchedReview,
        markAlertRead,
        markAllAlertsRead,
        addImportedCases,
        isRefreshing,
        triggerRefresh,
        loading,
        error,
        reloadSharedData: loadSharedData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
