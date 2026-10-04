import React, { useEffect, useState } from 'react';
import {
  getAllUpgrades,
  createUpgrade,
  updateUpgrade,
  deleteUpgrade,
} from '../../services/api';
import { Upgrade } from '../../types';
import { formatIDR } from '../../utils/currency';
import {
  Plus,
  Edit2,
  Trash2,
  Sliders,
  RefreshCw,
  X,
  CheckCircle2,
  Hash,
} from 'lucide-react';

export const AdminUpgradesPage: React.FC = () => {
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(500000);
  const [unitLabel, setUnitLabel] = useState('/unit');
  const [allowQuantity, setAllowQuantity] = useState(true);
  const [minQuantity, setMinQuantity] = useState<number>(1);
  const [maxQuantity, setMaxQuantity] = useState<number>(10);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllUpgrades();
      setUpgrades(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice(500000);
    setUnitLabel('/unit');
    setAllowQuantity(true);
    setMinQuantity(1);
    setMaxQuantity(10);
    setDisplayOrder((upgrades.length || 0) + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Upgrade) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price);
    setUnitLabel(item.unit_label || '/unit');
    setAllowQuantity(item.allow_quantity);
    setMinQuantity(item.min_quantity || 1);
    setMaxQuantity(item.max_quantity || 10);
    setDisplayOrder(item.display_order);
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price < 0) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateUpgrade(editingId, {
          name: name.trim(),
          description: description.trim(),
          price,
          unit_label: unitLabel.trim(),
          allow_quantity: allowQuantity,
          min_quantity: minQuantity,
          max_quantity: maxQuantity,
          display_order: displayOrder,
          is_active: isActive,
        });
      } else {
        await createUpgrade({
          name: name.trim(),
          description: description.trim(),
          price,
          unit_label: unitLabel.trim(),
          allow_quantity: allowQuantity,
          min_quantity: minQuantity,
          max_quantity: maxQuantity,
          display_order: displayOrder,
          is_active: isActive,
        });
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan upgrade');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!window.confirm(`Hapus item upgrade "${itemName}"?`)) return;
    try {
      await deleteUpgrade(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6" id="admin-upgrades-page">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Sliders className="w-3 h-3 text-[#A40D35]" />
              Katalog Tingkatan Perangkat
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {upgrades.length} upgrade terkonfigurasi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Optional Upgrades
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola pilihan upgrade spesifikasi perangkat seperti upgrade kamera Cinema FX3, wireless video transmitter Hollyland, switcher Blackmagic, dan rigging kamera.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang upgrade"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Upgrade</span>
          </button>
        </div>
      </div>

      {/* 2. Upgrades Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
            <span>Memuat opsi upgrade...</span>
          </div>
        ) : upgrades.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Sliders className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Belum ada data optional upgrade.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Tambahkan opsi peningkatan mutu alat produksi untuk memberikan nilai lebih pada paket siaran.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Upgrade Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Urutan</th>
                  <th className="px-5 py-3.5">Nama Upgrade</th>
                  <th className="px-5 py-3.5">Deskripsi</th>
                  <th className="px-5 py-3.5">Harga Tambahan</th>
                  <th className="px-5 py-3.5">Satuan</th>
                  <th className="px-5 py-3.5">Batas Kuantitas</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {upgrades.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-mono text-slate-400 text-xs">
                      #{item.display_order}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-[#081A2E] text-sm">
                      {item.name}
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                      {item.description || '-'}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-[#081A2E] text-sm">
                      {formatIDR(item.price)}
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold">
                        {item.unit_label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.allow_quantity ? (
                        <span className="text-xs text-slate-700 font-semibold">
                          {item.min_quantity} – {item.max_quantity} unit
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">1 (Tetap)</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        title="Edit Upgrade"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Hapus Upgrade"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#081A2E] text-white">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Konfigurasi Tingkatan Alat
                </div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {editingId ? 'Edit Optional Upgrade' : 'Tambah Optional Upgrade'}
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

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nama Upgrade <span className="text-[#A40D35]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Tambahan Kamera Cinema FX3 4K"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan spesifikasi alat, lensa, atau nilai tambah siaran"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Tarif Tambahan (IDR) <span className="text-[#A40D35]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={10000}
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
                    Label Satuan <span className="text-[#A40D35]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                    placeholder="Contoh: /unit, /kamera, /hari"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="allow-quantity"
                  checked={allowQuantity}
                  onChange={(e) => setAllowQuantity(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                />
                <label htmlFor="allow-quantity" className="font-bold text-slate-700 cursor-pointer">
                  Izinkan Klien Mengatur Jumlah Unit (Quantity Multiplier)
                </label>
              </div>

              {allowQuantity && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batas Minimal</label>
                    <input
                      type="number"
                      min={1}
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batas Maksimal</label>
                    <input
                      type="number"
                      min={1}
                      value={maxQuantity}
                      onChange={(e) => setMaxQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                    />
                  </div>
                </div>
              )}

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
                    id="upgrade-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                  />
                  <label htmlFor="upgrade-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Aktif di Website Publik
                  </label>
                </div>
              </div>

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
                  {saving ? 'Menyimpan...' : 'Simpan Upgrade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
