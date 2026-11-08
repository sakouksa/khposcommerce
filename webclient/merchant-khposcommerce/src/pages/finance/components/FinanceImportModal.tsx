import React from 'react'
import { useTranslation } from 'react-i18next'
import { financeService } from '@/services/financeService'
import { useToast } from '@/hooks/useToast'
import { useQueryClient } from '@tanstack/react-query'
import CsvImportModal from '@/components/shared/CsvImportModal'
import type { TabType } from '../types/finance.types'

interface FinanceImportModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: TabType
  importFile: File | null
  setImportFile: (file: File | null) => void
  importing: boolean
  setImporting: (val: boolean) => void
}

const FINANCE_EXPECTED_HEADERS_MAP: Record<string, string[]> = {
  transactions: ['transaction_number', 'type', 'amount', 'payment_method', 'status', 'description'],
  expenses: ['expense_category', 'title', 'amount', 'payment_method', 'date', 'notes'],
  accounts: ['account_number', 'account_name', 'account_type', 'balance', 'currency', 'status'],
  cash_registers: ['name', 'opening_balance', 'closing_balance', 'status'],
}

export const FinanceImportModal: React.FC<FinanceImportModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  importFile,
  setImportFile,
  importing,
  setImporting,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const toast = useToast()
  const qc = useQueryClient()

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return
    setImporting(true)

    const formData = new FormData()
    formData.append('file', importFile)

    financeService.importData(activeTab, formData)
      .then(() => {
        setImporting(false)
        toast.success(t('common.importSuccess', 'Successfully imported dataset.'))
        qc.invalidateQueries({ queryKey: [`${activeTab}-tab`] })
        onClose()
        setImportFile(null)
      })
      .catch((err) => {
        setImporting(false)
        toast.error(err?.response?.data?.message ?? t('common.importFailed', 'Failed to import CSV.'))
      })
  }

  return (
    <CsvImportModal
      isOpen={isOpen}
      onClose={onClose}
      resourceName={t(`finance.tab_${activeTab}`, activeTab)}
      expectedHeaders={FINANCE_EXPECTED_HEADERS_MAP[activeTab] || []}
      importFile={importFile}
      setImportFile={setImportFile}
      isImporting={importing}
      onSubmit={handleImportSubmit}
    />
  )
}

export default FinanceImportModal
