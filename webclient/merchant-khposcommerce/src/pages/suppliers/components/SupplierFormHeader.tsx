import React from 'react'
import { useTranslation } from 'react-i18next'
import { Truck } from 'lucide-react'
import { FormHeader } from '@/components/common'
import type { Supplier } from '../types/supplier.types'

interface SupplierFormHeaderProps {
  isEdit: boolean
  supplierId: number | null
  supplierDetail: Supplier | null
}

export const SupplierFormHeader: React.FC<SupplierFormHeaderProps> = ({
  isEdit,
  supplierDetail,
}) => {
  const { t } = useTranslation(['suppliers', 'common', 'nav'])

  const statusBadge = isEdit && supplierDetail ? (
    <span
      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
        supplierDetail.is_active
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-muted text-muted-foreground border-border'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${supplierDetail.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
      {supplierDetail.is_active ? t('suppliers.active', 'Active') : t('suppliers.inactive', 'Inactive')}
    </span>
  ) : undefined

  return (
    <FormHeader
      isEdit={isEdit}
      title={
        isEdit
          ? t('suppliers.editSupplierTitle', 'Edit Supplier: {{name}}', { name: supplierDetail?.name || '' })
          : t('suppliers.createSupplierTitle', 'Add New Supplier')
      }
      subtitle={
        isEdit
          ? t('suppliers.editSubtitle', 'Update supplier profile and details')
          : t('suppliers.createSubtitle', 'Fill in the information to register a new supplier in the system')
      }
      statusBadge={statusBadge}
      breadcrumbs={[
        { label: t('nav.purchaseManagement', 'Purchase Management'), path: '/purchases' },
        { label: t('nav.suppliers', 'Suppliers'), path: '/suppliers' },
        {
          label: isEdit
            ? t('suppliers.editSupplier', 'Edit Supplier')
            : t('suppliers.addSupplier', 'Add Supplier'),
        },
      ]}
      backPath="/suppliers"
      backLabel={t('common.back', 'Back')}
      showSubmit={false}
    />
  )
}

export default SupplierFormHeader
