import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SectionAnimationProvider } from './contexts/SectionAnimationContext';
import { PublicDataProvider } from './contexts/PublicDataContext';

// Public Pages (kept in main bundle for instant initial render)
import { HomePage } from './pages/HomePage';
import { PackagePage } from './pages/PackagePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PolicyPage } from './pages/PolicyPage';

// Admin Pages (dynamically imported / code-split to reduce initial bundle size)
const OurProductsPage = lazy(() => import('./pages/OurProductsPage').then((m) => ({ default: m.OurProductsPage })));
const LoginPage = lazy(() => import('./pages/admin/LoginPage').then((m) => ({ default: m.LoginPage })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const AdminProtectedRoute = lazy(() =>
  import('./components/AdminProtectedRoute').then((m) => ({ default: m.AdminProtectedRoute }))
);
const AdminDashboardPage = lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminOrdersPage = lazy(() =>
  import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage }))
);
const AdminHeroSlidesPage = lazy(() =>
  import('./pages/admin/AdminHeroSlidesPage').then((m) => ({ default: m.AdminHeroSlidesPage }))
);
const AdminAboutSettingsPage = lazy(() =>
  import('./pages/admin/AdminAboutSettingsPage').then((m) => ({ default: m.AdminAboutSettingsPage }))
);
const AdminFoundersPage = lazy(() =>
  import('./pages/admin/AdminFoundersPage').then((m) => ({ default: m.AdminFoundersPage }))
);
const AdminGalleryPage = lazy(() =>
  import('./pages/admin/AdminGalleryPage').then((m) => ({ default: m.AdminGalleryPage }))
);
const AdminPackagesPage = lazy(() =>
  import('./pages/admin/AdminPackagesPage').then((m) => ({ default: m.AdminPackagesPage }))
);
const AdminUpgradesPage = lazy(() =>
  import('./pages/admin/AdminUpgradesPage').then((m) => ({ default: m.AdminUpgradesPage }))
);
const AdminOvertimePage = lazy(() =>
  import('./pages/admin/AdminOvertimePage').then((m) => ({ default: m.AdminOvertimePage }))
);
const AdminAddonsPage = lazy(() =>
  import('./pages/admin/AdminAddonsPage').then((m) => ({ default: m.AdminAddonsPage }))
);
const AdminVouchersPage = lazy(() =>
  import('./pages/admin/AdminVouchersPage').then((m) => ({ default: m.AdminVouchersPage }))
);
const AdminPortfolioPage = lazy(() =>
  import('./pages/admin/AdminPortfolioPage').then((m) => ({ default: m.AdminPortfolioPage }))
);
const AdminClientLogosPage = lazy(() =>
  import('./pages/admin/AdminClientLogosPage').then((m) => ({ default: m.AdminClientLogosPage }))
);
const AdminFaqPage = lazy(() =>
  import('./pages/admin/AdminFaqPage').then((m) => ({ default: m.AdminFaqPage }))
);
const AdminSettingsPage = lazy(() =>
  import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage }))
);
const AdminDatabasePage = lazy(() =>
  import('./pages/admin/AdminDatabasePage').then((m) => ({ default: m.AdminDatabasePage }))
);

// Professional, minimal loading fallback for Admin portal routes
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#081A2E]">
      <div className="w-9 h-9 border-3 border-slate-200 border-t-[#081A2E] rounded-full animate-spin mb-4" />
      <p className="text-xs font-semibold text-[#081A2E] tracking-wide">
        Memuat Portal Administrator...
      </p>
    </div>
  );
}

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 404 NotFound Page
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-4xl font-extrabold text-[#A40D35] mb-2">404</div>
      <h1 className="text-xl font-bold text-[#081A2E] mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6">
        Halaman yang Anda cari tidak tersedia atau alamat URL telah dipindahkan.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SectionAnimationProvider>
        <PublicDataProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route
                path="/our-products"
                element={
                  <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm">Loading...</div>}>
                    <OurProductsPage />
                  </Suspense>
                }
              />
              <Route path="/paket" element={<PackagePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/faq" element={<Navigate to="/#faq" replace />} />
              <Route path="/aturan-kebijakan" element={<PolicyPage />} />

              {/* Admin Auth Route */}
              <Route
                path="/admin/login"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <LoginPage />
                  </Suspense>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <AdminProtectedRoute />
                  </Suspense>
                }
              >
                <Route element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="hero-slides" element={<AdminHeroSlidesPage />} />
                  <Route path="about" element={<AdminAboutSettingsPage />} />
                  <Route path="founders" element={<AdminFoundersPage />} />
                  <Route path="gallery" element={<AdminGalleryPage />} />
                  <Route path="packages" element={<AdminPackagesPage />} />
                  <Route path="upgrades" element={<AdminUpgradesPage />} />
                  <Route path="overtime" element={<AdminOvertimePage />} />
                  <Route path="addons" element={<AdminAddonsPage />} />
                  <Route path="vouchers" element={<AdminVouchersPage />} />
                  <Route path="portfolio" element={<AdminPortfolioPage />} />
                  <Route path="client-logos" element={<AdminClientLogosPage />} />
                  <Route path="faq" element={<AdminFaqPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                  <Route path="database" element={<AdminDatabasePage />} />
                </Route>
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </PublicDataProvider>
      </SectionAnimationProvider>
    </AuthProvider>
  );
}
