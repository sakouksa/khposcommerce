import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { purchaseService } from '@/services/purchaseService'
import { useToast } from '@/hooks/useToast'
import { PurchaseReturnFormSection } from './components/PurchaseReturnFormSection'
import { focusFirstInvalidField } from '@/utils/formValidation'

export const PurchaseReturnFormPage: React.FC = () => {
  const { t } = useTranslation(['purchases', 'common'])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const returnId = id ? parseInt(id) : null
  const qc = useQueryClient()
  const toast = useToast()

  // Form State
  const [purchaseId, setPurchaseId] = useState('')
  const [rmaNumber, setRmaNumber] = useState('')
  const [attachmentUrl, setAttachmentUrl] = useState('')
  const [reason, setReason] = useState('')
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState('draft')
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Query purchases list for select dropdown
  const { data: purchasesData } = useQuery({
    queryKey: ['purchases-for-return-select'],
    queryFn: () => purchaseService.list({ per_page: 200 }).then(r => r.data ?? []),
  })

  // URL query param purchase_id support
  useEffect(() => {
    const pId = searchParams.get('purchase_id')
    if (pId && !purchaseId && !isEdit) {
      setPurchaseId(pId)
    }
  }, [searchParams, purchaseId, isEdit])

  // Fetch existing return if editing
  const { data: existingReturn, isLoading: loadingExistingReturn } = useQuery({
    queryKey: ['purchase-return-edit', returnId],
    queryFn: () => (returnId ? purchaseService.getReturn(returnId) : null),
    enabled: isEdit && !!returnId,
  })

  useEffect(() => {
    if (existingReturn) {
      setPurchaseId(String(existingReturn.purchase_id || existingReturn.purchase?.id || ''))
      setReturnDate(existingReturn.date || new Date().toISOString().split('T')[0])
      setRmaNumber(existingReturn.rma_number || '')
      setAttachmentUrl(existingReturn.attachment_url || '')
      setReason(existingReturn.reason || '')
      setStatus(existingReturn.status || 'draft')

      if (existingReturn.items && existingReturn.items.length > 0) {
        const items = existingReturn.items.map((it: any) => ({
          purchase_item_id: it.purchase_item_id,
          product_id: it.product_id,
          product_variant_id: it.product_variant_id,
          product_name: it.product_name || it.product?.name || `Product #${it.product_id}`,
          variant_name: it.variant?.name,
          sku: it.sku || it.product?.sku,
          batch_number: it.batch_number || '',
          serial_number: it.serial_number || '',
          quantity_ordered: it.quantity_ordered || it.quantity || 0,
          quantity_received: it.quantity_received || it.quantity || 0,
          already_returned: it.already_returned || 0,
          available_to_return: it.available_to_return || it.quantity || 0,
          quantity: String(it.quantity || 0),
          unit_cost: it.unit_cost,
          notes: it.notes || ''
        }))
        setReturnItems(items)
      }
    }
  }, [existingReturn])

  // Fetch purchase detail when a PO is selected (only when not editing or after existingReturn loaded)
  const { data: purchaseDetail, isLoading: loadingPurchaseDetails } = useQuery({
    queryKey: ['purchase-detail-for-return', purchaseId],
    queryFn: () => (purchaseId ? purchaseService.show(purchaseId) : null),
    enabled: Boolean(purchaseId) && !isEdit,
  })

  useEffect(() => {
    if (!isEdit && purchaseDetail?.items) {
      const items = purchaseDetail.items.map((item: any) => {
        const ordered = parseFloat(item.quantity) || 0
        const rawReceived = parseFloat(item.quantity_received) || 0
        // If received is recorded and > 0, use it; otherwise default to ordered (purchased quantity)
        const received = rawReceived > 0 ? rawReceived : ordered
        const alreadyReturned = parseFloat(item.quantity_returned) || 0
        const maxReturnable = Math.max(0, received - alreadyReturned)

        return {
          purchase_item_id: item.id,
          product_id: item.product_id,
          product_variant_id: item.product_variant_id,
          product_name: item.product_name ?? item.product?.name ?? `Product #${item.product_id}`,
          variant_name: item.variant?.name,
          sku: item.sku ?? item.product?.sku,
          batch_number: '',
          serial_number: '',
          quantity_ordered: ordered,
          quantity_received: received,
          already_returned: alreadyReturned,
          available_to_return: maxReturnable,
          quantity: String(maxReturnable),
          unit_cost: item.unit_cost,
          notes: ''
        }
      })
      setReturnItems(items)
    } else if (!isEdit) {
      setReturnItems([])
    }
  }, [purchaseDetail, isEdit])

  // Save mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEdit && returnId) {
        return purchaseService.updateReturn(returnId, payload)
      }
      return purchaseService.createReturn(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchase-returns'] })
      if (returnId) {
        qc.invalidateQueries({ queryKey: ['purchase-return-detail', returnId] })
      }
      qc.invalidateQueries({ queryKey: ['purchases'] })
      toast.success(
        isEdit
          ? t('purchases.toast.returnUpdatedSuccess', 'Purchase return updated successfully.')
          : t('purchases.toast.returnCreatedSuccess', 'Purchase return created successfully.')
      )
      navigate(isEdit ? `/purchases/returns/${returnId}` : '/purchases/returns')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? t('toast.error')),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}

    if (!purchaseId) {
      errors.purchaseId = t('purchases.choosePOToReturn', 'Please select a purchase order.')
    }
    if (!returnDate) {
      errors.returnDate = t('purchases.dateRequired', 'Return date is required.')
    }
    if (!status) {
      errors.status = t('purchases.statusRequired', 'Status is required.')
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    for (const item of returnItems) {
      const qty = parseFloat(item.quantity) || 0
      if (qty < 0) {
        toast.error(t('purchases.returnQtyNegative', 'Return quantity cannot be negative.'))
        return
      }
      if (qty > item.available_to_return) {
        toast.error(t('purchases.returnQtyExceeds', 'Return quantity for "{{name}}" exceeds available quantity.', { name: item.product_name }))
        return
      }
    }

    const itemsPayload = returnItems
      .map(item => ({
        purchase_item_id: item.purchase_item_id,
        product_id: item.product_id,
        product_variant_id: item.product_variant_id || null,
        batch_number: item.batch_number || null,
        serial_number: item.serial_number || null,
        quantity: parseFloat(item.quantity) || 0,
        unit_cost: parseFloat(item.unit_cost) || 0,
        notes: item.notes || null
      }))
      .filter(item => item.quantity > 0)

    if (itemsPayload.length === 0) {
      toast.error(t('purchases.inputReturnQuantity', 'Please input a return quantity greater than 0 for at least one item.'))
      return
    }

    saveMutation.mutate({
      purchase_id: Number(purchaseId),
      date: returnDate,
      rma_number: rmaNumber || null,
      attachment_url: attachmentUrl || null,
      reason: reason || null,
      status,
      items: itemsPayload
    })
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <PurchaseReturnFormSection
        isEdit={isEdit}
        returnReference={existingReturn?.reference_number}
        purchaseId={purchaseId}
        setPurchaseId={setPurchaseId}
        purchasesData={purchasesData || []}
        loadingPurchaseDetails={loadingPurchaseDetails || loadingExistingReturn}
        returnDate={returnDate}
        setReturnDate={setReturnDate}
        rmaNumber={rmaNumber}
        setRmaNumber={setRmaNumber}
        attachmentUrl={attachmentUrl}
        setAttachmentUrl={setAttachmentUrl}
        status={status}
        setStatus={setStatus}
        returnItems={returnItems}
        handleItemQtyChange={(idx, val) => {
          const updated = [...returnItems]
          updated[idx].quantity = val
          setReturnItems(updated)
        }}
        handleItemNotesChange={(idx, val) => {
          const updated = [...returnItems]
          updated[idx].notes = val
          setReturnItems(updated)
        }}
        handleItemBatchChange={(idx, val) => {
          const updated = [...returnItems]
          updated[idx].batch_number = val
          setReturnItems(updated)
        }}
        handleItemSerialChange={(idx, val) => {
          const updated = [...returnItems]
          updated[idx].serial_number = val
          setReturnItems(updated)
        }}
        getReturnTotal={() => returnItems.reduce((acc, item) => acc + ((parseFloat(item.quantity) || 0) * (item.unit_cost || 0)), 0)}
        reason={reason}
        setReason={setReason}
        isSubmitting={saveMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit && returnId ? `/purchases/returns/${returnId}` : '/purchases/returns')}
        formErrors={formErrors}
        onClearError={handleClearError}
      />
    </div>
  )
}

export default PurchaseReturnFormPage
