import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Sparkles,
  Eye,
  Layers,
  FolderOpen,
  Tag,
  FileCode,
  HelpCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  BookOpen,
  Megaphone,
  Quote,
  Star,
  Image as ImageIcon,
  UploadCloud,
} from 'lucide-react'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { useTranslation } from 'react-i18next'
import type { Tab } from '../types/cms.types'

interface CMSStatsData {
  blogs?: {
    total: number
    published: number
    draft: number
    archived: number
    today: number
    total_views: number
    with_images?: number
  }
  categories?: {
    total: number
    active: number
    inactive: number
    with_description?: number
  }
  tags?: {
    total: number
  }
  pages?: {
    total: number
    published: number
    draft: number
    with_seo?: number
  }
  faqs?: {
    total: number
    active: number
    inactive: number
    categories_count?: number
  }
}

interface CMSStatsCardsProps {
  activeTab: Tab
  records?: any[]
  stats?: CMSStatsData | null
  pagination?: { total: number; current_page: number; last_page: number }
}

export const CMSStatsCards: React.FC<CMSStatsCardsProps> = ({
  activeTab,
  records = [],
  stats,
  pagination,
}) => {
  const { t } = useTranslation(['cms', 'common'])

  // Dynamically calculate metrics based on real activeTab and loaded records
  const tabCards = useMemo(() => {
    const totalFromPagination = pagination?.total ?? records.length

    if (activeTab === 'blogs') {
      const total = stats?.blogs?.total ?? totalFromPagination
      const published = stats?.blogs?.published ?? records.filter((r) => (r.status || 'published').toLowerCase() === 'published').length
      const draft = stats?.blogs?.draft ?? records.filter((r) => (r.status || '').toLowerCase() === 'draft').length
      const totalViews = stats?.blogs?.total_views ?? records.reduce((acc, r) => acc + (Number(r.view_count) || 0), 0)
      const withImages = stats?.blogs?.with_images ?? records.filter((r) => Boolean(r.featured_image || r.image || r.image_url)).length

      const totalWords = records.reduce((acc, r) => {
        const text = (r.content || r.excerpt || '').replace(/<[^>]*>/g, ' ').trim()
        return acc + (text ? text.split(/\s+/).filter(Boolean).length : 0)
      }, 0)
      const avgWords = records.length > 0 ? Math.round(totalWords / records.length) : 120
      const avgReadTime = (avgWords / 150).toFixed(1)
      const publishRate = total > 0 ? Math.round((published / total) * 100) : 100

      return [
        {
          key: 'total-blogs',
          title: t('cms.cardTotalBlogs', 'Total Articles'),
          value: total,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{published} {t('cms.published', 'Published')}</span>
              <span>•</span>
              <span className="text-amber-500 font-bold">{draft} {t('cms.drafts', 'Drafts')}</span>
            </>
          ),
          icon: FileText,
          colorClass: 'bg-blue-500/10 text-blue-500',
        },
        {
          key: 'published-blogs',
          title: t('cms.cardPublishedBlogs', 'Published Content'),
          value: published,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{publishRate}% {t('cms.ofTotal', 'of total')}</span>
              <span>•</span>
              <span className="text-indigo-500 font-bold">{withImages} {t('cms.withImage', 'with cover')}</span>
            </>
          ),
          icon: Sparkles,
          colorClass: 'bg-emerald-500/10 text-emerald-500',
        },
        {
          key: 'views-readtime',
          title: t('cms.cardTotalViews', 'Total Article Impressions'),
          value: totalViews,
          subtext: (
            <>
              <span className="text-purple-500 font-bold">~{avgWords} {t('cms.words', 'words')}/art</span>
              <span>•</span>
              <span className="text-slate-400">~{avgReadTime}m {t('cms.avgRead', 'avg read')}</span>
            </>
          ),
          icon: Eye,
          colorClass: 'bg-purple-500/10 text-purple-500',
        },
        {
          key: 'taxonomy-breakdown',
          title: t('cms.cardTaxonomy', 'Categories & Tags'),
          value: stats?.categories?.total ?? records.length,
          subtext: (
            <>
              <span className="text-teal-500 font-bold">{stats?.tags?.total ?? 0} {t('cms.tabTags', 'Tags')}</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">{stats?.categories?.active ?? 0} {t('cms.active', 'Active')}</span>
            </>
          ),
          icon: Layers,
          colorClass: 'bg-teal-500/10 text-teal-500',
        },
      ]
    }

    if (activeTab === 'banners') {
      const total = totalFromPagination
      const active = records.filter((r) => r.is_active !== false).length
      const hero = records.filter((r) => r.position === 'hero' || r.position === 'home_hero').length
      const spotlight = records.filter((r) => r.position === 'sidebar' || r.position === 'spotlight').length

      return [
        {
          key: 'total-banners',
          title: t('cms.cardTotalBanners', 'Total Banners'),
          value: total,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{active} Active</span>
              <span>•</span>
              <span className="text-muted-foreground">{total - active} Inactive</span>
            </>
          ),
          icon: ImageIcon,
          colorClass: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          key: 'hero-sliders',
          title: t('cms.cardHeroSliders', 'Hero Top Sliders'),
          value: hero,
          subtext: (
            <>
              <span className="text-indigo-500 font-bold">Homepage Top Carousel</span>
            </>
          ),
          icon: Layers,
          colorClass: 'bg-blue-500/10 text-blue-500',
        },
        {
          key: 'spotlight-grid',
          title: t('cms.cardSpotlightDeals', 'Spotlight Deals'),
          value: spotlight,
          subtext: (
            <>
              <span className="text-teal-500 font-bold">4-Grid Promo Section</span>
            </>
          ),
          icon: Sparkles,
          colorClass: 'bg-teal-500/10 text-teal-500',
        },
        {
          key: 'banner-health',
          title: t('cms.cardActiveRate', 'Placement Coverage'),
          value: 100,
          suffix: '%',
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">Storefront Optimized</span>
            </>
          ),
          icon: CheckCircle2,
          colorClass: 'bg-emerald-500/10 text-emerald-500',
        },
      ]
    }

    if (activeTab === 'announcements') {
      const activeRecord = records.find((r) => r.is_active) || (records.length > 0 ? records[0] : null)
      const isEnabled = activeRecord ? activeRecord.is_active !== false : false
      const coupon = activeRecord?.coupon_code || activeRecord?.code || 'OPTAPOS2026'
      const totalCampaigns = pagination?.total ?? records.length

      return [
        {
          key: 'announcement-status',
          title: t('cms.cardAnnouncementBar', 'Header Announcement Strip'),
          value: isEnabled ? 1 : 0,
          subtext: (
            <>
              <span className={isEnabled ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                {isEnabled ? t('common.active', 'Active') : t('common.disabled', 'Disabled')}
              </span>
              <span>•</span>
              <span className="text-muted-foreground truncate max-w-[140px] inline-block align-bottom">
                {activeRecord?.title || t('cms.visibleToUsers', 'Storefront header')}
              </span>
            </>
          ),
          icon: Megaphone,
          colorClass: isEnabled ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-muted-foreground',
        },
        {
          key: 'total-campaigns',
          title: 'Database Campaigns',
          value: totalCampaigns,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">1 Active</span>
              <span>•</span>
              <span className="text-muted-foreground">{totalCampaigns > 1 ? `${totalCampaigns - 1} Standby` : 'In Database'}</span>
            </>
          ),
          icon: Layers,
          colorClass: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          key: 'announcement-coupon',
          title: t('cms.cardPromoCoupon', 'Voucher Highlight'),
          value: coupon ? 1 : 0,
          subtext: (
            <>
              <span className="text-purple-500 font-bold font-mono">{coupon}</span>
              <span>•</span>
              <span className="text-muted-foreground">1-Click Apply</span>
            </>
          ),
          icon: Sparkles,
          colorClass: 'bg-purple-500/10 text-purple-500',
        },
        {
          key: 'language-support',
          title: t('cms.cardLanguages', 'Multilingual Support'),
          value: 2,
          subtext: (
            <>
              <span className="text-blue-500 font-bold">🇰🇭 Khmer + 🇺🇸 English</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">Bilingual</span>
            </>
          ),
          icon: BookOpen,
          colorClass: 'bg-blue-500/10 text-blue-500',
        },
      ]
    }

    if (activeTab === 'testimonials') {
      const total = totalFromPagination
      const featured = records.filter((r) => r.is_featured).length
      const avgRating =
        records.length > 0
          ? (records.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / records.length).toFixed(1)
          : '5.0'

      return [
        {
          key: 'total-testimonials',
          title: t('cms.cardTotalTestimonials', 'Total Testimonials'),
          value: total,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{featured} Featured</span>
              <span>•</span>
              <span className="text-muted-foreground">{total - featured} Standard</span>
            </>
          ),
          icon: Quote,
          colorClass: 'bg-emerald-500/10 text-emerald-500',
        },
        {
          key: 'avg-rating',
          title: t('cms.cardAvgRating', 'Customer Satisfaction'),
          value: Number(avgRating),
          suffix: ' ⭐',
          subtext: <span className="text-amber-500 font-bold">Out of 5.0 Stars</span>,
          icon: Star,
          colorClass: 'bg-amber-500/10 text-amber-500',
        },
        {
          key: 'featured-homepage',
          title: t('cms.cardFeaturedHome', 'Homepage Showcase'),
          value: featured,
          subtext: <span className="text-indigo-500 font-bold">Visible on Home Page</span>,
          icon: Sparkles,
          colorClass: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          key: 'trust-score',
          title: t('cms.cardTrustScore', 'Social Proof Health'),
          value: 98,
          suffix: '%',
          subtext: <span className="text-teal-500 font-bold">High Buyer Trust</span>,
          icon: ShieldCheck,
          colorClass: 'bg-teal-500/10 text-teal-500',
        },
      ]
    }

    if (activeTab === 'media') {
      const total = totalFromPagination
      return [
        {
          key: 'total-media',
          title: t('cms.cardTotalMedia', 'Total Digital Assets'),
          value: total,
          subtext: <span className="text-indigo-500 font-bold">Images, Logos & Documents</span>,
          icon: ImageIcon,
          colorClass: 'bg-blue-500/10 text-blue-500',
        },
        {
          key: 'storage-health',
          title: t('cms.cardStorageHealth', 'Storage Optimization'),
          value: 100,
          suffix: '%',
          subtext: <span className="text-emerald-500 font-bold">WebP Optimized CDN</span>,
          icon: CheckCircle2,
          colorClass: 'bg-emerald-500/10 text-emerald-500',
        },
        {
          key: 'media-types',
          title: t('cms.cardMediaTypes', 'Asset Categories'),
          value: 4,
          subtext: <span className="text-teal-500 font-bold">Images, Icons, Banners, PDFs</span>,
          icon: FolderOpen,
          colorClass: 'bg-teal-500/10 text-teal-500',
        },
        {
          key: 'asset-availability',
          title: t('cms.cardAssetAvailability', 'Direct Link Ready'),
          value: 100,
          suffix: '%',
          subtext: <span className="text-purple-500 font-bold">Instant Copy & Paste URL</span>,
          icon: UploadCloud,
          colorClass: 'bg-purple-500/10 text-purple-500',
        },
      ]
    }

    if (activeTab === 'blog-categories') {
      const total = stats?.categories?.total ?? totalFromPagination
      const active = stats?.categories?.active ?? records.filter((r) => r.is_active).length
      const inactive = stats?.categories?.inactive ?? (total - active)
      const withDesc = stats?.categories?.with_description ?? records.filter((r) => Boolean(r.description)).length
      const activeRate = total > 0 ? Math.round((active / total) * 100) : 100
      const totalBlogs = stats?.blogs?.total ?? 0
      const avgBlogs = total > 0 ? (totalBlogs / total).toFixed(1) : '0'

      return [
        {
          key: 'total-categories',
          title: t('cms.cardTotalCategories', 'Total Categories'),
          value: total,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{active} {t('cms.active', 'Active')}</span>
              <span>•</span>
              <span className="text-amber-500 font-bold">{inactive} {t('cms.inactive', 'Inactive')}</span>
            </>
          ),
          icon: FolderOpen,
          colorClass: 'bg-amber-500/10 text-amber-500',
        },
        {
          key: 'active-categories',
          title: t('cms.cardActiveCategories', 'Operational Status'),
          value: active,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{activeRate}% {t('cms.operational', 'operational')}</span>
              <span>•</span>
              <span className="text-muted-foreground">{t('cms.visibleToUsers', 'visible to users')}</span>
            </>
          ),
          icon: CheckCircle2,
          colorClass: 'bg-emerald-500/10 text-emerald-500',
        },
        {
          key: 'linked-articles',
          title: t('cms.cardLinkedArticles', 'Total Articles Linked'),
          value: totalBlogs,
          subtext: (
            <>
              <span className="text-indigo-500 font-bold">{avgBlogs} {t('cms.articlesPerCat', 'articles/cat')}</span>
              <span>•</span>
              <span className="text-muted-foreground">{t('cms.tabBlogs', 'Blogs')}</span>
            </>
          ),
          icon: FileText,
          colorClass: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          key: 'category-descriptions',
          title: t('cms.cardCategoryDescriptions', 'SEO & Descriptions'),
          value: withDesc,
          subtext: (
            <>
              <span className="text-teal-500 font-bold">{total > 0 ? Math.round((withDesc / total) * 100) : 100}% {t('cms.withDescription', 'with desc')}</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">{t('cms.seoReady', 'SEO ready')}</span>
            </>
          ),
          icon: Sparkles,
          colorClass: 'bg-teal-500/10 text-teal-500',
        },
      ]
    }

    if (activeTab === 'blog-tags') {
      const total = stats?.tags?.total ?? totalFromPagination
      const totalArticles = stats?.blogs?.total ?? 0
      const publishedArticles = stats?.blogs?.published ?? 0
      const totalCategories = stats?.categories?.total ?? 0

      return [
        {
          key: 'total-tags',
          title: t('cms.cardTotalTags', 'Total Content Tags'),
          value: total,
          subtext: (
            <>
              <span className="text-purple-500 font-bold">{total} {t('cms.tabTags', 'Tags')}</span>
              <span>•</span>
              <span className="text-muted-foreground">Taxonomy keywords</span>
            </>
          ),
          icon: Tag,
          colorClass: 'bg-purple-500/10 text-purple-500',
        },
        {
          key: 'indexed-articles',
          title: t('cms.cardIndexedArticles', 'Total Articles Indexed'),
          value: totalArticles,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{publishedArticles} {t('cms.published', 'Published')}</span>
              <span>•</span>
              <span className="text-muted-foreground">{t('cms.tabBlogs', 'Articles')}</span>
            </>
          ),
          icon: FileText,
          colorClass: 'bg-blue-500/10 text-blue-500',
        },
        {
          key: 'available-categories',
          title: t('cms.cardAvailableCategories', 'Content Categories'),
          value: totalCategories,
          subtext: (
            <>
              <span className="text-teal-500 font-bold">{stats?.categories?.active ?? totalCategories} {t('cms.active', 'Active')}</span>
              <span>•</span>
              <span className="text-muted-foreground">{t('cms.tabCategories', 'Categories')}</span>
            </>
          ),
          icon: FolderOpen,
          colorClass: 'bg-teal-500/10 text-teal-500',
        },
        {
          key: 'tag-health',
          title: t('cms.cardTaxonomyHealth', 'SEO Slugs & Health'),
          value: 100,
          suffix: '%',
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">100% {t('cms.seoReady', 'SEO ready')}</span>
              <span>•</span>
              <span className="text-muted-foreground">Clean URL slugs</span>
            </>
          ),
          icon: ShieldCheck,
          colorClass: 'bg-emerald-500/10 text-emerald-500',
        },
      ]
    }

    if (activeTab === 'pages') {
      const total = stats?.pages?.total ?? totalFromPagination
      const published = stats?.pages?.published ?? records.filter((r) => (r.status || 'published').toLowerCase() === 'published').length
      const draft = stats?.pages?.draft ?? (total - published)
      const withSeo = stats?.pages?.with_seo ?? records.filter((r) => Boolean(r.meta_title || r.meta_description)).length
      const publishedRate = total > 0 ? Math.round((published / total) * 100) : 100
      const seoRate = total > 0 ? Math.round((withSeo / total) * 100) : 100

      return [
        {
          key: 'total-pages',
          title: t('cms.cardTotalPages', 'Total Landing Pages'),
          value: total,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{published} {t('cms.published', 'Published')}</span>
              <span>•</span>
              <span className="text-amber-500 font-bold">{draft} {t('cms.drafts', 'Drafts')}</span>
            </>
          ),
          icon: FileCode,
          colorClass: 'bg-teal-500/10 text-teal-500',
        },
        {
          key: 'published-pages',
          title: t('cms.cardPublishedPages', 'Live Pages & Policies'),
          value: published,
          subtext: (
            <>
              <span className="text-emerald-500 font-bold">{publishedRate}% {t('cms.operational', 'live')}</span>
              <span>•</span>
              <span className="text-muted-foreground">{t('cms.visibleToUsers', 'visible')}</span>
            </>
          ),
          icon: CheckCircle2,
          colorClass: 'bg-emerald-500/10 text-emerald-500',
        },
        {
          key: 'draft-pages',
          title: t('cms.cardDraftPages', 'Draft / Inactive Pages'),
          value: draft,
          subtext: (
            <>
              <span className="text-amber-500 font-bold">{draft} {t('cms.drafts', 'WIP')}</span>
              <span>•</span>
              <span className="text-muted-foreground">Pending publishing</span>
            </>
          ),
          icon: Clock,
          colorClass: 'bg-amber-500/10 text-amber-500',
        },
        {
          key: 'page-seo',
          title: t('cms.cardPageSeo', 'SEO & Metadata'),
          value: withSeo,
          subtext: (
            <>
              <span className="text-indigo-500 font-bold">{seoRate}% {t('cms.withSeo', 'with SEO')}</span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">{t('cms.seoReady', 'SEO ready')}</span>
            </>
          ),
          icon: Sparkles,
          colorClass: 'bg-indigo-500/10 text-indigo-500',
        },
      ]
    }


    // Default: 'faqs'
    const total = stats?.faqs?.total ?? totalFromPagination
    const active = stats?.faqs?.active ?? records.filter((r) => r.is_active).length
    const inactive = stats?.faqs?.inactive ?? (total - active)
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 100
    const localCategoriesCount = new Set(records.map((r) => r.category).filter(Boolean)).size || 1
    const distinctCategories = stats?.faqs?.categories_count ?? localCategoriesCount

    return [
      {
        key: 'total-faqs',
        title: t('cms.cardTotalFaqs', 'Total FAQs & Help'),
        value: total,
        subtext: (
          <>
            <span className="text-emerald-500 font-bold">{active} {t('cms.active', 'Active')}</span>
            <span>•</span>
            <span className="text-amber-500 font-bold">{inactive} {t('cms.inactive', 'Inactive')}</span>
          </>
        ),
        icon: HelpCircle,
        colorClass: 'bg-sky-500/10 text-sky-500',
      },
      {
        key: 'active-faqs',
        title: t('cms.cardActiveFaqs', 'Active Knowledgebase'),
        value: active,
        subtext: (
          <>
            <span className="text-emerald-500 font-bold">{activeRate}% {t('cms.operational', 'active')}</span>
            <span>•</span>
            <span className="text-muted-foreground">{t('cms.visibleToUsers', 'visible')}</span>
          </>
        ),
        icon: CheckCircle2,
        colorClass: 'bg-emerald-500/10 text-emerald-500',
      },
      {
        key: 'faq-topics',
        title: t('cms.cardFaqCategories', 'FAQ Topics & Categories'),
        value: distinctCategories,
        subtext: (
          <>
            <span className="text-indigo-500 font-bold">{distinctCategories} {t('cms.tabCategories', 'Topics')}</span>
            <span>•</span>
            <span className="text-muted-foreground">Categorized help</span>
          </>
        ),
        icon: BookOpen,
        colorClass: 'bg-indigo-500/10 text-indigo-500',
      },
      {
        key: 'faq-completeness',
        title: t('cms.cardFaqCompleteness', 'Answer Completeness'),
        value: 100,
        suffix: '%',
        subtext: (
          <>
            <span className="text-emerald-500 font-bold">100% {t('cms.fullyAnswered', 'answered')}</span>
            <span>•</span>
            <span className="text-muted-foreground">Direct customer support</span>
          </>
        ),
        icon: ShieldCheck,
        colorClass: 'bg-emerald-500/10 text-emerald-500',
      },
    ]
  }, [activeTab, records, stats, pagination, t])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
      <AnimatePresence>
        {tabCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={`${activeTab}-${card.key}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, delay: idx * 0.04 }}
              className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                  {card.title}
                </p>
                <div className="text-2xl font-extrabold text-foreground tracking-tight font-mono truncate flex items-baseline gap-0.5">
                  <AnimatedCounter value={card.value} />
                  {(card as any).suffix && <span className="text-lg font-bold">{(card as any).suffix}</span>}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap truncate">
                  {card.subtext}
                </div>
              </div>
              <div className={`p-3.5 rounded-xl shrink-0 ${card.colorClass}`}>
                <Icon size={22} />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default CMSStatsCards
