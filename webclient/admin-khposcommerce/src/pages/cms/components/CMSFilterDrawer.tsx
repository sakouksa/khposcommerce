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
  onReset,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const activeCount = [
    filterStatus !== 'all' ? filterStatus : '',
    filterAuthor !== 'all' ? filterAuthor : '',
    filterCategory !== 'all' ? filterCategory : '',
  ].filter(Boolean).length

  return (
    <FilterDrawerShell
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      title={t('cms.filterTitle', 'Filter CMS Content')}
      activeCount={activeCount}
    >
      <FL label={t('cms.pubStatus', 'Publication Status')}>
        <ModernSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { value: 'all', label: t('cms.allStatuses', 'All Statuses') },
            { value: 'published', label: t('cms.publishedLive', 'Published Live') },
            { value: 'draft', label: t('cms.draftWip', 'Draft / Work in Progress') },
            { value: 'archived', label: t('cms.archivedHidden', 'Archived / Hidden') },
            { value: 'pending', label: t('cms.pendingReview', 'Pending Editorial Review') },
          ]}
          placeholder={t('cms.allStatuses', 'All Statuses')}
        />
      </FL>

      <FL label={t('cms.authorFilter', 'Author Filter')}>
        <ModernSelect
          value={filterAuthor}
          onChange={setFilterAuthor}
          options={[
            { value: 'all', label: t('cms.allAuthors', 'All Authors') },
            { value: 'admin', label: t('cms.systemAdmin', 'System Admin') },
            { value: 'editor', label: t('cms.editorTeam', 'Editor Team') },
            { value: 'guest', label: t('cms.guestContributor', 'Guest Contributor') },
          ]}
          placeholder={t('cms.allAuthors', 'All Authors')}
        />
      </FL>

      <FL label={t('cms.contentCategory', 'Content Category')}>
        <ModernSelect
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { value: 'all', label: t('cms.allCategories', 'All Categories') },
            { value: 'news', label: t('cms.productNews', 'Product News') },
            { value: 'tutorials', label: t('cms.guidesTutorials', 'Guides & Tutorials') },
            { value: 'updates', label: t('cms.releaseUpdates', 'Release Updates') },
            { value: 'case-studies', label: t('cms.caseStudies', 'Case Studies') },
          ]}
          placeholder={t('cms.allCategories', 'All Categories')}
        />
      </FL>
    </FilterDrawerShell>
  )
}

export default CMSFilterDrawer
