import React, { useState, useMemo, useEffect } from 'react';
import { PACKAGES, ADD_ONS, CAMERA_UPGRADE_OPTIONS } from '../data';
import { StreamPackage, AddOnOption, CameraUpgradeOption } from '../types';
import { validateVoucherCode, getFirebaseConfig } from '../lib/voucherService';
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
    appliedVoucher?: { code: string; discount: number; packageId?: string } | null,
    selectedCameraId?: string,
    cameraCount?: number
  ) => void;
  initialPackageId?: string;
  appliedVoucherGlobal?: { code: string; discount: number } | null;
}

export default function PricingCalculator({ onPackageSelect, initialPackageId = 'regular', appliedVoucherGlobal = null }: PricingCalculatorProps) {
  const [selectedPkgId, setSelectedPkgId] = useState<string>(initialPackageId);
  const [durationPreset, setDurationPreset] = useState<4 | 6>(4);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('nx100');
  const [selectedCameraCount, setSelectedCameraCount] = useState<number>(1);
  const [addOnQuantities, setAddOnQuantities] = useState<{ [id: string]: number }>({});
  const [showMatrix, setShowMatrix] = useState<boolean>(false);

  // Clamp selectedCameraCount when package changes
  const selectedPackage = useMemo(() => {
    return PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[1];
  }, [selectedPkgId]);

  useEffect(() => {
    if (selectedCameraCount > selectedPackage.camerasCount) {
      setSelectedCameraCount(selectedPackage.camerasCount);
    }
  }, [selectedPackage, selectedCameraCount]);

  // Voucher Code state
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; packageId?: string } | null>(appliedVoucherGlobal || null);
  const [voucherError, setVoucherError] = useState<string>('');
  const [voucherSuccess, setVoucherSuccess] = useState<string>('');
  const [loadingVoucher, setLoadingVoucher] = useState<boolean>(false);
  const [dbIsLive, setDbIsLive] = useState<boolean>(false);

  // Check database configuration status on mount
  useEffect(() => {
    getFirebaseConfig().then(cfg => {
      setDbIsLive(cfg.isConfigured);
    });
  }, []);

  // Proactively release voucher if user switches to an incompatible package
  useEffect(() => {
    if (appliedVoucher && appliedVoucher.packageId && appliedVoucher.packageId !== 'all' && appliedVoucher.packageId !== selectedPkgId) {
      const restrictedPkg = PACKAGES.find(p => p.id === appliedVoucher.packageId);
      const restrictedName = restrictedPkg ? restrictedPkg.name : appliedVoucher.packageId;
      setVoucherError(`Voucher ${appliedVoucher.code} dilepas karena hanya berlaku untuk ${restrictedName}`);
      setAppliedVoucher(null);
      setVoucherSuccess('');
    }
  }, [selectedPkgId, appliedVoucher]);

  // Validate voucher in real-time as requested using database cloud service
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setLoadingVoucher(true);
    setVoucherError('');
    setVoucherSuccess('');
    try {
      const codeUpper = voucherCode.trim().toUpperCase();
      const match = await validateVoucherCode(codeUpper);
      
      if (match) {
        const restrictedPkgId = match.packageId && match.packageId !== 'all' ? match.packageId : 'all';
        if (restrictedPkgId !== 'all' && restrictedPkgId !== selectedPkgId) {
          const restrictedPkg = PACKAGES.find(p => p.id === restrictedPkgId);
          const restrictedName = restrictedPkg ? restrictedPkg.name : restrictedPkgId;
          setVoucherError(`Kupon ${match.code} hanya berlaku untuk ${restrictedName}`);
          setAppliedVoucher(null);
          return;
        }

        setAppliedVoucher({ code: match.code, discount: Number(match.discount), packageId: restrictedPkgId });
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

    const cameraOpt = CAMERA_UPGRADE_OPTIONS.find(c => c.id === selectedCameraId) || CAMERA_UPGRADE_OPTIONS[0];
    const isUpgraded = cameraOpt.id !== 'nx100';
    const cameraUpgradeCost = isUpgraded ? cameraOpt.extraPrice * selectedCameraCount : 0;

    const subtotal = basePrice + totalOvertimeCost + totalAddOnsCost + cameraUpgradeCost;
    const discountAmount = appliedVoucher ? Math.round((subtotal * appliedVoucher.discount) / 100) : 0;
    const finalTotal = subtotal - discountAmount;
    
    return {
      basePrice,
      hourlyOvertimePrice,
      totalOvertimeCost,
      totalAddOnsCost,
      activeAddOnsList,
      cameraUpgradeCost,
      selectedCameraName: cameraOpt.name,
      subtotal,
      discountAmount,
      finalTotal
    };
  }, [selectedPackage, durationPreset, overtimeHours, addOnQuantities, appliedVoucher, selectedCameraId, selectedCameraCount]);

  const handleBookingRedirect = () => {
    onPackageSelect(selectedPackage, durationPreset, overtimeHours, addOnQuantities, appliedVoucher, selectedCameraId, selectedCameraCount);
  };

  return (
    <div className="py-16 text-white bg-zinc-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-xs tracking-wider uppercase mb-4 font-normal">
            <Sliders className="w-3.5 h-3.5" />
            <span>Kalkulator & Konfigurator Live</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-white mb-4">
            Sesuaikan Paket Livestream Anda
          </h2>
          <p className="text-zinc-405 text-sm leading-relaxed text-zinc-400 font-sans max-w-xl mx-auto">
            Sistem kalkulator dinamis kami membantu Anda mengonfigurasi kebutuhan penyiaran secara realtime. Sesuaikan penambahan durasi siaran, tipe kamera utama, dan add-on operasional.
          </p>
        </div>

        {/* STEP 1: Main Base Package CARDS */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg font-sans font-medium flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono">1</span>
              Pilih Paket Utama
            </h3>
            
            {/* Quick Pricing Switcher Duration */}
            <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => {
                  setDurationPreset(4);
                  setOvertimeHours(0);
                }}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                  durationPreset === 4
                    ? 'bg-[#ffffff] text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                Durasi 4 Jam
              </button>
              <button
                onClick={() => {
                  setDurationPreset(6);
                  setOvertimeHours(0);
                }}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${
                  durationPreset === 6
                    ? 'bg-[#ffffff] text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
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
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`relative border rounded-xl p-6 text-left cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                    isSelected 
                      ? 'border-zinc-300 bg-zinc-950 shadow-sm'
                      : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-805 hover:bg-zinc-950/40'
                  }`}
                >
                  {badgeConfig.text && (
                    <span 
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        fontSize: '9px',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        paddingTop: '3px',
                        paddingBottom: '3px',
                        backgroundColor: '#27272a',
                        color: '#f4f4f5',
                        borderRadius: '4px',
                        fontWeight: 'semibold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        border: '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {badgeConfig.text}
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="mb-4">
                      <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-widest mb-1 font-semibold">
                        Paket Digital
                      </span>
                      <h4 className="text-lg font-sans font-medium text-zinc-100">{pkg.name}</h4>
                    </div>

                    {/* Price Tag */}
                    <div className="mb-4 pt-3 border-t border-zinc-900">
                      <div className="text-xl font-mono font-bold text-white">
                        {formatIDR(offersRates)}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        durasi utama {durationPreset} jam ({pkg.camerasCount} kamera)
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                      {pkg.description}
                    </p>

                    {/* Features list inclusion */}
                    <div className="mb-5 space-y-1.5 border-t border-zinc-900 pt-3">
                      <span className="text-[9px] font-mono tracking-wider font-bold text-zinc-455 block uppercase text-zinc-500">Inklusi Paket:</span>
                      {pkg.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                          <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                          <span>{feat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights Spec tags */}
                  <div className="border-t border-zinc-900 pt-4 mt-auto">
                    <div className="flex flex-col gap-2.5 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-550 shrink-0 text-zinc-500" />
                        <span>{pkg.camerasCount}x Kamera Pro Terpasang</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-555 shrink-0 text-zinc-500" />
                        <span>Kru & Operator Siaga</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkmark ring icon */}
                  {isSelected && (
                    <div className="absolute bottom-3 right-3 p-1 rounded-full bg-zinc-100 text-zinc-950">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Suggestion Card for savings */}
        <div className="p-5 rounded-xl bg-zinc-900/20 border border-zinc-900 flex flex-col sm:flex-row items-center gap-4 mb-12 text-left">
          <div className="p-2.5 bg-zinc-900 rounded-lg text-zinc-300 shrink-0 border border-zinc-800">
            <Info className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="font-medium text-zinc-200 text-sm block">Tips Penghematan Anggaran Broadcast</span>
            <span className="text-xs text-zinc-400 leading-relaxed max-w-2xl block mt-0.5">
              Memilih preset durasi <b>6 Jam Utama</b> memberikan potongan harga yang jauh lebih murah dibanding menyewa durasi 4 Jam dan menambah overtime 2 jam secara terpisah.
            </span>
          </div>
        </div>

        {/* STEP 2: Custom Overtime Hours & Optional Addons Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Custom controls (Overtime slider & Custom Equipment list) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Camera Model Upgrade Options */}
            <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl text-left">
              <h3 className="text-base font-sans font-medium flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">2</span>
                Model Kamera Utama (Opsional Upgrade)
              </h3>
              <p className="text-xs text-zinc-450 mb-4 font-sans leading-relaxed text-zinc-400">
                Setiap paket dilengkapi kamera bawaan <b>Sony NX-100</b>. Tingkatkan jenis kamera utama di bawah jika Anda memerlukan sensor 4K pro atau kedalaman warna yang lebih dramatis:
              </p>

              <div className="space-y-2.5">
                {CAMERA_UPGRADE_OPTIONS.map((opt) => {
                  const isSelected = selectedCameraId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedCameraId(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-300 ${
                        isSelected
                          ? 'border-zinc-400 bg-zinc-900/40 shadow-sm'
                          : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'border-zinc-450 bg-zinc-100' : 'border-zinc-800'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />}
                        </div>
                        <div>
                          <span className="font-semibold text-xs sm:text-sm block text-zinc-200">{opt.name}</span>
                          <span className="text-[10px] text-zinc-500 font-sans mt-0.5 block">
                            {opt.id === 'nx100' ? 'Kamera bawaan paket default tanpa biaya tambahan' : `Sensor & format rekaman broadcast ultra-high definition`}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-300 shrink-0 select-none">
                        {opt.extraPrice === 0 ? 'Bawaan' : `+${formatIDR(opt.extraPrice)}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {selectedCameraId !== 'nx100' && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-850 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100 font-sans">Jumlah Kamera Utama yang Diupgrade:</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        Upgrade porsi unit kamera bawaan ke model professional ini (Maks. {selectedPackage.camerasCount} unit untuk {selectedPackage.name})
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedCameraCount(prev => Math.max(1, prev - 1))}
                        disabled={selectedCameraCount <= 1}
                        className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-650 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      
                      <span className="w-8 text-center text-sm font-bold font-mono text-white">
                        {selectedCameraCount}
                      </span>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedCameraCount(prev => Math.min(selectedPackage.camerasCount, prev + 1))}
                        disabled={selectedCameraCount >= selectedPackage.camerasCount}
                        className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-650 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2.5 pt-2.5 border-t border-zinc-900 flex justify-between items-center text-[11px] text-zinc-400">
                    <span>Tambahan Biaya Kamera Utama:</span>
                    <span className="font-mono font-bold text-zinc-200">
                      {selectedCameraCount} unit x {formatIDR(CAMERA_UPGRADE_OPTIONS.find(c => c.id === selectedCameraId)?.extraPrice || 0)} = {formatIDR(calculations.cameraUpgradeCost)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Slider for Overtime hours */}
            <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl text-left">
              <h3 className="text-base font-sans font-medium flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">3</span>
                Tambahan Durasi Overtime (Jam)
              </h3>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-zinc-500 text-xs font-sans">
                  Biaya Overtime: <span className="font-semibold text-zinc-350 font-mono">15% per jam</span> dari paket dasar 4 jam.
                </div>
                <div className="text-2xl font-mono font-bold text-zinc-200">
                  +{overtimeHours} Jam
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="8"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(parseInt(e.target.value))}
                className="w-full accent-zinc-200 bg-zinc-900 rounded-lg appearance-none h-1.5 cursor-pointer mb-4"
              />

              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Mulai (0 Jam)</span>
                <span>+2 Jam</span>
                <span>+4 Jam</span>
                <span>+6 Jam</span>
                <span>Maks (+8 Jam)</span>
              </div>

              {overtimeHours > 0 && (
                <div className="mt-4 p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-300 flex justify-between items-center font-mono">
                  <span>Estimasi Biaya Overtime Jam Kerja:</span>
                  <span className="font-bold text-white">{formatIDR(calculations.totalOvertimeCost)}</span>
                </div>
              )}
            </div>

            {/* Live Addon Custom Checklist options */}
            <div className="bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl text-left">
              <h3 className="text-base font-sans font-medium flex items-center gap-3 mb-5">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono">4</span>
                Pilih Add-on Tambahan (Opsional)
              </h3>

              <div className="flex flex-col gap-4">
                {ADD_ONS.map((addon) => {
                  const currentQty = addOnQuantities[addon.id] || 0;
                  const isActive = currentQty > 0;
                  
                  return (
                    <div 
                      key={addon.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-350 ${
                        isActive 
                          ? 'border-zinc-400 bg-zinc-900/40' 
                          : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 hover:bg-zinc-900/10'
                      }`}
                    >
                      <div className="max-w-md pr-4 mb-3 sm:mb-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-zinc-100">{addon.name}</span>
                          <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">
                            {formatIDR(addon.price)} / {addon.unit}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                          {addon.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <button
                          onClick={() => handleAddOnQuantityChange(addon.id, -1, addon.maxQty)}
                          disabled={currentQty === 0}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-900 hover:border-zinc-700 transition-all"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-zinc-200">
                          {currentQty}
                        </span>
                        <button
                          onClick={() => handleAddOnQuantityChange(addon.id, 1, addon.maxQty)}
                          disabled={currentQty >= addon.maxQty}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-200 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-zinc-900 hover:border-zinc-700 transition-all"
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
            <div className="sticky top-24 border border-zinc-850 p-6 rounded-2xl flex flex-col justify-between text-left h-fit bg-zinc-950 shadow-xl">
              
              <div>
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                      Konfigurasi Event
                    </span>
                    <h4 className="text-base font-sans font-medium text-white">Ringkasan Biaya</h4>
                  </div>
                  <span className="text-[9px] font-mono tracking-wider font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                    ESTIMASI NETT
                  </span>
                </div>

                {/* Selected Package Info */}
                <div className="flex justify-between items-start text-sm mb-4">
                  <div>
                    <span className="font-semibold text-zinc-100 block">
                      Paket {selectedPackage.name}
                    </span>
                    <span className="text-xs text-zinc-500 mt-1 block">
                      Broadcasting Utama ({durationPreset} Jam)
                    </span>
                  </div>
                  <span className="font-mono text-sm text-zinc-200">
                    {formatIDR(calculations.basePrice)}
                  </span>
                </div>

                {/* Overtime Info */}
                {overtimeHours > 0 && (
                  <div className="flex justify-between items-start text-sm mb-4 border-t border-zinc-900 pt-3">
                    <div>
                      <span className="font-medium text-zinc-200 block">
                        Kapasitas Overtime (+{overtimeHours} Jam)
                      </span>
                      <span className="text-xs text-zinc-500 mt-1 block">
                        Rate {formatIDR(calculations.hourlyOvertimePrice)} / jam
                      </span>
                    </div>
                    <span className="font-mono text-sm text-zinc-200">
                      {formatIDR(calculations.totalOvertimeCost)}
                    </span>
                  </div>
                )}

                {/* AddOns listing details */}
                {calculations.activeAddOnsList.length > 0 && (
                  <div className="border-t border-zinc-900 pt-4 mb-4">
                    <span className="text-[10px] text-zinc-500 font-mono tracking-wide block uppercase mb-2">
                      Sistem & Perlengkapan Tambahan:
                    </span>
                    {calculations.activeAddOnsList.map((addon) => (
                      <div key={addon.id} className="flex justify-between text-xs text-zinc-300 mb-2 pl-3 border-l border-zinc-800">
                        <span className="text-zinc-400">
                          {addon.name} <b className="text-zinc-500 font-normal font-mono">(x{addon.quantity})</b>
                        </span>
                        <span className="font-mono text-zinc-300">
                          {formatIDR(addon.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Camera Upgrade Info */}
                {calculations.cameraUpgradeCost > 0 && (
                  <div className="flex justify-between items-start text-sm mb-4 border-t border-zinc-900 pt-3">
                    <div>
                      <span className="font-medium text-zinc-200 block">
                        Upgrade Model Kamera (x{selectedCameraCount})
                      </span>
                      <span className="text-xs text-zinc-500 mt-1 block">
                        {calculations.selectedCameraName}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-zinc-200 font-medium">
                      +{formatIDR(calculations.cameraUpgradeCost)}
                    </span>
                  </div>
                )}

                {/* Voucher Discount Info Row */}
                {appliedVoucher && (
                  <div className="flex justify-between items-start text-sm mb-4 border-t border-zinc-900 pt-3">
                    <div>
                      <span className="font-medium text-zinc-100 block font-sans">
                        Kupon Terpasang ({appliedVoucher.code})
                      </span>
                      <span className="text-xs text-zinc-550 font-sans mt-1 block text-zinc-500 font-mono">
                        Diskon {appliedVoucher.discount}%
                      </span>
                    </div>
                    <span className="font-mono text-sm font-semibold text-zinc-300">
                      -{formatIDR(calculations.discountAmount)}
                    </span>
                  </div>
                )}

                {/* Voucher Input and Application Panel */}
                <div className="border-t border-zinc-900 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-zinc-500 font-mono tracking-wide block uppercase">
                      Masukkan Kupon Voucher:
                    </span>
                    {dbIsLive && (
                      <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full font-mono flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                        Cloud Sync
                      </span>
                    )}
                  </div>
                  
                  {appliedVoucher ? (
                    <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-lg flex items-center justify-between text-xs mb-2 transition-all">
                      <div className="flex flex-col text-left">
                        <span className="font-mono font-bold text-zinc-350 uppercase tracking-wide">
                          {appliedVoucher.code} AKTIF
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-1 leading-none">
                          Potongan harga diskon {appliedVoucher.discount}%
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-[10px] bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded transition-colors cursor-pointer font-sans"
                      >
                        Hapus
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
                          placeholder="KODE VOUCHER"
                          className="flex-1 bg-zinc-950 border border-zinc-855 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500 uppercase font-mono placeholder:text-zinc-700"
                        />
                        <button
                          type="button"
                          onClick={handleApplyVoucher}
                          disabled={loadingVoucher || !voucherCode.trim()}
                          className="bg-zinc-100 hover:bg-zinc-200 disabled:opacity-30 text-zinc-950 font-semibold text-xs px-3 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                        >
                          {loadingVoucher ? '...' : 'Terapkan'}
                        </button>
                      </div>
                      
                      {voucherError && (
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">{voucherError}</p>
                      )}
                      {voucherSuccess && (
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">{voucherSuccess}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Policy Clauses Inside the Card */}
                <div className="border-t border-zinc-900 pt-4 mt-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-xs text-zinc-500 font-sans leading-relaxed">
                  <span className="font-semibold text-zinc-400 text-xs block mb-1.5">
                    Ketentuan & Syarat Operasional:
                  </span>
                  <ul className="list-decimal pl-4 space-y-1.5 text-[11px] text-zinc-500 leading-normal">
                    <li>Tidak termasuk sound & screen (direct mixer feed).</li>
                    <li>Transportasi & akomodasi luar kota ditanggung klien.</li>
                    <li>Rundown dan materi media diserahkan H-3 event.</li>
                  </ul>
                </div>
              </div>

              {/* Grand Total area */}
              <div className="border-t border-zinc-900 pt-5 mt-6">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-wider">
                      TOTAL BIAYA ESTIMATED
                    </span>
                    <span className="text-[10px] text-zinc-650 mt-1 block">Nett • Diluar PPN</span>
                  </div>
                  <div className="text-right">
                    {appliedVoucher && (
                      <div className="text-xs font-mono line-through text-zinc-600 mb-0.5">
                        {formatIDR(calculations.subtotal)}
                      </div>
                    )}
                    <div className="text-2xl font-mono font-semibold text-white tracking-tight">
                      {formatIDR(calculations.finalTotal)}
                    </div>
                    {appliedVoucher && (
                      <div className="text-[10px] text-zinc-400 font-mono mt-1">
                        Diskon {formatIDR(calculations.discountAmount)} diterapkan
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleBookingRedirect}
                  className="w-full flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-zinc-200 text-zinc-950 font-medium py-3.5 px-4 rounded-lg shadow-sm transition-colors cursor-pointer"
                  id="checkout-trigger-btn"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Lanjutkan Pemesanan</span>
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
