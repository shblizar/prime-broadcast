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
    <div className="py-12 bg-slate-950 text-white text-left relative selection:bg-blue-600 selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================== ATURAN & KEBIJAKAN SECTION ==================== */}
        {isPoliciesMode && (
          <div className="mb-14 animate-in fade-in duration-500">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-bold font-mono tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full uppercase border border-blue-500/20">
                Regulasi & Kontrak Kerja
              </span>
              <h2 className="text-3xl sm:text-4xl font-display font-black mt-3 bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                Aturan & Kebijakan Vendor
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
                Demi kenyamanan bersama dan kelancaran livestreaming, mohon pahami 3 klausul khusus operasional serta kebijakan pembatalan kami di bawah ini.
              </p>
            </div>

            {/* Direct Cards for Triple Core Rules */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* Clause 1: Transport */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-blue-500/15 hover:border-blue-500/30 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-base text-slate-150 mb-2">
                    1. Transportasi & Akomodasi
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Semua biaya pengiriman peralatan serta akomodasi personel tim penyiaran <b>ditanggung sepenuhnya oleh pihak klien</b>. Komponen ini akan dideklarasikan di awal dan ditambahkan di luar nilai paket dasar.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-mono tracking-wider">
                  BERLAKU RETRIBUSI LUAR JARAK
                </div>
              </div>

              {/* Clause 2: Sound & Screens */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-purple-500/15 hover:border-purple-500/30 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                    <MicOff className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-base text-slate-150 mb-2">
                    2. Batas Tanggung Jawab Audio
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kami <b>tidak menyediakan sound system fisik ruangan ataupun LCD proyektor</b>. Tim kami hanya bertanggung jawab memproses sinyal audio master murni dari output sound mixer venue / vendor sound system Anda.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-mono tracking-wider">
                  INPUT AUDIO LINK DI VENUE
                </div>
              </div>

              {/* Clause 3: Overtime charges */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-amber-500/15 hover:border-amber-500/30 transition-all duration-300">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-bold text-base text-slate-150 mb-2">
                    3. Biaya Lembur (Overtime)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Jika durasi acara bertambah dari durasi paket sewa dasar (4 jam) dikarenakan mundurnya rundown atau permintaan insidental klien di lapangan, maka dikenakan <b>Biaya Overtime sebesar 15% per jam dari nilai paket dasar</b>.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-mono tracking-wider">
                  OTOMATIS DIHITUNG FORMAL
                </div>
              </div>

            </div>

            {/* Additional Policies Grid (Cancellation, Payments, Site requirements) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              
              {/* Payment & Cancellation Policies */}
              <div className="glass-panel-heavy p-6 rounded-2xl border-white/5 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-black text-slate-100 text-base">
                    Sistem Pembayaran & Pembatalan Schedule
                  </h4>
                </div>
                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>Downpayment (DP) 30%</b> wajib diselesaikan untuk mengunci ketersediaan tim dan mengamankan jadwal kalender vendor kami.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>Pelunasan Sisa Kontrak (70%)</b> paling lambat diselesaikan pada H-1 acara sebelum proses live penyiaran dimulai.</span>
                  </li>
                  <li className="flex items-start gap-2.5-5">
                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-400">i</span>
                    </div>
                    <span><b>Aturan Refund Pelunasan:</b> Pembatalan di atas 14 hari sebelum hari-H mendapat pengembalian DP 100%. Pembatalan H-7 mendapatkan pengembalian DP 50%. Pembatalan di bawah H-3 membuat DP hangus secara sistem.</span>
                  </li>
                </ul>
              </div>

              {/* Host / Client Infrastructure Responsibilities */}
              <div className="glass-panel-heavy p-6 rounded-2xl border-white/5 text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-500/11 border border-amber-500/20 text-amber-500 rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-black text-slate-100 text-base">
                    Liabilitas Listrik & Jaringan Lokal
                  </h4>
                </div>
                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span><b>Pasokan Listrik Pilihan:</b> Klien wajib menjamin ketersediaan stopkontak listrik minimal <b>2000 Watt</b> yang stabil di meja operator penyiaran kami tanpa gangguan pembagian daya.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span><b>Akses Broadband Internet:</b> Untuk streaming lancar tanpa buffering, wajib tersedia koneksi internet LAN rj45 dengan kecepatan unggah data (upload speed) minimal <b>20-30 Mbps</b> eksklusif.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
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
              <div className="text-center max-w-3xl mx-auto mb-10">
                <span className="text-xs font-bold font-mono tracking-widest text-[#97bcff] bg-blue-600/10 px-3 py-1 rounded-full uppercase border border-blue-500/10">
                  Pusat Informasi & Bantuan
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-black mt-3">
                  Tanya Jawab (FAQ) Interaktif
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
                  Butuh jawaban cepat seputar persiapan, sistem encoding, redundancy failover berkabel, atau hasil recording? Cari di bawah ini.
                </p>
              </div>
            )}

            {/* SEARCH AND INTERACTIVE ACCORDION BOX */}
            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${mode === 'both' ? 'border-t border-white/5 pt-12' : ''}`}>
              
              {/* FAQ Left Sidebar: Search, Categorization, and Tips */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                
                {/* Search Bar Panel */}
                <div className="glass-panel p-5 rounded-2xl border-white/15">
                  <label className="block text-slate-300 text-xs font-mono font-bold uppercase tracking-wider mb-2.5">
                    Cari Jawaban Cepat
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kata kunci teknis, paket, DP..."
                      className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4.5 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
                  </div>
                  {searchQuery && (
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="text-[10px] text-slate-400">
                        Hasil pencarian: <b className="text-blue-400">{filteredFaqs.length}</b> pertanyaan
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
                <div className="glass-panel p-6 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span>Saring Berdasarkan Kategori</span>
                  </div>
                  
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setActiveFaqId(null);
                        }}
                        className={`px-4 py-2.5 lg:py-3 rounded-xl text-left text-xs font-semibold uppercase tracking-wider transition-all border ${
                          selectedCategory === cat
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : 'bg-white/[0.01] text-slate-400 border-white/5 hover:bg-white/[0.03] hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-slate-400 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Kebijakan khusus seperti overtime, downpayment, dan biaya transportasi diatur secara resmi di tab <b>Aturan & Kebijakan</b> vendor.
                  </span>
                </div>
              </div>

              {/* FAQ Accordion Results and Submit Inquiry widget */}
              <div className="lg:col-span-7 flex flex-col gap-4 mt-2 lg:mt-0">
                
                <h3 className="text-lg font-display font-bold text-slate-200 border-b border-white/5 pb-2">
                  Pertanyaan Terpopuler ({filteredFaqs.length})
                </h3>

                <div className="flex flex-col gap-3">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => {
                      const isOpen = activeFaqId === faq.id;

                      return (
                        <div 
                          key={faq.id}
                          className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                            isOpen 
                              ? 'border-blue-500/40 bg-blue-950/10' 
                              : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                          }`}
                        >
                          <button
                            onClick={() => toggleFaq(faq.id)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base cursor-pointer"
                          >
                            <span className="text-slate-100 hover:text-white text-xs sm:text-sm transition-colors leading-relaxed">
                              {faq.question}
                            </span>
                            <span className="text-slate-400 shrink-0">
                              {isOpen ? <ChevronUp className="w-4.5 h-4.5 text-blue-400" /> : <ChevronDown className="w-4.5 h-4.5" />}
                            </span>
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-5 pt-1.5 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/5 bg-slate-950/40">
                              <p className="text-xs sm:text-sm">{faq.answer}</p>
                              <div className="mt-3.5 flex items-center gap-1.5">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5">
                                  Kategori: {faq.category}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs sm:text-sm glass-panel border-white/5 rounded-xl">
                      Tidak menemukan kata kunci "<b>{searchQuery}</b>" dalam kategori ini. Silakan cari kata kunci lain atau gunakan kategori "Semua".
                    </div>
                  )}
                </div>

                {/* INTERACTIVE QUESTION SUBMITTER FOR NEW Q&As */}
                <div className="glass-panel p-6 rounded-2xl border-white/5 text-left mt-4">
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <HeartHandshake className="text-emerald-400 w-5 h-5 shrink-0" />
                    <h4 className="font-display font-bold text-sm text-slate-100">
                      Punya Pertanyaan Khusus? Hubungi Tim Cepat
                    </h4>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Ketik pertanyaan atau skenario konfigurasi acara Anda di bawah ini, lalu kirimkan langsung guna berkonsultasi via WhatsApp bersama staf ahli operasional kami.
                  </p>

                  <form onSubmit={handleCustomSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input 
                        type="text" 
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Nama koordinator..."
                        className="sm:col-span-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input 
                        type="text" 
                        value={customQuestion}
                        onChange={(e) => {
                          setCustomQuestion(e.target.value);
                          setIsSubmitted(false);
                        }}
                        placeholder="Pertanyaan Anda (misal: bisakah live ditaruh di website privat?)..."
                        className="sm:col-span-2 bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-1">
                      {isSubmitted ? (
                        <span className="text-[10px] text-green-400 font-medium">
                          ✓ Terkirim! Mengalihkan ke live chat WhatsApp...
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          Pesan dikonversikan otomatis ke format WhatsApp.
                        </span>
                      )}
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
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

