import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { formatIDR } from '../../utils/currency';
import { generateWhatsAppMessage, normalizeWhatsAppNumber } from '../../utils/whatsapp';
import { generateGmailLink } from '../../utils/email';
import { generateInvoicePDF } from '../../utils/pdf';
import {
  Search,
  Filter,
  MessageSquare,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  Phone,
  Mail,
  FileText,
  X,
  Printer,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Clock3,
  CheckCheck,
  Ban,
  RefreshCw,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      alert('Gagal mengubah status pesanan.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.organization_name && o.organization_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.package_name && o.package_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count summaries for status tabs
  const countAll = orders.length;
  const countPending = orders.filter((o) => o.status === OrderStatus.PENDING).length;
  const countConfirmed = orders.filter((o) => o.status === OrderStatus.CONFIRMED).length;
  const countInProgress = orders.filter((o) => o.status === OrderStatus.IN_PROGRESS).length;
  const countCompleted = orders.filter((o) => o.status === OrderStatus.COMPLETED).length;
  const countCancelled = orders.filter((o) => o.status === OrderStatus.CANCELLED).length;

  return (
    <div className="space-y-6" id="admin-orders-page">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200/90 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#081A2E]/5 text-[#081A2E] border border-[#081A2E]/10">
              <ShoppingBag className="w-3 h-3 text-[#A40D35]" />
              Manajemen Reservasi
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {filteredOrders.length} dari {orders.length} pesanan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081A2E] tracking-tight">
            Pesanan & Reservasi Klien
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola verifikasi jadwal penyiaran, rincian add-on siaran, penerbitan invoice PDF resmi, dan komunikasi langsung via WhatsApp atau Gmail.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#081A2E] shadow-sm transition-all cursor-pointer disabled:opacity-60"
            title="Muat ulang pesanan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#A40D35]' : 'text-slate-500'}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 2. Status Quick-Filter Tabs */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#081A2E] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#081A2E] hover:bg-slate-100'
          }`}
        >
          <span>Semua</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {countAll}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(OrderStatus.PENDING)}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === OrderStatus.PENDING
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Pending</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            statusFilter === OrderStatus.PENDING ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {countPending}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(OrderStatus.CONFIRMED)}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === OrderStatus.CONFIRMED
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Confirmed</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            statusFilter === OrderStatus.CONFIRMED ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {countConfirmed}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(OrderStatus.IN_PROGRESS)}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === OrderStatus.IN_PROGRESS
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-blue-800 hover:bg-blue-50'
          }`}
        >
          <Clock3 className="w-3.5 h-3.5" />
          <span>In Progress</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            statusFilter === OrderStatus.IN_PROGRESS ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {countInProgress}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(OrderStatus.COMPLETED)}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === OrderStatus.COMPLETED
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Completed</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            statusFilter === OrderStatus.COMPLETED ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {countCompleted}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter(OrderStatus.CANCELLED)}
          className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            statusFilter === OrderStatus.CANCELLED
              ? 'bg-rose-700 text-white shadow-sm'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Cancelled</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            statusFilter === OrderStatus.CANCELLED ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
          }`}>
            {countCancelled}
          </span>
        </button>
      </div>

      {/* 3. Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="w-full sm:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor invoice, PIC, lembaga, paket..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A40D35] focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto flex items-center justify-end gap-2 text-xs text-slate-500">
          <span>Menampilkan <strong className="text-[#081A2E]">{filteredOrders.length}</strong> pesanan</span>
        </div>
      </div>

      {/* 4. Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#A40D35]" />
            <span>Memuat seluruh data reservasi...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Tidak ada data pesanan yang sesuai filter.
            </p>
            <p className="text-[11px] text-slate-400">
              Coba ubah kata kunci pencarian atau pilih tab status yang lain.
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
                  <th className="px-5 py-3.5">Paket Siaran</th>
                  <th className="px-5 py-3.5">Nilai Kontrak</th>
                  <th className="px-5 py-3.5">Status Reservasi</th>
                  <th className="px-5 py-3.5 text-right">Aksi & Kontak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => {
                  const whatsappClean = normalizeWhatsAppNumber(order.whatsapp);
                  const waMsg = generateWhatsAppMessage(order);
                  const waHref = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(waMsg)}`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono font-bold text-[#A40D35] hover:underline text-left"
                          title="Klik untuk melihat rincian pesanan"
                        >
                          {order.invoice_number}
                        </button>
                      </td>

                      {/* Customer & Organization */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-[#081A2E]">{order.customer_name}</div>
                        <div className="text-[11px] text-slate-500">{order.organization_name || 'Personal / Individu'}</div>
                      </td>

                      {/* Date & Time */}
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

                      {/* Package Name */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">{order.package_name || 'Paket Kustom'}</div>
                        {order.overtime_hours > 0 && (
                          <div className="text-[10px] text-amber-700 font-medium mt-0.5 inline-flex items-center gap-1 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            +{order.overtime_hours} jam overtime
                          </div>
                        )}
                      </td>

                      {/* Estimated Total */}
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

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                            title="Buka rincian lengkap pesanan"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Rincian</span>
                          </button>

                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-colors"
                            title="Chat Klien di WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WA</span>
                          </a>

                          <a
                            href={generateGmailLink(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors"
                            title="Kirim Konfirmasi Email"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                            <span className="hidden lg:inline">Email</span>
                          </a>

                          <button
                            disabled={isPdfGenerating === order.id}
                            onClick={async () => {
                              try {
                                setIsPdfGenerating(order.id);
                                await generateInvoicePDF(order);
                              } catch (error) {
                                console.error('Failed to generate PDF', error);
                                alert('Gagal membuat invoice PDF.');
                              } finally {
                                setIsPdfGenerating(null);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 transition-colors disabled:opacity-50"
                            title="Cetak Invoice PDF"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-700" />
                            <span>PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Order Detail Modal (Redesigned with clean visual hierarchy) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#081A2E] text-white">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Rincian Kontrak & Faktur
                </div>
                <h3 className="font-extrabold text-lg text-white font-mono tracking-tight">
                  {selectedOrder.invoice_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup jendela"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Customer & Event Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">PIC Pemesan</div>
                      <div className="font-bold text-slate-900 text-sm">{selectedOrder.customer_name}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Lembaga / Perusahaan</div>
                      <div className="font-bold text-slate-800">{selectedOrder.organization_name || 'Personal / Individu'}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">WhatsApp</div>
                      <div className="font-bold text-slate-800">{selectedOrder.whatsapp}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Email</div>
                      <div className="font-bold text-slate-800">{selectedOrder.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Tanggal Acara</div>
                      <div className="font-bold text-slate-900">{selectedOrder.event_date}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Jam Siaran Mulai</div>
                      <div className="font-bold text-slate-800">{selectedOrder.event_start_time} WIB</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase">Alamat Lokasi / Venue</div>
                      <div className="font-medium text-slate-800 leading-snug">
                        {selectedOrder.venue_address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedOrder.additional_notes && (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/70">
                  <div className="font-bold text-amber-900 text-[11px] mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" /> Catatan Tambahan Klien:
                  </div>
                  <div className="text-amber-800 leading-relaxed text-xs">{selectedOrder.additional_notes}</div>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2.5">Rincian Komponen Biaya</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#081A2E]/5 font-bold border-b border-slate-200 text-[#081A2E]">
                      <tr>
                        <th className="p-3">Item / Layanan</th>
                        <th className="p-3 text-right">Harga Satuan</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">
                          {selectedOrder.package_name_snapshot || selectedOrder.package_name} ({selectedOrder.package_duration_snapshot || selectedOrder.package_duration_hours} Jam)
                        </td>
                        <td className="p-3 text-right">{formatIDR(selectedOrder.package_price_snapshot || selectedOrder.package_price || 0)}</td>
                        <td className="p-3 text-center">1</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatIDR(selectedOrder.package_price_snapshot || selectedOrder.package_price || 0)}
                        </td>
                      </tr>

                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 text-slate-700">
                            {item.name} ({item.item_type})
                          </td>
                          <td className="p-3 text-right">{formatIDR(item.unit_price)}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right font-semibold text-slate-800">
                            {formatIDR(item.line_total)}
                          </td>
                        </tr>
                      ))}

                      {selectedOrder.overtime_hours > 0 && (
                        <tr>
                          <td className="p-3 text-slate-700">
                            Overtime Siaran ({selectedOrder.overtime_hours} Jam @ {selectedOrder.overtime_rate_percent}%)
                          </td>
                          <td className="p-3 text-right">
                            {formatIDR(Math.round(selectedOrder.overtime_total / selectedOrder.overtime_hours))}
                          </td>
                          <td className="p-3 text-center">{selectedOrder.overtime_hours}</td>
                          <td className="p-3 text-right font-semibold text-slate-800">
                            {formatIDR(selectedOrder.overtime_total)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & Discount & Total */}
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                  <div className="flex justify-between font-semibold text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatIDR(selectedOrder.subtotal)}</span>
                  </div>

                  {(selectedOrder.voucher_discount_amount && selectedOrder.voucher_discount_amount > 0) ? (
                    <div className="flex justify-between font-bold text-emerald-700">
                      <span>Diskon Voucher ({selectedOrder.voucher_code_snapshot || selectedOrder.voucher_code}):</span>
                      <span>-{formatIDR(selectedOrder.voucher_discount_amount || 0)}</span>
                    </div>
                  ) : null}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-base text-[#081A2E]">
                    <span>Total Estimasi:</span>
                    <span className="text-[#A40D35]">{formatIDR(selectedOrder.estimated_total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-700">Ubah Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                >
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                  <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
                  <option value={OrderStatus.COMPLETED}>Completed</option>
                  <option value={OrderStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      await generateInvoicePDF(selectedOrder);
                    } catch {
                      alert('Gagal membuat invoice PDF.');
                    }
                  }}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cetak PDF</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#081A2E] hover:bg-slate-800 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
