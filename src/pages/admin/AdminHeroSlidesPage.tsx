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
  RefreshCw,
  X,
  Sliders,
  Image as ImageIcon,
  ExternalLink,
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
    <div className={`relative ${aspectRatioClass} bg-slate-100 border border-slate-200 overflow-hidden group select-none`}>
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
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <Sparkles className="w-3 h-3 text-[#A40D35]" />
              Showcase Utama
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {slides.length} slide showcase
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Hero Slideshow Showcase
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola foto slider beresolusi tinggi untuk background fullscreen hero section di Homepage. Mengatur urutan dan status tayang slider.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchSlides}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang slide"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={openAddModal}
            id="btn-add-hero-slide"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Slide Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold shadow-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Rules Notice */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-950">Ketentuan Slideshow Homepage: </span>
          Jika tidak ada foto hero slide yang aktif, homepage akan menampilkan hero default yang elegan. Ketika Anda mengunggah 1 atau lebih foto di sini, slider dinamis otomatis menggantikan tampilan default homepage.
        </div>
      </div>

      {/* 4. Slides Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-slate-200/90 shadow-sm">
          <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
          <span>Memuat data hero slides...</span>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-xl p-16 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Hero Slide</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Tambahkan foto dokumentasi setup siaran langsung resolusi tinggi untuk memukau calon klien saat pertama kali membuka website.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#081A2E] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Slide Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              id={`slide-card-${slide.id}`}
              className={`bg-white rounded-xl border transition-all overflow-hidden flex flex-col justify-between ${
                slide.is_active
                  ? 'border-slate-200/90 shadow-sm hover:shadow-md'
                  : 'border-slate-200 opacity-60 bg-slate-50/60'
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
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-md text-white text-[10px] font-mono font-bold tracking-wider">
                    URUTAN #{slide.display_order}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        slide.is_active
                          ? 'bg-emerald-600/90 text-white shadow-sm'
                          : 'bg-slate-700/90 text-slate-200 shadow-sm'
                      }`}
                    >
                      {slide.is_active ? 'Aktif Tayang' : 'Nonaktif'}
                    </span>
                  </div>
                </HeroSlideImagePreview>
              </div>

              {/* Action Bar */}
              <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveOrder(slide, 'up')}
                    disabled={idx === 0}
                    title="Geser Urutan ke Atas"
                    className="p-1.5 text-slate-500 hover:text-[#081A2E] hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveOrder(slide, 'down')}
                    disabled={idx === slides.length - 1}
                    title="Geser Urutan ke Bawah"
                    className="p-1.5 text-slate-500 hover:text-[#081A2E] hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition-colors disabled:opacity-30 disabled:hover:text-slate-500 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(slide)}
                    title={slide.is_active ? 'Sembunyikan' : 'Tampilkan'}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      slide.is_active
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#081A2E]'
                        : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {slide.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditModal(slide)}
                    title="Edit Slide"
                    className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide)}
                    title="Hapus Slide"
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#081A2E] text-white">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Konfigurasi Hero Slider
                </div>
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  {editingSlide ? 'Edit Hero Slide' : 'Tambah Hero Slide Baru'}
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
              {/* Image Uploader & Preview */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">
                  Foto Slide (Wajib) <span className="text-[#A40D35]">*</span>
                </label>
                <div className="space-y-3">
                  {imagePath ? (
                    <HeroSlideImagePreview src={getHeroSlidePublicUrl(imagePath)} alt="Preview" aspectRatioClass="aspect-video">
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 bg-white text-xs font-bold text-slate-900 rounded-lg hover:bg-slate-100 shadow-sm cursor-pointer"
                        >
                          Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagePath('')}
                          className="px-3.5 py-1.5 bg-[#A40D35] text-xs font-bold text-white rounded-lg hover:bg-[#820A2A] shadow-sm cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </HeroSlideImagePreview>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#A40D35] rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-rose-50/20"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">
                        {uploadingImage ? 'Mengunggah gambar ke Storage...' : 'Klik untuk unggah foto (JPG, PNG, WebP)'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Rekomendasi rasio 16:9, min. 1920x1080px untuk hasil terbaik</p>
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
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Path Storage / Direct URL:
                    </label>
                    <input
                      type="text"
                      value={imagePath}
                      onChange={(e) => setImagePath(e.target.value)}
                      placeholder="slides/... atau https://..."
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Urutan Tampil</label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Status Tampil</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] font-semibold bg-white"
                  >
                    <option value="true">Aktif (Tampilkan di Hero)</option>
                    <option value="false">Nonaktif (Sembunyikan)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
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
