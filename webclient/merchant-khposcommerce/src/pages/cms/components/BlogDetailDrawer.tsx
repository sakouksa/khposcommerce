import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Calendar,
  Tag as TagIcon,
  User,
  Clock,
  Globe,
  Copy,
  Check,
  Edit3,
  Eye,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Hash,
  Share2,
} from 'lucide-react'
import {
  DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  StatusBadge,
  AppImage,
  ActionButton,
} from '@/components/common'
import type { DetailDrawerTabItem } from '@/components/common'
import { useToast } from '@/hooks/useToast'
import { getAbsoluteImageUrl } from '@/utils/image'
import { formatDisplayDate } from '@/utils/formatters'

export interface BlogDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  blog: any | null
  onEdit?: (blog: any) => void
}

export const BlogDetailDrawer: React.FC<BlogDetailDrawerProps> = ({
  isOpen,
  onClose,
  blog,
  onEdit,
}) => {
  const { t, i18n } = useTranslation(['cms', 'common', 'buttons'])
  const navigate = useNavigate()
  const toast = useToast()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content')

  if (!isOpen || !blog) return null

  // Basic Info
  const title = blog.title || ''
  const slug = blog.slug || ''
  const excerpt = blog.excerpt || blog.summary || ''
  const content = blog.content || ''
  const status = (blog.status || 'published').toLowerCase()

  // Taxonomy & Author
  const categoryName =
    blog.blog_category?.name ||
    blog.category?.name ||
    blog.category_name ||
    t('cms.general')
  const authorName =
    blog.author?.name ||
    blog.author_name ||
    blog.user?.name ||
    t('cms.systemAdmin')

  // Cover Image
  const coverImage = blog.featured_image || blog.image || blog.image_url
  const blogIndex = blog?.id ? ((Number(blog.id) - 1) % 10) + 1 : 1
  const dynamicFallback = `/images/blogs/blog-${String(blogIndex).padStart(2, '0')}.jpg`

  // SEO
  const metaTitle = blog.meta_title || title
  const metaDescription = blog.meta_description || excerpt || title

  // Tags Extraction
  const rawTags = blog.tags || blog.blog_tags || []
  const tags: string[] = Array.isArray(rawTags)
    ? rawTags.map((tg: any) => (typeof tg === 'string' ? tg : tg.name || tg.title || '')).filter(Boolean)
    : []

  // Metrics
  const viewsCount = Number(blog.views_count ?? blog.views ?? 0)

  // Dates with bilingual formatting
  const currentLocale = i18n.language === 'km' ? 'km-KH' : 'en-US'
  const createdAtFormatted = blog.created_at
    ? formatDisplayDate(blog.created_at, { locale: currentLocale, includeTime: false, fallback: '-' })
    : null
  const publishedAtFormatted = blog.published_at
    ? formatDisplayDate(blog.published_at, { locale: currentLocale, includeTime: false, fallback: '-' })
    : createdAtFormatted

  // Word count & read time
  const plainText = content.replace(/<[^>]+>/g, ' ').trim()
  const wordCount = plainText ? plainText.split(/\s+/).length : 0
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200))

  // SEO Health Calculations
  const metaTitleLength = metaTitle.length
  const metaDescLength = metaDescription.length
  const isTitleOptimal = metaTitleLength >= 45 && metaTitleLength <= 65
  const isDescOptimal = metaDescLength >= 120 && metaDescLength <= 165

  // Handlers
  const handleCopySlug = () => {
    const fullUrl = `${window.location.origin}/blog/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    toast.success(t('cms.linkCopied', 'បានចម្លងតំណភ្ជាប់ដោយជោគជ័យ!'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenStorefront = () => {
    if (slug) {
      window.open(`/blog/${slug}`, '_blank', 'noopener,noreferrer')
    }
  }

  const handleEdit = () => {
    onClose()
    if (onEdit) {
      onEdit(blog)
    } else {
      navigate(`/cms/blogs/${blog.id}/edit`)
    }
  }

  // Navigation Tabs with dynamic badges
  const tabs: DetailDrawerTabItem[] = [
    {
      key: 'content',
      label: t('cms.articleBodyTab', 'ខ្លឹមសារអត្ថបទ'),
      icon: FileText,
      badge: readingTimeMin ? `${readingTimeMin}m` : undefined,
    },
    {
      key: 'seo',
      label: t('cms.seoPreviewTab', 'SEO & ការមើលជាមុន'),
      icon: Globe,
      badge: isTitleOptimal && isDescOptimal ? '✓' : undefined,
    },
  ]

  return (
    <DetailDrawer
      isOpen={isOpen && !!blog}
      onClose={onClose}
      size="2xl"
    >
      {/* ─── 1. Header (ក្បាលទំព័រ - Global DetailDrawerHeader) ─── */}
      <DetailDrawerHeader
        icon={<FileText size={18} />}
        iconVariant="primary"
        title={title || t('cms.blogDetail', 'ព័ត៌មានលម្អិតអំពីអត្ថបទ')}
        subtitle={slug ? `${window.location.origin}/blog/${slug}` : undefined}
        badge={
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={status} />
            <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-mono font-semibold border border-border/60">
              ART-#{String(blog.id).padStart(4, '0')}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-1.5">
            {slug && (
              <ActionButton
                variant="outline"
                size="sm"
                icon={<ExternalLink size={13} />}
                label={t('cms.openStorefront', 'មើលផ្ទាល់')}
                onClick={handleOpenStorefront}
                className="hidden sm:inline-flex"
                title={t('cms.openStorefront', 'បើកមើលលើគេហទំព័រ')}
              />
            )}
            <ActionButton
              variant="outline"
              size="sm"
              icon={copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              label={copied ? t('cms.copied', 'បានចម្លង!') : t('cms.copyLink', 'ចម្លង Link')}
              onClick={handleCopySlug}
              title={t('cms.copyLink', 'ចម្លងតំណភ្ជាប់')}
            />
          </div>
        }
        onClose={onClose}
      />

      {/* ─── 2. Tab Navigation (ផ្ទាំងប្តូរមាតិកា) ─── */}
      <DetailDrawerTabNav
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabKey) => setActiveTab(tabKey)}
      />

      {/* ─── 3. Scrollable Body (ខ្លឹមសារខាងក្នុង) ─── */}
      <DetailDrawerBody>
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Cover Hero Banner */}
            <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-border/80 bg-muted/60 shadow-xs group">
              <AppImage
                src={coverImage ? getAbsoluteImageUrl(coverImage) : undefined}
                alt={title}
                fallbackType="general"
                fallbackSrc={dynamicFallback}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                preview={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white pointer-events-none">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
                    <TagIcon size={12} />
                    <span>{categoryName}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
                    <Clock size={11} />
                    <span>
                      {t('cms.readingTimeMin', {
                        min: readingTimeMin,
                      })}
                    </span>
                  </span>
                  {viewsCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-md text-white/90 border border-white/10">
                      <Eye size={11} />
                      <span>{viewsCount.toLocaleString()} {t('cms.views', 'ការចូលមើល')}</span>
                    </span>
                  )}
                </div>
                <h1 className="text-lg sm:text-2xl font-extrabold text-white leading-tight drop-shadow-md">
                  {title}
                </h1>
              </div>
            </div>

            {/* Overview & Metadata Card */}
            <DetailDrawerCard
              title={t('cms.articleOverview', 'ទិដ្ឋភាពទូទៅ & ទិន្នន័យអត្ថបទ')}
              icon={<Sparkles size={15} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Author */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t('cms.author', 'អ្នកនិពន្ធ')}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {authorName}
                    </p>
                  </div>
                </div>

                {/* Published Date */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t('cms.publishedOn', 'បានផ្សព្វផ្សាយនៅ')}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {publishedAtFormatted || '-'}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <TagIcon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t('cms.category', 'ប្រភេទ')}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {categoryName}
                    </p>
                  </div>
                </div>

                {/* Views Engagement */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Eye size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t('cms.cardTotalViews', 'ការចូលមើលសរុប')}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {viewsCount.toLocaleString()} {t('cms.views', 'ដង')}
                    </p>
                  </div>
                </div>

                {/* Reading Time & Words */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t('cms.readingTime', 'រយៈពេលអាន')}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                      {t('cms.readingTimeMin', { min: readingTimeMin })} ({t('cms.wordCountUnit', { count: wordCount })})
                    </p>
                  </div>
                </div>

                {/* Slug URL with Global Copy ActionButton */}
                <div className="p-3 rounded-xl bg-card border border-border/70 flex items-center justify-between gap-2 group">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {t('cms.slugUrl', 'តំណភ្ជាប់ Slug')}
                    </p>
                    <p className="text-xs sm:text-sm font-bold font-mono text-foreground truncate" title={`/${slug}`}>
                      /{slug}
                    </p>
                  </div>
                  <ActionButton
                    variant="outline"
                    size="sm"
                    icon={copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    label={copied ? t('cms.copied', 'បានចម្លង') : t('cms.copyLink', 'ចម្លង')}
                    onClick={handleCopySlug}
                  />
                </div>
              </div>

              {/* Tags Section if available */}
              {tags.length > 0 && (
                <div className="pt-3 border-t border-border/50 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
                    <Hash size={13} />
                    <span>{t('cms.articleTags', 'ស្លាកមាតិកា')}:</span>
                  </span>
                  {tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground border border-border/60 hover:bg-muted/80 transition-colors"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}
            </DetailDrawerCard>

            {/* Excerpt / Lead Summary Callout */}
            {excerpt && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 text-foreground text-sm font-medium leading-relaxed shadow-2xs">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>{t('cms.articleExcerpt', 'សង្ខេបអត្ថបទ')}</span>
                </p>
                <blockquote className="italic text-foreground/90 leading-relaxed font-serif">
                  "{excerpt}"
                </blockquote>
              </div>
            )}

            {/* Full Article Rich Body */}
            <DetailDrawerCard
              title={t('cms.articleBody', 'ខ្លឹមសារអត្ថបទពេញលេញ')}
              icon={<FileText size={15} />}
              badge={
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                  {t('cms.wordCountUnit', { count: wordCount })}
                </span>
              }
              bodyClassName="pt-2"
            >
              {content ? (
                <div
                  className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:underline prose-img:rounded-2xl prose-img:border prose-img:border-border/60 prose-img:shadow-xs leading-relaxed text-foreground"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <FileText size={36} className="mx-auto mb-2 opacity-40" />
                  <p className="font-medium">
                    {t('cms.noContent', 'មិនទាន់មានមាតិកានៅឡើយទេ។')}
                  </p>
                </div>
              )}
            </DetailDrawerCard>
          </div>
        )}

        {/* ─── Tab 2: SEO & SERP Simulator ─── */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* Google SERP Simulator Card */}
            <DetailDrawerCard
              title={t('cms.googlePreview', 'ទម្រង់បង្ហាញលើ Google Search')}
              icon={<Globe size={15} />}
              badge={
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {t('cms.serpSimulator', 'គំរូ SERP Simulator')}
                </span>
              }
            >
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-xs font-sans space-y-1.5 transition-colors">
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-mono truncate">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Globe size={11} />
                  </div>
                  <span className="truncate">
                    {window.location.host} &gt; blog &gt; {slug}
                  </span>
                </div>
                <h3
                  onClick={handleOpenStorefront}
                  className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-1"
                >
                  {metaTitle}
                </h3>
                <p className="text-xs sm:text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-normal">
                  {metaDescription}
                </p>
              </div>
            </DetailDrawerCard>

            {/* SEO Health & Quality Diagnostics */}
            <DetailDrawerCard
              title={t('cms.seoQuality', 'គុណភាព & សុខភាព SEO')}
              icon={<ShieldCheck size={15} />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Meta Title Diagnostic */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t('cms.metaTitle', 'ចំណងជើង Meta Title')}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isTitleOptimal
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : metaTitleLength < 45
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isTitleOptimal ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <AlertCircle size={11} />
                      )}
                      <span>
                        {isTitleOptimal
                          ? t('cms.optimal', 'ល្អប្រសើរ')
                          : metaTitleLength < 45
                          ? t('cms.tooShort', 'ខ្លីពេក')
                          : t('cms.tooLong', 'វែងពេក')}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground break-words line-clamp-3">
                    {metaTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                    {t('cms.recommendedCharRange', {
                      count: metaTitleLength,
                      range: '50-60',
                    })}
                  </p>
                </div>

                {/* Meta Description Diagnostic */}
                <div className="p-4 rounded-xl bg-card border border-border/70 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t('cms.metaDescription', 'SEO Meta Description')}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isDescOptimal
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : metaDescLength < 120
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isDescOptimal ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <AlertCircle size={11} />
                      )}
                      <span>
                        {isDescOptimal
                          ? t('cms.optimal', 'ល្អប្រសើរ')
                          : metaDescLength < 120
                          ? t('cms.tooShort', 'ខ្លីពេក')
                          : t('cms.tooLong', 'វែងពេក')}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground break-words line-clamp-3">
                    {metaDescription}
                  </p>
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                    {t('cms.recommendedCharRange', {
                      count: metaDescLength,
                      range: '120-160',
                    })}
                  </p>
                </div>
              </div>

              {/* Public Canonical URL */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    {t('cms.publicUrl', 'តំណភ្ជាប់អត្ថបទសាធារណៈ')}
                  </p>
                  <p className="text-xs font-mono font-bold text-foreground truncate mt-0.5">
                    {window.location.origin}/blog/{slug}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ActionButton
                    size="sm"
                    variant="outline"
                    icon={<ExternalLink size={13} />}
                    label={t('cms.openStorefront', 'មើលផ្ទាល់')}
                    onClick={handleOpenStorefront}
                  />
                  <ActionButton
                    size="sm"
                    variant="outline"
                    icon={copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    label={copied ? t('cms.copied', 'បានចម្លង') : t('cms.copyLink', 'ចម្លងតំណភ្ជាប់')}
                    onClick={handleCopySlug}
                  />
                </div>
              </div>
            </DetailDrawerCard>
          </div>
        )}
      </DetailDrawerBody>

      {/* ─── 4. Action Footer (បាតទំព័រ - Global ActionButton) ─── */}
      <DetailDrawerFooter
        leftActions={
          <ActionButton
            variant="outline"
            size="md"
            label={t('common.close', 'បិទ')}
            onClick={onClose}
          />
        }
        rightActions={
          <div className="flex items-center gap-2">
            {slug && (
              <ActionButton
                variant="outline"
                size="md"
                icon={<ExternalLink size={14} />}
                label={t('cms.openStorefront', 'មើលលើវេបសាយ')}
                onClick={handleOpenStorefront}
              />
            )}
            <ActionButton
              variant="primary"
              size="md"
              icon={<Edit3 size={15} strokeWidth={2.5} />}
              label={t('cms.editArticle', 'កែសម្រួលអត្ថបទ')}
              onClick={handleEdit}
            />
          </div>
        }
      />
    </DetailDrawer>
  )
}

export default BlogDetailDrawer
