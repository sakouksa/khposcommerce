# Customer Website — Architecture Documentation (ឯកសារស្ថាបត្យកម្ម Codebase)

## ១. សេចក្ដីផ្ដើម (Introduction & Overview)

ឯកសារនេះត្រូវបានរៀបចំឡើងដើម្បីពន្យល់ពី **Software Architecture, Design System, Folder Structure, State Management, Data Flow, SEO, និង Service Layer** នៃគម្រោង `customer-website` សម្រាប់ Developer ថ្មីដែលទើបតែចូលរួមជាមួយ Project ឱ្យយល់ដឹងពីប្រព័ន្ធទាំងមូលបានយ៉ាងលឿនបំផុត។

---

## ២. គោលការណ៍ស្ថាបត្យកម្មស្នូល (Core Architectural Principles)

1. **Write Once → Reuse Everywhere (Where It Makes Sense):**
   * ប្រសិនបើសមាសភាគ (Component) ឬមុខងារ (Function) ត្រូវប្រើច្រើនជាងមួយកន្លែង និងមានទំនួលខុសត្រូវដូចគ្នា ត្រូវរៀបចំជា Shared Component / Shared Hook។
   * មិនត្រូវបង្កើត File ស្ទួនៗ (Duplicates) ឡើយ។
2. **Clear Separation of Concerns (ការបែងចែកទំនួលខុសត្រូវ):**
   * **UI Primitives (`src/components/ui/`)**: មិនជាប់ពាក់ព័ន្ធនឹង Domain Business ឡើយ (`Button`, `Input`, `Badge`, `Card`, `Skeleton`, `Spinner`)។
   * **Domain E-Commerce Components (`src/components/ecommerce/`)**: ផ្ទុក Business Logic នៃ E-Commerce (`ProductCard`, `ProductPrice`, `RatingStars`, `WishlistButton`, `AddToCartButton`, `OrderStatusBadge`)។
   * **Custom Domain Hooks (`src/hooks/`)**: គ្រប់គ្រង Business State & Mutations (`useWishlist`, `useAddToCart`, `useInfiniteProducts`, `useSearch`)។
   * **API Service Layer (`src/services/`)**: ធ្វើការទាក់ទងផ្ទាល់ជាមួយ Laravel REST API Endpoints។
   * **Page Components (`src/pages/`)**: មានតួនាទីត្រឹមតែ Compose Layouts, Components, និង Hooks ប៉ុណ្ណោះ ដោយមិនត្រូវសរសេរ Raw Axios Calls ឬ Huge Filtering Logic ក្នុង JSX ឡើយ។
3. **Strict Type Safety:**
   * គ្រប់ API Data Models ត្រូវមាន Type Definition ច្បាស់លាស់ក្នុង `src/types/store.ts`។

---

## ៣. រចនាសម្ព័ន្ធ Folder ស្ដង់ដារ (Project Directory Tree)

```text
customer-website/
├── docs/                                  # Developer Guides & Architecture Docs
│   ├── customer-website-architecture.md
│   └── customer-website-developer-guide.md
├── public/                                # Public Static Assets (favicon, robots, sitemap)
├── src/
│   ├── app/                               # Application Root & Bootstrapping Layer
│   │   ├── providers/                     # React Query & Theme Providers
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── index.ts
│   │   ├── router/                        # Routing & Route Guards
│   │   │   ├── AppRouter.tsx              # Main Application Routes Definition
│   │   │   ├── RouteGuards.tsx            # ProtectedRoute & GuestRoute
│   │   │   ├── routes.tsx                 # Lazy Page Route Declarations
│   │   │   └── index.ts
│   │   ├── App.tsx                        # Clean App Composition Root
│   │   └── index.ts
│   ├── api/                               # HTTP Network Client Layer
│   │   ├── client.ts                      # Axios instance with Interceptors & Multi-lang Errors
│   │   └── index.ts
│   ├── assets/                            # Global SVGs & Images
│   ├── components/                        # Presentation & Component Layer
│   │   ├── ui/                            # Base UI Primitives (Design System)
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── index.ts
│   │   ├── common/                        # Shared Cross-Cutting Components
│   │   │   ├── EmptyState.tsx             # Standard Empty State Presets
│   │   │   ├── ErrorState.tsx             # Error & Retry Component
│   │   │   ├── ImageWithFallback.tsx      # Lazy Image with Error Fallbacks
│   │   │   ├── InfiniteScrollSentinel.tsx # Intersection Observer Infinite Scroll
│   │   │   ├── CompareModal.tsx           # Product Comparison Modal
│   │   │   ├── LocationPickerModal.tsx
│   │   │   ├── OfflineBanner.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── TrackOrderModal.tsx
│   │   │   ├── WarrantyCheckModal.tsx
│   │   │   └── index.ts
│   │   ├── ecommerce/                     # Domain E-Commerce Components
│   │   │   ├── ProductCard.tsx            # Master ProductCard (default, compact, featured, horizontal)
│   │   │   ├── ProductPrice.tsx           # Price formatting & currency conversion
│   │   │   ├── RatingStars.tsx            # 5-star rating bar & review count
│   │   │   ├── WishlistButton.tsx         # Heart wishlist toggle with animation
│   │   │   ├── AddToCartButton.tsx        # Add to cart with spinner & success check
│   │   │   ├── OrderStatusBadge.tsx       # Color-mapped order status badge
│   │   │   ├── StockBadge.tsx             # Stock level indicator
│   │   │   ├── ProductSection.tsx         # Reusable homepage product section wrapper
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── BrandCard.tsx
│   │   │   ├── CouponCard.tsx
│   │   │   └── index.ts
│   │   ├── layout/                        # Layout Shell Components
│   │   │   ├── Header.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── MegaMenu.tsx
│   │   │   ├── TopUtilityBar.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── MobileBottomNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── seo/                           # SEO & Meta Engine
│   │   │   ├── SEOHead.tsx                # Dynamic OpenGraph, Canonical, Schema.org generators
│   │   │   └── index.ts
│   │   └── storefront/                    # Storefront Section Blocks & Banners
│   ├── constants/
│   │   └── queryKeys.ts                   # Centralized React Query key dictionary
│   ├── hooks/                             # Custom Business & Utility Hooks
│   │   ├── useAddToCart.ts                # Cart addition with feedback & drawer toggle
│   │   ├── useWishlist.ts                 # Wishlist mutations & optimistic updates
│   │   ├── useInfiniteProducts.ts         # TanStack Query infinite scroll
│   │   ├── useSearch.ts                   # Global search query & mode sync
│   │   ├── useClickOutside.ts
│   │   ├── useDebounce.ts
│   │   ├── useScrollPosition.ts
│   │   └── index.ts
│   ├── layouts/                           # Page Layout Shells
│   │   ├── StorefrontLayout.tsx           # Public storefront shell
│   │   ├── AccountLayout.tsx              # Authenticated customer account layout
│   │   └── AuthLayout.tsx                 # Login/Register layout
│   ├── lib/                               # Core Utilities & Libraries
│   │   ├── api.ts                         # Direct export of unified API client
│   │   ├── i18n.ts                        # i18next Multi-language config
│   │   ├── icons.tsx                      # Dynamic SVG icon helpers
│   │   ├── motion.ts                      # Framer Motion animation variants
│   │   └── utils.ts                       # Pure helper utilities (cn, formatCurrency, formatDate, calculateDiscount)
│   ├── locales/                           # Language Translation JSON Files (en, km, th, vi, zh)
│   ├── pages/                             # Application View Pages
│   │   ├── account/                       # Dashboard, Profile, Orders, OrderDetail, Addresses, Reviews, Settings
│   │   ├── auth/                          # Login, Register, ForgotPassword, ResetPassword
│   │   ├── HomePage.tsx
│   │   ├── ProductListPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── CheckoutSuccessPage.tsx
│   │   ├── CheckoutFailedPage.tsx
│   │   ├── TrackOrderPage.tsx
│   │   ├── WishlistPage.tsx
│   │   ├── BlogPage.tsx
│   │   ├── BlogDetailPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── FAQPage.tsx
│   │   ├── PolicyPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/                          # Backend API Services
│   │   ├── authService.ts
│   │   ├── brandService.ts
│   │   ├── cartService.ts
│   │   ├── categoryService.ts
│   │   ├── orderService.ts
│   │   ├── productService.ts
│   │   ├── storeSettingsService.ts
│   │   ├── wishlistService.ts
│   │   └── index.ts
│   ├── stores/                            # Client State Management (Zustand)
│   │   ├── authStore / index.ts           # Customer Auth, Settings, Wishlist, Compare
│   │   ├── cartStore.ts                   # Active Shopping Cart Store
│   │   └── searchStore.ts                 # Search Query & History Store
│   ├── types/
│   │   └── store.ts                       # Domain TypeScript Interfaces
│   ├── App.css
│   ├── App.tsx                            # Root Re-export
│   ├── index.css                          # Tailwind CSS & Global Design Tokens
│   └── main.tsx                           # Application Entry Point
```

---

## ៤. ការគ្រប់គ្រង State (State Management Architecture)

គម្រោងនេះបែងចែក State ជាពីរប្រភេទយ៉ាងច្បាស់លាស់៖

### ១. Server State (គ្រប់គ្រងដោយ TanStack Query v5)
* **គោលបំណង:** សម្រាប់ទិន្នន័យដែលទាញចេញពី Server (Products, Categories, Brands, Orders, FAQs, Blog posts)។
* **អត្ថប្រយោជន៍:** គ្រប់គ្រង Caching, Background Refetching, Stale Time, Retry, និង Pagination ដោយស្វ័យប្រវត្តិ។
* **Query Keys:** គ្រប់ Query Key ត្រូវកំណត់ក្នុង [`src/constants/queryKeys.ts`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/constants/queryKeys.ts)។

### ២. Client State (គ្រប់គ្រងដោយ Zustand)
* **`useAuthStore`** ([`src/stores/index.ts`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/stores/index.ts)): ផ្ទុក User Session Token, Customer Profile និង Login/Logout actions។
* **`useCartStore`** ([`src/stores/cartStore.ts`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/stores/cartStore.ts)): ផ្ទុក Cart Items, Subtotal, Discount, Coupon Code, និង Drawer Open/Close State។
* **`useWishlistStore`**: ផ្ទុក Wishlist Item IDs សម្រាប់ Optimistic UI Instant Update។
* **`useCompareStore`**: ផ្ទុក Compare List (រហូតដល់ 4 ផលិតផល)។
* **`useSettingsStore`**: ផ្ទុក Site Currency, Exchange Rates, Theme (Dark/Light) និង Localized Settings។

---

## ៥. ស្ថាបត្យកម្ម API Client & Services (API Integration Flow)

Data Flow ត្រូវតែដើរតាមទិសដៅនេះជានិច្ច៖
```text
UI Component / Page
        ↓
Custom Domain Hook (e.g. useAddToCart, useWishlist, useInfiniteProducts)
        ↓
API Service Module (e.g. cartService, wishlistService, productService)
        ↓
Unified Axios Client (src/api/client.ts)
        ↓
Laravel 12 Backend REST API (api/v1/store/...)
```

* **មិនត្រូវ** ហៅ `axios.get` ឬ `axios.post` ដោយផ្ទាល់នៅក្នុង JSX Component ឡើយ។
* **ត្រូវតែ** បង្កើត method នៅក្នុង `src/services/` ហើយហៅតាម Service ឬ Hook ជានិច្ច។

---

## ៦. ប្រព័ន្ធ SEO & Structured Data (SEO Architecture)

គ្រប់ទំព័រ (Page) ទាំងអស់ត្រូវតែ mount `<SEOHead />` ពី [`src/components/seo/SEOHead.tsx`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/components/seo/SEOHead.tsx)៖

* **Title & Meta Description**: Clean text គ្មាន HTML tags, auto-truncated 160 characters។
* **Canonical URL**: កាត់បន្ថយ Duplicate Content URLs និង normalize ទៅជា Absolute Clean URL។
* **OpenGraph & Twitter Card**: Auto locale mapping (`en_US`, `km_KH`, `th_TH`, `vi_VN`, `zh_CN`)។
* **JSON-LD Schema.org Generators**:
  * `Product` Schema (Price, Currency, Stock Status, Rating, Brand, Seller) លើទំព័រ Product Detail។
  * `BreadcrumbList` Schema លើទំព័រទាំងអស់។
  * `FAQPage` Schema លើទំព័រ FAQs។
  * `Article` Schema លើទំព័រ Blog Detail។
  * `WebSite` & `Organization` Schema លើទំព័រ StorefrontLayout។
  * `LocalBusiness` Schema លើទំព័រ Contact Us។
* **Robots Directives**: ទំព័រឯកជនភាពដូចជា `/cart`, `/checkout`, `/search`, `/wishlist`, `/account/*`, `/auth/*` ត្រូវបានកំណត់ `robots="noindex, follow"` ឬ `robots="noindex, nofollow"` ដើម្បីកុំឱ្យ Google Index ទំព័រឯកជន។
