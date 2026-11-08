# 🖥️ Frontend Architecture (Admin Dashboard & POS)

## 1. Overview & Principles

The Admin Dashboard and Point of Sale (POS) frontend is built with **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. It follows enterprise UI/UX patterns including:
- **Clean UI & Standardized Components**: Standardized input heights (`h-10`), smooth animations (`framer-motion`), rich popovers, and accessible modals.
- **Global Modular Tabs**: Reusable `WorkspaceTabs.tsx` to standardize top navigation across Catalog, Inventory, Customers, and Orders.
- **Dynamic Columns**: Customizable table column visibility saved in localStorage via `ColumnSettingsPopover.tsx`.
- **Full 5-Language Localization**: React-i18next setup supporting Khmer (`km`), English (`en`), Chinese (`zh`), Thai (`th`), and Vietnamese (`vi`).

---

## 2. Directory Structure (`admin-dashboard/src/`)

```text
admin-dashboard/src/
├── api/                     # Axios API clients, interceptors & error handlers
│   └── client.ts            # Central API instance with auth header injection
├── components/
│   ├── common/              # Generic UI: Breadcrumbs, Loaders, Buttons, Badges
│   ├── layout/              # AdminLayout, Header, Sidebar, QuickActionDrawer
│   └── shared/              # Reusable Enterprise Widgets:
│       ├── WorkspaceTabs.tsx        # Global tab navigation component
│       ├── SearchInput.tsx          # Standardized 5-lang search bar
│       ├── ResetButton.tsx          # Clean filter reset button
│       ├── ColumnSettingsPopover.tsx# Column visibility selector
│       ├── ModernSelect.tsx         # Searchable, styled select dropdown
│       ├── FilterDrawerShell.tsx    # Slide-over filter container
│       ├── TableWrapper.tsx         # Responsive table skeleton & spinner
│       └── Pagination.tsx           # Server-side pagination controls
├── hooks/                   # Custom React Hooks:
│   ├── useAuth.ts           # Authentication state & permission checker
│   ├── useToast.ts          # Toast notifications
│   └── useServerPagination.ts# Unified server pagination state
├── locales/                 # 5-Language JSON Translation Dictionaries:
│   ├── km/                  # Khmer (Default)
│   ├── en/                  # English
│   ├── zh/                  # Chinese
│   ├── th/                  # Thai
│   └── vi/                  # Vietnamese
├── modules/                 # Modular Domain Feature Bundles (e.g., categories)
└── pages/                   # Application Pages & Feature Hubs:
    ├── products/            # Product Catalog, Variants, Taxes
    ├── inventory/           # Stock Levels, Movements, Transfers, Audits
    ├── pos/                 # High-speed POS Register & Checkout
    ├── orders/              # Omnichannel Order Management
    ├── customers/           # CRM & Loyalty Points
    ├── suppliers/           # Supplier Directory & Purchases
    ├── finance/             # Expense Tracking & Cash Registers
    ├── reports/             # Sales & Inventory Analytics
    └── settings/            # Company Profile, Warehouses, Units, Roles
```

---

## 3. Core Component Standards

### 3.1 Global Workspace Tabs (`WorkspaceTabs.tsx`)
Provides smooth tab navigation with active underline animations and optional badge counters.

```tsx
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'

<WorkspaceTabs
  tabs={[
    { id: 'products', label: t('products.allProducts'), icon: Package, count: 1250 },
    { id: 'categories', label: t('products.categories'), icon: FolderTree },
    { id: 'brands', label: t('products.brands'), icon: Tag },
    { id: 'units', label: t('products.units'), icon: Scale },
    { id: 'attributes', label: t('products.attributes'), icon: Sliders },
    { id: 'taxes', label: t('products.taxes'), icon: Percent },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

### 3.2 Standardized Search & Filter Bar (`SearchInput.tsx` & `ResetButton.tsx`)
Ensures uniform height (`h-10`), rounded corners (`rounded-xl`), and integrated clear buttons across all modules.

```tsx
<div className="flex items-center gap-2.5">
  <SearchInput
    value={search}
    onChange={(val) => { setSearch(val); setPage(1); }}
    placeholder="products.searchPlaceholder"
  />

  <select
    value={statusFilter}
    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
    className="h-10 px-3.5 text-xs font-semibold rounded-xl border border-border bg-card text-foreground shadow-sm"
  >
    <option value="all">{t('common.allStatus')}</option>
    <option value="active">{t('common.active')}</option>
    <option value="inactive">{t('common.inactive')}</option>
  </select>

  <ResetButton onClick={handleReset} />
</div>
```

---

## 4. Internationalization Architecture (i18n)

Translations are organized into domain namespaces:
- `common.json`: Generic actions (`save`, `cancel`, `delete`, `reset`, `filter`, `status`, `active`, `inactive`).
- `products.json`: Product catalog, categories, brands, variants, SKU, taxes.
- `inventory.json`: Warehouse locations, stock movements, transfers, adjustments, cycle counts.
- `pos.json`: Cart, tender types, split payments, cash drawer, receipt templates.
- `orders.json`: Order statuses, tracking, shipping, fulfillment.
- `customers.json`: Customer profiles, loyalty tiers, transaction histories.
