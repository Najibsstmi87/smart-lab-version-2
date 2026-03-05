import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { predictQuantity } from '../lib/ai';
import { schoolClasses } from '../lib/schoolData';
import { Sparkles, Loader2, Save } from 'lucide-react';

export default function BookingForm() {
  const { user } = useAuth();
  const { experiments, addBooking } = useData();
  const navigate = useNavigate();

  const [tingkatan, setTingkatan] = useState<number>(1);
  const [kelas, setKelas] = useState<string>(schoolClasses["Tingkatan 1"][0]);
  const [jenisTempahan, setJenisTempahan] = useState<'Aktiviti' | 'Eksperimen'>('Eksperimen');
  const [eksperimenId, setEksperimenId] = useState<string>('');
  const [tarikh, setTarikh] = useState('');
  const [masa, setMasa] = useState('');
  const [makmal, setMakmal] = useState<string>('Makmal Integrasi 1');
  const [bilKumpulan, setBilKumpulan] = useState<number>(5);
  const [lainLain, setLainLain] = useState<string>('');
  const [catatanGuru, setCatatanGuru] = useState<string>('');

  const [bahanList, setBahanList] = useState<{ nama: string; kuantiti: number; unit: string; unit_khas_nilai?: number; unit_khas?: string }[]>([]);
  const [radasList, setRadasList] = useState<{ nama: string; kuantiti: number; unit: string; unit_khas_nilai?: number; unit_khas?: string }[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const filteredExperiments = experiments.filter(e => e.tingkatan === tingkatan && e.jenis === jenisTempahan);

  useEffect(() => {
    if (eksperimenId) {
      const exp = experiments.find(e => e.id === eksperimenId);
      if (exp) {
        setBahanList(exp.default_bahan.map(b => ({ ...b, kuantiti: b.kuantiti * bilKumpulan })));
        setRadasList(exp.default_radas.map(r => ({ ...r, kuantiti: r.kuantiti * bilKumpulan })));
      }
    } else {
      setBahanList([]);
      setRadasList([]);
    }
  }, [eksperimenId, bilKumpulan, experiments]);

  const handleCalculateAI = async () => {
    if (!eksperimenId) return;
    const exp = experiments.find(e => e.id === eksperimenId);
    if (!exp) return;

    setIsCalculating(true);
    try {
      const newBahan = await Promise.all(
        exp.default_bahan.map(async (b) => {
          const qty = await predictQuantity(b.nama, b.kuantiti, bilKumpulan, 'bahan');
          return { ...b, kuantiti: qty };
        })
      );
      
      const newRadas = await Promise.all(
        exp.default_radas.map(async (r) => {
          const qty = await predictQuantity(r.nama, r.kuantiti, bilKumpulan, 'radas');
          return { ...r, kuantiti: qty };
        })
      );

      setBahanList(newBahan);
      setRadasList(newRadas);
    } catch (error) {
      console.error("AI Calculation failed", error);
      alert("Gagal mengira kuantiti menggunakan AI. Sila semak sambungan internet atau API key.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eksperimenId || !tarikh || !masa) return;

    const exp = experiments.find(e => e.id === eksperimenId);
    if (!exp) return;

    addBooking({
      guru_id: user.id,
      guru_name: user.name,
      guru_email: user.email,
      eksperimen_id: exp.id,
      eksperimen_tajuk: exp.tajuk,
      tingkatan: `Tingkatan ${tingkatan}`,
      kelas: kelas,
      makmal: makmal,
      tarikh,
      masa,
      bilangan_kumpulan: bilKumpulan,
      senarai_bahan: bahanList,
      senarai_radas: radasList,
      lain_lain: lainLain,
      catatan_guru: catatanGuru,
    });

    navigate('/');
  };

  const handleItemChange = (type: 'bahan' | 'radas', index: number, field: string, value: any) => {
    if (type === 'bahan') {
      const newList = [...bahanList];
      newList[index] = { ...newList[index], [field]: value };
      setBahanList(newList);
    } else {
      const newList = [...radasList];
      newList[index] = { ...newList[index], [field]: value };
      setRadasList(newList);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Borang Tempahan Baru</h1>
        <p className="text-slate-500">Isi maklumat di bawah untuk menempah radas dan bahan makmal.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        {/* Section 1: Maklumat Asas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Tempahan</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="jenisTempahan"
                  value="Eksperimen"
                  checked={jenisTempahan === 'Eksperimen'}
                  onChange={(e) => {
                    setJenisTempahan(e.target.value as 'Aktiviti' | 'Eksperimen');
                    setEksperimenId('');
                  }}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-slate-700">Eksperimen</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="jenisTempahan"
                  value="Aktiviti"
                  checked={jenisTempahan === 'Aktiviti'}
                  onChange={(e) => {
                    setJenisTempahan(e.target.value as 'Aktiviti' | 'Eksperimen');
                    setEksperimenId('');
                  }}
                  className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-slate-700">Aktiviti</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tingkatan</label>
            <select
              value={tingkatan}
              onChange={(e) => {
                const newTingkatan = Number(e.target.value);
                setTingkatan(newTingkatan);
                setKelas(schoolClasses[`Tingkatan ${newTingkatan}`][0]);
                setEksperimenId('');
              }}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {[1, 2, 3, 4, 5].map(t => (
                <option key={t} value={t}>Tingkatan {t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Kelas</label>
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {schoolClasses[`Tingkatan ${tingkatan}`].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">{jenisTempahan}</label>
            <select
              value={eksperimenId}
              onChange={(e) => setEksperimenId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">-- Pilih {jenisTempahan} --</option>
              {filteredExperiments.map(exp => (
                <option key={exp.id} value={exp.id}>Bab {exp.bab}: {exp.tajuk}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Makmal / Bilik</label>
            <select
              value={makmal}
              onChange={(e) => setMakmal(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Makmal Integrasi 1">Makmal Integrasi 1</option>
              <option value="Makmal Integrasi 2">Makmal Integrasi 2</option>
              <option value="Makmal Integrasi 3">Makmal Integrasi 3</option>
              <option value="Bilik Sains">Bilik Sains</option>
              <option value="Bilik Matematik">Bilik Matematik</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tarikh</label>
            <input
              type="date"
              required
              value={tarikh}
              onChange={(e) => setTarikh(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Masa</label>
            <input
              type="time"
              required
              value={masa}
              onChange={(e) => setMasa(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bilangan Kumpulan Murid</label>
            <input
              type="number"
              min="1"
              max="20"
              required
              value={bilKumpulan}
              onChange={(e) => setBilKumpulan(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 2: Senarai Bahan & Radas */}
        {eksperimenId && (
          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Keperluan {jenisTempahan}</h2>
              <button
                type="button"
                onClick={handleCalculateAI}
                disabled={isCalculating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Kira Kuantiti AI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Radas */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4 bg-slate-100 px-3 py-1.5 rounded-md inline-block">Senarai Radas</h3>
                {radasList.length > 0 ? (
                  <div className="space-y-3">
                    {radasList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-600 flex-1">{item.nama}</span>
                        <div className="flex items-center gap-2 w-auto">
                          <input
                            type="number"
                            min="1"
                            value={item.kuantiti}
                            onChange={(e) => handleItemChange('radas', idx, 'kuantiti', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-slate-500 w-8">{item.unit}</span>
                          
                          <input
                            type="number"
                            min="0"
                            placeholder="Saiz"
                            value={item.unit_khas_nilai || ''}
                            onChange={(e) => handleItemChange('radas', idx, 'unit_khas_nilai', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                          />
                          <select
                            value={item.unit_khas || ''}
                            onChange={(e) => handleItemChange('radas', idx, 'unit_khas', e.target.value)}
                            className="w-16 px-1 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="">-</option>
                            <option value="ml">ml</option>
                            <option value="l">l</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                            <option value="'C">'C</option>
                            <option value="g">g</option>
                            <option value="Kg">Kg</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Tiada radas diperlukan.</p>
                )}
              </div>

              {/* Bahan */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4 bg-slate-100 px-3 py-1.5 rounded-md inline-block">Senarai Bahan</h3>
                {bahanList.length > 0 ? (
                  <div className="space-y-3">
                    {bahanList.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-600 flex-1">{item.nama}</span>
                        <div className="flex items-center gap-2 w-auto">
                          <input
                            type="number"
                            min="1"
                            value={item.kuantiti}
                            onChange={(e) => handleItemChange('bahan', idx, 'kuantiti', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                          />
                          <span className="text-xs text-slate-500 w-8">{item.unit}</span>

                          <input
                            type="number"
                            min="0"
                            placeholder="Saiz"
                            value={item.unit_khas_nilai || ''}
                            onChange={(e) => handleItemChange('bahan', idx, 'unit_khas_nilai', Number(e.target.value))}
                            className="w-16 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                          />
                          <select
                            value={item.unit_khas || ''}
                            onChange={(e) => handleItemChange('bahan', idx, 'unit_khas', e.target.value)}
                            className="w-16 px-1 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="">-</option>
                            <option value="ml">ml</option>
                            <option value="l">l</option>
                            <option value="cm">cm</option>
                            <option value="m">m</option>
                            <option value="'C">'C</option>
                            <option value="g">g</option>
                            <option value="Kg">Kg</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Tiada bahan diperlukan.</p>
                )}
              </div>
            </div>

            {/* Lain-lain & Catatan */}
            <div className="mt-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lain-lain (Radas atau Bahan Tambahan)
                </label>
                <textarea
                  value={lainLain}
                  onChange={(e) => setLainLain(e.target.value)}
                  placeholder="Contoh: 2 unit Bikar 50ml, 1 helai kertas turas..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Sila nyatakan sebarang radas atau bahan tambahan yang tidak disenaraikan di atas.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Catatan Guru (Untuk Pembantu Makmal)
                </label>
                <textarea
                  value={catatanGuru}
                  onChange={(e) => setCatatanGuru(e.target.value)}
                  placeholder="Contoh: Sila sediakan radas di meja depan..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={!eksperimenId || isCalculating}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Hantar Tempahan
          </button>
        </div>
      </form>
    </div>
  );
}
