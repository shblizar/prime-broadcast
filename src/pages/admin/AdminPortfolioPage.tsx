import React, { useEffect, useState } from 'react';
import {
  getAllPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from '../../services/api';
import { PortfolioItem } from '../../types';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../../utils/youtube';
import { Plus, Edit2, Trash2, Video, Play, Check, AlertCircle } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#081A2E]">
            Portofolio Video Broadcast
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola daftar video YouTube siaran langsung yang tampil di halaman beranda publik
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Video Portofolio
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat portofolio...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Belum ada video portofolio. Tambahkan video YouTube pertama Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between"
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

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-700">
                      ID: {item.youtube_video_id}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Urutan: {item.display_order} •{' '}
                      <span className={item.is_active ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {item.is_active ? 'Tampil di Web' : 'Disembunyikan'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-200 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full flex flex-col border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#081A2E]">
                {editingId ? 'Edit Portofolio Video' : 'Tambah Video Portofolio'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Link / URL YouTube atau Video ID *
                </label>
                <input
                  type="text"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ atau dQw4w9WgXcQ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#081A2E] outline-none"
                />
              </div>

              {/* Live Preview */}
              {previewVideoId && (
                <div className="rounded-lg overflow-hidden border border-slate-200 aspect-video bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(previewVideoId)}
                    title="Live Preview"
                    className="w-full h-full border-0"
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
                    id="portfolio-is-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#A40D35]"
                  />
                  <label htmlFor="portfolio-is-active" className="font-bold text-slate-700 cursor-pointer">
                    Tampilkan di Beranda
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
