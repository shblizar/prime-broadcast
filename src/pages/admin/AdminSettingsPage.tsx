import React, { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../services/api';
import { SiteSettings } from '../../types';
import {
  Settings,
  Check,
  Phone,
  Mail,
  Instagram,
  Save,
  RefreshCw,
  Share2,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form
  const [whatsapp, setWhatsapp] = useState('6285150555195');
  const [email, setEmail] = useState('primebroadcast.id@gmail.com');
  const [instagram, setInstagram] = useState('@primebroadcast_');
  const [tiktok, setTiktok] = useState('@primebroadcast_');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getSiteSettings();
      if (data) {
        setSettings(data);
        setWhatsapp(data.whatsapp_number || '6285150555195');
        setEmail(data.email || 'primebroadcast.id@gmail.com');
        setInstagram(data.instagram_url || '@primebroadcast_');
        setTiktok(data.tiktok_url || '@primebroadcast_');
        setDescription(data.company_description || '');
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
      const updated = await updateSiteSettings({
        whatsapp_number: whatsapp.trim(),
        email: email.trim(),
        instagram_url: instagram.trim(),
        tiktok_url: tiktok.trim(),
        company_description: description.trim(),
      });
      setSettings(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl" id="admin-settings-page">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Settings className="w-3 h-3 text-[#A40D35]" />
              Konfigurasi Sistem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Pengaturan Kontak & Brand
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola nomor WhatsApp konsultasi pemesanan, alamat email resmi, tautan media sosial, dan deskripsi footer yang disinkronkan ke seluruh situs.
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

      {/* 2. Success Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <span>Pengaturan kontak dan profil brand berhasil diperbarui ke seluruh website publik.</span>
          </div>
          <button
            onClick={() => setSuccessMsg(false)}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-200/90 shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
          <span>Memuat pengaturan kontak & brand...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Section 1: Saluran Komunikasi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Phone className="w-4 h-4 text-[#A40D35]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Saluran Komunikasi Langsung
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp Operasional <span className="text-[#A40D35]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="6285150555195"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold text-[#081A2E] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Format internasional tanpa spasi (cth: 6285150555195). Digunakan otomatis pada tombol WhatsApp floating dan checkout pemesanan.
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Alamat Email Resmi <span className="text-[#A40D35]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="primebroadcast.id@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Email resmi perusahaan untuk surat-menyurat dan penawaran korporat yang tercantum pada footer.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Media Sosial */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Share2 className="w-4 h-4 text-[#A40D35]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Kanal Media Sosial
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Instagram (Handle atau Link)
                </label>
                <div className="relative">
                  <Instagram className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@primebroadcast_"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  TikTok (Handle atau Link)
                </label>
                <div className="relative">
                  <Share2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="@primebroadcast_"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Ringkasan Brand */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-[#A40D35]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Deskripsi Singkat Footer & Metadata
              </h2>
            </div>

            <div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Prime Broadcast adalah vendor live streaming broadcast dan dokumentasi video multi-camera profesional di Jakarta..."
                className="w-full px-3.5 py-3 text-xs leading-relaxed border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Teks ini tampil di area bawah (footer) website di samping logo Prime Broadcast dan informasi hak cipta.
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
