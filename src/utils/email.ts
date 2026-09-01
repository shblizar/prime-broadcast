import { Order } from '../types';
import { formatIDR } from './currency';

export const generateGmailLink = (order: Order): string => {
  const subject = `Booking Berhasil — Prime Broadcast | ${order.invoice_number}`;
  
  let body = `Halo ${order.customer_name},

Terima kasih telah melakukan booking di Prime Broadcast.
Booking Anda telah berhasil tercatat di sistem kami.

DETAIL RESERVASI

Nomor Invoice: ${order.invoice_number}
Nama Lengkap / Penanggung Jawab: ${order.customer_name}
Nama Lembaga / Perusahaan / Komunitas: ${order.organization_name || '-'}
Nomor WhatsApp: ${order.whatsapp}
Email: ${order.email}
Tanggal Acara: ${order.event_date}
Jam Mulai Acara: ${order.event_start_time} WIB
Alamat Venue / Lokasi: ${order.venue_address}

RINCIAN PESANAN

`;

  if (order.items && order.items.length > 0) {
    order.items.forEach((item) => {
      let name = item.item_name || item.name || 'Item';
      if (item.item_type === 'overtime' && order.overtime_hours) {
        name += ` (${order.overtime_hours} Jam)`;
      }
      body += `${name}\n`;
      body += `Harga: ${formatIDR(item.unit_price)}\n`;
      body += `Qty: ${item.quantity}\n`;
      body += `Total: ${formatIDR(item.line_total)}\n\n`;
    });
  } else {
    body += `${order.package_name || 'Paket Utama'}\n`;
    body += `Total: ${formatIDR(order.subtotal)}\n\n`;
  }

  body += `Subtotal: ${formatIDR(order.subtotal)}\n`;
  if (order.discount_amount > 0) {
    body += `Diskon Voucher: -${formatIDR(order.discount_amount)}\n`;
  } else {
    body += `Diskon Voucher: Rp 0\n`;
  }
  body += `Total Estimasi Biaya: ${formatIDR(order.estimated_total)}\n\n`;

  body += `INFORMASI PEMBAYARAN

BluBCA
0025 9442 7907
A/n Abdul Aziz

BSI
7304729001
A/n Abdul Aziz

Mohon simpan informasi invoice ini sebagai referensi booking Anda.

Terima kasih telah mempercayakan kebutuhan broadcasting kepada Prime Broadcast.

Pesan ini dibuat otomatis oleh sistem Prime Broadcast.
`;

  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(order.email)}&su=${encodedSubject}&body=${encodedBody}`;
};
