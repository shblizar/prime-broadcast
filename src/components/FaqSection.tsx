import React, { useState } from 'react';
import { FAQS } from '../data';
import { FAQItem } from '../types';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  MapPin, 
  MicOff, 
  Clock, 
  CheckCircle2, 
  HeartHandshake,
  Search,
  Send,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';

interface FaqSectionProps {
  mode?: 'policies' | 'faq' | 'both';
}

export default function FaqSection({ mode = 'both' }: FaqSectionProps) {
  const [activeFaqId, setActiveFaqId] = useState<string | null>('faq-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom interactive question state
  const [customName, setCustomName] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const categories = ['Semua', 'Kebijakan', 'Teknis', 'Reservasi', 'Output'];

  // Advanced search and category filtering
  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === 'Semua' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setActiveFaqId(activeFaqId === id ? null : id);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    
    // Simulate/route to active WhatsApp with the custom question
    const textMsg = encodeURIComponent(
      `Halo Tim Prime Broadcast, saya ${customName || 'Klien'} ingin bertanya: "${customQuestion}"`
    );
    window.open(`https://wa.me/6285150555195?text=${textMsg}`, '_blank', 'noreferrer,noopener');
    
    setIsSubmitted(true);
    setCustomQuestion('');
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const isPoliciesMode = mode === 'policies' || mode === 'both';
  const isFaqMode = mode === 'faq' || mode === 'both';

  return (
    <div className="py-24 bg-black text-white text-left relative selection:bg-zinc-800 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================== ATURAN & KEBIJAKAN SECTION ==================== */}
        {isPoliciesMode && (
          <div className="mb-24 animate-in fade-in duration-500">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-405 uppercase">
                Regulasi & Kontrak Kerja
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-light mt-3 tracking-tight text-white">
                Aturan &amp; Kebijakan Vendor
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
                Demi kenyamanan bersama dan kelancaran livestreaming, mohon pahami 3 klausul khusus operasional serta kebijakan pembatalan kami di bawah ini.
              </p>
            </div>

            {/* Direct Cards for Triple Core Rules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Clause 1: Transport */}
              <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-xl flex flex-col justify-between hover:border-zinc-805 transition-all duration-300">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-zinc-90 w-9 h-9 border border-zinc-855 flex items-center justify-center text-zinc-400 mb-6">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-medium text-sm text-zinc-200 mb-2">
                    1. Transportasi &amp; Akomodasi
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Semua biaya pengiriman peralatan serta akomodasi personel tim penyiaran <b>ditanggung sepenuhnya oleh pihak klien</b>. Komponen ini akan dideklarasikan di awal dan ditambahkan di luar nilai paket dasar.
                  </p>
                </div>
                <div className="mt-8 pt-3 border-t border-zinc-900 text-[9px] text-zinc-650 font-mono tracking-widest">
                  BERLAKU RETRIBUSI LUAR JARAK
                </div>
              </div>

              {/* Clause 2: Sound & Screens */}
              <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-xl flex flex-col justify-between hover:border-zinc-805 transition-all duration-300">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-zinc-90 w-9 h-9 border border-zinc-855 flex items-center justify-center text-zinc-400 mb-6">
                    <MicOff className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-medium text-sm text-zinc-200 mb-2">
                    2. Batas Tanggung Jawab Audio
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Kami <b>tidak menyediakan sound system fisik ruangan ataupun LCD proyektor</b>. Tim kami hanya bertanggung jawab memproses sinyal audio master murni dari output sound mixer venue / vendor sound system Anda.
                  </p>
                </div>
                <div className="mt-8 pt-3 border-t border-zinc-900 text-[9px] text-zinc-650 font-mono tracking-widest">
                  INPUT AUDIO LINK DI VENUE
                </div>
              </div>

              {/* Clause 3: Overtime charges */}
              <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-xl flex flex-col justify-between hover:border-zinc-805 transition-all duration-300">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-zinc-90 w-9 h-9 border border-zinc-855 flex items-center justify-center text-zinc-400 mb-6">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-medium text-sm text-zinc-200 mb-2">
                    3. Biaya Lembur (Overtime)
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Jika durasi acara bertambah dari durasi paket sewa dasar (4 jam) dikarenakan mundurnya rundown atau permintaan insidental klien di lapangan, maka dikenakan <b>Biaya Overtime sebesar 15% per jam dari nilai paket dasar</b>.
                  </p>
                </div>
                <div className="mt-8 pt-3 border-t border-zinc-900 text-[9px] text-zinc-650 font-mono tracking-widest">
                  OTOMATIS DIHITUNG FORMAL
                </div>
              </div>

            </div>

            {/* Additional Policies Grid (Cancellation, Payments, Site requirements) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              
              {/* Payment & Cancellation Policies */}
              <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-zinc-900 border border-zinc-855 text-zinc-400 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-medium text-zinc-200 text-sm">
                    Sistem Pembayaran &amp; Pembatalan Schedule
                  </h4>
                </div>
                <ul className="space-y-4 text-xs text-zinc-500 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span><b>Downpayment (DP) 30%</b> wajib diselesaikan untuk mengunci ketersediaan tim dan mengamankan jadwal kalender vendor kami.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                    <span><b>Pelunasan Sisa Kontrak (70%)</b> paling lambat diselesaikan pada H-1 acara sebelum proses live penyiaran dimulai.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-855 flex items-center justify-center shrink-0 mt-0.5 text-[10px] text-zinc-400 font-mono">
                      i
                    </div>
                    <span><b>Aturan Refund Pelunasan:</b> Pembatalan di atas 14 hari sebelum hari-H mendapat pengembalian DP 100%. Pembatalan H-7 mendapatkan pengembalian DP 50%. Pembatalan di bawah H-3 membuat DP hangus secara sistem.</span>
                  </li>
                </ul>
              </div>

              {/* Host / Client Infrastructure Responsibilities */}
              <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-xl text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-zinc-900 border border-zinc-855 text-zinc-400 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-medium text-zinc-200 text-sm">
                    Liabilitas Listrik &amp; Jaringan Lokal
                  </h4>
                </div>
                <ul className="space-y-4 text-xs text-zinc-500 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-650 shrink-0 mt-2" />
                    <span><b>Pasokan Listrik Pilihan:</b> Klien wajib menjamin ketersediaan stopkontak listrik minimal <b>2000 Watt</b> yang stabil di meja operator penyiaran kami tanpa gangguan pembagian daya.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-650 shrink-0 mt-2" />
                    <span><b>Akses Broadband Internet:</b> Untuk streaming lancar tanpa buffering, wajib tersedia koneksi internet LAN rj45 dengan kecepatan unggah data (upload speed) minimal <b>20-30 Mbps</b> eksklusif.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-650 shrink-0 mt-2" />
                    <span><b>Timing Setup H-2 Jam:</b> Tim kami akan masuk lokasi venue tepat <b>H-2 jam</b> sebelum rundown diinstruksikan guna menguji kelayakan jalur, audio miring, dan trial broadcast statis.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* ==================== INTERACTIVE TANYA JAWAB (FAQ) SECTION ==================== */}
        {isFaqMode && (
          <div className="animate-in fade-in duration-500 pt-4">
            
            {/* Dedicated Hero Title when FAQ stands alone */}
            {mode === 'faq' && (
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                  Pusat Informasi &amp; Bantuan
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-light mt-3 tracking-tight text-white">
                  Tanya Jawab (FAQ) Interaktif
                </h2>
                <p className="text-zinc-500 text-xs sm:text-sm mt-3 max-w-lg mx-auto leading-relaxed">
                  Butuh jawaban cepat seputar persiapan, sistem encoding, redundancy failover berkabel, atau hasil recording? Cari di bawah ini.
                </p>
              </div>
            )}

            {/* SEARCH AND INTERACTIVE ACCORDION BOX */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-start ${mode === 'both' ? 'border-t border-zinc-900 pt-16' : ''}`}>
              
              {/* FAQ Left Sidebar: Search, Categorization, and Tips */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                
                {/* Search Bar Panel */}
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl">
                  <label className="block text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                    Cari Jawaban Cepat
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kata kunci teknis, paket, DP..."
                      className="w-full bg-black border border-zinc-855 rounded-lg px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-550 transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-650 absolute right-4.5 top-3.5" />
                  </div>
                  {searchQuery && (
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] text-zinc-500">
                        Hasil pencarian: <b className="text-zinc-350">{filteredFaqs.length}</b> pertanyaan
                      </span>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-[9px] text-[#aec6ff] hover:underline"
                      >
                        Hapus Filter
                      </button>
                    </div>
                  )}
                </div>

                {/* FAQ categories list navigation */}
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl">
                  <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-mono tracking-wider font-bold mb-4 uppercase">
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Saring Kategori</span>
                  </div>
                  
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setActiveFaqId(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-left text-xs font-medium tracking-wide transition-all border ${
                          selectedCategory === cat
                            ? 'bg-zinc-100 text-zinc-950 border-zinc-100 shadow-sm'
                            : 'bg-transparent text-zinc-500 border-transparent hover:text-zinc-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-500 leading-relaxed flex items-start gap-3">
                  <Info className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
                  <span>
                    Kebijakan khusus seperti overtime, downpayment, dan biaya transportasi diatur secara resmi di tab <b>Aturan &amp; Kebijakan</b> vendor.
                  </span>
                </div>
              </div>

              {/* FAQ Accordion Results and Submit Inquiry widget */}
              <div className="lg:col-span-7 flex flex-col gap-4 mt-2 lg:mt-0">
                
                <h3 className="text-xs font-mono tracking-wider text-zinc-500 uppercase border-b border-zinc-900 pb-3 mb-2">
                  Pertanyaan Terpopuler ({filteredFaqs.length})
                </h3>

                <div className="flex flex-col gap-2">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => {
                      const isOpen = activeFaqId === faq.id;

                      return (
                        <div 
                          key={faq.id}
                          className={`rounded-lg border transition-all duration-300 overflow-hidden ${
                            isOpen 
                              ? 'border-zinc-805 bg-zinc-950/40' 
                              : 'border-zinc-900 bg-zinc-950/10 hover:border-zinc-805'
                          }`}
                        >
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full px-5 py-3.5 text-left flex items-center justify-between gap-4 font-normal text-sm cursor-pointer"
                          >
                            <span className="text-zinc-250 hover:text-white text-xs sm:text-xs transition-colors leading-relaxed">
                              {faq.question}
                            </span>
                            <span className="text-zinc-650 shrink-0">
                              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-5 pt-1.5 text-zinc-550 text-xs sm:text-xs leading-relaxed border-t border-zinc-900 bg-zinc-950/60">
                              <p className="text-xs sm:text-xs leading-relaxed">{faq.answer}</p>
                              <div className="mt-4 flex items-center gap-1.5">
                                <span className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-500">
                                  Kategori: {faq.category}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-zinc-600 text-xs bg-zinc-950 border border-zinc-900 rounded-xl">
                      Tidak menemukan kata kunci "<b>{searchQuery}</b>" dalam kategori ini. Silakan cari kata kunci lain atau gunakan kategori "Semua".
                    </div>
                  )}
                </div>

                {/* INTERACTIVE QUESTION SUBMITTER FOR NEW Q&As */}
                <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl text-left mt-6">
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <HeartHandshake className="text-zinc-405 w-4.5 h-4.5 shrink-0" />
                    <h4 className="font-display font-medium text-xs text-zinc-200">
                      Punya Pertanyaan Khusus? Hubungi Tim Cepat
                    </h4>
                  </div>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                    Ketik pertanyaan atau skenario konfigurasi acara Anda di bawah ini, lalu kirimkan langsung guna berkonsultasi via WhatsApp bersama staf ahli operasional kami.
                  </p>

                  <form onSubmit={handleCustomSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Nama..."
                        className="sm:col-span-1 bg-black border border-zinc-855 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-zinc-550 text-zinc-200 placeholder:text-zinc-700 font-normal"
                      />
                      <input 
                        type="text" 
                        value={customQuestion}
                        onChange={(e) => {
                          setCustomQuestion(e.target.value);
                          setIsSubmitted(false);
                        }}
                        placeholder="Pertanyaan Anda (misal: bisakah live ditaruh di website privat?)..."
                        className="sm:col-span-2 bg-black border border-zinc-855 rounded-lg px-4 py-3 text-xs focus:outline-none focus:border-zinc-550 text-zinc-200 placeholder:text-zinc-700 font-normal"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-1.5">
                      {isSubmitted ? (
                        <span className="text-[10px] text-zinc-405 font-mono">
                          ✓ Mengalihkan ke live chat WhatsApp...
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-650 italic">
                          Pesan dikonversikan otomatis ke format WhatsApp resmi.
                        </span>
                      )}
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim via WhatsApp</span>
                      </button>
                    </div>
                  </form>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
