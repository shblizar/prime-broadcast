import { Order } from '../types';
import { formatIDR } from './currency';

/**
 * Normalizes an Indonesian/international phone number into raw country code format for wa.me.
 * Example: "+62 851-5055-5195" -> "6285150555195"
 */
export function normalizeWhatsAppNumber(raw: string): string {
  if (!raw) return '6285150555195';
  let digits = raw.replace(/[^0-9]/g, '');

  if (digits.startsWith('0')) {
    digits = '62' + digits.substring(1);
  } else if (!digits.startsWith('62')) {
    digits = '62' + digits;
  }

  return digits;
}

/**
 * Formats a clean date in Indonesian format: e.g. "30 Agustus 2026"
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Generates the WhatsApp text and URL according to Prime Broadcast specifications.
 */
export function formatOrderWhatsAppMessage(order: any): string {
  const lines: string[] = [];

  lines.push('KONFIRMASI RESERVASI PRIME BROADCAST');
  lines.push('');
  lines.push(`Invoice: ${order.invoice_number}`);
  lines.push('');
  lines.push('DATA CUSTOMER');
  lines.push(`Nama: ${order.customer_name}`);
  lines.push(`Lembaga/Perusahaan: ${order.organization_name}`);
  lines.push(`WhatsApp: ${order.whatsapp}`);
  lines.push(`Email: ${order.email}`);
  lines.push('');
  lines.push('DATA EVENT');
  lines.push(`Tanggal: ${formatIndonesianDate(order.event_date)}`);
  lines.push(`Jam Mulai: ${order.event_start_time} WIB`);
  lines.push(`Lokasi: ${order.venue_address}`);
  lines.push('');
  lines.push('DETAIL PEMESANAN');
  lines.push('');
  lines.push('Package:');
  lines.push(`${order.package_name || order.package_name_snapshot || 'Custom Package'}`);
  lines.push(`Durasi: ${order.package_duration_hours || order.package_duration_snapshot || 6} Jam`);
  lines.push(`${formatIDR(order.package_price || order.package_price_snapshot || 0)}`);

  const upgrades = (order.items || []).filter((i: any) => i.item_type === 'upgrade');
  if (upgrades.length > 0) {
    lines.push('');
    lines.push('Optional Upgrade:');
    upgrades.forEach((item: any) => {
      lines.push(`- ${item.item_name || item.name} × ${item.quantity} ${item.unit_label || ''}`.trim());
      lines.push(`  ${formatIDR(item.line_total)}`);
    });
  }

  const overtime = (order.items || []).find((i: any) => i.item_type === 'overtime');
  if (overtime && overtime.quantity > 0) {
    lines.push('');
    lines.push('Overtime:');
    lines.push(`- ${overtime.quantity} Jam`);
    lines.push(`  ${formatIDR(overtime.line_total)}`);
  }

  const addons = (order.items || []).filter((i: any) => i.item_type === 'addon');
  if (addons.length > 0) {
    lines.push('');
    lines.push('Add-on:');
    addons.forEach((item: any) => {
      lines.push(`- ${item.item_name || item.name}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`);
      lines.push(`  ${formatIDR(item.line_total)}`);
    });
  }

  lines.push('');
  lines.push('Subtotal:');
  lines.push(`${formatIDR(order.subtotal)}`);

  const voucherCode = order.voucher_code || order.voucher_code_snapshot;
  const discountAmount = order.voucher_discount_amount || order.discount_amount || 0;
  if (voucherCode && discountAmount > 0) {
    lines.push('');
    lines.push(`Voucher:\n${voucherCode}`);
    lines.push('');
    lines.push(`Potongan:\n-${formatIDR(discountAmount)}`);
  }

  lines.push('');
  lines.push('ESTIMASI TOTAL:');
  lines.push(`${formatIDR(order.estimated_total)}`);

  if (order.additional_notes && order.additional_notes.trim()) {
    lines.push('');
    lines.push('CATATAN:');
    lines.push(order.additional_notes.trim());
  }

  return lines.join('\n');
}

export const generateWhatsAppMessage = formatOrderWhatsAppMessage;

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = normalizeWhatsAppNumber(phoneNumber);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}
