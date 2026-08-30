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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
            Paket & Fitur Siaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola paket live streaming utama, durasi siaran, harga dinamis, dan poin fitur
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Memuat paket...</div>
      ) : packages.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200/80">
          Belum ada paket siaran. Klik "Tambah Paket Baru" untuk membuat paket pertama.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                pkg.is_active ? 'border-slate-200/80 hover:shadow-md' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[#081A2E] text-base sm:text-lg">{pkg.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      pkg.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {pkg.description || 'Tidak ada deskripsi'}
                </p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Durasi: {pkg.duration_hours} Jam</span>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Fitur Paket ({pkg.features?.length || 0})
                  </div>
                  {pkg.features && pkg.features.length > 0 ? (
                    pkg.features.map((f) => (
                      <div key={f.id} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{f.feature_text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">Belum ada rincian fitur</div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Harga</div>
                  <div className="text-base sm:text-lg font-bold text-[#081A2E]">
                    {formatIDR(pkg.price)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(pkg)}
                    className="p-2 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded-xl transition-colors"
                    title="Edit Paket"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id, pkg.name)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors"
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

      {/* Modal Create/Edit Package */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col border border-slate-200/80 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-base text-[#081A2E]">
                {editingPackageId ? 'Edit Paket Siaran' : 'Tambah Paket Siaran Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
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
                  Nama Paket <span className="text-[#A40D35]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Paket 3 Kamera Broadcast"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi keunggulan paket untuk event tertentu"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Harga Paket (IDR) <span className="text-[#A40D35]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={50000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                  <div className="mt-1 text-[11px] text-slate-500 font-semibold">
                    Preview: {formatIDR(price)}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Durasi Siaran (Jam) <span className="text-[#A40D35]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={24}
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Urutan Tampilan</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
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
                  Daftar Poin Fitur & Peralatan Paket
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
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-[#081A2E] text-white font-bold rounded-xl hover:bg-slate-800 text-xs transition-colors"
                  >
                    Tambah
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl"
                    >
                      <span className="font-medium text-slate-700">{f.feature_text}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] disabled:opacity-50 transition-colors shadow-sm"
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
