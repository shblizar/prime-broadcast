import React, { useEffect, useState } from 'react';
import {
  getAllPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../../services/api';
import { PortfolioItem } from '../../types';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../../utils/youtube';
import {
  Plus,
  Edit2,
  Trash2,
  Video,
  Play,
  Check,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
} from 'lucide-react';

export const AdminPortfolioPage: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fields
  const [urlInput, setUrlInput] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewVideoId = extractYouTubeId(urlInput);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPortfolio();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setUrlInput('');
    setDisplayOrder((items.length || 0) + 1);
    setIsActive(true);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setUrlInput(`https://www.youtube.com/watch?v=${item.youtube_video_id}`);
    setDisplayOrder(item.display_order);
    setIsActive(item.is_active);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeId(urlInput);
    if (!videoId) {
      setErrorMsg('Format link YouTube tidak valid. Masukkan URL YouTube atau Video ID.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      if (editingId) {
        await updatePortfolio(editingId, {
          youtube_video_id: videoId,
          display_order: displayOrder,
          is_active: isActive,
        });
      } else {
        await createPortfolio({
          youtube_video_id: videoId,
          display_order: displayOrder,
          is_active: isActive,
        });
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan portofolio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus video portofolio ini?')) return;
    try {
      await deletePortfolio(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6" id="admin-portfolio-page">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Video className="w-3 h-3 text-[#A40D35]" />
              Video Showcase
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {items.length} video portofolio
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Portofolio Video Broadcast
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola daftar rekaman siaran langsung YouTube yang disematkan pada showcase portofolio publik di halaman beranda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang portofolio"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Video Portofolio</span>
          </button>
        </div>
      </div>

      {/* 2. Video Grid */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
            <span>Memuat portofolio video...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Video className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Belum ada video portofolio yang didaftarkan.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Sematkan video live streaming terbaik Anda dari YouTube untuk meyakinkan calon klien.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Video Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-black relative">
                  <iframe
                    src={getYouTubeEmbedUrl(item.youtube_video_id)}
                    title={`Portfolio ${item.youtube_video_id}`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                <div className="p-4 flex items-center justify-between gap-3 bg-slate-50/50">
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold text-[#081A2E] truncate">
                      ID: {item.youtube_video_id}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-slate-600">Urutan: #{item.display_order}</span>
                      <span>•</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.is_active ? 'Tampil' : 'Disembunyikan'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-white rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      title="Edit Video"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Hapus Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#081A2E] text-white">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Konfigurasi Video Showcase
                </div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {editingId ? 'Edit Portofolio Video' : 'Tambah Video Portofolio'}
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
              {errorMsg && (
                <div className="p-3.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Link / URL YouTube atau Video ID <span className="text-[#A40D35]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ atau dQw4w9WgXcQ"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-mono text-xs"
                />
              </div>

              {/* Live Preview */}
              {previewVideoId && (
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black shadow-inner">
                  <iframe
                    src={getYouTubeEmbedUrl(previewVideoId)}
                    title="Live Preview"
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Urutan Tampilan</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="portfolio-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                  />
                  <label htmlFor="portfolio-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Tampilkan di Beranda
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
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
