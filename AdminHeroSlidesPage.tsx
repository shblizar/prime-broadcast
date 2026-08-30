import React, { useEffect, useState, useRef } from 'react';
import { HeroSlide } from '../../types';
import {
  getAdminHeroSlides,
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  uploadHeroSlideFile,
  getHeroSlidePublicUrl,
} from '../../services/api';
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface HeroSlideImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
  children?: React.ReactNode;
}

export const HeroSlideImagePreview: React.FC<HeroSlideImagePreviewProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  aspectRatioClass = 'aspect-video',
  children,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={`relative ${aspectRatioClass} bg-slate-100 border border-slate-200 overflow-hidden group rounded-xl select-none`}>
      {/* Loading Spinner */}
      {!loaded && !error && src && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-[#A40D35]" />
            <span>Memuat pratinjau...</span>
          </div>
        </div>
      )}

      {/* Explicit Error Badge for Broken Images */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50 text-rose-700 p-4 text-center">
          <AlertCircle className="w-7 h-7 mb-1.5 text-rose-500 flex-shrink-0" />
          <span className="text-xs font-bold">Gambar Gagal Dimuat / URL Rusak</span>
          <span className="text-[10px] text-rose-500 mt-1 max-w-full truncate px-2 font-mono">
            {src}
          </span>
        </div>
      )}

      {/* Actual Image Tag */}
      {src && !error && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        />
      )}

      {/* Overlay Children */}
      {loaded && !error && children}
    </div>
  );
};

function isValidHeroImageValue(value: string): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.startsWith('slides/') || trimmed.startsWith('data:')) {
    return true;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const AdminHeroSlidesPage: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [imagePath, setImagePath] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await getAdminHeroSlides();
      setSlides(data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memuat hero slides' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openAddModal = () => {
    setEditingSlide(null);
    setImagePath('');
    setDisplayOrder(slides.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setImagePath(slide.image_path);
    setDisplayOrder(slide.display_order);
    setIsActive(slide.is_active);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification({ type: 'error', message: 'Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan.' });
      return;
    }

    setUploadingImage(true);
    try {
      const url = await uploadHeroSlideFile(file);
      setImagePath(url);
      setNotification({ type: 'success', message: 'Gambar slide berhasil diunggah.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengunggah gambar' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePath || !isValidHeroImageValue(imagePath)) {
      setNotification({ type: 'error', message: 'Path atau URL gambar hero slide tidak valid.' });
      return;
    }

    setSaving(true);
    try {
      if (editingSlide) {
        await updateHeroSlide(editingSlide.id, {
          image_path: imagePath,
          display_order: Number(displayOrder),
          is_active: isActive,
        });
        setNotification({ type: 'success', message: 'Hero slide berhasil diperbarui.' });
      } else {
        await addHeroSlide({
          image_path: imagePath,
          display_order: Number(displayOrder),
          is_active: isActive,
        });
        setNotification({ type: 'success', message: 'Hero slide baru berhasil ditambahkan.' });
      }
      setIsModalOpen(false);
      fetchSlides();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan slide' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await updateHeroSlide(slide.id, { is_active: !slide.is_active });
      fetchSlides();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengubah status slide' });
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    if (!window.confirm('Hapus slide ini dari homepage?')) return;
    try {
      await deleteHeroSlide(slide.id, slide.image_path);
      setNotification({ type: 'success', message: 'Slide berhasil dihapus dari Storage dan database.' });
      fetchSlides();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menghapus slide' });
    }
  };

  const handleMoveOrder = async (slide: HeroSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex((s) => s.id === slide.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === slides.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetSlide = slides[targetIndex];

    try {
      await updateHeroSlide(slide.id, { display_order: targetSlide.display_order });
      await updateHeroSlide(targetSlide.id, { display_order: slide.display_order });
      fetchSlides();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memindahkan urutan' });
    }
  };

  return (
    <div className="space-y-6" id="admin-hero-slides">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#A40D35]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
              Hero Slideshow Showcase
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola foto slider beresolusi tinggi untuk background fullscreen hero section di Homepage.
          </p>
        </div>
        <button
          onClick={openAddModal}
          id="btn-add-hero-slide"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A40D35] hover:bg-[#850B2B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Slide Baru</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between gap-3 text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-semibold hover:underline opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Rules Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
        <strong>Ketentuan Slideshow Homepage:</strong> Jika tidak ada foto hero slide yang aktif, homepage akan
        menampilkan hero default yang elegan. Ketika Anda mengunggah 1 atau lebih foto di sini, slider dinamis otomatis
        menggantikan tampilan default.
      </div>

      {/* Slide Cards Grid / Table */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Memuat hero slides...</div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">Belum Ada Hero Slide</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Tambahkan foto dokumentasi setup siaran langsung resolusi tinggi untuk memukau calon klien saat pertama kali
            membuka website.
          </p>
          <button
            onClick={openAddModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#081A2E] text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" /> Unggah Slide Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              id={`slide-card-${slide.id}`}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                slide.is_active ? 'border-slate-200 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50'
              }`}
            >
              <div>
                {/* Image Preview Container */}
                <HeroSlideImagePreview
                  src={getHeroSlidePublicUrl(slide.image_path)}
                  alt="Hero Slide"
                  aspectRatioClass="aspect-video"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                >
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded text-white text-[11px] font-mono">
                    #{slide.display_order}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium backdrop-blur-md ${
                        slide.is_active ? 'bg-emerald-500/80 text-white' : 'bg-slate-600/80 text-slate-200'
                      }`}
                    >
                      {slide.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </HeroSlideImagePreview>
              </div>

              {/* Action Bar */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(slide, 'up')}
                    disabled={idx === 0}
                    title="Geser Urutan ke Atas"
                    className="p-1.5 text-slate-500 hover:text-[#081A2E] disabled:opacity-30 disabled:hover:text-slate-500"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(slide, 'down')}
                    disabled={idx === slides.length - 1}
                    title="Geser Urutan ke Bawah"
                    className="p-1.5 text-slate-500 hover:text-[#081A2E] disabled:opacity-30 disabled:hover:text-slate-500"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    title={slide.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                      slide.is_active
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {slide.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(slide)}
                    title="Edit Slide"
                    className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide)}
                    title="Hapus Slide"
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-[#081A2E]">
                {editingSlide ? 'Edit Hero Slide' : 'Tambah Hero Slide Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Uploader & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Foto Slide (Wajib)
                </label>
                <div className="space-y-3">
                  {imagePath ? (
                    <HeroSlideImagePreview src={getHeroSlidePublicUrl(imagePath)} alt="Preview" aspectRatioClass="aspect-video">
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white/90 text-xs font-semibold text-slate-900 rounded-lg hover:bg-white shadow-sm"
                        >
                          Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagePath('')}
                          className="px-3 py-1.5 bg-rose-600 text-xs font-semibold text-white rounded-lg hover:bg-rose-700 shadow-sm"
                        >
                          Hapus
                        </button>
                      </div>
                    </HeroSlideImagePreview>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#A40D35] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-rose-50/20"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        {uploadingImage ? 'Mengunggah gambar...' : 'Klik untuk unggah foto (JPG/PNG/WebP)'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Rekomendasi rasio 16:9, min 1920x1080px</p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Path / Direct URL input */}
                  <div>
                    <span className="text-[11px] text-slate-400">Path gambar di Storage / URL:</span>
                    <input
                      type="text"
                      value={imagePath}
                      onChange={(e) => setImagePath(e.target.value)}
                      placeholder="slides/... atau https://..."
                      className="mt-1 w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                    />
                  </div>
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urutan Tampil</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                  >
                    <option value="true">Aktif (Tampilkan)</option>
                    <option value="false">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#A40D35] hover:bg-[#850B2B] rounded-lg shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Hero Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
