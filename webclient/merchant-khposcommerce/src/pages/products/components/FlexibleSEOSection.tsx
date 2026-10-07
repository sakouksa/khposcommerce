import React, { useState, useMemo } from 'react'
import {
  Globe,
  Search,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Link as LinkIcon,
  Eye,
  Save,
  Loader2,
  Wand2,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Monitor,
  ShieldCheck,
  X,
  Plus,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface FlexibleSEOSectionProps {
  productName: string
  productSlug?: string
  metaTitle: string
  metaKeywords: string
  metaDescription: string
  productImage?: string
  categoryName?: string
  brandName?: string
  shortDescription?: string
  onMetaTitleChange: (val: string) => void
  onMetaKeywordsChange: (val: string) => void
  onMetaDescriptionChange: (val: string) => void
  onSlugChange?: (val: string) => void
  onSave?: () => void
  isSaving?: boolean
}

export const FlexibleSEOSection: React.FC<FlexibleSEOSectionProps> = ({
  productName,
  productSlug = '',
  metaTitle,
  metaKeywords,
  metaDescription,
  productImage,
  categoryName,
  brandName,
  shortDescription,
  onMetaTitleChange,
  onMetaKeywordsChange,
  onMetaDescriptionChange,
  onSlugChange,
  onSave,
  isSaving = false,
}) => {
  const { t } = useTranslation(['products', 'common'])

  // Local States
  const [previewTab, setPreviewTab] = useState<'serp' | 'social'>('serp')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [allowIndexing, setAllowIndexing] = useState(true)
  const [includeSitemap, setIncludeSitemap] = useState(true)
  const [keywordInput, setKeywordInput] = useState('')

  // Derived Title & Description for Preview
  const displayTitle = metaTitle || productName || 'Product Title'
  const displayDesc =
    metaDescription ||
    shortDescription ||
    `Buy official ${productName || 'product'} with fast delivery, authentic enterprise specifications, and store warranty.`
  
  // Format Slug
  const formattedSlug = useMemo(() => {
    if (productSlug) return productSlug
    return (productName || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }, [productSlug, productName])

  const canonicalUrl = `https://yourstore.com/products/${formattedSlug || 'product-slug'}`

  // Parse Keywords to Array
  const keywordTags = useMemo(() => {
    if (!metaKeywords) return []
    return metaKeywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
  }, [metaKeywords])

  // SEO Health Audit Calculation
  const seoAudit = useMemo(() => {
    let score = 0
    const titleLen = (metaTitle || productName || '').length
    const descLen = (metaDescription || '').length

    // Title Score (Max 30)
    if (titleLen >= 30 && titleLen <= 60) score += 30
    else if (titleLen > 0) score += 15

    // Description Score (Max 35)
    if (descLen >= 70 && descLen <= 160) score += 35
    else if (descLen > 0) score += 20

    // Keywords Score (Max 20)
    if (keywordTags.length >= 3) score += 20
    else if (keywordTags.length > 0) score += 10

    // Slug Score (Max 15)
    if (formattedSlug) score += 15

    return Math.min(100, score)
  }, [metaTitle, productName, metaDescription, keywordTags, formattedSlug])

  // Helpers
  const handleAutoGenerateTitle = () => {
    const generated = `${productName || 'Product'} | Enterprise POS Store`
    onMetaTitleChange(generated)
  }

  const handleAutoSlug = () => {
    if (!onSlugChange) return
    const slug = (productName || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    onSlugChange(slug)
  }

  const handleAutoSummarizeDesc = () => {
    const summary = shortDescription
      ? `${shortDescription} Buy online with fast delivery, authentic warranty, and enterprise POS reliability.`
      : `Official ${productName || 'product'} catalog specifications. High performance, verified enterprise quality, and warranty guaranteed.`
    onMetaDescriptionChange(summary.substring(0, 160))
  }

  const handleAddKeywordTag = (tagText: string) => {
    const trimmed = tagText.trim().toLowerCase()
    if (!trimmed) return
    if (!keywordTags.includes(trimmed)) {
      const updated = [...keywordTags, trimmed].join(', ')
      onMetaKeywordsChange(updated)
    }
    setKeywordInput('')
  }

  const handleRemoveKeywordTag = (tagToRemove: string) => {
    const updated = keywordTags.filter((k) => k !== tagToRemove).join(', ')
    onMetaKeywordsChange(updated)
  }

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddKeywordTag(keywordInput)
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(canonicalUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 1500)
  }

  // Recommended keywords based on product properties
  const suggestedTags = useMemo(() => {
    const suggestions: string[] = []
    if (categoryName && !keywordTags.includes(categoryName.toLowerCase())) {
      suggestions.push(categoryName.toLowerCase())
    }
    if (brandName && !keywordTags.includes(brandName.toLowerCase())) {
      suggestions.push(brandName.toLowerCase())
    }
    const defaults = ['tech', 'enterprise', 'pos', 'store']
    defaults.forEach((d) => {
      if (!keywordTags.includes(d) && suggestions.length < 5) suggestions.push(d)
    })
    return suggestions
  }, [categoryName, brandName, keywordTags])

  return (
    <div className="space-y-6">
      {/* ─── 1. SEO HEALTH & QUALITY AUDIT DASHBOARD ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Overall Score */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('products.seoHealthAudit', 'SEO Quality Score')}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                  seoAudit >= 80
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : seoAudit >= 50
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                }`}
              >
                <ShieldCheck size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-black font-mono tracking-tight ${
                  seoAudit >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : seoAudit >= 50
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {seoAudit}/100
              </span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                seoAudit >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {seoAudit >= 80 ? (
                <>
                  <CheckCircle2 size={11} /> {t('products.seoScoreOptimal', 'Optimal SEO')}
                </>
              ) : (
                <>
                  <AlertTriangle size={11} /> {t('products.seoScoreNeedsWork', 'Needs Improvement')}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Metric 2: Meta Title Health */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('products.metaTitleHealth', 'Meta Title Length')}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                <Search size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-foreground">
                {metaTitle.length}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                / 60 {t('products.charsCount', 'chars')}
              </span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            <span className="text-[10px] font-semibold text-muted-foreground">
              {metaTitle.length >= 30 && metaTitle.length <= 60 ? '✓ ' + t('products.optimal', 'Optimal') : t('products.optimalRange', '30-60 range')}
            </span>
          </div>
        </div>

        {/* Metric 3: Meta Description Health */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('products.metaDescHealth', 'Description Length')}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                <Globe size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black font-mono text-foreground">
                {metaDescription.length}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                / 160 {t('products.charsCount', 'chars')}
              </span>
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            <span className="text-[10px] font-semibold text-muted-foreground">
              {metaDescription.length >= 70 && metaDescription.length <= 160 ? '✓ ' + t('products.optimal', 'Optimal') : t('products.optimalRange', '70-160 range')}
            </span>
          </div>
        </div>

        {/* Metric 4: Canonical URL Slug */}
        <div className="bg-card p-4 rounded-2xl border border-border shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {t('products.canonicalUrlLabel', 'URL Slug')}
              </span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                <LinkIcon size={15} />
              </div>
            </div>
            <div className="truncate text-xs font-mono font-bold text-foreground">
              /{formattedSlug || 'slug'}
            </div>
          </div>
          <div className="pt-2 mt-2 border-t border-border/40">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1 text-primary text-[10px] font-bold hover:underline cursor-pointer"
            >
              {copiedUrl ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              <span>{copiedUrl ? t('products.copiedLink', 'Copied') : t('products.copyFullUrl', 'Copy Full URL')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. LIVE INTERACTIVE GOOGLE SEARCH SERP & SOCIAL PREVIEW CARD ─── */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground">
              {t('products.serpPreviewTitle', 'Google Search SERP Preview')}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('products.googleSearchNotice', 'This is how your product listing will appear in Google search results.')}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* SERP vs Social Card Toggle */}
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setPreviewTab('serp')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'serp'
                    ? 'bg-card text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Search size={13} />
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('social')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  previewTab === 'social'
                    ? 'bg-card text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Share2 size={13} />
                <span>{t('products.socialCard', 'Social Card')}</span>
              </button>
            </div>

            {/* Desktop vs Mobile Toggle */}
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-card text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Monitor size={14} className="inline mr-1" /> {t('products.desktop', 'Desktop')}
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-card text-primary shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone size={14} className="inline mr-1" /> {t('products.mobile', 'Mobile')}
              </button>
            </div>
          </div>
        </div>

        {/* Live Card Render Container */}
        {previewTab === 'serp' ? (
          <div
            className={`mx-auto p-5 rounded-2xl border border-border bg-muted/20 transition-all ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'w-full'
            }`}
          >
            <div className="space-y-1.5">
              {/* Domain & Favicon Header */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0 text-primary border border-primary/20">
                  <Search size={12} />
                </div>
                <div className="truncate">
                  <div className="font-semibold text-foreground leading-none text-[12px]">
                    Enterprise Store
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                    {canonicalUrl}
                  </div>
                </div>
              </div>

              {/* Blue SERP Title */}
              <h4 className="text-base sm:text-lg font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug truncate">
                {displayTitle}
              </h4>

              {/* Snippet Description */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-normal">
                {displayDesc}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`mx-auto rounded-2xl border border-border bg-card overflow-hidden shadow-xs transition-all ${
              previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-md'
            }`}
          >
            <div className="h-40 bg-muted/40 relative flex items-center justify-center overflow-hidden">
              {productImage ? (
                <img src={productImage} alt="Social OG Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Globe size={32} className="mx-auto text-muted-foreground/40 mb-1" />
                  <span className="text-xs text-muted-foreground font-semibold">{t('products.socialThumbnail', 'Social Share Thumbnail')}</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-1 bg-muted/20">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                YOURSTORE.COM
              </span>
              <h4 className="text-sm font-bold text-foreground truncate">
                {displayTitle}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {displayDesc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. FORM INPUTS & SMART HELPERS ─── */}
      <div className="bg-card p-5 rounded-xl border border-border/80 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Meta Title Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('products.metaTitleField', 'SEO Meta Title')}
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateTitle}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Wand2 size={11} />
                {t('products.autoGenerate', 'Auto Generate')}
              </button>
            </div>
            <input
              type="text"
              value={metaTitle ?? ''}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              placeholder={t('products.metaTitlePlaceholder', 'SEO Search Engine Title...')}
              className="w-full h-9 px-3 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
            />
          </div>

          {/* Meta Slug Field (Clean Addon Prefix Group - No Collision) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('products.urlSlugLabel', 'Product URL Slug (Permalink)')}
              </label>
              {onSlugChange && (
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <RefreshCw size={11} />
                  {t('products.autoGenerate', 'Auto Generate')}
                </button>
              )}
            </div>
            <div className="flex items-center rounded-lg border border-border/80 bg-background overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="px-2.5 py-1.5 bg-muted/60 border-r border-border font-mono text-xs font-semibold text-muted-foreground select-none shrink-0">
                /products/
              </span>
              <input
                type="text"
                value={formattedSlug ?? ''}
                onChange={(e) => onSlugChange && onSlugChange(e.target.value)}
                placeholder="product-url-slug"
                className="w-full h-9 px-3 bg-transparent text-xs sm:text-[13px] font-mono font-medium text-foreground focus:outline-none placeholder:text-muted-foreground disabled:opacity-60"
              />
            </div>
          </div>

          {/* Meta Keywords Pill Tag Manager */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-foreground/90">
              {t('products.colKeywords', 'SEO Keywords & Search Tags')}
            </label>

            {keywordTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1.5 p-2 bg-muted/30 rounded-lg border border-border/60">
                {keywordTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-medium font-sans"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeywordTag(tag)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative flex items-center">
              <input
                type="text"
                value={keywordInput ?? ''}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
                placeholder={t('products.addKeywordPlaceholder', 'Type keyword and press Enter or comma...')}
                className="w-full h-9 px-3 pr-9 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => handleAddKeywordTag(keywordInput)}
                className="absolute right-1.5 p-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Quick Tag Ideas */}
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-bold text-muted-foreground mr-1">
                  {t('products.suggestedTags', 'Quick Tag Suggestions:')}
                </span>
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddKeywordTag(tag)}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:text-primary border border-border/60 text-[11px] font-medium transition-all cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Meta Description Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-foreground/90">
                {t('products.colMetaDesc', 'Search Engine Meta Description')}
              </label>
              <button
                type="button"
                onClick={handleAutoSummarizeDesc}
                className="text-[11px] font-medium text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Sparkles size={11} />
                {t('products.autoSummarize', 'Auto Summarize')}
              </button>
            </div>
            <textarea
              rows={2}
              value={metaDescription ?? ''}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder={t('products.metaDescPlaceholder', 'Brief 150-character summary for Google search snippet...')}
              className="w-full p-2.5 bg-background border border-border/80 rounded-lg text-xs sm:text-[13px] text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Indexing Preferences */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allowIndexing}
              onChange={(e) => setAllowIndexing(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
            />
            <span className="text-xs font-semibold text-foreground">
              {t('products.allowSearchIndexing', 'Allow Search Engine Indexing (index, follow)')}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSitemap}
              onChange={(e) => setIncludeSitemap(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
            />
            <span className="text-xs font-bold text-foreground">
              {t('products.includeSitemap', 'Include Product Page in XML Sitemap')}
            </span>
          </label>
        </div>
      </div>

      {/* ─── 4. BOTTOM ACTION BAR ─── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span>{t('products.saveSeoDetails', 'Save SEO Details')}</span>
        </button>
      </div>
    </div>
  )
}

export default FlexibleSEOSection
