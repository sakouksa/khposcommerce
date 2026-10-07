import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Trash2, RefreshCw, Users,
  ChevronUp, ChevronDown, Download, Award,
  AlertCircle
} from 'lucide-react'
import { customerService } from '@/services/customerService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TableActionMenu from '@/components/shared/TableActionMenu'
import ModernSelect from '@/components/shared/ModernSelect'
import ColumnSettingsPopover from '@/components/shared/ColumnSettingsPopover'
import ResetButton from '@/components/shared/ResetButton'
import { useTranslation } from 'react-i18next'
import { CustomerGroupModal, PercentBadge, StatusBadge, type CustomerGroup, HeaderActionsGroup, AddButton, ExportButton, TableToolbar } from '@/components/common'
import { getCustomerGroupDisplayName, getCustomerGroupDisplayDescription } from './utils/customerGroupFormatters'

interface CustomerGroupsPageProps {
  isTab?: boolean
  onRegisterActions?: (actions: { openAdd: () => void; exportData: () => void }) => void
}

const CustomerGroupsPage: React.FC<CustomerGroupsPageProps> = ({ isTab = false, onRegisterActions }) => {
  const { t, i18n } = useTranslation(['customers', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset: resetPagination,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'customergroups' })

  // Bulk selection states
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerGroup | null>(null)
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    description: true,
    discount: true,
    status: true,
    actions: true,
  })

  // Filters & Sorting state
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['customer-groups', page, debouncedSearch, perPage, statusFilter, sortBy, sortOrder],
    queryFn: () => customerService.groups({
      page,
      search: debouncedSearch,
      per_page: perPage,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sort_by: sortBy,
      sort_order: sortOrder
    }),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerService.deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-groups'] })
      toast.success(t('toast.deleted', { item: t('customers.customerGroups') }))
      setDeleteTarget(null)
      adjustAfterDelete(groups.length)
    },
    onError: () => {
      toast.error(t('toast.error'))
      setDeleteTarget(null)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => customerService.bulkDeleteGroups(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-groups'] })
      toast.success(t('toast.deleted', { item: `${selectedRows.length} ${t('customers.customerGroups', 'Customer Groups')}` }))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
      adjustAfterDelete(selectedRows.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to delete selected customer groups.'))
      setBulkDeleteConfirmOpen(false)
    }
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(groups.map((g) => g.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id])
    } else {
      setSelectedRows((prev) => prev.filter((i) => i !== id))
    }
  }

  const groups: CustomerGroup[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = React.useCallback(() => {
    setEditingGroup(null)
    setModalOpen(true)
  }, [])

  const openEditModal = (group: CustomerGroup) => {
    setEditingGroup(group)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingGroup(null)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
    }
    setPage(1)
  }

  const handleExport = () => {
    const infoId = toast.info(t('customers.toast.exportDownloading', 'Downloading customer groups data...'))
    setTimeout(() => {
      if (infoId) toast.dismiss(infoId)

      const titleText = t('customers.customerGroups', 'Customer Groups')
      const headers = [
        t('customers.id', 'ID'),
        t('customers.company', 'Company Name'),
        t('customers.groupName', 'Group Name'),
        t('customers.description', 'Description'),
        t('customers.discountPercent', 'Discount Percent (%)'),
        t('customers.status', 'Status'),
        t('customers.registeredAt', 'Created At')
      ]

      let tbodyHtml = ''
      groups.forEach(g => {
        const companyName = g.company?.name || (g.company_id ? `Company #${g.company_id}` : '—')
        const statusText = g.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')
        const statusClass = g.is_active ? 'badge-completed' : 'badge-cancelled'

        tbodyHtml += '<tr>' +
          '<td class="ref-cell">' + g.id + '</td>' +
          '<td>' + companyName + '</td>' +
          '<td><b>' + g.name + '</b></td>' +
          '<td>' + (g.description || '—') + '</td>' +
          '<td class="text-center">' + (g.discount_percent || 0) + '%</td>' +
          '<td class="text-center"><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
          '<td class="text-center">' + (g.created_at ? new Date(g.created_at).toLocaleDateString() : '—') + '</td>' +
          '</tr>'
      })

      const html = '<html>' +
        '<head>' +
        '<meta charset="utf-8" />' +
        '<style>' +
        '  table { border-collapse: collapse; width: 100%; font-family: "Segoe UI", Tahoma, Geneva, sans-serif; }' +
        '  .title-cell { background-color: #0f172a; color: #ffffff; font-size: 16pt; font-weight: bold; text-align: center; padding: 15px; }' +
        '  .subtitle-cell { background-color: #1e293b; color: #cbd5e1; font-size: 10pt; text-align: center; padding: 8px; font-style: italic; }' +
        '  th { background-color: #2563eb; color: #ffffff; font-weight: bold; font-size: 10pt; border: 1px solid #cbd5e1; padding: 10px; text-transform: uppercase; }' +
        '  td { border: 1px solid #e2e8f0; padding: 8px; font-size: 9.5pt; color: #334155; }' +
        '  tr:nth-child(even) { background-color: #f8fafc; }' +
        '  .text-center { text-align: center; }' +
        '  .ref-cell { font-family: monospace; font-weight: bold; color: #1e40af; }' +
        '  .badge { font-weight: bold; padding: 3px 8px; border-radius: 4px; display: inline-block; }' +
        '  .badge-completed { background-color: #d1fae5; color: #065f46; }' +
        '  .badge-cancelled { background-color: #fee2e2; color: #991b1b; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '  <table>' +
        '    <thead>' +
        '      <tr><th colspan="7" class="title-cell">ENTERPRISE POS - ' + titleText + '</th></tr>' +
        '      <tr><th colspan="7" class="subtitle-cell">Generated on: ' + new Date().toLocaleString() + ' | Total Records: ' + groups.length + '</th></tr>' +
        '      <tr>' +
        headers.map(h => '<th>' + h + '</th>').join('') +
        '      </tr>' +
        '    </thead>' +
        '    <tbody>' +
        tbodyHtml +
        '    </tbody>' +
        '  </table>' +
        '</body>' +
        '</html>'

      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
      const link = document.createElement("a")
      link.href = window.URL.createObjectURL(blob)
      link.download = `customer_groups_${new Date().toISOString().slice(0, 10)}.xls`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(t('customers.toast.exportSuccessGroups', 'Customer groups exported successfully.'))
    }, 800)
  }

  const handleResetFilters = () => {
    setStatusFilter('all')
    setSortBy('created_at')
    setSortOrder('desc')
    setSelectedRows([])
    resetPagination()
  }

  useEffect(() => {
    if (onRegisterActions) {
      onRegisterActions({
        openAdd: openCreateModal,
        exportData: handleExport,
      })
    }
  }, [onRegisterActions, groups])

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-1">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">{t('customers.customerGroups', 'Customer Groups')}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('common.showing', { from: pagination.from || 0, to: pagination.to || 0, total: pagination.total })}
            </p>
          </div>
          <HeaderActionsGroup>
            <ExportButton
              onClick={handleExport}
              label={t('customers.exportCsv', 'Export CSV')}
            />
            <AddButton
              onClick={openCreateModal}
              label={t('customers.addGroup', 'Add Customer Group')}
            />
          </HeaderActionsGroup>
        </div>
      )}

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder={t('customers.searchGroups', 'Search groups...')}
        onReset={handleResetFilters}
        leftActions={
          <ModernSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            options={[
              { value: 'all', label: `${t('common.status', 'Status')}: ${t('common.active', 'Active')} / ${t('common.inactive', 'Inactive')}` },
              { value: 'active', label: t('common.active', 'Active') },
              { value: 'inactive', label: t('common.inactive', 'Inactive') },
              { value: 'deleted', label: t('common.archived', 'Archived') }
            ]}
            className="w-52"
          />
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['customer-groups'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'id', label: t('customers.id', 'ID') },
          { key: 'name', label: t('customers.groupName', 'Group Name') },
          { key: 'description', label: t('customers.description', 'Description') },
          { key: 'discount', label: t('customers.discount', 'Discount') },
          { key: 'status', label: t('common.status', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={(cols: Record<string, boolean>) => setVisibleColumns(cols as any)}
      />

      {/* Bulk actions panel */}
      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium">
            <AlertCircle size={16} />
            <span>{selectedRows.length} {t('customers.selectedCount', t('common.selected', 'Selected'))}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBulkDeleteConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-xl hover:bg-red-500 cursor-pointer transition-colors shadow-xs"
            >
              <Trash2 size={13} />
              <span>{t('customers.deleteSelected', t('common.deleteSelected', 'Delete Selected'))}</span>
            </button>
            <button
              onClick={() => setSelectedRows([])}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 cursor-pointer"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <TableWrapper isFetching={isFetching}>
          <div className="overflow-x-auto">
            <table className="w-full data-table min-w-[800px]">
              <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
                <tr>
                  <th className="w-10 text-center !px-3">
                    <input
                      type="checkbox"
                      className="checkbox h-4 w-4 rounded border-border"
                      checked={groups.length > 0 && selectedRows.length === groups.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  {visibleColumns.id && (
                    <th onClick={() => handleSort('id')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.id', 'ID')} {renderSortIcon('id')}
                    </th>
                  )}
                  {visibleColumns.name && (
                    <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.groupName', 'Group Name')} {renderSortIcon('name')}
                    </th>
                  )}
                  {visibleColumns.description && (
                    <th onClick={() => handleSort('description')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.description', t('common.description', 'Description'))} {renderSortIcon('description')}
                    </th>
                  )}
                  {visibleColumns.discount && (
                    <th onClick={() => handleSort('discount_percent')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.discount', 'Discount')} {renderSortIcon('discount_percent')}
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th onClick={() => handleSort('is_active')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('common.status', 'Status')} {renderSortIcon('is_active')}
                    </th>
                  )}
                  {visibleColumns.actions && (
                    <th className="text-right p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">{t('customers.actions', t('common.actions', 'Actions'))}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="hover:bg-muted/5">
                      <td className="w-10 text-center !px-3"><div className="skeleton h-4 w-4 rounded mx-auto" /></td>
                      {visibleColumns.id && <td className="p-4"><div className="skeleton h-4 w-8 rounded" /></td>}
                      {visibleColumns.name && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                      {visibleColumns.description && <td className="p-4"><div className="skeleton h-4 w-40 rounded" /></td>}
                      {visibleColumns.discount && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                      {visibleColumns.status && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                      {visibleColumns.actions && <td className="p-4 text-right"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>}
                    </tr>
                  ))
                ) : groups.map((group) => {
                  const isSelected = selectedRows.includes(group.id)
                  return (
                    <tr key={group.id} className={`hover:bg-muted/10 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="w-10 text-center !px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="checkbox h-4 w-4 rounded border-border"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(group.id, e.target.checked)}
                        />
                      </td>
                      {visibleColumns.id && <td className="p-4 text-sm font-mono text-muted-foreground">{group.id}</td>}
                      {visibleColumns.name && (
                        <td className="p-4 font-semibold text-sm text-foreground">
                          <div>
                            <span>{getCustomerGroupDisplayName(group.name, t, i18n.language)}</span>
                            {i18n.language?.startsWith('km') && group.name !== getCustomerGroupDisplayName(group.name, t, i18n.language) && (
                              <p className="text-[11px] font-normal text-muted-foreground">{group.name}</p>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.description && (
                        <td className="p-4 text-sm text-muted-foreground">
                          {getCustomerGroupDisplayDescription(group.description, group.name, t, i18n.language)}
                        </td>
                      )}
                      {visibleColumns.discount && (
                        <td className="p-4 text-sm font-semibold text-foreground">
                          <PercentBadge value={group.discount_percent} />
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="p-4 text-sm">
                          <StatusBadge status={group.is_active ? 'active' : 'inactive'} />
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="p-4 text-right">
                          <TableActionMenu
                            onEdit={() => openEditModal(group)}
                            onDelete={() => setDeleteTarget(group)}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })}
                {!isLoading && groups.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Users size={36} className="mx-auto text-muted-foreground mb-3 opacity-30" />
                      <p className="text-muted-foreground">{t('common.noData', 'No data available')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        </TableWrapper>
      </div>

      {/* ─── Global Customer Group Modal ─── */}
      <CustomerGroupModal
        isOpen={modalOpen}
        onClose={closeModal}
        initialData={editingGroup}
      />

      {/* Single Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="customers.deleteGroupTitle"
        itemName={deleteTarget?.name}
        confirmText="common.confirmDelete"
        cancelText="common.cancel"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={t('customers.bulkDeleteGroupsTitle', 'Delete Selected Customer Groups')}
        message={t('customers.confirmBulkDeleteGroupsMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected customer groups? This action cannot be undone.`
        }).replace('{{count}}', String(selectedRows.length))}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={bulkDeleteMutation.isPending}
        onConfirm={() => bulkDeleteMutation.mutate(selectedRows)}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  )
}

export default CustomerGroupsPage
