import React, { useEffect, useState, useRef } from 'react';
import { FounderProfile } from '../../types';
import {
  getAdminFounders,
  addFounder,
  updateFounder,
  deleteFounder,
  uploadFounderPhotoFile,
} from '../../services/api';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  ArrowUp,
  ArrowDown,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AdminFoundersPage: React.FC = () => {
  const [founders, setFounders] = useState<FounderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<FounderProfile | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [photoPath, setPhotoPath] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFounders = async () => {
    setLoading(true);
    try {
      const data = await getAdminFounders();
      setFounders(data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memuat profil founder' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFounders();
  }, []);

  const openAddModal = () => {
    setEditingFounder(null);
    setName('');
    setRole('');
    setShortBio('');
    setPhotoPath('');
    setDisplayOrder(founders.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (founder: FounderProfile) => {
    setEditingFounder(founder);
    setName(founder.name);
    setRole(founder.role);
    setShortBio(founder.short_bio || '');
    setPhotoPath(founder.photo_path);
    setDisplayOrder(founder.display_order);
    setIsActive(founder.is_active);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification({ type: 'error', message: 'Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.' });
      return;
    }

    setUploadingPhoto(true);
    try {
      const url = await uploadFounderPhotoFile(file);
      setPhotoPath(url);
      setNotification({ type: 'success', message: 'Foto founder berhasil diunggah.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengunggah foto' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !photoPath) {
      setNotification({ type: 'error', message: 'Nama, role/jabatan, dan foto founder wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      if (editingFounder) {
        await updateFounder(editingFounder.id, {
          name: name.trim(),
          role: role.trim(),
          short_bio: shortBio.trim() || null,
          photo_path: photoPath,
          display_order: Number(displayOrder),
          is_active: isActive,
        });
        setNotification({ type: 'success', message: 'Profil founder berhasil diperbarui.' });
      } else {
        await addFounder({
          name: name.trim(),
          role: role.trim(),
          short_bio: shortBio.trim() || null,
          photo_path: photoPath,
          display_order: Number(displayOrder),
          is_active: isActive,
        });
        setNotification({ type: 'success', message: 'Profil founder baru berhasil ditambahkan.' });
      }
      setIsModalOpen(false);
      fetchFounders();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan founder' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (founder: FounderProfile) => {
    try {
      await updateFounder(founder.id, { is_active: !founder.is_active });
      fetchFounders();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengubah status profil' });
    }
  };

  const handleDelete = async (founder: FounderProfile) => {
    if (!window.confirm(`Hapus profil ${founder.name}?`)) return;
    try {
      await deleteFounder(founder.id);
      setNotification({ type: 'success', message: 'Profil berhasil dihapus.' });
      fetchFounders();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menghapus profil' });
    }
  };

  const handleMoveOrder = async (founder: FounderProfile, direction: 'up' | 'down') => {
    const currentIndex = founders.findIndex((f) => f.id === founder.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === founders.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetFounder = founders[targetIndex];

    try {
      await updateFounder(founder.id, { display_order: targetFounder.display_order });
      await updateFounder(targetFounder.id, { display_order: founder.display_order });
      fetchFounders();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengubah urutan' });
    }
  };

  return (
    <div className="space-y-6" id="admin-founders">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#A40D35]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
              Profil Founder & Key People
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola profil pendiri dan pimpinan produksi yang tampil dengan animasi interaktif di Homepage.
          </p>
        </div>
        <button
          onClick={openAddModal}
          id="btn-add-founder"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A40D35] hover:bg-[#850B2B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Founder Baru</span>
        </button>
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
        <div className="py-16 text-center text-slate-400 text-sm">Memuat profil founder...</div>
      ) : founders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">Belum Ada Profil Founder</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Tampilkan figur profesional di balik Prime Broadcast untuk membangun kepercayaan klien korporat.
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#081A2E] text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" /> Tambah Profil
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {founders.map((founder, idx) => (
            <div
              key={founder.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                founder.is_active ? 'border-slate-200 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                {/* Photo */}
                <div className="relative aspect-square bg-slate-100 overflow-hidden group">
                  <img
                    src={founder.photo_path}
                    alt={founder.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded text-white text-[11px] font-mono">
                    #{founder.display_order}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium backdrop-blur-md ${
                        founder.is_active ? 'bg-emerald-500/80 text-white' : 'bg-slate-600/80 text-slate-200'
                      }`}
                    >
                      {founder.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base">{founder.name}</h3>
                  <p className="text-xs font-semibold text-[#A40D35] uppercase tracking-wider">{founder.role}</p>
                  {founder.short_bio && (
                    <p className="text-xs text-slate-600 line-clamp-3 pt-1.5 leading-relaxed">
                      {founder.short_bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(founder, 'up')}
                    disabled={idx === 0}
                    title="Geser Urutan ke Atas"
                    className="p-1.5 text-slate-500 hover:text-[#081A2E] disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(founder, 'down')}
                    disabled={idx === founders.length - 1}
                    title="Geser Urutan ke Bawah"
                    className="p-1.5 text-slate-500 hover:text-[#081A2E] disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(founder)}
                    title={founder.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    className={`p-1.5 rounded-lg border text-xs ${
                      founder.is_active
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {founder.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(founder)}
                    title="Edit Profil"
                    className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(founder)}
                    title="Hapus Profil"
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#081A2E]">
                {editingFounder ? 'Edit Profil Founder' : 'Tambah Founder Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Foto Profil (Wajib)
                </label>
                <div className="space-y-3">
                  {photoPath ? (
                    <div className="relative aspect-square max-w-[180px] mx-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                      <img src={photoPath} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white/90 text-xs font-semibold text-slate-900 rounded-lg hover:bg-white"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoPath('')}
                          className="px-2.5 py-1 bg-rose-600 text-xs font-semibold text-white rounded-lg hover:bg-rose-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#A40D35] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-rose-50/20"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        {uploadingPhoto ? 'Mengunggah foto...' : 'Klik untuk unggah foto portrait/persegi'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Rekomendasi rasio 1:1 atau portrait</p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Or Direct URL */}
                  <div>
                    <span className="text-[11px] text-slate-400">Atau URL gambar langsung:</span>
                    <input
                      type="url"
                      value={photoPath}
                      onChange={(e) => setPhotoPath(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan / Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Contoh: Founder & Technical Director"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biografi Singkat / Pengalaman
                </label>
                <textarea
                  rows={3}
                  value={shortBio}
                  onChange={(e) => setShortBio(e.target.value)}
                  placeholder="Tuliskan ringkasan pengalaman dan keahlian..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                />
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                  >
                    <option value="true">Aktif (Tampilkan)</option>
                    <option value="false">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingPhoto}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#A40D35] hover:bg-[#850B2B] rounded-lg shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Profil Founder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
