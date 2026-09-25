import React from 'react'
import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'
import { FormHeader } from '@/components/common'

interface CustomerFormHeaderProps {
  isEdit: boolean
  customerName?: string
  isSubmitting?: boolean
  onSubmit?: (e: React.FormEvent) => void
}

export const CustomerFormHeader: React.FC<CustomerFormHeaderProps> = ({
  isEdit,
  customerName,
}) => {
  const { t } = useTranslation(['customers', 'common'])

  return (
    <FormHeader
      isEdit={isEdit}
      title={
        isEdit
          ? t('customers.editCustomerTitle', 'Edit Customer: {{name}}', { name: customerName || '' })
          : t('customers.createCustomerTitle', 'Add New Customer')
      }
      subtitle={t('customers.formSubtitle', 'Manage and complete customer profile in CRM')}
      backPath="/customers"
      backLabel={t('common.back', 'Back')}
    />
  )
}

export default CustomerFormHeader

