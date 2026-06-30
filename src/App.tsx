import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PricingCalculator from './components/PricingCalculator';
import BookingForm from './components/BookingForm';
import FaqSection from './components/FaqSection';
import ContactSection from './components/ContactSection';
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
  
  // Configured booking parameters
  const [configuredPkg, setConfiguredPkg] = useState<StreamPackage>(PACKAGES[1]); // Default to regular
  const [durationHours, setDurationHours] = useState<number>(4);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [addOnsMap, setAddOnsMap] = useState<{ [id: string]: number }>({});
  const [selectedCameraId, setSelectedCameraId] = useState<string>('nx100');
  const [selectedCameraCount, setSelectedCameraCount] = useState<number>(1);
  const [preselectedDate, setPreselectedDate] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; packageId?: string } | null>(null);

  // Anchor target inside a view (e.g. 'refund' inside the policies view),
  // set by Footer links so the destination section can scroll itself
  // into view once it has mounted.
  const [pendingAnchor, setPendingAnchor] = useState<string | null>(null);

  const handleNavigateAnchor = (view: string, anchor?: string) => {
    setCurrentView(view);
    setPendingAnchor(anchor || null);
  };

  // Auto-scroll to top of the new view every time currentView changes,
  // so users land directly on the section instead of staying at their
  // previous scroll position and having to scroll manually. Skipped when
  // a specific in-page anchor is pending — that scroll is handled by the
  // target section itself (see FaqSection's scrollToAnchor prop).
  useEffect(() => {
    if (pendingAnchor) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, pendingAnchor]);
  
  // Transition to Booking and set parameters
  const handlePackageConfiguredChange = (
    pkg: StreamPackage, 
    duration: number, 
    overtime: number, 
    addOns: { [id: string]: number },
    voucher?: { code: string; discount: number; packageId?: string } | null,
    cameraId: string = 'nx100',
    cameraCount: number = 1
  ) => {
    setConfiguredPkg(pkg);
    setDurationHours(duration);
    setOvertimeHours(overtime);
    setAddOnsMap(addOns);
    setAppliedVoucher(voucher || null);
    setSelectedCameraId(cameraId);
    setSelectedCameraCount(cameraCount);
    setCurrentView('checkout'); // Redirect to Checkout section
  };

  const handleResetConfiguration = () => {
    setCurrentView('pricing');
    setOvertimeHours(0);
    setAddOnsMap({});
    setSelectedCameraId('nx100');
    setSelectedCameraCount(1);
    setAppliedVoucher(null);
  };

  const handleLiveChatTriggers = () => {
    const textMsg = encodeURIComponent("Halo, saya tertarik berkonsultasi mengenai paket live streaming Prime Broadcast.");
    window.open(`https://wa.me/6285150555195?text=${textMsg}`, '_blank', 'noreferrer,noopener');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col justify-between selection:bg-zinc-800 selection:text-white">
      
      {/* Persistent top navbar */}
      <Navbar currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Container Views Rendering */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME/BERANDA */}
        {currentView === 'home' && (
          <div className="animate-in fade-in duration-300">
            {/* Upper landing banner with all 4 premium sections (Hero, Bento Gear, Roles, Venue Flow) */}
            <Hero onViewChange={setCurrentView} />

            {/* CALL TO ACTION BANNER */}
            <section className="py-24 border-t border-zinc-900 relative overflow-hidden bg-zinc-950">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                
                <div className="bg-black border border-zinc-900 p-8 sm:p-12 rounded-3xl text-center flex flex-col items-center gap-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-full text-[10px] font-mono text-zinc-400">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>TIM KAMI AKAN DATANG LEBIH AWAL UNTUK SETUP STERIL H-2 JAM</span>
                  </div>
                  
                  <h3 className="text-2xl sm:text-3xl font-display font-light max-w-xl leading-tight text-white tracking-tight">
                    Siap Menyajikan Pengalaman Penyiaran Terbaik?
                  </h3>
                  
                  <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
                    Gunakan Prime Broadcast untuk menyiarkan rapat umum, wisuda akademi, peluncuran produk atau konser live Anda tanpa rasa was-was.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center w-full sm:w-auto">
                    <button
                      onClick={() => setCurrentView('pricing')}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-zinc-950 font-medium px-8 py-3.5 rounded-lg transition-all duration-300 shadow-md active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
                    >
                      <span>Konfigurasi Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={handleLiveChatTriggers}
                      className="flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-350 border border-zinc-855 px-8 py-3.5 rounded-lg font-medium transition-all duration-300 active:scale-95 text-xs uppercase tracking-wider"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Hubungi Konsultan</span>
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
              selectedCameraId={selectedCameraId}
              selectedCameraCount={selectedCameraCount}
              appliedVoucher={appliedVoucher}
              onVoucherChange={setAppliedVoucher}
              onReset={handleResetConfiguration}
              preselectedDate={preselectedDate}
              onViewChange={setCurrentView}
            />
          </div>
        )}

        {/* VIEW 4: POLICIES CLASSIFICATIONS */}
        {currentView === 'policies' && (
          <div className="animate-in fade-in duration-300">
            <FaqSection 
              mode="policies" 
              scrollToAnchor={pendingAnchor} 
              onAnchorScrolled={() => setPendingAnchor(null)} 
            />
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
      <Footer onViewChange={setCurrentView} onNavigateAnchor={handleNavigateAnchor} />

    </div>
  );
}
