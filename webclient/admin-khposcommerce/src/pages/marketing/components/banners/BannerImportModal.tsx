import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal from '@/components/shared/CsvImportModal'

interface BannerImportModalProps {
  isOpen: boolean
  onClose: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  handleFileSelectForImport?: (file: File) => void
  importPreviewData?: { headers: string[]; rows: string[][] } | null
  isImporting: boolean
  handleConfirmImport: () => void
}

const BANNER_EXPECTED_HEADERS = ['title', 'position', 'link_url', 'is_active', 'sort_order']

export const BannerImportModal: React.FC<BannerImportModalProps> = ({
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
      resourceName={t('marketing.banners', 'Banners')}
      expectedHeaders={BANNER_EXPECTED_HEADERS}
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

export default BannerImportModal
