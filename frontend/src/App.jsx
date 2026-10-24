import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { InstitutionsPage } from './pages/InstitutionsPage';
import { InstitutionDetailsPage } from './pages/InstitutionDetailsPage';
import { OverlapCentrePage } from './pages/OverlapCentrePage';
import { AlertsPage } from './pages/AlertsPage';
import { MatchReviewPage } from './pages/MatchReviewPage';
import { ImportsPage } from './pages/ImportsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdministrationPage } from './pages/AdministrationPage';
import { StudentComplaintsPage } from './pages/StudentComplaintsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/student"
                element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentComplaintsPage />
                </ProtectedRoute>
                }
              />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={[
                    'super_admin',
                    'senior_management',
                    'bureau_officer',
                    'regional_officer',
                    'data_operator',
                ]}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="cases" element={<CasesPage />} />
                <Route path="cases/:caseId" element={<CaseDetailsPage />} />
                <Route path="institutions" element={<InstitutionsPage />} />
                <Route path="institutions/:id" element={<InstitutionDetailsPage />} />
                <Route path="overlaps" element={<OverlapCentrePage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="match-review" element={<MatchReviewPage />} />
                <Route path="imports" element={<ImportsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="admin" element={<AdministrationPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
