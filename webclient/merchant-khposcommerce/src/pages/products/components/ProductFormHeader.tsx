import React from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Package } from 'lucide-react'
import { FormHeader } from '@/components/common'

interface ProductFormHeaderProps {
  isEdit: boolean
  productId: number | null
  productDetail: any
  isPending?: boolean
  onSubmit?: (e: React.FormEvent) => void
  onOpenLivePreview?: () => void
}

export const ProductFormHeader: React.FC<ProductFormHeaderProps> = ({
  isEdit,
  productDetail,
  onOpenLivePreview,
}) => {
  const { t } = useTranslation(['products', 'common', 'nav'])

  const statusBadge = isEdit && productDetail ? (
    <span
      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
        productDetail.status === 'active' || productDetail.is_active
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
          : 'bg-muted text-muted-foreground border-border'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          productDetail.status === 'active' || productDetail.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'
        }`}
      />
      {productDetail.status === 'active' || productDetail.is_active
        ? t('products.active', 'Active')
        : t('products.inactive', 'Inactive')}
    </span>
  ) : undefined

  const livePreviewAction = onOpenLivePreview ? (
    <button
      type="button"
      onClick={onOpenLivePreview}
      className="h-9 min-h-[36px] px-3.5 sm:px-4 rounded-xl border border-border/80 dark:border-slate-700 bg-background dark:bg-slate-800/80 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted/80 dark:hover:bg-slate-700 text-xs sm:text-[13px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer active:scale-95"
      title={t('products.livePreview', t('common.livePreview', 'Live Preview'))}
    >
      <Eye size={14} />
      <span>{t('products.livePreview', t('common.livePreview', 'Live Preview'))}</span>
    </button>
  ) : undefined

  return (
    <FormHeader
      isEdit={isEdit}
      title={
        isEdit
          ? (productDetail?.name
              ? t('products.editProductTitle', 'Edit Product: {{name}}', { name: productDetail.name })
              : t('products.editProduct', 'Edit Product'))
          : t('products.addProduct', 'Add New Product')
      }
      subtitle={
        isEdit
          ? t('products.editSubtitle', 'Update product attributes, pricing, stock levels, and gallery')
          : t('products.formSubtitle', 'Configure specifications, pricing models, inventory thresholds, and media')
      }
      statusBadge={statusBadge}
      breadcrumbs={[
        { label: t('nav.products', 'Products'), path: '/products' },
        {
          label: isEdit
            ? t('products.editProduct', 'Edit Product')
            : t('products.addProduct', 'Add Product'),
        },
      ]}
      backPath="/products"
      backLabel={t('common.back', 'Back')}
      extraActions={livePreviewAction}
    />
  )
}

export default ProductFormHeader
