import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PricingCalculator from './components/PricingCalculator';
import BookingForm from './components/BookingForm';
import FaqSection from './components/FaqSection';
import ContactSection from './components/ContactSection';
import CalendarSection from './components/CalendarSection';
import Footer from './components/Footer';
import { StreamPackage } from './types';
import { PACKAGES, REVIEWS } from './data';
import { 
  Tv, 
  Activity, 
  Layers, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  MapPin, 
  Mic, 
  Laptop, 
  ArrowRight,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const handleViewChange = (view: string) => {
  setCurrentView(view);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
  
  // Configured booking parameters
  const [configuredPkg, setConfiguredPkg] = useState<StreamPackage>(PACKAGES[1]); // Default to regular
  const [durationHours, setDurationHours] = useState<number>(4);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [addOnsMap, setAddOnsMap] = useState<{ [id: string]: number }>({});
  const [preselectedDate, setPreselectedDate] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; packageId?: string } | null>(null);
  
  // Transition to Booking and set parameters
  const handlePackageConfiguredChange = (
    pkg: StreamPackage, 
    duration: number, 
    overtime: number, 
    addOns: { [id: string]: number },
    voucher?: { code: string; discount: number; packageId?: string } | null
  ) => {
    setConfiguredPkg(pkg);
    setDurationHours(duration);
    setOvertimeHours(overtime);
    setAddOnsMap(addOns);
    setAppliedVoucher(voucher || null);
    setCurrentView('checkout'); // Redirect to Checkout section
  };

  const handleResetConfiguration = () => {
    setCurrentView('pricing');
    setOvertimeHours(0);
    setAddOnsMap({});
    setAppliedVoucher(null);
  };

  const handleLiveChatTriggers = () => {
    const textMsg = encodeURIComponent("Halo, saya tertarik berkonsultasi mengenai paket live streaming Prime Broadcast.");
    window.open(`https://wa.me/6285150555195?text=${textMsg}`, '_blank', 'noreferrer,noopener');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Persistent top navbar */}
      <Navbar currentView={currentView} onViewChange={handleViewChange} />

      {/* Main Container Views Rendering */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME/BERANDA */}
        {currentView === 'home' && (
          <div className="animate-in fade-in duration-300">
            {/* Upper landing banner */}
            <Hero onViewChange={handleViewChange} />

            {/* BENTO GRID OF CORE JASA CAPABILITIES */}
            <section className="py-16 border-t border-white/5 relative bg-slate-950/40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-3xl mx-auto mb-14">
                  <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1.5 rounded-full inline-block">
                    Keandalan Infrastruktur Siaran
                  </span>
                  <h2 className="text-3xl font-display font-extrabold tracking-tight mt-4">
                    Mengapa Memilih Prime Broadcast?
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-3">
                    Kami memadukan perangkat keras kelas broadcast andal dengan redundansi jaringan ganda untuk memastikan siaran berjalan tanpa hambatan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  
                  {/* Bento unit 1: Ultra High fidelity video */}
                  <div className="md:col-span-3 glass-panel p-6 rounded-2xl border-white/10 text-left flex flex-col justify-between hover:border-blue-500/30 transition-colors">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-400 mb-5">
                        <Tv className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-100 mb-2">
                        Video Output Jernih Full HD
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Menggunakan sensor sensor sirkuit professional Sony & Panasonic dengan high-bitrate encoding untuk menghasilkan gambar tajam tanpa artefak piksel, ideal untuk ditayangkan langsung di layar besar panggung maupun platform streaming publik.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-slate-500 uppercase font-mono text-[10px]">
                      <span>MAX RESOLUTION 1080P/4K</span>
                      <span className="text-blue-400">HARDWARE ENCODED</span>
                    </div>
                  </div>

                  {/* Bento unit 2: Multistream cloud */}
                  <div className="md:col-span-3 glass-panel p-6 rounded-2xl border-white/10 text-left flex flex-col justify-between hover:border-purple-500/30 transition-colors">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-600/20 flex items-center justify-center text-purple-400 mb-5">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-100 mb-2">
                        Siaran Simultan Multi-Platform
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Tayangkan acara Anda ke YouTube, Zoom Webinar, dan TikTok sekaligus tanpa mengurangi bandwidth internet lokal. Layanan server restream mumpuni mendistribusikan feed utama ke berbagai kanal secara realtime.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-slate-500 uppercase font-mono text-[10px]">
                      <span>MULTI-CLOUD DISTRIBUTION</span>
                      <span className="text-purple-400">RESTREAM READY</span>
                    </div>
                  </div>

                  {/* Bento unit 3: Bonding failover redundant (wider col) */}
                  <div className="md:col-span-4 glass-panel p-6 rounded-2xl border-white/10 text-left flex flex-col justify-between hover:border-indigo-500/30 transition-colors">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400 mb-5">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-slate-100 mb-2">
                        Network Bonding Failover System
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        Kami paham ketakutan terbesar live stream adalah koneksi drop. Melalui opsi modem bonding khusus, kami menggabungkan sinyal seluler dari 3 provider GSM berbeda untuk menciptakan backup redundancy line terpadu. Siaran tetap lancar meski internet utama venue bermasalah.
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-slate-500 uppercase font-mono text-[10px]">
                      <span>BACKUP FAILOVER REDUNDANCY</span>
                      <span className="text-indigo-400">TRIPLE LINE PROTOC</span>
                    </div>
                  </div>

                  {/* Bento unit 4: Sound converter direct input */}
                  <div className="md:col-span-2 glass-panel p-6 rounded-2xl border-white/10 text-left flex flex-col justify-between hover:border-amber-500/30 transition-colors">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-500 mb-5">
                        <Mic className="w-5 h-5" />
                      </div>
                      <h3 className="font-display font-bold text-base text-slate-100 mb-1">
                        Direct Audio Link Mixer
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Mengonversi sinyal audio analog maupun digital panggung agar tersaring bersih masuk ke komputer encoder, mengeliminasi dengung (ground loop noise) luar ruangan.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-slate-500 uppercase font-mono text-[9px]">
                      <span>XLR/TRS CONVERTERS</span>
                      <span className="text-amber-500">GLITCH FREE</span>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* TESTIMONIAL CLIENT REVIEWS COMPONENT */}
            <section className="py-16 border-t border-white/5 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <span className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 px-3 py-1 rounded-full">
                    Saksi Ketenangan Klien
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight mt-4">
                    Tanggapan Pengguna Jasa Kami
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {REVIEWS.map((review) => (
                    <div 
                      key={review.id}
                      className="glass-panel p-6 rounded-2xl text-left border-white/5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex gap-1 mb-4 text-amber-400 text-sm">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                          "{review.comment}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5 pt-4 border-t border-white/5">
                        <img 
                          src={review.avatarUrl} 
                          alt={review.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10"
                        />
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-slate-100 block">
                            {review.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {review.role} • {review.company}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>

            {/* CALL TO ACTION BANNER */}
            <section className="py-16 border-t border-white/5 relative overflow-hidden bg-slate-900/10">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                
                <div className="glass-panel p-8 sm:p-12 rounded-3xl border-blue-500/20 text-center flex flex-col items-center gap-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/15 border border-blue-500/30 rounded-full text-xs font-mono font-bold text-blue-400 animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TIM KAMI AKAN DATANG H-2 JAM DI VENUE UNTUK SETUP</span>
                  </div>
                  
                  <h3 className="text-3xl sm:text-4xl font-display font-black max-w-2xl leading-tight">
                    Siap Mengudara Bersama Jasa Live Streaming Terbaik?
                  </h3>
                  
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
                    Jangan pertaruhkan siaran korporat atau seminar penting Anda pada koneksi internet minim atau setup kamera single. Gunakan Prime Broadcast untuk jaminan kelancaran total.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                    <button
                      onClick={() => handleViewChange('pricing')}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer"
                    >
                      <span>Mulai Atur Paket Anda</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                    
                    <button
                      onClick={handleLiveChatTriggers}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 px-8 py-3.5 rounded-xl font-semibold transition-all active:scale-95"
                    >
                      <MessageSquare className="w-4.5 h-4.5 text-green-400" />
                      <span>Hubungi Tim Cepat</span>
                    </button>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: PACKAGES & LIVE ESTIMATOR */}
        {currentView === 'pricing' && (
          <div className="animate-in fade-in duration-300">
            <PricingCalculator 
              onPackageSelect={handlePackageConfiguredChange} 
              appliedVoucherGlobal={appliedVoucher}
            />
          </div>
        )}

        {/* VIEW 3: DISPATCH / FORM PREVIEW & CHECKOUT INVOICE */}
        {currentView === 'checkout' && (
          <div className="animate-in fade-in duration-300">
            <BookingForm 
              selectedPkg={configuredPkg} 
              selectedDuration={durationHours}
              selectedOvertimeHours={overtimeHours}
              selectedAddOns={addOnsMap}
              appliedVoucher={appliedVoucher}
              onVoucherChange={setAppliedVoucher}
              onReset={handleResetConfiguration}
              preselectedDate={preselectedDate}
              onViewChange={setCurrentView}
            />
          </div>
        )}

        {/* VIEW: INTERACTIVE CALENDAR & SCHEDULE */}
        {currentView === 'schedule' && (
          <div className="animate-in fade-in duration-300">
            <CalendarSection 
              onSelectAvailableDate={setPreselectedDate} 
              onViewChange={setCurrentView} 
            />
          </div>
        )}

        {/* VIEW 4: POLICIES CLASSIFICATIONS */}
        {currentView === 'policies' && (
          <div className="animate-in fade-in duration-300">
            <FaqSection mode="policies" />
          </div>
        )}

        {/* VIEW 5: FAQS ACCORDION DIRECT */}
        {currentView === 'faq' && (
          <div className="animate-in fade-in duration-300">
            <FaqSection mode="faq" />
          </div>
        )}

        {/* VIEW 6: DISPATCH CONTACT HANDLES */}
        {currentView === 'contact' && (
          <div className="animate-in fade-in duration-300">
            <ContactSection />
          </div>
        )}

      </main>

      {/* Footer component */}
      <Footer onViewChange={handleViewChange} />

    </div>
  );
}
