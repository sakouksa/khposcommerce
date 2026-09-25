# 🔍 OptaPOS Customer Storefront — Standard Technical SEO Manual
## មគ្គុទ្ទេសក៍ស្ថាបត្យកម្ម SEO & ការកំណត់រចនាសម្ព័ន្ធស្វែងរកផ្លូវការ

ឯកសារនេះពិពណ៌នាអំពី **ស្ថាបត្យកម្ម SEO (Search Engine Optimization)**, ការកំណត់រចនាសម្ព័ន្ធ Metadata, XML Sitemap, Structured Data (JSON-LD), Robots.txt, និងរបៀបដែល Developer អាចបន្ថែមទំព័រថ្មីជាមួយ SEO កម្រិត Enterprise លើ `customer-website`។

---

## 1. ស្ថាបត្យកម្ម SEO (SEO Architecture)

`customer-website` ដំណើរការលើ **React 19 + Vite SPA (Client-Side Rendering - CSR)** ដោយប្រើប្រាស់បច្ចេកវិទ្យា៖
- **`react-helmet-async`**: គ្រប់គ្រង Document `<head>`, `<title>`, `<meta>`, OpenGraph, Twitter Cards និង JSON-LD Scripts ដោយមិនបង្ក Memory Leak ឬ Re-render Loop។
- **`src/config/seo.ts`**: Single Source of Truth សម្រាប់រាល់ Configuration ទាំងអស់ (Site URL, Site Name, OpenGraph Images, Locales)។
- **`<SEOHead />` (`src/components/seo/SEOHead.tsx`)**: Reusable SEO Component កម្រិតខ្ពស់ដែលគ្រប់គ្រង Titles, Descriptions, Canonical URLs, Robots, និង Schema.org Structured Data។
- **Laravel 12 Backend API (`/sitemap.xml`)**: Dynamic Sitemap Builder ដែលទាញយក Products, Categories, Brands, និង Blogs សកម្មផ្ទាល់ពី PostgreSQL 18។

---

## 2. ការកំណត់រចនាសម្ព័ន្ធមជ្ឈមណ្ឌល (Central SEO Configuration)

ទីតាំង File: [`src/config/seo.ts`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/config/seo.ts)

```typescript
export const SEO_CONFIG = {
  siteUrl: getSiteUrl(), // ទាញយកពី VITE_SITE_URL ឬ window.location.origin
  siteName: 'OptaPOS Store',
  defaultTitle: 'OptaPOS Store — Official E-Commerce & Retail Technology Cambodia',
  titleTemplate: (pageTitle?: string) => `${pageTitle} | OptaPOS Store`,
  defaultDescription: 'Shop authentic electronics, computers, smartphones, gaming gear, and enterprise POS hardware with fast nationwide delivery in Cambodia.',
  defaultOgImage: `${siteUrl}/logo.png`,
  defaultLocale: 'km_KH',
  supportedLocales: { km: 'km_KH', en: 'en_US', th: 'th_TH', vi: 'vi_VN', zh: 'zh_CN' },
  sitemapUrl: `${siteUrl}/sitemap.xml`,
  robotsUrl: `${siteUrl}/robots.txt`,
  themeColor: '#0066FF',
  twitterHandle: '@OptaPOS',
}
```

---

## 3. SEO លើទំព័រផលិតផល (Product Page SEO)

ទីតាំង File: [`src/pages/ProductDetailPage.tsx`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/pages/ProductDetailPage.tsx)

ទំព័រផលិតផលទាញទិន្នន័យពិតចេញពី Database / REST API ដើម្បីបង្កើត Metadata៖
1. **Title**: `product.meta_title` ➜ `product.name` + ` | OptaPOS Store`
2. **Description**: `product.meta_description` ➜ `product.short_description` ➜ `stripHtml(description)` (កាត់ត្រឹម ១៦០ តួអក្សរ)
3. **Structured Data (`schema.org/Product`)**:
   - `name`: ឈ្មោះផលិតផលពិត
   - `image`: រូបភាពចម្បង (`primaryImageUrl`)
   - `sku`: Product SKU code
   - `brand`: Brand Object
   - `offers`: តម្លៃពិត (`price`), រូបិយប័ណ្ណ (`USD`), ស្ថានភាពស្តុក (`InStock` / `OutOfStock`), និង Seller Name
   - `aggregateRating`: បង្ហាញតែពេលមាន Rating & Review Count ពិតប្រាកដប៉ុណ្ណោះ (មិនក្លែងបន្លំទិន្នន័យ)
4. **BreadcrumbList**: `Home` ➜ `Products` ➜ `{Category Name}` ➜ `{Product Name}`

---

## 4. SEO លើទំព័រប្រភេទ និងម៉ាក (Category & Brand SEO)

ទីតាំង File: [`src/pages/ProductListPage.tsx`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/pages/ProductListPage.tsx)

- **Dynamic Page Title**: `{Category Name} Products | OptaPOS Store` ឬ `{Brand Name} Store | OptaPOS Store`
- **Canonical URL**: `/category/{category-slug}` ឬ `/brand/{brand-slug}`
- **Structured Data**: `schema.org/CollectionPage` + `schema.org/BreadcrumbList`
- **Search Query Handling**: ប្រសិនបើ URL មាន Search Query (`?search=...`) ប្រព័ន្ធនឹងកំណត់ `robots="noindex, follow"` ដោយស្វ័យប្រវត្តិ ដើម្បីការពារ Duplicate Indexing។

---

## 5. SEO លើទំព័រ Blog (Blog & Article SEO)

ទីតាំង File: [`src/pages/BlogDetailPage.tsx`](file:///Users/macbook/Workspace/projects/showcase/Project-Enterprise-E-Commerce-POS-System/customer-website/src/pages/BlogDetailPage.tsx)

- **OpenGraph Type**: `ogType="article"`
- **Structured Data**: `schema.org/Article`
- **Fields**: `headline`, `datePublished`, `dateModified`, `author` (Person/Organization), `publisher`, និង `image`។

---

## 6. ការគ្រប់គ្រងទំព័រឯកជន (Private Routes Protection)

ទំព័រដែលទាក់ទងនឹងព័ត៌មានផ្ទាល់ខ្លួនរបស់អតិថិជន ត្រូវតែហាមឃាត់មិនឱ្យ Search Engine ចូល Index ឡើយ៖
- `/cart` ➜ `robots="noindex, nofollow"`
- `/checkout`, `/checkout/success`, `/checkout/failed` ➜ `robots="noindex, nofollow"`
- `/auth/login`, `/auth/register`, `/auth/forgot-password` ➜ `robots="noindex, nofollow"`
- `/account`, `/account/*` (Dashboard, Orders, Addresses, Wishlist) ➜ `robots="noindex, nofollow"`
- `/track`, `/track/:number` ➜ `robots="noindex, nofollow"`

---

## 7. ការកំណត់ Robots.txt & Sitemap.xml

### A. Robots.txt (`public/robots.txt`)
```txt
User-agent: *
Allow: /
Allow: /products
Allow: /products/*
Allow: /category/*
Allow: /brand/*
Allow: /blog
Allow: /about
Allow: /contact
Allow: /faqs
Allow: /terms
Allow: /privacy
Allow: /shipping
Allow: /returns
Allow: /assets/
Allow: /images/

Disallow: /search
Disallow: /cart
Disallow: /checkout
Disallow: /track
Disallow: /wishlist
Disallow: /account
Disallow: /auth/
Disallow: /api/

Sitemap: https://enterprise-customer-store.vercel.app/sitemap.xml
Sitemap: https://enterprise-pos-api.onrender.com/sitemap.xml
```

### B. Sitemap Generation (`public/sitemap.xml` & Backend Dynamic Sitemap)
- Frontend មាន static manifest សម្រាប់ Core Landing Pages។
- Backend Laravel (`SeoController@sitemap`) ផ្តល់ Dynamic XML Sitemap ដោយ Query ចេញពី Database ដោយស្វ័យប្រវត្តិនូវរាល់ Active Products (រហូតដល់ 50,000 URLs), Active Categories, Brands, និង Published Blogs ជាមួយ Redis Caching ៣០ នាទី។

---

## 8. ការចែករំលែកលើបណ្តាញសង្គម (Social Sharing & Open Graph)

រាល់ទំព័រទាំងអស់ត្រូវបានបំពាក់ដោយ៖
- `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, `og:locale`
- `twitter:card="summary_large_image"`
- **Facebook / Telegram Debugger**:
  - អ្នកអាចយក Link ទៅតេស្តលើ [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) ឬ Telegram Webpage Bot ដើម្បីផ្ទៀងផ្ទាត់ Cache និងរូបភាព Preview។

---

## 9. របៀបដែល Developer បន្ថែមទំព័រថ្មីជាមួយ SEO (How to Add a New SEO Page)

`SEOHead` គឺជា reusable component សម្រាប់គ្រប់ public pages។ Developer ថ្មីមិនចាំបាច់សរសេរ `<title>` និង Open Graph meta tags ម្តងៗទេ។ គ្រាន់តែហៅ component នេះនៅខាងលើ Page Component៖

```tsx
import React from 'react'
import SEOHead from '@/components/seo/SEOHead'

export const NewPromotionPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Mega Sale Promotion 2026"
        description="Get up to 50% discount on genuine laptops and smartphones at OptaPOS Store."
        canonical="/promotions/mega-sale"
        ogType="website"
        ogImage="https://enterprise-customer-store.vercel.app/images/promo-banner.jpg"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Promotions', url: '/promotions' },
          { name: 'Mega Sale', url: '/promotions/mega-sale' }
        ]}
      />
      
      <div>{/* Page Content */}</div>
    </>
  )
}
```

---

## 10. ការដំឡើង Google Search Console

1. ចូលទៅកាន់ [Google Search Console](https://search.google.com/search-console)
2. បញ្ចូល Domain: `https://enterprise-customer-store.vercel.app`
3. ផ្ទៀងផ្ទាត់សិទ្ធិ (HTML Tag verification token អាចដាក់ក្នុង `VITE_GOOGLE_SITE_VERIFICATION` ឬ DNS TXT Record)
4. Submit Sitemap URL: `https://enterprise-customer-store.vercel.app/sitemap.xml`
5. ប្រើមុខងារ **URL Inspection Tool** ដើម្បីតេស្ត Live URL Rendering របស់ Googlebot។
