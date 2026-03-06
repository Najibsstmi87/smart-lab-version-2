import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FlaskConical, LogOut } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {

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

        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">

          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-800"
          >

            <FlaskConical className="w-6 h-6 text-emerald-600" />

            Smart Lab Booking

          </Link>

          <div className="flex items-center gap-4">

            <span className="text-sm text-slate-600">

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

      <main className="max-w-6xl mx-auto p-4">

        {children}

      </main>

    </div>
  );
}
