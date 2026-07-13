import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Pill, ShoppingCart, Tags, Award, Ticket, Truck, Bell, Activity, LogOut, Menu, X, Package, Percent, UsersRound, Bot, Stethoscope, Warehouse, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/services', icon: Activity, label: 'Services' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/medicines', icon: Pill, label: 'Medicines' },
  { to: '/inventory', icon: Warehouse, label: 'Inventory' },
  { to: '/suppliers', icon: Package, label: 'Suppliers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/categories', icon: Tags, label: 'Categories' },
  { to: '/brands', icon: Award, label: 'Brands' },
  { to: '/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/promotions', icon: Percent, label: 'Promotions' },
  { to: '/delivery', icon: Truck, label: 'Delivery' },
  { to: '/staff', icon: UsersRound, label: 'Staff' },
  { to: '/telemedicine', icon: Stethoscope, label: 'Telemedicine' },
  { to: '/ai-prescription', icon: Bot, label: 'AI Prescription' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transition-transform lg:translate-x-0 lg:static`}>
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">PW</div>
          <span className="font-bold text-lg">PharmaWorld</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-4 lg:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={24} /></button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
