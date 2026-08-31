import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  Package,
  Upgrade,
  Addon,
  OvertimeSettings,
  VoucherValidationResult,
} from '../types';
import {
  validateVoucher,
} from '../services/api';
import { formatIDR } from '../utils/currency';
import {
  Check,
  Plus,
  Minus,
  Clock,
  Tag,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { usePublicData } from '../contexts/PublicDataContext';

export const PackagePage: React.FC = () => {
  const navigate = useNavigate();
  const { packages, upgrades, addons, overtimeSettings } = usePublicData();
  const loading = false; // Data is already loaded on bootstrap

  // Selections state (saved in localStorage for convenience)
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [selectedUpgrades, setSelectedUpgrades] = useState<{ [id: string]: number }>({});
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [selectedAddons, setSelectedAddons] = useState<{ [id: string]: number }>({});

  // Voucher state
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>('');
  const [voucherResult, setVoucherResult] = useState<VoucherValidationResult | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState<boolean>(false);

  // Load cached selections if any
  useEffect(() => {
    try {
      const cached = localStorage.getItem('pb_cart_draft');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.package_id && packages.some((p) => p.id === parsed.package_id)) {
          setSelectedPackageId(parsed.package_id);
        } else if (packages.length > 0) {
          setSelectedPackageId(packages[0].id);
        }
        if (parsed.upgrades) setSelectedUpgrades(parsed.upgrades);
        if (typeof parsed.overtime_hours === 'number') setOvertimeHours(parsed.overtime_hours);
        if (parsed.addons) setSelectedAddons(parsed.addons);
        if (parsed.voucher_code) setVoucherCodeInput(parsed.voucher_code);
      } else if (packages.length > 0) {
        setSelectedPackageId(packages[0].id);
      }
    } catch {
      if (packages.length > 0) setSelectedPackageId(packages[0].id);
    }
  }, [packages]);

  // Selected package object
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  // Calculations
  const packagePrice = selectedPackage?.price || 0;

  // Upgrades total
  let upgradesTotal = 0;
  const upgradeSummaryItems: { name: string; qty: number; unitPrice: number; total: number; unitLabel: string }[] = [];
  upgrades.forEach((u) => {
    const qty = selectedUpgrades[u.id] || 0;
    if (qty > 0) {
      const lineTotal = u.price * qty;
      upgradesTotal += lineTotal;
      upgradeSummaryItems.push({
        name: u.name,
        qty,
        unitPrice: u.price,
        total: lineTotal,
        unitLabel: u.unit_label,
      });
    }
  });

  // Overtime total
  let overtimePerHour = 0;
  let overtimeTotal = 0;
  if (selectedPackage && overtimeSettings?.is_active && overtimeHours > 0) {
    overtimePerHour = Math.round(selectedPackage.price * (overtimeSettings.rate_percent / 100));
    overtimeTotal = overtimePerHour * overtimeHours;
  }

  // Addons total
  let addonsTotal = 0;
  const addonSummaryItems: { name: string; qty: number; unitPrice: number; total: number; unitLabel: string }[] = [];
  addons.forEach((a) => {
    const qty = selectedAddons[a.id] || 0;
    if (qty > 0) {
      const lineTotal = a.price * qty;
      addonsTotal += lineTotal;
      addonSummaryItems.push({
        name: a.name,
        qty,
        unitPrice: a.price,
        total: lineTotal,
        unitLabel: a.unit_label,
      });
    }
  });

  const subtotal = packagePrice + upgradesTotal + overtimeTotal + addonsTotal;

  useEffect(() => {
    if (voucherResult?.valid && voucherCodeInput) {
      validateVoucher(voucherCodeInput, subtotal).then(res => setVoucherResult(res));
    }
  }, [subtotal]);

  const discountAmount = voucherResult?.valid && voucherResult.voucher ? voucherResult.voucher.calculated_discount : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  // Sync draft to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(
        'pb_cart_draft',
        JSON.stringify({
          package_id: selectedPackageId,
          upgrades: selectedUpgrades,
          overtime_hours: overtimeHours,
          addons: selectedAddons,
          voucher_code: voucherResult?.valid ? voucherCodeInput : '',
        })
      );
    }
  }, [selectedPackageId, selectedUpgrades, overtimeHours, selectedAddons, voucherCodeInput, voucherResult, loading]);

  // Upgrade handlers
  const handleUpgradeToggle = (upgrade: Upgrade) => {
    const current = selectedUpgrades[upgrade.id] || 0;
    if (current > 0) {
      const next = { ...selectedUpgrades };
      delete next[upgrade.id];
      setSelectedUpgrades(next);
    } else {
      setSelectedUpgrades({
        ...selectedUpgrades,
        [upgrade.id]: upgrade.min_quantity || 1,
      });
    }
  };

  const handleUpgradeQtyChange = (upgradeId: string, delta: number, min: number, max: number) => {
    const current = selectedUpgrades[upgradeId] || 0;
    const next = Math.min(Math.max(current + delta, min), max);
    if (next <= 0) {
      const updated = { ...selectedUpgrades };
      delete updated[upgradeId];
      setSelectedUpgrades(updated);
    } else {
      setSelectedUpgrades({
        ...selectedUpgrades,
        [upgradeId]: next,
      });
    }
  };

  // Addon handlers
  const handleAddonToggle = (addon: Addon) => {
    const current = selectedAddons[addon.id] || 0;
    if (current > 0) {
      const next = { ...selectedAddons };
      delete next[addon.id];
      setSelectedAddons(next);
    } else {
      setSelectedAddons({
        ...selectedAddons,
        [addon.id]: addon.min_quantity || 1,
      });
    }
  };

  const handleAddonQtyChange = (addonId: string, delta: number, min: number, max: number) => {
    const current = selectedAddons[addonId] || 0;
    const next = Math.min(Math.max(current + delta, min), max);
    if (next <= 0) {
      const updated = { ...selectedAddons };
      delete updated[addonId];
      setSelectedAddons(updated);
    } else {
      setSelectedAddons({
        ...selectedAddons,
        [addonId]: next,
      });
    }
  };

  // Voucher verification
  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCodeInput.trim()) return;

    setValidatingVoucher(true);
    try {
      const res = await validateVoucher(voucherCodeInput, subtotal);
      setVoucherResult(res);
    } catch {
      setVoucherResult({ valid: false, message: 'Gagal memvalidasi voucher. Silakan coba lagi.' });
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleProceedCheckout = () => {
    if (!selectedPackageId) return;

    navigate('/checkout', {
      state: {
        package_id: selectedPackageId,
        upgrades: Object.entries(selectedUpgrades).map(([id, qty]) => ({ id, quantity: qty })),
        overtime_hours: overtimeHours,
        addons: Object.entries(selectedAddons).map(([id, qty]) => ({ id, quantity: qty })),
        voucher_code: voucherResult?.valid ? voucherCodeInput.trim().toUpperCase() : undefined,
      },
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#F7F5F1] text-[#081A2E] font-['Helvetica','Arial',sans-serif]"
      id="packages-page-root"
    >
      <Navbar />

      {/* Main Configurator Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 py-10 sm:py-14">
        {loading ? (
          <div className="text-center py-24 text-slate-400 text-sm">Memuat opsi paket dan konfigurasi...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[28px] border border-slate-200 p-8 shadow-[0_10px_30px_rgba(8,26,46,0.06)]">
            <h2 className="text-xl font-bold text-[#081A2E]">Paket Sedang Dipersiapkan</h2>
            <p className="text-slate-500 text-sm mt-2">
              Paket layanan broadcast akan segera ditampilkan setelah dikonfigurasi oleh tim Prime Broadcast.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* HERO PACKAGE SELECTION SECTION */}
            <section id="config-step-package" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
                    Pilih Paket Siaran Utama
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Pilih paket dasar kamera & durasi yang paling tepat untuk skala acara Anda
                </p>
              </div>

              {/* Package Cards Grid (Premium White Cards, Side by Side) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;

                  return (
                    <motion.div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      whileHover={{ y: -4 }}
                      animate={{
                        scale: isSelected ? 1.015 : 1,
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className={`relative bg-white rounded-[28px] sm:rounded-[32px] p-7 sm:p-8 flex flex-col justify-between cursor-pointer transition-colors duration-300 ${
                        isSelected
                          ? 'shadow-[0_20px_50px_rgba(164,13,53,0.18),0_6px_18px_rgba(164,13,53,0.10)] border-2 border-[#A40D35] ring-4 ring-[#A40D35]/15'
                          : 'shadow-[0_14px_40px_rgba(8,26,46,0.09),0_4px_14px_rgba(8,26,46,0.04)] border border-slate-200/80 hover:shadow-[0_22px_55px_rgba(8,26,46,0.14),0_6px_20px_rgba(8,26,46,0.06)] hover:border-slate-300'
                      }`}
                      id={`package-card-${pkg.id}`}
                    >
                      {/* Top Selected Indicator Pill if active */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-3.5 right-6 bg-[#A40D35] text-white text-[11px] font-bold px-3.5 py-0.5 rounded-full shadow-md flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Terpilih</span>
                        </motion.div>
                      )}

                      <div className="space-y-6">
                        {/* Header: Package Headline & Selection Indicator */}
                        <div className="flex items-start justify-between gap-3 pt-1">
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] leading-tight tracking-tight">
                            {pkg.name}
                          </h3>
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all flex-shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-[#A40D35] border-[#A40D35] text-white shadow-sm'
                                : 'border-slate-300 bg-slate-50 text-transparent'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        </div>

                        {/* 3. Short Package Description (Refined Inset Block) */}
                        <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed min-h-[58px] flex items-center">
                          {pkg.description || 'Solusi penyiaran profesional dengan perangkat kelas broadcast.'}
                        </div>

                        {/* 4. Duration Information */}
                        <div className="flex items-center gap-2 py-1 text-xs font-bold text-slate-700">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span>Durasi Dasar: {pkg.duration_hours} Jam Siaran</span>
                        </div>

                        {/* 5. Feature List */}
                        <div className="pt-4 border-t border-slate-100 space-y-2.5">
                          <div className="text-xs font-semibold text-slate-500 mb-1.5">
                            Termasuk Dalam Paket:
                          </div>
                          {pkg.features && pkg.features.length > 0 ? (
                            <ul className="space-y-2.5">
                              {pkg.features.map((feat) => (
                                <li key={feat.id} className="text-xs text-slate-700 flex items-start gap-2.5 leading-snug">
                                  <div className="w-4 h-4 rounded-full bg-[#A40D35]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5 text-[#A40D35] stroke-[3]" />
                                  </div>
                                  <span className="font-medium">{feat.feature_text}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-xs text-slate-400 italic">Rincian fitur broadcast lengkap</div>
                          )}
                        </div>
                      </div>

                      {/* 6. Price Section & 7. CTA Button */}
                      <div className="pt-6 mt-6 border-t border-slate-100 space-y-4">
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1">
                            Harga Dasar
                          </div>
                          <div className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
                            {formatIDR(pkg.price)}
                          </div>
                        </div>

                        {/* CTA Button with Prime Broadcast Brand Gradient */}
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPackageId(pkg.id);
                          }}
                          className={`w-full py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all duration-200 shadow-md ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#A40D35] via-[#850B2B] to-[#081A2E] shadow-[#A40D35]/30 ring-2 ring-[#A40D35]/40 scale-[1.01]'
                              : 'bg-gradient-to-r from-[#081A2E] to-[#A40D35] hover:from-[#0b2440] hover:to-[#850B2B] shadow-slate-900/15 hover:shadow-lg'
                          }`}
                        >
                          {isSelected ? '✓ Paket Terpilih' : 'Pilih Paket Ini'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* LOWER SECTION: UPGRADES, OVERTIME, ADD-ONS & STICKY SUMMARY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-6 border-t border-slate-200/80">
              {/* Left Column: Additional Configurations (8 cols) */}
              <div className="lg:col-span-8 space-y-10">
                {/* STEP 2: OPTIONAL UPGRADES */}
                {upgrades.length > 0 && (
                  <section id="config-step-upgrades" className="space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#081A2E] text-white text-xs font-bold shadow-sm">
                        02
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#081A2E]">
                          Upgrade Kamera
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {upgrades.map((upgrade) => {
                        const qty = selectedUpgrades[upgrade.id] || 0;
                        const isChecked = qty > 0;

                        return (
                          <div
                            key={upgrade.id}
                            className={`p-5 rounded-[22px] bg-white border transition-all ${
                              isChecked
                                ? 'border-[#A40D35]/70 shadow-[0_12px_30px_rgba(164,13,53,0.12),0_4px_10px_rgba(164,13,53,0.06)] ring-1 ring-[#A40D35]/25'
                                : 'border-slate-200/80 hover:border-slate-300 shadow-[0_8px_24px_rgba(8,26,46,0.06),0_2px_8px_rgba(8,26,46,0.03)] hover:shadow-[0_12px_32px_rgba(8,26,46,0.09)]'
                            }`}
                            id={`upgrade-item-${upgrade.id}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-3.5">
                                <input
                                  type="checkbox"
                                  id={`check-upgrade-${upgrade.id}`}
                                  checked={isChecked}
                                  onChange={() => handleUpgradeToggle(upgrade)}
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                                />
                                <div>
                                  <label
                                    htmlFor={`check-upgrade-${upgrade.id}`}
                                    className="text-sm font-bold text-[#081A2E] cursor-pointer block"
                                  >
                                    {upgrade.name}
                                  </label>
                                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    {upgrade.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 pl-7 sm:pl-0 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-sm font-bold text-[#081A2E]">
                                    {formatIDR(upgrade.price)}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium">
                                    {upgrade.unit_label}
                                  </div>
                                </div>

                                {/* Quantity selector if allowed */}
                                {upgrade.allow_quantity && isChecked && (
                                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpgradeQtyChange(
                                          upgrade.id,
                                          -1,
                                          upgrade.min_quantity,
                                          upgrade.max_quantity
                                        )
                                      }
                                      className="p-1.5 text-slate-600 hover:bg-slate-200 active:bg-slate-300"
                                      aria-label="Kurangi jumlah"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="px-3 text-xs font-bold text-[#081A2E] min-w-[28px] text-center">
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpgradeQtyChange(
                                          upgrade.id,
                                          1,
                                          upgrade.min_quantity,
                                          upgrade.max_quantity
                                        )
                                      }
                                      className="p-1.5 text-slate-600 hover:bg-slate-200 active:bg-slate-300"
                                      aria-label="Tambah jumlah"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* STEP 3: OVERTIME SLIDER */}
                {overtimeSettings?.is_active && (
                  <section id="config-step-overtime" className="space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#081A2E] text-white text-xs font-bold shadow-sm">
                        03
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#081A2E]">
                          Overtime
                        </h2>
                      </div>
                    </div>

                    <div className="p-7 rounded-[26px] bg-white border border-slate-200/80 shadow-[0_14px_40px_rgba(8,26,46,0.08),0_4px_14px_rgba(8,26,46,0.03)] space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-[#081A2E]">Durasi Overtime Tambahan</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Tarif overtime: {overtimeSettings.rate_percent}% per jam dari paket dasar (
                            {formatIDR(overtimePerHour)}/jam).
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-2xl font-bold text-[#A40D35]">
                            +{overtimeHours} Jam
                          </span>
                          {overtimeHours > 0 && (
                            <div className="text-xs font-bold text-slate-600">
                              Total Overtime: {formatIDR(overtimeTotal)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Range Slider */}
                      <div>
                        <input
                          type="range"
                          id="overtime-slider-control"
                          min="0"
                          max={overtimeSettings.max_hours}
                          step={overtimeSettings.step_hours || 1}
                          value={overtimeHours}
                          onChange={(e) => setOvertimeHours(parseInt(e.target.value, 10))}
                          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#A40D35]"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-2.5">
                          <span>0 Jam (Sesuai Durasi Dasar)</span>
                          <span>Maksimal {overtimeSettings.max_hours} Jam</span>
                        </div>
                      </div>

                      {overtimeHours > 0 && (
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex justify-between items-center font-medium">
                          <span>
                            Overtime {overtimeHours} jam × {formatIDR(overtimePerHour)}/jam
                          </span>
                          <span className="font-bold text-[#081A2E]">{formatIDR(overtimeTotal)}</span>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* STEP 4: ADD-ONS */}
                {addons.length > 0 && (
                  <section id="config-step-addons" className="space-y-5">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#081A2E] text-white text-xs font-bold shadow-sm">
                        04
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-[#081A2E]">
                          Add On
                        </h2>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {addons.map((addon) => {
                        const qty = selectedAddons[addon.id] || 0;
                        const isChecked = qty > 0;

                        return (
                          <div
                            key={addon.id}
                            className={`p-5 rounded-[22px] bg-white border transition-all ${
                              isChecked
                                ? 'border-[#A40D35]/70 shadow-[0_12px_30px_rgba(164,13,53,0.12),0_4px_10px_rgba(164,13,53,0.06)] ring-1 ring-[#A40D35]/25'
                                : 'border-slate-200/80 hover:border-slate-300 shadow-[0_8px_24px_rgba(8,26,46,0.06),0_2px_8px_rgba(8,26,46,0.03)] hover:shadow-[0_12px_32px_rgba(8,26,46,0.09)]'
                            }`}
                            id={`addon-item-${addon.id}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex items-start gap-3.5">
                                <input
                                  type="checkbox"
                                  id={`check-addon-${addon.id}`}
                                  checked={isChecked}
                                  onChange={() => handleAddonToggle(addon)}
                                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#A40D35] focus:ring-[#A40D35] cursor-pointer"
                                />
                                <div>
                                  <label
                                    htmlFor={`check-addon-${addon.id}`}
                                    className="text-sm font-bold text-[#081A2E] cursor-pointer block"
                                  >
                                    {addon.name}
                                  </label>
                                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                    {addon.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 pl-7 sm:pl-0 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-sm font-bold text-[#081A2E]">
                                    {formatIDR(addon.price)}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-medium">{addon.unit_label}</div>
                                </div>

                                {addon.allow_quantity && isChecked && (
                                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddonQtyChange(
                                          addon.id,
                                          -1,
                                          addon.min_quantity,
                                          addon.max_quantity
                                        )
                                      }
                                      className="p-1.5 text-slate-600 hover:bg-slate-200 active:bg-slate-300"
                                      aria-label="Kurangi jumlah"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="px-3 text-xs font-bold text-[#081A2E] min-w-[28px] text-center">
                                      {qty}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleAddonQtyChange(
                                          addon.id,
                                          1,
                                          addon.min_quantity,
                                          addon.max_quantity
                                        )
                                      }
                                      className="p-1.5 text-slate-600 hover:bg-slate-200 active:bg-slate-300"
                                      aria-label="Tambah jumlah"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Column: Sticky Summary & Checkout Action (4 cols) */}
              <div className="lg:col-span-4 sticky top-24 space-y-4" id="order-summary-sidebar">
                <div className="bg-white border border-slate-200/80 rounded-[28px] p-7 shadow-[0_16px_45px_rgba(8,26,46,0.10),0_4px_16px_rgba(8,26,46,0.04)] space-y-5">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-lg font-bold text-[#081A2E]">Cart</h3>
                  </div>

                  {/* Selected Package Snapshot */}
                  <div className="space-y-4 text-sm pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-[#081A2E]">
                          {selectedPackage ? selectedPackage.name : 'Belum memilih paket'}
                        </div>
                        {selectedPackage && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            Durasi Dasar: {selectedPackage.duration_hours} Jam
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-[#081A2E]">
                        {selectedPackage ? formatIDR(selectedPackage.price) : 'Rp0'}
                      </div>
                    </div>

                    {/* Upgrades Breakdown */}
                    {upgradeSummaryItems.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-xs font-semibold text-slate-500">
                          Upgrade Perangkat
                        </div>
                        {upgradeSummaryItems.map((u, i) => (
                          <div key={i} className="flex justify-between text-xs text-slate-700">
                            <span className="pr-2">
                              {u.name} × {u.qty}
                            </span>
                            <span className="font-semibold text-[#081A2E]">{formatIDR(u.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Overtime Breakdown */}
                    {overtimeHours > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-xs font-semibold text-slate-500">
                          Overtime Tambahan
                        </div>
                        <div className="flex justify-between text-xs text-slate-700">
                          <span>+{overtimeHours} Jam</span>
                          <span className="font-semibold text-[#081A2E]">{formatIDR(overtimeTotal)}</span>
                        </div>
                      </div>
                    )}

                    {/* Add-ons Breakdown */}
                    {addonSummaryItems.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-xs font-semibold text-slate-500">
                          Add-ons & Periferal
                        </div>
                        {addonSummaryItems.map((a, i) => (
                          <div key={i} className="flex justify-between text-xs text-slate-700">
                            <span className="pr-2">
                              {a.name}
                              {a.qty > 1 ? ` × ${a.qty}` : ''}
                            </span>
                            <span className="font-semibold text-[#081A2E]">{formatIDR(a.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                    <span>Subtotal</span>
                    <span className="font-bold text-[#081A2E]">{formatIDR(subtotal)}</span>
                  </div>

                  {/* Voucher Form */}
                  <form onSubmit={handleApplyVoucher} className="pt-2 border-t border-slate-100">
                    <label htmlFor="voucher-code-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Klaim Voucher Diskon (Opsional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="voucher-code-input"
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value)}
                        placeholder="Masukkan kode voucher"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#A40D35]/20 focus:border-[#A40D35]"
                      />
                      <button
                        type="submit"
                        disabled={validatingVoucher || !voucherCodeInput.trim()}
                        id="apply-voucher-btn"
                        className="px-4 py-2 text-xs font-bold text-white bg-[#081A2E] hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-colors"
                      >
                        {validatingVoucher ? 'Cek...' : 'Pakai'}
                      </button>
                    </div>

                    {voucherResult && (
                      <div
                        className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                          voucherResult.valid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {voucherResult.valid ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{voucherResult.message}</span>
                      </div>
                    )}
                  </form>

                  {/* Discount Line if valid */}
                  {discountAmount > 0 && (
                    <div className="py-2.5 px-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs font-bold text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        Voucher ({voucherResult?.voucher?.discount_type === 'percentage'
                          ? `${voucherResult.voucher.discount_value}%`
                          : `-${formatIDR(voucherResult?.voucher?.discount_value ?? discountAmount)}`})
                      </span>
                      <span>-{formatIDR(discountAmount)}</span>
                    </div>
                  )}

                  {/* Estimated Total */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-[#081A2E]">Total Estimasi</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#A40D35]">{formatIDR(estimatedTotal)}</span>
                  </div>

                  {/* Proceed Checkout Button */}
                  <motion.button
                    type="button"
                    id="proceed-checkout-button"
                    onClick={handleProceedCheckout}
                    disabled={!selectedPackageId}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-[#A40D35] via-[#850B2B] to-[#081A2E] hover:from-[#850B2B] hover:to-[#081A2E] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#A40D35]/25"
                  >
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>


                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

