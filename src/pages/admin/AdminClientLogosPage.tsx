import React, { useEffect, useState } from 'react';
import {
  getAllClientLogos,
  createClientLogo,
  updateClientLogo,
  deleteClientLogo,
  uploadClientLogoFile,
} from '../../services/api';
import { ClientLogo } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  X,
  UploadCloud,
  Building2,
  ExternalLink,
} from 'lucide-react';

export const AdminClientLogosPage: React.FC = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fields
  const [clientName, setClientName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
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
    setSelectedFile(null);
    setPreviewUrl('');
    setDisplayOrder((logos.length || 0) + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClientLogo) => {
    setEditingId(item.id);
    setClientName(item.client_name);
    setLogoPath(item.logo_path);
    setSelectedFile(null);
    setPreviewUrl(item.logo_path);
    setDisplayOrder(item.display_order);
    setIsActive(item.is_active);
    setIsModalOpen(true);
  };

  // Image file handler for Supabase Storage upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    if (!clientName) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setClientName(nameWithoutExt);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setSaving(true);
    try {
      let finalLogoPath = logoPath.trim();
      if (selectedFile) {
        finalLogoPath = await uploadClientLogoFile(selectedFile);
      }

      if (!finalLogoPath) {
        alert('File logo atau URL logo wajib diisi.');
        setSaving(false);
        return;
      }

      if (editingId) {
        await updateClientLogo(editingId, {
          client_name: clientName.trim(),
          logo_path: finalLogoPath,
          display_order: displayOrder,
          is_active: isActive,
        });
      } else {
        await createClientLogo({
          client_name: clientName.trim(),
          logo_path: finalLogoPath,
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
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Building2 className="w-3 h-3 text-[#A40D35]" />
              Branding & Portofolio Klien
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {logos.length} logo klien terdaftar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Logo Klien & Partner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola identitas visual mitra korporat, BUMN, instansi pemerintah, dan institusi pendidikan yang ditampilkan pada marquee berputar di halaman muka.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang logo klien"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Logo Klien</span>
          </button>
        </div>
      </div>

      {/* 2. Logos Grid */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
            <span>Memuat portofolio logo klien...</span>
          </div>
        ) : logos.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Belum ada logo klien yang diunggah.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Unggah logo klien ternama untuk meningkatkan kredibilitas dan kepercayaan pengunjung terhadap Prime Broadcast.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Logo Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {logos.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all p-4 flex flex-col justify-between"
              >
                {/* Image Showcase */}
                <div className="h-24 w-full flex items-center justify-center bg-slate-50/80 rounded-lg p-3 border border-slate-100 mb-3 group-hover:bg-slate-50 transition-colors">
                  <img
                    src={item.logo_path}
                    alt={item.client_name}
                    className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="font-extrabold text-xs text-[#081A2E] truncate" title={item.client_name}>
                    {item.client_name}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-slate-400">
                      Posisi: #{item.display_order}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                        item.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Edit Logo Klien"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.client_name)}
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                    title="Hapus Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#081A2E] text-white">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Portofolio Partner
                </div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {editingId ? 'Edit Logo Klien' : 'Tambah Logo Klien'}
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
                  Nama Klien / Instansi <span className="text-[#A40D35]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Contoh: Bank Mandiri / Universitas Indonesia"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Unggah File Logo (PNG, SVG, WebP transparan disarankan)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-[#A40D35] rounded-xl p-4 text-center transition-colors">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                  <input
                    type="file"
                    id="client-logo-file-input"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="client-logo-file-input"
                    className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#081A2E] hover:bg-slate-800 cursor-pointer shadow-sm mb-1"
                  >
                    Pilih Berkas Logo
                  </label>
                  <p className="text-[10px] text-slate-400">Maks. 2MB, format transparan diutamakan</p>
                </div>
                {selectedFile && (
                  <p className="text-[11px] text-emerald-600 mt-1.5 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Berkas siap: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Atau Tentukan URL Langsung {!selectedFile && <span className="text-[#A40D35]">*</span>}
                </label>
                <input
                  type="text"
                  required={!selectedFile}
                  value={logoPath}
                  onChange={(e) => {
                    setLogoPath(e.target.value);
                    if (!selectedFile) {
                      setPreviewUrl(e.target.value);
                    }
                  }}
                  placeholder="https://... atau /logos/partner.svg"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
                />
              </div>

              {/* Preview */}
              {(previewUrl || logoPath) && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-center space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Pratinjau Logo Klien:
                  </div>
                  <div className="h-16 flex items-center justify-center bg-white rounded-lg p-2 border border-slate-100">
                    <img
                      src={previewUrl || logoPath}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Urutan Marquee</label>
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
                    id="logo-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                  />
                  <label htmlFor="logo-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Aktif di Marquee Publik
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
                  {saving ? 'Menyimpan...' : 'Simpan Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
