import React from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FlaskConical, LogOut, LayoutDashboard, ClipboardList, PlusCircle, BarChart3 } from 'lucide-react';

export default function Layout() {
  const { user, logout, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-800"
          >
            <FlaskConical className="w-6 h-6 text-emerald-600" />
            Smart Lab Booking
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 uppercase">
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="mb-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            to="/tempahan-baru"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
          >
            <PlusCircle className="w-4 h-4" />
            Tempahan Baru
          </Link>

          <Link
            to="/tempahan"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
          >
            <ClipboardList className="w-4 h-4" />
            Senarai Tempahan
          </Link>

          <Link
            to="/analisis"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50"
          >
            <BarChart3 className="w-4 h-4" />
            Analisis
          </Link>
        </nav>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
