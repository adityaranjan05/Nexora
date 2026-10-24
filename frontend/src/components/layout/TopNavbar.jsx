import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  RefreshCw, 
  Calendar, 
  ChevronRight, 
  Filter, 
  Menu, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Building
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopNavbar = ({ setMobileOpen }) => {
  const { 
    alerts, 
    markAlertRead, 
    markAllAlertsRead, 
    selectedDateRange, 
    setSelectedDateRange, 
    selectedBureauFilter, 
    setSelectedBureauFilter, 
    setCommandPaletteOpen,
    isRefreshing,
    triggerRefresh,
    currentUser
  } = useApp();

  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const unreadAlerts = alerts.filter((a) => !a.isRead);

  // Derive breadcrumb from pathname
  const pathParts = location.pathname.split('/').filter(Boolean);
  const getBreadcrumbTitle = (part) => {
    switch (part) {
      case 'cases': return 'Case Records';
      case 'institutions': return 'Institutions';
      case 'overlaps': return 'Overlap Coordination Centre';
      case 'alerts': return 'Operational Alerts';
      case 'match-review': return 'Institution Match Review';
      case 'imports': return 'Bulk Case Ingestion';
      case 'reports': return 'Compliance & Performance Analytics';
      case 'admin': return 'System Administration & SLA Rules';
      default: return part;
    }
  };

  const bureauOptions = [
    'All Bureaus',
    'Approval Bureau',
    'Grievance Redressal Cell',
    'Regulation Bureau',
    'RIFD Bureau',
    'Administration & Vigilance',
    'Student Development Cell',
  ];

  const dateRangeOptions = [
    'Last 30 Days',
    'Current Quarter (Q3 2026)',
    'FY 2026-27 (Year to Date)',
    'All Time',
  ];

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-[#081A2B] via-[#0B2032] to-[#101C35] text-[#EAF2F8] border-b border-[#20374B] shadow-subtle px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-white rounded-lg hover:bg-[#182844]"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 overflow-hidden">
            <Link to="/" className="text-white hover:text-blue-300 shrink-0 font-semibold flex items-center gap-1">
              <span>Nexora</span>
            </Link>
            {pathParts.length === 0 ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-slate-100 font-semibold truncate">Complaint Monitoring Overview</span>
              </>
            ) : (
              pathParts.map((part, index) => {
                const url = `/${pathParts.slice(0, index + 1).join('/')}`;
                const isLast = index === pathParts.length - 1;
                return (
                  <React.Fragment key={url}>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {isLast ? (
                      <span className="text-slate-100 font-semibold truncate">
                        {getBreadcrumbTitle(part)}
                      </span>
                    ) : (
                      <Link to={url} className="hover:text-blue-300 truncate">
                        {getBreadcrumbTitle(part)}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </nav>
        </div>

        {/* Center: Global Search Bar trigger */}
        <div className="hidden lg:flex flex-1 max-w-md mx-2">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 bg-[#0B1730]/60 hover:bg-[#182844] rounded-lg border border-slate-700/80 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Search cases, institutions, PID (e.g. 1-438920194)...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-[#101D35] border border-slate-700/80 rounded shadow-xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Filters, Notifications */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick Bureau Filter Dropdown */}
          <div className="hidden xl:flex items-center space-x-1.5 bg-[#0B1730] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedBureauFilter}
              onChange={(e) => setSelectedBureauFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/60 cursor-pointer"
            >
              {bureauOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-[#0B1730] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/60 cursor-pointer"
            >
              {dateRangeOptions.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Refresh Action */}
          <button
            onClick={triggerRefresh}
            disabled={isRefreshing}
            title="Refresh All AICTE Bureau Feeds"
            className="p-2 text-slate-500 hover:text-blue-300 hover:bg-[#182844] rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Notifications Bell with Popover */}
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu(!showAlertMenu)}
              className="relative p-2 text-slate-500 hover:text-white hover:bg-[#182844] rounded-lg transition-colors"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-[#101D35] animate-pulse" />
              )}
            </button>

            {showAlertMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#101D35] rounded-xl shadow-elevated border border-slate-700/80 z-50 overflow-hidden">
                <div className="p-3 bg-[#0B1730] border-b border-slate-700/80 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Coordination Alerts</h4>
                    <p className="text-[11px] text-slate-500">
                      {unreadAlerts.length} pending actionable notices
                    </p>
                  </div>
                  {unreadAlerts.length > 0 && (
                    <button
                      onClick={markAllAlertsRead}
                      className="text-[11px] text-blue-300 hover:text-blue-100 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/70">
                  {alerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        markAlertRead(alert.id);
                        if (alert.relatedCaseId) {
                          setShowAlertMenu(false);
                          navigate(`/cases/${encodeURIComponent(alert.relatedCaseId)}`);
                        }
                      }}
                      className={`p-3 text-xs hover:bg-[#0B1730] cursor-pointer transition-colors ${
                        !alert.isRead ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`font-semibold ${alert.severity === 'critical' ? 'text-rose-200' : 'text-slate-200'}`}>
                          {alert.title}
                        </span>
                        {!alert.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{alert.institutionName || 'AICTE Central Registry'}</span>
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-[#0B1730] border-t border-slate-700/80 text-center">
                  <Link
                    to="/alerts"
                    onClick={() => setShowAlertMenu(false)}
                    className="text-xs font-semibold text-blue-300 hover:text-blue-100 inline-flex items-center gap-1"
                  >
                    <span>View all operational alerts</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Search Trigger Icon for Small Screens */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:text-white hover:bg-[#182844] rounded-lg"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
