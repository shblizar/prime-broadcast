/**
 * Generates an invoice number in Asia/Jakarta timezone.
 * Format: PB-YYMMDD-XXXX (e.g. PB-260830-0001)
 */
export function generateLocalInvoiceNumber(sequence: number = 1): string {
  // Use Asia/Jakarta time
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  };

  const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(now);
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const year = parts.find((p) => p.type === 'year')?.value || '26';

  const dateStr = `${year}${month}${day}`;
  const seqStr = String(sequence).padStart(4, '0');

  return `PB-${dateStr}-${seqStr}`;
}
