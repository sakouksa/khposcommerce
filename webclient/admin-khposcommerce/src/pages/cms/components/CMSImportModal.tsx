import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal from '@/components/shared/CsvImportModal'

interface CMSImportModalProps {
  isOpen: boolean
  onClose: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  handleFileSelectForImport?: (file: File) => void
  importPreviewData?: { headers: string[]; rows: string[][] } | null
  isImporting: boolean
  handleConfirmImport: () => void
}

const CMS_EXPECTED_HEADERS = ['title', 'slug', 'category', 'status', 'content', 'author']

export const CMSImportModal: React.FC<CMSImportModalProps> = ({
  isOpen,
  onClose,
  importFile,
  setImportFile,
  handleFileSelectForImport,
  isImporting,
  handleConfirmImport,
}) => {
  const { t } = useTranslation(['cms', 'common'])

  return (
    <CsvImportModal
      isOpen={isOpen}
      onClose={onClose}
      resourceName={t('cms.articlesContent', 'Articles & Content')}
      expectedHeaders={CMS_EXPECTED_HEADERS}
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

export default CMSImportModal
