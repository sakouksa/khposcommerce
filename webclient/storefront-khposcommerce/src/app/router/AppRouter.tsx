import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import StorefrontLayout from '@/layouts/StorefrontLayout'
import AccountLayout from '@/layouts/AccountLayout'
import AuthLayout from '@/layouts/AuthLayout'
import Spinner from '@/components/ui/Spinner'
import { ProtectedRoute, GuestRoute } from './RouteGuards'

const ScrollToTopOnNavigate: React.FC = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
import {
  HomePage,
  ProductListPage,
  ProductDetailPage,
  SearchPage,
  CartPage,
  CheckoutPage,
  CheckoutSuccessPage,
  CheckoutFailedPage,
  TrackOrderPage,
  BlogPage,
  BlogDetailPage,
  AboutPage,
  ContactPage,
  FAQPage,
  WishlistPage,
  PolicyPage,
  NotFoundPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AccountDashboard,
  AccountProfile,
  AccountOrders,
  AccountOrderDetail,
  AccountAddresses,
  AccountReviews,
  AccountSettings,
} from './routes'

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
)

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTopOnNavigate />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* ── Public Storefront Shell ─────────────────────────────────── */}
          <Route element={<StorefrontLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductListPage />} />
            <Route path="products/:slug" element={<ProductDetailPage />} />
            <Route path="promotions" element={<ProductListPage />} />
            <Route path="promotion" element={<ProductListPage />} />
            <Route path="deals" element={<ProductListPage />} />
            <Route path="offers" element={<ProductListPage />} />
            <Route path="category/:slug" element={<ProductListPage />} />
            <Route path="brand/:slug" element={<ProductListPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="checkout/failed" element={<CheckoutFailedPage />} />
            <Route path="track" element={<TrackOrderPage />} />
            <Route path="track/:number" element={<TrackOrderPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogDetailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="faqs" element={<FAQPage />} />

            {/* Policy & Legal Pages */}
            <Route path="terms" element={<PolicyPage />} />
            <Route path="privacy" element={<PolicyPage />} />
            <Route path="shipping" element={<PolicyPage />} />
            <Route path="returns" element={<PolicyPage />} />

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* ── Guest Only Authentication Routes ────────────────────────── */}
          <Route
            path="auth"
            element={
              <GuestRoute>
                <AuthLayout />
              </GuestRoute>
            }
          >
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* ── Protected Customer Account Dashboard Routes ─────────────── */}
          <Route
            path="account"
            element={
              <ProtectedRoute>
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AccountDashboard />} />
            <Route path="profile" element={<AccountProfile />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="orders/:number" element={<AccountOrderDetail />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="reviews" element={<AccountReviews />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRouter
