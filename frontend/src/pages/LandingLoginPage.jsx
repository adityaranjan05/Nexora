import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Briefcase, GraduationCap, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export function LandingLoginPage() {
  const navigate = useNavigate();

  const portals = [
    {
      id: 'officer',
      title: 'Officer Portal',
      subtitle: 'Central Oversight & Governance',
      description: 'Cross-bureau oversight, institution-level case consolidation, overlap resolution, SLA enforcement, and statutory reporting.',
      icon: ShieldAlert,
      path: '/officer/login',
      accentColor: '#00E676',
      badge: 'Statutory Oversight',
      roles: ['Super Admin', 'Senior Management', 'Regional Officer'],
      features: ['Central KPI Dashboard', 'Overlap Resolution Centre', 'Case Assignment Queue', 'Statutory Reports Export'],
    },
    {
      id: 'bureau',
      title: 'Bureau Portal',
      subtitle: 'Assigned Work & Investigations',
      description: 'Dedicated workspace for assigned cell/bureau dockets, action trail logging, student information requests, and case disposal.',
      icon: Briefcase,
      path: '/bureau/login',
      accentColor: '#6C7BFF',
      badge: 'Operations & Inquiries',
      roles: ['Bureau Officer (RB, PGRC, etc.)', 'Data Operator'],
      features: ['My Bureau Case Queue', 'Status Updates & Disposals', 'Request Student Clarification', 'Bulk Data Ingestion'],
    },
    {
      id: 'student',
      title: 'Student Portal',
      subtitle: 'File Grievance & Live Tracking',
      description: 'Direct intake system for students to lodge institutional complaints, submit documentary evidence, and answer bureau queries.',
      icon: GraduationCap,
      path: '/student/login',
      accentColor: '#B07CFF',
      badge: 'Public Redressal',
      roles: ['Students & Enrolled Scholars'],
      features: ['File New Grievance', 'Direct Evidence Upload', 'Answer Bureau Inquiries', 'Plain Language Status Tracking'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F5] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#00E676]/30 selection:text-[#00E676]">
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00E676]/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#6C7BFF]/10 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <header className="relative max-w-6xl mx-auto w-full pt-4 sm:pt-8 text-center">
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#151618] border border-[#232427] text-xs font-medium text-[#A1A1AA] mb-4">
          <ShieldCheck className="w-4 h-4 text-[#00E676]" />
          <span>All India Council for Technical Education &bull; Nexora Portal Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
          Integrated Complaint &amp; Statutory Monitoring
        </h1>
        <p className="text-sm sm:text-base text-[#8A99B5] max-w-2xl mx-auto leading-relaxed">
          Select your dedicated access portal to enter the statutory coordination workspace or track institutional grievance filings.
        </p>
      </header>

      {/* 3 Portal Cards */}
      <main className="relative max-w-6xl mx-auto w-full my-8 sm:my-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => navigate(portal.path)}
                className="group relative bg-[#0F1011] hover:bg-[#151618] border border-[#232427] hover:border-[#383A40] rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xl hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar with Icon and Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border"
                      style={{
                        backgroundColor: `${portal.accentColor}15`,
                        borderColor: `${portal.accentColor}30`,
                        color: portal.accentColor,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${portal.accentColor}10`,
                        borderColor: `${portal.accentColor}30`,
                        color: portal.accentColor,
                      }}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-xl font-bold text-white group-hover:text-white transition">
                    {portal.title}
                  </h2>
                  <p className="text-xs font-medium text-[#71717A] mt-0.5 mb-3">
                    {portal.subtitle}
                  </p>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-5">
                    {portal.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="space-y-2 border-t border-[#1F2023] pt-4 mb-6">
                    {portal.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Roles and Button */}
                <div className="pt-4 border-t border-[#1F2023]">
                  <div className="text-[10px] uppercase tracking-wider text-[#71717A] font-semibold mb-3">
                    Authorized: {portal.roles.join(', ')}
                  </div>
                  <div
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition group-hover:gap-3"
                    style={{
                      backgroundColor: portal.accentColor,
                      color: '#000000',
                    }}
                  >
                    <span>Proceed to {portal.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative max-w-6xl mx-auto w-full text-center text-xs text-[#52525B] pt-4 pb-2 border-t border-[#1F2023]">
        AICTE Nexora Statutory Monitoring Dashboard &bull; Secured with RBAC and Portal Boundary Isolation
      </footer>
    </div>
  );
}

export default LandingLoginPage;
