import React, { useEffect, useState } from 'react';
import {
  getAllAddons,
  createAddon,
  updateAddon,
  deleteAddon,
} from '../../services/api';
import { Addon } from '../../types';
import { formatIDR } from '../../utils/currency';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const AdminAddonsPage: React.FC = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(350000);
  const [unitLabel, setUnitLabel] = useState('/event');
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
      const data = await getAllAddons();
      setAddons(data);
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
    setPrice(350000);
    setUnitLabel('/event');
    setAllowQuantity(true);
    setMinQuantity(1);
    setMaxQuantity(10);
    setDisplayOrder((addons.length || 0) + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Addon) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price);
    setUnitLabel(item.unit_label || '/event');
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
        await updateAddon(editingId, {
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
        await createAddon({
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
      alert(err.message || 'Gagal menyimpan add-on');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!window.confirm(`Hapus add-on "${itemName}"?`)) return;
    try {
      await deleteAddon(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6" id="admin-addons-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081A2E]">
            Add-ons & Perangkat Tambahan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola layanan tambahan seperti Internet Bonding, Clip-on mic, TV Confidence Monitor, Zoom Operator, dll.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Add-on
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat add-ons...</div>
        ) : addons.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada data add-on layanan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Add-on</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Satuan</th>
                  <th className="px-4 py-3">Kuantitas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {addons.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-[#081A2E]">{item.name}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      {item.description || '-'}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#081A2E]">
                      {formatIDR(item.price)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.unit_label}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.allow_quantity ? `${item.min_quantity} - ${item.max_quantity}` : '1 (Fixed)'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#081A2E]">
                {editingId ? 'Edit Add-on' : 'Tambah Add-on Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Add-on *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Mobile Internet Bonding 4-SIM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi perangkat atau layanan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga (IDR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={10000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan *</label>
                  <input
                    type="text"
                    required
                    value={unitLabel}
                    onChange={(e) => setUnitLabel(e.target.value)}
                    placeholder="Contoh: /event, /unit"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addon-allow-quantity"
                  checked={allowQuantity}
                  onChange={(e) => setAllowQuantity(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#A40D35]"
                />
                <label htmlFor="addon-allow-quantity" className="font-bold text-slate-700 cursor-pointer">
                  Izinkan Pengaturan Jumlah (Quantity)
                </label>
              </div>

              {allowQuantity && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Min Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={maxQuantity}
                      onChange={(e) => setMaxQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Urutan Tampilan</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="addon-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35]"
                  />
                  <label htmlFor="addon-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Aktif di Website
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg font-bold text-white bg-[#A40D35] hover:bg-[#850B2B]"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
