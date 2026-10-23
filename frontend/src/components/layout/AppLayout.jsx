import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from './ToastContainer';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gov-surface text-slate-800">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[radial-gradient(ellipse_at_63%_-8%,#173f55_0%,transparent_37%),radial-gradient(ellipse_at_100%_46%,#241f4b_0%,transparent_32%),linear-gradient(140deg,#071522,#0b1b2a_54%,#101a2c)]">
        <TopNavbar setMobileOpen={setMobileOpen} />
        
        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
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
