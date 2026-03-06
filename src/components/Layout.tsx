import React, { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FlaskConical,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';

export default function Layout() {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuatkan sesi...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tempahan-baru', label: 'Tempahan Baru', icon: PlusCircle },
    { to: '/tempahan', label: 'Senarai Tempahan', icon: ClipboardList },
    { to: '/analisis', label: 'Analisis', icon: BarChart3 },
  ];

  const NavLinks = () => (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.to;

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <FlaskConical className="w-6 h-6 text-emerald-600" />
              <span>Smart Lab Booking</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 uppercase text-right">
              {user.name}
            </span>

            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-72 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-73px)]">
          <div className="p-4">
            <NavLinks />
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={closeMobileMenu}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-xl md:hidden">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <FlaskConical className="w-6 h-6 text-emerald-600" />
                  Smart Lab Booking
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <NavLinks />
              </div>
            </aside>
          </>
        )}

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
