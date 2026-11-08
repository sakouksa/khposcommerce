/**
 * Enterprise AI CMS Content & Metadata Generator
 * Generates SEO Slugs, Categorical Descriptions, Articles, FAQs, and Meta Tags.
 */

import { generateSlug } from './slug'

export interface AICategorySuggestion {
  name: string
  slug: string
  description: string
}

export interface AIBlogSuggestion {
  title: string
  slug: string
  excerpt: string
  content: string
  metaTitle: string
  metaDescription: string
}

export interface AIFaqSuggestion {
  question: string
  answer: string
  category: string
}

// Curated Enterprise Retail & POS AI Preset Catalog
export const AI_CATEGORY_PRESETS: Record<string, AICategorySuggestion[]> = {
  km: [
    {
      name: 'បច្ចេកវិទ្យា POS & Cloud',
      slug: 'pos-cloud-technology',
      description: 'ការណែនាំ និងគន្លឹះគ្រប់គ្រងប្រព័ន្ធ Cloud POS ការទូទាត់អេឡិចត្រូនិក និងបច្ចេកវិទ្យាលក់រាយទំនើប។',
    },
    {
      name: 'យុទ្ធសាស្ត្ររក្សាអតិថិជន & Loyalty',
      slug: 'customer-retention-loyalty',
      description: 'មេរៀន និងតិចនិកបង្កើតកម្មវិធី Loyalty Points, កម្រិតសមាជិក VIP និងការបង្កើនការទិញឡើងវិញ។',
    },
    {
      name: 'ការគ្រប់គ្រងស្តុក & ឃ្លាំងទំនិញ',
      slug: 'inventory-warehouse-management',
      description: 'វិធីសាស្ត្រគ្រប់គ្រងស្តុកឆ្លាតវៃ ការផ្ទេរសាខា ការកាត់បន្ថយបាត់បង់ទំនិញ និង Real-time Inventory Audit។',
    },
    {
      name: 'ពាណិជ្ជកម្មអេឡិចត្រូនិច & Omnichannel',
      slug: 'ecommerce-omnichannel-retail',
      description: 'ការតភ្ជាប់ហាងផ្ទាល់ (Offline POS) ជាមួយគេហទំព័រលក់ទំនិញអនឡាញ និងបណ្តាញផ្សព្វផ្សាយ។',
    },
    {
      name: 'ការគ្រប់គ្រងហិរញ្ញវត្ថុ & ចំណូលចំណាយ',
      slug: 'finance-cashflow-analytics',
      description: 'ការវិភាគរបាយការណ៍ហិរញ្ញវត្ថុ ចំណូលចំណាយប្រចាំថ្ងៃ និងការគណនាប្រាក់ចំណេញដុលអាជីវកម្ម។',
    },
  ],
  en: [
    {
      name: 'POS Technology & Cloud Systems',
      slug: 'pos-technology-cloud-systems',
      description: 'Comprehensive guides and tutorials on modern cloud POS setups, offline syncing, and secure payments.',
    },
    {
      name: 'Customer Loyalty & Retention',
      slug: 'customer-loyalty-retention',
      description: 'Strategies for designing high-converting loyalty rewards, VIP membership tiers, and automated SMS marketing.',
    },
    {
      name: 'Inventory & Supply Chain',
      slug: 'inventory-supply-chain',
      description: 'Best practices for real-time multi-branch stock control, automated reordering, and barcode management.',
    },
    {
      name: 'Omnichannel & E-Commerce',
      slug: 'omnichannel-ecommerce',
      description: 'Connecting physical brick-and-mortar storefronts with online storefronts, delivery, and payments.',
    },
    {
      name: 'Financial Reporting & Analytics',
      slug: 'financial-reporting-analytics',
      description: 'Insights into daily revenue reconciliation, profit margins, sales forecasting, and expense auditing.',
    },
  ],
}

/**
 * Generate AI Category Description & Slug from category name
 */
export function aiGenerateCategory(name: string, lang: string = 'km'): AICategorySuggestion {
  const cleanName = name.trim()
  const slug = generateSlug(cleanName)

  if (lang === 'km') {
    return {
      name: cleanName,
      slug,
      description: `អត្ថបទ ការណែនាំ និងគន្លឹះជាក់ស្តែងស្តីអំពី "${cleanName}" សម្រាប់បង្កើនប្រសិទ្ធភាពអាជីវកម្មលក់រាយ និងការគ្រប់គ្រងប្រព័ន្ធ POS ទំនើប។`,
    }
  }

  if (lang === 'zh') {
    return {
      name: cleanName,
      slug,
      description: `关于“${cleanName}”的专业行业指南、最佳实践与零售 POS 系统高效运营技巧。`,
    }
  }

  if (lang === 'th') {
    return {
      name: cleanName,
      slug,
      description: `บทความ คู่มือ และเคล็ดลับการดำเนินงานเกี่ยวกับ "${cleanName}" เพื่อเพิ่มยอดขายและการจัดการระบบ POS ยุคใหม่`,
    }
  }

  if (lang === 'vi') {
    return {
      name: cleanName,
      slug,
      description: `Bài viết, hướng dẫn thực tế và bí quyết về "${cleanName}" nhằm tối ưu hóa hoạt động bán lẻ và hệ thống POS hiện đại.`,
    }
  }

  return {
    name: cleanName,
    slug,
    description: `Expert articles, actionable tutorials, and industry insights on "${cleanName}" for modern retail and enterprise operations.`,
  }
}

/**
 * Generate AI FAQ details from question
 */
export function aiGenerateFaq(questionText: string, lang: string = 'km'): AIFaqSuggestion {
  const cleanQ = questionText.trim()

  if (lang === 'km') {
    return {
      question: cleanQ,
      answer: `លោកអ្នកអាចអនុវត្តបានយ៉ាងងាយស្រួលតាមរយៈប្រព័ន្ធរបស់យើង។ សូមចូលទៅកាន់ផ្ទាំងកំណត់ ឬទាក់ទងមកកាន់ផ្នែកបម្រើអតិថិជន ២៤/៧ តាមរយៈលេខទូរស័ព្ទ +855 71 888 999 ឬ Telegram: @EnterpriseShopBot សម្រាប់ជំនួយបន្ថែម។`,
      category: 'ជំនួយទូទៅ',
    }
  }

  return {
    question: cleanQ,
    answer: `You can easily manage this within the system settings. For step-by-step assistance, contact our 24/7 customer support team via hotline +855 71 888 999 or Telegram @EnterpriseShopBot.`,
    category: 'General Support',
  }
}

/**
 * Generate AI Blog SEO & Excerpt from title
 */
export function aiGenerateBlogMeta(title: string, lang: string = 'km'): {
  slug: string
  excerpt: string
  metaTitle: string
  metaDescription: string
} {
  const cleanTitle = title.trim()
  const slug = generateSlug(cleanTitle)

  if (lang === 'km') {
    return {
      slug,
      excerpt: `ស្វែងយល់ពីគន្លឹះសំខាន់ៗស្តីអំពី ${cleanTitle} ដើម្បីពង្រឹងអាជីវកម្ម បង្កើនការលក់ និងគ្រប់គ្រងអតិថិជនឱ្យកាន់តែមានប្រសិទ្ធភាព។`,
      metaTitle: `${cleanTitle} | OptaPOS Enterprise`,
      metaDescription: `អត្ថបទណែនាំលម្អិតអំពី ${cleanTitle}។ រៀនសូត្រពីយុទ្ធសាស្ត្រជាក់ស្តែង និងបច្ចេកវិទ្យាទំនើបសម្រាប់អាជីវកម្មលក់រាយនៅកម្ពុជា។`,
    }
  }

  return {
    slug,
    excerpt: `Discover essential best practices and expert insights on ${cleanTitle} to boost sales, streamline operations, and enhance customer retention.`,
    metaTitle: `${cleanTitle} | Enterprise Retail & POS`,
    metaDescription: `A comprehensive guide exploring ${cleanTitle}. Learn actionable strategies, industry benchmarks, and proven retail tactics.`,
  }
}
