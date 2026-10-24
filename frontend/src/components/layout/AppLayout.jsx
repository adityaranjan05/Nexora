import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { CommandPalette } from './CommandPalette';
import { ToastContainer } from './ToastContainer';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="h-screen w-screen bg-[#0A0A0B] text-[#F4F4F5] p-2 sm:p-2.5 flex gap-2 sm:gap-2.5 overflow-hidden font-sans select-none-off">
      {/* 1. Left Sidebar Panel (Floating with 16px radius, 1px border) */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0 h-full overflow-hidden">
        {/* 2. Top Bar Panel (Floating rounded strip) */}
        <TopNavbar 
          setMobileOpen={setMobileOpen} 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        
        {/* 3. Content Panel */}
        <div className="flex-1 min-w-0 h-full overflow-hidden">
          <Outlet />
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
