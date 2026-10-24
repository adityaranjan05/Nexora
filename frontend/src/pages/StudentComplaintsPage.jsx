
import React, { useEffect, useState } from 'react';
import { casesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

export function StudentComplaintsPage() {
  const { user, logout } = useAuth();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCase, setExpandedCase] = useState(null);
  const [caseHistory, setCaseHistory] = useState({});
  const [historyLoading, setHistoryLoading] = useState(null);
  const [historyErrors, setHistoryErrors] = useState({});

  const loadComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await casesApi.getCases({
        page: 1,
        limit: 100,
      });
      setCases(response?.data || []);
    } catch (err) {
      console.error('Unable to load complaints:', err);
      setError('Unable to load your complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'Not available';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? 'Not available'
      : parsedDate.toLocaleString();
  };

  const formatStatus = (status) =>
    (status || 'pending').replaceAll('_', ' ');

  const toggleDetails = async (item) => {
    const caseKey = item._id || item.id || item.caseId;

    if (expandedCase === caseKey) {
      setExpandedCase(null);
      return;
    }

    setExpandedCase(caseKey);

    // Don't fetch the same history repeatedly after it has loaded.
    if (Object.prototype.hasOwnProperty.call(caseHistory, caseKey)) {
      return;
    }

    setHistoryLoading(caseKey);
    setHistoryErrors((previous) => ({
      ...previous,
      [caseKey]: '',
    }));

    try {
      // The backend history route expects the MongoDB case _id.
      const historyId = item._id || item.id;

      if (!historyId) {
        throw new Error('The complaint has no database ID.');
      }

      const response = await casesApi.getCaseHistory(historyId);
      const history = response?.data;

      setCaseHistory((previous) => ({
        ...previous,
        [caseKey]: Array.isArray(history) ? history : [],
      }));
    } catch (err) {
      console.error('Unable to load complaint history:', err);

      setHistoryErrors((previous) => ({
        ...previous,
        [caseKey]:
          'Unable to load complaint history. Please try again.',
      }));
    } finally {
      setHistoryLoading(null);
    }
  };

  const retryHistory = async (item) => {
    const caseKey = item._id || item.id || item.caseId;

    setCaseHistory((previous) => {
      const updated = { ...previous };
      delete updated[caseKey];
      return updated;
    });

    setHistoryErrors((previous) => ({
      ...previous,
      [caseKey]: '',
    }));

    setExpandedCase(null);

    // Open again to trigger a fresh history request.
    await toggleDetails(item);
  };

  return (
    <div className="min-h-screen bg-[#071522] p-6 text-white sm:p-10">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nexora</h1>
          <p className="mt-1 text-sm text-slate-400">
            My Complaints
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Sign out
        </button>
      </header>

      <section className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold">
          Welcome, {user?.name}
        </h2>

        <p className="mb-8 mt-2 text-slate-400">
          View the complaints submitted through your account.
        </p>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Your complaints
          </h3>

          <button
            type="button"
            onClick={loadComplaints}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-slate-400">
            Loading your complaints...
          </p>
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-5">
            <p className="text-red-300">{error}</p>

            <button
              type="button"
              onClick={loadComplaints}
              className="mt-3 text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-slate-500" />

            <p className="font-medium">
              No complaints found
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Complaints submitted through your account will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((item) => {
              const caseKey = item._id || item.id || item.caseId;
              const isExpanded = expandedCase === caseKey;
              const history = caseHistory[caseKey] || [];
              const isHistoryLoading = historyLoading === caseKey;
              const historyError = historyErrors[caseKey];

              return (
                <article
                  key={caseKey}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {item.caseId}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.category}
                      </p>
                    </div>

                    <span className="rounded-full bg-teal-500/10 px-3 py-1 text-sm capitalize text-teal-300">
                      {formatStatus(item.status)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-300">
                    {item.description || 'No description available.'}
                  </p>

                  <p className="mt-4 text-xs text-slate-500">
                    Submitted: {formatDate(item.receivedDate)}
                  </p>

                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleDetails(item)}
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-teal-300 hover:text-teal-200"
                  >
                    {isExpanded
                      ? 'Hide details'
                      : 'View details & tracking'}

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t border-slate-700 pt-4 text-sm">
                      <h4 className="font-semibold text-white">
                        Complaint details
                      </h4>

                      <p className="text-slate-300">
                        <span className="text-slate-400">
                          Complaint ID:
                        </span>{' '}
                        {item.caseId || 'Not available'}
                      </p>

                      <p className="text-slate-300">
                        <span className="text-slate-400">
                          Category:
                        </span>{' '}
                        {item.category || 'Not available'}
                      </p>

                      <p className="text-slate-300">
                        <span className="text-slate-400">
                          Current status:
                        </span>{' '}
                        <span className="capitalize">
                          {formatStatus(item.status)}
                        </span>
                      </p>

                      <p className="text-slate-300">
                        <span className="text-slate-400">
                          Last update:
                        </span>{' '}
                        {item.lastActionText || 'No update available yet.'}
                      </p>

                      <p className="text-slate-300">
                        <span className="text-slate-400">
                          Last update date:
                        </span>{' '}
                        {formatDate(item.lastActionDate)}
                      </p>

                      <p className="text-slate-300">
                        <span className="text-slate-400">
                          Next action:
                        </span>{' '}
                        {item.nextActionText || 'No next action available yet.'}
                      </p>

                      <p className="text-slate-300">
                        <span className="text-slate-400">
                          Expected disposal:
                        </span>{' '}
                        {formatDate(item.expectedDisposalDate)}
                      </p>

                      <div className="mt-5 border-t border-slate-700 pt-4">
                        <h4 className="mb-4 flex items-center gap-2 font-semibold">
                          <Clock className="h-4 w-4 text-teal-300" />
                          Complaint History
                        </h4>

                        {isHistoryLoading ? (
                          <p className="text-slate-400">
                            Loading complaint history...
                          </p>
                        ) : historyError ? (
                          <div>
                            <p className="text-amber-300">
                              {historyError}
                            </p>

                            <button
                              type="button"
                              onClick={() => retryHistory(item)}
                              className="mt-2 text-sm text-teal-300 underline"
                            >
                              Retry
                            </button>
                          </div>
                        ) : history.length === 0 ? (
                          <p className="text-slate-400">
                            No history entries available yet.
                          </p>
                        ) : (
                          <ol className="space-y-4 border-l border-slate-700 pl-4">
                            {history.map((entry, index) => (
                              <li
                                key={entry._id || index}
                                className="relative"
                              >
                                <p className="font-medium capitalize text-teal-300">
                                  {formatStatus(entry.actionType || 'update')}
                                </p>

                                <p className="mt-1 text-sm text-slate-300">
                                  {entry.remarks || 'No additional details.'}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  {formatDate(entry.timestamp)}
                                </p>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
