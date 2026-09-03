import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Clock, FileCheck, AlertTriangle, Copyright, RefreshCw, ShieldAlert, Building2 } from 'lucide-react';

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
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <FileCheck className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                1. Pemesanan & Sistem Pembayaran
              </h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Pemesanan tanggal siaran dianggap resmi setelah klien mengisi formulir reservasi dan membayarkan Down Payment (DP) minimal sebesar <strong>50%</strong> dari total nilai kontrak invoice. Pelunasan sisa pembayaran wajib diselesaikan paling lambat pada <strong>H-1 Minggu</strong> sebelum acara dimulai atau sesuai kesepakatan tertulis. Seluruh pembayaran dilakukan melalui transfer bank resmi atas nama rekening perusahaan atau perwakilan resmi Prime Broadcast yang tertera pada invoice resmi.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <Clock className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                2. Durasi Siaran, Setup & Kebijakan Overtime
              </h2>
            </div>
            <div className="space-y-3.5 text-gray-600 text-sm leading-relaxed">
              <p>
                Durasi waktu paket dihitung mulai dari jam siaran (on-air) sesuai yang tertera pada formulir pemesanan. Tim Prime Broadcast akan tiba di lokasi minimal <strong>4-5 jam</strong> sebelum acara untuk proses loading, instalasi kabel, sinkronisasi audio-video, dan gladi bersih (rehearsal). Waktu setup ini <strong>tidak memotong</strong> durasi siaran paket.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div>
                  <strong className="text-[#081A2E] block mb-1">Kebijakan Overtime Terencana:</strong>
                  <span>Jika penambahan durasi atau perpanjangan waktu siaran sudah direncanakan dan dikomunikasikan sejak awal (sebelum hari-H), maka dikenakan biaya overtime terencana sebesar <strong>25% per jam</strong> dari nilai paket dasar yang dipilih.</span>
                </div>
                <div>
                  <strong className="text-[#081A2E] block mb-1">Kebijakan Overtime Tidak Terencana:</strong>
                  <span>Jika acara mengalami keterlambatan atau molor secara mendadak di luar jadwal kontrak yang disepakati, berlaku ketentuan overtime tidak terencana. Toleransi kelebihan waktu maksimal <strong>15 menit</strong>. Kelebihan di atas 15 menit akan dibulatkan menjadi perhitungan lembur:</span>
                  <ul className="mt-2 space-y-1.5 pl-4 list-disc text-slate-700">
                    <li>
                      <strong>A. Overtime Tidak Terencana - Honor Kru & Driver:</strong> Lebih dari 15 menit : tambahan 50% dari Honor Kru/Hari. Lebih dari 3 jam: tambahan 100%-120% dari Honor Kru/Hari.
                    </li>
                    <li>
                      <strong>B. Overtime Tidak Terencana - Perangkat & Alat Sewa:</strong> Lebih dari 15 menit : charge overtime alat sebesar 50%. Lebih dari 3 jam: charge overtime alat sebesar 100%.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <Building2 className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                3. Fasilitas Venue, Jaringan & Akomodasi Luar Kota
              </h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Klien/pihak penyelenggara bertanggung jawab menyediakan akses listrik yang stabil dan izin operasional venue. Untuk streaming dengan opsi koneksi dedicated venue, pihak venue wajib menyediakan kabel LAN atau akses internet stabil dengan upload minimal <strong>20 Mbps</strong>. Jika lokasi event berada di luar area Jabodetabek atau mengharuskan menginap, kru pengawal alat dan driver berhak mendapatkan akomodasi dari pihak Penyewa.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <ShieldAlert className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                4. Tanggung Jawab Keamanan & Risiko Alat
              </h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Penyewa bertanggung jawab sepenuhnya terhadap keamanan seluruh perangkat di lokasi acara. Setiap kerusakan alat di lokasi yang disebabkan oleh kelalaian pihak luar/bukan dari kru Prime Broadcast menjadi tanggung jawab penyewa sepenuhnya.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <RefreshCw className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                5. Pembatalan & Reschedule
              </h2>
            </div>
            <div className="space-y-2 text-gray-600 text-sm leading-relaxed">
              <p>
                <strong>Pembatalan sepihak oleh klien:</strong> DP yang telah dibayarkan tidak dapat dikembalikan (<em>non-refundable</em>) karena tanggal dan kru telah dikunci secara eksklusif. Pembatalan pada hari-H tetap dikenakan charge penuh sebesar <strong>120%</strong>.
              </p>
              <p>
                <strong>Reschedule:</strong> Diperbolehkan maksimal 1 kali dengan pemberitahuan tertulis paling lambat <strong>H-7 sebelum acara</strong>, dengan syarat ketersediaan kru pada tanggal baru. Reschedule kurang dari H-3 dikenakan biaya administrasi sebesar <strong>40%</strong> dari total nilai paket.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="p-6 sm:p-8 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-[#081A2E]">
              <Copyright className="w-5 h-5 text-[#A40D35]" />
              <h2 className="text-lg sm:text-xl font-bold m-0 text-[#081A2E]">
                6. Hak Cipta, Konten & Dokumentasi Rekaman
              </h2>
            </div>
            <div className="space-y-2 text-gray-600 text-sm leading-relaxed">
              <p>
                Seluruh materi audio, musik latar, slide presentasi, dan visual yang disiarkan adalah tanggung jawab penuh pihak penyelenggara terkait hak cipta pada platform penyiaran.
              </p>
              <p>
                File master rekaman Full HD (Program Output) akan diserahkan kepada klien via tautan cloud storage maksimal <strong>1x24 jam</strong> setelah acara selesai.
              </p>
              <p>
                Prime Broadcast berhak menggunakan cuplikan/foto dokumentasi kegiatan penyiaran untuk portofolio dan promosi resmi, kecuali terdapat perjanjian kerahasiaan (NDA) tertulis sebelumnya.
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};
