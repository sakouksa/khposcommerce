# 🛍️ Customer Storefront Application Manual

## 1. Overview
The **OptaPOS Customer Storefront** is a modern, high-performance e-commerce web application built on **React 19**, **Vite 8**, and **Tailwind CSS 3.4**. It delivers seamless shopping experiences, dynamic multi-currency calculations, Bakong KHQR checkout, and enterprise SEO.

---

## 2. Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------------------------------+
|                                    CUSTOMER STOREFRONT TECHNICAL STACK                                        |
+---------------------------------------------------------------------------------------------------------------+
|  UI Framework       | React 19 (^19.2.7) + TypeScript (^5.7.2)                                                |
|  Styling System     | Tailwind CSS (^3.4.17) + Lucide Icons + Framer Motion                                   |
|  Routing            | React Router v7 (^7.18.1) with Client-Side Rendering (CSR)                              |
|  Server State / API | @tanstack/react-query (^5.66.0) with Axios API client                                   |
|  Client State       | Zustand (^5.0.3) for Cart, Wishlist, Currency, Auth, and Settings                       |
|  SEO Management     | react-helmet-async (^3.0.0) + Schema.org JSON-LD structured data                        |
|  Internationalization| react-i18next (^15.4.1) with 5 Locales (Khmer, English, Thai, Vietnamese, Chinese)    |
|  Deployment Target  | Vercel Edge SPA (Rewrites to /index.html)                                               |
+---------------------------------------------------------------------------------------------------------------+
```

---

## 3. Directory Layout

```
customer-website/
├── src/
│   ├── components/          # UI Components (ProductCard, Navbar, Footer, Modal)
│   │   ├── common/          # PageTransition, ImageWithFallback, LoadingSkeleton
│   │   ├── ecommerce/       # CartDrawer, WishlistButton, PriceDisplay
│   │   └── seo/             # SEOHead.tsx with Schema.org JSON-LD generation
│   ├── config/              # Central SEO configuration (seo.ts) & site constants
│   ├── hooks/               # useCart, useWishlist, useAddToCart, useCurrency
│   ├── layouts/             # RootLayout, AuthLayout, AccountLayout
│   ├── locales/             # i18n translation files (km, en, th, vi, zh)
│   ├── pages/               # 28 Storefront Pages
│   │   ├── HomePage.tsx     # Hero banner, Flash deals, Categories, Featured items
│   │   ├── ProductListPage.tsx # Filtering by brand, category, price, attributes
│   │   ├── ProductDetailPage.tsx # Images gallery, variant selector, specs, reviews
│   │   ├── CartPage.tsx     # Item quantities, promo codes, shipping estimates
│   │   ├── CheckoutPage.tsx # Address selection, payment methods, Bakong KHQR
│   │   ├── TrackOrderPage.tsx # Live order tracking by tracking code
│   │   ├── BlogPage.tsx     # Tech articles and product buying guides
│   │   └── PolicyPage.tsx   # Dynamic terms, privacy, shipping, returns
│   ├── services/            # productService, cartService, orderService
│   └── stores/              # useCartStore, useWishlistStore, useAuthStore
```

---

## 4. Key Technical Features

1. **Centralized SEO**: Managed via [`src/config/seo.ts`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/config/seo.ts) and `<SEOHead />`, delivering dynamic titles, Canonical URLs, OpenGraph tags, and Schema.org Product/Organization schemas.
2. **Dual Currency Engine**: Seamlessly toggles prices between **USD ($)** and **Khmer Riel (៛)** using real-time NBC exchange rates stored in Zustand.
3. **Protected Private Routes**: `/cart`, `/checkout`, `/account/*`, `/auth/*`, and `/track/*` are strictly configured with `noindex, nofollow` and excluded from `robots.txt`.

---
*Related Docs:*
- [Customer Website SEO Manual](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/docs/seo.md)
- [Backend Store REST APIs](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/api/README.md)
