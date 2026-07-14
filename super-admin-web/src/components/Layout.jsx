import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, Building2, Users, Shield, Activity, Flag, Wrench, Settings, ClipboardList, BarChart3, FileText, HeartPulse, LogOut, Menu, X, Moon, Sun, Search, Bell, Pill, ShoppingCart, Star, UserCheck } from 'lucide-react';
import { useState } from 'react';

const navSections = [
  { label: 'System Overview', items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }] },
  { label: 'User Management', items: [
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/roles', icon: Shield, label: 'Roles & Permissions' },
    { to: '/staff', icon: UserCheck, label: 'Staff' },
  ]},
  { label: 'Content Management', items: [
    { to: '/pharmacies', icon: Building2, label: 'Pharmacies' },
    { to: '/medicines', icon: Pill, label: 'Medicines' },
  ]},
  { label: 'Operations', items: [
    { to: '/feature-flags', icon: Flag, label: 'Feature Flags' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
  ]},
  { label: 'Analytics', items: [
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  ]},
  { label: 'Security', items: [
    { to: '/audit', icon: ClipboardList, label: 'Audit Logs' },
    { to: '/system-health', icon: HeartPulse, label: 'System Health' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
  ]},
  { label: 'Configuration', items: [
    { to: '/config', icon: Settings, label: 'Config' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''}`}>
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 ${collapsed ? 'w-[72px]' : 'w-64'} bg-primary-700 dark:bg-gray-900 transition-all lg:translate-x-0 lg:static`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-6'} py-5 border-b border-primary-600 dark:border-gray-800`}>
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">SA</div>
          {!collapsed && <span className="font-bold text-lg text-white">Super Admin</span>}
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-white"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {navSections.map(section => (
            <div key={section.label}>
              {!collapsed && <p className="text-[10px] font-semibold text-primary-200/60 uppercase tracking-wider px-3 pt-3 pb-1">{section.label}</p>}
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10'}`}
                  title={collapsed ? item.label : undefined}>
                  <item.icon size={18} />
                  {!collapsed && item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center px-4 lg:px-6 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={24} /></button>
          <button onClick={() => setCollapsed(c => !c)} className="hidden lg:block text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm border-0 focus:ring-2 focus:ring-primary-500" placeholder="Search..." />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'SA'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium dark:text-white">{user?.name || 'Super Admin'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'super_admin'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
