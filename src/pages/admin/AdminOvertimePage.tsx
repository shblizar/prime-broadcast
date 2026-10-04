import React, { useEffect, useState } from 'react';
import { getOvertimeSettings, updateOvertimeSettings } from '../../services/api';
import { OvertimeSettings } from '../../types';
import { Clock, Check, AlertCircle, Save, RefreshCw, Calculator, HelpCircle } from 'lucide-react';
import { formatIDR } from '../../utils/currency';

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

  const sampleBasePrice = 3500000;
  const sampleOvertimePerHour = sampleBasePrice * (ratePercent / 100);

  return (
    <div className="space-y-6 max-w-4xl" id="admin-overtime-page">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Clock className="w-3 h-3 text-[#A40D35]" />
              Tarif Tambahan Siaran
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Pengaturan Overtime Siaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Atur formula persentase tarif lembur siaran per jam dari harga paket dasar, batas rentang jam fleksibel, dan ketersediaan slider di kalkulator publik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang pengaturan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Pengaturan overtime berhasil diperbarui dan telah diterapkan secara live ke formulir kalkulator publik.
          </span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
          <span>Memuat konfigurasi overtime...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-6 sm:p-7 space-y-6 shadow-sm"
          >
            {/* Status Active */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-[#081A2E]">
                  Aktivasi Fitur Overtime di Website
                </div>
                <div className="text-xs text-slate-500">
                  Jika dinonaktifkan, pilihan penambahan jam tayang tidak akan muncul pada form pemesanan.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Persentase Tarif Lembur (% Per Jam dari Harga Paket Dasar) <span className="text-[#A40D35]">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={ratePercent}
                    onChange={(e) => setRatePercent(Number(e.target.value))}
                    className="w-32 px-3.5 py-2.5 text-sm font-extrabold text-[#081A2E] border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#A40D35] outline-none transition-all"
                  />
                </div>
                <span className="text-sm font-extrabold text-slate-600">% / jam siaran</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Nilai ini dikalikan langsung dengan harga paket pilihan klien untuk menentukan biaya per jam ekstra.
              </p>
            </div>

            {/* Max & Step Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Minimal Jam Overtime
                </label>
                <input
                  type="number"
                  min={1}
                  value={minHours}
                  onChange={(e) => setMinHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Maksimal Jam Overtime
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={maxHours}
                  onChange={(e) => setMaxHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kelipatan Slider (Step)
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={stepHours}
                  onChange={(e) => setStepHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan Pengaturan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </form>

          {/* Simulation / Info Card */}
          <div className="space-y-4">
            <div className="bg-[#081A2E] text-white rounded-xl p-6 shadow-sm space-y-4 border border-slate-800">
              <div className="flex items-center gap-2 text-[#A40D35]">
                <Calculator className="w-4 h-4 text-rose-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Simulasi Kalkulasi Dinamis
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400">Contoh Paket Standar:</div>
                <div className="text-base font-bold text-white">
                  Rp 3.500.000 <span className="text-xs font-normal text-slate-400">(4 Jam)</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 rounded-lg border border-white/10 space-y-1.5">
                <div className="text-xs text-slate-300 flex justify-between">
                  <span>Tarif Per Jam ({ratePercent}%):</span>
                  <span className="font-bold text-rose-400">
                    {formatIDR(sampleOvertimePerHour)}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex justify-between">
                  <span>Jika Overtime 2 Jam:</span>
                  <span className="font-bold text-white">
                    {formatIDR(sampleOvertimePerHour * 2)}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex justify-between">
                  <span>Jika Overtime 4 Jam:</span>
                  <span className="font-bold text-white">
                    {formatIDR(sampleOvertimePerHour * 4)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Formula ini otomatis disinkronkan secara real-time pada saat pengunjung memilih durasi tambahan di halaman konfigurator.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#081A2E]">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Petunjuk Rekomendasi</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Rentang persentase standar di industri live streaming Indonesia adalah <strong>10% – 20%</strong> dari harga paket pokok per jam overtime crew & operasional perangkat.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
