import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  CalendarPlus,
  ClipboardList,
  BarChart3,
  LogOut,
  FlaskConical,
  Menu,
  X,
} from 'lucide-react';

export default function Layout() {
const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
      Memuatkan sesi...
    </div>
  );
}

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

  // ✅ Bagi Guru akses juga, tapi nanti kita tapis dalam BookingList (guru nampak tempahan sendiri sahaja)
  { path: '/senarai-tempahan', label: 'Tempahan Saya', icon: ClipboardList, roles: ['Guru', 'Pembantu Makmal', 'Ketua Panitia'] },

  { path: '/analisis', label: 'Analisis', icon: BarChart3, roles: ['Ketua Panitia'] },
];

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  // Bila tukar page, auto tutup drawer mobile
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <FlaskConical className="w-8 h-8 text-emerald-400" />
        <div>
          <h1 className="font-bold text-lg leading-tight">SSM Johor</h1>
          <p className="text-xs text-slate-400">Smart Lab Booking</p>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
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
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* DESKTOP SIDEBAR (muncul md ke atas) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col">
        <SidebarContent />
      </aside>

      {/* MOBILE DRAWER + OVERLAY */}
      {mobileOpen && (
        <>
          {/* overlay */}
          <button
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
          />
          {/* drawer */}
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 text-white z-50 md:hidden shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-6 h-6 text-emerald-400" />
                <span className="font-semibold">Menu</span>
              </div>
              <button
                aria-label="Tutup"
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* MAIN */}
      <main className="flex-1 overflow-auto">
        {/* topbar mobile */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">Menu</span>
            </button>

            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{user.role}</div>
              <div className="text-xs text-slate-500 leading-tight">{user.name}</div>
            </div>
          </div>
        </div>

        {/* content padding responsif */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
