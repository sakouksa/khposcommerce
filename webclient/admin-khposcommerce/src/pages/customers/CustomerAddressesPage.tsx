import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Trash2, MapPin, ChevronUp, ChevronDown, AlertCircle
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
import { Image as AntImage } from 'antd'
import { getCustomerAvatarUrl, DEFAULT_AVATAR_IMAGE } from '@/utils/image'
import { CustomerAddressModal, type CustomerAddress, HeaderActionsGroup, AddButton, ExportButton, TableToolbar } from '@/components/common'
import { CustomerAddressDetailDrawer } from './components/CustomerAddressDetailDrawer'

interface CustomerAddressesPageProps {
  isTab?: boolean
  onRegisterActions?: (actions: { openAdd: () => void; exportData: () => void }) => void
}

const getTranslatedAddressLabel = (label: string, t: any) => {
  const norm = (label || '').trim().toLowerCase()
  if (!label) return '—'
  if (norm === 'home') return t('customers.labelHome', 'Home')
  if (norm === 'office') return t('customers.labelOffice', 'Office')
  if (norm === 'warehouse') return t('customers.labelWarehouse', 'Warehouse')
  if (norm === 'other') return t('customers.labelOther', 'Other')
  if (norm === 'store' || norm === 'shop') return t('customers.labelStore', 'Store')
  if (norm === 'branch') return t('customers.labelBranch', 'Branch')
  if (norm === 'condo') return t('customers.labelCondo', 'Condo')
  if (norm === 'villa') return t('customers.labelVilla', 'Villa')
  if (norm === 'factory') return t('customers.labelFactory', 'Factory')
  if (norm === 'hotel') return t('customers.labelHotel', 'Hotel')
  if (norm === 'apartment') return t('customers.labelApartment', 'Apartment')
  if (norm === 'hq' || norm === 'headquarters') return t('customers.labelHQ', 'Headquarters')
  return label
}

const renderAddressLabelBadge = (label: string, t: any) => {
  if (!label) {
    return <span className="text-muted-foreground">—</span>
  }
  const text = getTranslatedAddressLabel(label, t)
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted/60 dark:bg-slate-800 text-foreground dark:text-slate-300 border border-border/70 dark:border-slate-700 whitespace-nowrap">
      {text}
    </span>
  )
}

const CustomerAddressesPage: React.FC<CustomerAddressesPageProps> = ({ isTab = false, onRegisterActions }) => {
  const { t } = useTranslation(['customers', 'common'])
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
  } = useServerPagination({ storageKey: 'customeraddresses' })

  // Bulk selection states
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)
  const [viewingAddress, setViewingAddress] = useState<CustomerAddress | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomerAddress | null>(null)

  // 6 Standard Columns
  const [visibleColumns, setVisibleColumns] = useState({
    customer: true,
    label: true,
    recipient: true,
    address: true,
    region: true,
    status: true,
    actions: true,
  })

  // Filters & Sorting state
  const [customerFilter, setCustomerFilter] = useState('')
  const [defaultFilter, setDefaultFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Queries
  const { data: customers } = useQuery({
    queryKey: ['customers-addresses-dropdown'],
    queryFn: () => customerService.list({ per_page: 200 }).then(r => r.data?.data ?? r.data ?? []),
  })

  const { data: addressesData, isLoading, isFetching } = useQuery({
    queryKey: ['customer-addresses', page, debouncedSearch, perPage, customerFilter, defaultFilter, sortBy, sortOrder],
    queryFn: () => customerService.addresses({
      page,
      search: debouncedSearch,
      per_page: perPage,
      customer_id: customerFilter !== 'all' ? customerFilter : undefined,
      is_default: defaultFilter === 'default' ? '1' : defaultFilter === 'secondary' ? '0' : undefined,
      sort_by: sortBy,
      sort_order: sortOrder
    }),
    placeholderData: (prev) => prev,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => customerService.deleteAddress(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-addresses'] })
      toast.success(t('toast.deleted', { item: t('customers.customerAddresses', 'Customer Address') }))
      setDeleteTarget(null)
      adjustAfterDelete(addresses.length)
    },
    onError: () => {
      toast.error(t('toast.error', 'Failed to delete customer address.'))
      setDeleteTarget(null)
    },
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => customerService.bulkDeleteAddresses(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-addresses'] })
      toast.success(t('toast.deleted', { item: `${selectedRows.length} ${t('customers.customerAddresses', 'Customer Addresses')}` }))
      setSelectedRows([])
      setBulkDeleteConfirmOpen(false)
      adjustAfterDelete(selectedRows.length)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error', 'Failed to delete selected customer addresses.'))
      setBulkDeleteConfirmOpen(false)
    }
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(addresses.map((a) => a.id).filter((id): id is number => typeof id === 'number'))
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

  const addresses: CustomerAddress[] = addressesData?.data ?? []
  const pagination = addressesData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = React.useCallback(() => {
    setEditingAddress(null)
    setModalOpen(true)
  }, [])

  const openEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingAddress(null)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
    }
    setPage(1)
  }

  const handleExport = React.useCallback(() => {
    const infoId = toast.info(t('customers.toast.exportDownloading', 'Downloading customer address data...'))
    setTimeout(() => {
      if (infoId) toast.dismiss(infoId)

      const titleText = t('customers.customerAddresses', 'Customer Addresses')
      const headers = [
        t('customers.id', 'ID'),
        t('customers.title', 'Customer'),
        t('customers.addressLabel', 'Address Label'),
        t('customers.recipient', 'Recipient Name'),
        t('customers.phone', 'Phone'),
        t('customers.streetAddress', 'Address'),
        t('customers.city', 'City'),
        t('customers.province', 'Province'),
        t('customers.country', 'Country'),
        t('customers.postalCode', 'Postal Code'),
        t('customers.defaultAddress', 'Default Address')
      ]

      let tbodyHtml = ''
      addresses.forEach(addr => {
        const customerName = addr.customer?.name || (addr.customer_id ? `Customer #${addr.customer_id}` : '—')
        const translatedLabel = getTranslatedAddressLabel(addr.label, t)
        const defaultText = addr.is_default ? t('common.yes', 'Yes') : t('common.no', 'No')

        tbodyHtml += '<tr>' +
          '<td class="ref-cell">' + addr.id + '</td>' +
          '<td><b>' + customerName + '</b></td>' +
          '<td class="text-center">' + translatedLabel + '</td>' +
          '<td>' + (addr.name || '—') + '</td>' +
          '<td>' + (addr.phone || '—') + '</td>' +
          '<td>' + (addr.address || '—') + '</td>' +
          '<td>' + (addr.city || '—') + '</td>' +
          '<td>' + (addr.province || '—') + '</td>' +
          '<td>' + (addr.country || '—') + '</td>' +
          '<td class="text-center">' + (addr.postal_code || '—') + '</td>' +
          '<td class="text-center">' + defaultText + '</td>' +
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
        '</style>' +
        '</head>' +
        '<body>' +
        '  <table>' +
        '    <thead>' +
        '      <tr><th colspan="11" class="title-cell">ENTERPRISE POS - ' + titleText + '</th></tr>' +
        '      <tr><th colspan="11" class="subtitle-cell">Generated on: ' + new Date().toLocaleString() + ' | Total Records: ' + addresses.length + '</th></tr>' +
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
      link.download = `customer_addresses_${new Date().toISOString().slice(0, 10)}.xls`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(t('customers.toast.exportSuccessAddresses', 'Customer addresses exported successfully.'))
    }, 800)
  }, [addresses, t, toast])

  const handleResetFilters = () => {
    setCustomerFilter('')
    setDefaultFilter('all')
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
  }, [onRegisterActions, openCreateModal, handleExport])

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-1">
          <div className="space-y-1 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">{t('customers.customerAddresses', 'Delivery Addresses')}</h1>
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
              label={t('customers.addAddress', 'Add Address')}
            />
          </HeaderActionsGroup>
        </div>
      )}

      {/* Filters row */}
      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder={t('customers.searchAddresses', 'Search addresses...')}
        onReset={handleResetFilters}
        leftActions={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Customer Filter */}
            <ModernSelect
              value={customerFilter}
              onChange={(val) => { setCustomerFilter(val); setPage(1); }}
              options={[
                { value: '', label: `${t('customers.title', 'Customer')}: ${t('common.allStatus', 'All')}` },
                ...(customers ?? []).map((c: any) => ({ value: String(c.id), label: c.name }))
              ]}
              className="w-52"
            />

            {/* Default/Secondary Filter */}
            <ModernSelect
              value={defaultFilter}
              onChange={(val) => { setDefaultFilter(val); setPage(1); }}
              options={[
                { value: 'all', label: `${t('common.status', 'Status')}: ${t('common.allStatus', 'All')}` },
                { value: 'default', label: t('customers.defaultAddress', 'Default Address') },
                { value: 'secondary', label: t('customers.secondaryAddress', 'Secondary Address') }
              ]}
              className="w-48"
            />
          </div>
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['customer-addresses'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'customer', label: t('customers.title', 'Customer') },
          { key: 'label', label: t('customers.addressLabel', 'Label') },
          { key: 'recipient', label: t('customers.recipientAndPhone', 'Recipient & Phone') },
          { key: 'address', label: t('customers.streetAddress', 'Address') },
          { key: 'region', label: t('customers.region', 'Region / Province') },
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

      {/* Customer Addresses Enterprise Table (6 Clean Columns) */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <TableWrapper isFetching={isFetching}>
          <div className="overflow-x-auto">
            <table className="w-full data-table min-w-[1000px]">
              <thead className="bg-muted/40 sticky top-0 border-b border-border z-10">
                <tr>
                  <th className="w-10 text-center !px-3">
                    <input
                      type="checkbox"
                      className="checkbox h-4 w-4 rounded border-border"
                      checked={addresses.length > 0 && selectedRows.length === addresses.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  {visibleColumns.customer && (
                    <th onClick={() => handleSort('customer_id')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.title', 'Customer')} {renderSortIcon('customer_id')}
                    </th>
                  )}
                  {visibleColumns.label && (
                    <th onClick={() => handleSort('label')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.addressLabel', 'Label')} {renderSortIcon('label')}
                    </th>
                  )}
                  {visibleColumns.recipient && (
                    <th onClick={() => handleSort('name')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.recipientAndPhone', 'Recipient & Phone')} {renderSortIcon('name')}
                    </th>
                  )}
                  {visibleColumns.address && (
                    <th onClick={() => handleSort('address')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.streetAddress', 'Address')} {renderSortIcon('address')}
                    </th>
                  )}
                  {visibleColumns.region && (
                    <th className="text-left p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none">
                      {t('customers.region', 'Region / Province')}
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th onClick={() => handleSort('is_default')} className="text-left cursor-pointer hover:bg-muted/65 p-4 text-xs font-semibold uppercase text-muted-foreground tracking-wider select-none whitespace-nowrap">
                      {t('common.status', 'Status')} {renderSortIcon('is_default')}
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
                      {visibleColumns.customer && <td className="p-4"><div className="skeleton h-4 w-32 rounded" /></td>}
                      {visibleColumns.label && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                      {visibleColumns.recipient && <td className="p-4"><div className="skeleton h-4 w-28 rounded" /></td>}
                      {visibleColumns.address && <td className="p-4"><div className="skeleton h-4 w-40 rounded" /></td>}
                      {visibleColumns.region && <td className="p-4"><div className="skeleton h-4 w-36 rounded" /></td>}
                      {visibleColumns.status && <td className="p-4"><div className="skeleton h-4 w-16 rounded" /></td>}
                      {visibleColumns.actions && <td className="p-4 text-right"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>}
                    </tr>
                  ))
                ) : addresses.map((addr) => {
                  const isSelected = typeof addr.id === 'number' ? selectedRows.includes(addr.id) : false
                  const customerName = addr.customer?.name || (addr.customer_id ? `Customer #${addr.customer_id}` : '—')
                  return (
                    <tr
                      key={addr.id}
                      onClick={() => setViewingAddress(addr)}
                      className={`hover:bg-muted/10 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                    >
                      <td className="w-10 text-center !px-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="checkbox h-4 w-4 rounded border-border"
                          checked={isSelected}
                          onChange={(e) => addr.id && handleSelectRow(addr.id, e.target.checked)}
                        />
                      </td>

                      {/* 1. Customer */}
                      {visibleColumns.customer && (
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-primary/20 shadow-2xs cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <AntImage
                                src={getCustomerAvatarUrl(addr.customer?.photo || addr.customer?.avatar, addr.customer?.id || addr.customer_id || customerName)}
                                alt={customerName}
                                className="w-full h-full object-cover"
                                {...({ wrapperClassName: 'w-full h-full !flex items-center justify-center cursor-pointer' } as any)}
                                preview={{ mask: null }}
                                fallback={DEFAULT_AVATAR_IMAGE}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">
                                {customerName}
                              </div>
                              {addr.customer?.email && (
                                <div className="text-[11px] text-muted-foreground font-mono truncate">
                                  {addr.customer.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      )}

                      {/* 2. Label */}
                      {visibleColumns.label && (
                        <td className="p-4 text-sm">
                          {renderAddressLabelBadge(addr.label, t)}
                        </td>
                      )}

                      {/* 3. Recipient & Phone */}
                      {visibleColumns.recipient && (
                        <td className="p-4">
                          <div className="font-semibold text-sm text-foreground">{addr.name || '—'}</div>
                          {addr.phone && (
                            <div className="text-xs text-muted-foreground font-mono mt-0.5">
                              {addr.phone}
                            </div>
                          )}
                        </td>
                      )}

                      {/* 4. Address */}
                      {visibleColumns.address && (
                        <td className="p-4 text-sm text-muted-foreground max-w-[240px] truncate" title={addr.address}>
                          <span className="font-medium text-foreground/90">{addr.address || '—'}</span>
                        </td>
                      )}

                      {/* 5. Region / Province / Country */}
                      {visibleColumns.region && (
                        <td className="p-4 text-sm text-muted-foreground">
                          <div>{[addr.city, addr.province].filter(Boolean).join(', ') || '—'}</div>
                          <div className="text-[11px] text-muted-foreground/75 mt-0.5">
                            {addr.country || 'Cambodia'} {addr.postal_code ? `(${addr.postal_code})` : ''}
                          </div>
                        </td>
                      )}

                      {/* 6. Status */}
                      {visibleColumns.status && (
                        <td className="p-4 text-sm whitespace-nowrap">
                          {addr.is_default ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                              {t('customers.defaultAddress', 'Default Address')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/60 text-muted-foreground border border-border/60 whitespace-nowrap">
                              {t('customers.secondaryAddress', 'Secondary Address')}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <TableActionMenu
                            onView={() => setViewingAddress(addr)}
                            onEdit={() => openEditModal(addr)}
                            onDelete={() => setDeleteTarget(addr)}
                          />
                        </td>
                      )}
                    </tr>
                  )
                })}
                {!isLoading && addresses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <MapPin size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-muted-foreground font-medium">{t('common.noData', 'No data available')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TableWrapper>

        <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* ─── Detail Drawer for Address ─── */}
      <CustomerAddressDetailDrawer
        address={viewingAddress}
        isOpen={!!viewingAddress}
        onClose={() => setViewingAddress(null)}
        onEdit={openEditModal}
      />

      {/* ─── Global Customer Address Modal ─── */}
      <CustomerAddressModal
        isOpen={modalOpen}
        onClose={closeModal}
        initialData={editingAddress}
      />

      {/* Single Delete Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="customers.deleteAddressTitle"
        itemName={deleteTarget?.label ? `${deleteTarget.label} (${deleteTarget.address || deleteTarget.name || ''})` : deleteTarget?.name || deleteTarget?.address}
        confirmText="common.confirmDelete"
        cancelText="common.cancel"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && typeof deleteTarget.id === 'number' && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk Delete Dialog */}
      <ConfirmDialog
        open={bulkDeleteConfirmOpen}
        title={t('customers.bulkDeleteAddressesTitle', 'Delete Selected Addresses')}
        message={t('customers.confirmBulkDeleteAddressesMessage', {
          count: selectedRows.length,
          defaultValue: `Are you sure you want to delete ${selectedRows.length} selected addresses? This action cannot be undone.`
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

export default CustomerAddressesPage
