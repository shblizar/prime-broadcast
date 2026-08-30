import React, { useEffect, useState, useRef } from 'react';
import { GalleryAlbum, GalleryImage } from '../../types';
import {
  getAdminGalleryAlbums,
  addGalleryAlbum,
  updateGalleryAlbum,
  deleteGalleryAlbum,
  uploadGalleryFile,
  getGalleryImages,
  addGalleryImage,
  deleteGalleryImage,
  updateGalleryImage,
} from '../../services/api';
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  ArrowUp,
  ArrowDown,
  Camera,
  Images,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

export const AdminGalleryPage: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Album Modal
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumCoverPath, setAlbumCoverPath] = useState('');
  const [albumYear, setAlbumYear] = useState(new Date().getFullYear().toString());
  const [albumOrder, setAlbumOrder] = useState(1);
  const [albumIsActive, setAlbumIsActive] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Selected Album for Image Management Modal
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [albumImages, setAlbumImages] = useState<GalleryImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImagePath, setNewImagePath] = useState('');
  const [uploadingChildImage, setUploadingChildImage] = useState(false);
  
  // Multi-upload state
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState('');
  const multipleChildInputRef = useRef<HTMLInputElement>(null);
  const childImageInputRef = useRef<HTMLInputElement>(null);

  // Photos inside Album Modal (Edit/Create Modal)
  const [modalAlbumImages, setModalAlbumImages] = useState<GalleryImage[]>([]);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [stagedPreviews, setStagedPreviews] = useState<string[]>([]);
  const [uploadingModalPhotos, setUploadingModalPhotos] = useState(false);
  const [modalUploadProgress, setModalUploadProgress] = useState('');
  const modalMultipleInputRef = useRef<HTMLInputElement>(null);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const data = await getAdminGalleryAlbums();
      setAlbums(data);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memuat galeri album' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const openAddAlbumModal = () => {
    setEditingAlbum(null);
    setAlbumTitle('');
    setAlbumCoverPath('');
    setAlbumYear(new Date().getFullYear().toString());
    setAlbumOrder(albums.length + 1);
    setAlbumIsActive(true);
    setModalAlbumImages([]);
    setStagedFiles([]);
    setStagedPreviews([]);
    setIsAlbumModalOpen(true);
  };

  const openEditAlbumModal = async (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setAlbumTitle(album.title);
    setAlbumCoverPath(album.cover_image_path);
    setAlbumYear(album.year || '');
    setAlbumOrder(album.display_order);
    setAlbumIsActive(album.is_active);
    setModalAlbumImages(album.images || []);
    setStagedFiles([]);
    setStagedPreviews([]);
    setIsAlbumModalOpen(true);

    try {
      const imgs = await getGalleryImages(album.id);
      setModalAlbumImages(imgs);
    } catch (err) {
      console.error('Gagal memuat foto album:', err);
    }
  };

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotification({ type: 'error', message: 'Hanya file gambar yang diperbolehkan.' });
      return;
    }

    setUploadingCover(true);
    try {
      const url = await uploadGalleryFile(file);
      setAlbumCoverPath(url);
      setNotification({ type: 'success', message: 'Cover album berhasil diunggah.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengunggah cover' });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleModalUploadMultiple = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    if (editingAlbum) {
      setUploadingModalPhotos(true);
      let successCount = 0;
      let failCount = 0;
      const newAddedImgs: GalleryImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setModalUploadProgress(`Mengunggah ${i + 1} dari ${files.length} foto...`);
        try {
          const url = await uploadGalleryFile(file);
          const added = await addGalleryImage({
            album_id: editingAlbum.id,
            image_path: url,
            caption: null,
            display_order: modalAlbumImages.length + successCount + 1,
          });
          newAddedImgs.push(added);
          successCount++;
        } catch (err) {
          console.error(`Gagal unggah foto ${file.name}:`, err);
          failCount++;
        }
      }

      setUploadingModalPhotos(false);
      setModalUploadProgress('');

      if (newAddedImgs.length > 0) {
        setModalAlbumImages((prev) => [...prev, ...newAddedImgs]);
        fetchAlbums();
      }

      if (failCount === 0) {
        setNotification({
          type: 'success',
          message: `${successCount} foto berhasil ditambahkan ke album.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: `${successCount} foto berhasil diunggah, ${failCount} foto gagal.`,
        });
      }
    } else {
      // Staged files for new album creation
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setStagedFiles((prev) => [...prev, ...files]);
      setStagedPreviews((prev) => [...prev, ...newPreviews]);
    }

    if (modalMultipleInputRef.current) {
      modalMultipleInputRef.current.value = '';
    }
  };

  const handleDeleteModalImage = async (imgId: string) => {
    if (!window.confirm('Hapus foto ini dari album?')) return;
    try {
      await deleteGalleryImage(imgId);
      setModalAlbumImages((prev) => prev.filter((i) => i.id !== imgId));
      fetchAlbums();
      setNotification({ type: 'success', message: 'Foto berhasil dihapus dari album.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menghapus foto.' });
    }
  };

  const handleRemoveStagedPhoto = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    setStagedPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim() || !albumCoverPath) {
      setNotification({ type: 'error', message: 'Judul album dan foto cover wajib diisi.' });
      return;
    }

    setSaving(true);
    try {
      if (editingAlbum) {
        await updateGalleryAlbum(editingAlbum.id, {
          title: albumTitle.trim(),
          cover_image_path: albumCoverPath,
          year: albumYear.trim() || null,
          display_order: Number(albumOrder),
          is_active: albumIsActive,
        });
        setNotification({ type: 'success', message: 'Album galeri berhasil diperbarui.' });
        setIsAlbumModalOpen(false);
        fetchAlbums();
      } else {
        const created = await addGalleryAlbum({
          title: albumTitle.trim(),
          cover_image_path: albumCoverPath,
          year: albumYear.trim() || null,
          display_order: Number(albumOrder),
          is_active: albumIsActive,
        });

        // Upload staged files if any were selected during album creation
        if (stagedFiles.length > 0) {
          let uploadedCount = 0;
          for (let i = 0; i < stagedFiles.length; i++) {
            try {
              const url = await uploadGalleryFile(stagedFiles[i]);
              await addGalleryImage({
                album_id: created.id,
                image_path: url,
                caption: null,
                display_order: i + 1,
              });
              uploadedCount++;
            } catch (err) {
              console.error('Gagal mengunggah foto staged', err);
            }
          }
          setNotification({
            type: 'success',
            message: `Album "${created.title}" berhasil dibuat dengan ${uploadedCount} foto.`,
          });
        } else {
          setNotification({ type: 'success', message: 'Album galeri baru berhasil dibuat.' });
        }

        setIsAlbumModalOpen(false);
        fetchAlbums();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menyimpan album' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlbum = async (album: GalleryAlbum) => {
    if (!window.confirm(`Hapus album "${album.title}" beserta seluruh fotonya?`)) return;
    try {
      await deleteGalleryAlbum(album.id);
      setNotification({ type: 'success', message: 'Album berhasil dihapus.' });
      fetchAlbums();
      if (selectedAlbum?.id === album.id) setSelectedAlbum(null);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menghapus album' });
    }
  };

  // Manage child images in an album
  const openImagesModal = async (album: GalleryAlbum) => {
    setSelectedAlbum(album);
    setLoadingImages(true);
    try {
      const imgs = await getGalleryImages(album.id);
      setAlbumImages(imgs);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memuat foto album' });
    } finally {
      setLoadingImages(false);
    }
  };

  const handleUploadSingleChildImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAlbum) return;

    setUploadingChildImage(true);
    try {
      const url = await uploadGalleryFile(file);
      setNewImagePath(url);
      setNotification({ type: 'success', message: 'Foto berhasil diunggah, siap ditambahkan.' });
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal mengunggah foto' });
    } finally {
      setUploadingChildImage(false);
    }
  };

  const handleUploadMultipleChildImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0 || !selectedAlbum) return;

    setUploadingMultiple(true);
    let successCount = 0;
    let failCount = 0;
    const newAddedImgs: GalleryImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgressStatus(`Mengunggah ${i + 1} dari ${files.length} foto... (${file.name})`);
      try {
        const url = await uploadGalleryFile(file);
        const added = await addGalleryImage({
          album_id: selectedAlbum.id,
          image_path: url,
          caption: null,
          display_order: albumImages.length + successCount + 1,
        });
        newAddedImgs.push(added);
        successCount++;
      } catch (err) {
        console.error(`Gagal unggah foto ${file.name}:`, err);
        failCount++;
      }
    }

    setUploadingMultiple(false);
    setUploadProgressStatus('');

    if (newAddedImgs.length > 0) {
      setAlbumImages((prev) => [...prev, ...newAddedImgs]);
      fetchAlbums();
    }

    if (failCount === 0) {
      setNotification({
        type: 'success',
        message: `${successCount} foto berhasil diunggah ke album "${selectedAlbum.title}".`,
      });
    } else {
      setNotification({
        type: 'error',
        message: `${successCount} foto berhasil diunggah, ${failCount} foto gagal.`,
      });
    }

    if (multipleChildInputRef.current) {
      multipleChildInputRef.current.value = '';
    }
  };

  const handleAddChildImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || !newImagePath) {
      setNotification({ type: 'error', message: 'Pilih atau unggah foto terlebih dahulu.' });
      return;
    }

    try {
      const newImg = await addGalleryImage({
        album_id: selectedAlbum.id,
        image_path: newImagePath,
        caption: newImageCaption.trim() || null,
        display_order: albumImages.length + 1,
      });
      setAlbumImages([...albumImages, newImg]);
      setNewImagePath('');
      setNewImageCaption('');
      setNotification({ type: 'success', message: 'Foto ditambahkan ke album.' });
      fetchAlbums();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menambah foto' });
    }
  };

  const handleDeleteChildImage = async (imgId: string) => {
    try {
      await deleteGalleryImage(imgId);
      setAlbumImages(albumImages.filter((i) => i.id !== imgId));
      fetchAlbums();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal menghapus foto' });
    }
  };

  const handleMoveImage = async (imgId: string, direction: 'up' | 'down') => {
    const index = albumImages.findIndex((i) => i.id === imgId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= albumImages.length) return;

    const newImages = [...albumImages];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    const updated = newImages.map((img, idx) => ({ ...img, display_order: idx + 1 }));
    setAlbumImages(updated);

    try {
      await Promise.all([
        updateGalleryImage(updated[index].id, { display_order: updated[index].display_order }),
        updateGalleryImage(updated[targetIndex].id, { display_order: updated[targetIndex].display_order }),
      ]);
      fetchAlbums();
    } catch (err: any) {
      console.error('Gagal memperbarui urutan foto', err);
    }
  };

  return (
    <div className="space-y-6" id="admin-gallery">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#A40D35]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
              Galeri Dokumentasi & Album
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola album dokumentasi acara siaran langsung. Satu album dapat berisi banyak foto.
          </p>
        </div>
        <button
          onClick={openAddAlbumModal}
          id="btn-add-album"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A40D35] hover:bg-[#850B2B] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Buat Album Baru</span>
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
          <button onClick={() => setNotification(null)} className="text-xs font-semibold hover:underline opacity-80">
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Memuat galeri...</div>
      ) : albums.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Images className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">Belum Ada Album Galeri</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Buat album dokumentasi acara siaran langsung atau multi-camera untuk memamerkan kualitas eksekusi Prime Broadcast.
          </p>
          <button
            onClick={openAddAlbumModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#081A2E] text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" /> Buat Album Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const childCount = album.images?.length || 0;
            return (
              <div
                key={album.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                  album.is_active ? 'border-slate-200 shadow-sm' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div>
                  {/* Cover Preview */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                    <img
                      src={album.cover_image_path}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-white text-[11px] font-mono">
                      #{album.display_order} {album.year ? `• ${album.year}` : ''}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium backdrop-blur-md ${
                          album.is_active ? 'bg-emerald-500/80 text-white' : 'bg-slate-600/80 text-slate-200'
                        }`}
                      >
                        {album.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-sm font-bold truncate">{album.title}</h3>
                      <p className="text-[11px] text-slate-300 font-medium">
                        {childCount} Foto di Album
                      </p>
                    </div>
                  </div>

                  {/* Sub info */}
                  <div className="p-4 flex items-center justify-between text-xs text-slate-600">
                    <button
                      onClick={() => openImagesModal(album)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-[#A40D35] hover:bg-[#A40D35] hover:text-white rounded-lg transition-colors font-bold"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Kelola Foto ({childCount})
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditAlbumModal(album)}
                    title="Edit Album"
                    className="p-1.5 text-slate-600 hover:text-[#081A2E] hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(album)}
                    title="Hapus Album"
                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Album Form Modal */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="text-lg font-bold text-[#081A2E]">
                {editingAlbum ? 'Edit Album Galeri' : 'Buat Album Galeri Baru'}
              </h3>
              <button
                onClick={() => setIsAlbumModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAlbum} className="space-y-4 overflow-y-auto pr-1">
              {/* Cover Photo */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  1. Foto Cover Utama Album (Wajib)
                </label>
                <div className="space-y-3">
                  {albumCoverPath ? (
                    <div className="relative aspect-video max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
                      <img src={albumCoverPath} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white/90 text-xs font-semibold text-slate-900 rounded-lg hover:bg-white"
                        >
                          Ganti Cover
                        </button>
                        <button
                          type="button"
                          onClick={() => setAlbumCoverPath('')}
                          className="px-2.5 py-1 bg-rose-600 text-xs font-semibold text-white rounded-lg hover:bg-rose-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-[#A40D35] rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-rose-50/20"
                    >
                      <Upload className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">
                        {uploadingCover ? 'Mengunggah cover...' : 'Klik untuk unggah cover album'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Rekomendasi rasio 16:9 (Digunakan untuk thumbnail depan)</p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleUploadCover}
                    accept="image/*"
                    className="hidden"
                  />

                  <div>
                    <span className="text-[11px] text-slate-400">Atau URL gambar cover:</span>
                    <input
                      type="url"
                      value={albumCoverPath}
                      onChange={(e) => setAlbumCoverPath(e.target.value)}
                      placeholder="https://..."
                      className="mt-1 w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                    />
                  </div>
                </div>
              </div>

              {/* Photos inside Album (Multi-Upload) */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#081A2E]">
                      2. Foto-Foto Dokumentasi Di Dalam Album (Isi Album)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Unggah foto-foto dokumentasi yang ada di dalam album ini (bisa pilih banyak file sekaligus).
                    </p>
                  </div>
                  {editingAlbum && (
                    <span className="text-xs font-bold text-[#A40D35] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {modalAlbumImages.length} Foto
                    </span>
                  )}
                  {!editingAlbum && stagedFiles.length > 0 && (
                    <span className="text-xs font-bold text-[#A40D35] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {stagedFiles.length} Foto Terpilih
                    </span>
                  )}
                </div>

                {/* Upload Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => modalMultipleInputRef.current?.click()}
                    disabled={uploadingModalPhotos}
                    className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[#A40D35] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {uploadingModalPhotos ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#A40D35]" />
                        <span>{modalUploadProgress || 'Mengunggah foto-foto album...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>+ Unggah / Tambah Foto Album (Pilih Banyak File)</span>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={modalMultipleInputRef}
                    onChange={handleModalUploadMultiple}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>

                {/* Album Photos Preview Grid */}
                {editingAlbum ? (
                  modalAlbumImages.length === 0 ? (
                    <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      Belum ada foto tambahan di album ini. Klik tombol di atas untuk menambah foto.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      {modalAlbumImages.map((img, idx) => (
                        <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-900 shadow-sm">
                          <img src={img.image_path} alt="Foto" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex justify-between items-start">
                            <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteModalImage(img.id)}
                              className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                              title="Hapus foto dari album"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : stagedPreviews.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    Belum ada foto album yang dipilih. Klik "+ Unggah Foto Album" untuk memilih banyak foto sekaligus dari galeri Anda.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {stagedPreviews.map((previewUrl, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-900 shadow-sm">
                        <img src={previewUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex justify-between items-start">
                          <span className="text-[10px] text-white font-mono bg-black/60 px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveStagedPhoto(idx)}
                            className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                            title="Batalkan foto ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Informasi & Metadata Album
                </label>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Album</label>
                  <input
                    type="text"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Contoh: Tech Summit & Expo Jakarta"
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Acara</label>
                  <input
                    type="text"
                    value={albumYear}
                    onChange={(e) => setAlbumYear(e.target.value)}
                    placeholder="Contoh: 2025"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Urutan Tampil</label>
                    <input
                      type="number"
                      min={1}
                      value={albumOrder}
                      onChange={(e) => setAlbumOrder(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={albumIsActive ? 'true' : 'false'}
                      onChange={(e) => setAlbumIsActive(e.target.value === 'true')}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#A40D35]"
                    >
                      <option value="true">Aktif (Tampilkan)</option>
                      <option value="false">Nonaktif (Sembunyikan)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAlbumModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingCover || uploadingModalPhotos}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] rounded-xl shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Menyimpan Album...' : 'Simpan Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Child Images Management Modal (Photo Manager) */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#081A2E]">
                  Kelola Foto Album: "{selectedAlbum.title}"
                </h3>
                <p className="text-xs text-slate-500">
                  Total {albumImages.length} foto dalam album ini
                </p>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Multiple Upload Section */}
            <div className="bg-rose-50/50 border border-rose-200/80 p-4 rounded-xl space-y-3 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#081A2E] uppercase tracking-wider">
                    Unggah Banyak Foto Sekaligus
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pilih beberapa file gambar dari perangkat Anda (Multiple Select) untuk ditambahkan langsung ke album ini.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => multipleChildInputRef.current?.click()}
                    disabled={uploadingMultiple}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#A40D35] hover:bg-[#850B2B] text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {uploadingMultiple ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Pilih Foto (Multiple File)</span>
                      </>
                    )}
                  </button>
                  <input
                    type="file"
                    ref={multipleChildInputRef}
                    onChange={handleUploadMultipleChildImages}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              </div>

              {uploadingMultiple && (
                <div className="p-2.5 bg-white border border-rose-200 rounded-lg text-xs font-medium text-[#A40D35] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A40D35]" />
                  <span>{uploadProgressStatus}</span>
                </div>
              )}
            </div>

            {/* Single Photo Upload / URL fallback */}
            <form onSubmit={handleAddChildImage} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2.5 flex-shrink-0">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Atau Tambah Foto Manual via URL / Single File
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                <div className="sm:col-span-5 flex gap-2">
                  <input
                    type="url"
                    value={newImagePath}
                    onChange={(e) => setNewImagePath(e.target.value)}
                    placeholder="URL foto (https://...)..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => childImageInputRef.current?.click()}
                    disabled={uploadingChildImage}
                    className="px-2.5 py-1.5 border border-slate-300 bg-white rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 shrink-0 hover:bg-slate-100"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                  <input
                    type="file"
                    ref={childImageInputRef}
                    onChange={handleUploadSingleChildImage}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    placeholder="Caption / Keterangan foto (opsional)..."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={!newImagePath}
                    className="w-full py-1.5 px-3 bg-[#081A2E] hover:bg-slate-800 text-white text-xs font-semibold rounded-lg disabled:opacity-40 whitespace-nowrap"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </form>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
              {loadingImages ? (
                <div className="py-12 text-center text-slate-400 text-xs">Memuat foto album...</div>
              ) : albumImages.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-600 font-semibold">
                    Belum ada foto di album ini.
                  </p>
                  <button
                    type="button"
                    onClick={() => multipleChildInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#A40D35] text-white text-xs font-bold rounded-lg hover:bg-[#850B2B]"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tambah Foto Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {albumImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      <img src={img.image_path} alt={img.caption || 'Foto Galeri'} className="w-full h-full object-cover" />
                      
                      {/* Top Overlay Actions */}
                      <div className="absolute top-1.5 inset-x-1.5 flex items-center justify-between z-10">
                        <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-white text-[10px] font-mono">
                          #{img.display_order || idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveImage(img.id, 'up')}
                            disabled={idx === 0}
                            className="p-1 bg-black/60 hover:bg-black/90 text-white rounded disabled:opacity-30"
                            title="Geser Kiri/Atas"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(img.id, 'down')}
                            disabled={idx === albumImages.length - 1}
                            className="p-1 bg-black/60 hover:bg-black/90 text-white rounded disabled:opacity-30"
                            title="Geser Kanan/Bawah"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteChildImage(img.id)}
                            className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                            title="Hapus foto dari album ini"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Caption Overlay */}
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                          <p className="text-[10px] text-white line-clamp-2 leading-tight">{img.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 flex-shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                {albumImages.length} Foto tersimpan
              </span>
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="px-5 py-2 bg-[#081A2E] text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

