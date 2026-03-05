import React from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  CalendarPlus, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  FlaskConical 
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, roles: ['Guru', 'Pembantu Makmal', 'Ketua Panitia'] },
    { path: '/tempahan-baru', label: 'Tempahan Baru', icon: CalendarPlus, roles: ['Guru'] },
    { path: '/senarai-tempahan', label: 'Senarai Tempahan', icon: ClipboardList, roles: ['Pembantu Makmal', 'Ketua Panitia'] },
    { path: '/analisis', label: 'Analisis', icon: BarChart3, roles: ['Ketua Panitia'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <FlaskConical className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="font-bold text-lg leading-tight">SSM Johor</h1>
            <p className="text-xs text-slate-400">Smart Lab Booking</p>
          </div>
        </div>

        <div className="p-4 flex-1">
          <div className="mb-6 px-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pengguna</p>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-emerald-400">{user.role}</p>
          </div>

          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
