import React from 'react';
import { useData } from '../contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export default function Analysis() {
  const { bookings } = useData();

  // 1. Jumlah eksperimen setiap guru
  const guruStats = bookings.reduce((acc, curr) => {
    acc[curr.guru_name] = (acc[curr.guru_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const guruChartData = Object.keys(guruStats).map(name => ({
    name,
    Jumlah: guruStats[name]
  }));

  // 2. Jumlah eksperimen bulanan
  const monthlyStats = bookings.reduce((acc, curr) => {
    const month = format(parseISO(curr.tarikh), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.keys(monthlyStats).map(month => ({
    month,
    Jumlah: monthlyStats[month]
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analisis Penggunaan Makmal</h1>
        <p className="text-slate-500">Laporan dan statistik penggunaan makmal sains.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Carta Guru */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Jumlah Eksperimen / Aktiviti Mengikut Guru</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={guruChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Jumlah" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carta Bulanan */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6">Jumlah Eksperimen / Aktiviti Bulanan</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="Jumlah" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Senarai Eksperimen / Aktiviti Mengikut Tarikh */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Senarai Eksperimen / Aktiviti Mengikut Tarikh</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm font-medium border-b border-slate-200">
                <th className="px-6 py-4">Tarikh</th>
                <th className="px-6 py-4">Masa</th>
                <th className="px-6 py-4">Eksperimen / Aktiviti</th>
                <th className="px-6 py-4">Guru</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...bookings].sort((a, b) => new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime()).map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-900">{format(parseISO(booking.tarikh), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-slate-600">{booking.masa}</td>
                  <td className="px-6 py-4 text-slate-900">{booking.eksperimen_tajuk}</td>
                  <td className="px-6 py-4 text-slate-600">{booking.guru_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      booking.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
