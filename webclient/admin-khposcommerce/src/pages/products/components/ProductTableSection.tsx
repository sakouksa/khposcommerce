import React from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUp, ArrowDown, ArrowUpDown, Copy, Printer, Warehouse, Edit3 } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import TableWrapper from '@/components/shared/TableWrapper'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import TableActionMenu from '@/components/shared/TableActionMenu'
import StatusBadge from '@/components/common/StatusBadge'
import { ProductThumbnail } from './ProductThumbnail'
import type { Product } from '../types/productsPage.types'

interface ProductTableSectionProps {
  products: Product[]
  isLoading: boolean
  isFetching: boolean
  visibleColumns: Record<string, boolean>
  recycleBinMode: boolean
  selectedRows: number[]
  setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: string) => void
  onView: (product: Product) => void
  onEdit?: (product: Product) => void
  onDelete?: (product: Product) => void
  onDuplicate?: (product: Product) => void
  onPrintBarcode?: (product: Product) => void
  onQuickStockAdjust?: (product: Product) => void
  onRestore: (id: number) => void
  onForceDelete: (product: Product) => void
  formatCurrency: (val: number) => string
}

export const ProductTableSection: React.FC<ProductTableSectionProps> = ({
  products = [],
  isLoading,
  isFetching,
  visibleColumns,
  selectedRows,
  setSelectedRows,
  sortBy = 'id',
  sortOrder = 'desc',
  onSort,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onPrintBarcode,
  onQuickStockAdjust,
  formatCurrency,
}) => {
  const { language } = useThemeStore()
  const { t } = useTranslation(['products', 'common'])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(products.map(p => p.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const renderSortIcon = (columnKey: string) => {
    if (!onSort) return null
    if (sortBy === columnKey) {
      return sortOrder === 'asc' ? (
        <ArrowUp size={13} className="text-primary shrink-0 transition-transform" />
      ) : (
        <ArrowDown size={13} className="text-primary shrink-0 transition-transform" />
      )
    }
    return <ArrowUpDown size={13} className="opacity-0 group-hover:opacity-60 text-muted-foreground shrink-0 transition-opacity" />
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <div className="overflow-x-auto">
          <table className="w-full data-table border-collapse">
            <thead className="bg-muted/40 sticky top-0 border-b border-border z-10 select-none">
              <tr>
                <th className="w-10 text-center">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedRows.length === products.length}
                    onChange={handleSelectAll}
                    className="checkbox h-4 w-4"
                  />
                </th>
                {visibleColumns.image && <th className="w-12">{t('colPhoto', 'Image')}</th>}
                
                {visibleColumns.name && (
                  <th
                    onClick={() => onSort?.('name')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('colName', 'Product Name')}</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                )}

                {visibleColumns.sku && (
                  <th
                    onClick={() => onSort?.('sku')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('sku', 'SKU')}</span>
                      {renderSortIcon('sku')}
                    </div>
                  </th>
                )}

                {visibleColumns.category && (
                  <th
                    onClick={() => onSort?.('category_id')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('colCategory', 'Category')}</span>
                      {renderSortIcon('category_id')}
                    </div>
                  </th>
                )}

                {visibleColumns.supplier && (
                  <th
                    onClick={() => onSort?.('brand_id')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('colBrand', 'Brand')}</span>
                      {renderSortIcon('brand_id')}
                    </div>
                  </th>
                )}

                {visibleColumns.stock && (
                  <th
                    onClick={() => onSort?.('stock')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('colStock', 'Current Stock')}</span>
                      {renderSortIcon('stock')}
                    </div>
                  </th>
                )}

                {visibleColumns.price && (
                  <th
                    onClick={() => onSort?.('selling_price')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('colPrice', 'Unit Price')}</span>
                      {renderSortIcon('selling_price')}
                    </div>
                  </th>
                )}

                {visibleColumns.status && (
                  <th
                    onClick={() => onSort?.('status')}
                    className="cursor-pointer hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t('colStatus', 'Status')}</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>
                )}

                <th className="text-right">{t('colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton cols={9} />
              ) : products.length === 0 ? (
                <EmptyState cols={9} message={t('common.noData', t('noData', 'No product items found matching query.'))} />
              ) : (
                products.map((p) => {
                  const isSelected = selectedRows.includes(p.id)
                  const isLowStock = (p.stock ?? 0) <= (p.low_stock_threshold || 5)
                  const isOutOfStock = (p.stock ?? 0) <= 0

                  return (
                    <tr key={p.id} className={`hover:bg-muted/40 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(p.id)}
                          className="checkbox h-4 w-4"
                        />
                      </td>
                      {visibleColumns.image && (
                        <td onClick={() => onView(p)} className="cursor-pointer" title={t('common.view', 'View')}>
                          <ProductThumbnail
                            name={p.name}
                            primaryImage={p.primary_image}
                            images={p.images || undefined}
                            image={(p as any).image}
                            categoryName={p.category?.name}
                            size="sm"
                          />
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td>
                          <p onClick={() => onView(p)} className="font-bold text-foreground hover:text-primary cursor-pointer text-sm line-clamp-1">
                            {p.name}
                          </p>
                          {p.brand?.name && <p className="text-[11px] text-muted-foreground">{p.brand.name}</p>}
                        </td>
                      )}
                      {visibleColumns.sku && (
                        <td>
                          <span className="font-mono text-xs text-muted-foreground font-medium">
                            {p.sku}
                          </span>
                        </td>
                      )}
                      {visibleColumns.category && (
                        <td>
                          <span className="inline-flex items-center rounded-md border border-transparent bg-secondary px-2.5 py-0.5 text-xs font-normal text-secondary-foreground">
                            {p.category?.name || t('generalCategory', 'General')}
                          </span>
                        </td>
                      )}
                      {visibleColumns.supplier && (
                        <td className="text-xs font-medium text-foreground">
                          {p.brand?.name ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                              {p.brand.name}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">{t('noBrand', '—')}</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.stock && (
                        <td>
                          <div
                            onClick={() => onQuickStockAdjust?.(p)}
                            className="flex flex-col gap-1 cursor-pointer group w-fit"
                            title={t('quickStockAdjust', 'Quick Stock Adjust')}
                          >
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-semibold text-foreground">
                                {p.stock ?? 0} {t('products.units', 'units')}
                              </span>
                              <span className="text-muted-foreground">·</span>
                              <span className={`font-semibold ${
                                isOutOfStock
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : isLowStock
                                  ? 'text-rose-500 dark:text-rose-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {isOutOfStock ? t('stockOut', 'Out') : isLowStock ? t('stockLow', 'Low') : t('stockHigh', 'High')}
                              </span>
                              <Edit3 size={11} className="opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                            </div>

                            {/* Micro Progress Bar (Pixel-aligned with Shadcn Product List 1) */}
                            <div className="h-1.5 w-24 sm:w-28 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isOutOfStock
                                    ? 'bg-rose-600'
                                    : isLowStock
                                    ? 'bg-rose-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{
                                  width: isOutOfStock
                                    ? '0%'
                                    : `${Math.min(100, Math.max(8, Math.round(((p.stock ?? 0) / 100) * 100)))}%`
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      )}
                      {visibleColumns.price && (
                        <td className="font-semibold text-xs text-foreground">
                          {formatCurrency(p.selling_price)}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td>
                          <StatusBadge status={p.status ?? (p as any).is_active} />
                        </td>
                      )}
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          onView={() => onView(p)}
                          onEdit={onEdit ? () => onEdit(p) : undefined}
                          onDelete={onDelete ? () => onDelete(p) : undefined}
                          onPrint={onPrintBarcode ? () => onPrintBarcode(p) : undefined}
                          printLabel={t('printBarcode', 'Print Barcode')}
                          items={[
                            ...(onDuplicate ? [{
                              label: t('duplicateProduct', 'Duplicate Product (Clone)'),
                              icon: Copy,
                              onClick: () => onDuplicate(p),
                              variant: 'default' as const,
                            }] : []),
                            ...(onQuickStockAdjust ? [{
                              label: t('quickStockAdjust', 'Quick Stock Adjust'),
                              icon: Warehouse,
                              onClick: () => onQuickStockAdjust(p),
                              variant: 'default' as const,
                            }] : []),
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </TableWrapper>
    </div>
  )
}

export default ProductTableSection
