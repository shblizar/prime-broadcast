import React, { useState, useEffect, useRef } from 'react';
import { StreamPackage, BookingFormDetails } from '../types';
import { ADD_ONS, CAMERA_UPGRADE_OPTIONS, PACKAGES } from '../data';
import { validateVoucherCode } from '../lib/voucherService';
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
  FileDown,
  AlertCircle,
  CreditCard,
  X,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import flatpickr from 'flatpickr';

// ==================================================================================================
// MAKE.COM WEBHOOK CONFIGURATIONS
// Ganti URL string di bawah ini dengan URL Webhook skenario Make.com Anda untuk mengaktifkan integrasi.
// ==================================================================================================
const MAKE_WEBHOOK_CEK_JADWAL = "https://hook.us2.make.com/your-scenario-1-id";
const MAKE_WEBHOOK_GENERATE_QRIS = "https://hook.us2.make.com/your-scenario-2-id";

interface BookingFormProps {
  selectedPkg: StreamPackage;
  selectedDuration: number;
  selectedOvertimeHours: number;
  selectedAddOns: { [id: string]: number };
  selectedCameraId?: string;
  selectedCameraCount?: number;
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
  selectedCameraId = 'nx100',
  selectedCameraCount = 1,
  appliedVoucher = null,
  onVoucherChange,
  onReset,
  preselectedDate = '',
  onViewChange
}: BookingFormProps) {
  
  // Client input states
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

  // Local package states to allow changing in order form
  const [localPkg, setLocalPkg] = useState<StreamPackage>(selectedPkg);
  const [localDuration, setLocalDuration] = useState<number>(selectedDuration);
  const [localOvertimeHours, setLocalOvertimeHours] = useState<number>(selectedOvertimeHours);
  const [localCameraId, setLocalCameraId] = useState<string>(selectedCameraId);
  const [localCameraCount, setLocalCameraCount] = useState<number>(selectedCameraCount);

  // Voucher validation states
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>('');
  const [localVoucher, setLocalVoucher] = useState<{ code: string; discount: number; packageId?: string } | null>(appliedVoucher);
  const [voucherError, setVoucherError] = useState<string>('');
  const [voucherSuccess, setVoucherSuccess] = useState<string>('');
  const [loadingVoucher, setLoadingVoucher] = useState<boolean>(false);

  // Booking & submission states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // General receipt metadata state
  const [copypasteCopied, setCopypasteCopied] = useState<boolean>(false);
  const [formattedInvoiceId, setFormattedInvoiceId] = useState<string>('');
  const [orderFinalized, setOrderFinalized] = useState<boolean>(false);

  const calendarInstanceRef = useRef<any>(null);

  // Sync preselected date
  useEffect(() => {
    if (preselectedDate) {
      setFormData(prev => ({ ...prev, eventDate: preselectedDate }));
    }
  }, [preselectedDate]);

  // Sync the local configuration states on prop changes from packages & estimator screen
  useEffect(() => {
    setLocalPkg(selectedPkg);
    setLocalDuration(selectedDuration);
    setLocalOvertimeHours(selectedOvertimeHours);
    setLocalCameraId(selectedCameraId);
    setLocalCameraCount(selectedCameraCount);
    setLocalVoucher(appliedVoucher);
  }, [selectedPkg, selectedDuration, selectedOvertimeHours, selectedCameraId, selectedCameraCount, appliedVoucher]);

  // Handle Flatpickr calendar setup
  useEffect(() => {
    const el = document.getElementById('flatpickrCalendarTrigger');
    if (el) {
      calendarInstanceRef.current = flatpickr(el, {
        dateFormat: "Y-m-d",
        minDate: "today",
        defaultDate: formData.eventDate || undefined,
        onChange: (selectedDates, dateStr) => {
          setFormData(prev => ({ ...prev, eventDate: dateStr }));
        }
      });
    }

    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
      }
    };
  }, [formData.eventDate, localPkg]);

  // Math calculation variables using local states
  const basePrice = localPkg.rates[localDuration] || localPkg.rates[4] || 0;
  const base4hPrice = localPkg.rates[4] || 0;
  const overtimeHourlyCost = base4hPrice * 0.15;
  const totalOvertimeCost = overtimeHourlyCost * localOvertimeHours;

  const cameraOpt = CAMERA_UPGRADE_OPTIONS.find(c => c.id === localCameraId) || CAMERA_UPGRADE_OPTIONS[0];
  const isCameraUpgraded = cameraOpt.id !== 'nx100';
  const cameraUpgradeCost = isCameraUpgraded ? cameraOpt.extraPrice * localCameraCount : 0;

  // Derive addons
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

  // Calculate: Total Harga = (Harga Paket - Diskon Voucher) + Pajak 1%
  const subtotalCost = basePrice + totalOvertimeCost + totalAddOnsCost + cameraUpgradeCost;
  const discountAmount = localVoucher ? Math.round((subtotalCost * localVoucher.discount) / 100) : 0;
  const priceAfterDiscount = subtotalCost - discountAmount;
  const taxAmount1Percent = Math.round(priceAfterDiscount * 0.01);
  const totalNettPrice = priceAfterDiscount + taxAmount1Percent;

  // Input controller
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Voucher dynamic submit
  const triggerVoucherApply = async () => {
    if (!voucherCodeInput.trim()) return;
    setLoadingVoucher(true);
    setVoucherError('');
    setVoucherSuccess('');
    try {
      const val = await validateVoucherCode(voucherCodeInput);
      if (val) {
        const restrictedPkgId = val.packageId || 'all';
        if (restrictedPkgId !== 'all' && restrictedPkgId !== localPkg.id) {
          const pkgObj = PACKAGES.find(p => p.id === restrictedPkgId);
          setVoucherError(`Kupon ${val.code} hanya berlaku untuk paket: ${pkgObj ? pkgObj.name : restrictedPkgId}`);
          setLocalVoucher(null);
        } else {
          setLocalVoucher({ code: val.code, discount: Number(val.discount), packageId: restrictedPkgId });
          setVoucherSuccess(`Kupon terpasang! Anda hemat ${val.discount}%`);
          setVoucherCodeInput('');
          if (onVoucherChange) {
            onVoucherChange({ code: val.code, discount: Number(val.discount), packageId: restrictedPkgId });
          }
        }
      } else {
        setVoucherError('Kode kupon invalid atau kedaluwarsa');
        setLocalVoucher(null);
      }
    } catch {
      setVoucherError('Gagal memproses kode kupon');
    } finally {
      setLoadingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setLocalVoucher(null);
    setVoucherCodeInput('');
    setVoucherSuccess('');
    setVoucherError('');
    if (onVoucherChange) {
      onVoucherChange(null);
    }
  };

  // Form valid checker
  const runFormValidation = (): boolean => {
    if (!formData.name.trim()) {
      alert("Mohon masukkan nama lengkap Anda.");
      return false;
    }
    if (!formData.whatsapp.trim()) {
      alert("Mohon masukkan nomor WhatsApp aktif.");
      return false;
    }
    if (!formData.email.trim()) {
      alert("Mohon ketikkan alamat email valid Anda.");
      return false;
    }
    if (!formData.eventDate) {
      alert("Mohon tentukan tanggal siaran event melalui widget kalender.");
      return false;
    }
    if (!formData.eventLocation.trim()) {
      alert("Mohon isi lokasi / detail alamat penyelenggaraan acara.");
      return false;
    }
    return true;
  };

  // Compile offline WhatsApp string template
  const generateWhatsAppMessageText = (invId?: string) => {
    const activeInvoiceId = invId || formattedInvoiceId || 'PB-TEMP-001';
    
    const tipeKameraText = cameraUpgradeCost > 0
      ? `${cameraOpt.name} (Upgrade x${localCameraCount})`
      : 'Sony NX-100 (Default paket)';

    const addOnsRawText = activeAddOnsList.length > 0
      ? activeAddOnsList.map(a => `- ${a.name} (x${a.quantity}): Rp ${a.totalPrice.toLocaleString('id-ID')}`).join('\n')
      : '- Tidak ada';

    const voucherStrText = localVoucher
      ? `\n• Subtotal Biaya: Rp ${subtotalCost.toLocaleString('id-ID')}\n• Voucher Diskon (${localVoucher.code} ${localVoucher.discount}%): -Rp ${discountAmount.toLocaleString('id-ID')}`
      : '';

    return `*KONFIRMASI RESERVASI LIVE STREAMING | PRIME BROADCAST*
------------------------------------------------
Faktur ID: ${activeInvoiceId}
Status: Menunggu Konfirmasi Jadwal (Pajak PPN 1% Terhitung)

*DATA KELOLAAN KLIEN:*
• Nama Klien: ${formData.name}
• Perusahaan: ${formData.company || 'Pribadi / Individu'}
• No. WhatsApp: ${formData.whatsapp}
• Alamat Email: ${formData.email}

*DETAIL EVENT BROADCAST:*
• Paket Utama: ${localPkg.name} (${localDuration} Jam siaran)
• Tipe Kamera: ${tipeKameraText}
• Overtime Tambahan: +${localOvertimeHours} Jam (+Rp ${totalOvertimeCost.toLocaleString('id-ID')})
• Tanggal Event: ${formData.eventDate}
• Waktu Mulai: ${formData.eventTime} WIB
• Lokasi Venue: ${formData.eventLocation}

*TAMBAHAN ADD-ON:*
${addOnsRawText}

------------------------------------------------
*RINCIAN ESTIMASI BIAYA:*
• Paket Dasar: Rp ${basePrice.toLocaleString('id-ID')}
• Upgrade Kamera: Rp ${cameraUpgradeCost.toLocaleString('id-ID')}
• Biaya Overtime: Rp ${totalOvertimeCost.toLocaleString('id-ID')}
• Total Add-on: Rp ${totalAddOnsCost.toLocaleString('id-ID')}${voucherStrText}
• Pajak PPN 1%: Rp ${taxAmount1Percent.toLocaleString('id-ID')}
• *Total Tagihan Akhir (Nett): Rp ${totalNettPrice.toLocaleString('id-ID')}*

------------------------------------------------
*Catatan Tambahan:*
"${formData.eventNotes || 'Tidak ada catatan khusus.'}"

------------------------------------------------
_Mohon konfirmasi dan jadwalkan reservasi ini. Terima kasih!_`;
  };

  // Submit and launch WhatsApp redirect directly
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!runFormValidation()) return;

    setIsSubmitting(true);
    const invoiceIdGenerated = `PB-INV-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(1000 + Math.random() * 9000)}`;
    setFormattedInvoiceId(invoiceIdGenerated);

    // Prepare complete form JSON
    const checkoutPayload = {
      invoiceId: invoiceIdGenerated,
      clientName: formData.name,
      clientCompany: formData.company || "Personal / Individu",
      clientWhatsapp: formData.whatsapp,
      clientEmail: formData.email,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      eventLocation: formData.eventLocation,
      eventNotes: formData.eventNotes || "-",
      packageName: localPkg.name,
      packageDuration: localDuration + " Jam",
      additionalOvertime: localOvertimeHours + " Jam",
      mainCameraModel: cameraOpt.name,
      mainCameraUpgradeCount: localCameraCount,
      priceSubtotal: subtotalCost,
      voucherApplied: localVoucher ? `${localVoucher.code} (-${localVoucher.discount}%)` : "Tanpa Voucher",
      savingsDiscount: discountAmount,
      taxFee1Percent: taxAmount1Percent,
      grandTotalPriceNett: totalNettPrice
    };

    // Send to server backend to trigger Gemini parsing and Google Calendar automated sync (asynchronously to protect popup context)
    fetch("/api/booking/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkoutPayload)
    }).catch(err => {
      console.warn("Status otomatisasi kalender Google: Dilewati secara lokal", err);
    });

    // Direct WhatsApp redirect launch
    const formattedText = generateWhatsAppMessageText(invoiceIdGenerated);
    const encodedText = encodeURIComponent(formattedText);
    const waUrl = `https://api.whatsapp.com/send?phone=6285150555195&text=${encodedText}`;

    // Log date locally for bookkeeping reference
    try {
      const stored = localStorage.getItem('pb_booked_dates');
      let arr = [];
      if (stored) arr = JSON.parse(stored);
      
      const newBookObj = {
        id: invoiceIdGenerated,
        date: formData.eventDate,
        title: `Konfirmasi Reservasi • ${localPkg.name}`,
        clientName: formData.name,
        isManual: false,
        packageType: localPkg.name,
        time: formData.eventTime
      };

      if (!arr.some((b: any) => b.date === formData.eventDate)) {
        arr.push(newBookObj);
        localStorage.setItem('pb_booked_dates', JSON.stringify(arr));
      }
    } catch {
      // Ignore
    }

    // Trigger window transition
    setIsSubmitting(false);
    setOrderFinalized(true);

    // Open WhatsApp in new tab (fully synchronous handler, bypassing blocker)
    window.open(waUrl, '_blank', 'noreferrer,noopener');
  };

  // Clipboard copy utilities
  const copyCompleteClipboard = () => {
    const msg = generateWhatsAppMessageText();
    navigator.clipboard.writeText(msg);
    setCopypasteCopied(true);
    setTimeout(() => setCopypasteCopied(false), 2500);
  };

  // Premium PDF download
  const downloadPremiumInvoicePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top primary strip
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 8, 'F');

    // Headers
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('PRIME BROADCAST', 15, 24);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Premium Live Streaming & Broadcasting Solutions', 15, 29);
    
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text('WA: +62 851-5055-5195', 195, 20, { align: 'right' });
    doc.text('Email: primebroadcast.id@gmail.com', 195, 25, { align: 'right' });
    doc.text('Web: https://prime-broadcast.vercel.app/', 195, 30, { align: 'right' });

    // Dividers
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(15, 35, 195, 35);

    // Metadata boxes
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, 40, 85, 32, 'F');
    doc.rect(110, 40, 85, 32, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text('INFORMASI KLIEN:', 20, 46);
    doc.text('DETAIL AGENDA SIARAN:', 115, 46);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Nama: ${formData.name}`, 20, 52);
    doc.text(`Perusahaan: ${formData.company || 'Pribadi / Individu'}`, 20, 57);
    doc.text(`WhatsApp: ${formData.whatsapp}`, 20, 62);
    doc.text(`Email: ${formData.email}`, 20, 67);

    doc.text(`Paket: ${localPkg.name}`, 115, 52);
    doc.text(`Durasi: ${localDuration} Jam Kontrak`, 115, 57);
    doc.text(`Jadwal: ${formData.eventDate} @ ${formData.eventTime} WIB`, 115, 62);
    doc.text(`Lokasi: ${formData.eventLocation.substring(0, 36)}${formData.eventLocation.length > 36 ? '...' : ''}`, 115, 67);

    // Columns title table
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(15, 78, 180, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Deskripsi Konfigurasi & Manpower', 18, 83);
    doc.text('Jumlah Unit', 115, 83, { align: 'center' });
    doc.text('Total Nominal', 190, 83, { align: 'right' });

    let itemY = 92;
    const printRowItem = (desc: string, qty: string, price: string) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(desc, 18, itemY);
      doc.text(qty, 115, itemY, { align: 'center' });
      doc.text(price, 190, itemY, { align: 'right' });
      doc.setDrawColor(241, 245, 249);
      doc.line(15, itemY + 2.5, 195, itemY + 2.5);
      itemY += 7.5;
    };

    // Print rows
    printRowItem(`${localPkg.name} (Broadcasting Set Dasar)`, "1 Paket", `Rp ${basePrice.toLocaleString('id-ID')}`);
    if (cameraUpgradeCost > 0) {
      printRowItem(`Upgrade Utama Kamera: ${cameraOpt.name}`, `${localCameraCount} Unit`, `Rp ${cameraUpgradeCost.toLocaleString('id-ID')}`);
    }
    if (localOvertimeHours > 0) {
      printRowItem(`Biaya Overtime Siaran (+ ${localOvertimeHours} Jam)`, `${localOvertimeHours} Jam`, `Rp ${totalOvertimeCost.toLocaleString('id-ID')}`);
    }
    activeAddOnsList.forEach(addon => {
      printRowItem(`Add-on: ${addon.name}`, `${addon.quantity} ${addon.unit}`, `Rp ${addon.totalPrice.toLocaleString('id-ID')}`);
    });

    // Subtotals Box right side
    const rightBoxX = 110;
    let runningY = itemY + 2.5;

    doc.setFillColor(248, 250, 252);
    doc.rect(rightBoxX, runningY, 85, 30, 'F');
    
    const summaryRowPrinter = (label: string, textPrice: string, isBold: boolean = false, isDiscountRow: boolean = false) => {
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setFontSize(isBold ? 9 : 8);
      doc.setTextColor(isDiscountRow ? 21 : 15, isDiscountRow ? 128 : 23, isDiscountRow ? 61 : 42); // green 700 or slate 900
      doc.text(label, rightBoxX + 4, runningY + 3.5);
      
      if (isBold) {
        doc.setFontSize(9.5);
      } else if (isDiscountRow) {
        doc.setFontSize(7.8);
      } else {
        doc.setFontSize(8.5);
      }
      doc.text(textPrice, 190, runningY + 3.5, { align: 'right' });
      runningY += 5.5;
    };

    summaryRowPrinter('Subtotal Tagihan:', `Rp ${subtotalCost.toLocaleString('id-ID')}`);
    if (localVoucher) {
      summaryRowPrinter(`Voucher (${localVoucher.code}):`, `-Rp ${discountAmount.toLocaleString('id-ID')}`, false, true);
    }
    summaryRowPrinter('Total PPN 1%:', `Rp ${taxAmount1Percent.toLocaleString('id-ID')}`);

    doc.setDrawColor(226, 232, 240);
    doc.line(rightBoxX, runningY + 1, 195, runningY + 1);
    runningY += 5;

    summaryRowPrinter('TOTAL TAGIHAN NETT:', `Rp ${totalNettPrice.toLocaleString('id-ID')}`, true);

    if (localVoucher) {
      runningY += 1.5;
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.rect(rightBoxX, runningY, 85, 8.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(21, 128, 61);
      doc.text(`ANDA HEMAT Rp ${discountAmount.toLocaleString('id-ID')}!`, rightBoxX + 4, runningY + 5.5);
    }

    // Embed Catatan & Ketentuan Footnotes
    let termsStartY = Math.max(runningY + 10, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('CATATAN & KETENTUAN:', 15, termsStartY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5); // compact yet crisp size for legal footnotes
    doc.setTextColor(100, 116, 139); // slate-500

    const terms = [
      "1. Harga bersifat nett di luar biaya akomodasi dan transportasi alat dan crew",
      "2. DP sebesar 40% wajib dibayarkan maksimal 10 (sepuluh) hari kalender setelah surat ini ditandatangani di atas materai",
      "3. Pelunasan sebesar 100% dilakukan paling lambat H-1 sebelum acara",
      "4. Untuk pembayaran DP maupun pelunasan dapat dilakukan melalui transfer ke rekening BluBca 0025 9442 7907 A/n Abdul Aziz",
      "5. Perubahan jadwal dapat dilakukan 1 (satu) kali dengan pemberitahuan minimal 7 hari sebelum acara dan mengikuti ketersediaan jadwal vendor",
      "6. Pembatalan sepihak oleh klien setelah pembayaran DP dilakukan menyebabkan DP tidak dapat dikembalikan",
      "7. Biaya overtime dihitung per 1 (satu) jam penuh setelah melewati toleransi 30 menit dari durasi kerja yang telah disepakati",
      "8. Klien bertanggung jawab atas kesiapan venue, akses listrik, akses internet, ruang loading dan kebutuhan teknis pendukung lainnya",
      "9. Segala kondisi force majeure di luar kendali vendor menjadi pengecualian tanggung jawab operasional",
      "10. Jam kerja mengikuti call time yang telah disepakati bersama. Keterlambatan waktu mulai acara yang disebabkan oleh pihak klien tetap dihitung sebagai bagian dari durasi kerja",
      "11. Vendor berhak menggunakan dokumentasi hasil produksi sebagai materi portofolio dan promosi, kecuali terdapat permintaan tertulis dari klien untuk tidak dipublikasikan",
      "12. Keterlambatan pembayaran dapat menyebabkan penundaan layanan dan/atau penyerahan hasil produksi hingga kewajiban pembayaran diselesaikan",
      "13. Dengan mentandatangani surat ini di atas materai, klien dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku."
    ];

    let currentTermY = termsStartY + 3.5;
    terms.forEach(term => {
      const wrappedLines = doc.splitTextToSize(term, 180);
      wrappedLines.forEach((line: string) => {
        if (currentTermY < 270) {
          doc.text(line, 15, currentTermY);
          currentTermY += 2.8;
        }
      });
    });

    doc.setDrawColor(241, 245, 249);
    doc.line(15, 275, 195, 275);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Faktur ini dibuat secara digital untuk memperkirakan biaya reservasi. Total PPN 1% sudah terhitung.', 105, 281, { align: 'center' });
    doc.text('Dukungan Teknis & Legalitas: Prime Broadcast Indonesia • wa.me/6285150555195', 105, 285, { align: 'center' });

    doc.save(`Invoice-${formattedInvoiceId || 'PROP'}-${formData.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="py-16 bg-zinc-950 text-white text-left relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* UPPER TAB META */}
        <div className="mb-10 border-b border-zinc-900 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">
                Sistem Pendaftaran Digital Prime Broadcast
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-white">
                Formulir Reservasi & Detil Estimasi
              </h2>
            </div>
            <button
              onClick={onReset}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-all flex items-center gap-2 cursor-pointer text-zinc-300"
            >
              <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Ganti Konfigurasi Paket</span>
            </button>
          </div>
        </div>

        {orderFinalized ? (
          <div className="bg-zinc-900/10 border border-zinc-900 p-8 rounded-2xl text-center flex flex-col items-center justify-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 mb-6">
              <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
            </div>

            <h3 className="text-xl font-serif mb-2 text-white">
              Pemesanan Berhasil Terkirim
            </h3>
            
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md mb-6">
              Terima kasih. Rincian kebutuhan siaran Anda telah siap diteruskan. Untuk mendaftarkan jadwal kru secara langsung, silakan klik tombol hubungi WhatsApp di bawah. Anda juga dapat mengunduh berkas invoice resmi berformat PDF.
            </p>

            <div className="w-full bg-zinc-950 p-6 rounded-xl border border-zinc-900 text-left mb-6 font-mono text-xs">
              <div className="flex justify-between border-b border-zinc-900 pb-3 mb-3 text-zinc-500">
                <span>NOMOR FAKTUR INVOICE:</span>
                <span className="font-bold text-zinc-200">{formattedInvoiceId}</span>
              </div>
              <div className="space-y-2 text-zinc-400">
                <div className="flex justify-between">
                  <span>Nama Klien:</span>
                  <span className="text-zinc-200">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal Siaran:</span>
                  <span className="text-zinc-200">{formData.eventDate} ({formData.eventTime} WIB)</span>
                </div>
                <div className="flex justify-between">
                  <span>Paket Utama:</span>
                  <span className="text-zinc-200">{localPkg.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak PPN 1%:</span>
                  <span className="text-zinc-200">Rp {taxAmount1Percent.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-900 pt-2.5 mt-2.5 font-bold text-zinc-100 text-sm">
                  <span>Total Tagihan (Nett):</span>
                  <span>Rp {totalNettPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <a
                href={`https://api.whatsapp.com/send?phone=6285150555195&text=${encodeURIComponent(generateWhatsAppMessageText(formattedInvoiceId))}`}
                target="_blank"
                rel="noreferrer noopener"
                className="w-full flex items-center justify-center gap-2.5 bg-[#ffffff] hover:bg-zinc-200 text-zinc-950 font-medium p-3.5 rounded-lg transition-all text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Format Rincian ke WhatsApp Admin</span>
              </a>

              <button
                onClick={downloadPremiumInvoicePDF}
                className="w-full flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-100 font-medium p-3.5 rounded-lg transition-all cursor-pointer text-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-zinc-400" />
                <span>Unduh Berkas Invoice PDF Resmi</span>
              </button>

              <button
                onClick={copyCompleteClipboard}
                className="w-full flex items-center justify-center gap-2 bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 text-zinc-405 text-zinc-400 p-2.5 rounded-lg transition-all cursor-pointer text-[11px]"
              >
                {copypasteCopied ? <Check className="w-3.5 h-3.5 text-zinc-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                <span>{copypasteCopied ? 'Berhasil Menyalin Rincian!' : 'Salin Laporan Reservasi untuk Cadangan Manual'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setOrderFinalized(false);
                onReset();
              }}
              className="mt-6 text-xs text-zinc-500 hover:text-zinc-305 hover:text-white underline transition-colors"
            >
              Buat Reservasi Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* BOOKING INPUTS FORM CONTAINER */}
            <form onSubmit={handleBookingSubmit} className="lg:col-span-7 bg-zinc-900/10 border border-zinc-900 p-6 sm:p-8 rounded-2xl flex flex-col gap-5">
              <h3 className="text-base font-sans font-medium text-white mb-2 flex items-center gap-3">
                <PackageCheck className="w-5 h-5 text-zinc-400" />
                <span>Informasi Reservasi & Kontak Klien</span>
              </h3>

              {/* Pre-configured Package Summary (Read-only as requested) */}
              <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase block mb-1">
                    Paket Konfigurasi Terpilih
                  </span>
                  <span className="text-sm font-semibold text-zinc-200 block">
                    {localPkg.name} ({localDuration} Jam Kontrak)
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Dihitung otomatis berdasarkan setting konfigurator penawaran.
                  </span>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-zinc-505 block text-zinc-500">
                    Tarif Dasar Paket
                  </span>
                  <span className="text-sm font-mono font-bold text-zinc-300">
                    Rp {basePrice.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Nama Lengkap Pemesan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Hendrik Wijaya"
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Nama Perusahaan / Lembaga (Opsional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="PT Penyiaran Media"
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    No. WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="whatsapp"
                      required
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="085150555195"
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors text-zinc-200 placeholder:text-zinc-700"
                    />
                    <PhoneCall className="w-3.5 h-3.5 text-zinc-600 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Alamat Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="klien@gmail.com"
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors text-zinc-200 placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {/* Calendar flatpickr field and time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Tanggal Siaran (Pilih Kalender) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="flatpickrCalendarTrigger"
                      name="eventDate"
                      required
                      readOnly
                      placeholder="Klik untuk pilih tanggal..."
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors cursor-pointer text-zinc-200 placeholder-zinc-700"
                    />
                    <Calendar className="w-3.5 h-3.5 text-zinc-600 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Jam Mulai Siaran (WIB)
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-950 border border-zinc-855 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors text-zinc-200"
                    />
                    <Clock className="w-3.5 h-3.5 text-zinc-600 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Alamat Lengkap Venue / Lokasi Event <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="eventLocation"
                    required
                    value={formData.eventLocation}
                    onChange={handleInputChange}
                    placeholder="Gedung, Aula, Jalan, No, Kota"
                    className="w-full bg-zinc-950 border border-zinc-855 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors text-zinc-200 placeholder:text-zinc-700"
                  />
                  <MapPin className="w-3.5 h-3.5 text-zinc-600 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Dynamic Voucher code validator right inside the checkout */}
              <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex flex-col gap-2.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Kupon Voucher Diskon Pemotongan Harga:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCodeInput}
                    onChange={(e) => setVoucherCodeInput(e.target.value)}
                    placeholder="Contoh: DISKON10, PROMO20"
                    className="flex-1 bg-zinc-950 border border-zinc-855 rounded-lg px-3 py-2 text-xs focus:border-zinc-550 focus:outline-none uppercase text-zinc-200 font-mono placeholder:text-zinc-700"
                  />
                  {localVoucher ? (
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-semibold hover:bg-zinc-850 active:scale-95 transition-all"
                    >
                      Hapus
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerVoucherApply}
                      disabled={loadingVoucher || !voucherCodeInput.trim()}
                      className="px-5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold disabled:opacity-30 active:scale-95 transition-all"
                    >
                      {loadingVoucher ? '...' : 'Pasang'}
                    </button>
                  )}
                </div>
                {voucherError && <p className="text-[10px] text-zinc-500 font-mono">{voucherError}</p>}
                {voucherSuccess && <p className="text-[10px] text-zinc-405 font-mono">{voucherSuccess}</p>}
                {localVoucher && (
                  <p className="text-[10px] text-zinc-405 font-mono">
                    [AKTIF] Kupon {localVoucher.code} berhasil memberikan diskon {localVoucher.discount}%
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  name="eventNotes"
                  rows={3}
                  value={formData.eventNotes}
                  onChange={handleInputChange}
                  placeholder="Grup layout visual, streaming multi-platform YouTube/Zoom dsb."
                  className="w-full bg-zinc-950 border border-zinc-855 rounded-lg px-4 py-2.5 text-sm focus:border-zinc-550 focus:outline-none transition-colors resize-none text-zinc-200 placeholder:text-zinc-700"
                />
              </div>

              <div className="pt-4 border-t border-zinc-900">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-zinc-200 text-zinc-950 font-medium py-3.5 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50 text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Mengkonfirmasi order..." : "Kirim Form & Hubungi WhatsApp Operasional"}</span>
                </button>
                <p className="text-[10px] text-center text-zinc-500 mt-3 leading-relaxed">
                  Secara instan mendaftarkan rincian agenda Anda dan mengalihkan ke WhatsApp Admin Prime Broadcast.
                </p>
              </div>
            </form>

            {/* LIVE BILLING BREAKDOWN CARD */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
                  <Printer className="w-4 h-4 text-zinc-500" />
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    Kalkulator Nota Transaksi
                  </span>
                </div>

                <div className="space-y-4 text-zinc-400">
                  
                  {/* Selected Package Details */}
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-semibold text-zinc-100 block">
                        {localPkg.name}
                      </span>
                      <span className="text-xs text-zinc-500 mt-1 block">
                        Durasi Utama: {localDuration} Jam Kontrak
                      </span>
                    </div>
                    <span className="font-mono text-zinc-200">
                      Rp {basePrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Overtime */}
                  {localOvertimeHours > 0 && (
                    <div className="flex justify-between items-start text-sm border-t border-zinc-900 pt-3.5">
                      <div>
                        <span className="font-medium text-zinc-200 block">
                          Biaya Overtime (+{localOvertimeHours} Jam)
                        </span>
                        <span className="text-xs text-zinc-500 mt-1 block">
                          Tarif Lembur: 15% dari tarif dasar
                        </span>
                      </div>
                      <span className="font-mono text-zinc-200">
                        Rp {totalOvertimeCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}

                  {/* Camera Upgrade */}
                  {cameraUpgradeCost > 0 && (
                    <div className="flex justify-between items-start text-sm border-t border-zinc-900 pt-3.5">
                      <div>
                        <span className="font-medium text-zinc-200 block">
                          Upgrade Kamera Utama (x{localCameraCount})
                        </span>
                        <span className="text-xs text-zinc-505 mt-1 block text-zinc-500">
                          Premium: {cameraOpt.name}
                        </span>
                      </div>
                      <span className="font-mono text-zinc-200">
                        Rp {cameraUpgradeCost.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}

                  {/* AddOn displays */}
                  {activeAddOnsList.length > 0 && (
                    <div className="border-t border-zinc-900 pt-3.5">
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wide block uppercase mb-2">
                        Pilihan Add-On Aktif:
                      </span>
                      <div className="space-y-2">
                        {activeAddOnsList.map((addon) => (
                          <div key={addon.id} className="flex justify-between text-xs pl-3 border-l border-zinc-800">
                            <span className="text-zinc-400">
                              {addon.name} <b className="text-zinc-500 font-normal font-mono">(x{addon.quantity})</b>
                            </span>
                            <span className="font-mono text-zinc-350">
                              Rp {addon.totalPrice.toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Voucher display row if applied */}
                  {localVoucher && (
                    <div className="flex justify-between items-start text-sm border-t border-zinc-900 pt-3.5 text-zinc-350">
                      <div>
                        <span className="font-medium block">
                          Potongan Voucher ({localVoucher.code})
                        </span>
                        <span className="text-xs text-zinc-500 mt-1 block">
                          Diskon {localVoucher.discount}%
                        </span>
                      </div>
                      <span className="font-mono text-zinc-200">
                        -Rp {discountAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}

                  {/* PPN 1% tax row */}
                  <div className="flex justify-between items-start text-sm border-t border-zinc-900 pt-3.5 text-zinc-400">
                    <div>
                      <span className="font-medium block text-zinc-300">
                        Pajak PPN 1%
                      </span>
                      <span className="text-xs text-zinc-500 mt-1 block">
                        PPN 1% setelah voucher
                      </span>
                    </div>
                    <span className="font-mono text-zinc-300">
                      Rp {taxAmount1Percent.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Direct Terms summary reminder */}
                  <div className="border-t border-zinc-900 pt-4 mt-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-zinc-500">
                    <span className="block text-[10px] font-mono tracking-wider uppercase mb-2 flex items-center gap-1 text-zinc-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Aturan Operasional</span>
                    </span>
                    <ul className="text-[10px] leading-relaxed text-zinc-550 list-decimal pl-4 space-y-1">
                      <li>Perubahan jadwal (reschedule) diajukan maksimal H-7 acara.</li>
                      <li>Anda akan dialihkan ke WhatsApp untuk konfirmasi agenda formal.</li>
                      <li>Unduh invoice PDF gratis di atas untuk keperluan penawaran panitia.</li>
                    </ul>
                  </div>

                  {/* Total calculation values */}
                  <div className="border-t border-zinc-900 pt-4 mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-wider">
                        ESTIMASI GRAND TOTAL
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-1">Sudah Termasuk PPN 1%</span>
                    </div>
                    <div className="text-right">
                      {localVoucher && (
                        <div className="text-xs font-mono line-through text-zinc-650 mb-0.5">
                          Rp {(subtotalCost + taxAmount1Percent).toLocaleString('id-ID')}
                        </div>
                      )}
                      <div className="text-xl font-mono font-semibold text-white">
                        Rp {totalNettPrice.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical guarantee card */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-xs text-zinc-500 leading-relaxed">
                <span className="font-medium text-zinc-400 block mb-1">Keandalan Teknis Siaran</span>
                <span>Seluruh siaran ditopang pemancar live ganda, audio direct backup channel, serta internet multi-network cellular bonding latency rendah.</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
