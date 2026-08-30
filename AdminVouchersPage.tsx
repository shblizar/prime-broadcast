import React, { useEffect, useState } from 'react';
import {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../../services/api';
import { Voucher } from '../../types';
import { formatIDR } from '../../utils/currency';
import { Plus, Edit2, Trash2, Tag, Check, X } from 'lucide-react';

export const AdminVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fields
  const [code, setCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(300000);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(0);
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllVouchers();
      setVouchers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setCode('');
    setDiscountAmount(300000);
    setMinPurchaseAmount(0);
    setValidFrom('');
    setValidUntil('');
    setUsageLimit(undefined);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Voucher) => {
    setEditingId(item.id);
    setCode(item.code);
    setDiscountAmount(item.discount_amount);
    setMinPurchaseAmount(item.min_purchase_amount || 0);
    setValidFrom(item.valid_from || '');
    setValidUntil(item.valid_until || '');
    setUsageLimit(item.usage_limit || undefined);
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountAmount <= 0) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateVoucher(editingId, {
          code: code.trim().toUpperCase(),
          discount_amount: discountAmount,
          min_purchase_amount: minPurchaseAmount,
          valid_from: validFrom || undefined,
          valid_until: validUntil || undefined,
          usage_limit: usageLimit || undefined,
          is_active: isActive,
        });
      } else {
        await createVoucher({
          code: code.trim().toUpperCase(),
          discount_amount: discountAmount,
          min_purchase_amount: minPurchaseAmount,
          valid_from: validFrom || undefined,
          valid_until: validUntil || undefined,
          usage_limit: usageLimit || undefined,
          is_active: isActive,
        });
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan voucher');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, voucherCode: string) => {
    if (!window.confirm(`Hapus voucher "${voucherCode}"?`)) return;
    try {
      await deleteVoucher(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6" id="admin-vouchers-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081A2E]">
            Voucher Diskon & Promo
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola kode voucher potongan harga, masa berlaku, dan batas kuota pemakaian
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Voucher
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat voucher...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada voucher yang terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Kode Voucher</th>
                  <th className="px-4 py-3">Potongan Diskon</th>
                  <th className="px-4 py-3">Min. Belanja</th>
                  <th className="px-4 py-3">Masa Berlaku</th>
                  <th className="px-4 py-3">Pemakaian</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-[#A40D35]">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#081A2E]">
                      {formatIDR(item.discount_amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.min_purchase_amount ? formatIDR(item.min_purchase_amount) : 'Tanpa min.'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.valid_until ? `s.d ${item.valid_until}` : 'Tanpa batas'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-semibold">
                      {item.usage_count} {item.usage_limit ? `/ ${item.usage_limit}` : 'kali'}
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
                        onClick={() => handleDelete(item.id, item.code)}
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#081A2E]">
                {editingId ? 'Edit Voucher' : 'Tambah Voucher Diskon'}
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
                <label className="block font-bold text-slate-700 mb-1">Kode Voucher *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: DISKON10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase tracking-wider font-bold focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Diskon (IDR) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={10000}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min. Pembelian (IDR)</label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berlaku Dari</label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berlaku Sampai</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batas Kuota Pemakaian (Opsional)</label>
                <input
                  type="number"
                  min={1}
                  value={usageLimit || ''}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Kosongkan jika tanpa batas kuota"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="voucher-is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#A40D35]"
                />
                <label htmlFor="voucher-is-active" className="font-bold text-slate-700 cursor-pointer">
                  Aktifkan Kode Voucher
                </label>
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
