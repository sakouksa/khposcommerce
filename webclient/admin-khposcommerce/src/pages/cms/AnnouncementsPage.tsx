import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { cmsService } from '@/services/cmsService'
import Breadcrumb from '@/components/common/Breadcrumb'
import { HeaderActionsGroup, AddButton, ExportButton } from '@/components/common'
import { CMSStatsCards, AnnouncementsTable } from './components'

export const AnnouncementsPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'nav'])
  const [triggerCreate, setTriggerCreate] = useState(0)
  const [triggerExport, setTriggerExport] = useState(0)

  const { data: cmsStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: () => cmsService.getStats(),
  })

  return (
    <div className="space-y-6">
      {/* Standalone Top Breadcrumb */}
      <Breadcrumb
        items={[
          { label: t('nav.contentManagement', 'Content Management'), href: '/cms/blogs' },
          { label: t('nav.cmsAnnouncements', 'Announcement Bar') },
        ]}
      />

      {/* Frameless Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t('cms.announcementsTitle', 'Storefront Header Announcement Bar')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('cms.announcementsSubtitle', 'Manage top header notification strips, flash deals, coupon codes, and promo countdowns.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-primary/10 text-foreground hover:text-primary border border-border text-xs font-semibold transition-all"
            title={t('cms.viewStorefrontWebsite', 'View Storefront')}
          >
            <span>{t('cms.storefront', 'Storefront')}</span>
            <ExternalLink size={13} />
          </a>
          <ExportButton
            onClick={() => setTriggerExport((prev) => prev + 1)}
            label={t('common.exportCsv', 'Export CSV')}
          />
          <AddButton
            label={t('cms.createCampaign', 'New Campaign')}
            onClick={() => setTriggerCreate((prev) => prev + 1)}
          />
        </HeaderActionsGroup>
      </div>

      {/* Executive KPI Overview */}
      <CMSStatsCards activeTab="announcements" stats={cmsStats} isLoading={isStatsLoading} />

      {/* Announcements Configuration & Campaign Management */}
      <AnnouncementsTable triggerCreate={triggerCreate} triggerExport={triggerExport} />
    </div>
  )
}

export default AnnouncementsPage
