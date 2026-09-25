# Customer Website — Developer Guide (មគ្គុទ្ទេសក៍ជាក់ស្ដែងសម្រាប់ Developer ថ្មី)

សួស្ដី Developer ថ្មី! មគ្គុទ្ទេសក៍នេះនឹងជួយអ្នកឱ្យចាប់ផ្ដើមធ្វើការលើ `customer-website` បានយ៉ាងរលូន ដោយឆ្លើយសំណួរជាក់ស្ដែងដែលអ្នកនឹងជួបប្រទះញឹកញាប់បំផុត។

---

## ១. របៀប Run និង Build គម្រោង (Getting Started)

```bash
# 1. ចូលទៅកាន់ folder customer-website
cd customer-website

# 2. ដំឡើង Dependencies
npm install

# 3. ចាប់ផ្ដើម Local Development Server
npm run dev

# 4. ពិនិត្យមើល Linting Errors
npm run lint

# 5. Build Production Bundle
npm run build
```

---

## ២. សំណួរញឹកញាប់៖ "តើកូដនេះនៅឯណា?" (Where is everything?)

| អ្វីដែលអ្នកកំពុងស្វែងរក (What you are looking for) | ទីតាំង File (File Path) |
| :--- | :--- |
| **Product API Queries** | `src/services/productService.ts` |
| **Cart Operations & API** | `src/services/cartService.ts` & `src/stores/cartStore.ts` |
| **Wishlist Logic** | `src/services/wishlistService.ts` & `src/hooks/useWishlist.ts` |
| **Order & Tracking API** | `src/services/orderService.ts` |
| **Customer Auth & Session** | `src/services/authService.ts` & `src/stores/index.ts` (`useAuthStore`) |
| **Product Card Component** | `src/components/ecommerce/ProductCard.tsx` |
| **Product Price & Discount** | `src/components/ecommerce/ProductPrice.tsx` |
| **Star Rating Component** | `src/components/ecommerce/RatingStars.tsx` |
| **UI Primitives (Button, Badge, Input, Card)** | `src/components/ui/` |
| **Routes & Page Routing** | `src/app/router/AppRouter.tsx` & `src/app/router/routes.tsx` |
| **Route Guards (Protected / Guest)** | `src/app/router/RouteGuards.tsx` |
| **SEO & Meta Tags Engine** | `src/components/seo/SEOHead.tsx` |
| **Translation JSONs** | `src/locales/{en,km,th,vi,zh}/common.json` |
| **Query Keys Dictionary** | `src/constants/queryKeys.ts` |
| **Axios API Client Instance** | `src/api/client.ts` |

---

## ៣. របៀបបន្ថែម Page ថ្មី (How to Add a New Page)

### ជំហានទី ១៖ បង្កើត Component ក្នុង `src/pages/`
```tsx
// src/pages/PromoPage.tsx
import React from 'react'
import SEOHead from '@/components/seo/SEOHead'
import PageTransition from '@/components/common/PageTransition'

export const PromoPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Exclusive Promotions"
        description="Special discounts and promotions on tech products."
        canonical="/promo"
      />
      <PageTransition className="container-site py-8">
        <h1 className="text-2xl font-bold font-display">Special Promotions</h1>
      </PageTransition>
    </>
  )
}

export default PromoPage
```

### ជំហានទី ២៖ ចុះឈ្មោះក្នុង `src/app/router/routes.tsx`
```tsx
// src/app/router/routes.tsx
export const PromoPage = React.lazy(() => import('@/pages/PromoPage'))
```

### ជំហានទី ៣៖ បន្ថែម Route ក្នុង `src/app/router/AppRouter.tsx`
```tsx
// src/app/router/AppRouter.tsx
<Route path="promo" element={<PromoPage />} />
```

---

## ៤. របៀបបន្ថែម API Service ថ្មី (How to Add an API Service)

### ជំហានទី ១៖ បង្កើត Service ក្នុង `src/services/`
```ts
// src/services/notificationService.ts
import api from '@/api'

export interface NotificationItem {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await api.get('/notifications')
    return res.data?.data || []
  },

  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`)
  },
}

export default notificationService
```

### ជំហានទី ២៖ Export ចេញពី `src/services/index.ts`
```ts
export * from './notificationService'
```

---

## ៥. របៀបបន្ថែម Reusable UI Component (How to Add a Shared Component)

* ប្រសិនបើជា **UI Primitive** គ្មាន business domain (ឧ. `Tooltip`, `Select`, `Dialog`) → ដាក់ក្នុង `src/components/ui/`
* ប្រសិនបើជា **Cross-cutting Component** (ឧ. `ShareModal`, `Pagination`) → ដាក់ក្នុង `src/components/common/`
* ប្រសិនបើជា **E-Commerce Domain Component** (ឧ. `BrandBadge`, `FlashDealBanner`) → ដាក់ក្នុង `src/components/ecommerce/`

---

## ៦. របៀបបន្ថែមភាសា i18n (How to Add Translations)

បើក file `src/locales/{en,km,th,vi,zh}/common.json` រួចបន្ថែម Key ដូចគ្នា៖

```json
// src/locales/en/common.json
{
  "promo": {
    "title": "Exclusive Deals",
    "subtitle": "Get up to 50% discount on selected gadgets"
  }
}
```

```json
// src/locales/km/common.json
{
  "promo": {
    "title": "ការផ្ដល់ជូនពិសេស",
    "subtitle": "ទទួលបានការបញ្ចុះតម្លៃរហូតដល់ 50% លើផលិតផលបច្ចេកវិទ្យាជាច្រើន"
  }
}
```

ហៅប្រើក្នុង Component៖
```tsx
const { t } = useTranslation()
return <h2>{t('promo.title')}</h2>
```

---

## ៧. របៀបថែរក្សា SEO (SEO Best Practices)

* **ជានិច្ចកាល** ត្រូវផ្ដល់ `title`, `description`, និង `canonical` ទៅកាន់ `<SEOHead />`។
* ប្រសិនបើជាទំព័រ **សាធារណៈ (Public Indexable)** (ឧ. Home, Catalog, Product Detail, Blog) → មិនបាច់ដាក់ `robots` ទេ វានឹង default ទៅ `index, follow` ដោយស្វ័យប្រវត្តិ។
* ប្រសិនបើជាទំព័រ **ឯកជន (Private / Auth / Cart / Checkout)** → ត្រូវដាក់ `robots="noindex, follow"` ឬ `robots="noindex, nofollow"`។
