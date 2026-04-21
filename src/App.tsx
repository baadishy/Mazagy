import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Header, Footer } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ProductListingPage } from "./pages/ProductListingPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { AuthPage } from "./pages/AuthPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SellerPage } from "./pages/SellerPage";
import { DashboardLayout, DashboardPage } from "./pages/DashboardPage";
import { AddProductPage } from "./pages/AddProductPage";
import { SupportPage } from "./pages/SupportPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import SellerTermsPage from "./pages/SellerTermsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { CommissionChangeModal } from "./components/CommissionChangeModal";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" richColors />
      <CommissionChangeModal />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Main Store Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/products"
            element={
              <MainLayout>
                <ProductListingPage />
              </MainLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <MainLayout>
                <ProductDetailsPage />
              </MainLayout>
            }
          />
          <Route
            path="/seller/:sellerId"
            element={
              <MainLayout>
                <SellerPage />
              </MainLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            }
          />
          <Route
            path="/support"
            element={
              <MainLayout>
                <SupportPage />
              </MainLayout>
            }
          />
          <Route
            path="/seller/terms"
            element={
              <MainLayout>
                <SellerTermsPage />
              </MainLayout>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<AuthPage type="login" />} />
          <Route path="/signup" element={<AuthPage type="signup" />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Dashboard Routes */}
          <Route
            path="/seller"
            element={
              <DashboardLayout title="لوحة تحكم البائع">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <DashboardLayout title="الطلبات">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/seller/products"
            element={
              <DashboardLayout title="المنتجات">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route path="/seller/add-product" element={<AddProductPage />} />
          <Route path="/seller/edit-product/:id" element={<AddProductPage />} />
          <Route
            path="/seller/earnings"
            element={
              <DashboardLayout title="الأرباح">
                <DashboardPage />
              </DashboardLayout>
            }
          />

          <Route
            path="/admin"
            element={
              <DashboardLayout title="لوحة تحكم المدير">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <DashboardLayout title="الطلبات">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/products"
            element={
              <DashboardLayout title="المنتجات">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/earnings"
            element={
              <DashboardLayout title="الأرباح">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <DashboardLayout title="المستخدمين">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <DashboardLayout title="البائعين">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/sellers/:id"
            element={
              <DashboardLayout title="تفاصيل البائع">
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <DashboardLayout title="إعدادات المنصة">
                <DashboardPage />
              </DashboardLayout>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
