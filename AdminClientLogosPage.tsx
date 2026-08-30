import React, { useEffect, useState } from 'react';
import {
  getAllClientLogos,
  createClientLogo,
  updateClientLogo,
  deleteClientLogo,
} from '../../services/api';
import { ClientLogo } from '../../types';
import { Plus, Edit2, Trash2, Image as ImageIcon, Check } from 'lucide-react';

export const AdminClientLogosPage: React.FC = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fields
  const [clientName, setClientName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllClientLogos();
      setLogos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setClientName('');
    setLogoPath('');
    setDisplayOrder((logos.length || 0) + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClientLogo) => {
    setEditingId(item.id);
    setClientName(item.client_name);
    setLogoPath(item.logo_path);
    setDisplayOrder(item.display_order);
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  // Image Upload helper (supports data URL / external URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoPath(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !logoPath.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateClientLogo(editingId, {
          client_name: clientName.trim(),
          logo_path: logoPath.trim(),
          display_order: displayOrder,
          is_active: isActive,
        });
      } else {
        await createClientLogo({
          client_name: clientName.trim(),
          logo_path: logoPath.trim(),
          display_order: displayOrder,
          is_active: isActive,
        });
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan logo klien');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus logo klien "${name}"?`)) return;
    try {
      await deleteClientLogo(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6" id="admin-client-logos-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081A2E]">
            Logo Klien & Partner Penyiaran
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola logo instansi, korporat, dan partner yang berjalan di marquee running logo
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Logo Klien
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat logo klien...</div>
        ) : logos.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada logo klien yang diunggah.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {logos.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between"
              >
                <div className="h-20 flex items-center justify-center bg-white rounded-lg p-2 border border-slate-100 mb-3">
                  <img
                    src={item.logo_path}
                    alt={item.client_name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div>
                  <div className="font-bold text-xs text-[#081A2E] truncate">{item.client_name}</div>
                  <div className="text-[10px] text-slate-400">
                    Urutan: {item.display_order} •{' '}
                    <span className={item.is_active ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 mt-2 border-t border-slate-200">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-200 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.client_name)}
                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#081A2E]">
                {editingId ? 'Edit Logo Klien' : 'Tambah Logo Klien'}
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
                <label className="block font-bold text-slate-700 mb-1">Nama Klien / Instansi *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Contoh: Bank Mandiri / Universitas Indonesia"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Upload File Logo / Gambar</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#081A2E] file:text-white hover:file:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Atau Masukkan URL / Path Logo *</label>
                <input
                  type="text"
                  required
                  value={logoPath}
                  onChange={(e) => setLogoPath(e.target.value)}
                  placeholder="https://... atau /logos/mandiri.svg"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              {/* Preview */}
              {logoPath && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-400 mb-2">Preview Logo:</div>
                  <img
                    src={logoPath}
                    alt="Preview"
                    className="max-h-12 max-w-full mx-auto object-contain"
                  />
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
                    id="logo-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35]"
                  />
                  <label htmlFor="logo-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Aktif di Marquee
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
