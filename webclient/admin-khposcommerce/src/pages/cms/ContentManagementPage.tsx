import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  FolderOpen,
  Tag,
  FileCode,
  HelpCircle,
  Image as ImageIcon,
  Megaphone,
  Quote,
  Sparkles,
  Search,
  X,
  Plus,
} from 'lucide-react'
import { cmsService } from '@/services/cmsService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import { usePageTab } from '@/hooks/usePageTab'
import ResetButton from '@/components/shared/ResetButton'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Breadcrumb from '@/components/common/Breadcrumb'
import { HeaderActionsGroup, AddButton, ExportButton, ImportButton, FilterButton, RefreshButton, TableToolbar } from '@/components/common'
import { downloadCsv } from '@/utils/export'
import WorkspaceTabs from '@/components/shared/WorkspaceTabs'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import BulkSelectionBanner from '@/components/shared/BulkSelectionBanner'

import { CMSStatsCards } from './components/CMSStatsCards'
import { CMSFilterDrawer } from './components/CMSFilterDrawer'
import { CMSFormModal } from './components/CMSFormModal'
import { CMSImportModal } from './components/CMSImportModal'

import { BlogsTab } from './components/tabs/BlogsTab'
import { BlogCategoriesTab } from './components/tabs/BlogCategoriesTab'
import { BlogTagsTab } from './components/tabs/BlogTagsTab'
import { BannersTab } from './components/tabs/BannersTab'
import { PagesTab } from './components/tabs/PagesTab'
import { FaqsTab } from './components/tabs/FaqsTab'
import { AnnouncementsTab } from './components/tabs/AnnouncementsTab'
import { TestimonialsTab } from './components/tabs/TestimonialsTab'
import { MediaLibraryTab } from './components/tabs/MediaLibraryTab'
import type { Tab } from './types/cms.types'

const ContentManagementPage: React.FC = () => {
  const { t } = useTranslation(['cms', 'common', 'toast', 'confirm'])
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = usePageTab<Tab>({
    storageKey: 'cms_active_tab',
    defaultTab: 'blogs',
    validTabs: ['blogs', 'blog-categories', 'blog-tags', 'banners', 'pages', 'faqs', 'announcements', 'testimonials', 'media'],
  })

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: `cms_${activeTab}` })

  // Bulk Selection States
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  // Clear selections when tab, search, or filters change
  useEffect(() => {
    setSelectedRows([])
  }, [activeTab, page, debouncedSearch, perPage])

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // CSV Import
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importPreviewData, setImportPreviewData] = useState<{ headers: string[]; rows: string[][] } | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  // Column Settings
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    title: true,
    slug: true,
    category: true,
    status: true,
    actions: true,
    position: true,
    sortOrder: true,
    author: true,
    feedback: true,
    rating: true,
    featured: true,
  })

  // Filter Drawer States
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAuthor, setFilterAuthor] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const activeFilterCount = useMemo(() => {
    return [
      filterStatus !== 'all' ? filterStatus : null,
      filterAuthor !== 'all' ? filterAuthor : null,
      filterCategory !== 'all' ? filterCategory : null,
    ].filter(Boolean).length
  }, [filterStatus, filterAuthor, filterCategory])

  // Form Fields
  const [editingItem, setEditingItem] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [status, setStatus] = useState('published')
  const [description, setDescription] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [faqCategory, setFaqCategory] = useState('')
  const [sortOrder, setSortOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [categoryId, setCategoryId] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Testimonials Specific Fields
  const [testimonialRole, setTestimonialRole] = useState('')
  const [testimonialCompany, setTestimonialCompany] = useState('')
  const [testimonialRating, setTestimonialRating] = useState(5)
  const [testimonialComment, setTestimonialComment] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFeaturedImage(URL.createObjectURL(file))
      toast.success(t('cms.fileSelected', { fileName: file.name, defaultValue: `File "${file.name}" selected.` }))
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setFeaturedImage('')
  }

  // API List Query based on activeTab
  const { data: listData, isLoading, isFetching } = useQuery({
    queryKey: [activeTab, page, debouncedSearch, perPage, filterStatus, filterCategory],
    queryFn: async () => {
      if (activeTab === 'banners') {
        return cmsService.getBanners({
          page,
          search: debouncedSearch,
          per_page: perPage,
          ...(filterStatus !== 'all' && { status: filterStatus }),
        })
      }
      if (activeTab === 'testimonials') {
        return cmsService.getTestimonials({
          page,
          search: debouncedSearch,
          per_page: perPage,
        })
      }
      if (activeTab === 'media') {
        return cmsService.getMediaList({
          page,
          search: debouncedSearch,
          per_page: perPage,
        })
      }
      if (activeTab === 'announcements') {
        const res = await cmsService.getAnnouncementsList({ per_page: 50 })
        const list = res?.data?.data || res?.data || (Array.isArray(res) ? res : [])
        return { data: list, pagination: { total: list.length, current_page: 1, last_page: 1 } }
      }
      return cmsService.getItemsByTab(activeTab, {
        page,
        search: debouncedSearch,
        per_page: perPage,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category_id: filterCategory }),
      })
    },
    enabled: activeTab !== 'announcements' && activeTab !== 'media',
    placeholderData: (prev) => prev,
  })

  const { data: categories } = useQuery({
    queryKey: ['blog-categories-list'],
    queryFn: () => cmsService.getCategories({ per_page: 100 }),
    enabled: activeTab === 'blogs',
  })

  // Global CMS stats across all resources (only needed on blogs tab)
  const { data: cmsStats } = useQuery({
    queryKey: ['cms-stats'],
    queryFn: () => cmsService.getStats(),
    enabled: activeTab === 'blogs',
  })

  const records = listData?.data ?? []
  const pagination = listData?.pagination ?? { total: records.length, current_page: 1, last_page: 1 }

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: any) => {
      if (activeTab === 'banners') return cmsService.createBanner(payload)
      return cmsService.createItemByTab(activeTab, payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.createdSuccess', 'Content created successfully.'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.createFailed', 'Failed to create item.')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      if (activeTab === 'banners') return cmsService.updateBanner(id, data)
      return cmsService.updateItemByTab(activeTab, id, data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      closeModal()
      toast.success(t('cms.updatedSuccess', 'Content updated successfully.'))
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('cms.updateFailed', 'Failed to update item.')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (activeTab === 'banners') return cmsService.deleteBanner(id)
      return cmsService.deleteItemByTab(activeTab, id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setConfirmOpen(false)
      toast.success(t('cms.deletedSuccess', 'Deleted successfully.'))
      adjustAfterDelete(records.length)
      setSelectedRows((prev) => (deleteId ? prev.filter((id) => id !== deleteId) : prev))
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete item.'))
      setConfirmOpen(false)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => {
      if (activeTab === 'banners') return cmsService.bulkDeleteBanners(ids)
      return cmsService.bulkDeleteItemsByTab(activeTab, ids)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [activeTab] })
      qc.invalidateQueries({ queryKey: ['cms-stats'] })
      setBulkDeleteConfirmOpen(false)
      toast.success(
        t('cms.bulkDeleteSuccess', {
          count: selectedRows.length,
          defaultValue: `Successfully deleted ${selectedRows.length} items.`,
        })
      )
      adjustAfterDelete(records.length - selectedRows.length)
      setSelectedRows([])
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('cms.deleteFailed', 'Failed to delete items.'))
      setBulkDeleteConfirmOpen(false)
    },
  })

  const toggleSelectAll = () => {
    if (records.length > 0 && selectedRows.length === records.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(records.map((r: any) => r.id))
    }
  }

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const openCreateModal = () => {
    setEditingItem(null)
    setTitle('')
    setName('')
    setSlug('')
    setContent('')
    setExcerpt('')
    setStatus('published')
    setDescription('')
    setQuestion('')
    setAnswer('')
    setFaqCategory('')
    setSortOrder('0')
    setIsActive(true)
    setCategoryId('')
    setMetaTitle('')
    setMetaDescription('')
    setTestimonialRole('')
    setTestimonialCompany('')
    setTestimonialRating(5)
    setTestimonialComment('')
    setIsFeatured(false)
    setModalOpen(true)
  }

  const openEditModal = (item: any) => {
    setEditingItem(item)
    setTitle(item.title ?? item.name ?? item.author_name ?? '')
    setName(item.name ?? item.author_name ?? item.title ?? '')
    setSlug(item.slug ?? '')
    setContent(item.content ?? item.comment ?? '')
    setExcerpt(item.excerpt ?? '')
    setStatus(item.status ?? (item.is_active !== false ? 'published' : 'draft'))
    setDescription(item.description ?? '')
    setQuestion(item.question ?? '')
    setAnswer(item.answer ?? '')
    setFaqCategory(item.category ?? '')
    setSortOrder(item.sort_order?.toString() ?? '0')
    setIsActive(item.is_active ?? true)
    setCategoryId(item.blog_category_id ?? '')
    setMetaTitle(item.meta_title ?? '')
    setMetaDescription(item.meta_description ?? '')
    setTestimonialRole(item.role ?? '')
    setTestimonialCompany(item.company ?? '')
    setTestimonialRating(item.rating ?? 5)
    setTestimonialComment(item.comment ?? item.content ?? '')
    setIsFeatured(item.is_featured ?? false)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let payload: any = {}
    if (activeTab === 'blog-categories') {
      payload = { company_id: 1, name, slug: slug || name.toLowerCase().replace(/ /g, '-'), description, is_active: isActive ? 1 : 0 }
    } else if (activeTab === 'blog-tags') {
      payload = { company_id: 1, name, slug: slug || name.toLowerCase().replace(/ /g, '-') }
    } else if (activeTab === 'blogs') {
      payload = { company_id: 1, blog_category_id: Number(categoryId), title, slug: slug || title.toLowerCase().replace(/ /g, '-'), excerpt, content, status, meta_title: metaTitle, meta_description: metaDescription }
    } else if (activeTab === 'pages') {
      payload = { company_id: 1, title, slug: slug || title.toLowerCase().replace(/ /g, '-'), content, status, meta_title: metaTitle, meta_description: metaDescription }
    } else if (activeTab === 'faqs') {
      payload = { company_id: 1, question, answer, category: faqCategory, sort_order: Number(sortOrder), is_active: isActive ? 1 : 0 }
    } else if (activeTab === 'testimonials') {
      payload = { company_id: 1, author_name: name || title, role: testimonialRole, company: testimonialCompany, rating: testimonialRating, comment: testimonialComment || content, is_featured: isFeatured ? 1 : 0, is_active: isActive ? 1 : 0 }
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setConfirmOpen(true)
  }

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'blogs':
        return t('cms.addBlog', 'Add Blog')
      case 'blog-categories':
        return t('cms.addCategory', 'Add Category')
      case 'blog-tags':
        return t('cms.addTag', 'Add Tag')
      case 'banners':
        return t('cms.addBanner', 'Add Banner')
      case 'pages':
        return t('cms.addPage', 'Add Page / Policy')
      case 'faqs':
        return t('cms.addFaq', 'Add FAQ')
      case 'testimonials':
        return t('cms.addTestimonial', 'Add Testimonial')
      case 'media':
        return t('cms.uploadSuccess', 'Upload Media')
      default:
        return t('cms.addContent', 'Add Content')
    }
  }

  const handleAddActionClick = () => {
    if (activeTab === 'blogs') {
      navigate('/cms/blogs/create')
    } else if (activeTab === 'banners') {
      navigate('/cms/banners/create')
    } else if (activeTab === 'announcements' || activeTab === 'media') {
      // scroll into view or trigger actions
      toast.info(t('cms.actionTriggered', 'Use the controls below to configure or upload.'))
    } else {
      openCreateModal()
    }
  }

  const handleExportCSV = () => {
    if (!records.length) {
      toast.error(t('common.noDataToExport', 'មិនមានទិន្នន័យដើម្បីនាំចេញទេ!'))
      return
    }
    const toastId = toast.info(t('common.exportDownloading', 'កំពុងរៀបចំ និងទាញយកទិន្នន័យ...'))
    setTimeout(() => {
      const headers = ['ID', 'Title/Name', 'Type/Category', 'Status', 'Created At']
      const rows = records.map((r: any) => [
        r.id || '',
        r.title || r.name || r.author_name || r.question || '',
        r.category?.name || r.position || r.type || activeTab,
        r.is_active !== false && r.status !== 'inactive' ? t('common.active', 'Active') : t('common.inactive', 'Inactive'),
        r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
      ])
      downloadCsv(`cms_${activeTab}`, headers, rows)
      toast.dismiss(toastId)
      toast.success(t('common.exportSuccess', 'បានទាញយកទិន្នន័យជាឯកសារ CSV ដោយជោគជ័យ!'))
    }, 400)
  }

  const handleFileSelectForImport = (file: File) => {
    setImportFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) return
      const lines = text.split(/\r\n|\n/).filter((line) => line.trim().length > 0)
      if (lines.length === 0) return
      const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim())
      const rows = lines.slice(1, 6).map((line) => line.split(',').map((c) => c.replace(/^"|"$/g, '').trim()))
      setImportPreviewData({ headers, rows })
    }
    reader.readAsText(file)
  }

  const handleConfirmImport = async () => {
    if (!importFile) return
    setIsImporting(true)
    try {
      await new Promise((res) => setTimeout(res, 800))
      qc.invalidateQueries({ queryKey: [activeTab] })
      toast.success(t('cms.importSuccess', 'Successfully imported CMS dataset!'))
      setImportModalOpen(false)
      setImportFile(null)
      setImportPreviewData(null)
    } catch {
      toast.error(t('cms.importFailed', 'Failed to import dataset.'))
    } finally {
      setIsImporting(false)
    }
  }

  const resetAllFilters = () => {
    setFilterStatus('all')
    setFilterAuthor('all')
    setFilterCategory('all')
    reset()
  }

  const tabItems = [
    { id: 'blogs', label: t('cms.tabBlogs', 'Blogs & Articles'), icon: FileText, count: activeTab === 'blogs' ? pagination.total : undefined },
    { id: 'blog-categories', label: t('cms.tabCategories', 'Categories'), icon: FolderOpen },
    { id: 'blog-tags', label: t('cms.tabTags', 'Tags'), icon: Tag },
    { id: 'banners', label: t('cms.tabBanners', 'Banners & Sliders'), icon: ImageIcon },
    { id: 'pages', label: t('cms.tabPages', 'Pages & Policies'), icon: FileCode },
    { id: 'faqs', label: t('cms.tabFaqs', 'FAQs & Help'), icon: HelpCircle },
    { id: 'announcements', label: t('cms.tabAnnouncements', 'Top Announcement'), icon: Megaphone },
    { id: 'testimonials', label: t('cms.tabTestimonials', 'Testimonials'), icon: Quote },
    { id: 'media', label: t('cms.tabMedia', 'Media Library'), icon: Sparkles },
  ]

  const columnOptions = useMemo(() => {
    switch (activeTab) {
      case 'blogs':
        return [
          { key: 'title', label: t('cms.colHeadline', 'Article Headline') },
          { key: 'slug', label: t('cms.colSlug', 'URL Slug') },
          { key: 'category', label: t('cms.colCategory', 'Category') },
          { key: 'status', label: t('cms.colStatus', 'Status') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
      case 'banners':
        return [
          { key: 'title', label: t('cms.colBannerTitle', 'Banner & Creative') },
          { key: 'position', label: t('cms.colPosition', 'Placement') },
          { key: 'sortOrder', label: t('cms.colOrder', 'Priority') },
          { key: 'status', label: t('cms.colStatus', 'Status') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
      case 'testimonials':
        return [
          { key: 'author', label: t('cms.colAuthor', 'Client / Customer') },
          { key: 'feedback', label: t('cms.colFeedback', 'Feedback / Review') },
          { key: 'rating', label: t('cms.colRating', 'Rating') },
          { key: 'featured', label: t('cms.colFeatured', 'Homepage') },
          { key: 'status', label: t('cms.colStatus', 'Status') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
      case 'blog-categories':
        return [
          { key: 'title', label: t('cms.colCategoryName', 'Category Name') },
          { key: 'slug', label: t('cms.colSlug', 'URL Slug') },
          { key: 'status', label: t('cms.colStatus', 'Status') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
      case 'blog-tags':
        return [
          { key: 'title', label: t('cms.colTagName', 'Tag Name') },
          { key: 'slug', label: t('cms.colSlug', 'URL Slug') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
      case 'pages':
        return [
          { key: 'title', label: t('cms.colPageTitle', 'Page Title & Structure') },
          { key: 'slug', label: t('cms.colSlug', 'Storefront Route') },
          { key: 'category', label: t('cms.colPageType', 'Type') },
          { key: 'status', label: t('cms.colStatus', 'Status') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
      case 'faqs':
        return [
          { key: 'title', label: t('cms.colQuestionAnswer', 'Question & Answer') },
          { key: 'category', label: t('cms.colCategory', 'Category') },
          { key: 'status', label: t('cms.colStatus', 'Status') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
      default:
        return [
          { key: 'title', label: t('cms.colHeadline', 'Title') },
          { key: 'slug', label: t('cms.colSlug', 'Slug') },
          { key: 'actions', label: t('cms.colActions', 'Actions') },
        ]
    }
  }, [activeTab, t])

  const showTableToolbar = activeTab !== 'announcements' && activeTab !== 'media'

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('cms.dashboard', 'Dashboard'), path: '/dashboard' },
          { label: t('cms.contentManagement', 'Content Management') }
        ]}
      />

      {/* Hero Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('cms.cmsManagement', 'Content & CMS Management')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('cms.cmsSubtitle', 'Create, manage, and publish articles, landing pages, taxonomy, banners, announcements, and media assets.')}
          </p>
        </div>

        {activeTab !== 'announcements' && (
          <HeaderActionsGroup>
            {activeTab !== 'media' && (
              <>
                <ImportButton onClick={() => setImportModalOpen(true)} label={t('cms.importCsv', 'Import CSV')} />
                <ExportButton onClick={handleExportCSV} label={t('cms.exportCsv', 'Export CSV')} />
              </>
            )}
            <AddButton onClick={handleAddActionClick} label={getAddButtonLabel()} />
          </HeaderActionsGroup>
        )}
      </div>

      {/* Clean Workspace Tabs */}
      <WorkspaceTabs
        tabs={tabItems}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as Tab)}
        variant="underline"
      />

      {/* KPI Cards - Only on Main Blogs/Articles Tab */}
      {activeTab === 'blogs' && (
        <CMSStatsCards
          activeTab={activeTab}
          records={records}
          stats={cmsStats}
          pagination={pagination}
        />
      )}

      {/* Bulk Selection Banner */}
      {showTableToolbar && (
        <BulkSelectionBanner
          selectedCount={selectedRows.length}
          onDelete={() => setBulkDeleteConfirmOpen(true)}
          onClear={() => setSelectedRows([])}
          deleteLabel={t('common.deleteSelected', 'Delete Selected')}
          deleteLoading={bulkDeleteMutation.isPending}
        />
      )}

      {/* Global Standard Table Toolbar */}
      {showTableToolbar && (
        <TableToolbar
          search={search}
          onSearchChange={(val) => { setSearch(val); setPage(1); }}
          searchPlaceholder={t('cms.searchPlaceholder', 'Search articles, slugs, categories...')}
          onFilterClick={() => setFilterDrawerOpen(true)}
          isFilterActive={activeFilterCount > 0}
          filterActiveCount={activeFilterCount}
          onReset={resetAllFilters}
          onRefresh={() => qc.invalidateQueries({ queryKey: [activeTab] })}
          refreshLoading={isFetching}
          columns={columnOptions}
          visibleColumns={visibleColumns}
          onColumnChange={setVisibleColumns}
        />
      )}

      {/* Filter Drawer */}
      <CMSFilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterAuthor={filterAuthor}
        setFilterAuthor={setFilterAuthor}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        onReset={resetAllFilters}
      />

      {/* Active Tab View */}
      {activeTab === 'blogs' ? (
        <BlogsTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
          confirmDelete={confirmDelete}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      ) : activeTab === 'blog-categories' ? (
        <BlogCategoriesTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
          confirmDelete={confirmDelete}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      ) : activeTab === 'blog-tags' ? (
        <BlogTagsTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
          confirmDelete={confirmDelete}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      ) : activeTab === 'banners' ? (
        <BannersTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          confirmDelete={confirmDelete}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      ) : activeTab === 'pages' ? (
        <PagesTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
          confirmDelete={confirmDelete}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      ) : activeTab === 'faqs' ? (
        <FaqsTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
          confirmDelete={confirmDelete}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      ) : activeTab === 'announcements' ? (
        <AnnouncementsTab />
      ) : activeTab === 'testimonials' ? (
        <TestimonialsTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          visibleColumns={visibleColumns}
          openEditModal={openEditModal}
          confirmDelete={confirmDelete}
          selectedRows={selectedRows}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelectRow={toggleSelectRow}
        />
      ) : (
        <MediaLibraryTab
          records={records}
          isLoading={isLoading}
          isFetching={isFetching}
          confirmDelete={confirmDelete}
        />
      )}

      {/* Pagination */}
      {showTableToolbar && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}

      {/* Enterprise Form Modal with Global Header & Footer */}
      <CMSFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        editingItem={editingItem}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        activeTab={activeTab}
        getAddButtonLabel={getAddButtonLabel}
        title={title}
        setTitle={setTitle}
        name={name}
        setName={setName}
        slug={slug}
        setSlug={setSlug}
        content={content}
        setContent={setContent}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
        status={status}
        setStatus={setStatus}
        description={description}
        setDescription={setDescription}
        question={question}
        setQuestion={setQuestion}
        answer={answer}
        setAnswer={setAnswer}
        faqCategory={faqCategory}
        setFaqCategory={setFaqCategory}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        isActive={isActive}
        setIsActive={setIsActive}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        metaTitle={metaTitle}
        setMetaTitle={setMetaTitle}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
        featuredImage={featuredImage}
        handleFileChange={handleFileChange}
        handleRemoveImage={handleRemoveImage}
        categoriesList={categories || []}
        testimonialRole={testimonialRole}
        setTestimonialRole={setTestimonialRole}
        testimonialCompany={testimonialCompany}
        setTestimonialCompany={setTestimonialCompany}
        testimonialRating={testimonialRating}
        setTestimonialRating={setTestimonialRating}
        testimonialComment={testimonialComment}
        setTestimonialComment={setTestimonialComment}
        isFeatured={isFeatured}
        setIsFeatured={setIsFeatured}
      />

      {/* CSV Import Modal */}
      <CMSImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        importFile={importFile}
        setImportFile={setImportFile}
        handleFileSelectForImport={handleFileSelectForImport}
        importPreviewData={importPreviewData}
        isImporting={isImporting}
        handleConfirmImport={handleConfirmImport}
      />

      {/* Single Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={t('cms.deleteTitle', 'Delete CMS Content')}
        message={t('cms.deleteConfirmMessage', 'Are you sure you want to delete this content item? This action cannot be undone.')}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        onCancel={() => setConfirmOpen(false)}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={t('cms.bulkDeleteTitle', { count: selectedRows.length, defaultValue: `Delete ${selectedRows.length} Selected Items` })}
        message={t('cms.bulkDeleteConfirmMessage', { count: selectedRows.length, defaultValue: `Are you sure you want to delete ${selectedRows.length} selected items? This action cannot be undone.` })}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
        confirmText={t('common.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}

export default ContentManagementPage
