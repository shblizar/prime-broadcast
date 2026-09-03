import React, { useEffect, useState } from 'react';
import { getSiteSettings, updateSiteSettings } from '../../services/api';
import { SiteSettings } from '../../types';
import { Settings, Check, Phone, Mail, Instagram, Save } from 'lucide-react';

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
    <div className="space-y-6 max-w-3xl" id="admin-settings-page">
      <div>
        <h1 className="text-2xl font-bold text-[#081A2E]">
          Pengaturan Kontak & Brand
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kelola nomor WhatsApp tujuan konsultasi, email resmi, tautan media sosial, dan deskripsi perusahaan
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan kontak & brand berhasil diperbarui ke seluruh website publik.</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat pengaturan...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor WhatsApp Resmi Operasional *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="6285128051950"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg font-bold text-[#081A2E] focus:ring-2 focus:ring-[#081A2E] outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nomor ini digunakan sebagai tujuan redirect saat klien menekan tombol "Konsultasi via WhatsApp" dan submit pemesanan.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email Resmi *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="primebroadcast.id@gmail.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
              />
            </div>
          </div>

          {/* Socials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Akun / URL Instagram
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@primebroadcast_"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Akun / URL TikTok
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@primebroadcast_"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
              />
            </div>
          </div>

          {/* Company Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsi Singkat Perusahaan (Footer & Meta)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Prime Broadcast adalah vendor live streaming broadcast..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
