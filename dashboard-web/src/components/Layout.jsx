import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, Pill, ShoppingCart, Star, Bell, RotateCcw, LogOut, Menu, X, Moon, Sun, Truck, Tag } from 'lucide-react';
import { useState } from 'react';

const navSections = [
  { label: 'Overview', items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }] },
  { label: 'Operations', items: [
    { to: '/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/returns', icon: RotateCcw, label: 'Returns' },
  ]},
  { label: 'Catalog', items: [
    { to: '/medicines', icon: Pill, label: 'Medicines' },
  ]},
  { label: 'Content', items: [
    { to: '/reviews', icon: Star, label: 'Reviews' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },

  ]},
  { label: 'Management', items: [
    { to: '/suppliers', icon: Truck, label: 'Suppliers' },
    { to: '/promotions', icon: Tag, label: 'Promotions' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''}`}>
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 ${collapsed ? 'w-[72px]' : 'w-64'} bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-all lg:translate-x-0 lg:static`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-6'} py-5 border-b dark:border-gray-800`}>
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">PW</div>
          {!collapsed && <span className="font-bold text-lg dark:text-white">PharmaWorld</span>}
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-64px)]">
          {navSections.map(section => (
            <div key={section.label}>
              {!collapsed && <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 pt-3 pb-1">{section.label}</p>}
              {section.items.map(item => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
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
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'E'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium dark:text-white">{user?.name || 'Employee'}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-red-600">
              <LogOut size={18} />
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
