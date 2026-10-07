# 🛡️ Admin Dashboard Application Manual

## 1. Overview
The **OptaPOS Admin Dashboard** is an enterprise single-page application (SPA) built on **React 19**, **Vite 8**, and **Ant Design 5**. It provides 258 pages for company management, warehouse operations, RBAC permissions, point of sale terminals, employee attendance, and financial reporting.

---

## 2. Architecture & Tech Stack

```
+---------------------------------------------------------------------------------------------------------------+
|                                      ADMIN DASHBOARD TECHNICAL STACK                                          |
+---------------------------------------------------------------------------------------------------------------+
|  UI Framework       | React 19 (^19.2.7) + TypeScript (^5.7.2)                                                |
|  Component Suite    | Ant Design 5 (^5.24.0) + Tailwind CSS (^3.4.17) + Lucide Icons                          |
|  Server State / API | @tanstack/react-query (^5.66.0) with automatic query invalidation & cache               |
|  Client State       | Zustand (^5.0.3) for Auth, Cart, Theme, and Locale                                      |
|  Internationalization| react-i18next (^15.4.1) with 5 Locales (Khmer, English, Thai, Vietnamese, Chinese)    |
|  Data Visualization | ECharts (^5.6.0) & Recharts (^2.15.1) for Real-Time Sales & Financial Analytics        |
|  Build Tool         | Vite 8 (^8.1.1) with Hot Module Replacement & Rollup Chunk Splitting                    |
+---------------------------------------------------------------------------------------------------------------+
```

---

## 3. Directory Layout

```
admin-dashboard/
├── src/
│   ├── api/                 # Axios clients and base endpoint configurations
│   ├── components/          # Reusable UI widgets, Modals, Filters, Layouts
│   ├── config/              # App constants, menu definitions, permissions
│   ├── hooks/               # Custom React hooks (useAuth, usePermission, useDebounce)
│   ├── locales/             # i18n translation dictionaries (km, en, th, vi, zh)
│   ├── pages/               # 258 Functional Pages grouped by business domain
│   │   ├── auth/            # Login, Reset Password, 2FA Verification
│   │   ├── products/        # Catalog, Attributes, Variants, Barcode Printing
│   │   ├── inventory/       # Stock on hand, Transfers, Adjustments, Valuations
│   │   ├── pos/             # Cashier Terminal, Shifts, Register Management
│   │   ├── purchases/       # Suppliers, POs, Goods Receiving, Vendor Bills
│   │   ├── sales/           # Orders, Quotations, Invoices, Delivery Slips
│   │   ├── employees/       # Staff records, Attendance QR, Leave, Payroll
│   │   ├── finance/         # Chart of accounts, Expenses, Cash flow
│   │   ├── reports/         # Executive BI dashboards, Stock reports, P&L
│   │   └── settings/        # System preferences, Tax rules, Stores, Backups
│   ├── services/            # Pure API domain service layers
│   ├── stores/              # Zustand global state slices (authStore, appStore)
│   └── types/               # TypeScript interfaces & DTO schemas
```

---

## 4. How to Add a New Admin Page Safely

When adding a new feature page (e.g. `PromotionDiscountPage.tsx`):
1. **Define Types**: Add DTO interfaces in `src/types/`.
2. **Create Service**: Add API methods in `src/services/promotionService.ts`.
3. **Build Page Component**: Create `src/pages/marketing/PromotionPage.tsx`.
4. **Wrap with Permission Guard**:
   ```tsx
   import { usePermission } from '@/hooks/usePermission'
   
   export const PromotionPage = () => {
     const { can } = usePermission()
     if (!can('marketing.promotions.view')) {
       return <ForbiddenResult />
     }
     return <div>...</div>
   }
   ```
5. **Register Route**: Add the lazy-loaded route in `src/App.tsx` and menu item in `src/config/menu.ts`.

---
*Related Docs:*
- [Backend REST API Reference](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/api/README.md)
- [Spatie RBAC Permissions](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/docs/security/spatie-rbac-and-permissions.md)
