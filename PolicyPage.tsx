import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ShieldCheck, Clock, FileCheck, AlertTriangle, Copyright, RefreshCw } from 'lucide-react';

export const PolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white" id="policy-page-root">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-white border-b border-gray-100 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-normal text-[#081A2E] leading-tight">
            Aturan & Kebijakan Layanan
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-2xl mx-auto leading-relaxed">
            Ketentuan kerja sama, sistem pembayaran, kebijakan pembatalan, dan standar operasional
            produksi Prime Broadcast.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 lg:px-12 py-12">
        <div className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
          
          {/* Section 1 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <FileCheck className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                1. Pemesanan & Sistem Pembayaran
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
              <li>
                Pemesanan tanggal siaran dianggap resmi setelah klien mengisi form reservasi dan membayarkan Down Payment (DP) minimal sebesar <strong>50%</strong> dari total nilai kontrak invoice.
              </li>
              <li>
                Pelunasan sisa pembayaran wajib diselesaikan paling lambat pada hari pelaksanaan acara (H-0) sebelum acara dimulai atau sesuai kesepakatan tertulis.
              </li>
              <li>
                Semua pembayaran dilakukan melalui transfer bank resmi atas nama rekening perusahaan / perwakilan resmi Prime Broadcast yang tertera di invoice resmi.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <Clock className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                2. Durasi Siaran, Setup & Kebijakan Overtime
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
              <li>
                Durasi waktu paket dihitung mulai dari jam siaran (on-air) sesuai yang tertera pada formulir pemesanan.
              </li>
              <li>
                Tim Prime Broadcast akan tiba di lokasi minimal 2–3 jam sebelum acara untuk proses loading, instalasi kabel, sinkronisasi audio-video, dan gladi bersih (rehearsal). Waktu setup ini <strong>tidak memotong</strong> durasi siaran paket.
              </li>
              <li>
                Apabila siaran melebihi durasi paket dasar, akan dikenakan biaya overtime sebesar <strong>15% per jam</strong> dari nilai paket dasar yang dipilih.
              </li>
              <li>
                Toleransi kelebihan waktu diberikan maksimal 15 menit. Kelebihan di atas 15 menit akan dibulatkan menjadi 1 jam overtime penuh.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <RefreshCw className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                3. Kebijakan Pembatalan & Penjadwalan Ulang (Reschedule)
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
              <li>
                <strong>Pembatalan Sepihak oleh Klien:</strong> DP yang telah dibayarkan tidak dapat dikembalikan (non-refundable) karena tanggal dan kru telah dikunci secara eksklusif.
              </li>
              <li>
                <strong>Penjadwalan Ulang (Reschedule):</strong> Diperbolehkan maksimal 1 (satu) kali dengan pemberitahuan tertulis paling lambat <strong>H-7 sebelum acara</strong>, dengan syarat ketersediaan kru dan jadwal pada tanggal baru.
              </li>
              <li>
                Reschedule yang diajukan kurang dari H-3 sebelum acara akan dikenakan biaya administrasi penjadwalan ulang sebesar 20% dari total nilai paket.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <AlertTriangle className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                4. Fasilitas Venue & Jaringan Internet
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
              <li>
                Klien / pihak penyelenggara bertanggung jawab menyediakan akses listrik yang stabil (minimal 1 titik stop kontak 16A terdekat) dan izin operasional venue.
              </li>
              <li>
                Untuk streaming dengan opsi koneksi dedicated venue, pihak venue wajib menyediakan kabel LAN atau akses internet stabil dengan dedicated upload speed minimal 20 Mbps.
              </li>
              <li>
                Apabila klien menggunakan opsi Mobile Internet Bonding dari Prime Broadcast, koneksi akan diamankan dengan multi-sim cellular aggregator (Telkomsel + Indosat/XL).
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <Copyright className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                5. Hak Cipta, Konten & Dokumentasi Rekaman
              </h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
              <li>
                Seluruh materi audio, musik latar, slide presentasi, dan visual yang disiarkan adalah tanggung jawab penuh pihak penyelenggara acara terkait hak cipta (copyright) pada platform penyiaran (YouTube/Facebook/Twitch).
              </li>
              <li>
                File master rekaman Full HD (Program Output) akan diserahkan kepada klien via cloud storage link (Google Drive) maksimal 1x24 jam setelah acara selesai.
              </li>
              <li>
                Prime Broadcast berhak menggunakan cuplikan/foto dokumentasi kegiatan penyiaran untuk portofolio dan promosi resmi, kecuali terdapat perjanjian kerahasiaan (NDA) tertulis sebelumnya.
              </li>
            </ul>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};
