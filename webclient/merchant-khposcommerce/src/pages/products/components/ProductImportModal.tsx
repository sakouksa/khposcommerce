import React from 'react'
import { useTranslation } from 'react-i18next'
import CsvImportModal from '@/components/shared/CsvImportModal'

interface ProductImportModalProps {
  isOpen: boolean
  onClose: () => void
  importFile: File | null
  setImportFile: (file: File | null) => void
  importing: boolean
  handleImportSubmit: () => void
}

const PRODUCT_EXPECTED_HEADERS = [
  'sku',
  'name',
  'slug',
  'barcode',
  'category',
  'brand',
  'unit',
  'tax',
  'cost_price',
  'selling_price',
  'compare_price',
  'weight',
  'length',
  'width',
  'height',
  'track_inventory',
  'low_stock_threshold',
  'status',
  'featured',
  'digital',
]

export const ProductImportModal: React.FC<ProductImportModalProps> = ({
  isOpen,
  onClose,
  importFile,
  setImportFile,
  importing,
  handleImportSubmit,
}) => {
  const { t } = useTranslation(['products', 'common'])

  return (
    <CsvImportModal
      isOpen={isOpen}
      onClose={onClose}
      resourceName={t('products.products', 'Products')}
      expectedHeaders={PRODUCT_EXPECTED_HEADERS}
      importFile={importFile}
      setImportFile={setImportFile}
      isImporting={importing}
      onSubmit={(e) => {
        e.preventDefault()
        handleImportSubmit()
      }}
    />
  )
}

export default ProductImportModal
