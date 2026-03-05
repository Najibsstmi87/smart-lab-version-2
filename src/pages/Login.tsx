import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FlaskConical } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center gap-6">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/500px-Coat_of_arms_of_Malaysia.svg.png" 
            alt="KPM Logo" 
            className="w-20 h-20 object-contain"
            referrerPolicy="no-referrer"
          />
          <img 
            src="https://lh3.googleusercontent.com/d/1NJI6pEh_7toHDtSYvl3sWikGeXdUdGXK" 
            alt="SSMJ Logo" 
            className="w-20 h-20 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          SEKOLAH SENI MALAYSIA JOHOR
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sistem Tempahan Eksperimen Sains KSSM
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Alamat Emel
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Contoh: ahmad@sekolah.edu.my"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Kata Laluan
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  defaultValue="password123"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                * Untuk demo, masukkan mana-mana kata laluan.
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
              >
                Log Masuk
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Belum ada akaun?{' '}
              <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
                Daftar di sini
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Akaun Demo</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100" onClick={() => setEmail('ahmad@sekolah.edu.my')}>
                <span className="font-semibold block">Guru:</span> ahmad@sekolah.edu.my
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100" onClick={() => setEmail('razak@sekolah.edu.my')}>
                <span className="font-semibold block">Pembantu Makmal:</span> razak@sekolah.edu.my
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100" onClick={() => setEmail('aminah@sekolah.edu.my')}>
                <span className="font-semibold block">Ketua Panitia:</span> aminah@sekolah.edu.my
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
