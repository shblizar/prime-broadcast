import React, { useState, useMemo } from 'react';
import { PACKAGES, ADD_ONS } from '../data';
import { StreamPackage, AddOnOption } from '../types';
import { 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  FileText, 
  ChevronDown, 
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';

interface PricingCalculatorProps {
  onPackageSelect: (
    pkg: StreamPackage, 
    duration: number, 
    overtimeHours: number, 
    selectedAddOns: { [id: string]: number },
    appliedVoucher?: { code: string; discount: number } | null
  ) => void;
  initialPackageId?: string;
  appliedVoucherGlobal?: { code: string; discount: number } | null;
}

export default function PricingCalculator({ onPackageSelect, initialPackageId = 'regular', appliedVoucherGlobal = null }: PricingCalculatorProps) {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(initialPackageId);
  const [durationPreset, setDurationPreset] = useState<4 | 6>(4);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [addOnQuantities, setAddOnQuantities] = useState<{ [id: string]: number }>({});
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  // Voucher Code state
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(appliedVoucherGlobal);
  const [voucherError, setVoucherError] = useState<string>('');
  const [voucherSuccess, setVoucherSuccess] = useState<string>('');
  const [loadingVoucher, setLoadingVoucher] = useState<boolean>(false);

  // Validate voucher in real-time as requested
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setLoadingVoucher(true);
    setVoucherError('');
    setVoucherSuccess('');
    try {
      const res = await fetch('/vouchers.json');
      if (!res.ok) {
        throw new Error('Gagal memuat kupon dari server');
      }
      const vouchers = await res.json();
      const codeUpper = voucherCode.trim().toUpperCase();
      const match = vouchers.find((v: any) => v.code.toUpperCase() === codeUpper);
      
      if (match) {
        setAppliedVoucher({ code: match.code, discount: Number(match.discount) });
        setVoucherSuccess(`Berhasil pasang kupon: ${match.code} (Diskon ${match.discount}%)`);
        setVoucherCode('');
      } else {
        setVoucherError('Kode voucher tidak valid atau kedaluwarsa');
        setAppliedVoucher(null);
      }
    } catch (err) {
      setVoucherError('Gagal memvalidasi kode voucher.');
      console.error(err);
    } finally {
      setLoadingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherSuccess('');
    setVoucherError('');
  };

  // Badge Customizer dynamic states
  const [badgeConfigs, setBadgeConfigs] = useState<{
    [pkgId: string]: {
      text: string;
      textSize: number;
      paddingX: number;
      paddingY: number;
      posX: 'left' | 'right';
      posY: 'top' | 'bottom';
      topOffset: number;
      bottomOffset: number;
      leftOffset: number;
      rightOffset: number;
      colorBg: string;
      colorText: string;
      borderRadius: number;
    }
  }>({
    lite: { text: 'Starter Choice', textSize: 10, paddingX: 8, paddingY: 2, posX: 'right', posY: 'top', topOffset: 12, bottomOffset: 12, leftOffset: 12, rightOffset: 12, colorBg: '#2563eb', colorText: '#ffffff', borderRadius: 4 },
    regular: { text: 'Creator Choice', textSize: 10, paddingX: 8, paddingY: 2, posX: 'right', posY: 'top', topOffset: 12, bottomOffset: 12, leftOffset: 12, rightOffset: 12, colorBg: '#3b82f6', colorText: '#ffffff', borderRadius: 4 },
    gold: { text: 'Best Choice', textSize: 10, paddingX: 10, paddingY: 3, posX: 'right', posY: 'top', topOffset: 12, bottomOffset: 12, leftOffset: 12, rightOffset: 12, colorBg: '#f59e0b', colorText: '#0f172a', borderRadius: 6 },
    platinum: { text: 'Supreme Event Solutions', textSize: 10, paddingX: 8, paddingY: 2, posX: 'right', posY: 'top', topOffset: 12, bottomOffset: 12, leftOffset: 12, rightOffset: 12, colorBg: '#9333ea', colorText: '#ffffff', borderRadius: 4 },
  });

  const [activeDesignPkgId, setActiveDesignPkgId] = useState<string>('gold');
  const [showBadgeDesigner, setShowBadgeDesigner] = useState<boolean>(true);

  // Retrieve current active package based on selection ID
  const selectedPackage = useMemo(() => {
    return PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[1];
  }, [selectedPkgId]);

  // Initial setup for add-on quantities
  const handleAddOnQuantityChange = (id: string, delta: number, max: number) => {
    setAddOnQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [id]: next };
    });
  };

  // Helper function to format IDR currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Dynamic calculations
  const calculations = useMemo(() => {
    const basePrice = selectedPackage.rates[durationPreset];
    const base4hPrice = selectedPackage.rates[4];
    
    // Policy rule: Overtime hourly cost is 15% of the base 4h pricing per hour
    const hourlyOvertimePrice = base4hPrice * 0.15;
    const totalOvertimeCost = hourlyOvertimePrice * overtimeHours;

    // Custom Addons cost evaluation
    let totalAddOnsCost = 0;
    const activeAddOnsList: any[] = [];

    ADD_ONS.forEach(addon => {
      const qty = addOnQuantities[addon.id] || 0;
      if (qty > 0) {
        const cost = addon.price * qty;
        totalAddOnsCost += cost;
        activeAddOnsList.push({
          ...addon,
          quantity: qty,
          totalPrice: cost
        });
      }
    });

    const subtotal = basePrice + totalOvertimeCost + totalAddOnsCost;
    const discountAmount = appliedVoucher ? Math.round((subtotal * appliedVoucher.discount) / 100) : 0;
    const finalTotal = subtotal - discountAmount;
    
    return {
      basePrice,
      hourlyOvertimePrice,
      totalOvertimeCost,
      totalAddOnsCost,
      activeAddOnsList,
      subtotal,
      discountAmount,
      finalTotal
    };
  }, [selectedPackage, durationPreset, overtimeHours, addOnQuantities, appliedVoucher]);

  const handleBookingRedirect = () => {
    onPackageSelect(selectedPackage, durationPreset, overtimeHours, addOnQuantities, appliedVoucher);
  };

  return (
    <div className="py-12 text-white bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold uppercase mb-4">
            <Sliders className="w-3.5 h-3.5" />
            <span>Kalkulator & Konfigurator Live</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight mb-4">
            Sesuaikan Paket Livestream Anda
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Pilih paket broadcasting dasar di bawah, lalu tambahkan kamera ekstra, wireless system, atau tambahan jam kerja sesuai kebutuhan operasional event Anda.
          </p>
        </div>

        {/* STEP 1: Main Base Package CARDS */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-bold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-600/20 text-blue-400 text-xs">1</span>
              Pilih Paket Utama
            </h3>
            
            {/* Quick Pricing Switcher Duration */}
            <div className="flex bg-slate-900 border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => {
                  setDurationPreset(4);
                  // Reset overtime if changing preset for accuracy
                  setOvertimeHours(0);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  durationPreset === 4
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Durasi 4 Jam
              </button>
              <button
                onClick={() => {
                  setDurationPreset(6);
                  setOvertimeHours(0);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  durationPreset === 6
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Durasi 6 Jam
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PACKAGES.map((pkg) => {
              const offersRates = pkg.rates[durationPreset];
              const isSelected = selectedPkgId === pkg.id;
              const isGold = pkg.id === 'gold';
              const badgeConfig = badgeConfigs[pkg.id] || { 
                text: pkg.badge, 
                textSize: 10, 
                paddingX: 8, 
                paddingY: 2, 
                posX: 'right', 
                posY: 'top', 
                topOffset: 12, 
                bottomOffset: 12, 
                leftOffset: 12, 
                rightOffset: 12, 
                colorBg: isGold ? '#f59e0b' : (pkg.highlighted ? '#9333ea' : '#2563eb'), 
                colorText: isGold ? '#0f172a' : '#ffffff', 
                borderRadius: isGold ? 6 : 4 
              };

              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPkgId(pkg.id);
                    setOvertimeHours(0); // clear custom overtime on pkg swap
                  }}
                  className={`relative rounded-2xl p-6 cursor-pointer border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                    isGold
                      ? isSelected
                        ? 'border-amber-400 bg-amber-950/20 ring-2 ring-amber-400/40 shadow-[0_0_35px_rgba(245,158,11,0.35)] shadow-amber-500/30'
                        : 'border-amber-500/40 bg-amber-950/10 hover:border-amber-400/60 hover:bg-amber-950/15 shadow-[0_0_20px_rgba(245,158,11,0.15)] shadow-amber-500/10'
                      : isSelected
                        ? pkg.highlighted 
                          ? 'border-purple-500 bg-purple-950/15 ring-2 ring-purple-500/20 shadow-purple-500/10 shadow-2xl'
                          : 'border-blue-500 bg-blue-950/20 ring-2 ring-blue-500/20 shadow-blue-500/10 shadow-2xl'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                  id={`calc-pkg-${pkg.id}`}
                >
                  {badgeConfig.text && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: badgeConfig.posY === 'top' ? `${badgeConfig.topOffset}px` : 'auto',
                        bottom: badgeConfig.posY === 'bottom' ? `${badgeConfig.bottomOffset}px` : 'auto',
                        left: badgeConfig.posX === 'left' ? `${badgeConfig.leftOffset}px` : 'auto',
                        right: badgeConfig.posX === 'right' ? `${badgeConfig.rightOffset}px` : 'auto',
                        fontSize: `${badgeConfig.textSize}px`,
                        paddingLeft: `${badgeConfig.paddingX}px`,
                        paddingRight: `${badgeConfig.paddingX}px`,
                        paddingTop: `${badgeConfig.paddingY}px`,
                        paddingBottom: `${badgeConfig.paddingY}px`,
                        backgroundColor: badgeConfig.colorBg,
                        color: badgeConfig.colorText,
                        borderRadius: `${badgeConfig.borderRadius}px`,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {badgeConfig.text}
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="mb-4">
                      <span className="text-xs text-slate-400 block font-mono uppercase tracking-widest mb-1">
                        Paket Digital
                      </span>
                      <h4 className="text-xl font-display font-extrabold">{pkg.name}</h4>
                    </div>

                    {/* Price Tag */}
                    <div className="mb-4 pt-2 border-t border-white/5">
                      <div className="text-2xl font-mono font-black text-white">
                        {formatIDR(offersRates)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        durasi utama {durationPreset} jam ({pkg.camerasCount} kamera)
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-5">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Highlights Spec tags */}
                  <div className="border-t border-white/5 pt-4 mt-auto">
                    <div className="flex flex-col gap-2.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span>{pkg.camerasCount}x Kamera Pro Terpasang</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        <span>Kru & Operator Siaga</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkmark ring icon */}
                  {isSelected && (
                    <div className={`absolute bottom-3 right-3 p-1 rounded-full ${
                      isGold ? 'bg-amber-500 text-slate-950 stroke-[3]' : 'bg-blue-500 text-white'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Suggestion Card for savings */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 flex flex-col sm:flex-row items-center gap-3.5 mb-10 text-left">
          <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-blue-300 text-sm block">Tips Penghematan Anggaran Broadcast</span>
            <span className="text-xs text-slate-300 leading-relaxed">
              Memilih preset durasi <b>6 Jam Utama</b> memberikan potongan harga yang jauh lebih murah dibanding menyewa durasi 4 Jam dan menambah overtime 2 jam secara terpisah.
            </span>
          </div>
        </div>

        {/* STEP 2: Custom Overtime Hours & Optional Addons Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Custom controls (Overtime slider & Custom Equipment list) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Live Slider for Overtime hours */}
            <div className="glass-panel p-6 rounded-2xl text-left">
              <h3 className="text-base font-display font-bold flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-5.5 h-5.5 rounded-md bg-blue-600/20 text-blue-400 text-xs">2</span>
                Tambahan Durasi Overtime (Jam)
              </h3>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-slate-400 text-xs">
                  Biaya Overtime: <span className="font-bold text-white font-mono">15% per jam</span> dari paket dasar 4 jam.
                </div>
                <div className="text-3xl font-mono font-black text-blue-400">
                  +{overtimeHours} Jam
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="8"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-slate-900 rounded-lg appearance-none h-2 cursor-pointer mb-3"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Mulai (0 Jam)</span>
                <span>+2 Jam</span>
                <span>+4 Jam</span>
                <span>+6 Jam</span>
                <span>Maks (+8 Jam)</span>
              </div>

              {overtimeHours > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex justify-between items-center font-mono">
                  <span>Estimasi Biaya Overtime Jam Kerja:</span>
                  <span className="font-bold">{formatIDR(calculations.totalOvertimeCost)}</span>
                </div>
              )}
            </div>

            {/* Live Addon Custom Checklist options */}
            <div className="glass-panel p-6 rounded-2xl text-left">
              <h3 className="text-base font-display font-bold flex items-center gap-2 mb-5">
                <span className="flex items-center justify-center w-5.5 h-5.5 rounded-md bg-blue-600/20 text-blue-400 text-xs">3</span>
                Pilih Add-on Tambahan (Opsional)
              </h3>

              <div className="flex flex-col gap-4">
                {ADD_ONS.map((addon) => {
                  const currentQty = addOnQuantities[addon.id] || 0;
                  
                  return (
                    <div 
                      key={addon.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                        currentQty > 0 
                          ? 'border-blue-500/40 bg-blue-950/10' 
                          : 'border-white/5 bg-white/[0.01]'
                      }`}
                    >
                      <div className="max-w-md pr-4 mb-3 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">{addon.name}</span>
                          <span className="text-[10px] bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded text-slate-400">
                            {formatIDR(addon.price)} / {addon.unit}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {addon.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          onClick={() => handleAddOnQuantityChange(addon.id, -1, addon.maxQty)}
                          disabled={currentQty === 0}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/15 bg-slate-900 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-sm">
                          {currentQty}
                        </span>
                        <button
                          onClick={() => handleAddOnQuantityChange(addon.id, 1, addon.maxQty)}
                          disabled={currentQty >= addon.maxQty}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/15 bg-slate-900 text-blue-400 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Dynamic Quote Summary Sidebar Panel */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 glass-panel p-6 rounded-2xl flex flex-col justify-between border-blue-500/20 text-left h-fit bg-slate-900/40 shadow-xl">
              
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                      Ringkasan Konfigurasi
                    </span>
                    <h4 className="text-lg font-display font-bold text-white">Live Invoice</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
                    ESTIMASI BIAYA
                  </span>
                </div>

                {/* Selected Package Info */}
                <div className="flex justify-between items-start text-sm mb-3">
                  <div>
                    <span className="font-extrabold text-slate-200 uppercase tracking-tight block">
                      {selectedPackage.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      Paket Siaran ({durationPreset} Jam Utama)
                    </span>
                  </div>
                  <span className="font-mono font-semibold text-white">
                    {formatIDR(calculations.basePrice)}
                  </span>
                </div>

                {/* Overtime Info */}
                {overtimeHours > 0 && (
                  <div className="flex justify-between items-start text-sm mb-3 border-t border-white/5 pt-2">
                    <div>
                      <span className="font-semibold text-slate-200 block">
                        Extra Overtime ({overtimeHours} Jam)
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatIDR(calculations.hourlyOvertimePrice)} / jam
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-white">
                      {formatIDR(calculations.totalOvertimeCost)}
                    </span>
                  </div>
                )}

                {/* AddOns listing details */}
                {calculations.activeAddOnsList.length > 0 && (
                  <div className="border-t border-white/5 pt-3 mb-3">
                    <span className="text-xs text-slate-400 font-bold block uppercase mb-1.5">
                      Tambahan Add-On:
                    </span>
                    {calculations.activeAddOnsList.map((addon) => (
                      <div key={addon.id} className="flex justify-between text-xs text-slate-300 mb-2 pl-2 border-l border-blue-500/40">
                        <span>
                          {addon.name} <b>(x{addon.quantity})</b>
                        </span>
                        <span className="font-mono">
                          {formatIDR(addon.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voucher Discount Info Row */}
                {appliedVoucher && (
                  <div className="flex justify-between items-start text-sm mb-3 border-t border-white/5 pt-2">
                    <div>
                      <span className="font-bold text-green-400 block font-sans">
                        Potongan Voucher ({appliedVoucher.code})
                      </span>
                      <span className="text-xs text-slate-400 font-sans">
                        Diskon {appliedVoucher.discount}% dari Subtotal
                      </span>
                    </div>
                    <span className="font-mono font-bold text-green-400">
                      -{formatIDR(calculations.discountAmount)}
                    </span>
                  </div>
                )}

                {/* Voucher Input and Application Panel */}
                <div className="border-t border-white/5 pt-3.5 mt-3">
                  <span className="text-xs text-slate-400 font-bold block uppercase mb-1.5 font-sans">
                    Kupon Voucher Diskon:
                  </span>
                  
                  {appliedVoucher ? (
                    <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between text-xs mb-2 transition-all">
                      <div className="flex flex-col text-left">
                        <span className="font-mono font-bold text-green-400 uppercase tracking-wide">
                          {appliedVoucher.code} APPLIED
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 leading-none">
                          Potongan harga sebesar {appliedVoucher.discount}%
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-[10px] bg-slate-950/40 hover:bg-red-500/35 hover:text-white border border-white/10 text-slate-300 font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 mb-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyVoucher();
                            }
                          }}
                          placeholder="INPUT KODE KUUPON"
                          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 uppercase font-mono placeholder:text-slate-600"
                        />
                        <button
                          type="button"
                          onClick={handleApplyVoucher}
                          disabled={loadingVoucher || !voucherCode.trim()}
                          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-bold text-xs px-3 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                        >
                          {loadingVoucher ? '...' : 'Pasang'}
                        </button>
                      </div>
                      
                      {voucherError && (
                        <p className="text-[10px] text-red-400 font-semibold font-sans">{voucherError}</p>
                      )}
                      {voucherSuccess && (
                        <p className="text-[10px] text-green-400 font-semibold font-sans">{voucherSuccess}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Policy Clauses Inside the Card */}
                <div className="border-t border-white/10 pt-4 mt-4 bg-white/[0.02] p-3.5 rounded-xl border border-white/5 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 text-xs block mb-1">
                    Aturan & Kebijakan Khusus
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                    <li>Sound & Display Screen <b>tidak tersedia</b> (mixer direct output).</li>
                    <li>Transport & Akomodasi tim ditanggung sepenuhnya oleh klien.</li>
                    <li>Rundown & aset media streaming diserahkan selambatnya H-3.</li>
                  </ul>
                </div>
              </div>

              {/* Grand Total area */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <div className="flex justify-between items-end mb-5">
                  <div>
                    <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">
                      TOTAL BIAYA (IDR)
                    </span>
                    <span className="text-[10px] text-slate-500">Estimasi Nett • Belum PPN</span>
                  </div>
                  <div className="text-right">
                    {appliedVoucher && (
                      <div className="text-xs font-mono line-through text-slate-500 mb-0.5">
                        {formatIDR(calculations.subtotal)}
                      </div>
                    )}
                    <div className="text-2xl sm:text-3xl font-mono font-black text-blue-400 tracking-tight">
                      {formatIDR(calculations.finalTotal)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBookingRedirect}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold p-4 rounded-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  id="checkout-trigger-btn"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Isi Reservasi & Pesan</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* COMPARISON SPEC TABLE (Bento Expandable Matrix) */}
        <div className="mt-8 border border-white/10 rounded-2xl overflow-hidden bg-slate-900/30">
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="font-display font-bold text-left text-base sm:text-lg">
                Lihat Matrix Perbandingan Fitur Antar Paket
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showMatrix ? 'rotate-180' : ''}`} />
          </button>

          {showMatrix && (
            <div className="p-6 border-t border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-slate-100 font-bold bg-[#1e2333]/30 rounded-t-lg">Lite Package</th>
                    <th className="py-3 px-4 text-purple-400 font-bold">Regular Package</th>
                    <th className="py-3 px-4 text-amber-300 font-bold">Gold Package</th>
                    <th className="py-3 px-4 text-purple-400 font-bold">Platinum Package</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Kamera & Setup</td>
                    <td className="py-3 px-4 bg-[#1e2333]/15 text-slate-300">Sony NX-100 3 Unit</td>
                    <td className="py-3 px-4 text-slate-300">Sony NX-100 4 Unit</td>
                    <td className="py-3 px-4 text-amber-300 font-semibold">Sony NX-100 5 Unit</td>
                    <td className="py-3 px-4 text-slate-300">Sony NX-100 5 Unit</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Video Mixer</td>
                    <td className="py-3 px-4 bg-[#1e2333]/15 text-slate-500">-</td>
                    <td className="py-3 px-4 text-green-400 text-base">✓</td>
                    <td className="py-3 px-4 text-green-400 text-base">✓</td>
                    <td className="py-3 px-4 text-green-400 text-base">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Capture Card</td>
                    <td className="py-3 px-4 bg-[#1e2333]/15 text-green-400 text-base">✓</td>
                    <td className="py-3 px-4 text-green-400 text-base">✓</td>
                    <td className="py-3 px-4 text-green-400 text-base">✓</td>
                    <td className="py-3 px-4 text-green-400 text-base">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Lighting</td>
                    <td className="py-3 px-4 bg-[#1e2333]/15 text-slate-500">-</td>
                    <td className="py-3 px-4 text-slate-500">-</td>
                    <td className="py-3 px-4 text-slate-500">-</td>
                    <td className="py-3 px-4 text-amber-200">2 Unit Godox SL60W (Softbox/LED Light).</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Laptop</td>
                    <td className="py-3 px-4 bg-[#1e2333]/15 text-slate-300">Acer Nitro V15</td>
                    <td className="py-3 px-4 text-slate-300">Acer Nitro V15</td>
                    <td className="py-3 px-4 text-amber-300">Rog Zephyrus G16</td>
                    <td className="py-3 px-4 text-slate-300">Rog Zephyrus G16</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Wireless Transmission</td>
                    <td className="py-3 px-4 bg-[#1e2333]/15 text-slate-500">-</td>
                    <td className="py-3 px-4 text-slate-500">-</td>
                    <td className="py-3 px-4 text-amber-400">1 Unit</td>
                    <td className="py-3 px-4 text-slate-300">2 Unit</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200">Output</td>
                    <td className="py-3 px-4 bg-[#1e2333]/15 text-slate-300">Siaran ke 1 Platform + File Rekaman Master.</td>
                    <td className="py-3 px-4 text-slate-300">Siaran ke 1 Platform + File Rekaman Master.</td>
                    <td className="py-3 px-4 text-slate-300">Siaran ke 2 Platform + File Rekaman Master.</td>
                    <td className="py-3 px-4 text-slate-300">Siaran ke 2 Platform + File Rekaman Master.</td>
                  </tr>
                  <tr className="border-t border-white/10 font-bold bg-white/[0.01]">
                    <td className="py-4 px-4 font-sans text-slate-200">Harga Event</td>
                    <td className="py-4 px-4 bg-[#1e2333]/20 text-slate-300">
                      <div className="space-y-1">
                        <div>4 Jam: <span className="text-blue-400">Rp 6.600.000</span></div>
                        <div>6 Jam: <span className="text-blue-400">Rp 7.200.000</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <div className="space-y-1">
                        <div>4 Jam: <span className="text-purple-400">Rp 7.500.000</span></div>
                        <div>6 Jam: <span className="text-purple-400">Rp 8.100.000</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-amber-300 font-semibold bg-amber-500/[0.03]">
                      <div className="space-y-1">
                        <div>4 Jam: <span className="text-amber-400">Rp 8.700.000</span></div>
                        <div>6 Jam: <span className="text-amber-400">Rp 9.300.000</span></div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <div className="space-y-1">
                        <div>4 Jam: <span className="text-purple-400">Rp 10.100.000</span></div>
                        <div>6 Jam: <span className="text-purple-400">Rp 10.700.000</span></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
