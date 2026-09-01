import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';
import { formatIDR } from './currency';
import logoImage from '../assets/images/prime_broadcast_logo.png';
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
  const secondaryColor = [8, 26, 46];
  const white = [255, 255, 255];

  // ==========================================
  // HEADER BACKGROUND
  // ==========================================

  doc.setFillColor(
    primaryColor[0],
    primaryColor[1],
    primaryColor[2],
  );

  doc.rect(
    0,
    0,
    210,
    75,
    'F',
  );

  doc.setFillColor(
    140,
    10,
    45,
  );

  doc.triangle(
    0,
    0,
    100,
    0,
    0,
    75,
    'F',
  );

  doc.setFillColor(
    180,
    20,
    60,
  );

  doc.triangle(
    210,
    0,
    210,
    75,
    120,
    75,
    'F',
  );

  doc.setTextColor(
    white[0],
    white[1],
    white[2],
  );

  // ==========================================
  // TOP LEFT - BRANDING & TITLE
  // ==========================================

  try {
    const logo = await loadImage(
      logoImage,
    );

    doc.addImage(
      logo,
      'PNG',
      15,
      18,
      22,
      22,
    );

    doc.setFontSize(20);
    doc.setFont(
      'helvetica',
      'bold',
    );

    doc.text(
      'PRIME BROADCAST',
      42,
      25,
    );

    doc.setFontSize(36);
    doc.setFont(
      'helvetica',
      'bold',
    );

    doc.text(
      'INVOICE',
      42,
      45,
    );

    doc.setFontSize(12);
    doc.setFont(
      'helvetica',
      'normal',
    );

    doc.text(
      `# ${order.invoice_number}`,
      42,
      55,
    );

    doc.setFontSize(9);

    doc.text(
      'Prime Broadcast, Indonesia',
      42,
      65,
    );
  } catch (err) {
    console.error(
      'Gagal memuat logo',
      err,
    );

    doc.setFontSize(20);
    doc.setFont(
      'helvetica',
      'bold',
    );

    doc.text(
      'PRIME BROADCAST',
      15,
      25,
    );

    doc.setFontSize(36);

    doc.text(
      'INVOICE',
      15,
      45,
    );

    doc.setFontSize(12);
    doc.setFont(
      'helvetica',
      'normal',
    );

    doc.text(
      `# ${order.invoice_number}`,
      15,
      55,
    );

    doc.setFontSize(9);

    doc.text(
      'Prime Broadcast, Indonesia',
      15,
      65,
    );
  }

  // ==========================================
  // TOP RIGHT - DETAILS & CLIENT INFO
  // ==========================================

  const rightX = 130;

  doc.setFontSize(9);
  doc.setFont(
    'helvetica',
    'normal',
  );

  doc.text(
    'Date Information',
    rightX,
    20,
  );

  doc.setFont(
    'helvetica',
    'bold',
  );

  doc.text(
    order.event_date ||
      new Date(
        order.created_at,
      ).toLocaleDateString(
        'id-ID',
      ),
    rightX,
    24,
  );

  doc.setFont(
    'helvetica',
    'normal',
  );

  doc.text(
    'Invoice Number',
    rightX,
    32,
  );

  doc.setFont(
    'helvetica',
    'bold',
  );

  doc.text(
    order.invoice_number,
    rightX,
    36,
  );

  doc.setFont(
    'helvetica',
    'normal',
  );

  doc.text(
    'INVOICE TO:',
    rightX,
    44,
  );

  doc.setFont(
    'helvetica',
    'bold',
  );

  doc.text(
    order.customer_name,
    rightX,
    48,
  );

  let clientY = 52;

  doc.setFont(
    'helvetica',
    'normal',
  );

  if (order.organization_name) {
    doc.text(
      order.organization_name,
      rightX,
      clientY,
    );

    clientY += 4;
  }

  doc.text(
    order.whatsapp,
    rightX,
    clientY,
  );

  clientY += 4;

  doc.text(
    order.email,
    rightX,
    clientY,
  );

  clientY += 4;

  let addressText =
    order.venue_address ||
    '-';

  if (
    addressText.length > 35
  ) {
    addressText =
      addressText.substring(
        0,
        32,
      ) + '...';
  }

  doc.text(
    addressText,
    rightX,
    clientY,
  );

  doc.setFont(
    'helvetica',
    'normal',
  );

  doc.text(
    'Total Due:',
    rightX,
    68,
  );

  doc.setFont(
    'helvetica',
    'bold',
  );

  doc.text(
    formatIDR(
      order.estimated_total,
    ),
    rightX + 16,
    68,
  );

  // ==========================================
  // TABLE
  // ==========================================

  const tableData: any[] = [];

  if (
    order.items &&
    order.items.length > 0
  ) {
    order.items.forEach(
      (item, index) => {
        let name =
          item.item_name ||
          item.name ||
          'Item';

        if (
          item.item_type ===
            'overtime' &&
          order.overtime_hours
        ) {
          name += ` (${order.overtime_hours} Jam)`;
        }

        tableData.push([
          (index + 1)
            .toString()
            .padStart(2, '0'),

          name,

          formatIDR(
            item.unit_price,
          ),

          item.quantity.toString(),

          formatIDR(
            item.line_total,
          ),
        ]);
      },
    );
  } else {
    tableData.push([
      '01',

      order.package_name ||
        'Paket Utama',

      formatIDR(
        order.subtotal,
      ),

      '1',

      formatIDR(
        order.subtotal,
      ),
    ]);
  }

  autoTable(doc, {
    startY: 85,

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
      fillColor: [
        240,
        240,
        240,
      ],

      textColor:
        secondaryColor,

      fontStyle: 'bold',

      halign: 'left',
    },

    bodyStyles: {
      textColor: [
        50,
        50,
        50,
      ],

      fontSize: 9,
    },

    alternateRowStyles: {
      fillColor: [
        252,
        252,
        252,
      ],
    },

    columnStyles: {
      0: {
        cellWidth: 15,
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
  // SUMMARY
  // ==========================================

  let finalY =
    (doc as any)
      .lastAutoTable
      .finalY + 15;

  doc.setTextColor(
    secondaryColor[0],
    secondaryColor[1],
    secondaryColor[2],
  );

  doc.setFontSize(11);

  doc.setFont(
    'helvetica',
    'bold',
  );

  const summaryX = 130;
  const labelX = summaryX;
  const colonX =
    summaryX + 25;
  const valueX = 195;

  doc.setFontSize(9);

  doc.setFont(
    'helvetica',
    'bold',
  );

  doc.text(
    'Sub total',
    labelX,
    finalY,
  );

  doc.text(
    ':',
    colonX,
    finalY,
  );

  doc.setFont(
    'helvetica',
    'normal',
  );

  doc.text(
    formatIDR(
      order.subtotal,
    ),
    valueX,
    finalY,
    {
      align: 'right',
    },
  );

  let currentY =
    finalY + 8;

  // ==========================================
  // DISCOUNT
  // ==========================================

  if (
    order.discount_amount > 0
  ) {
    doc.setFont(
      'helvetica',
      'bold',
    );

    doc.text(
      'Diskon Voucher',
      labelX,
      currentY,
    );

    doc.text(
      ':',
      colonX,
      currentY,
    );

    doc.setFont(
      'helvetica',
      'normal',
    );

    doc.text(
      `-${formatIDR(
        order.discount_amount,
      )}`,
      valueX,
      currentY,
      {
        align: 'right',
      },
    );

    currentY += 8;
  }

  // ==========================================
  // TOTAL BAR
  // ==========================================

  doc.setFillColor(
    primaryColor[0],
    primaryColor[1],
    primaryColor[2],
  );

  doc.rect(
    labelX - 2,
    currentY - 5,
    195 - labelX + 4,
    9,
    'F',
  );

  doc.setTextColor(
    255,
    255,
    255,
  );

  doc.setFont(
    'helvetica',
    'bold',
  );

  doc.text(
    'Total',
    labelX,
    currentY + 1.5,
  );

  doc.text(
    ':',
    colonX,
    currentY + 1.5,
  );

  doc.text(
    formatIDR(
      order.estimated_total,
    ),
    valueX,
    currentY + 1.5,
    {
      align: 'right',
    },
  );

  // ==========================================
  // TANDA TANGAN
  // ==========================================

  const signatureTitleY = 247;
  const signatureBoxY = 252;
  const signatureBoxWidth = 58;
  const signatureBoxHeight = 30;

  const leftSignatureX = 25;
  const rightSignatureX = 127;

  // ==========================================
  // TTD KIRI - NAMA KLIEN
  // ==========================================

  doc.setTextColor(
    secondaryColor[0],
    secondaryColor[1],
    secondaryColor[2],
  );

  doc.setFont(
    'helvetica',
    'normal',
  );

  doc.setFontSize(9);

  doc.text(
    'Nama Klien',
    leftSignatureX +
      signatureBoxWidth / 2,
    signatureTitleY,
    {
      align: 'center',
    },
  );

  doc.setDrawColor(
    180,
    180,
    180,
  );

  doc.setLineWidth(0.25);

  doc.rect(
    leftSignatureX,
    signatureBoxY,
    signatureBoxWidth,
    signatureBoxHeight,
  );

  // ==========================================
  // TTD KANAN - ABDUL AZIZ
  // ==========================================

  doc.setTextColor(
    secondaryColor[0],
    secondaryColor[1],
    secondaryColor[2],
  );

  doc.text(
    'Abdul Aziz',
    rightSignatureX +
      signatureBoxWidth / 2,
    signatureTitleY,
    {
      align: 'center',
    },
  );

  doc.setDrawColor(
    180,
    180,
    180,
  );

  doc.rect(
    rightSignatureX,
    signatureBoxY,
    signatureBoxWidth,
    signatureBoxHeight,
  );

  // ==========================================
  // INSERT PNG TTD ABDUL AZIZ
  // ==========================================

  try {
    const ttd =
      await loadImage(ttdImage);

    doc.addImage(
      ttd,
      'PNG',
      rightSignatureX + 7,
      signatureBoxY + 7,
      44,
      16,
    );
  } catch (err) {
    console.error(
      'Gagal memuat tanda tangan:',
      err,
    );
  }

  // ==========================================
  // PAGE 2 - TERMS & CONDITIONS
  // ==========================================

  doc.addPage();

  doc.setFillColor(
    255,
    255,
    255,
  );

  doc.rect(
    0,
    0,
    210,
    297,
    'F',
  );

  let termsY = 20;

  doc.setTextColor(
    secondaryColor[0],
    secondaryColor[1],
    secondaryColor[2],
  );

  doc.setFontSize(14);

  doc.setFont(
    'helvetica',
    'bold',
  );

  doc.text(
    'TERMS & CONDITIONS',
    15,
    termsY,
  );

  termsY += 8;

  doc.setFontSize(7.5);

  doc.setFont(
    'helvetica',
    'normal',
  );

  const termsText = `1. Pemesanan & Sistem Pembayaran
Pemesanan tanggal siaran dianggap resmi setelah klien mengisi formulir reservasi dan membayarkan Down Payment (DP) minimal sebesar 50% dari total nilai kontrak invoice. Pelunasan sisa pembayaran wajib diselesaikan paling lambat pada H-1 Minggu sebelum acara dimulai atau sesuai kesepakatan tertulis. Seluruh pembayaran dilakukan melalui transfer bank resmi atas nama rekening perusahaan atau perwakilan resmi Prime Broadcast yang tertera pada invoice resmi.

2. Durasi Siaran, Setup & Kebijakan Overtime
Durasi waktu paket dihitung mulai dari jam siaran (on-air) sesuai yang tertera pada formulir pemesanan. Tim Prime Broadcast akan tiba di lokasi minimal 4-5 jam sebelum acara untuk proses loading, instalasi kabel, sinkronisasi audio-video, dan gladi bersih (rehearsal). Waktu setup ini tidak memotong durasi siaran paket.
Kebijakan Overtime Terencana: Jika penambahan durasi atau perpanjangan waktu siaran sudah direncanakan dan dikomunikasikan sejak awal (sebelum hari-H), maka dikenakan biaya overtime terencana sebesar 25% per jam dari nilai paket dasar yang dipilih.
Kebijakan Overtime Tidak Terencana: Jika acara mengalami keterlambatan atau molor secara mendadak di luar jadwal kontrak yang disepakati, berlaku ketentuan overtime tidak terencana. Toleransi kelebihan waktu maksimal 15 menit. Kelebihan di atas 15 menit akan dibulatkan menjadi perhitungan lembur.
A. Overtime Tidak Terencana - Honor Kru & Driver: Lebih dari 2 jam: tambahan 50% dari Honor Kru/Hari. Lebih dari 5 jam: tambahan 100%-120% dari Honor Kru/Hari.
B. Overtime Tidak Terencana - Perangkat & Alat Sewa: Lebih dari 2 jam: charge overtime alat sebesar 50%. Lebih dari 5 jam: charge overtime alat sebesar 100%.

3. Fasilitas Venue, Jaringan & Akomodasi Luar Kota
Klien/pihak penyelenggara bertanggung jawab menyediakan akses listrik yang stabil dan izin operasional venue. Untuk streaming dengan opsi koneksi dedicated venue, pihak venue wajib menyediakan kabel LAN atau akses internet stabil dengan upload minimal 20 Mbps. Jika lokasi event berada di luar area Jabodetabek atau mengharuskan menginap, kru pengawal alat dan driver berhak mendapatkan akomodasi dari pihak Penyewa.

4. Tanggung Jawab Keamanan & Risiko Alat
Penyewa bertanggung jawab sepenuhnya terhadap keamanan seluruh perangkat di lokasi acara. Setiap kerusakan alat di lokasi yang disebabkan oleh kelalaian pihak luar/bukan dari kru Prime Broadcast menjadi tanggung jawab penyewa sepenuhnya.

5. Pembatalan & Reschedule
Pembatalan sepihak oleh klien: DP yang telah dibayarkan tidak dapat dikembalikan (non-refundable) karena tanggal dan kru telah dikunci secara eksklusif. Pembatalan pada hari-H tetap dikenakan charge penuh sebesar 120%. Reschedule diperbolehkan maksimal 1 kali dengan pemberitahuan tertulis paling lambat H-7 sebelum acara, dengan syarat ketersediaan kru pada tanggal baru. Reschedule kurang dari H-3 dikenakan biaya administrasi sebesar 40% dari total nilai paket.

6. Hak Cipta, Konten & Dokumentasi Rekaman
Seluruh materi audio, musik latar, slide presentasi, dan visual yang disiarkan adalah tanggung jawab penuh pihak penyelenggara terkait hak cipta pada platform penyiaran. File master rekaman Full HD (Program Output) akan diserahkan kepada klien via tautan cloud storage maksimal 1x24 jam setelah acara selesai. Prime Broadcast berhak menggunakan cuplikan/foto dokumentasi kegiatan penyiaran untuk portofolio dan promosi resmi, kecuali terdapat perjanjian kerahasiaan (NDA) tertulis sebelumnya.`;

  const splitTerms =
    doc.splitTextToSize(
      termsText,
      180,
    );

  doc.text(
    splitTerms,
    15,
    termsY,
  );

  // ==========================================
  // SAVE
  // ==========================================

  doc.save(
    `Invoice_${order.invoice_number}.pdf`,
  );
};
