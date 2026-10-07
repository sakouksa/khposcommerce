# 📁 រចនាសម្ព័ន្ធគម្រោង (Project Structure) - Admin KHPosCommerce

ឯកសារនេះរៀបរាប់លម្អិតអំពីរចនាសម្ព័ន្ធថត (Directory Tree) ស្ថាបត្យកម្មបច្ចេកវិទ្យា (Architecture & Tech Stack) ម៉ូឌុលមុខងារ (Functional Modules) និងលំហូរការងារ (Workflow & Conventions) នៃគម្រោង **`admin-khposcommerce`**។

---

## 📑 មាតិកា (Table of Contents)
1. [ទិដ្ឋភាពទូទៅនៃគម្រោង (Project Overview)](#1-ទិដ្ឋភាពទូទៅនៃគម្រោង-project-overview)
2. [បច្ចេកវិទ្យាស្នូល (Tech Stack & Dependencies)](#2-បច្ចេកវិទ្យាស្នូល-tech-stack--dependencies)
3. [មែកធាងរចនាសម្ព័ន្ធទាំងមូល (Overall Directory Tree)](#3-មែកធាងរចនាសម្ព័ន្ធទាំងមូល-overall-directory-tree)
4. [ការពន្យល់លម្អិតតាមថតនីមួយៗ (Detailed Directory Breakdown)](#4-ការពន្យល់លម្អិតតាមថតនីមួយៗ-detailed-directory-breakdown)
   - [4.1 ថតកំណត់រចនាសម្ព័ន្ធមេ (Root Config Files)](#41-ថតកំណត់រចនាសម្ព័ន្ធមេ-root-config-files)
   - [4.2 ថត `public/` (Static Assets)](#42-ថត-public-static-assets)
   - [4.3 ថត `src/api/` (API Client & Interceptors)](#43-ថត-srcapi-api-client--interceptors)
   - [4.4 ថត `src/components/` (UI & Layout Components)](#44-ថត-srccomponents-ui--layout-components)
   - [4.5 ថត `src/pages/` (Modules & Screen Pages)](#45-ថត-srcpages-modules--screen-pages)
   - [4.6 ថត `src/routes/` (Routing & Guards)](#46-ថត-srcroutes-routing--guards)
   - [4.7 ថត `src/services/` (API Service Layers)](#47-ថត-srcservices-api-service-layers)
   - [4.8 ថត `src/stores/` (Global State with Zustand)](#48-ថត-srcstores-global-state-with-zustand)
   - [4.9 ថត `src/locales/` (Internationalization i18n)](#49-ថត-srclocales-internationalization-i18n)
   - [4.10 ថត `src/hooks/`, `src/utils/`, `src/types/`](#410-ថត-srchooks-srcutils-srctypes)
5. [ប្រព័ន្ធសុវត្ថិភាព និងការអនុញ្ញាតសិទ្ធិ (RBAC & Multi-Tenancy)](#5-ប្រព័ន្ធសុវត្ថិភាព-និងការអនុញ្ញាតសិទ្ធិ-rbac--multi-tenancy)
6. [គោលការណ៍ណែនាំក្នុងការបន្ថែមទំព័រថ្មី (How to Add a New Page)](#6-គោលការណ៍ណែនាំក្នុងការបន្ថែមទំព័រថ្មី-how-to-add-a-new-page)

---

## 1. ទិដ្ឋភាពទូទៅនៃគម្រោង (Project Overview)

**`admin-khposcommerce`** គឺជាផ្ទាំងគ្រប់គ្រងរដ្ឋបាលកម្រិតសហគ្រាស (Enterprise Admin Management Dashboard) នៃប្រព័ន្ធ Omnichannel POS & E-Commerce Ecosystem។ ប្រព័ន្ធនេះរៀបចំឡើងសម្រាប់គ្រប់គ្រង៖
- ពហុសាខា ពហុឃ្លាំង និងពហុក្រុមហ៊ុន (Multi-Tenant & Multi-Branch Architecture)
- ចំណុចលក់ទំនិញរហ័ស (Real-time Point of Sale - POS Terminal)
- ប្រព័ន្ធស្តុកទំនិញ (Inventory, Stock Transfers, Adjustments, Stock Opname)
- ការទិញ និងអ្នកផ្គត់ផ្គង់ (Purchases & Supplier Management)
- ការលក់ ការបញ្ជាទិញ និងការបង្វិលសង (Sales, Orders, Returns & Refund Policies)
- ធនធានមនុស្ស (HRM, Employee Attendance QR, Roles & Permissions)
- ហិរញ្ញវត្ថុ គណនេយ្យ និងការទូទាត់ (Finance, Cash Registers, Bakong KHQR, Tax Rules)
- ទីផ្សារ និងប្រូម៉ូសិន (Marketing, Coupons, Flash Sales, Discount Rules)
- ការគ្រប់គ្រងមាតិកាគេហទំព័រ (CMS, Blogs, Banners, Announcements, FAQs)
- របាយការណ៍វិភាគទិន្នន័យអាជីវកម្មកម្រិតខ្ពស់ (BI Analytics & Reports)

---

## 2. បច្ចេកវិទ្យាស្នូល (Tech Stack & Dependencies)

| បច្ចេកវិទ្យា (Technology) | កំណែ (Version) | តួនាទី និងការប្រើប្រាស់ (Purpose) |
|---|---|---|
| **React** | `^19.2.7` | UI Library ស្នូលសម្រាប់ការបង្កើត Single Page Application (SPA) |
| **TypeScript** | `~6.0.2` | Type-safety, DTO interfaces, និងកាត់បន្ថយកំហុសកូដ |
| **Vite** | `^8.1.1` | Next-gen Frontend Tooling, HMR រហ័ស និង Chunk Splitting |
| **Ant Design (antd)** | `^6.5.1` | Component Library សម្បូរបែបសម្រាប់ Enterprise Data Tables, Modals, Forms |
| **Tailwind CSS** | `^3.4.19` | Utility-first CSS framework សម្រាប់ការរចនា UI បត់បែន និងទាន់សម័យ |
| **Radix UI** | `^1.1.x` | Headless, accessible primitives សម្រាប់ Dialogs, Popovers, Dropdowns, Tabs |
| **TanStack React Query** | `^5.101.2` | គ្រប់គ្រង Server State, Auto-caching, Query Invalidation, Refetching |
| **Zustand** | `^5.0.14` | Global Client State (Auth, Tenant/Branch context, Notifications, Themes, Toasts) |
| **React Router DOM** | `^7.18.1` | Client-side Routing, Layout Routes, Route Guards (Protected / Public) |
| **i18next / react-i18next** | `^26.3.6 / ^17.0.10` | ប្រព័ន្ធបកប្រែពហុភាសា (ភាសាខ្មែរ 🇰🇭 និង ភាសាអង់គ្លេស 🇺🇸) |
| **Bakong KHQR** | `^1.0.20` | ការបង្កើតកូដទូទាត់ KHQR ស្ដង់ដារធនាគារជាតិនៃកម្ពុជា (NBC Bakong) |
| **Recharts** | `^3.9.2` | គំនូសតាងស្ថិតិ និងក្រាហ្វិកវិភាគទិន្នន័យលក់ និងហិរញ្ញវត្ថុ |
| **Framer Motion** | `^12.42.2` | Micro-animations និង Page Transition Effects |
| **HTML5 QRCode / ZXing** | `^2.3.8 / ^0.23.0` | ស្កេនបាកូដទំនិញ និង QR Code តាម Camera/Scanner |

---

## 3. មែកធាងរចនាសម្ព័ន្ធទាំងមូល (Overall Directory Tree)

```
webclient/admin-khposcommerce/
├── public/                       # Static files, icons, pwa manifest, default mock images
│   ├── images/                   # Default avatars, brand logos, product placeholders
│   ├── favicon.ico / favicon.svg # Web favicons & apple-touch-icons
│   └── site.webmanifest          # PWA Web App Manifest
├── src/                          # កូដកម្មវិធីប្រភពដើមទាំងមូល (Application Source Code)
│   ├── api/                      # Axios HTTP instance, request/response interceptors
│   ├── assets/                   # Static imported images, icons, and SVG illustrations
│   ├── components/               # UI Components ចែកតាមកម្រិត reusable និង domain
│   │   ├── common/               # Shared general components (Buttons, Badges, Modals, Tables)
│   │   ├── layout/               # Header, Sidebar, Footer, Tenant Switcher, AdminLayout
│   │   ├── shared/               # Enterprise shared logic (SearchInput, Pagination, Export, Print)
│   │   └── ui/                   # Radix + Tailwind base primitives (dialog, alert, sheet, button)
│   ├── config/                   # Global configuration & dashboard widget registry
│   ├── hooks/                    # Reusable React hooks (useAuth, usePermission, useDebounce, etc.)
│   ├── lib/                      # Third-party library initializations (i18n, utils)
│   ├── locales/                  # វចនានុក្រមបកប្រែភាសា (en / km) ចែកតាម domain
│   │   ├── en/                   # 40+ JSON translation files សម្រាប់ភាសាអង់គ្លេស
│   │   └── km/                   # 40+ JSON translation files សម្រាប់ភាសាខ្មែរ
│   ├── pages/                    # 33+ Functional Business Modules (200+ Screen Views)
│   │   ├── attributes/           # លក្ខណៈផលិតផល (Colors, Sizes, Specs)
│   │   ├── auth/                 # ផ្ទាំងចូលប្រព័ន្ធ (Login & Token Session)
│   │   ├── brands/               # ម៉ាកយីហោទំនិញ
│   │   ├── categories/           # ប្រភេទ និងមែកធាងជំពូកទំនិញ
│   │   ├── chatbot/              # AI Chatbot Assistant Configuration
│   │   ├── cms/                  # Content Management (Blogs, Banners, FAQs, Policies)
│   │   ├── company/              # ក្រុមហ៊ុន សាខា ហាង និងឃ្លាំង (Company, Branches, Warehouses)
│   │   ├── customers/            # អតិថិជន និងក្រុមអតិថិជន (Customers & Groups)
│   │   ├── dashboard/            # ផ្ទាំងគ្រប់គ្រងទូទៅ (Executive BI Dashboard)
│   │   ├── employees/            # បុគ្គលិក វត្តមាន និងការកំណត់វេនការងារ (HRM & Staff)
│   │   ├── expenses/             # ការគ្រប់គ្រងការចំណាយប្រតិបត្តិការ
│   │   ├── finance/              # ហិរញ្ញវត្ថុ គណនេយ្យ អត្រាប្តូរប្រាក់ ថវិកា និងពន្ធ
│   │   ├── inventory/            # ស្តុកទំនិញ ការផ្ទេរ ការកែតម្រូវ និងការរាប់ស្តុក (Opname)
│   │   ├── logs/                 # កំណត់ត្រាសកម្មភាពប្រតិបត្តិការ (Activity Audit Logs)
│   │   ├── marketing/            # ប្រូម៉ូសិន គូប៉ុង បញ្ចុះតម្លៃ និង Flash Sales
│   │   ├── notifications/        # ប្រព័ន្ធជូនដំណឹង និងគំរូសារ (Templates & Settings)
│   │   ├── orders/               # ការបញ្ជាទិញ ការបង្វិលសង និងគោលការណ៍សងប្រាក់
│   │   ├── payments/             # វិធីសាស្ត្រទូទាត់ និងប្រតិបត្តិការសាច់ប្រាក់
│   │   ├── permissions/          # ការកំណត់សិទ្ធិ Spatie RBAC Granular Matrix
│   │   ├── pos/                  # ចំណុចលក់ទំនិញផ្ទាល់ (Point of Sale Cashier Terminal)
│   │   ├── products/             # កាតាឡុកទំនិញ Barcode Generator និងការកំណត់តម្លៃ
│   │   ├── profile/              # គណនីផ្ទាល់ខ្លួនរបស់ Admin
│   │   ├── purchases/            # បញ្ជាទិញទំនិញចូល (PO) និងការបង្វិលទំនិញទៅអ្នកផ្គត់ផ្គង់
│   │   ├── recycle-bin/          # ធុងសំរាមស្តារទិន្នន័យ (Soft-deleted records recovery)
│   │   ├── reports/              # របាយការណ៍លក់ ទិញ ស្តុក និងហិរញ្ញវត្ថុ
│   │   ├── reviews/              # ការវាយតម្លៃរបស់អតិថិជនលើផលិតផល
│   │   ├── roles/                # តួនាទីអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ
│   │   ├── sales/                # ប្រវត្តិវិក្កយបត្រលក់ និងការចេញបង្កាន់ដៃ
│   │   ├── security/             # សុវត្ថិភាព គ្រប់គ្រងឧបករណ៍ និងការតាមដាន Session
│   │   ├── settings/             # ការកំណត់ប្រព័ន្ធទូទៅ Bakong, Telegram, Units, Theme
│   │   ├── shipping/             # វិធីសាស្ត្រដឹកជញ្ជូន និងថ្លៃសេវា
│   │   ├── suppliers/            # អ្នកផ្គត់ផ្គង់ និងប្រវត្តិផ្គត់ផ្គង់
│   │   └── users/                # អ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ
│   ├── routes/                   # Routing Configurations & Authorization Guards
│   │   ├── guards/               # ProtectedRoute (Auth & Permission check) & PublicRoute
│   │   ├── components/           # PageFallback (Suspense loading spinner)
│   │   └── AppRoutes.tsx         # Lazy loading route definitions ទាំងអស់
│   ├── services/                 # 40+ Axios Pure API Service Files
│   ├── stores/                   # Zustand Global Stores (Auth, Company, Theme, Toast, Notifications)
│   ├── types/                    # TypeScript Global Interface & Declarations
│   ├── utils/                    # Global Formatters, Validations, Sound, Geofencing
│   ├── App.css / App.tsx         # Root component & styling
│   ├── index.css                 # Tailwind CSS directives, typography, theme variables
│   └── main.tsx                  # Application bootstrap entry point
├── .env.production               # Production Environment variables
├── .env.production.example       # Example production environment settings
├── .env.staging.example          # Example staging environment settings
├── .oxlintrc.json                # Fast Oxlint code linting rules
├── components.json               # Shadcn/Radix component generator settings
├── Dockerfile                    # Multi-stage production container build (Node + Nginx)
├── nginx.conf                    # Nginx reverse proxy, gzip compression, SPA history fallback
├── package.json                  # Dependencies, devDependencies, and build scripts
├── postcss.config.js             # PostCSS Tailwind plugins config
├── tailwind.config.js            # Tailwind Theme tokens, colors, custom animations
├── tsconfig.json                 # TypeScript project reference config
├── tsconfig.app.json             # App TypeScript compilation options
├── tsconfig.node.json            # Node/Vite build tool compilation options
├── vercel.json                   # Vercel deployment routes and SPA rewrites
└── vite.config.ts                # Vite plugins, path aliases (`@/*`), build chunk splitting
```

---

## 4. ការពន្យល់លម្អិតតាមថតនីមួយៗ (Detailed Directory Breakdown)

### 4.1 ថតកំណត់រចនាសម្ព័ន្ធមេ (Root Config Files)
- **`vite.config.ts`**: កំណត់ Path Alias `@/` សំដៅទៅ `src/`, កំណត់ Plugin Basic SSL, React Plugin, និង Chunk Optimization សម្រាប់កាត់បន្ថយទំហំ build bundle។
- **`tailwind.config.js`**: រៀបចំ Color Palette (Brand primary, Secondary, Slate, Accent), Dark Mode, Keyframe animations សម្រាប់ Toasts, Modals និង Drawer។
- **`Dockerfile` & `nginx.conf`**: ប្រើប្រាស់សម្រាប់ Containerization ក្នុង Docker Swarm/Kubernetes ដោយប្រើ Alpine Nginx បម្រើឯកសារ static ជាមួយ gzip/brotli និង rewrite rule សម្រាប់ React SPA (`try_files $uri $uri/ /index.html`)។
- **`package.json`**: កំណត់ពាក្យបញ្ជាសំខាន់ៗដូចជា `npm run dev`, `npm run build`, `npm run typecheck`, និង `npm run lint`។

---

### 4.2 ថត `public/` (Static Assets)
- **`public/images/`**: រូបភាព Placeholder លំនាំដើមដូចជា `default-avatar.svg`, `default-product.svg`, `default-category.svg`, `default-brand.svg`, និង `default-supplier.svg`។
- **`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`**: រូបសញ្ញា icon របស់ប្រព័ន្ធ។
- **`site.webmanifest`**: ឯកសារ PWA Manifest សម្រាប់ឱ្យ Web App អាចដំឡើងលើទូរស័ព្ទ ឬកុំព្យូទ័របាន។

---

### 4.3 ថត `src/api/` (API Client & Interceptors)
- **`src/api/client.ts`**:
  - បង្កើត `axios` instance ដែលមាន `baseURL` កំណត់តាម Environment (Development: `/api/v1`, Production API)។
  - **Request Interceptor**:
    - បញ្ចូល Bearer Token ស្វ័យប្រវត្តិចេញពី `useAuthStore`។
    - បញ្ចូល Telemetry Headers: `X-Device-Id`, `X-Device-Name`, `X-Device-Type`, `X-OS-Name`, `X-Browser-Name`។
    - បញ្ចូល Multi-Tenant Context: `X-Company-Id` និង `X-Branch-Id` តាមក្រុមហ៊ុន និងសាខាដែល Admin កំពុងជ្រើសរើស។
    - បញ្ចូល `Accept-Language` និង `X-Locale` តាមភាសាដែលបានជ្រើសរើស (`km` ឬ `en`)។
  - **Response Interceptor**:
    - គ្រប់គ្រង Error 401: ដំណើរការ Refresh Token ស្វ័យប្រវត្តិ (`/auth/refresh`) ដោយមិនចាំបាច់ logout ប្រសិន token នៅមានសុពលភាព។
    - គ្រប់គ្រង Error 403 (Forbidden), 422 (Validation), 429 (Too many requests), 500 (Server Error)។
    - បង្ហាញ Bilingual Toast Error Notification ស្វ័យប្រវត្តិតាមភាសាខ្មែរ/អង់គ្លេស។

---

### 4.4 ថត `src/components/` (UI & Layout Components)

រៀបចំតាមលំនាំស្ថាបត្យកម្ម Modular Component៖

#### ក. `components/layout/` (រចនាសម្ព័ន្ធទំព័រមេ)
- **`AdminLayout.tsx`**: Layout មេសម្រាប់ទំព័រទាំងអស់ ដែលមាន Sidebar បត់បែនបាន ផ្ទាំង Header និងផ្ទៃបង្ហាញទិន្នន័យ។
- **`Header.tsx` & `HeaderActions.tsx`**: ផ្នែកខាងលើនៃប្រព័ន្ធ មាន search, notifications, language switch, profile menu។
- **`HeaderSearch.tsx`**: ប្រអប់ Global Command/Search រកមើលទំព័រ មុខងារ និងទិន្នន័យរហ័ស។
- **`TenantContextSwitcher.tsx`**: ឧបករណ៍ប្តូរក្រុមហ៊ុន (Company) និងសាខា (Branch) ភ្លាមៗដោយពុំបាច់ Logout។
- **`LanguageDropdown.tsx`**: ប៊ូតុងប្តូរភាសារវាង ភាសាខ្មែរ (KM) និង អង់គ្លេស (EN)។
- **`ThemeSwitcher.tsx`**: ឧបករណ៍ប្តូររូបរាង Light / Dark mode។
- **`NotificationDropdown.tsx`**: ផ្ទាំងជូនដំណឹងរហ័សលើ Header។
- **`ProfileDropdown.tsx`**: មឺនុយព័ត៌មានគណនី និងប៊ូតុងចាកចេញ (Logout)។

#### ខ. `components/shared/` (សមាសភាគចែករំលែកទូទៅ)
- **`PageHeader.tsx`**: Header ស្តង់ដារសម្រាប់គ្រប់ទំព័រ (Title, Breadcrumb, Action Buttons)។
- **`SearchInput.tsx`**: ប្រអប់ស្វែងរកដែលមាន Debounce រួចជាស្រេច។
- **`Pagination.tsx`**: របារទំព័រទិន្នន័យ (Pagination control)។
- **`StatCard.tsx` & `AnimatedCounter.tsx`**: កាតបង្ហាញលេខស្ថិតិ និងចំនួនសរុប។
- **`TableActionMenu.tsx` & `TableToolbar.tsx`**: មឺនុយសកម្មភាពលើតារាង (Edit, View, Delete, Print)។
- **`ColumnSettingsPopover.tsx`**: អនុញ្ញាតឱ្យអ្នកប្រើជ្រើសរើសបង្ហាញ ឬលាក់ Column នៃតារាងតាមចិត្ត។
- **`GlobalPrint.tsx`**: ម៉ាស៊ីន Print វិក្កយបត្រ បង្កាន់ដៃ និងរបាយការណ៍ស្ដង់ដារ។
- **`ConfirmDialog.tsx`**: ប្រអប់បញ្ជាក់ការលុប ឬដំណើរការសកម្មភាពសំខាន់ៗ។
- **`HttpErrorPage.tsx` & `AccessDeniedPage.tsx`**: ផ្ទាំង Error 404, 403, 500។

#### គ. `components/ui/` (Radix Primitives)
- បណ្តុំ UI Primitives ដូចជា `dialog.tsx`, `alert-dialog.tsx`, `button.tsx`, `card.tsx`, `dropdown-menu.tsx`, `input.tsx`, `popover.tsx`, `sheet.tsx`, `tabs.tsx`, `tooltip.tsx`, និង `ToastContainer.tsx`។

---

### 4.5 ថត `src/pages/` (Modules & Screen Pages)

មាន 33 ម៉ូឌុលមុខងារធំៗ៖

| ឈ្មោះថត (Folder) | មុខងារលម្អិត (Functionality & Features) | ឯកសារសំខាន់ៗ (Key Files) |
|---|---|---|
| **`attributes/`** | គ្រប់គ្រងលក្ខណៈផលិតផល (Colors, Sizes, Materials, RAM/Storage) | `AttributesPage.tsx` |
| **`auth/`** | ផ្ទាំងចូលប្រើប្រាស់ប្រព័ន្ធ (Sign-in form, 2FA, Remember me) | `LoginPage.tsx` |
| **`brands/`** | គ្រប់គ្រងម៉ាកយីហោផលិតផល និង Logo ម៉ាក | `BrandsPage.tsx` |
| **`categories/`** | មែកធាងប្រភេទផលិតផល (Tree view, Sub-categories, Category icons) | `CategoriesPage.tsx` |
| **`chatbot/`** | ការកំណត់រចនាសម្ព័ន្ធ និងការបណ្តុះបណ្តាល AI Assistant | `ChatbotManagementPage.tsx` |
| **`cms/`** | គ្រប់គ្រងមាតិកាគេហទំព័រ (Banner, Blogs, FAQs, Testimonials, Policies) | `BlogArticlesPage.tsx`, `BannerSlidersPage.tsx`, `MediaLibraryPage.tsx`, `PagesPoliciesPage.tsx` |
| **`company/`** | រចនាសម្ព័ន្ធពហុក្រុមហ៊ុន សាខា ហាង និងឃ្លាំងស្តុក | `CompanyPage.tsx`, `BranchesPage.tsx`, `StoresPage.tsx`, `WarehousesPage.tsx` |
| **`customers/`** | បញ្ជីអតិថិជន ប្រវត្តិទិញទំនិញ ចំណាត់ថ្នាក់ក្រុមអតិថិជន និងអាសយដ្ឋាន | `CustomersPage.tsx`, `CustomerDetailPage.tsx`, `CustomerGroupsPage.tsx` |
| **`dashboard/`** | ផ្ទាំងគ្រប់គ្រងទិន្នន័យប្រតិបត្តិការទូទៅ ក្រាហ្វិកចំណូល ការលក់ប្រចាំថ្ងៃ | `DashboardPage.tsx` |
| **`employees/`** | គ្រប់គ្រងបុគ្គលិក កិច្ចសន្យា ប្រាក់បៀវត្សរ៍ វត្តមាន និងការស្កេន QR | `EmployeesPage.tsx`, `EmployeeFormPage.tsx` |
| **`expenses/`** | កត់ត្រា និងអនុម័តការចំណាយប្រតិបត្តិការ | `ExpensesPage.tsx` |
| **`finance/`** | គ្រប់គ្រងចរន្តសាច់ប្រាក់ វេនគិតលុយ អត្រាប្តូរប្រាក់ គណនីចំណាយ និងពន្ធ | `FinancePage.tsx`, `CashRegistersSessionsPage.tsx`, `CurrenciesRatesPage.tsx`, `TaxRulesRatesPage.tsx` |
| **`inventory/`** | ស្តុកទំនិញក្នុងដៃ ការផ្ទេរទំនិញឆ្លងឃ្លាំង ការកែតម្រូវស្តុក និងការរាប់ស្តុកជាក់ស្តែង | `InventoryPage.tsx`, `StockAdjustmentForm.tsx`, `StockTransferForm.tsx`, `StockOpnameForm.tsx` |
| **`logs/`** | កំណត់ត្រាសវនកម្មសុវត្ថិភាព និងប្រវត្តិសកម្មភាពរបស់អ្នកប្រើប្រាស់ទាំងអស់ | `ActivityLogsPage.tsx` |
| **`marketing/`** | យុទ្ធនាការបញ្ចុះតម្លៃ គូប៉ុង ប្រូម៉ូសិនទិញថែម Flash Sales និង Price Simulator | `PromotionsPage.tsx`, `CouponsPage.tsx`, `DiscountRulesPage.tsx`, `FlashSalesPage.tsx` |
| **`notifications/`** | បញ្ជីសារជូនដំណឹង ការរៀបចំគំរូសារ Template និងការកំណត់ការផ្ញើ | `NotificationListPage.tsx`, `NotificationSettingsPage.tsx` |
| **`orders/`** | ការបញ្ជាទិញ ការវេចខ្ចប់ ការប្រគល់ទំនិញ ការបង្វិលសង និងគោលការណ៍បង្វិល | `OrdersPage.tsx`, `OrderDetailPage.tsx`, `OrderReturnsPage.tsx`, `ReturnPoliciesPage.tsx` |
| **`payments/`** | វិធីសាស្ត្រទូទាត់ និងប្រតិបត្តិការសាច់ប្រាក់ | `PaymentMethodsPage.tsx`, `TransactionsPage.tsx` |
| **`permissions/`** | តារាងម៉ាទ្រីសសិទ្ធិអនុញ្ញាតតាម Spatie RBAC គ្រប់គ្រងសិទ្ធិលម្អិត | `PermissionsPage.tsx` |
| **`pos/`** | ផ្ទាំងគិតលុយរហ័ស ស្កេនបាកូដ គណនាពន្ធ ទូទាត់ Bakong KHQR និងបោះពុម្ពវិក្កយបត្រ | `POSPage.tsx` |
| **`products/`** | កាតាឡុកផលិតផល ទំនិញទោល/មានជម្រើស (Variants) បោះពុម្ព Barcode | `ProductsPage.tsx`, `ProductFormPage.tsx`, `ProductDetailPage.tsx` |
| **`profile/`** | កែប្រែព័ត៌មានផ្ទាល់ខ្លួន ពាក្យសម្ងាត់ និងការកំណត់ចំណូលចិត្ត | `ProfilePage.tsx` |
| **`purchases/`** | បញ្ជាទិញទំនិញពីអ្នកផ្គត់ផ្គង់ (PO) ទទួលទំនិញចូលស្តុក និងបង្វិលទំនិញខូច | `PurchasesPage.tsx`, `PurchaseDetailPage.tsx`, `PurchaseReturnsPage.tsx` |
| **`recycle-bin/`** | មជ្ឈមណ្ឌលស្តារទិន្នន័យដែលបានលុបបណ្តោះអាសន្ន (Soft Deletes) | `RecycleBinPage.tsx` |
| **`reports/`** | របាយការណ៍លក់ របាយការណ៍ទិញ របាយការណ៍ចលនាស្តុក និងចំណេញ/ខាត | `ReportsPage.tsx`, `SalesReportPage.tsx`, `PurchaseReportPage.tsx`, `InventoryReportPage.tsx` |
| **`reviews/`** | ត្រួតពិនិត្យ ឆ្លើយតប និងអនុម័តការវាយតម្លៃរបស់អតិថិជន | `ReviewsPage.tsx` |
| **`roles/`** | បង្កើត និងកំណត់តួនាទី (Cashier, Manager, Accountant, Warehouse Keeper) | `RolesPage.tsx` |
| **`sales/`** | បញ្ជីវិក្កយបត្រលក់ ប្រវត្តិការលក់ និងបង្កាន់ដៃទទួលប្រាក់ | `SalesPage.tsx`, `SalesDetailPage.tsx` |
| **`security/`** | តាមដានឧបករណ៍ដែលកំពុង Login (Device Tracker) និងការកំណត់សុវត្ថិភាព 2FA | `SecurityOverviewDashboard.tsx`, `DeviceManagementPage.tsx`, `SecuritySettingsPage.tsx` |
| **`settings/`** | ការកំណត់ប្រព័ន្ធទូទៅ Bakong KHQR credentials, Telegram Bot, រូបរាង | `SettingsPage.tsx`, `BakongSettings.tsx`, `TelegramAlertSettings.tsx`, `UnitsPage.tsx` |
| **`shipping/`** | គ្រប់គ្រងក្រុមហ៊ុនដឹកជញ្ជូន តំបន់ដឹក និងតម្លៃសេវាដឹក | `ShippingPage.tsx` |
| **`suppliers/`** | ព័ត៌មានអ្នកផ្គត់ផ្គង់ លក្ខខណ្ឌទូទាត់ និងប្រវត្តិបញ្ជាទិញ | `SuppliersPage.tsx`, `SupplierFormPage.tsx`, `SupplierDetailPage.tsx` |
| **`users/`** | គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ ផ្អាកគណនី និងចាត់តាំងតួនាទី | `UsersPage.tsx` |

---

### 4.6 ថត `src/routes/` (Routing & Guards)
- **`AppRoutes.tsx`**: មជ្ឈមណ្ឌលកូដ Routes ទាំងអស់។ ប្រើប្រាស់ `React.lazy()` ដើម្បីធ្វើ Code Splitting ឱ្យទំព័រដើរលឿនបំផុត។
- **`guards/ProtectedRoute.tsx`**:
  - ពិនិត្យមើលថាតើ User បាន Login ហើយឬនៅ (បើមិនទាន់ Login នឹងបញ្ជូនទៅកាន់ `/login`)។
  - ពិនិត្យមើលសិទ្ធិអនុញ្ញាត (Permissions) តាមរយៈ Spatie RBAC (បើគ្មានសិទ្ធិនឹងបង្ហាញទំព័រ `AccessDeniedPage`)។
- **`guards/PublicRoute.tsx`**: ការពារកុំឱ្យ User ដែលបាន Login រួចចូលទៅកាន់ទំព័រ `/login` ម្តងទៀត ដោយ redirect ទៅ `/dashboard` ស្វ័យប្រវត្តិ។
- **`components/PageFallback.tsx`**: Loading Animation ពេលកំពុងទាញយក Lazy-loaded Component។

---

### 4.7 ថត `src/services/` (API Service Layers)
មាន 40+ Pure Service Files ដែលទទួលបន្ទុកធ្វើ HTTP Requests ទៅកាន់ Backend API ដោយផ្ទាល់៖
- `authService.ts`: ចូលប្រព័ន្ធ, ចេញពីប្រព័ន្ធ, refresh token, ផ្ទៀងផ្ទាត់ 2FA
- `productService.ts`: CRUD ផលិតផល, ស្វែងរក, បង្កើតបាកូដ, នាំចូល/នាំចេញ CSV
- `posService.ts`: ដំណើរការលក់នៅបញ្ជរបេឡា, បើក/បិទវេនកុងទ័រ, ផ្ទៀងផ្ទាត់ការទូទាត់
- `bakongService.ts`: បង្កើតកូដ Bakong KHQR (Deep Link / QR String) និងពិនិត្យស្ថានភាពទូទាត់
- `inventoryService.ts`: ពិនិត្យចំនួនស្តុក, ផ្ទេរស្តុក, កែសម្រួលស្តុក, កំណត់ត្រាស្តុក
- `orderService.ts` & `orderReturnService.ts`: គ្រប់គ្រងការបញ្ជាទិញ និងដំណើរការបង្វិលសង
- `customerService.ts`: គ្រប់គ្រងទិន្នន័យអតិថិជន និងក្រុមអតិថិជន
- `employeeService.ts`: គ្រប់គ្រងបុគ្គលិក វត្តមាន និងការចាត់តាំងសាខា
- `financeService.ts`: គ្រប់គ្រងគណនី ចំណូល ចំណាយ និងវេនកុងទ័រ
- `marketingService.ts`: ប្រូម៉ូសិន គូប៉ុង បញ្ចុះតម្លៃ និង Flash Sales
- `companyService.ts`: គ្រប់គ្រងសាខា ហាង ឃ្លាំង និងក្រុមហ៊ុន
- `reportService.ts`: ទាញយករបាយការណ៍វិភាគលក់ ទិញ ស្តុក និងហិរញ្ញវត្ថុ
- `activityLogService.ts`: ទាញយកកំណត់ត្រាសវនកម្ម Audit Logs
- `permissionService.ts` & `roleService.ts`: គ្រប់គ្រងសិទ្ធិ និងតួនាទី

---

### 4.8 ថត `src/stores/` (Global State with Zustand)
- **`authStore.ts`**:
  - រក្សាទុក Token, Refresh Token, និងព័ត៌មាន User Profile។
  - រក្សាទុក `permissions: string[]` និង `roles: string[]`។
  - គ្រប់គ្រង `activeCompanyId` និង `activeBranchId` សម្រាប់ Multi-Tenant Context។
  - មុខងារ `login()`, `logout()`, `setTokens()`, `switchBranch()`, `switchCompany()`។
- **`companyStore.ts`**: គ្រប់គ្រងបញ្ជីក្រុមហ៊ុន និងសាខាដែល Admin មានសិទ្ធិគ្រប់គ្រង។
- **`themeStore.ts`**: គ្រប់គ្រង Dark Mode / Light Mode និងពណ៌ចម្បងនៃ Theme។
- **`toastStore.ts`**: គ្រប់គ្រងការបង្ហាញ Pop-up Notification (Success, Error, Warning, Info)។
- **`notificationStore.ts`**: រក្សាទុក និងរាប់ចំនួនសារជូនដំណឹងថ្មីៗ (Unread notifications counter)។

---

### 4.9 ថត `src/locales/` (Internationalization i18n)
គម្រោងនេះគាំទ្រ 2 ភាសាយ៉ាងពេញលេញ (ភាសាខ្មែរ 🇰🇭 និង ភាសាអង់គ្លេស 🇺🇸) ដោយបែងចែកជា 40 ឯកសារ JSON តាមផ្នែកមុខងារនីមួយៗ៖
- `auth.json`, `common.json`, `nav.json`, `buttons.json`, `errors.json`, `forms.json`, `toast.json`, `validation.json`
- `dashboard.json`, `pos.json`, `products.json`, `inventory.json`, `orders.json`, `purchases.json`, `sales.json`
- `customers.json`, `employees.json`, `suppliers.json`, `finance.json`, `marketing.json`, `cms.json`, `reports.json`
- `security.json`, `settings.json`, `shipping.json`, `returns.json`, `tables.json`, `confirm.json`

---

### 4.10 ថត `src/hooks/`, `src/utils/`, `src/types/`
- **`src/hooks/`**:
  - `useAuth.ts`: Hook ងាយស្រួលទាញយកទិន្នន័យអ្នកប្រើបច្ចុប្បន្ន។
  - `usePermission.ts`: Hook សម្រាប់ត្រួតពិនិត្យសិទ្ធិ (`can('product.create')`, `hasRole('Super Admin')`)។
  - `useDebounce.ts`: ទប់ស្កាត់ការ call API ញឹកញាប់ពេលវាយអក្សរស្វែងរក។
  - `useServerPagination.ts`: គ្រប់គ្រង Page Number, Page Size, Sort Order ជាមួយ Server-side API។
  - `useToast.ts`: ហៅបង្ហាញ Toast ងាយស្រួល។
- **`src/utils/`**:
  - `GlobalFormat.ts` & `formatters.ts`: ទ្រង់ទ្រាយរូបិយប័ណ្ណ (៛ KHR / $ USD), កាលបរិច្ឆេទ (Khmer / Western format)។
  - `formValidation.ts`: វិធានពិនិត្យទម្រង់បែបបទជាមួយ Zod Schema។
  - `export.ts`: មុខងារទាញយកទិន្នន័យជា Excel, CSV, PDF។
  - `geofence.ts`: គណនាចម្ងាយ GPS សម្រាប់កំណត់វត្តមានបុគ្គលិកតាមសាខា។
  - `aiCmsGenerator.ts`: ជំនួយការបង្កើតមាតិកា CMS អត្ថបទ និងចំណងជើងដោយ AI។
  - `sound.ts`: សំឡេងបន្លឺឡើងពេលស្កេនបាកូដ ឬពេលលក់បានសម្រេច។
- **`src/types/`**:
  - `bakong-khqr.d.ts`: Ambient TypeScript definition សម្រាប់ Bakong KHQR SDK (ខណៈដែល DTO Schemas និង Business Types ត្រូវបានរៀបចំដាក់ក្នុង module នីមួយៗផ្ទាល់ ដូចជា `src/pages/orders/types/orderReturn.types.ts`)។

---

## 5. ប្រព័ន្ធសុវត្ថិភាព និងការអនុញ្ញាតសិទ្ធិ (RBAC & Multi-Tenancy)

ប្រព័ន្ធដំណើរការក្រោមយន្តការការពារ 3 ជាន់៖
1. **Network Layer (Axios Interceptors)**:
   - រាល់ Request ត្រូវភ្ជាប់មកជាមួយនូវ Bearer Token។
   - ភ្ជាប់មកជាមួយនូវ `X-Company-Id` និង `X-Branch-Id` ដើម្បីការពារកុំឱ្យសាខាមួយមើលឃើញទិន្នន័យសាខាមួយទៀត (Data Isolation)។
2. **Router Layer (ProtectedRoute Guard)**:
   - ត្រួតពិនិត្យ Route នីមួយៗមុននឹង render ទំព័រ៖
   ```tsx
   <Route path="/products/create" element={
     <ProtectedRoute permission="product.create">
       <ProductFormPage />
     </ProtectedRoute>
   } />
   ```
3. **Component UI Layer (`usePermission`)**:
   - លាក់ ឬបង្ហាញប៊ូតុងសកម្មភាពតាមសិទ្ធិរបស់បុគ្គលិក៖
   ```tsx
   const { can } = usePermission();
   {can('product.delete') && <Button danger onClick={handleDelete}>Delete</Button>}
   ```

---

## 6. គោលការណ៍ណែនាំក្នុងការបន្ថែមទំព័រថ្មី (How to Add a New Page)

នៅពេលដែលអ្នកត្រូវបន្ថែមមុខងារ ឬទំព័រថ្មី (ឧទាហរណ៍៖ `PromotionVoucherPage.tsx`)៖

1. **បង្កើត API Service** នៅក្នុង `src/services/` (ឧទាហរណ៍៖ `voucherService.ts`)។
2. **បន្ថែមពាក្យបកប្រែ** នៅក្នុង `src/locales/en/` និង `src/locales/km/`។
3. **បង្កើត Page Component** នៅក្នុង `src/pages/marketing/vouchers/`៖
   - ប្រើប្រាស់ `PageHeader`, `DataTable`, `SearchInput` ពី `src/components/shared/`។
   - ប្រើប្រាស់ `usePermission` ដើម្បីការពារប៊ូតុង Actions។
4. **ចុះឈ្មោះ Route** នៅក្នុង `src/routes/AppRoutes.tsx`៖
   ```tsx
   const VoucherPage = React.lazy(() => import('@/pages/marketing/vouchers/VoucherPage'))
   
   // នៅក្នុង ProtectedRoute AdminLayout:
   <Route path="/marketing/vouchers" element={
     <ProtectedRoute permission="marketing.vouchers.view">
       <VoucherPage />
     </ProtectedRoute>
   } />
   ```
5. **បន្ថែមមឺនុយ Sidebar** នៅក្នុង `src/components/layout/AdminLayout.tsx` ដើម្បីឱ្យលោតបង្ហាញក្នុង Sidebar Menu។

---
*ឯកសារនេះត្រូវបានបង្កើតឡើងសម្រាប់ជាមគ្គុទ្ទេសក៍ស្ដង់ដារក្នុងការអភិវឌ្ឍ និងថែទាំប្រព័ន្ធ `admin-khposcommerce`។*
