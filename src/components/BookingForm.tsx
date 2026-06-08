import React, { useState } from 'react';
import { StreamPackage, BookingFormDetails } from '../types';
import { ADD_ONS } from '../data';
import { 
  Send, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  Clock, 
  PackageCheck, 
  PhoneCall, 
  CheckCircle2, 
  Printer, 
  RefreshCw,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface BookingFormProps {
  selectedPkg: StreamPackage;
  selectedDuration: number;
  selectedOvertimeHours: number;
  selectedAddOns: { [id: string]: number };
  appliedVoucher?: { code: string; discount: number; packageId?: string } | null;
  onVoucherChange?: (voucher: { code: string; discount: number; packageId?: string } | null) => void;
  onReset: () => void;
  preselectedDate?: string;
  onViewChange?: (view: string) => void;
}

export default function BookingForm({ 
  selectedPkg, 
  selectedDuration, 
  selectedOvertimeHours, 
  selectedAddOns, 
  appliedVoucher = null,
  onVoucherChange,
  onReset,
  preselectedDate = '',
  onViewChange
}: BookingFormProps) {
  
  const [formData, setFormData] = useState<BookingFormDetails>({
    name: '',
    company: '',
    whatsapp: '',
    email: '',
    eventDate: preselectedDate,
    eventTime: '08:00',
    eventLocation: '',
    eventNotes: ''
  });

  React.useEffect(() => {
    if (preselectedDate) {
      setFormData(prev => ({ ...prev, eventDate: preselectedDate }));
    }
  }, [preselectedDate]);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [assignedInvoiceId, setAssignedInvoiceId] = useState('');

  // Calculations mirror
  const basePrice = selectedPkg.rates[selectedDuration];
  const base4hPrice = selectedPkg.rates[4];
  const overtimeHourlyCost = base4hPrice * 0.15;
  const totalOvertimeCost = overtimeHourlyCost * selectedOvertimeHours;

  let totalAddOnsCost = 0;
  const activeAddOnsList: any[] = [];
  
  ADD_ONS.forEach(addon => {
    const qty = selectedAddOns[addon.id] || 0;
    if (qty > 0) {
      const cost = addon.price * qty;
      totalAddOnsCost += cost;
      activeAddOnsList.push({
        ...addon,
        quantity: qty,
        totalPrice: cost
      });
    }
  });

  const subtotalCost = basePrice + totalOvertimeCost + totalAddOnsCost;
  const discountAmount = appliedVoucher ? Math.round((subtotalCost * appliedVoucher.discount) / 100) : 0;
  const totalNett = subtotalCost - discountAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'Nomor WhatsApp wajib diisi.';
    } else if (!/^\+?[0-9]{8,15}$/.test(formData.whatsapp.replace(/[\s-]/g, ''))) {
      errors.whatsapp = 'Format nomor WhatsApp tidak valid (contoh: 081234567890).';
    }
    if (!formData.email.trim()) {
      errors.email = 'Alamat email wajib diisi.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid.';
    }
    if (!formData.eventDate) errors.eventDate = 'Tanggal event wajib dipilih.';
    if (!formData.eventLocation.trim()) errors.eventLocation = 'Lokasi / Detail alamat wajib diisi.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create formatted Indonesian text template for WhatsApp redirect
  const generateWhatsAppMessage = () => {
    const addOnsText = activeAddOnsList.length > 0 
      ? activeAddOnsList.map(a => `- ${a.name} (x${a.quantity}): Rp ${a.totalPrice.toLocaleString('id-ID')}`).join('\n')
      : '- Tidak ada';

    const voucherText = appliedVoucher 
      ? `\n• Subtotal Biaya: Rp ${subtotalCost.toLocaleString('id-ID')}\n• Voucher Diskon (${appliedVoucher.code} ${appliedVoucher.discount}%): -Rp ${discountAmount.toLocaleString('id-ID')}\n• Anda Hemat: Rp ${discountAmount.toLocaleString('id-ID')}!`
      : '';

    return `*RESERVASI LIVE STREAMING | PRIME BROADCAST*
------------------------------------------------
ID Unit: PB-REQ-${Math.floor(1000 + Math.random() * 9000)}

*DATA KELOLAAN KLIEN:*
• Nama Klien: ${formData.name}
• Perusahaan: ${formData.company || 'Pribadi'}
• WhatsApp: ${formData.whatsapp}
• Email: ${formData.email}

*DETAIL EVENT BROADCAST:*
• Paket Utama: ${selectedPkg.name} (${selectedDuration} Jam Utama)
• Overtime Tambahan: +${selectedOvertimeHours} Jam (${selectedOvertimeHours * 15}% extra)
• Tanggal Event: ${formData.eventDate}
• Waktu Mulai: ${formData.eventTime} WIB
• Lokasi Venue: ${formData.eventLocation}

*TAMBAHAN ADD-ON:*
${addOnsText}

------------------------------------------------
*RINCIAN ESTIMASI BIAYA:*
• Paket Dasar: Rp ${basePrice.toLocaleString('id-ID')}
• Biaya Overtime: Rp ${totalOvertimeCost.toLocaleString('id-ID')}
• Total Add-on: Rp ${totalAddOnsCost.toLocaleString('id-ID')}${voucherText}
• *Total Estimasi Nett: ${appliedVoucher ? `~Rp ${subtotalCost.toLocaleString('id-ID')}~ ➔ Rp ${totalNett.toLocaleString('id-ID')} (Anda Hemat Rp ${discountAmount.toLocaleString('id-ID')}!)` : `Rp ${totalNett.toLocaleString('id-ID')}`}*

*Catatan Tambahan:*
"${formData.eventNotes || 'Tidak ada catatan.'}"

------------------------------------------------
_Mohon konfirmasi ketersediaan kru kami untuk slot tanggal di atas. Terima kasih!_`;
  };

  const copyToClipboard = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadInvoicePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top color strip
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 8, 'F');

    // Branding Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('PRIME BROADCAST', 15, 24);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Premium Live Streaming & Broadcasting Solutions', 15, 29);
    
    // Vendor Contact Info
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('WA: +62 851-5055-5195', 195, 20, { align: 'right' });
    doc.text('Email: primebroadcast.id@gmail.com', 195, 25, { align: 'right' });
    doc.text('Web: https://prime-broadcast.vercel.app/', 195, 30, { align: 'right' });

    // Separator line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(15, 35, 195, 35);

    // Title & Document Info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(37, 99, 235); // Key blue
    doc.text('RINCIAN ESTIMASI BIAYA & RESERVASI', 15, 45);

    // Status box flag
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(15, 50, 68, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('STATUS: MENUNGGU TIM VALIDASI', 18, 54.5);

    // Left Column Info Metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('No Invoice:', 15, 65);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(assignedInvoiceId || 'PB-INV-PENDING', 42, 65);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Tanggal Cetak:', 15, 71);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }), 42, 71);

    // Right Column Box - Client Target info
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(110, 43, 85, 36, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(110, 43, 85, 36, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('DIPERSIAPKAN UNTUK KLIEN:', 115, 49);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text(formData.name, 115, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Perusahaan: ${formData.company || 'Pribadi'}`, 115, 61);
    doc.text(`WhatsApp: ${formData.whatsapp}`, 115, 67);
    doc.text(`Email: ${formData.email}`, 115, 73);

    // Event Info Section Header
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(15, 85, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('DETAIL TARGET PENYIARAN / EVENT', 18, 90.5);

    // Event Info fields drawing
    let runningY = 98;
    const drawMetaDetail = (title: string, content: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(title, 15, runningY);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      
      // Prevent long locations overflowing
      const maxChar = 65;
      const displayContent = content.length > maxChar ? content.slice(0, maxChar) + '...' : content;
      doc.text(displayContent, 55, runningY);
      runningY += 5.5;
    };

    drawMetaDetail('Paket Penyiaran:', `${selectedPkg.name} (${selectedDuration} Jam Siaran)`);
    drawMetaDetail('Tanggal Agenda:', formData.eventDate);
    drawMetaDetail('Jam Mulai Siaran:', `${formData.eventTime} WIB`);
    drawMetaDetail('Lokasi Venue:', formData.eventLocation);
    if (formData.eventNotes) {
      drawMetaDetail('Catatan Tambahan:', formData.eventNotes);
    }

    runningY += 1.5;

    // Services breakdown header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, runningY, 180, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('ITEM RINCIAN SEWA / SERVICE PENYIARAN', 18, runningY + 4.5);
    doc.text('ESTIMASI SUB-TOTAL', 195, runningY + 4.5, { align: 'right' });
    
    runningY += 11;

    // Render Table row items
    const rowPrinter = (itemTitle: string, subDesc: string, costValue: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(itemTitle, 15, runningY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(subDesc, 15, runningY + 3.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Rp ${costValue.toLocaleString('id-ID')}`, 195, runningY + 1.5, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.line(15, runningY + 6.5, 195, runningY + 6.5);
      runningY += 11.5;
    };

    // Draw row elements
    rowPrinter(`Sewa Paket: ${selectedPkg.name}`, `Fasilitas unit lengkap durasi utama ${selectedDuration} Jam`, basePrice);
    
    if (selectedOvertimeHours > 0) {
      rowPrinter(`Overtime Tambahan (+${selectedOvertimeHours} Jam)`, `Tambahan jam operasional kru siaran (tarif 15% / jam dari paket dasar)`, totalOvertimeCost);
    }

    if (activeAddOnsList.length > 0) {
      activeAddOnsList.forEach(item => {
        rowPrinter(`${item.name} (x${item.quantity})`, `Add-on peralatan atau kru pembantu tambahan`, item.totalPrice);
      });
    }

    runningY += 1.5;

    // Left container: Support details (Ketentuan Operasional)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('KETENTUAN OPERASIONAL PRIME BROADCAST:', 15, runningY + 3.5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text('• Klien di berikan waktu maksimal 3 hari setelah invoice ini keluar, jika tidak', 15, runningY + 7);
    doc.text('  maka vendor menggangap jika klien membatalkan secara sepihak.', 15, runningY + 10);
    doc.text('• Pembayaran DP sebesar 50% wajib dilakukan secepatnya H-7 konfirmasi', 15, runningY + 13.5);
    doc.text('  siaran, dan pembayaran harus diselesaikan 100% H-1 Acara.', 15, runningY + 16.5);
    doc.text('• Tim berhak membatalkan operasional jika venue dinilai membahayakan', 15, runningY + 20);
    doc.text('  kru atau perangkat siaran kami.', 15, runningY + 23);
    doc.text('• DP bersifat non-refundable, kecuali kesalahan dilakukan dari pihak kami.', 15, runningY + 26.5);

    // Right container: Subtotal, Discount & Total Nett calculation
    const rightBoxX = 110;
    const summaryRowPrinter = (label: string, textPrice: string, isBig = false, isDiscountRow = false) => {
      doc.setFont('helvetica', isBig ? 'bold' : 'normal');
      doc.setFontSize(isBig ? 10.5 : 8.5);
      
      if (isDiscountRow) {
        doc.setTextColor(22, 163, 74); // success green
        doc.setFontSize(7.5);
      } else if (isBig) {
        doc.setTextColor(37, 99, 235); // Brand blue
      } else {
        doc.setTextColor(100, 116, 139); // Gray slate
      }
      
      doc.text(label, rightBoxX, runningY + 3.5);
      
      doc.setFont('helvetica', 'bold');
      if (isBig) {
        doc.setFontSize(11);
      } else if (isDiscountRow) {
        doc.setFontSize(8.5);
      } else {
        doc.setFontSize(9);
      }
      doc.text(textPrice, 195, runningY + 3.5, { align: 'right' });
      runningY += 5.5;
    };

    summaryRowPrinter('Subtotal Tagihan:', `Rp ${subtotalCost.toLocaleString('id-ID')}`);
    
    if (appliedVoucher) {
      summaryRowPrinter(`Voucher (${appliedVoucher.code}):`, `-Rp ${discountAmount.toLocaleString('id-ID')}`, false, true);
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(rightBoxX, runningY + 1, 195, runningY + 1);
    runningY += 5;

    summaryRowPrinter('ESTIMASI TOTAL NETT:', `Rp ${totalNett.toLocaleString('id-ID')}`, true);

    if (appliedVoucher) {
      runningY += 1.5;
      doc.setFillColor(240, 253, 244); // light green background
      doc.setDrawColor(187, 247, 208); // light green border
      doc.rect(rightBoxX, runningY, 85, 8.5, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 128, 61); // dark forest green
      doc.text(`ANDA HEMAT Rp ${discountAmount.toLocaleString('id-ID')}!`, rightBoxX + 4, runningY + 5.5);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(15, 275, 195, 275);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Faktur ini adalah estimasi biaya pendaftaran digital otomatis. Silakan verifikasi untuk booking slot final.', 105, 281, { align: 'center' });
    doc.text('Dukungan Teknis & Legalitas: Prime Broadcast Indonesia • wa.me/6285150555195', 105, 285, { align: 'center' });

    doc.save(`Invoice-${assignedInvoiceId || 'PROP'}-${formData.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleWhatsAppRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const message = generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/6285150555195?text=${encodedMessage}`;
    
    // Set simulated confirmation variables
    const calculatedInvoiceId = `PB-INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(100 + Math.random() * 900)}`;
    setAssignedInvoiceId(calculatedInvoiceId);
    setOrderSubmitted(true);

    // Auto-register booking in Local Storage calendar schedules
    try {
      const stored = localStorage.getItem('pb_booked_dates');
      let currentBookings = [];
      if (stored) {
        currentBookings = JSON.parse(stored);
      }
      const newBook = {
        id: calculatedInvoiceId,
        date: formData.eventDate,
        title: `Konfirmasi Reservasi • ${selectedPkg.name}`,
        clientName: formData.name,
        isManual: false,
        packageType: selectedPkg.name,
        time: formData.eventTime
      };
      
      // Check if duplicate date already exists to prevent duplication
      if (!currentBookings.some((b: any) => b.date === formData.eventDate)) {
        currentBookings.push(newBook);
        localStorage.setItem('pb_booked_dates', JSON.stringify(currentBookings));
      }
    } catch (err) {
      console.error("Gagal mendaftarkan jadwal ke kalender lokal:", err);
    }

    // Prompt window redirection link
    window.open(whatsappUrl, '_blank', 'noreferrer,noopener');
  };

  return (
    <div className="py-12 bg-slate-950 text-white text-left relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title details */}
        <div className="mb-8 border-b border-white/5 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-blue-400 font-mono font-bold uppercase tracking-widest block mb-1">
                Langkah Terakhir Pemesanan
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white">
                Formulir Rincian & Jadwal Siaran
              </h2>
            </div>
            <button
              onClick={onReset}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ganti Konfigurasi Paket</span>
            </button>
          </div>
        </div>

        {/* Modal/Banner for successful confirmation state */}
        {orderSubmitted ? (
          <div className="glass-panel p-8 rounded-3xl border-green-500/30 text-center flex flex-col items-center justify-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mb-6 live-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-display font-black mb-2 text-green-400">
              Formulir Reservasi Siap Dikirim!
            </h3>
            
            <p className="text-slate-300 text-sm leading-relaxed max-w-lg mb-6">
              Sistem telah memformat rincian orderan Anda dan mencoba membuka aplikasi WhatsApp ke chat tim operasional Prime Broadcast di <b className="text-[#aec6ff]">+62 851-5055-5195</b>. Jika diarahkan tertunda atau Anda berada dalam window khusus, silakan salin draf format di bawah ini.
            </p>

            {/* Generated Invoice Metadata Card */}
            <div className="w-full bg-slate-950 p-6 rounded-2xl border border-white/5 text-left mb-6 font-mono text-xs">
              <div className="flex justify-between border-b border-white/10 pb-3 mb-3 text-slate-400">
                <span>FAKTUR INVOICE NO:</span>
                <span className="font-bold text-white">{assignedInvoiceId}</span>
              </div>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Klien:</span>
                  <span className="text-white font-semibold">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Siaran:</span>
                  <span className="text-white font-semibold">{formData.eventDate} ({formData.eventTime} WIB)</span>
                </div>
                <div className="flex justify-between">
                  <span>Paket Utama:</span>
                  <span className="text-white font-semibold">{selectedPkg.name}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                  <span>Total Harga (Subtotal):</span>
                  <span className="text-white font-semibold">Rp {subtotalCost.toLocaleString('id-ID')}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-green-400">
                    <span>Potongan Voucher ({appliedVoucher.code}):</span>
                    <span>-{appliedVoucher.discount}% (-Rp {discountAmount.toLocaleString('id-ID')})</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2 mt-1 items-center">
                  <span className="text-slate-400 font-bold">Total Nett:</span>
                  <div className="text-right">
                    {appliedVoucher ? (
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                        <span className="text-slate-500 line-through text-[11px]">Rp {subtotalCost.toLocaleString('id-ID')}</span>
                        <span className="text-blue-400 font-extrabold text-sm">
                          Rp {totalNett.toLocaleString('id-ID')} <span className="text-green-500 font-bold text-[11px] font-sans">(Anda Hemat Rp {discountAmount.toLocaleString('id-ID')}!)</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-blue-400 font-extrabold text-sm">Rp {totalNett.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={downloadInvoicePDF}
                className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold p-4 rounded-xl shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 transition-all cursor-pointer text-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>Unduh PDF Invoice Terformat</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold p-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Berhasil Disalin!' : 'Salin Format Copy-Paste'}</span>
                </button>

                <button
                  onClick={() => {
                    const message = generateWhatsAppMessage();
                    window.open(`https://wa.me/6285150555195?text=${encodeURIComponent(message)}`, '_blank', 'noreferrer,noopener');
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold p-3.5 rounded-xl shadow-lg transition-all cursor-pointer text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Ulang WhatsApp</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderSubmitted(false);
                onReset();
              }}
              className="mt-6 text-xs text-slate-400 hover:text-white underline transition-colors"
            >
              Buat Reservasi Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* BOOKING INPUTS FORM CONTAINER */}
            <form onSubmit={handleWhatsAppRedirect} className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl flex flex-col gap-5">
              <h3 className="text-lg font-display font-bold text-white mb-2 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-blue-400" />
                <span>Rincian Kontak & Tanggal Pembukuan</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Nama Lengkap Pemesan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Contoh: Hendrik Wijaya"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {formErrors.name && (
                    <span className="text-[11px] text-red-400 mt-1 block">{formErrors.name}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Nama Perusahaan / Lembaga (Opsional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Contoh: Universitas Indonesia"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    No. WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="Contoh: 085150555195"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <PhoneCall className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                  {formErrors.whatsapp && (
                    <span className="text-[11px] text-red-400 mt-1 block">{formErrors.whatsapp}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Contoh: emailklien@domain.com"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  {formErrors.email && (
                    <span className="text-[11px] text-red-400 mt-1 block">{formErrors.email}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tanggal Siaran / Event <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="eventDate"
                      required
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                  {onViewChange && (
                    <button
                      type="button"
                      onClick={() => onViewChange('schedule')}
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-semibold mt-2.5 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>Cek Kalender Ketersediaan (Cek Tanggal Kosong / Terisi) 📅</span>
                    </button>
                  )}
                  {formErrors.eventDate && (
                    <span className="text-[11px] text-red-400 mt-1 block">{formErrors.eventDate}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Jam Mulai Siaran (WIB)
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Alamat Lengkap Venue / Lokasi Event <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="eventLocation"
                    required
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    placeholder="Gedung / Aula, Jalan, Kec, Kota/Kabupaten"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
                {formErrors.eventLocation && (
                  <span className="text-[11px] text-red-400 mt-1 block">{formErrors.eventLocation}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Catatan Kustom atau Kebutuhan Tambahan (Opsional)
                </label>
                <textarea
                  name="eventNotes"
                  rows={4}
                  value={formData.eventNotes}
                  onChange={handleInputChange}
                  placeholder="Contoh: Butuh layout visual logo GBI di pojok kiri atas, output ditargetkan ke Google Meet dan YouTube private link..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Order triggers */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-600/10 hover:shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <Send className="w-5 h-5 text-white" />
                  <span>Kirim Data & Chat di WhatsApp</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Mengajukan formulir ini akan menyusun invoice pendaftaran dan meneruskan pesan order ke vendor Prime Broadcast. Anda tidak dipungut biaya apapun sampai tim memvalidasi status ketersediaan di hari H.
                </p>
              </div>
            </form>

            {/* LIVE BILLING BREAKDOWN CARD */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="glass-panel p-6 rounded-2xl border-white/10">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                    Rincian Tagihan Anda
                  </span>
                </div>

                <div className="space-y-4 text-slate-300">
                  {/* Selected Package Details */}
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-extrabold text-blue-400 block uppercase">
                        {selectedPkg.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        Durasi Kontrak: {selectedDuration} Jam
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-white">
                      Rp {basePrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Overtime display details */}
                  {selectedOvertimeHours > 0 && (
                    <div className="flex justify-between items-start text-sm border-t border-white/5 pt-3">
                      <div>
                        <span className="font-semibold text-slate-200 block">
                          Overtime ({selectedOvertimeHours} Jam)
                        </span>
                        <span className="text-xs text-slate-400">
                          Tarif Overtime 15% / jam: Rp {overtimeHourlyCost.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-white">
                        Rp {totalOvertimeCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}

                  {/* AddOn displays */}
                  {activeAddOnsList.length > 0 && (
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-xs text-slate-400 font-bold block uppercase mb-2">
                        Pilihan Add-On Peralatan:
                      </span>
                      <div className="space-y-2">
                        {activeAddOnsList.map((addon) => (
                          <div key={addon.id} className="flex justify-between text-xs pl-2 border-l border-blue-500/40">
                            <span className="text-slate-300">
                              {addon.name} <b>(x{addon.quantity})</b>
                            </span>
                            <span className="font-mono font-semibold">
                              Rp {addon.totalPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voucher display row if applied */}
                  {appliedVoucher && (
                    <div className="flex justify-between items-start text-sm border-t border-white/5 pt-3">
                      <div>
                        <span className="font-bold text-green-400 block font-sans">
                          Potongan Voucher ({appliedVoucher.code})
                        </span>
                        <span className="text-xs text-slate-400 font-sans">
                          Diskon {appliedVoucher.discount}% dari Subtotal
                        </span>
                      </div>
                      <span className="font-mono font-bold text-green-400">
                        -Rp {discountAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}

                  {/* Direct Terms summary reminder */}
                  <div className="border-t border-white/10 pt-4 mt-4 bg-slate-950 p-4 rounded-xl border border-white/5">
                    <span className="block text-xs font-bold text-[#aec6ff] uppercase mb-1">
                      Kebijakan Operasional Utama
                    </span>
                    <ul className="text-[11px] leading-relaxed text-slate-400 list-disc pl-4 space-y-1">
                      <li>Penggantian tanggal / reschedule harus diajukan maksimal H-7 acara.</li>
                      <li>Pembatalan kurang dari H-3 dikenakan pemotongan 30% dari total rental.</li>
                      <li>Wajib menyediakan space meja operator berukuran minimal 2m x 1m yang teduh.</li>
                    </ul>
                  </div>

                  {/* Total calculation values */}
                  <div className="border-t border-white/10 pt-4 mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block uppercase">
                        ESTIMASI TOTAL NETT
                      </span>
                      <span className="text-[10px] text-slate-500">Harga belum termasuk PPN 11%</span>
                    </div>
                    <div className="text-right">
                      {appliedVoucher && (
                        <div className="text-xs font-mono line-through text-slate-500 mb-0.5">
                          Rp {subtotalCost.toLocaleString('id-ID')}
                        </div>
                      )}
                      <div className="text-2xl font-mono font-black text-blue-400">
                        Rp {totalNett.toLocaleString('id-ID')}
                      </div>
                      {appliedVoucher && (
                        <div className="text-[10px] text-green-400 font-bold mt-1">
                          Anda Hemat Rp {discountAmount.toLocaleString('id-ID')}!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical guarantee card */}
              <div className="p-4 rounded-xl bg-purple-950/10 border border-purple-500/20 text-xs text-slate-400">
                <span className="font-bold text-purple-300 block mb-1">Garansi Kualitas Prime Broadcast</span>
                <span>Setiap siaran didukung oleh hardware encoder streaming cadangan dan internet multi-seluler bonding untuk meminimalisir kemungkinan latency tinggi atau down saat acara berlangsung.</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
