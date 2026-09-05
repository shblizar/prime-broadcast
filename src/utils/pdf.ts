import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';
import { formatIDR } from './currency';
import kopImage from '../assets/images/kop.png';
import ttdImage from '../assets/images/ttd.png';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export const generateInvoicePDF = async (order: Order) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Colors
  const primaryColor = [164, 13, 53];
  const secondaryColor: [number, number, number] = [8, 26, 46];
  const mutedTextColor: [number, number, number] = [80, 80, 80];

  // ==========================================
  // 1. KOP SURAT HEADER (Artwork 2480x888 px)
  // ==========================================
  // A4 Width: 210mm. Artwork ratio 2480:888 = 210 * (888 / 2480) = ~75.2mm
  const kopWidth = 210;
  const kopHeight = Number((210 * (888 / 2480)).toFixed(2));

  try {
    const kop = await loadImage(kopImage);
    doc.addImage(kop, 'PNG', 0, 0, kopWidth, kopHeight);
  } catch (err) {
    console.error('Gagal memuat kop surat:', err);
  }

  // ==========================================
  // 2. INVOICE & CLIENT DETAILS (BELOW KOP)
  // ==========================================
  const infoStartY = kopHeight + 8; // Memberikan jarak aman di bawah kop surat (y ≈ 83mm)

  // --- KOLOM KIRI: INVOICE TO (CLIENT INFO) ---
  const leftX = 15;
  let clientY = infoStartY;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INVOICE TO:', leftX, clientY);

  clientY += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(order.customer_name || 'Klien', leftX, clientY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);

  if (order.organization_name) {
    clientY += 4.5;
    doc.text(order.organization_name, leftX, clientY);
  }

  if (order.whatsapp) {
    clientY += 4.5;
    doc.text(order.whatsapp, leftX, clientY);
  }

  if (order.email) {
    clientY += 4.5;
    doc.text(order.email, leftX, clientY);
  }

  if (order.venue_address) {
    clientY += 4.5;
    let addressText = order.venue_address;
    if (addressText.length > 50) {
      addressText = addressText.substring(0, 47) + '...';
    }
    doc.text(addressText, leftX, clientY);
  }

  // --- KOLOM KANAN: INVOICE DETAILS & TOTAL DUE ---
  const rightX = 130;
  let invoiceY = infoStartY;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('INVOICE NUMBER', rightX, invoiceY);

  invoiceY += 4.5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`# ${order.invoice_number}`, rightX, invoiceY);

  invoiceY += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('DATE INFORMATION', rightX, invoiceY);

  invoiceY += 4.5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const dateFormatted = order.event_date || new Date(order.created_at).toLocaleDateString('id-ID');
  doc.text(dateFormatted, rightX, invoiceY);

  invoiceY += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('TOTAL DUE', rightX, invoiceY);

  invoiceY += 5;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatIDR(order.estimated_total), rightX, invoiceY);

  // ==========================================
  // 3. TABLE ITEMS (PACKAGE WAJIB MASUK NO 01)
  // ==========================================
  const rawItems = (order.items || []).filter((item) => {
    if (item.item_type === 'package') return false;
    const pName = order.package_name || order.package_name_snapshot;
    if (pName && (item.item_name === pName || item.name === pName)) return false;
    return true;
  });

  // Urutan: 01. Package -> 02. Upgrade -> 03. Overtime -> 04. Add-on
  const typeRank = (type?: string): number => {
    if (type === 'upgrade') return 1;
    if (type === 'overtime') return 2;
    if (type === 'addon') return 3;
    return 4;
  };

  const sortedItems = [...rawItems].sort((a, b) => {
    return typeRank(a.item_type) - typeRank(b.item_type);
  });

  const tableData: any[] = [];
  let itemCounter = 1;

  // 1. Package Utama WAJIB masuk pertama kali (Item 01)
  const packageName = order.package_name || order.package_name_snapshot;
  const packagePrice =
    order.package_price ??
    order.package_price_snapshot ??
    (order.items && order.items.length > 0 ? 0 : order.subtotal);

  if (packageName || sortedItems.length === 0) {
    tableData.push([
      itemCounter.toString().padStart(2, '0'),
      packageName || 'Paket Utama',
      formatIDR(packagePrice),
      '1',
      formatIDR(packagePrice),
    ]);
    itemCounter++;
  }

  // 2. Append item tambahan dari order.items (Upgrade, Overtime, Add-on, dsb)
  sortedItems.forEach((item) => {
    let name = item.item_name || item.name || 'Item';

    if (item.item_type === 'overtime' && order.overtime_hours && !name.includes('Jam')) {
      name += ` (${order.overtime_hours} Jam)`;
    }

    tableData.push([
      itemCounter.toString().padStart(2, '0'),
      name,
      formatIDR(item.unit_price),
      item.quantity.toString(),
      formatIDR(item.line_total),
    ]);
    itemCounter++;
  });

  // Posisi mulai tabel: di bawah info client / invoice
  const tableStartY = Math.max(clientY, invoiceY) + 7;

  autoTable(doc, {
    startY: tableStartY,
    head: [
      [
        'NO.',
        'Item Description',
        'Price',
        'Qty.',
        'Total',
      ],
    ],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: secondaryColor,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      textColor: [50, 50, 50],
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: {
        cellWidth: 15,
        halign: 'center',
      },
      1: {
        cellWidth: 'auto',
      },
      2: {
        cellWidth: 35,
      },
      3: {
        cellWidth: 15,
        halign: 'center',
      },
      4: {
        cellWidth: 35,
        halign: 'right',
      },
    },
    margin: {
      left: 15,
      right: 15,
    },
    didDrawCell: () => {
      // Custom borders jika diperlukan
    },
  });

  // ==========================================
  // 4. SUMMARY (SUBTOTAL, DISCOUNT, TOTAL)
  // ==========================================
  let finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  const summaryX = 130;
  const labelX = summaryX;
  const colonX = summaryX + 25;
  const valueX = 195;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  doc.text('Sub total', labelX, finalY);
  doc.text(':', colonX, finalY);

  doc.setFont('helvetica', 'normal');
  doc.text(formatIDR(order.subtotal), valueX, finalY, { align: 'right' });

  let currentY = finalY + 7;

  // DISCOUNT
  if (order.discount_amount > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Diskon Voucher', labelX, currentY);
    doc.text(':', colonX, currentY);

    doc.setFont('helvetica', 'normal');
    doc.text(`-${formatIDR(order.discount_amount)}`, valueX, currentY, { align: 'right' });

    currentY += 7;
  }

  // TOTAL BAR
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(labelX - 2, currentY - 4.5, 195 - labelX + 4, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Total', labelX, currentY + 1.5);
  doc.text(':', colonX, currentY + 1.5);
  doc.text(formatIDR(order.estimated_total), valueX, currentY + 1.5, { align: 'right' });

  // ==========================================
  // 5. TANDA TANGAN
  // ==========================================
  const signatureTitleY = 247;
  const signatureBoxY = 252;
  const signatureBoxWidth = 58;
  const signatureBoxHeight = 30;

  const leftSignatureX = 25;
  const rightSignatureX = 127;

  // --- TTD KIRI - NAMA KLIEN ---
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  doc.text(
    'Nama Klien',
    leftSignatureX + signatureBoxWidth / 2,
    signatureTitleY,
    { align: 'center' },
  );

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.25);
  doc.rect(leftSignatureX, signatureBoxY, signatureBoxWidth, signatureBoxHeight);

  // --- TTD KANAN - ABDUL AZIZ ---
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(
    'Abdul Aziz',
    rightSignatureX + signatureBoxWidth / 2,
    signatureTitleY,
    { align: 'center' },
  );

  doc.setDrawColor(180, 180, 180);
  doc.rect(rightSignatureX, signatureBoxY, signatureBoxWidth, signatureBoxHeight);

  // --- INSERT PNG TTD ABDUL AZIZ ---
  try {
    const ttd = await loadImage(ttdImage);
    doc.addImage(ttd, 'PNG', rightSignatureX + 7, signatureBoxY + 7, 44, 16);
  } catch (err) {
    console.error('Gagal memuat tanda tangan:', err);
  }

  // ==========================================
  // 6. PAGE 2 - TERMS & CONDITIONS
  // ==========================================
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  let termsY = 20;

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', 15, termsY);

  termsY += 8;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  const termsText = `1. Pemesanan & Sistem Pembayaran
Pemesanan tanggal siaran dianggap resmi setelah klien mengisi formulir reservasi dan membayarkan Down Payment (DP) minimal sebesar 50% dari total nilai kontrak invoice. Pelunasan sisa pembayaran wajib diselesaikan paling lambat pada H-1 Minggu sebelum acara dimulai atau sesuai kesepakatan tertulis. Seluruh pembayaran dilakukan melalui transfer bank resmi atas nama rekening perusahaan atau perwakilan resmi Prime Broadcast yang tertera pada invoice resmi.

2. Durasi Siaran, Setup & Kebijakan Overtime
Durasi waktu paket dihitung mulai dari jam siaran (on-air) sesuai yang tertera pada formulir pemesanan. Tim Prime Broadcast akan tiba di lokasi minimal 4-5 jam sebelum acara untuk proses loading, instalasi kabel, sinkronisasi audio-video, dan gladi bersih (rehearsal). Waktu setup ini tidak memotong durasi siaran paket.
Kebijakan Overtime Terencana: Jika penambahan durasi atau perpanjangan waktu siaran sudah direncanakan dan dikomunikasikan sejak awal (sebelum hari-H), maka dikenakan biaya overtime terencana sebesar 25% per jam dari nilai paket dasar yang dipilih.
Kebijakan Overtime Tidak Terencana: Jika acara mengalami keterlambatan atau molor secara mendadak di luar jadwal kontrak yang disepakati, berlaku ketentuan overtime tidak terencana. Toleransi kelebihan waktu maksimal 15 menit. Kelebihan di atas 15 menit akan dibulatkan menjadi perhitungan lembur.
A. Overtime Tidak Terencana - Honor Kru & Driver: Lebih dari 15 menit : tambahan 50% dari Honor Kru/Hari. Lebih dari 3 jam: tambahan 100%-120% dari Honor Kru/Hari.
B. Overtime Tidak Terencana - Perangkat & Alat Sewa: Lebih dari 15 menit : charge overtime alat sebesar 50%. Lebih dari 3 jam: charge overtime alat sebesar 100%.

3. Fasilitas Venue, Jaringan & Akomodasi Luar Kota
Klien/pihak penyelenggara bertanggung jawab menyediakan akses listrik yang stabil dan izin operasional venue. Untuk streaming dengan opsi koneksi dedicated venue, pihak venue wajib menyediakan kabel LAN atau akses internet stabil dengan upload minimal 20 Mbps. Jika lokasi event berada di luar area Jabodetabek atau mengharuskan menginap, kru pengawal alat dan driver berhak mendapatkan akomodasi dari pihak Penyewa.

4. Tanggung Jawab Keamanan & Risiko Alat
Penyewa bertanggung jawab sepenuhnya terhadap keamanan seluruh perangkat di lokasi acara. Setiap kerusakan alat di lokasi yang disebabkan oleh kelalaian pihak luar/bukan dari kru Prime Broadcast menjadi tanggung jawab penyewa sepenuhnya.

5. Pembatalan & Reschedule
Pembatalan sepihak oleh klien: DP yang telah dibayarkan tidak dapat dikembalikan (non-refundable) karena tanggal dan kru telah dikunci secara eksklusif. Pembatalan pada hari-H tetap dikenakan charge penuh sebesar 120%. Reschedule diperbolehkan maksimal 1 kali dengan pemberitahuan tertulis paling lambat H-7 sebelum acara, dengan syarat ketersediaan kru pada tanggal baru. Reschedule kurang dari H-3 dikenakan biaya administrasi sebesar 40% dari total nilai paket.

6. Hak Cipta, Konten & Dokumentasi Rekaman
Seluruh materi audio, musik latar, slide presentasi, dan visual yang disiarkan adalah tanggung jawab penuh pihak penyelenggara terkait hak cipta pada platform penyiaran. File master rekaman Full HD (Program Output) akan diserahkan kepada klien via tautan cloud storage maksimal 1x24 jam setelah acara selesai. Prime Broadcast berhak menggunakan cuplikan/foto dokumentasi kegiatan penyiaran untuk portofolio dan promosi resmi, kecuali terdapat perjanjian kerahasiaan (NDA) tertulis sebelumnya.`;

  const splitTerms = doc.splitTextToSize(termsText, 180);
  doc.text(splitTerms, 15, termsY);

  // ==========================================
  // 7. SAVE
  // ==========================================
  doc.save(`Invoice_${order.invoice_number}.pdf`);
};