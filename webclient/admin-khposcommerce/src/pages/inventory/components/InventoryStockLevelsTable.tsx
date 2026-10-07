import React from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Eye, Sliders, ArrowLeftRight } from 'lucide-react'
import TableWrapper from '@/components/shared/TableWrapper'
import TableActionMenu from '@/components/shared/TableActionMenu'
import Pagination from '@/components/shared/Pagination'
import StatusBadge from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common'
import { getAbsoluteImageUrl, resolveProductPhoto, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import { ProductThumbnail } from '@/pages/products/components/ProductThumbnail'

interface InventoryStockLevelsTableProps {
  data: any
  isLoading: boolean
  isFetching: boolean
  pagination: any
  perPage: number
  setPage: (p: number) => void
  setPerPage: (p: number) => void
  onViewItem: (id: number, item?: any) => void
  onOpenQuickAdjustment?: (item: any) => void
  onSort: (field: string) => void
  renderSortIcon: (field: string) => React.ReactNode
  visibleColumns?: Record<string, boolean>
  onResetFilters?: () => void
}

export const InventoryStockLevelsTable: React.FC<InventoryStockLevelsTableProps> = ({
  data,
  isLoading,
  isFetching,
  pagination,
  perPage,
  setPage,
  setPerPage,
  onViewItem,
  onSort,
  renderSortIcon,
  visibleColumns = {},
  onResetFilters,
}) => {
  const { t } = useTranslation(['inventory', 'common'])
  const items: any[] = data?.data ?? []

  const activeColCount = 1 + Object.values(visibleColumns).filter(v => v !== false).length

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden print:hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {visibleColumns.sku !== false && (
                <th onClick={() => onSort('sku')} className="text-left cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colSku', 'SKU')} {renderSortIcon('sku')}
                </th>
              )}
              {visibleColumns.product !== false && (
                <th onClick={() => onSort('product_name')} className="text-left cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colProductName', 'Product')} {renderSortIcon('product_name')}
                </th>
              )}
              {visibleColumns.warehouse !== false && (
                <th onClick={() => onSort('warehouse_id')} className="text-left cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colWarehouse', 'Warehouse')} {renderSortIcon('warehouse_id')}
                </th>
              )}
              {visibleColumns.quantity !== false && (
                <th onClick={() => onSort('quantity')} className="text-center cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colTotalQty', 'Total Qty')} {renderSortIcon('quantity')}
                </th>
              )}
              {visibleColumns.reserved !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colReserved', 'Reserved')}
                </th>
              )}
              {visibleColumns.available !== false && (
                <th onClick={() => onSort('available_quantity')} className="text-center cursor-pointer hover:bg-muted py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colAvailable', 'Available')} {renderSortIcon('available_quantity')}
                </th>
              )}
              {visibleColumns.status !== false && (
                <th className="text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap">
                  {t('colStatus', 'Status')}
                </th>
              )}
              <th className="sticky right-0 z-20 bg-card dark:bg-card border-l border-border text-center py-3.5 px-4 font-semibold text-xs uppercase text-muted-foreground whitespace-nowrap min-w-[80px]">
                {t('common.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {visibleColumns.sku !== false && <td className="p-4"><div className="skeleton h-4 w-20 rounded" /></td>}
                  {visibleColumns.product !== false && <td className="p-4"><div className="skeleton h-4 w-40 rounded" /></td>}
                  {visibleColumns.warehouse !== false && <td className="p-4"><div className="skeleton h-4 w-24 rounded" /></td>}
                  {visibleColumns.quantity !== false && <td className="p-4"><div className="skeleton h-4 w-12 rounded mx-auto" /></td>}
                  {visibleColumns.reserved !== false && <td className="p-4"><div className="skeleton h-4 w-12 rounded mx-auto" /></td>}
                  {visibleColumns.available !== false && <td className="p-4"><div className="skeleton h-4 w-12 rounded mx-auto" /></td>}
                  {visibleColumns.status !== false && <td className="p-4"><div className="skeleton h-4 w-16 rounded mx-auto" /></td>}
                  <td className="p-4"><div className="skeleton h-4 w-8 rounded ml-auto" /></td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <EmptyState
                cols={activeColCount || 8}
                icon={Package}
                title={t('noStockFound', 'រកមិនឃើញទិន្នន័យស្តុកទេ')}
                description={t('empty.noInventoryDesc', 'មិនមានទិន្នន័យស្តុកត្រូវគ្នានឹងលក្ខខណ្ឌតម្រងដែលបានកំណត់ទេ។')}
              />
            ) : (
              items.map((item) => {
                const qty = Number(item.quantity) || 0
                const reserved = Number(item.reserved_quantity) || 0
                const available = Number(item.available_quantity) || Math.max(0, qty - reserved)
                const reorderPoint = Number(item.reorder_point || item.product?.reorder_point || 5)
                const isOut = qty <= 0
                const isLow = !isOut && qty <= reorderPoint
                const imgSrc = item.product?.primary_image || item.product?.images?.[0]?.url || item.product?.images?.[0] || item.product?.image || item.image

                return (
                  <tr key={item.id} className="hover:bg-muted/40 dark:hover:bg-muted/20 transition-colors group cursor-pointer" onClick={() => onViewItem(item.id, item)}>
                    {visibleColumns.sku !== false && (
                      <td className="py-3 px-4 font-mono font-bold text-xs text-primary whitespace-nowrap">
                        {item.sku || item.product?.sku || '—'}
                      </td>
                    )}
                    {visibleColumns.product !== false && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <ProductThumbnail
                            name={item.product?.name || item.name || 'Catalog Item'}
                            primaryImage={imgSrc}
                            size="xs"
                            preview={false}
                          />
                          <div>
                            <span className="font-bold text-foreground text-xs block leading-snug">
                              {item.product?.name || item.name || 'Catalog Item'}
                            </span>
                            {item.variant?.name && (
                              <span className="text-[10px] text-muted-foreground font-medium block">
                                {item.variant.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.warehouse !== false && (
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {item.warehouse?.name || 'Main Warehouse'}
                      </td>
                    )}
                    {visibleColumns.quantity !== false && (
                      <td className="py-3 px-4 text-center font-bold text-xs text-foreground whitespace-nowrap">
                        {qty}
                      </td>
                    )}
                    {visibleColumns.reserved !== false && (
                      <td className="py-3 px-4 text-center text-xs text-muted-foreground whitespace-nowrap">
                        {reserved}
                      </td>
                    )}
                    {visibleColumns.available !== false && (
                      <td className="py-3 px-4 text-center font-extrabold text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {available}
                      </td>
                    )}
                    {visibleColumns.status !== false && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={isOut ? 'out_of_stock' : isLow ? 'low_stock' : 'in_stock'} />
                      </td>
                    )}
                    <td className="sticky right-0 z-10 bg-card group-hover:bg-muted/40 dark:group-hover:bg-muted/20 transition-colors border-l border-border py-3 px-4 text-center whitespace-nowrap min-w-[80px]" onClick={(e) => e.stopPropagation()}>
                      <TableActionMenu
                        onView={() => onViewItem(item.id)}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrapper>
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />
    </div>
  )
}
