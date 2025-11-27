import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Notifications from './components/common/Notifications';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import BirthRecords from './pages/BirthRecords';
import DeathRecords from './pages/DeathRecords';
import MarriageRecords from './pages/MarriageRecords';
import DivorceRecords from './pages/DivorceRecords';
import Certificates from './pages/Certificates';
import CertificateView from './pages/CertificateView';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManagement from './pages/admin/UserManagement';
import AdminDashboard from './pages/admin/Dashboard';
import ReportsManagement from './pages/admin/ReportsManagement';
import AuditLogs from './pages/admin/AuditLogs';
import StatisticianAnalytics from './pages/statistician/Analytics';
import StatisticianReports from './pages/statistician/Reports';
import StatisticianMyReports from './pages/statistician/MyReports';
import VerifyCertificate from './pages/VerifyCertificate';
import Layout from './components/layout/Layout';
import './i18n/config'; // Initialize i18n
import './index.css';

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// App Routes component
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/births"
        element={
          <ProtectedRoute>
            <Layout>
              <BirthRecords />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/deaths"
        element={
          <ProtectedRoute>
            <Layout>
              <DeathRecords />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/marriages"
        element={
          <ProtectedRoute>
            <Layout>
              <MarriageRecords />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/divorces"
        element={
          <ProtectedRoute>
            <Layout>
              <DivorceRecords />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <Layout>
              <AuditLogs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <Layout>
              <Certificates />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates/:type/:id"
        element={
          <ProtectedRoute>
            <CertificateView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistician/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <StatisticianAnalytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistician/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <StatisticianReports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportsManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistician/my-reports"
        element={
          <ProtectedRoute>
            <Layout>
              <StatisticianMyReports />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Notifications />
            <AppRoutes />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;