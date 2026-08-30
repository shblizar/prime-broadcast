import React, { useEffect, useState } from 'react';
import { getOvertimeSettings, updateOvertimeSettings } from '../../services/api';
import { OvertimeSettings } from '../../types';
import { Clock, Check, AlertCircle, Save } from 'lucide-react';

export const AdminOvertimePage: React.FC = () => {
  const [settings, setSettings] = useState<OvertimeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form State
  const [ratePercent, setRatePercent] = useState<number>(15);
  const [minHours, setMinHours] = useState<number>(1);
  const [maxHours, setMaxHours] = useState<number>(12);
  const [stepHours, setStepHours] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getOvertimeSettings();
      if (data) {
        setSettings(data);
        setRatePercent(data.rate_percent);
        setMinHours(data.min_hours);
        setMaxHours(data.max_hours);
        setStepHours(data.step_hours);
        setIsActive(data.is_active);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);

    try {
      const updated = await updateOvertimeSettings({
        rate_percent: ratePercent,
        min_hours: minHours,
        max_hours: maxHours,
        step_hours: stepHours,
        is_active: isActive,
      });
      setSettings(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan overtime');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl" id="admin-overtime-page">
      <div>
        <h1 className="text-2xl font-bold text-[#081A2E]">
          Pengaturan Overtime Siaran
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Atur persentase tarif per jam dari harga paket dasar serta batas durasi maksimum overtime
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan overtime berhasil diperbarui dan diterapkan ke konfigurator publik.</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Status Active */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <div className="text-sm font-bold text-[#081A2E]">Fitur Overtime di Konfigurator</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Jika dinonaktifkan, slider overtime tidak akan tampil di formulir paket publik.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A40D35]"></div>
            </label>
          </div>

          {/* Rate Percent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tarif Overtime (% Per Jam dari Harga Paket) *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                required
                min={1}
                max={100}
                value={ratePercent}
                onChange={(e) => setRatePercent(Number(e.target.value))}
                className="w-32 px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-[#081A2E] focus:ring-2 focus:ring-[#081A2E] outline-none"
              />
              <span className="text-sm font-bold text-slate-600">% per jam</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Contoh: Pada paket seharga Rp3.500.000, overtime {ratePercent}% = Rp{(3500000 * (ratePercent / 100)).toLocaleString('id-ID')} / jam.
            </p>
          </div>

          {/* Max & Step Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Min Overtime</label>
              <input
                type="number"
                min={1}
                value={minHours}
                onChange={(e) => setMinHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maksimal Overtime</label>
              <input
                type="number"
                min={1}
                max={24}
                value={maxHours}
                onChange={(e) => setMaxHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Step Slider</label>
              <input
                type="number"
                min={1}
                max={4}
                value={stepHours}
                onChange={(e) => setStepHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
