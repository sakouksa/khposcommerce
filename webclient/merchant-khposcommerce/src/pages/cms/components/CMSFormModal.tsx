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
import { POLICY_TEMPLATES } from '../policyTemplates'
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
          title: isEdit ? t('cms.editBlog') : t('cms.addBlog'),
          subtitle: t('cms.formBlogSubtitle'),
          icon: <FileText size={20} />,
          variant: 'blue' as ModalHeaderIconVariant,
        }
      case 'blog-categories':
        return {
          title: isEdit ? t('cms.editCategory') : t('cms.addCategory'),
          subtitle: t('cms.formCategorySubtitle'),
          icon: <FolderOpen size={20} />,
          variant: 'amber' as ModalHeaderIconVariant,
        }
      case 'blog-tags':
        return {
          title: isEdit ? t('cms.editTag') : t('cms.addTag'),
          subtitle: t('cms.formTagSubtitle'),
          icon: <Tag size={20} />,
          variant: 'purple' as ModalHeaderIconVariant,
        }
      case 'pages':
        return {
          title: isEdit ? t('cms.editPage') : t('cms.addPage'),
          subtitle: t('cms.formPageSubtitle'),
          icon: <FileCode size={20} />,
          variant: 'cyan' as ModalHeaderIconVariant,
        }
      case 'faqs':
        return {
          title: isEdit ? t('cms.editFaq') : t('cms.addFaq'),
          subtitle: t('cms.formFaqSubtitle'),
          icon: <HelpCircle size={20} />,
          variant: 'sky' as ModalHeaderIconVariant,
        }
      case 'testimonials':
        return {
          title: isEdit ? t('cms.editTestimonial') : t('cms.addTestimonial'),
          subtitle: t('cms.formTestimonialSubtitle'),
          icon: <Quote size={20} />,
          variant: 'emerald' as ModalHeaderIconVariant,
        }
      default:
        return {
          title: isEdit ? t('cms.editContent') : t('cms.addContent'),
          subtitle: t('cms.cmsSubtitle'),
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
          cancelLabel={t('cms.cancel')}
          submitLabel={
            isEdit
              ? t('cms.saveChanges')
              : t('cms.saveContent')
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
                {t('cms.formCategoryName')} <span className="text-rose-500">*</span>
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
                placeholder={t('cms.categoryNamePlaceholder')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('cms.colSlug')}</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="technology-news"
                className={`${inputCls} font-mono text-xs`}
              />
            </div>

            <div>
              <label className={labelCls}>{t('cms.formCategoryDesc')}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('cms.formCategoryDesc')}
                rows={3}
                className={textareaCls}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('cms.formActiveStatus')}</p>
                <p className="text-[11px] text-muted-foreground">{t('cms.formActiveStatusDesc')}</p>
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
                {t('cms.formTagName')} <span className="text-rose-500">*</span>
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
                placeholder={t('cms.tagPlaceholder')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>{t('cms.colSlug')}</label>
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
                      {t('cms.loadPolicyTemplate')}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {t('cms.loadPolicyDesc')}
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
                  <option value="" disabled>{t('cms.selectPolicyTemplate')}</option>
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
                {t('cms.formPageTitle')} <span className="text-rose-500">*</span>
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
                placeholder={t('cms.policyTitlePlaceholder')}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.colSlug')}</label>
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
                <label className={labelCls}>{t('cms.colStatus')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={selectCls}
                >
                  <option value="published">{t('cms.published')}</option>
                  <option value="draft">{t('cms.drafts')}</option>
                </select>
              </div>
            </div>

            {/* Rich Text Editor for Content */}
            <div>
              <label className={labelCls}>{t('cms.formPageContent')}</label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder={t('cms.formPageContentPlaceholder')}
                minHeight="220px"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.formSeoTitle')}</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={t('cms.formSeoTitlePlaceholder')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('cms.formSeoDesc')}</label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={t('cms.metaDescPlaceholder')}
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
                {t('cms.formQuestion')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('cms.formQuestionPlaceholder')}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {t('cms.formAnswer')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('cms.formAnswerPlaceholder')}
                rows={4}
                className={textareaCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.formFaqCategory')}</label>
                <input
                  type="text"
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  placeholder={t('cms.formFaqCategoryPlaceholder')}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>{t('cms.formSortOrder')}</label>
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
                <p className="text-xs font-semibold text-foreground">{t('cms.formActiveFaq')}</p>
                <p className="text-[11px] text-muted-foreground">{t('cms.formActiveFaqDesc')}</p>
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
                {t('cms.authorName')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name || title}
                onChange={(e) => {
                  setName(e.target.value)
                  setTitle(e.target.value)
                }}
                placeholder={t('cms.clientNamePlaceholder')}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={labelCls}>{t('cms.roleTitle')}</label>
                <input
                  type="text"
                  value={testimonialRole}
                  onChange={(e) => setTestimonialRole?.(e.target.value)}
                  placeholder={t('cms.rolePlaceholder')}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>{t('cms.companyName')}</label>
                <input
                  type="text"
                  value={testimonialCompany}
                  onChange={(e) => setTestimonialCompany?.(e.target.value)}
                  placeholder={t('cms.companyPlaceholder')}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>{t('cms.starRating')}</label>
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
                  {testimonialRating} / 5 {t('cms.starsUnit')}
                </span>
              </div>
            </div>

            <div>
              <label className={labelCls}>
                {t('cms.testimonialComment')} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                value={testimonialComment || content}
                onChange={(e) => {
                  setTestimonialComment?.(e.target.value)
                  setContent(e.target.value)
                }}
                placeholder={t('cms.testimonialCommentPlaceholder')}
                rows={3}
                className={textareaCls}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 border border-border">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('cms.featuredOnHome')}</p>
                <p className="text-[11px] text-muted-foreground">{t('cms.featuredOnHomeDesc')}</p>
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
