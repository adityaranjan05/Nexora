
import React, { useEffect, useState } from 'react';
import { casesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FileText, RefreshCw } from 'lucide-react';

export function StudentComplaintsPage() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await casesApi.getCases({ page: 1, limit: 100 });
      setCases(response?.data || []);
    } catch {
      setError('Unable to load your complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-[#071522] text-white p-6 sm:p-10">
      <header className="flex items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-bold">Nexora</h1>
          <p className="text-sm text-slate-400 mt-1">
            My Complaints
          </p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Sign out
        </button>
      </header>

      <section className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold">Welcome, {user?.name}</h2>
        <p className="text-slate-400 mt-2 mb-8">
          View the complaints submitted through your account.
        </p>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Your complaints</h3>
          <button
            onClick={loadComplaints}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 py-8">Loading your complaints...</p>
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-5">
            <p className="text-red-300">{error}</p>
            <button onClick={loadComplaints} className="mt-3 text-sm underline">
              Try again
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
            <FileText className="w-8 h-8 mx-auto mb-3 text-slate-500" />
            <p className="font-medium">No complaints found</p>
            <p className="text-sm text-slate-400 mt-2">
              Complaints submitted through your account will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((item) => (
              <article
                key={item._id || item.id || item.caseId}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.caseId}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {item.category}
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-500/10 px-3 py-1 text-sm text-teal-300">
                    {(item.status || 'pending').replaceAll('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-slate-300 mt-4">
                  {item.description}
                </p>

                <p className="text-xs text-slate-500 mt-4">
                  Submitted: {item.receivedDate
                    ? new Date(item.receivedDate).toLocaleDateString()
                    : 'Not available'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
