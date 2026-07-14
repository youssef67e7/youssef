import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import MedicinesPage from './pages/MedicinesPage';
import OrdersPage from './pages/OrdersPage';
import CategoriesPage from './pages/CategoriesPage';
import BrandsPage from './pages/BrandsPage';
import CouponsPage from './pages/CouponsPage';
import DeliveryPage from './pages/DeliveryPage';
import NotificationsPage from './pages/NotificationsPage';
import InventoryPage from './pages/InventoryPage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="medicines" element={<MedicinesPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="brands" element={<BrandsPage />} />
        <Route path="coupons" element={<CouponsPage />} />
        <Route path="delivery" element={<DeliveryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
