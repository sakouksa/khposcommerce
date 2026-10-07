import React from 'react'
import ModernSelect from '@/components/shared/ModernSelect'
import FilterDrawerShell from '@/components/shared/FilterDrawerShell'
import { useTranslation } from 'react-i18next'

interface CMSFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
  filterStatus: string
  setFilterStatus: (val: string) => void
  filterAuthor: string
  setFilterAuthor: (val: string) => void
  filterCategory: string
  setFilterCategory: (val: string) => void
  categories?: any[]
  onReset: () => void
}

const FL = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[11px] font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
)

export const CMSFilterDrawer: React.FC<CMSFilterDrawerProps> = ({
  isOpen,
  onClose,
  filterStatus,
  setFilterStatus,
  filterAuthor,
  setFilterAuthor,
  filterCategory,
  setFilterCategory,
  categories = [],
  onReset,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const activeCount = [
    filterStatus !== 'all' ? filterStatus : '',
    filterAuthor !== 'all' ? filterAuthor : '',
    filterCategory !== 'all' ? filterCategory : '',
  ].filter(Boolean).length

  const categoryOptions = [
    { value: 'all', label: t('cms.allCategories') },
    ...(categories && categories.length > 0
      ? categories.map((c: any) => ({
          value: String(c.id),
          label: c.name,
        }))
      : [
          { value: 'news', label: t('cms.productNews') },
          { value: 'tutorials', label: t('cms.guidesTutorials') },
          { value: 'updates', label: t('cms.releaseUpdates') },
          { value: 'case-studies', label: t('cms.caseStudies') },
        ]),
  ]

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('cms.filterTitle')}
      activeCount={activeCount}
    >
      <FL label={t('cms.contentCategory')}>
        <ModernSelect
          value={filterCategory}
          onChange={setFilterCategory}
          options={categoryOptions}
          placeholder={t('cms.allCategories')}
        />
      </FL>

      <FL label={t('cms.pubStatus')}>
        <ModernSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: t('cms.allStatuses') },
            { value: 'published', label: t('cms.publishedLive') },
            { value: 'draft', label: t('cms.draftWip') },
            { value: 'archived', label: t('cms.archivedHidden') },
            { value: 'pending', label: t('cms.pendingReview') },
          ]}
          placeholder={t('cms.allStatuses')}
        />
      </FL>

      <FL label={t('cms.authorFilter')}>
        <ModernSelect
          value={filterAuthor}
          onChange={setFilterAuthor}
          options={[
            { value: 'all', label: t('cms.allAuthors') },
            { value: 'admin', label: t('cms.systemAdmin') },
            { value: 'editor', label: t('cms.editorTeam') },
            { value: 'guest', label: t('cms.guestContributor') },
          ]}
          placeholder={t('cms.allAuthors')}
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default CMSFilterDrawer
