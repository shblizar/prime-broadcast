import React, { useEffect, useState } from 'react';
import {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../../services/api';
import { Voucher } from '../../types';
import { formatIDR } from '../../utils/currency';
import { Plus, Edit2, Trash2, Tag, Check, X, Percent, AlertCircle } from 'lucide-react';

export const AdminVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(300000);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(0);
  const [maximumDiscount, setMaximumDiscount] = useState<number | undefined>(undefined);
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
    setName('');
    setDiscountType('fixed');
    setDiscountValue(300000);
    setMinPurchaseAmount(0);
    setMaximumDiscount(undefined);
    setStartsAt('');
    setExpiresAt('');
    setUsageLimit(undefined);
    setIsActive(true);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Voucher) => {
    setEditingId(item.id);
    setCode(item.code);
    setName(item.name || '');
    const type = item.discount_type || 'fixed';
    setDiscountType(type);
    setDiscountValue(item.discount_value ?? 0);
    setMinPurchaseAmount(item.minimum_transaction ?? 0);
    setStartsAt(item.starts_at || '');
    setExpiresAt(item.expires_at || '');
    setUsageLimit(item.usage_limit || undefined);
    setMaximumDiscount(item.maximum_discount || undefined);
    setIsActive(item.is_active);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!code.trim()) {
      setValidationError('Kode voucher wajib diisi.');
      return;
    }

    if (discountType === 'percentage') {
      if (discountValue <= 0 || discountValue > 100) {
        setValidationError('Persentase diskon harus bernilai antara 0 hingga 100%.');
        return;
      }
    } else {
      if (discountValue <= 0) {
        setValidationError('Nominal diskon harus lebih besar dari Rp0.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: Omit<Voucher, 'id' | 'usage_count' | 'created_at' | 'updated_at'> = {
        code: code.trim().toUpperCase(),
        name: name.trim() || undefined,
        discount_type: discountType,
        discount_value: discountValue,
        minimum_transaction: minPurchaseAmount,
        starts_at: startsAt || undefined,
        expires_at: expiresAt || undefined,
        usage_limit: usageLimit || null,
        maximum_discount: discountType === 'percentage' && maximumDiscount ? maximumDiscount : null,
        is_active: isActive,
      };

      if (editingId) {
        await updateVoucher(editingId, payload);
      } else {
        await createVoucher(payload);
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      setValidationError(err.message || 'Gagal menyimpan voucher');
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
            Kelola kode voucher potongan harga (Fixed Amount atau Percentage), masa berlaku, dan batas kuota pemakaian
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-colors cursor-pointer"
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
                  <th className="px-4 py-3">Nama / Kode</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Nilai Diskon</th>
                  <th className="px-4 py-3">Maks. Potongan</th>
                  <th className="px-4 py-3">Min. Belanja</th>
                  <th className="px-4 py-3">Masa Berlaku</th>
                  <th className="px-4 py-3">Pemakaian</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((item) => {
                  const type = item.discount_type || 'fixed';
                  const value = item.discount_value ?? 0;
                  const minTx = item.minimum_transaction ?? 0;
                  const startsAt = item.starts_at;
                  const expiresAt = item.expires_at;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#A40D35] font-mono tracking-wider">
                          {item.code}
                        </div>
                        {item.name && (
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            {item.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-semibold capitalize">
                        {type === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Percent className="w-2.5 h-2.5" />
                            Percentage
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            <Tag className="w-2.5 h-2.5" />
                            Fixed Amount
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-[#081A2E]">
                        {type === 'percentage' ? `${value}%` : formatIDR(value)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {type === 'percentage' && item.maximum_discount ? (
                          <span className="font-semibold text-slate-700">
                            {formatIDR(item.maximum_discount)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {minTx ? formatIDR(minTx) : <span className="text-slate-400">Tanpa min.</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {startsAt || expiresAt ? (
                          <div className="space-y-0.5 text-[10px]">
                            {startsAt && <div>Mulai: {startsAt}</div>}
                            {expiresAt && <div>Selesai: {expiresAt}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400">Selamanya</span>
                        )}
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
                      <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.code)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#081A2E]">
                {editingId ? 'Edit Voucher' : 'Tambah Voucher Diskon'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
              {validationError && (
                <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 flex items-start gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Voucher *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: PROMO50"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl uppercase tracking-wider font-extrabold text-[#081A2E] focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Voucher / Promo (Opsional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Promo Kemerdekaan"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Tipe Diskon *</label>
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center justify-between p-3 border border-slate-300 bg-white rounded-xl cursor-pointer hover:border-slate-400 has-[:checked]:border-[#A40D35] has-[:checked]:bg-[#A40D35]/5 transition-all">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-600" />
                        <div>
                          <span className="block font-extrabold text-[#081A2E]">Fixed Amount</span>
                          <span className="text-[10px] text-slate-500 font-medium">Potongan nominal Rupiah tetap</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="discount_type"
                        checked={discountType === 'fixed'}
                        onChange={() => {
                          setDiscountType('fixed');
                          if (discountValue > 100000000) setDiscountValue(300000);
                        }}
                        className="h-4 w-4 text-[#A40D35] border-slate-300 focus:ring-[#A40D35]"
                      />
                    </label>

                    <label className="flex-1 flex items-center justify-between p-3 border border-slate-300 bg-white rounded-xl cursor-pointer hover:border-slate-400 has-[:checked]:border-[#A40D35] has-[:checked]:bg-[#A40D35]/5 transition-all">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="block font-extrabold text-[#081A2E]">Percentage</span>
                          <span className="text-[10px] text-slate-500 font-medium">Potongan persentase transaksi</span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="discount_type"
                        checked={discountType === 'percentage'}
                        onChange={() => {
                          setDiscountType('percentage');
                          if (discountValue > 100) setDiscountValue(10);
                        }}
                        className="h-4 w-4 text-[#A40D35] border-slate-300 focus:ring-[#A40D35]"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {discountType === 'percentage' ? 'Persentase Diskon (%) *' : 'Nominal Diskon (Rp) *'}
                    </label>
                    <div className="relative">
                      {discountType === 'fixed' && (
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                          Rp
                        </div>
                      )}
                      <input
                        type="number"
                        required
                        min={1}
                        max={discountType === 'percentage' ? 100 : 999999999}
                        step={discountType === 'percentage' ? 1 : 10000}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Number(e.target.value))}
                        className={`w-full ${discountType === 'fixed' ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none font-bold text-sm`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Min. Transaksi (IDR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                        Rp
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={minPurchaseAmount}
                        onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none font-bold text-sm"
                      />
                    </div>
                  </div>
                </div>

                {discountType === 'percentage' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Maksimum Potongan (Rp) (Opsional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold">
                        Rp
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={maximumDiscount || ''}
                        onChange={(e) => setMaximumDiscount(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Tanpa batasan nominal diskon"
                        className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berlaku Mulai Tanggal</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Berlaku Sampai Tanggal</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none"
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
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#081A2E]/20 focus:border-[#081A2E] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="voucher-is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 rounded-lg border-slate-300 text-[#A40D35] focus:ring-[#A40D35]"
                />
                <label htmlFor="voucher-is-active" className="font-extrabold text-slate-700 cursor-pointer select-none">
                  Aktifkan Kode Voucher ini
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-full font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] cursor-pointer text-xs"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
