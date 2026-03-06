import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

export default function Register() {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Guru');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const ok = await register(name, email, password, role);

    if (ok) {
      navigate('/');
    }

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
          Daftar Akaun Baru
        </h2>

        <p className="mt-2 text-center text-sm text-slate-600">
          SEKOLAH SENI MALAYSIA JOHOR
        </p>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">

        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-slate-200">

          <form className="space-y-5" onSubmit={handleSubmit}>

            <div>

              <label className="block text-sm font-medium text-slate-700">
                Nama Penuh
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Contoh: Cikgu Najib"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-slate-700">
                Alamat Emel
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Contoh: najib@sekolah.edu.my"
              />

            </div>

            <div>

              <label className="block text-sm font-medium text-slate-700">
                Peranan
              </label>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              >
                <option value="Guru">Guru</option>
                <option value="Pembantu Makmal">Pembantu Makmal</option>
                <option value="Ketua Panitia">Ketua Panitia</option>
              </select>

            </div>

            <div>

              <label className="block text-sm font-medium text-slate-700">
                Kata Laluan
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
              />

            </div>

            <div>

              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Daftar Akaun
              </button>

            </div>

          </form>

          <div className="mt-6 text-center">

            <p className="text-sm text-slate-600">

              Sudah mempunyai akaun?{' '}

              <Link
                to="/login"
                className="font-medium text-emerald-600 hover:text-emerald-500"
              >
                Log Masuk
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
