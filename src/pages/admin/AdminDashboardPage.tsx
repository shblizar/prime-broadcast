import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllOrders,
  getDashboardCounts,
  updateOrderStatus,
} from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { formatIDR } from '../../utils/currency';
import { generateWhatsAppMessage, normalizeWhatsAppNumber } from '../../utils/whatsapp';
import {
  ShoppingBag,
  DollarSign,
  Layers,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [packageCount, setPackageCount] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [ord, counts] = await Promise.all([
        getAllOrders(),
        getDashboardCounts(),
      ]);
      setOrders(ord);
      setPackageCount(counts.packages);
      setPortfolioCount(counts.portfolio);
      setVoucherCount(counts.vouchers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const totalRevenue = orders
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + (o.estimated_total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING);
  const confirmedOrders = orders.filter((o) => o.status === OrderStatus.CONFIRMED);
  const inProgressOrders = orders.filter((o) => o.status === OrderStatus.IN_PROGRESS);
  const completedOrders = orders.filter((o) => o.status === OrderStatus.COMPLETED);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e) {
      alert('Gagal memperbarui status pesanan');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8" id="admin-dashboard-page">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <ShieldCheck className="w-3 h-3 text-[#A40D35]" />
              Pusat Kontrol Operasional
            </span>
            <span className="text-xs text-slate-400">
              Perbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Ringkasan Operasional & Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Pantau arus reservasi penyiaran live streaming, nilai kontrak aktif, serta ketersediaan paket dan media produksi Prime Broadcast.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang data dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          <Link
            to="/admin/packages"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
          >
            <Layers className="w-3.5 h-3.5 text-[#081A2E]" />
            <span>Kelola Paket</span>
          </Link>

          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#820A2A] shadow-sm transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Semua Pesanan</span>
          </Link>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS (Refined hierarchy, white surfaces, subtle borders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Reservasi */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Reservasi
              </p>
              <div className="text-3xl font-extrabold text-[#081A2E] tracking-tight mt-1">
                {orders.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#081A2E]/5 border border-[#081A2E]/10 flex items-center justify-center text-[#081A2E] shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              <AlertCircle className="w-3 h-3" />
              {pendingOrders.length} Pending
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              <CheckCircle2 className="w-3 h-3" />
              {confirmedOrders.length} Dikonfirmasi
            </span>
          </div>
        </div>

        {/* Metric 2: Nilai Kontrak Aktif */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Nilai Kontrak Terestimasi
              </p>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight mt-1">
                {formatIDR(totalRevenue)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Akumulasi nilai pesanan</span>
            <span className="font-semibold text-slate-700">{orders.length - orders.filter(o => o.status === OrderStatus.CANCELLED).length} aktif</span>
          </div>
        </div>

        {/* Metric 3: Paket Siaran Aktif */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Paket Siaran Utama
              </p>
              <div className="text-3xl font-extrabold text-[#081A2E] tracking-tight mt-1">
                {packageCount} <span className="text-base font-medium text-slate-500">Paket</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#A40D35]/10 border border-[#A40D35]/20 flex items-center justify-center text-[#A40D35] shrink-0">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tersedia untuk klien</span>
            <Link to="/admin/packages" className="text-xs font-bold text-[#A40D35] hover:underline flex items-center gap-0.5">
              Atur Paket <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Metric 4: Portofolio & Promosi */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Portofolio & Promo
              </p>
              <div className="text-3xl font-extrabold text-[#081A2E] tracking-tight mt-1">
                {portfolioCount} <span className="text-base font-medium text-slate-500">Video</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{voucherCount} Kode Voucher</span>
            <Link to="/admin/vouchers" className="text-xs font-bold text-[#A40D35] hover:underline flex items-center gap-0.5">
              Atur Voucher <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL QUICK MODULES BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/admin/orders"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-[#A40D35] hover:shadow transition-all group flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-[#A40D35]/10 text-[#A40D35] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#081A2E] truncate">Kelola Pesanan</div>
            <div className="text-[11px] text-slate-400">{orders.length} total invoice</div>
          </div>
        </Link>

        <Link
          to="/admin/portfolio"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-[#081A2E] hover:shadow transition-all group flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#081A2E] truncate">Koleksi Portofolio</div>
            <div className="text-[11px] text-slate-400">{portfolioCount} dokumentasi</div>
          </div>
        </Link>

        <Link
          to="/admin/vouchers"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-[#A40D35] hover:shadow transition-all group flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Tag className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#081A2E] truncate">Kupon Diskon</div>
            <div className="text-[11px] text-slate-400">{voucherCount} voucher aktif</div>
          </div>
        </Link>

        <Link
          to="/admin/packages"
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-[#081A2E] hover:shadow transition-all group flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-[#081A2E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#081A2E] truncate">Paket & Upgrade</div>
            <div className="text-[11px] text-slate-400">{packageCount} paket siaran</div>
          </div>
        </Link>
      </div>

      {/* 4. RECENT ORDERS TABLE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#081A2E]">
              Pesanan & Reservasi Terbaru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Antrean klien yang mengajukan reservasi penyiaran siaran langsung secara real-time
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#A40D35] hover:text-[#820A2A] inline-flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>Buka Semua Pesanan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#A40D35]" />
            <span>Memuat data pesanan...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium text-slate-500">
              Belum ada pesanan masuk.
            </p>
            <p className="text-[11px] text-slate-400">
              Pesanan yang diajukan oleh calon klien melalui form reservasi akan langsung tercatat di sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#081A2E]/5 text-[#081A2E] font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Invoice</th>
                  <th className="px-5 py-3.5">Klien & Lembaga</th>
                  <th className="px-5 py-3.5">Jadwal Acara</th>
                  <th className="px-5 py-3.5">Paket Layanan</th>
                  <th className="px-5 py-3.5">Estimasi Total</th>
                  <th className="px-5 py-3.5">Status Reservasi</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.slice(0, 5).map((order) => {
                  const whatsappClean = normalizeWhatsAppNumber(order.whatsapp);
                  const waMsg = generateWhatsAppMessage(order);
                  const waHref = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice */}
                      <td className="px-5 py-4 font-mono font-bold text-[#A40D35] whitespace-nowrap">
                        {order.invoice_number}
                      </td>

                      {/* Customer & Organization */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#081A2E]">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-500">{order.organization_name || 'Personal / Individu'}</div>
                      </td>

                      {/* Event Date & Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{order.event_date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{order.event_start_time} WIB</span>
                        </div>
                      </td>

                      {/* Package */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {order.package_name || 'Paket Kustom'}
                        </span>
                      </td>

                      {/* Total Price */}
                      <td className="px-5 py-4 font-bold text-[#081A2E] whitespace-nowrap">
                        {formatIDR(order.estimated_total)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer transition-colors ${
                            order.status === OrderStatus.PENDING
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : order.status === OrderStatus.CONFIRMED
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === OrderStatus.IN_PROGRESS
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.status === OrderStatus.COMPLETED
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          <option value={OrderStatus.PENDING}>Pending</option>
                          <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                          <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
                          <option value={OrderStatus.COMPLETED}>Completed</option>
                          <option value={OrderStatus.CANCELLED}>Cancelled</option>
                        </select>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors"
                          title="Hubungi Klien via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

