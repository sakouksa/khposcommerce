import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal from '@/components/shared/CsvImportModal'

interface UserImportModalProps {
  isOpen: boolean
  onClose: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  handleFileSelectForImport?: (file: File) => void
  importPreviewData?: { headers: string[]; rows: string[][] } | null
  isImporting: boolean
  handleConfirmImport: () => void
}

const USER_EXPECTED_HEADERS = ['name', 'email', 'phone', 'role', 'status']

export const UserImportModal: React.FC<UserImportModalProps> = ({
  isOpen,
  onClose,
  importFile,
  setImportFile,
  handleFileSelectForImport,
  isImporting,
  handleConfirmImport,
}) => {
  const { t } = useTranslation(['users', 'common'])

  return (
    <CsvImportModal
      isOpen={isOpen}
      onClose={onClose}
      resourceName={t('users.users', 'Users')}
      expectedHeaders={USER_EXPECTED_HEADERS}
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

export default UserImportModal
