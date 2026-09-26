import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  RotateCcw,
  Check,
  Search,
  Loader2,
  Package,
  DollarSign,
  User,
  Phone,
  CheckCircle2,
} from 'lucide-react'
import { EnterpriseModal, ModalFooter, FieldError } from '@/components/common'
import { orderService } from '@/services/orderService'
import { orderReturnService } from '@/services/orderReturnService'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { GlobalFormat } from '@/utils/formatters'
import type { ReturnFault } from '@/types/orderReturn.types'

interface CreateOrderReturnModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium dark:[color-scheme:dark]'

const labelCls =
  'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'

const selectCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium cursor-pointer'

const textareaCls =
  'w-full min-h-[70px] px-3.5 py-2.5 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/60 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'

export const CreateOrderReturnModal: React.FC<CreateOrderReturnModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation(['returns', 'orders', 'sales', 'common'])
  const toast = useToast()
  const queryClient = useQueryClient()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Form states
  const [orderNumber, setOrderNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [returnType, setReturnType] = useState<'return' | 'exchange'>('return')
  const [fault, setFault] = useState<ReturnFault>('customer')
  const [reasonCode, setReasonCode] = useState('changed_mind')
  const [estimatedRefund, setEstimatedRefund] = useState<number>(0)
  const [reasonNotes, setReasonNotes] = useState('')
  const [orderError, setOrderError] = useState('')

  // Autocomplete search state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  // Reset states on modal open / close
  useEffect(() => {
    if (!isOpen) {
      setOrderNumber('')
      setCustomerName('')
      setCustomerPhone('')
      setReturnType('return')
      setFault('customer')
      setReasonCode('changed_mind')
      setEstimatedRefund(0)
      setReasonNotes('')
      setSelectedOrder(null)
      setIsDropdownOpen(false)
      setOrderError('')
    }
  }, [isOpen])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search orders via API
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['orders-quick-search', orderNumber],
    queryFn: () => orderService.list({ search: orderNumber.trim(), per_page: 6 }),
    enabled: isOpen && orderNumber.trim().length >= 1 && !selectedOrder,
    staleTime: 10000,
  })

  const ordersList: any[] = searchResults?.data || []

  // Auto-fill when selecting an order from autocomplete
  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order)
    setOrderNumber(order.order_number || '')
    setIsDropdownOpen(false)

    // 1. Auto-fill Customer Name
    const name =
      order.customer?.name ||
      order.customer_name ||
      order.shipping_address?.full_name ||
      order.billing_address?.full_name ||
      ''
    setCustomerName(name)

    // 2. Auto-fill Customer Phone
    const phone =
      order.customer?.phone ||
      order.customer_phone ||
      order.shipping_address?.phone ||
      order.billing_address?.phone ||
      ''
    setCustomerPhone(phone)

    // 3. Auto-fill Estimated Refund (Total of the order)
    const refundVal = Number(order.grand_total ?? order.total ?? order.paid_amount ?? 0)
    setEstimatedRefund(refundVal)

    toast.info(t('returns.autoFillApplied', 'បានបំពេញព័ត៌មាន Order ដោយស្វ័យប្រវត្តិ'))
  }

  // Create Return Mutation
  const createMutation = useMutation({
    mutationFn: (payload: Record<string, any>) => orderReturnService.create(payload),
    onSuccess: () => {
      toast.success(t('createSuccess', 'Return request created successfully.'))
      queryClient.invalidateQueries({ queryKey: ['order-returns'] })
      onSuccess?.()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || t('common.error', 'An error occurred'))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) {
      setOrderError(t('orderNumberRequired', 'Please specify order or receipt number.'))
      focusFirstInvalidField({ orderNumber: 'required' })
      return
    }

    const payload: Record<string, any> = {
      order_number: orderNumber.trim(),
      customer_name: customerName.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      type: returnType,
      fault: fault,
      reason_code: reasonCode,
      reason_notes: reasonNotes.trim() || undefined,
      refund_method: 'original_payment',
      channel: selectedOrder?.channel || 'admin',
    }

    if (selectedOrder) {
      payload.order_id = selectedOrder.id
      if (selectedOrder.items && selectedOrder.items.length > 0) {
        payload.items = selectedOrder.items.map((item: any) => ({
          order_item_id: item.id,
          quantity: Number(item.quantity) || 1,
        }))
      }
    }

    createMutation.mutate(payload)
  }

  return (
    <EnterpriseModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('createReturn', 'Create Return Request')}
      subtitle={t('createReturnSubtitle', 'Initiate reverse logistics RMA for an order or POS sale receipt')}
      icon={<RotateCcw size={18} />}
      iconVariant="blue"
      size="2xl"
      footer={
        <ModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          cancelLabel={t('cancel', 'បោះបង់')}
          submitLabel={t('createReturn', 'Create Return Request')}
          isSubmitting={createMutation.isPending}
          submitVariant="primary"
          submitIcon={<Check size={14} strokeWidth={2.5} />}
        />
      }
    >
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
        {/* ROW 1: Order Number with Autocomplete & Return Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative" ref={dropdownRef}>
            <label className={labelCls}>
              {t('orderNumber', 'Order / Invoice #')} <span className="text-rose-500 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value)
                  if (orderError) setOrderError('')
                  if (selectedOrder && e.target.value !== selectedOrder.order_number) {
                    setSelectedOrder(null)
                  }
                  setIsDropdownOpen(true)
                }}
                onFocus={() => {
                  if (orderNumber.trim().length >= 1 && !selectedOrder) {
                    setIsDropdownOpen(true)
                  }
                }}
                placeholder={t('orderNumberPlaceholder', 'e.g. ORD-2026-001 or POS-882')}
                className={`${inputCls} font-mono pr-8 ${orderError ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                {isSearching ? (
                  <Loader2 size={14} className="animate-spin text-primary" />
                ) : selectedOrder ? (
                  <CheckCircle2 size={15} className="text-emerald-500" />
                ) : (
                  <Search size={14} className="opacity-50" />
                )}
              </div>
            </div>
            <FieldError error={orderError} />

            {/* Smart Autocomplete Dropdown */}
            {isDropdownOpen && !selectedOrder && orderNumber.trim().length >= 1 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-card dark:bg-slate-900 border border-border dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 size={13} className="animate-spin text-primary" />
                    <span>{t('searching', 'ស្វែងរកវិក្កយបត្រ...')}</span>
                  </div>
                ) : ordersList.length > 0 ? (
                  ordersList.map((ord) => {
                    const custName =
                      ord.customer?.name ||
                      ord.shipping_address?.full_name ||
                      t('common.guest', 'Guest')
                    const totalVal = Number(ord.grand_total ?? ord.total ?? ord.paid_amount ?? 0)
                    return (
                      <div
                        key={ord.id}
                        onClick={() => handleSelectOrder(ord)}
                        className="px-3 py-2.5 hover:bg-muted/60 dark:hover:bg-slate-800/80 cursor-pointer transition-colors border-b border-border/40 last:border-0 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-semibold text-primary font-mono flex items-center gap-1.5">
                            <Package size={12} className="text-muted-foreground" />
                            {ord.order_number}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="truncate max-w-[130px]">{custName}</span>
                            {ord.created_at && (
                              <span className="text-[10px] text-muted-foreground/80">
                                • {GlobalFormat.date(ord.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {GlobalFormat.currency(totalVal, 'USD')}
                          </span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    {t('noOrdersFound', 'រកមិនឃើញ Order ស្រដៀងគ្នានេះទេ (អ្នកអាចវាយបញ្ចូលផ្ទាល់)')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>
              {t('returnType', 'Return Type')}
            </label>
            <select
              value={returnType}
              onChange={(e) => setReturnType(e.target.value as 'return' | 'exchange')}
              className={selectCls}
            >
              <option value="return">{t('returns', 'Standard Return & Refund')}</option>
              <option value="exchange">{t('exchanges', 'Item Replacement / Exchange')}</option>
            </select>
          </div>
        </div>

        {/* ROW 2: Customer Name & Phone (Auto-filled or editable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              {t('customer', 'Customer Name')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t('customerPlaceholder', 'e.g. Sokha Chea')}
                className={`${inputCls} pl-8`}
              />
              <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              {t('phone', 'Phone Number')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder={t('phonePlaceholder', '012 345 678')}
                className={`${inputCls} font-mono pl-8`}
              />
              <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ROW 3: Fault Allocation & Return Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              {t('fault', 'Fault Allocation')}
            </label>
            <select
              value={fault}
              onChange={(e) => setFault(e.target.value as ReturnFault)}
              className={selectCls}
            >
              <option value="customer">{t('customerFault', 'Customer Fault (Fee / Customer Shipping)')}</option>
              <option value="store">{t('storeFault', 'Store Fault (Free return & fee waived)')}</option>
              <option value="courier">{t('courierFault', 'Courier Fault (Damaged in transit)')}</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>
              {t('reason', 'Return Reason')}
            </label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className={selectCls}
            >
              <option value="changed_mind">{t('reasons.changed_mind', 'Changed Mind / No Longer Needed')}</option>
              <option value="wrong_size">{t('reasons.wrong_size', 'Wrong Variant / Spec Selected')}</option>
              <option value="defective">{t('reasons.defective', 'Defective / Hardware Failure')}</option>
              <option value="damaged_shipping">{t('reasons.damaged_shipping', 'Damaged in Shipping Transit')}</option>
              <option value="wrong_item_sent">{t('reasons.wrong_item_sent', 'Wrong Item Sent by Store')}</option>
            </select>
          </div>
        </div>

        {/* ROW 4: Estimated Refund Amount */}
        <div>
          <label className={labelCls}>
            {t('estimatedRefund', 'Estimated Refund Amount ($)')}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={estimatedRefund}
              onChange={(e) => setEstimatedRefund(parseFloat(e.target.value) || 0)}
              className={`${inputCls} font-mono pl-8`}
            />
            <DollarSign size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
          </div>
          {selectedOrder && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 size={12} />
              <span>{t('returns.autoCalculatedNotice', 'ទឹកប្រាក់ត្រូវបានបំពេញតាមតម្លៃសរុបនៃវិក្កយបត្រ (អាចកែប្រែបាន)')}</span>
            </p>
          )}
        </div>

        {/* ROW 5: Detailed Notes */}
        <div>
          <label className={labelCls}>
            {t('reasonNotes', 'Detailed Reason / Notes')}
          </label>
          <textarea
            rows={3}
            value={reasonNotes}
            onChange={(e) => setReasonNotes(e.target.value)}
            placeholder={t('reasonNotesPlaceholder', 'Describe customer request, item defects, or return conditions...')}
            className={textareaCls}
          />
        </div>
      </form>
    </EnterpriseModal>
  )
}

export default CreateOrderReturnModal
