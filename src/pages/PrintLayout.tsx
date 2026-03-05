import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import { FlaskConical, Printer, ArrowLeft } from 'lucide-react';

export default function PrintLayout() {
  const { id } = useParams<{ id: string }>();
  const { bookings } = useData();
  const navigate = useNavigate();

  const booking = bookings.find(b => b.id === id);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // Add print-specific styles to body when mounted
    document.body.classList.add('print-page');
    return () => {
      document.body.classList.remove('print-page');
    };
  }, []);

  if (!booking) {
    return <div className="p-8 text-center text-red-500">Tempahan tidak dijumpai.</div>;
  }
  // ✅ Sekat akses: Guru hanya boleh lihat tempahan sendiri
if (user?.role === 'Guru' && booking.guru_id !== user.id) {
  return (
    <div className="p-8 text-center text-red-500">
      Tiada akses untuk melihat tempahan ini.
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white p-8 print:p-0">
      {/* Controls - Hidden when printing */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Cetak Borang
        </button>
      </div>

      {/* Printable Area */}
      <div className="max-w-4xl mx-auto bg-white p-12 shadow-lg print:shadow-none print:p-0">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-6 mb-8">
          <div className="flex items-center gap-6">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/500px-Coat_of_arms_of_Malaysia.svg.png" 
              alt="KPM Logo" 
              className="w-20 h-20 object-contain print:w-24 print:h-24"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">SEKOLAH SENI MALAYSIA JOHOR</h1>
              <p className="text-slate-600">Borang Tempahan Makmal Sains</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right text-sm text-slate-600">
            <div>
              <p>No. Rujukan: <span className="font-mono font-bold text-slate-900">{booking.id.toUpperCase()}</span></p>
              <p>Tarikh Cetakan: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
            <img 
              src="https://lh3.googleusercontent.com/d/1NJI6pEh_7toHDtSYvl3sWikGeXdUdGXK" 
              alt="SSMJ Logo" 
              className="w-20 h-20 object-contain print:w-24 print:h-24 hidden md:block"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Maklumat Tempahan */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-sm">
          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-32 font-semibold text-slate-700">Nama Guru:</span>
            <span className="flex-1 text-slate-900">{booking.guru_name}</span>
          </div>
          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-32 font-semibold text-slate-700">Tarikh:</span>
            <span className="flex-1 text-slate-900">{format(parseISO(booking.tarikh), 'dd MMMM yyyy')}</span>
          </div>
          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-32 font-semibold text-slate-700">Tingkatan/Kelas:</span>
            <span className="flex-1 text-slate-900">{booking.tingkatan && booking.kelas ? `${booking.tingkatan} ${booking.kelas}` : '-'}</span>
          </div>
          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-32 font-semibold text-slate-700">Masa:</span>
            <span className="flex-1 text-slate-900">{booking.masa}</span>
          </div>
          <div className="flex border-b border-slate-200 pb-2 md:col-span-2">
            <span className="w-32 font-semibold text-slate-700">Makmal / Bilik:</span>
            <span className="flex-1 text-slate-900">{booking.makmal || '-'}</span>
          </div>
          <div className="flex border-b border-slate-200 pb-2 md:col-span-2">
            <span className="w-32 font-semibold text-slate-700">Eksperimen / Aktiviti:</span>
            <span className="flex-1 text-slate-900 font-medium">{booking.eksperimen_tajuk}</span>
          </div>
          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-32 font-semibold text-slate-700">Bil. Kumpulan:</span>
            <span className="flex-1 text-slate-900">{booking.bilangan_kumpulan} Kumpulan</span>
          </div>
          <div className="flex border-b border-slate-200 pb-2">
            <span className="w-32 font-semibold text-slate-700">Status:</span>
            <span className="flex-1 text-slate-900 uppercase font-bold">{booking.status}</span>
          </div>
        </div>

        {/* Senarai Keperluan */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide border-b border-slate-300 pb-2">Senarai Keperluan Radas & Bahan</h2>
          
          <table className="w-full text-sm border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 px-4 py-2 text-left w-12">Bil</th>
                <th className="border border-slate-300 px-4 py-2 text-left">Item</th>
                <th className="border border-slate-300 px-4 py-2 text-center w-32">Jenis</th>
                <th className="border border-slate-300 px-4 py-2 text-center w-32">Kuantiti</th>
                <th className="border border-slate-300 px-4 py-2 text-center w-32">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {booking.senarai_radas.map((item, idx) => (
                <tr key={`r-${idx}`}>
                  <td className="border border-slate-300 px-4 py-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-300 px-4 py-2">{item.nama}</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-slate-600">Radas</td>
                  <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                    {item.kuantiti} {item.unit} {item.unit_khas_nilai ? `(${item.unit_khas_nilai}${item.unit_khas || ''})` : ''}
                  </td>
                  <td className="border border-slate-300 px-4 py-2"></td>
                </tr>
              ))}
              {booking.senarai_bahan.map((item, idx) => (
                <tr key={`b-${idx}`}>
                  <td className="border border-slate-300 px-4 py-2 text-center">{booking.senarai_radas.length + idx + 1}</td>
                  <td className="border border-slate-300 px-4 py-2">{item.nama}</td>
                  <td className="border border-slate-300 px-4 py-2 text-center text-slate-600">Bahan</td>
                  <td className="border border-slate-300 px-4 py-2 text-center font-medium">
                    {item.kuantiti} {item.unit} {item.unit_khas_nilai ? `(${item.unit_khas_nilai}${item.unit_khas || ''})` : ''}
                  </td>
                  <td className="border border-slate-300 px-4 py-2"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {booking.lain_lain && (
            <div className="mt-6 p-4 bg-slate-50 border border-slate-300 rounded-lg">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase">Lain-lain (Radas/Bahan Tambahan)</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{booking.lain_lain}</p>
            </div>
          )}

          {booking.catatan_guru && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="text-sm font-bold text-amber-900 mb-2 uppercase">Catatan Guru</h3>
              <p className="text-sm text-amber-800 whitespace-pre-wrap">{booking.catatan_guru}</p>
            </div>
          )}

          {booking.catatan_makmal && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-bold text-blue-900 mb-2 uppercase">Maklum Balas Pembantu Makmal</h3>
              <p className="text-sm text-blue-800 whitespace-pre-wrap">{booking.catatan_makmal}</p>
            </div>
          )}
        </div>

        {/* Tandatangan */}
        <div className="grid grid-cols-2 gap-16 mt-24 pt-8 text-sm">
          <div className="text-center">
            <div className="border-b border-slate-400 w-64 mx-auto mb-2"></div>
            <p className="font-bold text-slate-900">{booking.guru_name}</p>
            <p className="text-slate-600">Guru Sains</p>
            <p className="text-slate-500 mt-1">Tarikh: ....................................</p>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 w-64 mx-auto mb-2"></div>
            <p className="font-bold text-slate-900">Pembantu Makmal</p>
            <p className="text-slate-600">Pengesahan Penyediaan</p>
            <p className="text-slate-500 mt-1">Tarikh: ....................................</p>
          </div>
        </div>

      </div>
    </div>
  );
}
