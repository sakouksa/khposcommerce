import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, RefreshCw, X, CreditCard, Loader2, DollarSign } from 'lucide-react'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import TableActionMenu from '@/components/shared/TableActionMenu'
import { Modal, TableToolbar } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { useTranslation } from 'react-i18next'
import PaymentMethodsTab from '@/pages/finance/components/PaymentMethodsTab'

interface PaymentMethod {
  id: number
  name: string
  code: string
  type: string
  fee_percent: number
  fee_fixed: number
  is_active: boolean
  available_pos: boolean
  available_online: boolean
  description?: string
}

const emptyForm = {
  name: '',
  code: '',
  type: 'cash',
  fee_percent: 0,
  fee_fixed: 0,
  is_active: true,
  available_pos: true,
  available_online: false,
  description: '',
}

const PaymentMethodsPage: React.FC<{ triggerAdd?: boolean; isTab?: boolean }> = ({ triggerAdd, isTab = false }) => {
  const { t } = useTranslation('payments')
  const { page, setPage, perPage, setPerPage, search, setSearch, debouncedSearch, reset, adjustAfterDelete } = useServerPagination({ storageKey: 'payment_methods' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
  
  // Form fields
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState('cash')
  const [feePercent, setFeePercent] = useState('0.00')
  const [feeFixed, setFeeFixed] = useState('0.00')
  const [isActive, setIsActive] = useState(true)
  const [availablePos, setAvailablePos] = useState(true)
  const [availableOnline, setAvailableOnline] = useState(true)

  const qc = useQueryClient()
  const toast = useToast()

  React.useEffect(() => {
    if (triggerAdd) {
      openCreateModal()
    }
  }, [triggerAdd])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['payment-methods', page, debouncedSearch, perPage],
    queryFn: () => financeService.getPaymentMethods({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (newMethod: any) => financeService.createPaymentMethod(newMethod),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success(t('toast.created', { item: t('nav.paymentMethods') }))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => financeService.updatePaymentMethod(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success(t('toast.updated', { item: t('nav.paymentMethods') }))
      closeModal()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('toast.error'))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => financeService.deletePaymentMethod(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success(t('toast.deleted', { item: t('nav.paymentMethods') }))
      setDeleteTarget(null)
      adjustAfterDelete(methods.length)
    },
    onError: () => {
      toast.error(t('toast.error'))
      setDeleteTarget(null)
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => financeService.togglePaymentMethodStatus(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
      toast.success(t('toast.saved'))
    },
    onError: () => {
      toast.error(t('toast.error'))
    },
  })

  const methods: PaymentMethod[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingMethod(null)
    setName('')
    setCode('')
    setType('cash')
    setFeePercent('0.00')
    setFeeFixed('0.00')
    setIsActive(true)
    setAvailablePos(true)
    setAvailableOnline(true)
    setModalOpen(true)
  }

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method)
    setName(method.name)
    setCode(method.code)
    setType(method.type || 'cash')
    setFeePercent(String(method.fee_percent ?? '0.00'))
    setFeeFixed(String(method.fee_fixed ?? '0.00'))
    setIsActive(!!method.is_active)
    setAvailablePos(!!method.available_pos)
    setAvailableOnline(!!method.available_online)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingMethod(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const payload = {
      name,
      code,
      type,
      fee_percent: Number(feePercent),
      fee_fixed: Number(feeFixed),
      is_active: isActive,
      available_pos: availablePos,
      available_online: availableOnline,
    }

    if (editingMethod) {
      updateMutation.mutate({ id: editingMethod.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">{t('nav.paymentMethods')}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t('common.showing', { from: pagination.from || 0, to: pagination.to || 0, total: pagination.total })}
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 shadow-sm cursor-pointer font-semibold">
            <Plus size={16} />
            {t('common.add')}
          </button>
        </div>
      )}

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1) }}
        searchPlaceholder={t('finance.search_payment_methods', 'Search payment methods...')}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['payment-methods'] })}
        refreshLoading={isFetching}
      />

      <PaymentMethodsTab
        methods={methods}
        isLoading={isLoading}
        isFetching={isFetching}
        visibleColumns={{
          pm_name: true,
          pm_code: true,
          pm_type: true,
          pm_fee: true,
          pm_channels: true,
          pm_status: true,
        }}
        openEditDrawer={openEditModal}
        handleDelete={(id) => setDeleteTarget(methods.find((m) => m.id === id) || null)}
        toggleStatus={(method) => toggleStatusMutation.mutate({ id: method.id, active: !method.is_active })}
      />
      <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} total={pagination.total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />


      <Modal
        isOpen={modalOpen}
        title={editingMethod ? t('finance.edit_payment_method', 'Edit Payment Method') : t('finance.add_payment_method', 'Add Payment Method')}
        subtitle={t('finance.payment_method_subtitle', 'Configure payment gateway parameters and transaction processing fees')}
        icon={<CreditCard size={20} />}
        iconVariant="emerald"
        size="lg"
        onClose={closeModal}
        footer={
          <ModalFooter
            onCancel={closeModal}
            cancelLabel={t('common.cancel', 'Cancel')}
            onSubmit={(e) => { if (e?.preventDefault) e.preventDefault(); handleSubmit(e as any); }}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            isEdit={!!editingMethod}
            submitLabel={editingMethod ? t('finance.update_method', 'Update Method') : t('finance.create_method', 'Create Method')}
          />
        }
      >
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.method_name', t('common.name'))} <span className="text-rose-500">*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Bank Transfer, ABA Mobile, Cash on Delivery"
              className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.method_code', 'Method Code')} <span className="text-rose-500">*</span></label>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                placeholder="e.g. bank_transfer, aba_mobile"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-xs text-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.gateway_type', 'Gateway Type')} <span className="text-rose-500">*</span></label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer capitalize"
                required
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="ewallet">E-Wallet</option>
                <option value="qris">QR / QRIS</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.fee_percent', 'Transaction Fee (%)')}</label>
              <input
                type="number"
                step="0.01"
                value={feePercent}
                onChange={e => setFeePercent(e.target.value)}
                placeholder="e.g. 1.50"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/90 mb-1.5">{t('finance.fee_fixed', 'Fixed Fee ($)')}</label>
              <input
                type="number"
                step="0.01"
                value={feeFixed}
                onChange={e => setFeeFixed(e.target.value)}
                placeholder="e.g. 0.25"
                className="w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-foreground">{t('finance.status_active', t('common.active'))}</p>
                <p className="text-[11px] text-muted-foreground">{t('finance.pm_active_desc', 'Enable this payment method in the system')}</p>
              </div>
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="availablePos"
                  checked={availablePos}
                  onChange={e => setAvailablePos(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                />
                <label htmlFor="availablePos" className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground">{t('finance.pos_channel', 'POS Channel')}</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="availableOnline"
                  checked={availableOnline}
                  onChange={e => setAvailableOnline(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                />
                <label htmlFor="availableOnline" className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground">{t('finance.online_store', 'Online Store')}</label>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('confirm.deleteTitle', { item: 'Payment Method' })}
        message={t('confirm.deleteMessage', { item: 'Payment Method', name: deleteTarget?.name })}
        confirmText={t('confirm.confirmDelete')}
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default PaymentMethodsPage
