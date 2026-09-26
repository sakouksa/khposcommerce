import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2, Send, ExternalLink, FileText } from 'lucide-react'
import { cmsService } from '@/services/cmsService'
import { useToast } from '@/hooks/useToast'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  FormField,
  getFieldClass,
  FileUpload,
  LoadingSpinner,
  RichTextEditor,
  EnterpriseDateTimePicker,
} from '@/components/common'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import { getAbsoluteImageUrl } from '@/utils/image'
import { generateSlug } from '@/utils/slug'
import { focusFirstInvalidField } from '@/utils/formValidation'

export const BlogFormPage: React.FC = () => {
  const { t, i18n } = useTranslation(['cms', 'common', 'nav'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const blogId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  // Form states
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('published')
  const [publishedAt, setPublishedAt] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleClearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Fetch blog detail if in edit mode
  const {
    data: blogDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['blog-detail', blogId],
    queryFn: () => (blogId ? cmsService.getBlog(blogId) : null),
    enabled: isEdit && !isNaN(blogId as number),
  })

  // Fetch categories dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories-dropdown'],
    queryFn: () => cmsService.getCategories({ per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (blogDetail) {
      setTitle(blogDetail.title || '')
      setSlug(blogDetail.slug || '')
      setCategoryId(blogDetail.blog_category_id?.toString() || blogDetail.category_id?.toString() || '')
      setExcerpt(blogDetail.excerpt || '')
      setContent(blogDetail.content || '')
      setStatus(blogDetail.status || 'published')
      setPublishedAt(blogDetail.published_at ? blogDetail.published_at.substring(0, 16) : '')
      setMetaTitle(blogDetail.meta_title || '')
      setMetaDescription(blogDetail.meta_description || '')
      const img = blogDetail.featured_image || blogDetail.image || blogDetail.image_url
      setFeaturedImage(img ? getAbsoluteImageUrl(img) : '')
    }
  }, [blogDetail])

  // Word count & read time calculation
  const stats = useMemo(() => {
    const text = (content || '').replace(/<[^>]*>/g, ' ').trim()
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0
    const readTimeMin = Math.max(1, Math.ceil(words / 180))
    return { words, readTimeMin }
  }, [content])

  // Create & Update mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => cmsService.createBlog(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      toast.success(t('cms.createdSuccess', 'Content created successfully.'))
      navigate('/cms?tab=blogs')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('cms.createFailed', 'Failed to create article.'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => cmsService.updateBlog(blogId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      qc.invalidateQueries({ queryKey: ['blog-detail', blogId] })
      toast.success(t('cms.updatedSuccess', 'Content updated successfully.'))
      navigate('/cms?tab=blogs')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('cms.updateFailed', 'Failed to update article.'))
    },
  })

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const handleTelegramBroadcast = async () => {
    if (!title.trim()) {
      const newErrors = { title: t('cms.titleRequired', 'Please enter article title first') }
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }
    setIsBroadcasting(true)
    try {
      const storefrontOrigin =
        window.location.port === '5174'
          ? `${window.location.protocol}//${window.location.hostname}:5173`
          : window.location.origin
      const articleLink = `${storefrontOrigin}/blog/${slug || generateSlug(title)}`

      const categoryName = categories.find((c: any) => c.id?.toString() === categoryId?.toString())?.name || ''
      const activeLocale = (i18n.language || 'en').startsWith('km') ? 'km' : 'en'
      const readTimeFormatted = activeLocale === 'km' ? `~${stats.readTimeMin} នាទី` : `~${stats.readTimeMin} min read`

      const res = await cmsService.broadcastToTelegram({
        title: title.trim(),
        message: excerpt.trim() || title.trim(),
        category: categoryName || undefined,
        read_time: readTimeFormatted,
        link: articleLink,
        image_url: featuredImage || undefined,
        channel_id: '@nextech_cambodia',
        locale: activeLocale,
      })
      if (res?.data?.is_configured === false) {
        toast.warning(t('cms.telegramNotConfigured', 'Simulated: Please add TELEGRAM_BOT_TOKEN in backend .env to send live to @nextech_cambodia'))
      } else {
        toast.success(t('cms.telegramBroadcastSuccess', 'Article broadcasted to Telegram Channel (@nextech_cambodia) successfully!'))
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || t('cms.telegramBroadcastFailed', 'Failed to broadcast to Telegram.')
      toast.error(errMsg)
    } finally {
      setIsBroadcasting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      const newErrors = { title: t('cms.titleRequired', 'Please enter article title first') }
      setErrors(newErrors)
      focusFirstInvalidField(newErrors)
      return
    }

    const payload: any = {
      company_id: 1,
      blog_category_id: categoryId ? Number(categoryId) : null,
      title: title.trim(),
      slug: slug.trim() || generateSlug(title),
      excerpt: excerpt.trim(),
      summary: excerpt.trim(),
      content: content.trim(),
      status,
      published_at: publishedAt || null,
      meta_title: metaTitle.trim(),
      meta_description: metaDescription.trim(),
    }

    if (imageFile) {
      payload.featured_image = featuredImage
    } else if (featuredImage) {
      payload.featured_image = featuredImage
    } else if (isEdit && blogDetail?.featured_image) {
      payload.featured_image = blogDetail.featured_image
    }

    if (isEdit && blogId) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <LoadingSpinner />
        <p className="text-xs text-muted-foreground mt-3">{t('common.loading', 'Loading data...')}</p>
      </div>
    )
  }

  if (isEdit && isErrorDetail) {
    return (
      <div className="p-6">
        <CustomErrorMessage
          title={t('common.errorLoading', 'Failed to load article data')}
          message={(detailError as any)?.message || t('common.error', 'An error occurred')}
          onRetry={refetchDetail}
        />
      </div>
    )
  }

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isSubmitting={isSubmitting}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? t('cms.editBlogTitle', 'Edit Article: {{title}}', { title: title || '' })
              : t('cms.addBlog', 'Add New Article')
          }
          subtitle={t('cms.formBlogSubtitle', 'Fill in article details, content, cover image, and SEO settings')}
          breadcrumbs={[
            { label: t('cms.contentManagement', 'Content Management'), href: '/cms?tab=blogs' },
            {
              label: isEdit ? t('cms.editBlog', 'Edit Article') : t('cms.addBlog', 'Add New Article'),
            },
          ]}
          backPath="/cms?tab=blogs"
          backLabel={t('common.back', 'Back')}
          showSubmit={false}
        />
      }
      footer={
        <FormFooter
          cancelPath="/cms?tab=blogs"
          cancelLabel={t('common.cancel', 'Cancel')}
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          submitLabel={
            isEdit
              ? t('cms.saveChanges', 'Save Changes')
              : t('cms.saveContent', 'Save Article')
          }
          onCancel={() => navigate('/cms?tab=blogs')}
        />
      }
    >
      <FormContent maxWidth="full" layout="two-column">
        {/* LEFT COLUMN (8 cols): Main Body & Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Basic Info */}
          <FormCard
            title={t('cms.sectionBasicInfo', 'General Info & Title')}
            subtitle={t('cms.basicInfoHelp', 'Enter primary title and article slug URL')}
            badge={
              <span className="text-xs text-muted-foreground font-medium bg-muted/60 dark:bg-slate-800/60 px-2.5 py-0.5 rounded-full border border-border/50">
                ~{stats.readTimeMin} min read • {stats.words} words
              </span>
            }
            contentClassName="space-y-4"
          >
            <FormField
              label={t('cms.formArticleHeadline', 'Article Headline')}
              required
              error={errors.title}
            >
              <input
                id="title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  handleClearError('title')
                  if (!slug || slug === generateSlug(title)) {
                    setSlug(generateSlug(e.target.value))
                  }
                }}
                placeholder={t('cms.formArticleHeadlinePlaceholder', 'e.g. Top 10 Tips for Modern Retail Management')}
                className={getFieldClass(errors.title)}
              />
            </FormField>

            <FormField label={t('cms.colSlug', 'Slug URL')}>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs select-none">
                  /blogs/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="top-10-tips-retail-management"
                  className={`${getFieldClass()} pl-16 font-mono text-xs`}
                />
              </div>
            </FormField>
          </FormCard>

          {/* 2. Article Body & Rich Editor */}
          <FormCard
            title={t('cms.sectionContent', 'Body & Content')}
            subtitle={t('cms.contentHelp', 'Summary excerpt and full rich text')}
            contentClassName="space-y-4"
          >
            <FormField label={t('cms.formExcerpt', 'Excerpt Summary')}>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder={t('cms.formExcerptPlaceholder', 'Brief summary for display cards and search results...')}
                rows={2}
                className={`${getFieldClass()} h-auto py-2.5 resize-none`}
              />
            </FormField>

            <FormField label={t('cms.formFullContent', 'Full Article Body')}>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder={t('cms.formFullContentPlaceholder', 'Write your complete article content here...')}
                articleTitle={title}
                featuredImage={featuredImage}
                minHeight="380px"
              />
            </FormField>
          </FormCard>

          {/* 3. SEO Settings & SERP Preview */}
          <FormCard
            title={t('cms.sectionSeoPublish', 'SEO & Search Engine Preview')}
            subtitle={t('cms.seoHelp', 'Optimize search engine discovery and social card appearance')}
            contentClassName="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('cms.formSeoTitle', 'SEO Meta Title')}>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || 'Meta title for Google search...'}
                  className={getFieldClass()}
                />
              </FormField>

              <FormField label={t('cms.metaDescription', 'SEO Meta Description')}>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={excerpt || 'Brief description for search snippet...'}
                  className={getFieldClass()}
                />
              </FormField>
            </div>

            {/* Clean Google SERP Snippet Preview Card */}
            <div className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Google Search Result Snippet
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-mono">
                  https://optapos.io › blogs › {slug || 'article-slug'}
                </p>
                <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1 mt-0.5">
                  {metaTitle || title || 'OptaPOS Article Headline'}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {metaDescription || excerpt || 'Detailed description of the article will appear here in Google search engine snippets...'}
                </p>
              </div>
            </div>
          </FormCard>
        </div>

        {/* RIGHT COLUMN (4 cols): Sidebar & Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* 4. Publication Settings */}
          <FormCard
            title={t('cms.publicationSettings', 'Publication Settings')}
            contentClassName="space-y-4"
          >
            <FormField label={t('cms.colStatus', 'Publishing Status')}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={getFieldClass()}
              >
                <option value="published">{t('cms.publishedLive', 'Published (Live)')}</option>
                <option value="draft">{t('cms.draftWip', 'Draft (WIP)')}</option>
                <option value="scheduled">{t('cms.scheduled', 'Scheduled Publishing')}</option>
                <option value="archived">{t('cms.archivedHidden', 'Archived')}</option>
              </select>
            </FormField>

            <FormField label={t('cms.schedulePublish', 'Publish Date & Time')}>
              <EnterpriseDateTimePicker
                value={publishedAt}
                onChange={(val) => setPublishedAt(val)}
                placeholder={t('cms.schedulePublish', 'Publish Date & Time')}
              />
            </FormField>

            <FormField label={t('cms.colCategory', 'Category')}>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={getFieldClass()}
              >
                <option value="">{t('cms.generalUncategorized', 'General / Uncategorized')}</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
          </FormCard>

          {/* 5. Featured Cover Photo */}
          <FormCard
            title={t('cms.formCoverImage', 'Cover Image')}
            subtitle={t('cms.formUploadHint', 'PNG, JPG, WebP up to 5MB')}
            contentClassName="space-y-4"
          >
            <FileUpload
              value={featuredImage}
              onChange={(val, file) => {
                setFeaturedImage(val || '')
                setImageFile(file || null)
              }}
              accept="image/*"
              allowPdf={false}
              aspectRatio="video"
            />
          </FormCard>

          {/* 6. Telegram Channel Broadcast */}
          <FormCard
            title={t('cms.telegramBroadcast', 'Telegram Broadcast')}
            subtitle={t('cms.telegramBroadcastDesc', 'Send new post instant notification to your subscribers')}
            contentClassName="space-y-3.5"
          >
            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 text-xs space-y-2">
              <div className="flex items-center justify-between text-sky-800 dark:text-sky-200 font-medium">
                <span className="flex items-center gap-1.5 font-semibold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  NexTech Official Channel
                </span>
                <a
                  href="https://t.me/nextech_cambodia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 inline-flex font-mono"
                >
                  <span>@nextech_cambodia</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t('cms.telegramAutoFeedHint', 'Instant alert with rich banner, teaser, and direct link to the storefront article.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTelegramBroadcast}
              disabled={isBroadcasting}
              className="w-full py-2.5 px-3 rounded-xl border border-sky-500/30 text-white bg-sky-600 hover:bg-sky-500 active:scale-[0.98] text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-sky-500/20"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>{t('common.sending', 'Broadcasting to Telegram...')}</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>{t('cms.broadcastNow', 'Broadcast to Channel')}</span>
                </>
              )}
            </button>
          </FormCard>
        </div>
      </FormContent>
    </FormLayout>
  )
}

export default BlogFormPage
