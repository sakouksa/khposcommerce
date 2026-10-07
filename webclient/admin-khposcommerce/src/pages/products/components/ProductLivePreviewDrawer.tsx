import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, ShieldCheck, Truck, Package } from 'lucide-react'
import { Image as AntImage } from 'antd'
import { getAbsoluteImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import CloseButton from '@/components/common/buttons/CloseButton'

interface ProductLivePreviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  form: any
  productDetail: any
  categories: any[]
  brands: any[]
  createImagePreviews: any[]
}

export const ProductLivePreviewDrawer: React.FC<ProductLivePreviewDrawerProps> = ({
  isOpen,
  onClose,
  form,
  productDetail,
  categories,
  brands,
  createImagePreviews,
}) => {
  const { t } = useTranslation(['products', 'common'])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)

  // Collect all display images (no fake/hardcoded Unsplash fallback)
  const allImages: string[] = []
  if (createImagePreviews && createImagePreviews.length > 0) {
    createImagePreviews.forEach(p => {
      if (p?.url) allImages.push(p.url)
    })
  }
  if (productDetail?.images && productDetail.images.length > 0) {
    productDetail.images.forEach((img: any) => {
      const u = getAbsoluteImageUrl(img.url || img.image)
      if (u && !allImages.includes(u)) allImages.push(u)
    })
  }
  if (form?.image && typeof form.image === 'string' && form.image.trim()) {
    const u = getAbsoluteImageUrl(form.image)
    if (u && !allImages.includes(u)) allImages.unshift(u)
  }

  const categoryName = categories?.find(c => String(c.id) === String(form.category_id))?.name || productDetail?.category?.name || t('products.generalCategory', 'General')
  const brandName = brands?.find(b => String(b.id) === String(form.brand_id))?.name || productDetail?.brand?.name || t('products.generalBrand', 'Brand')
  const variants: any[] = productDetail?.variants || []

  if (!isOpen) return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex justify-end bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-card w-full max-w-md border-l border-border h-full flex flex-col justify-between shadow-2xl overflow-hidden"
        >
          {/* Header (Clean Minimal Text) */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md">
            <div>
              <h3 className="font-bold text-sm text-foreground">{t('products.livePreviewTitle', 'Live Storefront Preview')}</h3>
              <p className="text-[11px] text-muted-foreground">{t('products.livePreviewSub', 'Interactive customer shopping view')}</p>
            </div>
            <CloseButton onClose={onClose} size="md" color="rose" />
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* Product Hero Image */}
            <div className="space-y-3">
              {allImages.length > 0 ? (
                <AntImage.PreviewGroup items={allImages}>
                  <div className="rounded-2xl overflow-hidden border border-border bg-muted/20 aspect-square relative shadow-xs">
                    <AntImage
                      src={allImages[selectedImageIndex] || allImages[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      wrapperClassName="w-full h-full flex items-center justify-center cursor-pointer"
                      fallback={DEFAULT_PRODUCT_IMAGE}
                      preview={{
                        mask: (
                          <div className="flex items-center gap-1 text-xs font-semibold text-white drop-shadow-md">
                            <Eye size={14} />
                            <span>Preview</span>
                          </div>
                        ),
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase pointer-events-none z-10">
                      {form?.is_featured ? t('products.featuredBadge', 'FEATURED') : categoryName}
                    </div>
                  </div>
                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {allImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            selectedImageIndex === idx
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-border/80 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </AntImage.PreviewGroup>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 aspect-square flex flex-col items-center justify-center text-muted-foreground gap-2 p-6 text-center">
                  <Package size={32} className="opacity-40" />
                  <p className="text-xs">{t('products.noImagesUploaded', 'No product images uploaded yet.')}</p>
                </div>
              )}
            </div>

            {/* Product Metadata & Title */}
            <div className="space-y-2 border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{brandName}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-[11px] text-muted-foreground">{categoryName}</span>
              </div>
              <h2 className="text-base font-extrabold text-foreground leading-snug">
                {form?.name || t('products.productTitlePlaceholder', 'Product Title')}
              </h2>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-xl font-black text-foreground">
                  ${Number(form?.selling_price || productDetail?.selling_price || 0).toFixed(2)}
                </span>
                {form?.cost_price && Number(form.cost_price) > 0 && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${(Number(form.selling_price || 0) * 1.2).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Variants options picker if available */}
            {variants.length > 0 && (
              <div className="space-y-2 border-b border-border/60 pb-4">
                <label className="text-xs font-bold text-foreground block">
                  {t('products.availableOptions', 'Available Options:')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: any) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedVariantId === v.id
                          ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                          : 'border-border bg-card hover:bg-muted text-foreground'
                      }`}
                    >
                      {v.name} · ${Number(v.selling_price || 0).toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Short Description */}
            <div className="space-y-1.5 border-b border-border/60 pb-4">
              <label className="text-xs font-bold text-foreground block">
                {t('products.colDescription', 'Description')}
              </label>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                {form?.description || productDetail?.description || t('products.noDescriptionProvided', 'No detailed description provided for this product.')}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary shrink-0" />
                <span>{t('products.certifiedQuality', '100% Genuine Enterprise Certified Product')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-primary shrink-0" />
                <span>{t('products.fastDispatch', 'Instant POS & Fast Warehouse Dispatch')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}

export default ProductLivePreviewDrawer
