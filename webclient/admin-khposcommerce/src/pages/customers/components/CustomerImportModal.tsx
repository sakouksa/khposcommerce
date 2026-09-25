import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal, { type ImportResult } from '@/components/shared/CsvImportModal'

interface CustomerImportModalProps {
  isOpen: boolean
  onClose: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  isImporting: boolean
  importResult: ImportResult | null
  onSubmit: (e: React.FormEvent) => void
}

const CUSTOMER_EXPECTED_HEADERS = [
  'name',
  'email',
  'phone',
  'payment_terms',
  'credit_limit',
  'tax_number',
  'rfm_segment',
  'tags',
  'notes',
  'is_active',
]

const CUSTOMER_SAMPLE_DATA = [
  {
    name: 'Sok Dara B2B Co., Ltd',
    email: 'dara.sok@company.com',
    phone: '012 345 678',
    payment_terms: 'net_30',
    credit_limit: '15000',
    tax_number: 'K001-987654321',
    rfm_segment: 'loyal',
    tags: 'B2BVerified, Wholesale',
    notes: 'Corporate client registered under Net 30 payment terms',
    is_active: '1',
  },
  {
    name: 'Chea Vicheka',
    email: 'vicheka.chea@gmail.com',
    phone: '098 765 432',
    payment_terms: 'prepaid',
    credit_limit: '1000',
    tax_number: '',
    rfm_segment: 'potential',
    tags: 'VIPMember',
    notes: 'Retail client with frequent purchases',
    is_active: '1',
  },
]

export const CustomerImportModal: React.FC<CustomerImportModalProps> = ({
  isOpen,
  onClose,
  importFile,
  setImportFile,
  isImporting,
  importResult,
  onSubmit,
}) => {
  const { t } = useTranslation(['customers', 'common'])

  return (
    <CsvImportModal
      isOpen={isOpen}
      onClose={onClose}
      resourceName={t('customers.title', 'Customer')}
      expectedHeaders={CUSTOMER_EXPECTED_HEADERS}
      sampleData={CUSTOMER_SAMPLE_DATA}
      importFile={importFile}
      setImportFile={setImportFile}
      isImporting={isImporting}
      importResult={importResult}
      onSubmit={onSubmit}
    />
  )
}

export default CustomerImportModal
