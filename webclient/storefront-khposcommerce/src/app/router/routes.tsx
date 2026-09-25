import React from 'react'

// ─── Lazy Loaded Public Pages ────────────────────────────────────────────────
export const HomePage = React.lazy(() => import('@/pages/HomePage'))
export const ProductListPage = React.lazy(() => import('@/pages/ProductListPage'))
export const ProductDetailPage = React.lazy(() => import('@/pages/ProductDetailPage'))
export const SearchPage = React.lazy(() => import('@/pages/SearchPage'))
export const CartPage = React.lazy(() => import('@/pages/CartPage'))
export const CheckoutPage = React.lazy(() => import('@/pages/CheckoutPage'))
export const CheckoutSuccessPage = React.lazy(() => import('@/pages/CheckoutSuccessPage'))
export const CheckoutFailedPage = React.lazy(() => import('@/pages/CheckoutFailedPage'))
export const TrackOrderPage = React.lazy(() => import('@/pages/TrackOrderPage'))
export const BlogPage = React.lazy(() => import('@/pages/BlogPage'))
export const BlogDetailPage = React.lazy(() => import('@/pages/BlogDetailPage'))
export const AboutPage = React.lazy(() => import('@/pages/AboutPage'))
export const ContactPage = React.lazy(() => import('@/pages/ContactPage'))
export const FAQPage = React.lazy(() => import('@/pages/FAQPage'))
export const WishlistPage = React.lazy(() => import('@/pages/WishlistPage'))
export const PolicyPage = React.lazy(() => import('@/pages/PolicyPage'))
export const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'))

// ─── Lazy Loaded Auth Pages ──────────────────────────────────────────────────
export const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage'))
export const RegisterPage = React.lazy(() => import('@/pages/auth/RegisterPage'))
export const ForgotPasswordPage = React.lazy(() => import('@/pages/auth/ForgotPasswordPage'))
export const ResetPasswordPage = React.lazy(() => import('@/pages/auth/ResetPasswordPage'))

// ─── Lazy Loaded Account Pages ───────────────────────────────────────────────
export const AccountDashboard = React.lazy(() => import('@/pages/account/DashboardPage'))
export const AccountProfile = React.lazy(() => import('@/pages/account/ProfilePage'))
export const AccountOrders = React.lazy(() => import('@/pages/account/OrdersPage'))
export const AccountOrderDetail = React.lazy(() => import('@/pages/account/OrderDetailPage'))
export const AccountAddresses = React.lazy(() => import('@/pages/account/AddressesPage'))
export const AccountReviews = React.lazy(() => import('@/pages/account/ReviewsPage'))
export const AccountSettings = React.lazy(() => import('@/pages/account/SettingsPage'))
