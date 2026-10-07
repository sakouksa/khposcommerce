import React from 'react'
import FormDrawer from '@/components/common/FormDrawer'
import { Image, X, Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Tab } from '../types/cms.types'

interface CMSFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  activeTab: Tab
  getAddButtonLabel: () => string
  title: string
  setTitle: (val: string) => void
  name: string
  setName: (val: string) => void
  slug: string
  setSlug: (val: string) => void
  content: string
  setContent: (val: string) => void
  excerpt: string
  setExcerpt: (val: string) => void
  status: string
  setStatus: (val: string) => void
  description: string
  setDescription: (val: string) => void
  question: string
  setQuestion: (val: string) => void
  answer: string
  setAnswer: (val: string) => void
  faqCategory: string
  setFaqCategory: (val: string) => void
  sortOrder: string
  setSortOrder: (val: string) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
  categoryId: string
  setCategoryId: (val: string) => void
  metaTitle: string
  setMetaTitle: (val: string) => void
  metaDescription: string
  setMetaDescription: (val: string) => void
  featuredImage: string
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleRemoveImage: () => void
  categoriesList: any[]
}

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const CMSFormDrawer: React.FC<CMSFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isSubmitting,
  activeTab,
  getAddButtonLabel,
  title,
  setTitle,
  name,
  setName,
  slug,
  setSlug,
  content,
  setContent,
  excerpt,
  setExcerpt,
  status,
  setStatus,
  description,
  setDescription,
  question,
  setQuestion,
  answer,
  setAnswer,
  faqCategory,
  setFaqCategory,
  sortOrder,
  setSortOrder,
  isActive,
  setIsActive,
  categoryId,
  setCategoryId,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
  featuredImage,
  handleFileChange,
  handleRemoveImage,
  categoriesList = [],
}) => {
  const { t } = useTranslation(['cms', 'common'])

  const getEditTitle = () => {
    switch (activeTab) {
      case 'blogs':
        return t('cms.editBlog', 'Edit Blog')
      case 'blog-categories':
        return t('cms.editCategory', 'Edit Category')
      case 'blog-tags':
        return t('cms.editTag', 'Edit Tag')
      case 'pages':
        return t('cms.editPage', 'Edit Page')
      case 'faqs':
        return t('cms.editFaq', 'Edit FAQ')
      case 'banners':
        return t('cms.editBanner', 'Edit Banner')
      default:
        return t('cms.editContent', 'Edit Content')
    }
  }

  const drawerTitle = editingItem ? getEditTitle() : getAddButtonLabel()

  return (
    <FormDrawer
      open={isOpen}
      onClose={onClose}
      title={drawerTitle}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel={t('cms.saveChanges', t('saveChanges', 'Save Changes'))}
      cancelLabel={t('cms.cancel', t('cancel', 'Cancel'))}
      width="max-w-2xl"
    >
      {/* Blog Categories Form */}
      {activeTab === 'blog-categories' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('cms.formCategoryName', 'Category Name')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slug || slug === generateSlug(name)) {
                  setSlug(generateSlug(e.target.value))
                }
              }}
              placeholder="e.g. Technology News"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.colSlug', 'URL Slug')}</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="technology-news"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('cms.formCategoryDesc', 'Description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('cms.formCategoryDesc', 'Category overview & topic description...')}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
            <div>
              <p className="text-xs font-bold text-foreground">{t('cms.formActiveStatus', 'Active Status')}</p>
              <p className="text-[11px] text-muted-foreground">{t('cms.formActiveStatusDesc', 'Make this category visible across blogs')}</p>
            </div>
            <input
              type="checkbox"
              id="catActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded-md text-primary border-border focus:ring-primary cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Blog Tags Form */}
      {activeTab === 'blog-tags' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('cms.formTagName', 'Tag Name')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!slug || slug === generateSlug(name)) {
                  setSlug(generateSlug(e.target.value))
                }
              }}
              placeholder="e.g. React, E-Commerce, Tutorials"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.colSlug', 'URL Slug')}</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="react-e-commerce"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      )}

      {/* Blogs / Articles Form */}
      {activeTab === 'blogs' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('cms.formArticleHeadline', 'Article Headline / Title')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!slug || slug === generateSlug(title)) {
                  setSlug(generateSlug(e.target.value))
                }
              }}
              placeholder={t('cms.formArticleHeadlinePlaceholder', 'e.g. 10 Tips for Scaling Modern Retail...')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.colSlug', 'URL Slug')}</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-headline-slug"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.colCategory', 'Category')}</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">{t('cms.generalUncategorized', 'General / Uncategorized')}</option>
                {categoriesList.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.formExcerpt', 'Excerpt / Summary')}</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={t('cms.formExcerptPlaceholder', 'Short introductory summary for cards and search engine previews...')}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.formFullContent', 'Full Article Content')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('cms.formFullContentPlaceholder', 'Write full article body text...')}
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono leading-relaxed"
            />
          </div>

          {/* Featured Cover Photo */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.formCoverImage', 'Featured Cover Image')}</label>
            {featuredImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-border group bg-muted/40">
                <img src={featuredImage} alt="Cover Preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors shadow-md cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-card transition-all group">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-2">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-bold text-foreground">{t('cms.formClickUpload', 'Click to upload cover photo')}</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">{t('cms.formUploadHint', 'PNG, JPG, WebP up to 5MB')}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.colStatus', 'Publication Status')}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="published">{t('cms.publishedLive', 'Published Live')}</option>
                <option value="draft">{t('cms.draftWip', 'Draft / Work in Progress')}</option>
                <option value="archived">{t('cms.archivedHidden', 'Archived / Hidden')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.formSeoTitle', 'SEO Meta Title')}</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={t('cms.formSeoTitlePlaceholder', 'Meta title for Google search...')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Landing Pages Form */}
      {activeTab === 'pages' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('cms.formPageTitle', 'Page Title')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!slug || slug === generateSlug(title)) {
                  setSlug(generateSlug(e.target.value))
                }
              }}
              placeholder="e.g. Privacy Policy & Terms of Service"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.colSlug', 'URL Slug')}</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                /
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="privacy-policy"
                className="w-full pl-7 pr-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.formPageContent', 'Page Content (HTML / Markdown)')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('cms.formPageContentPlaceholder', 'Enter page body text or HTML markup...')}
              rows={7}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.colStatus', 'Status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="published">{t('cms.published', 'Published')}</option>
              <option value="draft">{t('cms.drafts', 'Draft')}</option>
            </select>
          </div>
        </div>
      )}

      {/* FAQs Form */}
      {activeTab === 'faqs' && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('cms.formQuestion', 'Question')} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('cms.formQuestionPlaceholder', 'e.g. How do I track my delivery status?')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              {t('cms.formAnswer', 'Answer')} <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('cms.formAnswerPlaceholder', 'Detailed answer explanation for customers...')}
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.formFaqCategory', 'FAQ Category')}</label>
              <input
                type="text"
                value={faqCategory}
                onChange={(e) => setFaqCategory(e.target.value)}
                placeholder={t('cms.formFaqCategoryPlaceholder', 'e.g. Orders, Shipping, Billing')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">{t('cms.formSortOrder', 'Sort Order')}</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border">
            <div>
              <p className="text-xs font-bold text-foreground">{t('cms.formActiveFaq', 'Active FAQ')}</p>
              <p className="text-[11px] text-muted-foreground">{t('cms.formActiveFaqDesc', 'Show this item in the public help & FAQ section')}</p>
            </div>
            <input
              type="checkbox"
              id="faqActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded-md text-primary border-border focus:ring-primary cursor-pointer"
            />
          </div>
        </div>
      )}
    </FormDrawer>
  )
}

export default CMSFormDrawer
