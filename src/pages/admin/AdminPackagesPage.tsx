import React, { useEffect, useState } from 'react';
import {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from '../../services/api';
import { Package } from '../../types';
import { formatIDR } from '../../utils/currency';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  Clock,
  Layers,
  X,
  ShieldCheck,
  RefreshCw,
  Hash,
  AlertCircle,
} from 'lucide-react';

export const AdminPackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(3500000);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [features, setFeatures] = useState<{ id?: string; feature_text: string }[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await getAllPackages();
      setPackages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPackageId(null);
    setErrorMessage(null);
    setName('');
    setDescription('');
    setPrice(3500000);
    setDurationHours(4);
    setDisplayOrder((packages.length || 0) + 1);
    setIsActive(true);
    setFeatures([
      { feature_text: '2 Kamera Broadcast Full HD' },
      { feature_text: '1 Video Switcher Operator' },
      { feature_text: 'Audio Mixer Integration' },
      { feature_text: 'Output Full HD 1080p' },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackageId(pkg.id);
    setErrorMessage(null);
    setName(pkg.name);
    setDescription(pkg.description || '');
    setPrice(pkg.price);
    setDurationHours(pkg.duration_hours);
    setDisplayOrder(pkg.display_order);
    setIsActive(pkg.is_active);
    setFeatures(
      pkg.features ? pkg.features.map((f) => ({ id: f.id, feature_text: f.feature_text })) : []
    );
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, { feature_text: newFeatureText.trim() }]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    setSaving(true);
    setErrorMessage(null);
    try {
      const formattedFeatures = features.map((f, i) => ({
        id: f.id,
        feature_text: f.feature_text,
        display_order: i + 1,
      }));

      if (editingPackageId) {
        await updatePackage(editingPackageId, {
          name: name.trim(),
          description: description.trim(),
          price,
          duration_hours: durationHours,
          display_order: displayOrder,
          is_active: isActive,
          features: formattedFeatures,
        });
      } else {
        await createPackage({
          name: name.trim(),
          description: description.trim(),
          price,
          duration_hours: durationHours,
          display_order: displayOrder,
          is_active: isActive,
          features: formattedFeatures,
        });
      }

      await fetchPackages();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save package error:', err);
      const msg = err?.message || 'Gagal menyimpan paket';
      setErrorMessage(`Gagal menyimpan paket: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, pkgName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus paket "${pkgName}"?`)) return;
    try {
      await deletePackage(id);
      await fetchPackages();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus paket');
    }
  };

  return (
    <div className="space-y-6" id="admin-packages-page">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Layers className="w-3 h-3 text-[#A40D35]" />
              Katalog Layanan Siaran
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {packages.length} paket terdaftar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Paket & Penawaran Siaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola konfigurasi paket produksi siaran langsung, durasi jam operasional standar, tarif harga dasar, dan rincian fasilitas alat untuk klien publik.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchPackages}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang paket"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Paket Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Packages Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
          <span>Memuat seluruh paket siaran...</span>
        </div>
      ) : packages.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-xl border border-slate-200/90 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            Belum ada paket siaran yang dibuat.
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Klik tombol "Tambah Paket Baru" di atas untuk menambahkan paket penyiaran pertama ke sistem.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Paket Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-xl border flex flex-col justify-between shadow-sm transition-all overflow-hidden ${
                pkg.is_active ? 'border-slate-200/90 hover:border-slate-300' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div className="p-5 sm:p-6 space-y-4">
                {/* Header row: Order, Name, Status */}
                <div className="flex justify-between items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider inline-flex items-center gap-0.5">
                        <Hash className="w-2.5 h-2.5" /> Urutan {pkg.display_order}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[#081A2E] text-lg tracking-tight">
                      {pkg.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      pkg.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                  {pkg.description || 'Tidak ada deskripsi rinci untuk paket ini.'}
                </p>

                {/* Duration & Specs Chip */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Durasi Standar: {pkg.duration_hours} Jam</span>
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Fasilitas Termasuk ({pkg.features?.length || 0})
                  </div>
                  {pkg.features && pkg.features.length > 0 ? (
                    <div className="space-y-1.5">
                      {pkg.features.map((f) => (
                        <div key={f.id} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{f.feature_text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">Belum ada rincian fasilitas.</div>
                  )}
                </div>
              </div>

              {/* Price & Action Buttons Footer */}
              <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tarif Dasar</div>
                  <div className="text-lg font-extrabold text-[#081A2E]">
                    {formatIDR(pkg.price)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                    title="Edit Konfigurasi Paket"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(pkg.id, pkg.name)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    title="Hapus Paket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Modal Create/Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#081A2E] text-white">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Formulir Konfigurasi
                </div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {editingPackageId ? 'Edit Paket Siaran' : 'Tambah Paket Siaran Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nama Paket Siaran <span className="text-[#A40D35]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Paket 3 Kamera Broadcast Multi-Angle"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsikan segmentasi atau rekomendasi jenis acara (misal: Wisuda, Konser, Webinar)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Harga Dasar (IDR) <span className="text-[#A40D35]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                  <div className="mt-1 text-[11px] text-slate-500 font-semibold">
                    Preview: {formatIDR(price)}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Durasi Siaran Standar (Jam) <span className="text-[#A40D35]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={24}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Urutan Tampilan</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 sm:pt-4">
                  <input
                    type="checkbox"
                    id="package-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                  />
                  <label htmlFor="package-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Tampilkan di Website Publik
                  </label>
                </div>
              </div>

              {/* Features Editor */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-2">
                  Daftar Fasilitas & Spesifikasi Paket
                </label>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Tambah poin fitur (contoh: 3x Kamera Sony FX3)"
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-[#081A2E] text-white font-bold rounded-lg hover:bg-slate-800 text-xs transition-colors cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>

                <div className="space-y-1.5 max-h-44 overflow-y-auto">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/70 rounded-lg"
                    >
                      <span className="font-medium text-slate-700">{f.feature_text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                        title="Hapus poin"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-5 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
