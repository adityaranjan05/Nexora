import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from './ToastContainer';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen gap-3 bg-[#0B1730] p-3 text-slate-100">
      {/* Sidebar navigation */}
      <div className="shrink-0">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      </div>

      {/* Main content column: use a single surface so page cards remain visually consistent */}
      <div className="flex h-[calc(100vh-1.5rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-[#101D35]">
        <TopNavbar setMobileOpen={setMobileOpen} />

        {/* Scrollable page body */}
        <main className="w-full flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};
