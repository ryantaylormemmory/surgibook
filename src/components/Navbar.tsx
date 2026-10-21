import { Link, useLocation } from 'react-router-dom';
import { Activity, Menu, X, LogOut, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { getCurrentUser, logout } from '@/lib/auth';
import NotificationBell from './NotificationBell';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/book', label: 'Book Case', icon: null },
  { path: '/completed', label: 'Completed', icon: null },
  { path: '/anaesthetists', label: 'Anaesthetists', icon: null },
  { path: '/statistics', label: 'Statistics', icon: null },
  { path: '/chat', label: 'Team Chat', icon: MessageCircle },
  { path: '/settings', label: 'Settings', icon: null },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getCurrentUser();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">SurgiBook</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <NotificationBell />
            {user && (
              <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
                <span className="text-xs text-gray-500">{user.name}</span>
                <button
                  onClick={() => { logout(); window.location.href = '/login'; }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="px-4 py-2 space-y-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => { logout(); window.location.href = '/login'; }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Logout ({user.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}