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
  Clock,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  MessageSquare,
  FileCode,
  Copy,
  Check,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [packageCount, setPackageCount] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [voucherCount, setVoucherCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

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

  const sqlMigrationSchema = `-- SKEMA SQL SUPABASE RESMI PRIME BROADCAST
-- Buka Supabase Studio -> SQL Editor -> Tempel & Jalankan query ini

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number TEXT NOT NULL DEFAULT '6285150555195',
  email TEXT NOT NULL DEFAULT 'primebroadcast.id@gmail.com',
  instagram_url TEXT DEFAULT '@primebroadcast_',
  tiktok_url TEXT DEFAULT '@primebroadcast_',
  company_description TEXT DEFAULT 'Prime Broadcast adalah vendor live streaming broadcast dan multi-camera profesional.',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_video_id TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  logo_path TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  duration_hours INT NOT NULL DEFAULT 4,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.package_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  unit_label TEXT NOT NULL DEFAULT '/unit',
  allow_quantity BOOLEAN NOT NULL DEFAULT true,
  min_quantity INT NOT NULL DEFAULT 1,
  max_quantity INT NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.overtime_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_percent INT NOT NULL DEFAULT 15,
  min_hours INT NOT NULL DEFAULT 1,
  max_hours INT NOT NULL DEFAULT 12,
  step_hours INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  unit_label TEXT NOT NULL DEFAULT '/event',
  allow_quantity BOOLEAN NOT NULL DEFAULT true,
  min_quantity INT NOT NULL DEFAULT 1,
  max_quantity INT NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_amount BIGINT NOT NULL,
  min_purchase_amount BIGINT NOT NULL DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link_url TEXT,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.about_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT DEFAULT 'Tentang Kami',
  title TEXT NOT NULL DEFAULT 'Tentang Prime Broadcast',
  description TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.founder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  short_bio TEXT,
  photo_path TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_image_path TEXT NOT NULL,
  year TEXT,
  display_order INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  caption TEXT,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_start_time TIME NOT NULL,
  venue_address TEXT NOT NULL,
  additional_notes TEXT,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  package_price BIGINT NOT NULL,
  package_duration_hours INT NOT NULL,
  overtime_hours INT NOT NULL DEFAULT 0,
  overtime_rate_percent INT NOT NULL DEFAULT 0,
  overtime_total BIGINT NOT NULL DEFAULT 0,
  voucher_id UUID REFERENCES public.vouchers(id) ON DELETE SET NULL,
  voucher_code TEXT,
  voucher_discount_amount BIGINT NOT NULL DEFAULT 0,
  subtotal BIGINT NOT NULL,
  estimated_total BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID,
  name TEXT NOT NULL,
  unit_price BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  line_total BIGINT NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Portfolio" ON public.portfolio_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Logos" ON public.client_logos FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Packages" ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Features" ON public.package_features FOR SELECT USING (true);
CREATE POLICY "Public Read Upgrades" ON public.upgrades FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Overtime" ON public.overtime_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Addons" ON public.addons FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read FAQ" ON public.faq_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Hero Slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read About" ON public.about_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Founders" ON public.founder_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Gallery Albums" ON public.gallery_albums FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Gallery Images" ON public.gallery_images FOR SELECT USING (true);

-- Public INSERT for orders
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Admin Full Access (authenticated users)
CREATE POLICY "Admin All Settings" ON public.site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Portfolio" ON public.portfolio_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Logos" ON public.client_logos FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Packages" ON public.packages FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Features" ON public.package_features FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Upgrades" ON public.upgrades FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Overtime" ON public.overtime_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Addons" ON public.addons FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Vouchers" ON public.vouchers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All FAQ" ON public.faq_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Hero Slides" ON public.hero_slides FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All About" ON public.about_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Founders" ON public.founder_profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Gallery Albums" ON public.gallery_albums FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Gallery Images" ON public.gallery_images FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Orders" ON public.orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin All Order Items" ON public.order_items FOR ALL TO authenticated USING (true);

-- Storage Buckets & Storage RLS Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-slides', 'hero-slides', true) ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "Public Read hero-slides" ON storage.objects FOR SELECT USING (bucket_id = 'hero-slides');
CREATE POLICY "Admin Insert hero-slides" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'hero-slides');
CREATE POLICY "Admin Update hero-slides" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'hero-slides');
CREATE POLICY "Admin Delete hero-slides" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'hero-slides');
`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlMigrationSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
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
          <button
            onClick={() => setShowSqlModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#081A2E] bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all"
          >
            <FileCode className="w-4 h-4 text-[#A40D35]" />
            <span>Skema SQL Supabase</span>
          </button>

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

      {/* SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200/80 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-[#A40D35]" />
                <h3 className="font-bold text-base text-[#081A2E]">
                  Skema DDL SQL Lengkap Supabase
                </h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap leading-relaxed">{sqlMigrationSchema}</pre>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Jalankan script ini di SQL Editor dashboard Supabase Anda.
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={copySqlToClipboard}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] shadow-sm transition-colors"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Semua SQL'}
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
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
