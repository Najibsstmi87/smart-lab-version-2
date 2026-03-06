import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { predictQuantity } from '../lib/ai';
import { schoolClasses } from '../lib/schoolData';
import { Sparkles, Loader2, Save } from 'lucide-react';

type Item = {
  nama: string;
  kuantiti: number;
  unit: string;
  unit_khas_nilai?: string; // string supaya boleh taip 200 tanpa reset fokus
  unit_khas?: string;
};

function UnitSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full md:w-16 px-2 py-2 md:px-1 md:py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
    >
      <option value="">-</option>
      <option value="ml">ml</option>
      <option value="l">l</option>
      <option value="cm">cm</option>
      <option value="m">m</option>
      <option value="°C">°C</option>
      <option value="g">g</option>
      <option value="kg">kg</option>
    </select>
  );
}

const ItemRow = React.memo(function ItemRow({
  type,
  item,
  idx,
  onItemChange,
}: {
  type: 'bahan' | 'radas';
  item: Item;
  idx: number;
  onItemChange: (
    type: 'bahan' | 'radas',
    index: number,
    field: keyof Item,
    value: any
  ) => void;
}) {

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 md:border-0 md:bg-transparent md:p-0">

      {/* Nama Item */}
      <div className="text-sm text-slate-700 font-medium md:font-normal md:text-slate-600">
        {item.nama}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:mt-0 md:flex md:items-center md:gap-2">

        {/* Kuantiti */}
        <input
          type="number"
          min={1}
          value={item.kuantiti}
          onChange={(e) =>
            onItemChange(type, idx, 'kuantiti', Number(e.target.value))
          }
          className="w-full md:w-16 px-2 py-2 md:py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
        />

        {/* Unit */}
        <div className="flex items-center justify-center md:justify-start text-xs text-slate-500 md:w-10">
          {item.unit}
        </div>

        {/* Saiz */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Saiz"
          value={item.unit_khas_nilai ?? ''}
          onChange={(e) => {

            const v = e.target.value.replace(/[^\d]/g, '');

            onItemChange(
              type,
              idx,
              'unit_khas_nilai',
              v === '' ? undefined : Number(v)
            );

          }}
          className="w-full md:w-16 px-2 py-2 md:py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
        />

        {/* Unit khas */}
        <UnitSelect
          value={item.unit_khas ?? ''}
          onChange={(v) =>
            onItemChange(type, idx, 'unit_khas', v)
          }
        />

      </div>

    </div>
  );
});;

export default function BookingForm() {
  const { user } = useAuth();
  const { experiments, addBooking } = useData();
  const navigate = useNavigate();

  const [tingkatan, setTingkatan] = useState<number>(1);
  const [kelas, setKelas] = useState<string>(schoolClasses['Tingkatan 1'][0]);
  const [jenisTempahan, setJenisTempahan] = useState<'Aktiviti' | 'Eksperimen'>('Eksperimen');
  const [eksperimenId, setEksperimenId] = useState<string>('');
  const [tarikh, setTarikh] = useState('');
  const [masa, setMasa] = useState('');
  const [makmal, setMakmal] = useState<string>('Makmal Integrasi 1');
  const [bilKumpulan, setBilKumpulan] = useState<number>(5);
  const [lainLain, setLainLain] = useState<string>('');
  const [catatanGuru, setCatatanGuru] = useState<string>('');

  const [bahanList, setBahanList] = useState<Item[]>([]);
  const [radasList, setRadasList] = useState<Item[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const filteredExperiments = experiments.filter(
    (e) => e.tingkatan === tingkatan && e.jenis === jenisTempahan
  );

  useEffect(() => {
    if (eksperimenId) {
      const exp = experiments.find((e) => e.id === eksperimenId);
      if (exp) {
        setBahanList(
          exp.default_bahan.map((b) => ({
            ...b,
            kuantiti: b.kuantiti * bilKumpulan,
            unit_khas_nilai: b.unit_khas_nilai !== undefined ? String(b.unit_khas_nilai) : '',
          }))
        );

        setRadasList(
          exp.default_radas.map((r) => ({
            ...r,
            kuantiti: r.kuantiti * bilKumpulan,
            unit_khas_nilai: r.unit_khas_nilai !== undefined ? String(r.unit_khas_nilai) : '',
          }))
        );
      }
    } else {
      setBahanList([]);
      setRadasList([]);
    }
  }, [eksperimenId, bilKumpulan, experiments]);

  const handleCalculateAI = async () => {
    if (!eksperimenId) return;
    const exp = experiments.find((e) => e.id === eksperimenId);
    if (!exp) return;

    setIsCalculating(true);
    try {
      const newBahan = await Promise.all(
        exp.default_bahan.map(async (b) => {
          const qty = await predictQuantity(b.nama, b.kuantiti, bilKumpulan, 'bahan');
          return { ...b, kuantiti: qty, unit_khas_nilai: b.unit_khas_nilai !== undefined ? String(b.unit_khas_nilai) : '' };
        })
      );

      const newRadas = await Promise.all(
        exp.default_radas.map(async (r) => {
          const qty = await predictQuantity(r.nama, r.kuantiti, bilKumpulan, 'radas');
          return { ...r, kuantiti: qty, unit_khas_nilai: r.unit_khas_nilai !== undefined ? String(r.unit_khas_nilai) : '' };
        })
      );

      setBahanList(newBahan);
      setRadasList(newRadas);
    } catch (error) {
      console.error('AI Calculation failed', error);
      alert('Gagal mengira kuantiti menggunakan AI. Sila semak sambungan internet atau API key.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleItemChange = useCallback(
    (type: 'bahan' | 'radas', index: number, field: keyof Item, value: any) => {
      if (type === 'bahan') {
        setBahanList((prev) => {
          const newList = [...prev];
          newList[index] = { ...newList[index], [field]: value };
          return newList;
        });
      } else {
        setRadasList((prev) => {
          const newList = [...prev];
          newList[index] = { ...newList[index], [field]: value };
          return newList;
        });
      }
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !eksperimenId || !tarikh || !masa) return;

    const exp = experiments.find((e) => e.id === eksperimenId);
    if (!exp) return;

    const bahanConverted = bahanList.map((x) => ({
      ...x,
      unit_khas_nilai: x.unit_khas_nilai && x.unit_khas_nilai !== '' ? Number(x.unit_khas_nilai) : undefined,
    }));

    const radasConverted = radasList.map((x) => ({
      ...x,
      unit_khas_nilai: x.unit_khas_nilai && x.unit_khas_nilai !== '' ? Number(x.unit_khas_nilai) : undefined,
    }));

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
      senarai_bahan: bahanConverted as any,
      senarai_radas: radasConverted as any,
      lain_lain: lainLain,
      catatan_guru: catatanGuru,
    });

    navigate('/');
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Borang Tempahan Baru</h1>
        <p className="text-slate-500">Isi maklumat di bawah untuk menempah radas dan bahan makmal.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-200"
      >
        {/* Section 1: Maklumat Asas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Tempahan</label>
            <div className="flex flex-wrap gap-4">
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
              {[1, 2, 3, 4, 5].map((t) => (
                <option key={t} value={t}>
                  Tingkatan {t}
                </option>
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
              {schoolClasses[`Tingkatan ${tingkatan}`].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
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
              {filteredExperiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  Bab {exp.bab}: {exp.tajuk}
                </option>
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
              min={1}
              max={20}
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
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Keperluan {jenisTempahan}</h2>

              <button
                type="button"
                onClick={handleCalculateAI}
                disabled={isCalculating}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Kira Kuantiti AI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Radas */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4 bg-slate-100 px-3 py-1.5 rounded-md inline-block">
                  Senarai Radas
                </h3>

                {radasList.length > 0 ? (
                  <div className="space-y-3">
                    {radasList.map((item, idx) => (
                      <ItemRow key={idx} type="radas" item={item} idx={idx} onItemChange={handleItemChange} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Tiada radas diperlukan.</p>
                )}
              </div>

              {/* Bahan */}
              <div>
                <h3 className="font-medium text-slate-700 mb-4 bg-slate-100 px-3 py-1.5 rounded-md inline-block">
                  Senarai Bahan
                </h3>

                {bahanList.length > 0 ? (
                  <div className="space-y-3">
                    {bahanList.map((item, idx) => (
                      <ItemRow key={idx} type="bahan" item={item} idx={idx} onItemChange={handleItemChange} />
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

        <div className="pt-6 border-t border-slate-200 flex">
          <button
            type="submit"
            disabled={!eksperimenId || isCalculating}
            className="w-full md:w-auto md:ml-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            Hantar Tempahan
          </button>
        </div>
      </form>
    </div>
  );
}
