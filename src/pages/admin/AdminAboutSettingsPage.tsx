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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Info className="w-6 h-6 text-[#A40D35]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
              Kelola Tentang Prime Broadcast
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ubah narasi profil perusahaan, positioning brand, dan teks deskripsi yang tampil di section Homepage.
          </p>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between gap-3 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-semibold hover:underline opacity-80">
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Eyebrow */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Sub-judul / Tagline Kecil (Eyebrow)
            </label>
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Contoh: Tentang Kami"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35]/20 focus:border-[#A40D35]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Judul Utama Section
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Tentang Prime Broadcast"
              required
              className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35]/20 focus:border-[#A40D35]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Teks Deskripsi Perusahaan (Mendukung Multi-paragraf)
            </label>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan deskripsi lengkap profil Prime Broadcast..."
              required
              className="w-full px-4 py-3 text-sm leading-relaxed border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35]/20 focus:border-[#A40D35]"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Gunakan baris baru (enter dua kali) untuk memisahkan antar paragraf pada tampilan publik.
            </p>
          </div>

          {/* Live Preview Box */}
          <div className="border border-slate-100 bg-[#F7F5F1] p-6 rounded-xl space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Pratinjau Tampilan Homepage
            </span>
            {eyebrow && (
              <div className="text-xs font-bold tracking-widest uppercase text-[#A40D35]">{eyebrow}</div>
            )}
            <h3 className="text-xl font-bold text-[#081A2E]">{title || 'Judul Section'}</h3>
            <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
              {description || 'Deskripsi belum diisi...'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Teks Default
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#A40D35] hover:bg-[#850B2B] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
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
