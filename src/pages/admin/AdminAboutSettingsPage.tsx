import React, { useEffect, useState } from 'react';
import { AboutSettings } from '../../types';
import { getAboutSettings, updateAboutSettings } from '../../services/api';
import { Info, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const AdminAboutSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [eyebrow, setEyebrow] = useState('Tentang Kami');
  const [title, setTitle] = useState('Tentang Prime Broadcast');
  const [description, setDescription] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getAboutSettings();
      setSettings(data);
      setEyebrow(data.eyebrow || 'Tentang Kami');
      setTitle(data.title || 'Tentang Prime Broadcast');
      setDescription(data.description || '');
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memuat pengaturan About' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setNotification({ type: 'error', message: 'Judul dan isi deskripsi wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateAboutSettings({
        eyebrow: eyebrow.trim() || null,
        title: title.trim(),
        description: description.trim(),
      });
      setSettings(updated);
      setNotification({ type: 'success', message: 'Informasi Tentang Perusahaan berhasil disimpan!' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan perubahan' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setEyebrow('Tentang Kami');
    setTitle('Tentang Prime Broadcast');
    setDescription(
      'Prime Broadcast adalah vendor penyedia jasa live streaming broadcast, multi-camera setup, dan dokumentasi video profesional yang berbasis di Jakarta.\n\nPrime Broadcast mengombinasikan perangkat kelas penyiaran dengan tim eksekusi berpengalaman untuk menyajikan siaran langsung yang stabil, dinamis, dan berstandar visual tinggi.'
    );
  };

  return (
    <div className="space-y-6" id="admin-about-settings">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Info className="w-3 h-3 text-[#A40D35]" />
              Profil Brand
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Kelola Tentang Prime Broadcast
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Ubah narasi profil perusahaan, positioning keunggulan, dan deskripsi profesional yang tampil di section Tentang Kami pada Beranda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang pengaturan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 2. Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-200/90 shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
          <span>Memuat pengaturan profil...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-[#081A2E]">Formulir Konten Perusahaan</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Teks yang diperbarui akan langsung tercermin pada halaman muka</p>
            </div>

            {/* Eyebrow */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sub-judul / Eyebrow Tagline
              </label>
              <input
                type="text"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="Contoh: Tentang Kami"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
              />
              <p className="text-[11px] text-slate-400 mt-1">Label kecil berwarna aksen di atas judul utama</p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Judul Utama Section <span className="text-[#A40D35]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Tentang Prime Broadcast"
                required
                className="w-full px-3.5 py-2.5 text-xs font-bold text-[#081A2E] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Teks Deskripsi Profil <span className="text-[#A40D35]">*</span>
              </label>
              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tuliskan deskripsi lengkap profil Prime Broadcast..."
                required
                className="w-full px-3.5 py-3 text-xs leading-relaxed border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan baris baru (enter dua kali) untuk memisahkan paragraf agar rapi di website publik.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Teks Default</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A40D35] hover:bg-[#820A2A] text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pratinjau Langsung Publik
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Preview
              </span>
            </div>

            <div className="border border-slate-200/70 bg-[#F7F5F1] p-6 rounded-xl space-y-3">
              {eyebrow && (
                <div className="text-[11px] font-bold tracking-widest uppercase text-[#A40D35]">{eyebrow}</div>
              )}
              <h3 className="text-xl font-extrabold text-[#081A2E] leading-tight tracking-tight">
                {title || 'Judul Section'}
              </h3>
              <div className="text-xs text-slate-600 whitespace-pre-line leading-relaxed pt-1">
                {description || 'Deskripsi belum diisi...'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Catatan Tampilan:</p>
              <p>Warna background box di atas merepresentasikan nuansa krem natural (#F7F5F1) yang digunakan di bagian Tentang Kami di situs utama.</p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
