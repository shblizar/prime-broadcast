import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environmental variables
import nodemailer from 'nodemailer';
import { jsPDF } from 'jspdf';
import dotenv from 'dotenv';
dotenv.config();
console.log("ENV CHECK:", {
  ADMIN_EMAIL:process.env.ADMIN_EMAIL,
  GMAIL_USER: process.env.GMAIL_USER,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? "ADA" : "KOSONG"
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to store credentials, tokens, and bookings database
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const BOOKINGS_PATH = path.join(process.cwd(), 'bookings.json');

// Initialize Bookings database file with defaults if it doesn't exist
const INITIAL_BOOKINGS = [
  {
    id: 'PB-INV-20260612',
    date: '2026-06-12',
    title: 'Seminar Nasional Transformasi Digital UI/UX',
    clientName: 'Universitas Indonesia',
    isManual: false,
    packageType: 'Prime Regular',
    time: '09:00'
  },
  {
    id: 'PB-INV-MANUAL-01',
    date: '2026-06-18',
    title: 'Wedding Live Stream - Andi & Sisi',
    clientName: 'Andi Wijaya',
    isManual: true,
    packageType: 'Prime Ultimate (Custom)',
    time: '11:00'
  },
  {
    id: 'PB-INV-20260625',
    date: '2026-06-25',
    title: 'Corporate Town Hall Q2',
    clientName: 'PT Bank Central Indonesia',
    isManual: false,
    packageType: 'Prime Ultimate',
    time: '14:00'
  },
  {
    id: 'PB-INV-MANUAL-02',
    date: '2026-07-02',
    title: 'Product Launching & Press Conference',
    clientName: 'Wardah Cosmetics Corp',
    isManual: true,
    packageType: 'Prime Ultimate',
    time: '15:30'
  }
];

if (!fs.existsSync(BOOKINGS_PATH)) {
  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(INITIAL_BOOKINGS, null, 2), 'utf-8');
}

// Read web credentials from credentials.json safely
function getGoogleCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.web || parsed;
  } catch (error) {
    console.error('Error reading credentials.json:', error);
    return null;
  }
}

// Get validated and/or refreshed access token
async function getValidatedAccessToken(credentials: any) {
  if (!fs.existsSync(TOKEN_PATH)) {
    return null;
  }
  try {
    const tokenData = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    const now = Date.now();

    // If token is still valid with a 5 minutes safety buffer, use it
    if (tokenData.expiry_date && tokenData.expiry_date > now + 300000) {
      return tokenData.access_token;
    }

    // Attempt token refreshing if a refresh token is present
    if (!tokenData.refresh_token) {
      console.warn('No refresh token discovered. Re-authentication necessary.');
      return null;
    }

    console.log('Access token expired. Standard token refreshing initialized...');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google token refresh error: ${errText}`);
    }

    const refreshed = await response.json();
    tokenData.access_token = refreshed.access_token;
    if (refreshed.expires_in) {
      tokenData.expiry_date = Date.now() + (refreshed.expires_in * 1000);
    }
    if (refreshed.refresh_token) {
      tokenData.refresh_token = refreshed.refresh_token;
    }

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2), 'utf-8');
    console.log('Google Access Token refreshed successfully.');
    return tokenData.access_token;
  } catch (error) {
    console.error('Failed to validate or refresh access token:', error);
    return null;
  }
}

// API: Get connected status
app.get('/api/calendar/status', async (req, res) => {
  const credentials = getGoogleCredentials();
  if (!credentials) {
    return res.json({ connected: false, error: 'credentials.json missing' });
  }

  const tokenExists = fs.existsSync(TOKEN_PATH);
  if (!tokenExists) {
    return res.json({ connected: false, initialized: true });
  }

  const token = await getValidatedAccessToken(credentials);
  if (token) {
    // Optionally fetch connected account profile info
    try {
      const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        return res.json({ connected: true, email: profile.email, name: profile.name });
      }
    } catch {}
    return res.json({ connected: true });
  }

  return res.json({ connected: false, reason: 'Token expired or invalid' });
});

// API: Disconnect Google Calendar
app.post('/api/calendar/disconnect', (req, res) => {
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      fs.unlinkSync(TOKEN_PATH);
      return res.json({ success: true, message: 'Google Calendar terputus.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  return res.json({ success: true, message: 'Belum ada koneksi untuk dihapus.' });
});

// API: Initiate Google OAuth Redirection URL
app.get('/api/auth/url', (req, res) => {
  const credentials = getGoogleCredentials();
  if (!credentials) {
    return res.status(500).json({ error: 'Config credentials.json tidak ditemukan di server.' });
  }

  // Construct absolute redirect URI matching current runtime environment
  const origin = process.env.APP_URL || req.headers.referer || `${req.protocol}://${req.get('host')}`;
  const cleanOrigin = origin.replace(/\/$/, ''); // strip trailing slash
  const redirectUri = `${cleanOrigin}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: credentials.client_id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/oauth2/v2.userinfo',
    access_type: 'offline',
    prompt: 'consent'
  });

  const authUrl = `${credentials.auth_uri || 'https://accounts.google.com/o/oauth2/auth'}?${params.toString()}`;
  res.json({ url: authUrl });
});

// API: Google OAuth Callback Handler with popup message
app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.send('<html><body><h3>OAuth Error: No authorization code received.</h3></body></html>');
  }

  const credentials = getGoogleCredentials();
  if (!credentials) {
    return res.status(500).send('Credentials missing.');
  }

  // Same redirect URI construction
  const host = req.get('host');
  const protocol = req.protocol;
  const origin = process.env.APP_URL || `${protocol}://${host}`;
  const cleanOrigin = origin.replace(/\/$/, '');
  const redirectUri = `${cleanOrigin}/api/auth/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errTxt = await tokenResponse.text();
      console.error('Failed to exchange code:', errTxt);
      return res.send(`<html><body><h3>Authorization code exchange failed: ${errTxt}</h3></body></html>`);
    }

    const tokenData = await tokenResponse.json();
    const expiry_date = Date.now() + (tokenData.expires_in * 1000);

    // Save tokens securely to server filesystem
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date
    }, null, 2), 'utf-8');

    console.log('OAuth authorization successful. token.json generated.');

    // Respond with visual message back to window opener and auto-close the popup
    res.send(`
      <html>
        <head>
          <title>Google Calendar Terhubung!</title>
          <style>
            body {
              background: #020617;
              color: #f1f5f9;
              font-family: sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              text-align: center;
            }
            .card {
              background: #0f172a;
              border: 1px solid rgba(59, 130, 246, 0.2);
              padding: 2rem;
              border-radius: 1rem;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.5);
              max-width: 400px;
            }
            h2 { color: #3b82f6; margin-top: 0; }
            p { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Sukses Terhubung!</h2>
            <p>Google Calendar akun Anda berhasil dihubungkan ke Prime Broadcast.</p>
            <p>Jendela ini akan menutup secara otomatis dalam beberapa detik...</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            }
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('Error in callback:', err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});

// API: Get entire listing of bookings
app.get('/api/bookings', (req, res) => {
  if (fs.existsSync(BOOKINGS_PATH)) {
    const data = JSON.parse(fs.readFileSync(BOOKINGS_PATH, 'utf-8'));
    return res.json(data);
  }
  return res.json(INITIAL_BOOKINGS);
});

// API: Booking submission trigger (Invokes Gemini SDK models & Inserts to Google Calendar)


function generateInvoicePDFBuffer(bookingData: any): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header strip biru
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, 210, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('PRIME BROADCAST', 15, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Premium Live Streaming & Broadcasting Solutions', 15, 29);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('WA: +62 851-5055-5195', 195, 20, { align: 'right' });
  doc.text('Email: primebroadcast.id@gmail.com', 195, 25, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 35, 195, 35);

  // Box info klien & event
  doc.setFillColor(248, 250, 252);
  doc.rect(15, 40, 85, 32, 'F');
  doc.rect(110, 40, 85, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text('INFORMASI KLIEN:', 20, 46);
  doc.text('DETAIL AGENDA SIARAN:', 115, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Nama: ${bookingData.clientName}`, 20, 52);
  doc.text(`Perusahaan: ${bookingData.clientCompany || 'Pribadi'}`, 20, 57);
  doc.text(`WhatsApp: ${bookingData.clientWhatsapp}`, 20, 62);
  doc.text(`Email: ${bookingData.clientEmail}`, 20, 67);

  doc.text(`Paket: ${bookingData.packageName}`, 115, 52);
  doc.text(`Durasi: ${bookingData.packageDuration}`, 115, 57);
  doc.text(`Jadwal: ${bookingData.eventDate} @ ${bookingData.eventTime} WIB`, 115, 62);
  doc.text(`Lokasi: ${(bookingData.eventLocation || '').substring(0, 36)}`, 115, 67);

  // Tabel items
  doc.setFillColor(30, 41, 59);
  doc.rect(15, 78, 180, 7.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Deskripsi', 18, 83);
  doc.text('Total', 190, 83, { align: 'right' });

  let itemY = 92;
  const row = (desc: string, price: string) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(desc, 18, itemY);
    doc.text(price, 190, itemY, { align: 'right' });
    doc.setDrawColor(241, 245, 249);
    doc.line(15, itemY + 2.5, 195, itemY + 2.5);
    itemY += 7.5;
  };

  row(`${bookingData.packageName} (${bookingData.packageDuration})`, `Rp ${Number(bookingData.priceSubtotal || 0).toLocaleString('id-ID')}`);
  if (bookingData.additionalOvertime && bookingData.additionalOvertime !== '0 Jam') {
    row(`Overtime: ${bookingData.additionalOvertime}`, '-');
  }
  if (bookingData.voucherApplied && bookingData.voucherApplied !== 'Tanpa Voucher') {
    row(`Voucher: ${bookingData.voucherApplied}`, `-Rp ${Number(bookingData.savingsDiscount || 0).toLocaleString('id-ID')}`);
  }
  row('Pajak PPN 1%', `Rp ${Number(bookingData.taxFee1Percent || 0).toLocaleString('id-ID')}`);

  itemY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(37, 99, 235);
  doc.text('TOTAL TAGIHAN NETT:', 18, itemY);
  doc.text(`Rp ${Number(bookingData.grandTotalPriceNett || 0).toLocaleString('id-ID')}`, 190, itemY, { align: 'right' });

  itemY += 15;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Invoice ID: ${bookingData.invoiceId}  |  Generated otomatis oleh sistem Prime Broadcast`, 105, itemY, { align: 'center' });

  // Return sebagai Buffer Node.js
  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}


async function sendInvoiceEmailToAdmin(bookingData: any, pdfBuffer: Buffer): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!adminEmail || !gmailUser || !gmailPass) {
    console.warn('[Email] ADMIN_EMAIL / GMAIL_USER / GMAIL_APP_PASSWORD belum dikonfigurasi di .env. Skip kirim email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  const subject = `📋 Invoice Baru: ${bookingData.invoiceId} — ${bookingData.clientName}`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
      <div style="background: #1e3a8a; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: white; margin: 0; font-size: 18px;">PRIME BROADCAST — Invoice Baru Masuk</h2>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="background: #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #475569; width: 40%;">Invoice ID</td>
            <td style="padding: 8px 12px; color: #1e40af; font-weight: bold;">${bookingData.invoiceId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Nama Klien</td>
            <td style="padding: 8px 12px;">${bookingData.clientName}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Perusahaan</td>
            <td style="padding: 8px 12px;">${bookingData.clientCompany || 'Pribadi / Individu'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">WhatsApp</td>
            <td style="padding: 8px 12px;">${bookingData.clientWhatsapp}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Email Klien</td>
            <td style="padding: 8px 12px;">${bookingData.clientEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Tanggal Event</td>
            <td style="padding: 8px 12px;">${bookingData.eventDate} @ ${bookingData.eventTime} WIB</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Lokasi</td>
            <td style="padding: 8px 12px;">${bookingData.eventLocation}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #475569;">Paket</td>
            <td style="padding: 8px 12px;">${bookingData.packageName} (${bookingData.packageDuration})</td>
          </tr>
          <tr style="background: #dbeafe;">
            <td style="padding: 10px 12px; font-weight: bold; color: #1e40af; font-size: 14px;">TOTAL TAGIHAN</td>
            <td style="padding: 10px 12px; font-weight: bold; color: #1e40af; font-size: 14px;">Rp ${Number(bookingData.grandTotalPriceNett || 0).toLocaleString('id-ID')}</td>
          </tr>
        </table>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
          Invoice PDF terlampir. Kirimkan ke klien secara manual setelah pembayaran selesai.
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Prime Broadcast System" <${gmailUser}>`,
    to: adminEmail,
    subject,
    html: htmlBody,
    attachments: [
      {
        filename: `Invoice-${bookingData.invoiceId}-${bookingData.clientName.replace(/\s+/g, '_')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });

  console.log(`[Email] Invoice ${bookingData.invoiceId} berhasil dikirim ke ${adminEmail}`);
}

    
app.post('/api/booking/submit', async (req, res) => {
  const bookingData = req.body;
  if (!bookingData || !bookingData.invoiceId) {
    return res.status(400).json({ error: 'Data booking lengkap tidak valid.' });
  }

  console.log(`Booking diterima: ${bookingData.invoiceId} dari ${bookingData.clientName}`);

  // Create formatted description text for Gemini AI Studio Input
  const payloadText = `
    NOMOR INVOICE: ${bookingData.invoiceId}
    NAMA KLIEN: ${bookingData.clientName}
    PERUSAHAAN/INSTANSI: ${bookingData.clientCompany || '-'}
    WHATSAPP: ${bookingData.clientWhatsapp}
    EMAIL: ${bookingData.clientEmail}
    TANGGAL ACARA: ${bookingData.eventDate}
    WAKTU ACARA: ${bookingData.eventTime}
    LOKASI ACARA: ${bookingData.eventLocation}
    PAKET PILIHAN: ${bookingData.packageName}
    DURASI KONTRAK: ${bookingData.packageDuration}
    TAMBAHAN OVERTIME: ${bookingData.additionalOvertime || '0 Jam'}
    KAMERA UTAMA: ${bookingData.mainCameraModel || '-'} (Upgrade: ${bookingData.mainCameraUpgradeCount || 1} unit)
    VOUCHER TERAPAKAI: ${bookingData.voucherApplied || 'Tidak ada'}
    HEMAT DISKON: RP ${bookingData.savingsDiscount || 0}
    GRAND TOTAL NETT: Rp ${bookingData.grandTotalPriceNett}
    CATATAN TAMBAHAN: ${bookingData.eventNotes || 'Tidak ada'}
  `;

  let parsedEvent: any = null;
  let geminiCleaned = false;

  // 1. Invoke Gemini API using the recommended @google/genai SDK
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      console.log('Memanggil Gemini API (gemini-3.5-flash) untuk membersihkan/merapikan data jadwal...');
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `
        Berikut rincian pesanan masuk untuk siaran langsung / live streaming dari klien.
        Tugas Anda adalah merapikan data tanggal, jam, judul, dan draf catatan untuk kalender.
        Tentukan waktu mulai (startTime) dan waktu selesai (endTime) dalam format ISO 8601 string dengan offset timezone +07:00 (Asia/Jakarta, WIB).
        Gunakan data Tanggal Acara (${bookingData.eventDate}) dan Waktu Acara (${bookingData.eventTime}).
        Durasi total acara adalah akumulasi dari durasi utama (${bookingData.packageDuration}) ditambah tambahan overtime (${bookingData.additionalOvertime || '0 Jam'}).
        Contoh: Jika mulai pukul 09:00 dan durasi 4 Jam, maka waktu selesainya adalah 13:00.
        
        DATA PESANAN MASUK:
        ${payloadText}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING, description: 'Judul event kalender, contoh: [LIVE PB] Universitas Indonesia - Seminar Nasional' },
              description: { type: Type.STRING, description: 'Deskripsi lengkap & rapi tentang rincian kontak, device kamera, overtime, harga, dll.' },
              location: { type: Type.STRING, description: 'Alamat lengkap tempat pelaksanaan' },
              startTime: { type: Type.STRING, description: 'ISO 8601 string dengan timezone Jakarta, contoh: 2026-06-12T09:00:00+07:00' },
              endTime: { type: Type.STRING, description: 'ISO 8601 string dengan timezone Jakarta (dihitung dari akumulasi durasi)' },
              parsedDateOnly: { type: Type.STRING, description: 'Format tanggal rapi YYYY-MM-DD' },
              parsedTimeOnly: { type: Type.STRING, description: 'Format waktu rapi HH:MM, contoh: 09:00' }
            },
            required: ['summary', 'description', 'location', 'startTime', 'endTime', 'parsedDateOnly', 'parsedTimeOnly']
          }
        }
      });

      if (response && response.text) {
        parsedEvent = JSON.parse(response.text.trim());
        geminiCleaned = true;
        console.log('Sukses mendapatkan output valid dari Gemini API:', parsedEvent);
      }
    } catch (err) {
      console.error('Gagal memproses data dengan Gemini API:', err);
    }
  } else {
    console.warn('GEMINI_API_KEY tidak dikonfigurasi di secrets. Melewati tahap Gemini AI.');
  }

  // Fallback parsedEvent if Gemini API is bypassed / failed
  if (!parsedEvent) {
    const backupDate = bookingData.eventDate || '2026-06-10';
    const backupTime = bookingData.eventTime || '09:00';
    const hours = parseInt(bookingData.packageDuration) || 4;
    const ovHours = parseInt(bookingData.additionalOvertime) || 0;
    const totalHours = hours + ovHours;

    const [hStr, mStr] = backupTime.split(':');
    const startHour = parseInt(hStr) || 9;
    const startMin = parseInt(mStr) || 0;
    const endHour = startHour + totalHours;

    const pad = (n: number) => n.toString().padStart(2, '0');

    parsedEvent = {
      summary: `[LIVE PB - Manual] ${bookingData.clientName} - ${bookingData.packageName}`,
      description: `Invoice: ${bookingData.invoiceId}\nPaket: ${bookingData.packageName}\nKontak: ${bookingData.clientWhatsapp} (${bookingData.clientEmail})`,
      location: bookingData.eventLocation,
      startTime: `${backupDate}T${pad(startHour)}:${pad(startMin)}:00+07:00`,
      endTime: `${backupDate}T${pad(endHour > 23 ? 23 : endHour)}:${pad(startMin)}:00+07:00`,
      parsedDateOnly: backupDate,
      parsedTimeOnly: backupTime
    };
  }

  // 2. Add Booking into local bookings list file (Sync database)
  const currentBookings = fs.existsSync(BOOKINGS_PATH) 
    ? JSON.parse(fs.readFileSync(BOOKINGS_PATH, 'utf-8'))
    : [];

  const newBookingSlot = {
    id: bookingData.invoiceId,
    date: parsedEvent.parsedDateOnly,
    title: parsedEvent.summary,
    clientName: bookingData.clientName,
    isManual: false,
    packageType: bookingData.packageName,
    time: parsedEvent.parsedTimeOnly
  };

  currentBookings.push(newBookingSlot);
  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(currentBookings, null, 2), 'utf-8');
  console.log(`Pemesanan berhasil disimpan lokal ke bookings.json.`);
  // Kirim invoice PDF ke Gmail admin
  try {
    const pdfBuffer = generateInvoicePDFBuffer(bookingData);
    await sendInvoiceEmailToAdmin(bookingData, pdfBuffer);
  } catch (emailErr) {
    console.error(
      '[Email] Gagal mengirim invoice email ke admin:',
      emailErr
    );
  }

  // 3. Optional: Insert the cleaned booking into Google Calendar if connection exists
  let googleSynced = false;
  let googleError = null;
  const credentials = getGoogleCredentials();
  if (credentials) {
    const accessToken = await getValidatedAccessToken(credentials);
    if (accessToken) {
      try {
        console.log('Melakukan sinkronisasi Google Calendar secara otomatis...');
        const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: parsedEvent.summary,
            location: parsedEvent.location,
            description: parsedEvent.description,
            start: {
              dateTime: parsedEvent.startTime,
              timeZone: 'Asia/Jakarta'
            },
            end: {
              dateTime: parsedEvent.endTime,
              timeZone: 'Asia/Jakarta'
            }
          })
        });

        if (calendarResponse.ok) {
          googleSynced = true;
          console.log('Sukses menambahkan jadwal ke Google Calendar!');
        } else {
          const calendarErr = await calendarResponse.text();
          console.error('Error saat memasukkan event ke Google Calendar:', calendarErr);
          googleError = calendarErr;
        }
      } catch (err: any) {
        console.error('Gagal sinkronisasi Google Calendar:', err);
        googleError = err.message;
      }
    } else {
      console.warn('Google Calendar tidak tersambung (token tdk aktif / belum sign-in). Sinkronisasi ditiadakan.');
    }
  }

  res.json({
    success: true,
    geminiCleaned,
    googleSynced,
    googleError,
    parsedEvent,
    booking: newBookingSlot
  });
});

// Admin Panel Manual Booking Insert endpoint
app.post('/api/admin/bookings/manual', (req, res) => {
  const manualBooking = req.body;
  if (!manualBooking || !manualBooking.date || !manualBooking.title) {
    return res.status(400).json({ error: 'Form manual tidak lengkap.' });
  }

  const currentBookings = fs.existsSync(BOOKINGS_PATH) 
    ? JSON.parse(fs.readFileSync(BOOKINGS_PATH, 'utf-8'))
    : [];

  const newManualSlot = {
    id: `PB-INV-MANUAL-${Date.now().toString().slice(-4)}`,
    date: manualBooking.date,
    title: manualBooking.title,
    clientName: manualBooking.clientName || 'Manual Offline',
    isManual: true,
    packageType: manualBooking.packageType || 'Prime Regular',
    time: manualBooking.time || '08:00'
  };

  currentBookings.push(newManualSlot);
  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(currentBookings, null, 2), 'utf-8');
  res.json({ success: true, booking: newManualSlot });
});

// Admin Panel Manual Delete booking
app.delete('/api/admin/bookings/:id', (req, res) => {
  const { id } = req.params;
  if (!fs.existsSync(BOOKINGS_PATH)) {
    return res.status(404).json({ error: 'Database bookings kosong.' });
  }

  const currentBookings = JSON.parse(fs.readFileSync(BOOKINGS_PATH, 'utf-8'));
  const filtered = currentBookings.filter((b: any) => b.id !== id);

  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
  res.json({ success: true, message: `Booking ${id} berhasil dihapus.` });
});

// Mount Vite middleware / static files resolution
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Prime Broadcast running on http://localhost:${PORT}`);
  });
}

startServer();
