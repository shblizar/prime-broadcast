import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { formatIDR } from '../../utils/currency';
import { generateWhatsAppMessage, normalizeWhatsAppNumber } from '../../utils/whatsapp';
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
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      o.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.package_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" id="admin-orders-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#081A2E]">
            Pesanan & Reservasi Klien
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau seluruh data reservasi, rincian paket, dan riwayat pesanan
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor invoice, PIC, lembaga..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A40D35] transition-all"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A40D35] cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value={OrderStatus.PENDING}>Pending (Menunggu)</option>
            <option value={OrderStatus.CONFIRMED}>Confirmed (Terkonfirmasi)</option>
            <option value={OrderStatus.IN_PROGRESS}>In Progress (Sedang Berjalan)</option>
            <option value={OrderStatus.COMPLETED}>Completed (Selesai)</option>
            <option value={OrderStatus.CANCELLED}>Cancelled (Dibatalkan)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat data pesanan...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tidak ada data pesanan yang sesuai dengan kriteria filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/60">
                <tr>
                  <th className="px-6 py-3.5">Invoice</th>
                  <th className="px-6 py-3.5">Klien & Lembaga</th>
                  <th className="px-6 py-3.5">Jadwal Event</th>
                  <th className="px-6 py-3.5">Paket Utama</th>
                  <th className="px-6 py-3.5">Nilai Kontrak</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
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
                        <div className="font-medium">{order.package_name}</div>
                        {order.overtime_hours > 0 && (
                          <div className="text-[10px] text-amber-700 font-medium">
                            + {order.overtime_hours} jam overtime
                          </div>
                        )}
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
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Rincian</span>
                        </button>

                        <a
                          href={waHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WA</span>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200/80 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Rincian Invoice
                </div>
                <h3 className="font-bold text-lg text-[#A40D35]">
                  {selectedOrder.invoice_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Customer & Event Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">PIC Pemesan</div>
                      <div className="font-bold text-slate-900">{selectedOrder.customer_name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Lembaga / Perusahaan</div>
                      <div className="font-bold text-slate-900">{selectedOrder.organization_name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">WhatsApp</div>
                      <div className="font-bold text-slate-900">{selectedOrder.whatsapp}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Email</div>
                      <div className="font-bold text-slate-900">{selectedOrder.email}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Tanggal Acara</div>
                      <div className="font-bold text-slate-900">{selectedOrder.event_date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Jam Mulai</div>
                      <div className="font-bold text-slate-900">{selectedOrder.event_start_time} WIB</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <div className="text-[10px] text-slate-400">Alamat Venue</div>
                      <div className="font-semibold text-slate-900 leading-snug">
                        {selectedOrder.venue_address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedOrder.additional_notes && (
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/80">
                  <div className="font-bold text-amber-900 text-[11px] mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Catatan Tambahan Klien:
                  </div>
                  <div className="text-amber-800 leading-relaxed">{selectedOrder.additional_notes}</div>
                </div>
              )}

              {/* Order Items Breakdown */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Rincian Komponen Biaya</h4>
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="p-3.5">Item / Layanan</th>
                        <th className="p-3.5 text-right">Harga Satuan</th>
                        <th className="p-3.5 text-center">Qty</th>
                        <th className="p-3.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3.5 font-semibold text-slate-900">
                          {selectedOrder.package_name_snapshot || selectedOrder.package_name} ({selectedOrder.package_duration_snapshot || selectedOrder.package_duration_hours} Jam)
                        </td>
                        <td className="p-3.5 text-right">{formatIDR(selectedOrder.package_price_snapshot || selectedOrder.package_price || 0)}</td>
                        <td className="p-3.5 text-center">1</td>
                        <td className="p-3.5 text-right font-bold">
                          {formatIDR(selectedOrder.package_price_snapshot || selectedOrder.package_price || 0)}
                        </td>
                      </tr>

                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3.5 text-slate-700">
                            {item.name} ({item.item_type})
                          </td>
                          <td className="p-3.5 text-right">{formatIDR(item.unit_price)}</td>
                          <td className="p-3.5 text-center">{item.quantity}</td>
                          <td className="p-3.5 text-right font-semibold">
                            {formatIDR(item.line_total)}
                          </td>
                        </tr>
                      ))}

                      {selectedOrder.overtime_hours > 0 && (
                        <tr>
                          <td className="p-3.5 text-slate-700">
                            Overtime Siaran ({selectedOrder.overtime_hours} Jam @ {selectedOrder.overtime_rate_percent}%)
                          </td>
                          <td className="p-3.5 text-right">
                            {formatIDR(Math.round(selectedOrder.overtime_total / selectedOrder.overtime_hours))}
                          </td>
                          <td className="p-3.5 text-center">{selectedOrder.overtime_hours}</td>
                          <td className="p-3.5 text-right font-semibold">
                            {formatIDR(selectedOrder.overtime_total)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal & Discount & Total */}
                <div className="mt-4 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2">
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

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-[#081A2E]">
                    <span>Total Estimasi:</span>
                    <span className="text-[#A40D35]">{formatIDR(selectedOrder.estimated_total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-600">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#A40D35]"
                >
                  <option value={OrderStatus.PENDING}>Pending</option>
                  <option value={OrderStatus.CONFIRMED}>Confirmed</option>
                  <option value={OrderStatus.IN_PROGRESS}>In Progress</option>
                  <option value={OrderStatus.COMPLETED}>Completed</option>
                  <option value={OrderStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
