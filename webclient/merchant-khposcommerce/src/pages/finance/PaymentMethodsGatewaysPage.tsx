import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import { usePermission } from '@/hooks/usePermission'
import { useServerPagination } from '@/hooks/useServerPagination'
import { downloadCsv } from '@/utils/export'
import Breadcrumb from '@/components/common/Breadcrumb'
import {
  HeaderActionsGroup,
  AddButton,
  ExportButton,
  TableToolbar,
  ModernSelect,
  ConfirmModal,
} from '@/components/common'
import Pagination from '@/components/shared/Pagination'
import type { PaymentMethodForm } from './types/finance.types'
import {
  PaymentMethodStatsCards,
  PaymentMethodFormDrawer,
  PaymentMethodsGatewaysTable,
} from './components'

export const PaymentMethodsGatewaysPage: React.FC = () => {
  const { t } = useTranslation(['finance', 'common', 'nav'])
  const qc = useQueryClient()
  const toast = useToast()
  const { hasPermission } = usePermission()

  // Permissions
  const canCreatePaymentMethod = hasPermission('payment_method.create')
  const canUpdatePaymentMethod = hasPermission('payment_method.update')
  const canDeletePaymentMethod = hasPermission('payment_method.delete')

  // Pagination & Search
  const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'finance_payment_methods' })

  // Filters
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  // Visible Columns
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    pm_name: true,
    pm_code: true,
    pm_type: true,
    pm_fee: true,
    pm_channels: true,
    pm_status: true,
  })

  // Drawer & Form State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [paymentMethodForm, setPaymentMethodForm] = useState<PaymentMethodForm>({
    name: '',
    code: '',
    type: 'cash',
    fee_percent: '0.00',
    fee_fixed: '0.00',
    available_pos: true,
    available_online: true,
    is_active: true,
  })

  // Delete Confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name?: string }>({
    open: false,
    id: null,
    name: '',
  })

  // Query
  const {
    data: paymentMethodsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['payment-methods-tab', page, debouncedSearch, perPage, filterStatus, filterType],
    queryFn: () =>
      financeService.getPaymentMethods({
        page,
        search: debouncedSearch,
        per_page: perPage,
        status: filterStatus || undefined,
        type: filterType || undefined,
      }),
    placeholderData: (prev) => prev,
  })

  const paymentMethods = paymentMethodsData?.data ?? []
  const pagination = paymentMethodsData?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (payload: PaymentMethodForm) => {
      if (editingItem) {
        return financeService.updatePaymentMethod(editingItem.id, payload)
      } else {
        return financeService.createPaymentMethod({ ...payload, company_id: 1 })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })
      toast.success(editingItem ? t('finance.update_success', 'Updated successfully.') : t('finance.save_success', 'Saved successfully.'))
      setDrawerOpen(false)
      setEditingItem(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.save_error', 'Failed to save details.'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deletePaymentMethod(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })
      toast.success(t('finance.delete_success', 'Record deleted successfully.'))
      setDeleteConfirm({ open: false, id: null, name: '' })
      adjustAfterDelete(1)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('finance.delete_error', 'Failed to delete record.'))
    },
  })

  const togglePaymentMethodStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      financeService.updatePaymentMethod(id, { is_active: active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })
      toast.success(t('common.saveSuccess', 'Status updated.'))
    },
    onError: () => toast.error(t('finance.save_error', 'Failed to update status.')),
  })

  // Handlers
  const openCreateDrawer = () => {
    setEditingItem(null)
    setPaymentMethodForm({
      name: '',
      code: '',
      type: 'cash',
      fee_percent: '0.00',
      fee_fixed: '0.00',
      available_pos: true,
      available_online: true,
      is_active: true,
    })
    setDrawerOpen(true)
  }

  const openEditDrawer = (item: any) => {
    setEditingItem(item)
    setPaymentMethodForm({
      name: item.name || '',
      code: item.code || '',
      type: item.type || 'cash',
      fee_percent: String(item.fee_percent ?? '0.00'),
      fee_fixed: String(item.fee_fixed ?? '0.00'),
      available_pos: Boolean(item.available_pos ?? true),
      available_online: Boolean(item.available_online ?? true),
      is_active: Boolean(item.is_active ?? true),
    })
    setDrawerOpen(true)
  }

  const handleExportCsv = () => {
    const toastId = toast.loading(t('finance.exporting', 'Exporting CSV dataset...'))
    setTimeout(() => {
      try {
        const headers = [
          t('finance.method_name', 'Method Name'),
          t('finance.code_col', 'Code'),
          t('finance.type_col', 'Type'),
          t('finance.fee_col', 'Fees'),
          t('finance.status_col', 'Status'),
        ]
        const rows = (paymentMethods || []).map((pm: any) => [
          pm.name || '',
          pm.code || '',
          t(`finance.pm_type_${pm.type || 'cash'}`, pm.type || 'Cash'),
          Number(pm.fee_percent) === 0 && Number(pm.fee_fixed) === 0
            ? t('finance.fee_free', 'Free')
            : `${Number(pm.fee_percent) || 0}% + $${Number(pm.fee_fixed || 0).toFixed(2)}`,
          pm.is_active ? t('finance.status_active', 'Active') : t('finance.status_inactive', 'Inactive'),
        ])
        downloadCsv('finance_payment_methods', headers, rows)
        toast.dismiss(toastId)
        toast.success(t('finance.export_success', 'Dataset exported successfully.'))
      } catch {
        toast.dismiss(toastId)
        toast.error(t('finance.export_error', 'Failed to export dataset.'))
      }
    }, 300)
  }

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          { label: t('nav.financeManagement', t('finance.financial_management', 'Finance')), path: '/finance/expenses' },
          { label: t('finance.payment_methods_title', 'Payment Methods') },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t('finance.payment_methods_title', 'Payment Methods')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t('finance.payment_methods_subtitle', 'Configure payment channels (POS / Online), merchant fee structures, and active gateways.')}
          </p>
        </div>
        <HeaderActionsGroup>
          <ExportButton
            onClick={handleExportCsv}
            label={t('finance.export_csv', 'Export CSV')}
          />
          {canCreatePaymentMethod && (
            <AddButton
              onClick={openCreateDrawer}
              label={t('finance.add_payment_method', 'Add Method')}
            />
          )}
        </HeaderActionsGroup>
      </div>

      {/* Stats Cards */}
      <PaymentMethodStatsCards
        methods={paymentMethods}
        isLoading={isLoading}
      />

      {/* Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(1)
        }}
        searchPlaceholder={t('finance.search_payment_methods', 'Search payment methods...')}
        filterContent={
          <div className="flex items-center gap-2">
            <ModernSelect
              value={filterType}
              onChange={(val) => {
                setFilterType(String(val ?? ''))
                setPage(1)
              }}
              options={[
                { value: '', label: `${t('finance.filter_type', t('common.type', 'Type'))}: ${t('finance.all_types', t('common.all', 'All'))}` },
                { value: 'cash', label: t('finance.pm_type_cash', 'Cash') },
                { value: 'bank_transfer', label: t('finance.pm_type_bank', 'Bank Transfer') },
                { value: 'e_wallet', label: t('finance.pm_type_ewallet', 'E-Wallet') },
                { value: 'card', label: t('finance.pm_type_card', 'Credit/Debit Card') },
                { value: 'qr_code', label: t('finance.pm_type_qr', 'KHQR / QR Code') },
              ]}
              className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
            />
            <ModernSelect
              value={filterStatus}
              onChange={(val) => {
                setFilterStatus(String(val ?? ''))
                setPage(1)
              }}
              options={[
                { value: '', label: `${t('finance.filter_status', t('common.status', 'Status'))}: ${t('finance.all_status', t('common.all', 'All'))}` },
                { value: 'active', label: t('finance.status_active', 'Active') },
                { value: 'inactive', label: t('finance.status_inactive', 'Inactive') },
              ]}
              className="w-36 sm:w-44 xl:w-48 min-w-[130px]"
            />
          </div>
        }
        onRefresh={() => qc.invalidateQueries({ queryKey: ['payment-methods-tab'] })}
        refreshLoading={isFetching}
        columns={[
          { key: 'pm_name', label: t('finance.method_name', 'Method Name') },
          { key: 'pm_code', label: t('finance.code_col', 'Code') },
          { key: 'pm_type', label: t('finance.type_col', 'Type') },
          { key: 'pm_fee', label: t('finance.fee_col', 'Fee') },
          { key: 'pm_channels', label: t('finance.channels_col', 'Channels') },
          { key: 'pm_status', label: t('finance.status_col', 'Status') },
        ]}
        visibleColumns={visibleColumns}
        onColumnChange={setVisibleColumns}
      />

      {/* Main Table */}
      <PaymentMethodsGatewaysTable
        methods={paymentMethods}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={visibleColumns}
        openEditDrawer={canUpdatePaymentMethod ? openEditDrawer : undefined}
        handleDelete={canDeletePaymentMethod ? (id, name) => setDeleteConfirm({ open: true, id, name }) : undefined}
        toggleStatus={
          canUpdatePaymentMethod
            ? (method) =>
                togglePaymentMethodStatusMutation.mutate({
                  id: method.id,
                  active: !method.is_active,
                })
            : undefined
        }
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      {/* Form Drawer */}
      <PaymentMethodFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingItem={editingItem}
        onSubmit={() => saveMutation.mutate(paymentMethodForm)}
        isPending={saveMutation.isPending}
        paymentMethodForm={paymentMethodForm}
        setPaymentMethodForm={setPaymentMethodForm}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteConfirm.open}
        variant="danger"
        actionType="delete"
        title={t('finance.delete_confirm_title', 'Delete Record')}
        message={t('finance.delete_confirm_msg', 'Are you sure you want to delete this record? This action cannot be undone.')}
        itemName={deleteConfirm.name}
        confirmText={t('common.confirmDelete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.id && deleteMutation.mutate(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: null, name: '' })}
      />
    </div>
  )
}

export const FinancePaymentMethodsPage = PaymentMethodsGatewaysPage
export default PaymentMethodsGatewaysPage
