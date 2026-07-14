import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MedicinesPage from './pages/MedicinesPage';
import OrdersPage from './pages/OrdersPage';
import ReviewsPage from './pages/ReviewsPage';
import NotificationsPage from './pages/NotificationsPage';
import ReturnsPage from './pages/ReturnsPage';
import StaffPage from './pages/StaffPage';
import SuppliersPage from './pages/SuppliersPage';
import PromotionsPage from './pages/PromotionsPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'PHARMACIST') {
    localStorage.removeItem('dashboard_token');
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
        <Route path="orders" element={<OrdersPage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="returns" element={<ReturnsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
