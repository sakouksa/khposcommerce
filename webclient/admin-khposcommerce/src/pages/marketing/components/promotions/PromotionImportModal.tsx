import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal from '@/components/shared/CsvImportModal'

interface PromotionImportModalProps {
  isOpen: boolean
  onClose: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  handleFileSelectForImport?: (file: File) => void
  importPreviewData?: { headers: string[]; rows: string[][] } | null
  isImporting: boolean
  handleConfirmImport: () => void
}

const PROMOTION_EXPECTED_HEADERS = ['name', 'type', 'discount_type', 'discount_value', 'start_date', 'end_date', 'status']

export const PromotionImportModal: React.FC<PromotionImportModalProps> = ({
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
      resourceName={t('marketing.promotions', 'Promotions')}
      expectedHeaders={PROMOTION_EXPECTED_HEADERS}
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

export default PromotionImportModal
