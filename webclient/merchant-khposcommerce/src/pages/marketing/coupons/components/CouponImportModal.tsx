import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal from '@/components/shared/CsvImportModal'

interface CouponImportModalProps {
  isOpen: boolean
  onClose: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  handleFileSelectForImport?: (file: File) => void
  importPreviewData?: { headers: string[]; rows: string[][] } | null
  isImporting: boolean
  handleConfirmImport: () => void
}

const COUPON_EXPECTED_HEADERS = ['code', 'name', 'type', 'value', 'min_spend', 'max_discount', 'start_date', 'end_date', 'usage_limit', 'status']

export const CouponImportModal: React.FC<CouponImportModalProps> = ({
  isOpen,
  onClose,
  importFile,
  setImportFile,
  handleFileSelectForImport,
  isImporting,
  handleConfirmImport,
}) => {
  const { t } = useTranslation(['marketing', 'common'])

  return (
    <CsvImportModal
      isOpen={isOpen}
      onClose={onClose}
      resourceName={t('marketing.coupons', 'Coupons')}
      expectedHeaders={COUPON_EXPECTED_HEADERS}
      importFile={importFile}
      setImportFile={(file) => {
        setImportFile(file)
        if (file && handleFileSelectForImport) {
          handleFileSelectForImport(file)
        }
      }}
      isImporting={isImporting}
      onSubmit={(e) => {
        e.preventDefault()
        handleConfirmImport()
      }}
    />
  )
}

export default CouponImportModal
