import React, { useEffect, useState } from 'react';
import {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from '../../services/api';
import { Voucher } from '../../types';
import { formatIDR } from '../../utils/currency';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
  Percent,
  AlertCircle,
  RefreshCw,
  Ticket,
  Calendar,
  Layers,
} from 'lucide-react';

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
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Ticket className="w-3 h-3 text-[#A40D35]" />
              Promosi & Diskon
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {vouchers.length} voucher aktif / terdaftar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Voucher Diskon & Promo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola kode voucher potongan harga (Nominal Tetap atau Persentase), masa berlaku, batas kuota transaksi, dan limit potongan maksimal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang voucher"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Voucher</span>
          </button>
        </div>
      </div>

      {/* 2. Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
            <span>Memuat data voucher...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Belum ada voucher yang terdaftar.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Buat kode promo diskon untuk memikat klien baru atau reward pelanggan setia live streaming.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Voucher Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Kode & Nama</th>
                  <th className="px-5 py-3.5">Tipe Diskon</th>
                  <th className="px-5 py-3.5">Nilai Diskon</th>
                  <th className="px-5 py-3.5">Maks. Potongan</th>
                  <th className="px-5 py-3.5">Min. Belanja</th>
                  <th className="px-5 py-3.5">Masa Berlaku</th>
                  <th className="px-5 py-3.5">Pemakaian</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
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
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-[#081A2E] font-mono tracking-wider text-sm">
                          {item.code}
                        </div>
                        {item.name && (
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                            {item.name}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {type === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <Percent className="w-3 h-3" />
                            Persentase
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <Tag className="w-3 h-3" />
                            Nominal Tetap
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-extrabold text-[#081A2E] text-sm">
                        {type === 'percentage' ? `${value}%` : formatIDR(value)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {type === 'percentage' && item.maximum_discount ? (
                          <span className="font-semibold text-slate-800">
                            {formatIDR(item.maximum_discount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Tanpa batas</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {minTx ? (
                          <span className="font-medium text-slate-700">{formatIDR(minTx)}</span>
                        ) : (
                          <span className="text-slate-400 italic">Tanpa min.</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {startsAt || expiresAt ? (
                          <div className="space-y-0.5 text-[11px]">
                            {startsAt && <div className="text-slate-600">Mulai: {startsAt}</div>}
                            {expiresAt && <div className="text-rose-600 font-medium">Batas: {expiresAt}</div>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Selamanya</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-semibold">
                        <span className="text-[#081A2E] font-bold">{item.usage_count}</span>{' '}
                        <span className="text-slate-400">
                          {item.usage_limit ? `/ ${item.usage_limit} kuota` : 'kali terpakai'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                          title="Edit Voucher"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.code)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="Hapus Voucher"
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

      {/* 3. Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#081A2E] text-white">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Konfigurasi Diskon & Promosi
                </div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {editingId ? 'Edit Voucher' : 'Tambah Voucher Diskon'}
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

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto">
              {validationError && (
                <div className="p-3.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Kode Voucher <span className="text-[#A40D35]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: PROMO50"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg uppercase tracking-wider font-extrabold text-[#081A2E] focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Nama Promo (Opsional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Diskon Kemerdekaan"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Tipe Diskon *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-lg cursor-pointer hover:border-slate-300 has-[:checked]:border-[#A40D35] has-[:checked]:bg-[#A40D35]/5 transition-all">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <span className="block font-extrabold text-[#081A2E] text-xs">Nominal Tetap</span>
                          <span className="text-[10px] text-slate-400">Potongan Rupiah</span>
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

                    <label className="flex items-center justify-between p-3 border border-slate-200 bg-white rounded-lg cursor-pointer hover:border-slate-300 has-[:checked]:border-[#A40D35] has-[:checked]:bg-[#A40D35]/5 transition-all">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <span className="block font-extrabold text-[#081A2E] text-xs">Persentase</span>
                          <span className="text-[10px] text-slate-400">Persen Transaksi</span>
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
                    <label className="block font-bold text-slate-700 mb-1.5">
                      {discountType === 'percentage' ? 'Persentase Diskon (%) *' : 'Nominal Diskon (IDR) *'}
                    </label>
                    <div className="relative">
                      {discountType === 'fixed' && (
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
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
                        className={`w-full ${discountType === 'fixed' ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-extrabold text-sm`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Min. Transaksi (IDR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                        Rp
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={minPurchaseAmount}
                        onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-extrabold text-sm"
                      />
                    </div>
                  </div>
                </div>

                {discountType === 'percentage' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Maksimum Potongan (IDR) (Opsional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                        Rp
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={maximumDiscount || ''}
                        onChange={(e) => setMaximumDiscount(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Tanpa batasan nominal diskon"
                        className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Mulai Tanggal</label>
                  <input
                    type="date"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Batas Sampai Tanggal</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Batas Kuota Pemakaian (Opsional)
                </label>
                <input
                  type="number"
                  min={1}
                  value={usageLimit || ''}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Contoh: 50 (Kosongkan jika tanpa kuota)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="voucher-is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                />
                <label htmlFor="voucher-is-active" className="font-bold text-slate-700 cursor-pointer">
                  Aktifkan Kode Voucher ini
                </label>
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
