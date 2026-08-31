import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllOrders,
  getAllPackages,
  getAllPortfolio,
  getPublicVouchers,
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
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [packageCount, setPackageCount] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ord, pkgs, port, vouch] = await Promise.all([
          getAllOrders(),
          getAllPackages(),
          getAllPortfolio(),
          getPublicVouchers(),
        ]);
        setOrders(ord);
        setPackageCount(pkgs.length);
        setPortfolioCount(port.length);
        setVoucherCount(vouch.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== OrderStatus.CANCELLED)
    .reduce((sum, o) => sum + (o.estimated_total || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING);
  const confirmedOrders = orders.filter((o) => o.status === OrderStatus.CONFIRMED);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (e) {
      alert('Gagal memperbarui status');
    }
  };

  return (
    <div className="space-y-8" id="admin-dashboard-page">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
            Ringkasan Operasional & Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Status pemesanan, nilai kontrak, dan manajemen siaran langsung Prime Broadcast
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/packages"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Kelola Paket</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Soft, Refined Cards with Subtle Shadows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Reservasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#081A2E]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
            {orders.length}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-amber-600">{pendingOrders.length} Menunggu</span>
            <span>&bull;</span>
            <span className="font-semibold text-emerald-600">{confirmedOrders.length} Dikonfirmasi</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Estimasi Nilai Kontrak
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
            {formatIDR(totalRevenue)}
          </div>
          <div className="text-xs text-slate-500">
            Akumulasi nilai pesanan aktif
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Paket Siaran Aktif
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#A40D35] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
            {packageCount} Paket
          </div>
          <div className="text-xs text-slate-500">
            Dikonfigurasi di website publik
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Portofolio & Promo
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
            {portfolioCount} Video
          </div>
          <div className="text-xs text-slate-500">
            {voucherCount} kode voucher aktif
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#081A2E]">
              Pesanan & Reservasi Terbaru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar klien yang mengajukan reservasi penyiaran secara real-time
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#A40D35] hover:text-[#850B2B] inline-flex items-center gap-1 transition-colors"
          >
            Lihat Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Belum ada pesanan masuk. Pesanan yang dibuat oleh klien melalui form reservasi akan muncul di sini secara real-time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Invoice</th>
                  <th className="px-6 py-3.5">Klien & Lembaga</th>
                  <th className="px-6 py-3.5">Tanggal Acara</th>
                  <th className="px-6 py-3.5">Paket</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => {
                  const whatsappClean = normalizeWhatsAppNumber(order.whatsapp);
                  const waMsg = generateWhatsAppMessage(order);
                  const waHref = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#A40D35]">
                        {order.invoice_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#081A2E]">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-500">{order.organization_name}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="font-medium">{order.event_date}</div>
                        <div className="text-[11px] text-slate-400">{order.event_start_time} WIB</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <span className="font-medium">{order.package_name}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#081A2E]">
                        {formatIDR(order.estimated_total)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border focus:outline-none cursor-pointer transition-colors ${
                            order.status === OrderStatus.PENDING
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : order.status === OrderStatus.CONFIRMED
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === OrderStatus.IN_PROGRESS
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : order.status === OrderStatus.COMPLETED
                              ? 'bg-slate-100 text-slate-800 border-slate-300'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                        >
                          <option value={OrderStatus.PENDING}>Pending</option>
                          <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                          <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
                          <option value={OrderStatus.COMPLETED}>Completed</option>
                          <option value={OrderStatus.CANCELLED}>Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                          title="Hubungi Klien via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
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
