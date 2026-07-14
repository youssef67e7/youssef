import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Pill, ShoppingCart, Tags, Award, Ticket, Truck, Bell, LogOut, Menu, X, Warehouse, Star } from 'lucide-react';
import { useState } from 'react';

const navSections = [
  { label: 'Overview', items: [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { label: 'Catalog', items: [
    { to: '/medicines', icon: Pill, label: 'Medicines' },
    { to: '/inventory', icon: Warehouse, label: 'Inventory' },
    { to: '/categories', icon: Tags, label: 'Categories' },
    { to: '/brands', icon: Award, label: 'Brands' },
  ]},
  { label: 'Operations', items: [
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/delivery', icon: Truck, label: 'Delivery' },
    { to: '/drivers', icon: Truck, label: 'Drivers' },
  ]},
  { label: 'Marketing', items: [
    { to: '/coupons', icon: Ticket, label: 'Coupons' },
  ]},
  { label: 'People', items: [
    { to: '/users', icon: Users, label: 'Customers' },
  ]},
  { label: 'Feedback', items: [
    { to: '/reviews', icon: Star, label: 'Reviews' },
  ]},
  { label: 'Communication', items: [
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ]},
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
          {navSections.map(section => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-3 pb-1">{section.label}</p>
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
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
