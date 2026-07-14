import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PharmaciesPage from './pages/PharmaciesPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import SystemHealthPage from './pages/SystemHealthPage';
import FeatureFlagsPage from './pages/FeatureFlagsPage';
import MaintenancePage from './pages/MaintenancePage';
import ConfigPage from './pages/ConfigPage';
import AuditPage from './pages/AuditPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import OrdersPage from './pages/OrdersPage';
import MedicinesPage from './pages/MedicinesPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import StaffPage from './pages/StaffPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'SUPER_ADMIN') {
    localStorage.removeItem('super_admin_token');
    return <Navigate to="/login" />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="pharmacies" element={<PharmaciesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="system-health" element={<SystemHealthPage />} />
        <Route path="feature-flags" element={<FeatureFlagsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="staff" element={<StaffPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
