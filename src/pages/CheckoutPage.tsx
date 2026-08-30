import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Package, Upgrade, Addon, OvertimeSettings, Order } from '../types';
import {
  createOrder,
} from '../services/api';
import { formatIDR } from '../utils/currency';
import {
  X,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePublicData } from '../contexts/PublicDataContext';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Selections state from location.state or localStorage draft
  const [packageId, setPackageId] = useState<string>('');
  const [selectedUpgrades, setSelectedUpgrades] = useState<{ id: string; quantity: number }[]>([]);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<{ id: string; quantity: number }[]>([]);
  const [voucherCode, setVoucherCode] = useState<string>('');

  // Master records from central Public Data provider
  const { packages, upgrades, addons, overtimeSettings } = usePublicData();
  const loadingData = false;

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('08:00');
  const [venueAddress, setVenueAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState<string | null>(null);

  // Load selections
  useEffect(() => {
    try {
      const state = location.state as {
        package_id?: string;
        upgrades?: { id: string; quantity: number }[];
        overtime_hours?: number;
        addons?: { id: string; quantity: number }[];
        voucher_code?: string;
      } | null;

      if (state?.package_id) {
        setPackageId(state.package_id);
        if (state.upgrades) setSelectedUpgrades(state.upgrades);
        if (typeof state.overtime_hours === 'number') setOvertimeHours(state.overtime_hours);
        if (state.addons) setSelectedAddons(state.addons);
        if (state.voucher_code) setVoucherCode(state.voucher_code);
      } else {
        // Check draft
        const draftStr = localStorage.getItem('pb_cart_draft');
        if (draftStr) {
          const draft = JSON.parse(draftStr);
          if (draft.package_id) setPackageId(draft.package_id);
          if (draft.upgrades) {
            setSelectedUpgrades(
              Object.entries(draft.upgrades).map(([id, qty]) => ({
                id,
                quantity: qty as number,
              }))
            );
          }
          if (typeof draft.overtime_hours === 'number') setOvertimeHours(draft.overtime_hours);
          if (draft.addons) {
            setSelectedAddons(
              Object.entries(draft.addons).map(([id, qty]) => ({
                id,
                quantity: qty as number,
              }))
            );
          }
          if (draft.voucher_code) setVoucherCode(draft.voucher_code);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [location.state, packages]);

  // Selected package
  const selectedPkg = packages.find((p) => p.id === packageId);

  // Recalculate summary preview
  const packagePrice = selectedPkg?.price || 0;

  let upgradesTotal = 0;
  selectedUpgrades.forEach((item) => {
    const upg = upgrades.find((u) => u.id === item.id);
    if (upg && item.quantity > 0) {
      upgradesTotal += upg.price * item.quantity;
    }
  });

  let overtimeTotal = 0;
  if (selectedPkg && overtimeSettings?.is_active && overtimeHours > 0) {
    const rate = Math.round(selectedPkg.price * (overtimeSettings.rate_percent / 100));
    overtimeTotal = rate * overtimeHours;
  }

  let addonsTotal = 0;
  selectedAddons.forEach((item) => {
    const add = addons.find((a) => a.id === item.id);
    if (add && item.quantity > 0) {
      addonsTotal += add.price * item.quantity;
    }
  });

  const subtotal = packagePrice + upgradesTotal + overtimeTotal + addonsTotal;

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!customerName.trim()) {
      setFormError('Nama Lengkap wajib diisi.');
      return;
    }
    if (!organizationName.trim()) {
      setFormError('Nama Lembaga / Perusahaan wajib diisi.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/[^0-9]/g, '').length < 8) {
      setFormError('Nomor WhatsApp aktif wajib diisi dengan format yang benar.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setFormError('Alamat email tidak valid.');
      return;
    }
    if (!eventDate) {
      setFormError('Tanggal acara wajib dipilih.');
      return;
    }
    if (!eventStartTime) {
      setFormError('Jam mulai acara wajib diisi.');
      return;
    }
    if (!venueAddress.trim()) {
      setFormError('Alamat lengkap lokasi acara/venue wajib diisi.');
      return;
    }
    if (!packageId) {
      setFormError('Silakan kembali ke halaman paket untuk memilih paket penyiaran.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createOrder({
        customer_name: customerName,
        organization_name: organizationName,
        whatsapp,
        email,
        event_date: eventDate,
        event_start_time: eventStartTime,
        venue_address: venueAddress,
        additional_notes: additionalNotes,
        package_id: packageId,
        selected_upgrades: selectedUpgrades,
        overtime_hours: overtimeHours,
        selected_addons: selectedAddons,
        voucher_code: voucherCode,
      });

      if (response.success && response.order && response.whatsapp_url) {
        setCreatedOrder(response.order);
        setWhatsappRedirectUrl(response.whatsapp_url);
        // Clear local draft
        localStorage.removeItem('pb_cart_draft');

        // Open WhatsApp in new tab / window
        try {
          window.open(response.whatsapp_url, '_blank');
        } catch {
          // Pop-up blocker fallback handles it gracefully in the UI
        }
      } else {
        setFormError(response.message || 'Terjadi kesalahan saat memproses pesanan.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Gagal membuat reservasi pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully created, show confirmation view
  if (createdOrder && whatsappRedirectUrl) {
    return (
      <div className="min-h-screen flex flex-col bg-[#EAE8E4]" id="checkout-success-view">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="w-full max-w-[800px] bg-[#F1F0EE]/95 backdrop-blur-md rounded-[32px] border border-black/[0.04] p-8 sm:p-12 text-center space-y-7 shadow-[0_25px_70px_rgba(8,26,46,0.12),0_4px_16px_rgba(8,26,46,0.04)]">
            <div className="w-16 h-16 rounded-full bg-emerald-100/90 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#A40D35]">
                Reservasi Berhasil
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E] leading-tight">
                Konfirmasi Pemesanan Telah Tersimpan
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                Data reservasi Anda telah berhasil diverifikasi oleh sistem Prime Broadcast.
              </p>
            </div>

            <div className="p-6 bg-white/85 rounded-[24px] border border-black/[0.05] text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/60 pb-3">
                <span className="text-xs text-slate-500 font-semibold">Nomor Invoice Resmi</span>
                <span className="text-lg font-bold text-[#A40D35]">{createdOrder.invoice_number}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 pt-1">
                <div>
                  <span className="text-slate-400">Penanggung Jawab:</span>{' '}
                  <span className="font-semibold text-slate-900">{createdOrder.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Instansi:</span>{' '}
                  <span className="font-semibold text-slate-900">{createdOrder.organization_name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Jadwal Acara:</span>{' '}
                  <span className="font-semibold text-slate-900">{createdOrder.event_date} ({createdOrder.event_start_time} WIB)</span>
                </div>
                <div>
                  <span className="text-slate-400">Estimasi Total:</span>{' '}
                  <span className="font-bold text-[#A40D35]">{formatIDR(createdOrder.estimated_total)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              <a
                href={whatsappRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="whatsapp-redirect-success-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 h-[54px] rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#081A2E] via-[#5C0D22] to-[#A40D35] hover:opacity-95 shadow-[0_10px_30px_rgba(164,13,53,0.22)] active:scale-[0.98] transition-all"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Buka WhatsApp Operasional
              </a>

              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 h-[54px] rounded-full text-sm sm:text-base font-semibold text-slate-700 hover:text-[#081A2E] bg-white/80 hover:bg-white border border-slate-200/80 transition-all active:scale-[0.98]"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EAE8E4]" id="checkout-page-root">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loadingData ? (
          <div className="text-center py-24 text-slate-500 text-sm font-medium">
            Memuat formulir pemesanan...
          </div>
        ) : !selectedPkg ? (
          <div className="w-full max-w-[600px] bg-[#F1F0EE]/95 rounded-[32px] border border-black/[0.04] p-8 sm:p-12 text-center space-y-6 shadow-[0_25px_70px_rgba(8,26,46,0.12)]">
            <AlertCircle className="w-12 h-12 text-[#A40D35] mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#081A2E]">
                Belum Ada Paket yang Dipilih
              </h2>
              <p className="text-slate-600 text-sm">
                Silakan pilih paket live streaming terlebih dahulu sebelum mengisi formulir reservasi.
              </p>
            </div>
            <div>
              <Link
                to="/paket"
                className="inline-flex items-center justify-center px-8 h-[52px] rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#081A2E] to-[#A40D35] hover:opacity-95 shadow-md transition-all"
              >
                Pilih Paket Sekarang
              </Link>
            </div>
          </div>
        ) : (
          /* ONE Large Registration Sheet / Panel (Ref: Indonesian Youth Leadership Summit Form) */
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[1040px] bg-[#F1F0EE] sm:bg-[#F1F0EE]/96 backdrop-blur-md rounded-[28px] sm:rounded-[34px] border border-black/[0.04] shadow-[0_25px_70px_rgba(8,26,46,0.12),0_4px_16px_rgba(8,26,46,0.04)] overflow-hidden flex flex-col my-auto"
          >
            {/* 1. Header Area */}
            <div className="p-6 sm:p-8 lg:p-10 pb-5 sm:pb-6 border-b border-slate-300/60 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 pr-10">
                  <div className="text-xs sm:text-[13px] font-semibold text-[#A40D35]">
                    Formulir Reservasi ({selectedPkg.name}: {formatIDR(subtotal)})
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#081A2E] leading-tight tracking-tight">
                    Konfirmasi Pemesanan Prime Broadcast
                  </h1>
                </div>

                {/* Close Button linking back to packages */}
                <button
                  type="button"
                  onClick={() => navigate('/paket')}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-[#081A2E] flex items-center justify-center shadow-sm border border-slate-300/50 transition-all flex-shrink-0 active:scale-95"
                  title="Kembali ke Pilihan Paket"
                  aria-label="Tutup dan kembali"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. Scrollable Body & Form Area */}
            <div className="p-6 sm:p-8 lg:p-10 pt-6 sm:pt-7 overflow-y-auto max-h-[calc(86vh-160px)]">
              {formError && (
                <div className="mb-6 p-4 rounded-[20px] bg-red-50/90 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} id="customer-checkout-form" className="space-y-7">
                {/* Section Title with horizontal divider like reference */}
                <div className="flex items-center gap-4">
                  <h2 className="text-base sm:text-lg font-bold text-[#081A2E] whitespace-nowrap">
                    Informasi Klien & Jadwal Penyiaran
                  </h2>
                  <div className="h-px bg-slate-300/70 flex-1" />
                </div>

                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-5 sm:gap-y-6">
                  {/* ROW 1 - Col 1: Nama Lengkap */}
                  <div>
                    <label
                      htmlFor="input-customer-name"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Nama Lengkap / Penanggung Jawab <span className="text-[#A40D35]">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-customer-name"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama lengkap sesuai penanggung jawab"
                      className="w-full h-[54px] sm:h-[56px] px-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] placeholder:text-slate-400 border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35]"
                    />
                  </div>

                  {/* ROW 1 - Col 2: Lembaga / Perusahaan */}
                  <div>
                    <label
                      htmlFor="input-organization-name"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Nama Lembaga / Perusahaan / Komunitas <span className="text-[#A40D35]">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-organization-name"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Nama perusahaan / lembaga / komunitas"
                      className="w-full h-[54px] sm:h-[56px] px-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] placeholder:text-slate-400 border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35]"
                    />
                  </div>

                  {/* ROW 2 - Col 1: WhatsApp */}
                  <div>
                    <label
                      htmlFor="input-whatsapp"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Nomor WhatsApp Aktif <span className="text-[#A40D35]">*</span>
                    </label>
                    <input
                      type="tel"
                      id="input-whatsapp"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="w-full h-[54px] sm:h-[56px] px-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] placeholder:text-slate-400 border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35]"
                    />
                  </div>

                  {/* ROW 2 - Col 2: Email */}
                  <div>
                    <label
                      htmlFor="input-email"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Alamat Email <span className="text-[#A40D35]">*</span>
                    </label>
                    <input
                      type="email"
                      id="input-email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@perusahaan.com"
                      className="w-full h-[54px] sm:h-[56px] px-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] placeholder:text-slate-400 border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35]"
                    />
                  </div>

                  {/* ROW 3 - Col 1: Tanggal Acara */}
                  <div>
                    <label
                      htmlFor="input-event-date"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Tanggal Acara <span className="text-[#A40D35]">*</span>
                    </label>
                    <input
                      type="date"
                      id="input-event-date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full h-[54px] sm:h-[56px] px-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35]"
                    />
                  </div>

                  {/* ROW 3 - Col 2: Jam Mulai */}
                  <div>
                    <label
                      htmlFor="input-event-time"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Jam Mulai Acara <span className="text-[#A40D35]">*</span>
                    </label>
                    <input
                      type="time"
                      id="input-event-time"
                      required
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      className="w-full h-[54px] sm:h-[56px] px-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35]"
                    />
                  </div>

                  {/* ROW 4 (FULL WIDTH): Alamat Venue */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="input-venue-address"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Alamat Lengkap Venue / Lokasi Event <span className="text-[#A40D35]">*</span>
                    </label>
                    <textarea
                      id="input-venue-address"
                      required
                      rows={3}
                      value={venueAddress}
                      onChange={(e) => setVenueAddress(e.target.value)}
                      placeholder="Nama gedung, ruangan, serta alamat lengkap"
                      className="w-full min-h-[110px] sm:min-h-[120px] p-5 sm:p-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] placeholder:text-slate-400 border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35] resize-none"
                    />
                  </div>

                  {/* ROW 5 (FULL WIDTH): Catatan Tambahan */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="input-additional-notes"
                      className="block text-xs sm:text-[13.5px] font-semibold text-[#081A2E] mb-2"
                    >
                      Catatan Tambahan / Kebutuhan Khusus
                    </label>
                    <textarea
                      id="input-additional-notes"
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Tambahkan kebutuhan khusus jika ada"
                      className="w-full min-h-[100px] sm:min-h-[110px] p-5 sm:p-6 rounded-[26px] bg-white/85 focus:bg-white text-sm sm:text-base text-[#081A2E] placeholder:text-slate-400 border border-slate-300/50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#A40D35]/25 focus:border-[#A40D35] resize-none"
                    />
                  </div>
                </div>

                {/* 3. Form Footer / Action Area */}
                <div className="pt-6 border-t border-slate-300/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-3.5 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/paket')}
                    className="w-full sm:w-auto px-8 h-[52px] sm:h-[54px] rounded-full text-sm sm:text-base font-semibold text-[#5F6268] hover:text-[#081A2E] bg-white/80 hover:bg-white border border-slate-300/60 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center"
                  >
                    Kembali
                  </button>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    id="submit-order-checkout-button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-8 sm:px-10 h-[52px] sm:h-[54px] rounded-full text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#081A2E] via-[#5C0D22] to-[#A40D35] hover:opacity-95 shadow-[0_10px_30px_rgba(164,13,53,0.22)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{submitting ? 'Memproses Reservasi...' : 'Kirim Form & Hubungi WhatsApp'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
};

