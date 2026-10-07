import React, { useState } from 'react'
import {
  FileText,
  FolderOpen,
  Tag,
  FileCode,
  HelpCircle,
  Image as ImageIcon,
  X,
  UploadCloud,
  Layers,
  Globe,
  AlignLeft,
  Hash,
  Star,
  Quote,
  Sparkles,
  Building2,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EnterpriseModal, ModalFooter, RichTextEditor, type ModalHeaderIconVariant } from '@/components/common'
import { generateSlug } from '@/utils/slug'
import { POLICY_TEMPLATES } from '../constants/policyTemplates'
import type { Tab } from '../types/cms.types'

export interface CMSFormModalProps {
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

  // Testimonial specific props
  testimonialRole?: string
  setTestimonialRole?: (val: string) => void
  testimonialCompany?: string
  setTestimonialCompany?: (val: string) => void
  testimonialRating?: number
  setTestimonialRating?: (val: number) => void
  testimonialComment?: string
  setTestimonialComment?: (val: string) => void
  isFeatured?: boolean
  setIsFeatured?: (val: boolean) => void
}

const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const textareaCls =
  'w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'
const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

export const CMSFormModal: React.FC<CMSFormModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isSubmitting,
  activeTab,
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
  testimonialRole = '',
  setTestimonialRole,
  testimonialCompany = '',
  setTestimonialCompany,
  testimonialRating = 5,
  setTestimonialRating,
  testimonialComment = '',
  setTestimonialComment,
  isFeatured = false,
  setIsFeatured,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const isEdit = Boolean(editingItem)

  const handleApplyPolicyTemplate = (templateKey: string) => {
    const tmpl = POLICY_TEMPLATES.find((p) => p.key === templateKey)
    if (tmpl) {
      setTitle(tmpl.name_km)
      setSlug(tmpl.slug)
      setMetaTitle(tmpl.meta_title)
      setMetaDescription(tmpl.meta_description)
      setContent(tmpl.content)
    }
  }

  const getModalConfig = () => {
    switch (activeTab) {
      case 'blogs':
        return {
          title: isEdit ? t('cms.editBlog', 'Edit Article') : t('cms.addBlog', 'Add New Article'),
          subtitle: t('cms.formBlogSubtitle', 'Fill in article details, content, cover image, and SEO settings'),
          icon: <FileText size={20} />,
          variant: 'blue' as ModalHeaderIconVariant,
        }
      case 'blog-categories':
        return {
          title: isEdit ? t('cms.editCategory', 'Edit Category') : t('cms.addCategory', 'Add New Category'),
          subtitle: t('cms.formCategorySubtitle', 'Set category name, slug URL, description, and visibility'),
          icon: <FolderOpen size={20} />,
          variant: 'amber' as ModalHeaderIconVariant,
        }
      case 'blog-tags':
        return {
          title: isEdit ? t('cms.editTag', 'Edit Tag') : t('cms.addTag', 'Add New Tag'),
          subtitle: t('cms.formTagSubtitle', 'Create or edit tag label and slug URL'),
          icon: <Tag size={20} />,
          variant: 'purple' as ModalHeaderIconVariant,
        }
      case 'pages':
        return {
          title: isEdit ? t('cms.editPage', 'Edit Landing Page & Policy') : t('cms.addPage', 'Add Landing Page or Policy'),
          subtitle: t('cms.formPageSubtitle', 'Design page title, slug URL, rich policy terms, and SEO settings'),
          icon: <FileCode size={20} />,
          variant: 'cyan' as ModalHeaderIconVariant,
        }
      case 'faqs':
        return {
          title: isEdit ? t('cms.editFaq', 'Edit FAQ') : t('cms.addFaq', 'Add New FAQ'),
          subtitle: t('cms.formFaqSubtitle', 'Enter question, detailed answer, and category grouping'),
          icon: <HelpCircle size={20} />,
          variant: 'sky' as ModalHeaderIconVariant,
        }
      case 'testimonials':
        return {
          title: isEdit ? t('cms.editTestimonial', 'Edit Testimonial') : t('cms.addTestimonial', 'Add Customer Testimonial'),
          subtitle: t('cms.formTestimonialSubtitle', 'Customer feedback quote, star rating, author details, and homepage showcase'),
          icon: <Quote size={20} />,
          variant: 'emerald' as ModalHeaderIconVariant,
        }
      default:
        return {
          title: isEdit ? t('cms.editContent', 'Edit Content') : t('cms.addContent', 'Add New Content'),
          subtitle: t('cms.cmsSubtitle', 'Manage CMS content records and settings'),
          icon: <Layers size={20} />,
          variant: 'emerald' as ModalHeaderIconVariant,
        }
    }
  }

  const config = getModalConfig()

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      subtitle={config.subtitle}
      icon={config.icon}
      iconVariant={config.variant}
      size={activeTab === 'pages' ? '2xl' : 'xl'}
      badge={
        isEdit && editingItem?.id ? (
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
            #{editingItem.id}
          </span>
        ) : undefined
      }
      footer={
        <ModalFooter
          onCancel={onClose}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          cancelLabel={t('cms.cancel', t('common.cancel', 'Cancel'))}
          submitLabel={
            isEdit
              ? t('cms.saveChanges', t('common.saveChanges', 'Save Changes'))
              : t('cms.saveContent', t('common.save', 'Save Content'))
          }
          onSubmit={(e) => onSubmit(e || ({ preventDefault: () => {} } as any))}
        />
      }
    >
      <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
        {/* ══════════════════════════════════════════════════
            1. BLOG CATEGORIES FORM
        ══════════════════════════════════════════════════ */}
        {activeTab === 'blog-categories' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('cms.formCategoryName', 'Category Name')} <span className="text-rose-500">*</span>
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
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('cms.colSlug', 'Slug URL')}</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="technology-news"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>

            <div>
              <label className={labelCls}>{t('cms.formCategoryDesc', 'Description')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('cms.formCategoryDesc', 'Overview description of this category...')}
                rows={3}
                className={textareaCls}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('cms.formActiveStatus', 'Active Status')}</p>
                <p className="text-[11px] text-muted-foreground">{t('cms.formActiveStatusDesc', 'Show this category in the public blog')}</p>
              </div>
              <input
                type="checkbox"
                id="catActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded-md text-primary border-border focus:ring-primary cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            2. BLOG TAGS FORM
        ══════════════════════════════════════════════════ */}
        {activeTab === 'blog-tags' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('cms.formTagName', 'Tag Name')} <span className="text-rose-500">*</span>
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
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('cms.colSlug', 'Slug URL')}</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="react-e-commerce"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            3. LANDING PAGES & POLICIES FORM
        ══════════════════════════════════════════════════ */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            {/* Quick Policy Template Selector */}
            {!isEdit && (
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary shrink-0" />
                  <div>
                    <p className="font-bold text-xs text-foreground">
                      {t('cms.loadPolicyTemplate', 'Load Store Policy Preset')}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t('cms.loadPolicyDesc', 'Pre-fill standard Cambodia E-Commerce policy clauses')}
                    </p>
                  </div>
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleApplyPolicyTemplate(e.target.value)
                  }}
                  className="h-8 px-2.5 text-xs rounded-lg border border-primary/30 bg-background text-foreground font-semibold cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>-- ជ្រើសរើសគំរូគោលការណ៍ --</option>
                  {POLICY_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.key} value={tmpl.key}>
                      {tmpl.name_km}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className={labelCls}>
                {t('cms.formPageTitle', 'Page Title')} <span className="text-rose-500">*</span>
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
                placeholder="e.g. គោលការណ៍ប្តូរទំនិញ & សងប្រាក់ (Return & Refund Policy)"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.colSlug', 'Slug URL')}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="return-refund-policy"
                    className={`${inputCls} pl-7 font-mono text-xs`}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>{t('cms.colStatus', 'Status')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={selectCls}
                >
                  <option value="published">{t('cms.published', 'Published')}</option>
                  <option value="draft">{t('cms.drafts', 'Draft')}</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editor for Content */}
            <div>
              <label className={labelCls}>{t('cms.formPageContent', 'Policy & Page Content')}</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write rich policy terms, delivery guidelines, or landing page body..."
                minHeight="220px"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.formSeoTitle', 'SEO Meta Title')}</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Meta title for Google Search..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('cms.formSeoDesc', 'SEO Meta Description')}</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search snippets..."
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            4. FAQS FORM
        ══════════════════════════════════════════════════ */}
        {activeTab === 'faqs' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('cms.formQuestion', 'Question')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('cms.formQuestionPlaceholder', 'e.g. How do I track my order delivery?')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {t('cms.formAnswer', 'Answer')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('cms.formAnswerPlaceholder', 'Detailed answer explanation for customers...')}
                rows={4}
                className={textareaCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.formFaqCategory', 'FAQ Category')}</label>
                <input
                  type="text"
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  placeholder={t('cms.formFaqCategoryPlaceholder', 'e.g. Orders, Delivery, Payments')}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>{t('cms.formSortOrder', 'Sort Order')}</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('cms.formActiveFaq', 'Active FAQ')}</p>
                <p className="text-[11px] text-muted-foreground">{t('cms.formActiveFaqDesc', 'Show this question in the public Help & FAQ center')}</p>
              </div>
              <input
                type="checkbox"
                id="faqActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded-md text-primary border-border focus:ring-primary cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            5. TESTIMONIALS FORM
        ══════════════════════════════════════════════════ */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('cms.authorName', 'Customer / Author Name')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name || title}
                onChange={(e) => {
                  setName(e.target.value)
                  setTitle(e.target.value)
                }}
                placeholder="e.g. សុខ វិបុល / Sok Vibol"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.roleTitle', 'Position / Role')}</label>
                <input
                  type="text"
                  value={testimonialRole}
                  onChange={(e) => setTestimonialRole?.(e.target.value)}
                  placeholder="e.g. CEO, Store Manager"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('cms.companyName', 'Company / Business')}</label>
                <input
                  type="text"
                  value={testimonialCompany}
                  onChange={(e) => setTestimonialCompany?.(e.target.value)}
                  placeholder="e.g. Angkor Mart Co., Ltd"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('cms.starRating', 'Rating (1 to 5 Stars)')}</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setTestimonialRating?.(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      size={20}
                      className={star <= testimonialRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-foreground ml-2">
                  {testimonialRating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className={labelCls}>
                {t('cms.testimonialComment', 'Review / Feedback Quote')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                value={testimonialComment || content}
                onChange={(e) => {
                  setTestimonialComment?.(e.target.value)
                  setContent(e.target.value)
                }}
                placeholder="Write genuine customer feedback about OptaPOS service and speed..."
                rows={3}
                className={textareaCls}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 border border-border">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('cms.featuredOnHome', 'Feature on Homepage')}</p>
                <p className="text-[11px] text-muted-foreground">{t('cms.featuredOnHomeDesc', 'Display this testimonial in the Storefront Home Testimonials carousel')}</p>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured?.(e.target.checked)}
                className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}
      </form>
    </EnterpriseModal>
  )
}

export default CMSFormModal
