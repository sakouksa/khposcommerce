# 🏢 មគ្គុទ្ទេសក៍លម្អិតកម្រិត Enterprise៖ ការកែលម្អប្រព័ន្ធ និងការរៀបចំ Hosting មួយជំហានម្តងៗ ពីដើមដល់ចប់
# (The Definitive Enterprise Production Hosting & Complete System Audit Guide)

> **គម្រោង (Project):** Enterprise Omnichannel E-Commerce + Point of Sale (POS) System  
> **គោលបំណង (Purpose):** ឯកសារនេះត្រូវបានរៀបចំឡើងជា **មគ្គុទ្ទេសក៍ពេញលេញ និងលម្អិតបំផុត (Master Guide)** ពន្យល់រាល់ការកែលម្អប្រព័ន្ធ និងជំហាននីមួយៗក្នុងការយកគម្រោងទាំងមូលទៅដាក់ដំណើរការលើ **Production Server (Hosting & Deployment)** ពីដើមរហូតដល់ចប់ ដោយគ្មានការរំលងជំហានណាមួយឡើយ។  
> **ភាសា (Language):** ភាសាខ្មែរ (Khmer) បកស្រាយយ៉ាងក្បោះក្បាយ អមដោយ English Technical Terms និង Command ជាក់ស្ដែង ១០០%។

---

# 📑 តារាងមាតិកាពេញលេញ (Complete Table of Contents)

1. [ជំពូកទី ១៖ សវនកម្មប្រព័ន្ធ និងការកែលម្អទាំងអស់ពីដើមដល់ចប់ (Full System Audit & Changelog)](#ជំពូកទី-១-សវនកម្មប្រព័ន្ធ-និងការកែលម្អទាំងអស់ពីដើមដល់ចប់)
   - [១.១. ការធ្វើ Full Technical SEO Audit & Google Search Optimization](#១១-ការធ្វើ-full-technical-seo-audit--google-search-optimization)
   - [១.២. ការធ្វើ Global DRY Refactor & Master Shared Components](#១២-ការធ្វើ-global-dry-refactor--master-shared-components)
   - [១.៣. ស្ថាបត្យកម្ម Clean Architecture & Modular App Layer](#១៣-ស្ថាបត្យកម្ម-clean-architecture--modular-app-layer)
   - [១.៤. ការដំឡើង Brand Logo & Favicon Suite ផ្លូវការ](#១៤-ការដំឡើង-brand-logo--favicon-suite-ផ្លូវការ)
2. [ជំពូកទី ២៖ ស្ថាបត្យកម្មប្រព័ន្ធ និងលំហូរទិន្នន័យ (System Architecture & Network Topology)](#ជំពូកទី-២-ស្ថាបត្យកម្មប្រព័ន្ធ-និងលំហូរទិន្នន័យ)
   - [២.១. ការបែងចែក Sub-Projects ក្នុង Monorepo](#២១-ការបែងចែក-sub-projects-ក្នុង-monorepo)
   - [២.២. ដ្យាក្រាមលំហូរទិន្នន័យ និង Network Ports](#២២-ដ្យាក្រាមលំហូរទិន្នន័យ-និង-network-ports)
3. [ជំពូកទី ៣៖ ការជ្រើសរើសទំហំ Server និង Cloud Provider (Hardware Sizing Matrix)](#ជំពូកទី-៣-ការជ្រើសរើសទំហំ-server-និង-cloud-provider)
4. [ជំពូកទី ៤៖ មគ្គុទ្ទេសក៍ Hosting លើ VPS / Dedicated Server (Docker Production) — មួយជំហានម្តងៗ](#ជំពូកទី-៤-មគ្គុទ្ទេសក៍-hosting-លើ-vps--dedicated-server-docker-production)
   - [ជំហានទី ១៖ ការតភ្ជាប់ SSH និងការពង្រឹងសុវត្ថិភាពម៉ាស៊ីន (Server Hardening & Firewall)](#ជំហានទី-១-ការតភ្ជាប់-ssh-និងការពង្រឹងសុវត្ថិភាពម៉ាស៊ីន)
   - [ជំហានទី ២៖ ការដំឡើង Docker Engine & Docker Compose v2](#ជំហានទី-២-ការដំឡើង-docker-engine--docker-compose-v2)
   - [ជំហានទី ៣៖ ការចង Domain Name & DNS Records (A Records)](#ជំហានទី-៣-ការចង-domain-name--dns-records)
   - [ជំហានទី ៤៖ ការ Clone Code និងការកំណត់ Environment Variables (.env) លម្អិត](#ជំហានទី-៤-ការ-clone-code-និងការកំណត់-environment-variables-លម្អិត)
   - [ជំហានទី ៥៖ ការដំឡើង SSL/TLS Certificate ដោយឥតគិតថ្លៃ (Let's Encrypt Certbot)](#ជំហានទី-៥-ការដំឡើង-ssltls-certificate-ដោយឥតគិតថ្លៃ)
   - [ជំហានទី ៦៖ ការ Launch Docker Production Containers](#ជំហានទី-៦-ការ-launch-docker-production-containers)
   - [ជំហានទី ៧៖ Database Migration, Initial Seeding & Production Cache](#ជំហានទី-៧-database-migration-initial-seeding--production-cache)
   - [ជំហានទី ៨៖ ការរៀបចំ Cron Job (Scheduler) និង Queue Worker](#ជំហានទី-៨-ការរៀបចំ-cron-job-និង-queue-worker)
   - [ជំហានទី ៩៖ របៀប Update Code ថ្មីដោយមិនបាច់បិទ Website (Zero-Downtime Deploy)](#ជំហានទី-៩-របៀប-update-code-ថ្មីដោយមិនបាច់បិទ-website)
   - [ជំហានទី ១០៖ ប្រព័ន្ធ Backup Database ដោយស្វ័យប្រវត្តិ (Automated Backup & Retention)](#ជំហានទី-១០-ប្រព័ន្ធ-backup-database-ដោយស្វ័យប្រវត្តិ)
5. [ជំពូកទី ៥៖ មគ្គុទ្ទេសក៍ Hosting លើ Serverless Cloud (Vercel + Render / Railway)](#ជំពូកទី-៥-មគ្គុទ្ទេសក៍-hosting-លើ-serverless-cloud)
   - [៥.១. ការ Deploy Customer Website លើ Vercel](#៥១-ការ-deploy-customer-website-លើ-vercel)
   - [៥.២. ការ Deploy Admin Dashboard & POS លើ Vercel](#៥២-ការ-deploy-admin-dashboard--pos-លើ-vercel)
   - [៥.៣. ការ Deploy Laravel Backend + PostgreSQL + Redis លើ Render / Railway](#៥៣-ការ-deploy-laravel-backend--postgresql--redis-លើ-render--railway)
6. [ជំពូកទី ៦៖ បញ្ហាដែលជួបញឹកញាប់ និងវិធីដោះស្រាយ (Troubleshooting & FAQs)](#ជំពូកទី-៦-បញ្ហាដែលជួបញឹកញាប់-និងវិធីដោះស្រាយ)

---

# ជំពូកទី ១៖ សវនកម្មប្រព័ន្ធ និងការកែលម្អទាំងអស់ពីដើមដល់ចប់

ផ្នែកនេះបង្ហាញយ៉ាងលម្អិតអំពីអ្វីៗទាំងអស់ដែលត្រូវបាន Audit, Refactor, ដំឡើង និងកែលម្អនៅក្នុងគម្រោង៖

---

## ១.១. ការធ្វើ Full Technical SEO Audit & Google Search Optimization

### 🔴 បញ្ហាដើម (Initial Problems):
1. **គ្មាន Server-Side XML Sitemap:** Website ដំណើរការជា React Single Page Application (SPA) ដែល Render តាម Client-side។ គ្មាន XML Sitemap សម្រាប់ផ្ញើទៅ Google Search Console ធ្វើឱ្យ Google Bot ពិបាកស្វែងរកទំព័រទំនិញថ្មីៗ។
2. **គ្មាន Robots.txt Dynamic:** គ្មានឯកសារបញ្ជា Bots ធ្វើឱ្យ Crawlers អាចចូលទៅ Index ទំព័រឯកជនដូចជា Cart, Checkout, ឬ Account Dashboard ដែលនាំឱ្យខាតបង់ Crawl Budget និងប៉ះពាល់ SEO Ranking។
3. **បាត់បង់ Structured Data (Schema.org JSON-LD):** គ្មានទិន្នន័យ Structured Data ធ្វើឱ្យ Google Search បង្ហាញត្រឹមតែ Plain Link ធម្មតា ដោយគ្មាន Rich Snippets (ដូចជា តម្លៃទំនិញ $, ចំនួនផ្កាយ Rating ⭐, ស្ថានភាពក្នុងស្តុក In Stock, ឬ Sitelinks Searchbox)។
4. **Duplicate Content & Broken Canonical Links:** URLs មួយចំនួនអាចចូលបានតាមច្រើនផ្លូវ ដែលបង្កហានិភ័យ Duplicate Content Penalty ពី Google Algorithm។
5. **Social Media Previews ខូច:** ពេល Share Link ទៅកាន់ Facebook, Telegram, ឬ Twitter វាមិនបង្ហាញរូបភាព Thumbnail ត្រឹមត្រូវ ឬចេញរូបភាពទទេរ។

### 🟢 ដំណោះស្រាយ និងការកែទម្រង់ដែលបានសម្រេច (Fixes Implemented):
1. **Backend Dynamic XML Sitemap & Robots Engine:**
   * បង្កើត [`backend/app/Http/Controllers/Api/SeoController.php`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/backend/app/Http/Controllers/Api/SeoController.php) ភ្ជាប់ជាមួយ routes `/sitemap.xml` និង `/robots.txt`។
   * ទាញយកទិន្នន័យជាក់ស្ដែងពី PostgreSQL Database រួមមាន៖ All Active Products (`/products/{slug}`), All Categories (`/category/{slug}`), All Brands (`/brand/{slug}`), All Published Blog Posts (`/blog/{slug}`), និង Static Pages (Home, About, Contact, FAQs, Policies)។
   * កំណត់ `lastmod` តាមកាលបរិច្ឆេទ Update ចុងក្រោយ, `changefreq: daily`, និង `priority` ចន្លោះពី `0.5` ដល់ `1.0`។
   * កំណត់ `robots.txt` អនុញ្ញាត Googlebot ចូល Crawl ទំព័រសាធារណៈ និង Disallow ផ្លូវឯកជន (`/cart`, `/checkout`, `/account/`, `/auth/`) ព្រមទាំងភ្ជាប់ Sitemap URL ត្រឹមត្រូវ។
2. **SEO Engine ស្ដង់ដារ (`src/components/seo/SEOHead.tsx`):**
   * បង្កើត Dynamic Canonical URL Generator សម្រាប់ Normalize URLs ទាំងអស់។
   * OpenGraph & Twitter Card Meta Tags ជាមួយ Locale Mapping ស្វ័យប្រវត្តិ (`km_KH`, `en_US`, `th_TH`, `vi_VN`, `zh_CN`)។
   * **៧ ប្រភេទ Structured Data Schemas (JSON-LD):**
     * `Product` Schema (ឈ្មោះទំនិញ, តម្លៃ, រូបិយប័ណ្ណ, SKU, Stock Status, Brand, Reviews Rating)
     * `BreadcrumbList` Schema (ឋានានុក្រមទំព័រសម្រាប់ Google Search Results)
     * `FAQPage` Schema (សម្រាប់ទំព័រ FAQs)
     * `Article` Schema (សម្រាប់អត្ថបទបច្ចេកវិទ្យា និង Blog)
     * `WebSite` Schema (ភ្ជាប់ជាមួយ Sitelinks Searchbox)
     * `Organization` Schema (ឈ្មោះក្រុមហ៊ុន, Logo, Hotlines, អាសយដ្ឋាន)
     * `LocalBusiness` / `Store` Schema (Geo-coordinates, អាសយដ្ឋាន និងម៉ោងបើកធ្វើការ)។

---

## ១.២. ការធ្វើ Global DRY Refactor & Master Shared Components

### 🔴 បញ្ហាដើម (Initial Problems):
1. **Product Cards ស្ទួនគ្នា:** មាន File ២ ដាច់ដោយឡែកពីគ្នា (`CustomerProductCard.tsx` 310 lines និង `ProductCard.tsx` 202 lines) ដែលសរសេរ Logic ដូចគ្នា (Wishlist toggle, Add to cart, Currency conversion, Image fallbacks) នាំឱ្យពិបាកថែទាំ។
2. **Copy-Pasted Product Sections:** Section ចំនួន ៨ លើ Homepage (Featured, Arrivals, Deals, Best Sellers, Popular, Rated, Recent, Recommended) គឺជាកូដ Copy-Paste ដូចគ្នា ៩៩%។
3. **Price & Currency Calculation រាយប៉ាយ:** ការគណនាបញ្ចុះតម្លៃ Percentage Discount និង Strikethrough Price ត្រូវបានសរសេរដោយដៃរាយប៉ាយតាមទំព័រនីមួយៗ។

### 🟢 ដំណោះស្រាយ និងការកែទម្រង់ដែលបានសម្រេច (Fixes Implemented):
1. **Master `ProductCard.tsx`** ([`src/components/ecommerce/ProductCard.tsx`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/components/ecommerce/ProductCard.tsx)):
   * បង្រួបបង្រួមជា Master Component តែមួយគត់ដែល Support 4 Variants៖
     * `default`: កាតទំនិញស្ដង់ដារសម្រាប់ Grid លើ Homepage និង Catalog
     * `compact`: កាតទំហំតូចសម្រាប់ Sidebar និង Drawer
     * `featured`: កាតទំហំធំសម្រាប់ Flash Sale Banners
     * `horizontal`: កាតទម្រង់ផ្តេកសម្រាប់ List View Mode និង Cart / Wishlist Table
2. **Master `ProductSection.tsx`** ([`src/components/ecommerce/ProductSection.tsx`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/components/ecommerce/ProductSection.tsx)):
   * បង្រួញ Section ទាំង ៨ ឱ្យមកប្រើ Reusable Master Component ដោយគ្រាន់តែបញ្ជូន Props ខ្លីៗ។
3. **Shared Presentation & Domain Components:**
   * `<ProductPrice />`: គណនាបញ្ចុះតម្លៃ, Strikethrough compare price, និងប្តូររូបិយប័ណ្ណតាម Settings។
   * `<RatingStars />`: បង្ហាញផ្កាយ Rating ៥ និងចំនួន Reviews។
   * `<WishlistButton />`: ប៊ូតុងបេះដូង Wishlist ជាមួយ Optimistic UI Animation។
   * `<AddToCartButton />`: ប៊ូតុង Add to Cart ជាមួយ Loading Spinner និង "Added!" Feedback។
   * `<OrderStatusBadge />` & `<StockBadge />`: Badge បង្ហាញស្ថានភាព Order និងកម្រិតស្តុក។
   * `<ImageWithFallback />`: Lazy Image Component ដែលមាន Skeleton Placeholder និង Fallback កាលណារូបភាព Error។
   * `<EmptyState />` & `<ErrorState />`: បង្ហាញផ្ទាំង Empty Cart, Empty Wishlist, No Orders, No Search Results ដោយស្វ័យប្រវត្តិ។
4. **UI Design System Primitives (`src/components/ui/`):**
   * `Button.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`, `Skeleton.tsx`, `Spinner.tsx`។

---

## ១.៣. ស្ថាបត្យកម្ម Clean Architecture & Modular App Layer

### 🔴 បញ្ហាដើម (Initial Problems):
1. **Monolithic `App.tsx`:** ផ្ទុកកូដ 172 បន្ទាត់លាយបញ្ចូលគ្នាទាំង Router, QueryClient, Theme sync effect, Route Guards និង 30+ Lazy routes ទាំងអស់ក្នុង file តែមួយ។
2. **API Client ស្ទួនគ្នា:** មានទាំង `src/api/client.ts` និង `src/lib/api.ts` ធ្វើឱ្យ Developer ថ្មីច្រឡំ។

### 🟢 ដំណោះស្រាយ និងការកែទម្រង់ដែលបានសម្រេច (Fixes Implemented):
* **បង្កើត `src/app/` Layer ស្ដង់ដារ:**
  * `src/app/providers/QueryProvider.tsx`: TanStack React Query Client Setup (ជាមួយ Stale Time 5 នាទី និង Auto-retry)
  * `src/app/providers/ThemeProvider.tsx`: Dark/Light System Theme Synchronization
  * `src/app/providers/FaviconProvider.tsx`: Dynamic Favicon Synchronization
  * `src/app/router/RouteGuards.tsx`: `ProtectedRoute` (សម្រាប់ Account) និង `GuestRoute` (សម្រាប់ Login/Register)
  * `src/app/router/routes.tsx`: Lazy-loaded Page Routes Declarations
  * `src/app/router/AppRouter.tsx`: Main Route Tree ស្អាត និងងាយស្រួលពង្រីក
  * `src/app/App.tsx`: Clean Root Composition Component
* **Domain Custom Hooks (`src/hooks/`):**
  * `useWishlist.ts`: គ្រប់គ្រង Optimistic State Mutation និង Sync ជាមួយ Backend API
  * `useAddToCart.ts`: គ្រប់គ្រង Cart Additions, Quantity, Variants និង Instant Feedback
  * `useInfiniteProducts.ts`: គ្រប់គ្រង Infinite Scroll Pagination តាម Intersection Observer
  * `useSearch.ts`: គ្រប់គ្រង URL Search Synchronization (AI Search, Keyword Search, SKU Search)
* **Centralized API Services (`src/services/`):**
  * `cartService.ts`, `wishlistService.ts`, `orderService.ts`, `productService.ts`, `authService.ts`, `storeSettingsService.ts`
* **React Query Keys Dictionary:**
  * [`src/constants/queryKeys.ts`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/constants/queryKeys.ts): Dictionary កំណត់ Key សម្រាប់ Server Caching ទាំងអស់។

---

## ១.៤. ការដំឡើង Brand Logo & Favicon Suite ផ្លូវការ

### 🔴 បញ្ហាដើម (Initial Problems):
* Browser Tab, Bookmarks និង Google Search Results បង្ហាញ Icon ពណ៌ស្វាយរបស់ Vite (Default Placeholder Icon)។

### 🟢 ដំណោះស្រាយ និងការកែទម្រង់ដែលបានសម្រេច (Fixes Implemented):
* បង្កើត Icon ផ្លូវការរបស់ **NexTech Enterprise (ពណ៌ក្រហម Rounded Emblem)** គ្រប់ទំហំស្ដង់ដារពិភពលោក៖
  1. `public/favicon.svg`: Scalable Vector Icon កម្រិតច្បាស់ខ្ពស់សម្រាប់ Modern Web Browsers
  2. `public/favicon.ico`: Multi-size ICO (16x16, 32x32, 48x48, 64x64) សម្រាប់ Windows Taskbar & Google Search
  3. `public/favicon-48x48.png`, `favicon-32x32.png`, `favicon-16x16.png`
  4. `public/apple-touch-icon.png` (180x180 សម្រាប់ Apple Safari & iOS Home Screen)
  5. `public/android-chrome-192x192.png` & `512x512.png` (សម្រាប់ Android PWA)
  6. `public/site.webmanifest`: កំណត់ PWA Name និង Theme Color `#e11d48`
  7. `FaviconProvider.tsx`: ធ្វើបច្ចុប្បន្នភាព Icon លើ Tab ដោយស្វ័យប្រវត្តិកាលណា Admin ប្តូរ Logo ក្នុង Backend Admin Panel។

---

# ជំពូកទី ២៖ ស្ថាបត្យកម្មប្រព័ន្ធ និងលំហូរទិន្នន័យ

## ២.១. ការបែងចែក Sub-Projects ក្នុង Monorepo

```text
Project-Enterprise-E-Commerce-POS-System/
├── backend/                  # Laravel 12 REST API + PostgreSQL 16 + Redis 7
├── customer-website/         # E-Commerce Storefront SPA (React 19 + Vite + Tailwind CSS)
├── admin-dashboard/          # Admin Dashboard & Point of Sale (POS) SPA (React 19 + Vite)
├── mobile_app/               # Cross-platform Mobile App (Flutter 3.x for Android & iOS)
├── docker/                   # Dockerfile & Configuration Files
├── scripts/                  # Deployment, Rollback, and Backup Scripts
├── docs/                     # Comprehensive Project Documentation
└── docker-compose.prod.yml   # Multi-Container Production Orchestration
```

---

## ២.២. ដ្យាក្រាមលំហូរទិន្នន័យ និង Network Ports

```
                                  [ PUBLIC INTERNET ]
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │ Port 443 (HTTPS)           │ Port 443 (HTTPS)           │ Port 443 (HTTPS)
               ▼                            ▼                            ▼
      https://www.example.com      https://admin.example.com     https://api.example.com
               │                            │                            │
               ▼                            ▼                            │
       [ Customer SPA ]             [ Admin / POS SPA ]                  │
       (React 19 + Vite)            (React 19 + Vite)                    │
               │                            │                            │
               └───────────────────┬────────┘                            │
                                   │                                     │
                                   ▼                                     │
                        https://api.example.com/api/v1 ◀─────────────────┘
                                   │
                                   ▼
                       [ Nginx Reverse Proxy Gateway ]
                       (Handles SSL, Routing, Gzip, Rate Limiting)
                                   │
                                   ▼ Port 9000 (Internal FastCGI)
                    [ Laravel 12 API (PHP 8.3-FPM) ]
                                   │
                    ┌──────────────┴──────────────┐
                    ▼ Port 5432 (Internal)        ▼ Port 6379 (Internal)
         [ PostgreSQL 16 DB ]            [ Redis 7 In-Memory ]
         (Data Persistent Volume)        (Cache, Session, Queues)
```

---

# ជំពូកទី ៣៖ ការជ្រើសរើសទំហំ Server និង Cloud Provider

| កម្រិតអាជីវកម្ម (Tier) | ចំនួន POS & Daily Orders | ទំហំ Server ដែលណែនាំ (Hardware Specs) | Cloud Providers សមស្រប | តម្លៃប៉ាន់ស្មាន/ខែ |
| :--- | :--- | :--- | :--- | :--- |
| **Starter Tier** | 1 - 5 POS Terminals<br>< 1,000 Orders/day | **4 vCPUs, 8 GB RAM, 80 GB NVMe SSD** | Hetzner CPX31 / DigitalOcean Droplet | **$25 - $45 / mo** |
| **Standard Enterprise** | 5 - 25 POS Terminals<br>5,000+ Orders/day | **8 vCPUs, 16 GB RAM, 160 GB NVMe SSD** | Hetzner CPX41 / AWS EC2 c6i.xlarge | **$60 - $120 / mo** |
| **High Scale / Multi-Branch** | 25+ POS Terminals<br>20,000+ Orders/day | **16 vCPUs, 32 GB RAM, Managed DB Cluster** | AWS (EC2 + RDS Postgres + ElastiCache) | **$200 - $450 / mo** |

---

# ជំពូកទី ៤៖ មគ្គុទ្ទេសក៍ Hosting លើ VPS / Dedicated Server (Docker Production)

មគ្គុទ្ទេសក៍នេះបង្ហាញជំហានជាក់ស្ដែង ១០០% ក្នុងការដំឡើងលើ **Ubuntu 24.04 LTS ឬ Ubuntu 22.04 LTS**។

---

### ជំហានទី ១៖ ការតភ្ជាប់ SSH និងការពង្រឹងសុវត្ថិភាពម៉ាស៊ីន

1. **តភ្ជាប់ចូលទៅកាន់ Server តាមរយៈ SSH Terminal:**
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. **Update ប្រព័ន្ធប្រតិបត្តិការ Ubuntu ឱ្យឡើងជំនាន់ចុងក្រោយបង្អស់:**
   ```bash
   apt update && apt upgrade -y
   apt install -y curl wget git ufw htop unzip software-properties-common nano ca-certificates gnupg fail2ban
   ```

3. **បង្កើត Deployer User (ដើម្បីកុំប្រើ Root ដោយផ្ទាល់):**
   ```bash
   adduser deployer
   usermod -aG sudo deployer
   ```

4. **រៀបចំ SSH Key Authentication (បិទ Password Login ការពារ Brute Force Attack):**
   * នៅលើកុំព្យូទ័រផ្ទាល់ខ្លួនរបស់អ្នក (Local Terminal) បង្កើត SSH Key ប្រសិនបើមិនទាន់មាន៖
     ```bash
     ssh-keygen -t ed25519 -C "admin@example.com"
     ssh-copy-id deployer@YOUR_SERVER_IP
     ```
   * នៅលើ Server កែសម្រួល `/etc/ssh/sshd_config`៖
     ```bash
     nano /etc/ssh/sshd_config
     ```
     កំណត់៖
     ```text
     PermitRootLogin no
     PasswordAuthentication no
     PubkeyAuthentication yes
     ```
   * Restart SSH Service៖
     ```bash
     systemctl restart ssh
     ```

5. **កំណត់ UFW Firewall (ការពារ Database មិនឱ្យលេចធ្លាយទៅក្រៅ):**
   ```bash
   # អនុញ្ញាតតែ Port ចាំបាច់
   ufw default deny incoming
   ufw default allow outgoing
   ufw allow 22/tcp    # SSH
   ufw allow 80/tcp    # HTTP (Let's Encrypt & HTTPS Redirect)
   ufw allow 443/tcp   # HTTPS (Web, Admin, Mobile API Traffic)
   
   # បើកដំណើរការ Firewall
   ufw enable
   ufw status verbose
   ```

---

### ជំហានទី ២៖ ការដំឡើង Docker Engine & Docker Compose v2

ដំណើរការ Script ផ្លូវការរបស់ Docker៖

```bash
# ទាញយក និងដំឡើង Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# ផ្ដល់សិទ្ធិឱ្យ User deployer អាច run docker ដោយមិនបាច់វាយ sudo
usermod -aG docker deployer

# ពិនិត្យមើល Version
docker --version
docker compose version
```

---

### ជំហានទី ៣៖ ការចង Domain Name & DNS Records

ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង Domain របស់អ្នក (ឧ. **Cloudflare**, **Namecheap**, **GoDaddy**) រួចបង្កើត **A Records** ដូចខាងក្រោម៖

| Record Type | Host / Name | Target / Value (IP) | TTL | ពន្យល់ពីតួនាទី |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (ឬ `example.com`) | `YOUR_SERVER_IP` | Auto | ទំព័រដើម Customer Storefront |
| **A** | `www` | `YOUR_SERVER_IP` | Auto | Subdomain WWW នៃ Storefront |
| **A** | `admin` | `YOUR_SERVER_IP` | Auto | ផ្ទាំងគ្រប់គ្រង Admin Dashboard & POS |
| **A** | `api` | `YOUR_SERVER_IP` | Auto | Laravel REST API Gateway |

> [!IMPORTANT]
> ប្រសិនបើអ្នកប្រើ Cloudflare សូមបិទ **Proxy (ជ្រើសរើស DNS Only - ពពកពណ៌ប្រផេះ)** ជាបណ្ដោះអាសន្នសិន ដើម្បីឱ្យ Let's Encrypt Certbot អាចផ្ទៀងផ្ទាត់ SSL Certificate បានជោគជ័យ។ ក្រោយពេលបាន SSL ហើយ អ្នកអាចបើក Proxy ឡើងវិញបាន។

---

### ជំហានទី ៤៖ ការ Clone Code និងការកំណត់ Environment Variables លម្អិត

1. **ចូលទៅកាន់ Folder `/var/www` និង Clone Repository:**
   ```bash
   cd /var/www
   git clone https://github.com/sakouksa/Project-Enterprise-E-Commerce-POS-System.git enterprise-pos
   cd enterprise-pos
   git checkout develop
   ```

2. **រៀបចំឯកសារ `backend/.env.production`:**
   ```bash
   cp backend/.env.example backend/.env.production
   nano backend/.env.production
   ```

   **គំរូការកំណត់ក្នុង `backend/.env.production` (ត្រូវប្តូរ Domain និង Password ជាក់ស្តែង):**
   ```env
   APP_NAME="NexTech Enterprise"
   APP_ENV=production
   APP_KEY=base64:GENERATE_YOUR_OWN_KEY_HERE
   APP_DEBUG=false
   APP_URL=https://api.example.com

   FRONTEND_URL=https://www.example.com
   ADMIN_URL=https://admin.example.com

   LOG_CHANNEL=daily
   LOG_LEVEL=error

   # ─── PostgreSQL Database ─────────────────────────────────────────────
   DB_CONNECTION=pgsql
   DB_HOST=postgres
   DB_PORT=5432
   DB_DATABASE=enterprise_pos_prod
   DB_USERNAME=pos_admin
   DB_PASSWORD=SuperStrongPassword_9988!

   # ─── Redis Cache & Queue ─────────────────────────────────────────────
   CACHE_STORE=redis
   QUEUE_CONNECTION=redis
   SESSION_DRIVER=redis
   REDIS_HOST=redis
   REDIS_PASSWORD=RedisStrongAuth_7766!
   REDIS_PORT=6379

   # ─── Sanctum & Session Domains ───────────────────────────────────────
   SANCTUM_STATEFUL_DOMAINS=admin.example.com,www.example.com,example.com
   SESSION_DOMAIN=.example.com

   # ─── Mail Settings (SMTP) ────────────────────────────────────────────
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS="support@example.com"
   MAIL_FROM_NAME="NexTech Enterprise"
   ```

3. **រៀបចំឯកសារ `.env.production` សម្រាប់ Customer Website & Admin Dashboard:**
   ```bash
   # Customer Website Environment
   cat << 'EOF' > customer-website/.env.production
   VITE_API_BACKEND_URL=https://api.example.com
   VITE_STORE_API_URL=https://api.example.com/api/v1/store
   VITE_SITE_URL=https://www.example.com
   EOF

   # Admin Dashboard Environment
   cat << 'EOF' > admin-dashboard/.env.production
   VITE_API_BACKEND_URL=https://api.example.com
   VITE_API_URL=https://api.example.com/api/v1
   EOF
   ```

---

### ជំហានទី ៥៖ ការដំឡើង SSL/TLS Certificate ដោយឥតគិតថ្លៃ

ដំឡើង Certbot និងស្នើសុំ SSL Certificate សម្រាប់ Domains ទាំងអស់៖

```bash
apt install -y certbot

# ស្នើសុំ SSL មួយដងបានគ្រប់ Subdomains
certbot certonly --standalone \
  -d example.com \
  -d www.example.com \
  -d admin.example.com \
  -d api.example.com \
  --non-interactive \
  --agree-tos \
  -m admin@example.com
```

* SSL Files នឹងត្រូវរក្សាទុកនៅ៖ `/etc/letsencrypt/live/example.com/fullchain.pem` និង `privkey.pem`។
* Certbot មាន Timer សម្រាប់ Auto-renew ដោយស្វ័យប្រវត្តិកាលណាផុតកំណត់ ៩០ ថ្ងៃ។

---

### ជំហានទី ៦៖ ការ Launch Docker Production Containers

ដំណើរការ Build Docker Containers ទាំងអស់៖

```bash
# Build Production Images ទាំងអស់ (Multi-stage build)
docker compose -f docker-compose.prod.yml build

# ចាប់ផ្ដើមដំណើរការ Containers ទាំងអស់ក្នុង Background
docker compose -f docker-compose.prod.yml up -d

# ពិនិត្យមើលថាតើ Containers ទាំងអស់ដំណើរការល្អដែរឬទេ
docker compose -f docker-compose.prod.yml ps
```

---

### ជំហានទី ៧៖ Database Migration, Initial Seeding & Production Cache

ដំណើរការ Commands ទាំងនេះនៅក្នុង Backend Container៖

```bash
# 1. បង្កើត Tables ទាំងអស់ក្នុង PostgreSQL
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force

# 2. បញ្ចូល Seed Data (Super Admin, Roles, Default Categories, Store Settings)
docker compose -f docker-compose.prod.yml exec backend php artisan db:seed --force

# 3. បង្កើត Symlink សម្រាប់ Public Uploads (រូបភាពទំនិញ និង Logo)
docker compose -f docker-compose.prod.yml exec backend php artisan storage:link

# 4. Cache Config, Routes, Views, Events សម្រាប់ High Performance
docker compose -f docker-compose.prod.yml exec backend php artisan config:cache
docker compose -f docker-compose.prod.yml exec backend php artisan route:cache
docker compose -f docker-compose.prod.yml exec backend php artisan view:cache
docker compose -f docker-compose.prod.yml exec backend php artisan event:cache
```

---

### ជំហានទី ៨៖ ការរៀបចំ Cron Job (Scheduler) និង Queue Worker

1. **ដំឡើង Task Scheduler ក្នុង Host Server:**
   ```bash
   crontab -e
   ```
   បន្ថែមបន្ទាត់នេះនៅខាងក្រោមបង្អស់៖
   ```bash
   * * * * * cd /var/www/enterprise-pos && docker compose -f docker-compose.prod.yml exec -T backend php artisan schedule:run >> /dev/null 2>&1
   ```
   * នេះធ្វើឱ្យ Laravel ដំណើរការការងារអូតូម៉ាទិកដូចជា៖ ការ Cancel Unpaid Orders, ការគណនា Daily Sales Summary, និងការ Clear Expired Tokens។

2. **Queue Worker:**
   * Container `worker` ក្នុង `docker-compose.prod.yml` បានរៀបចំស្រេចដើម្បីដំណើរការ `php artisan queue:work redis --sleep=3 --tries=3` ដោយស្វ័យប្រវត្តិនូវរាល់ Emails, Notifications, និង Export Jobs។

---

### ជំហានទី ៩៖ របៀប Update Code ថ្មីដោយមិនបាច់បិទ Website (Zero-Downtime Deploy)

រាល់ពេលដែលអ្នកបាន Push កូដថ្មីឡើង GitHub រួចរាល់ អ្នកគ្រាន់តែ Login ចូល Server រួចដំណើរការ Script នេះ៖

```bash
cd /var/www/enterprise-pos

# 1. ទាញយកកូដថ្មីពី GitHub
git pull origin develop

# 2. Rebuild Container images ថ្មី
docker compose -f docker-compose.prod.yml build

# 3. Restart Container ដោយមិនបិទប្រព័ន្ធ (Zero Downtime)
docker compose -f docker-compose.prod.yml up -d --no-deps

# 4. Run database migrations និង Refresh Cache
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
docker compose -f docker-compose.prod.yml exec backend php artisan optimize:clear
docker compose -f docker-compose.prod.yml exec backend php artisan optimize
```

---

### ជំហានទី ១០៖ ប្រព័ន្ធ Backup Database ដោយស្វ័យប្រវត្តិ

បង្កើត Script សម្រាប់ Backup Database រៀងរាល់យប់ម៉ោង ១២ អធ្រាត្រ៖

1. បង្កើត file `/var/www/enterprise-pos/scripts/backup-db.sh`:
   ```bash
   mkdir -p /var/www/enterprise-pos/backups
   cat << 'EOF' > /var/www/enterprise-pos/scripts/backup-db.sh
   #!/bin/bash
   BACKUP_DIR="/var/www/enterprise-pos/backups"
   DATE=$(date +"%Y-%m-%d_%H-%M-%S")
   FILENAME="$BACKUP_DIR/db_backup_$DATE.sql.gz"

   docker compose -f /var/www/enterprise-pos/docker-compose.prod.yml exec -T postgres pg_dump -U pos_admin enterprise_pos_prod | gzip > $FILENAME

   # លុប Backup ចាស់ៗដែលលើសពី ៣០ ថ្ងៃ
   find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
   echo "Backup completed: $FILENAME"
   EOF

   chmod +x /var/www/enterprise-pos/scripts/backup-db.sh
   ```

2. ដាក់ក្នុង Cron Job (`crontab -e`):
   ```bash
   0 0 * * * /var/www/enterprise-pos/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
   ```

---

# ជំពូកទី ៥៖ មគ្គុទ្ទេសក៍ Hosting លើ Serverless Cloud (Vercel + Render / Railway)

ជម្រើសនេះគឺសម្រាប់អ្នកដែលចង់ប្រើ Platform-as-a-Service (PaaS) ដោយមិនចង់គ្រប់គ្រង Linux VPS Server ដោយខ្លួនឯង។

---

### ៥.១. ការ Deploy Customer Website លើ Vercel

1. ចូលទៅកាន់គេហទំព័រ [Vercel](https://vercel.com) រួចចុច **Add New...** → **Project**។
2. ជ្រើសរើស GitHub Repository `Project-Enterprise-E-Commerce-POS-System`។
3. កំណត់ Settings៖
   * **Project Name**: `nextech-customer-store`
   * **Framework Preset**: `Vite`
   * **Root Directory**: ចុច Edit រួចជ្រើសរើស folder `customer-website`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. **Environment Variables**:
   * `VITE_API_BACKEND_URL`: `https://your-api.onrender.com` (ឬ API Domain របស់អ្នក)
   * `VITE_STORE_API_URL`: `https://your-api.onrender.com/api/v1/store`
   * `VITE_SITE_URL`: `https://www.yourdomain.com`
5. ចុច **Deploy**។
6. បន្ទាប់ពី Deploy ចប់ ចូលទៅកាន់ **Settings** → **Domains** → បន្ថែម `www.yourdomain.com` និង `yourdomain.com` រួចកំណត់ CNAME ក្នុង DNS តាមការណែនាំរបស់ Vercel។

---

### ៥.២. ការ Deploy Admin Dashboard & POS លើ Vercel

1. ក្នុង Vercel ចុច **Add New...** → **Project** → ជ្រើសរើស Repo ដដែល។
2. កំណត់ Settings៖
   * **Project Name**: `nextech-admin-pos`
   * **Framework Preset**: `Vite`
   * **Root Directory**: `admin-dashboard`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. **Environment Variables**:
   * `VITE_API_BACKEND_URL`: `https://your-api.onrender.com`
   * `VITE_API_URL`: `https://your-api.onrender.com/api/v1`
4. ចុច **Deploy**។
5. ចូលទៅកាន់ **Settings** → **Domains** → បន្ថែម Subdomain `admin.yourdomain.com`។

---

### ៥.៣. ការ Deploy Laravel Backend + PostgreSQL + Redis លើ Render / Railway

1. **បង្កើត PostgreSQL Database (លើ Render.com ឬ Supabase/Neon):**
   * ចូល Render.com → ចុច **New** → **PostgreSQL**។
   * កំណត់ Database Name: `enterprise_pos`។
   * ចម្លង `Internal Database URL` សម្រាប់ប្រើប្រាស់។
2. **បង្កើត Redis Instance (លើ Render.com ឬ Upstash Redis):**
   * ចុច **New** → **Redis** → ចម្លង `Internal Redis URL`។
3. **បង្កើត Web Service សម្រាប់ Laravel Backend:**
   * ចុច **New** → **Web Service** → ជ្រើសរើស GitHub Repo។
   * **Root Directory**: `backend`
   * **Environment**: `Docker` (Render នឹងរកឃើញ `backend/docker/Dockerfile.prod` ដោយស្វ័យប្រវត្តិ)
   * **Environment Variables**:
     ```env
     APP_NAME="NexTech Enterprise"
     APP_ENV=production
     APP_KEY=base64:YOUR_GENERATED_APP_KEY
     APP_DEBUG=false
     APP_URL=https://api.yourdomain.com
     DB_CONNECTION=pgsql
     DATABASE_URL=postgresql://user:password@hostname:5432/dbname
     REDIS_URL=redis://default:password@hostname:6379
     CACHE_STORE=redis
     QUEUE_CONNECTION=redis
     SESSION_DRIVER=redis
     FRONTEND_URL=https://www.yourdomain.com
     ADMIN_URL=https://admin.yourdomain.com
     SANCTUM_STATEFUL_DOMAINS=admin.yourdomain.com,www.yourdomain.com,yourdomain.com
     SESSION_DOMAIN=.yourdomain.com
     ```
4. **Run Database Migration លើ Render:**
   * ចូលទៅកាន់ Web Service ក្នុង Render Dashboard → ចុចផ្ទាំង **Shell** → វាយ command:
     ```bash
     php artisan migrate --force
     php artisan db:seed --force
     php artisan storage:link
     ```
5. **ភ្ជាប់ Custom Domain:** ចូលទៅ **Settings** → **Custom Domains** → បន្ថែម `api.yourdomain.com`។

---

# ជំពូកទី ៦៖ បញ្ហាដែលជួបញឹកញាប់ និងវិធីដោះស្រាយ (Troubleshooting & FAQs)

### ១. បញ្ហា CORS Error (`Access-Control-Allow-Origin`)
* **មូលហេតុ:** Frontend ផ្ញើ Request ពី Domain ផ្សេងដែលមិនទាន់បានចុះឈ្មោះក្នុង Backend CORS Config។
* **ដំណោះស្រាយ:** បើក file `backend/config/cors.php` ឬ `backend/.env.production` រួចពិនិត្យមើល `FRONTEND_URL` និង `ADMIN_URL` ថាបានដាក់ Domain ត្រឹមត្រូវ ឧ. `https://www.yourdomain.com,https://admin.yourdomain.com`។

### ២. បញ្ហា Error 500 (Internal Server Error)
* **មូលហេតុ:** បាត់បង់ `APP_KEY` ឬ Permissions លើ folder `storage/` និង `bootstrap/cache/` មិនត្រឹមត្រូវ។
* **ដំណោះស្រាយ:**
  ```bash
  docker compose exec backend php artisan key:generate --force
  docker compose exec backend chmod -R 775 storage bootstrap/cache
  docker compose exec backend chown -R www-data:www-data storage bootstrap/cache
  ```

### ៣. បញ្ហា Refresh Page លើ Frontend ហើយចេញ Error 404 (SPA Routing Issue)
* **មូលហេតុ:** Nginx ឬ Web Server មិនបានបញ្ជូនផ្លូវ Route ទៅកាន់ `index.html`។
* **ដំណោះស្រាយ:** នៅក្នុង Nginx Config ត្រូវតែមាន `try_files $uri $uri/ /index.html;` (ដែលយើងបានរៀបចំរួចរាល់នៅក្នុង `docker-compose.prod.yml` និង `vercel.json`)។

### ៤. បញ្ហា Upload រូបភាពទំនិញធំៗមិនចូល (`413 Request Entity Too Large`)
* **ដំណោះស្រាយ:** នៅក្នុង Nginx Gateway Config កំណត់ `client_max_body_size 64M;` និងក្នុង `php.ini` កំណត់ `upload_max_filesize = 64M` និង `post_max_size = 64M`។

---

## 🎯 សេចក្ដីសន្និដ្ឋាន (Conclusion)

ឯកសារនេះផ្ដល់នូវការណែនាំគ្រប់ជ្រុងជ្រោយបំផុតតាំងពីកម្រិត **Architecture, Codebase Audit, Security Hardening, Docker Compose Setup, Database Optimizations, SSL Encryption, រហូតដល់ Zero-Downtime Deployment និង Backup Procedures**។ គ្រប់ Developer ទាំងអស់អាចធ្វើតាមការណែនាំនេះមួយជំហានម្តងៗដើម្បីដាក់ឱ្យដំណើរការប្រព័ន្ធបានយ៉ាងរលូន ១០០% ដោយគ្មានបញ្ហារាំងស្ទះឡើយ!
