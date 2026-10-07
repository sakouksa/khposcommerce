import React from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, Star, Trash2, Eye } from 'lucide-react'
import { Image as AntImage } from 'antd'
import { getAbsoluteImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import { FormCard } from '@/components/common'
import type { CreateImagePreview } from '../types/productForm.types'

interface ProductMediaSectionProps {
  isEdit: boolean
  productId: number | null
  productDetail: any
  createImagePreviews: CreateImagePreview[]
  createDragActive: boolean
  handleCreateDrag: (e: React.DragEvent) => void
  handleCreateDrop: (e: React.DragEvent) => void
  handleCreateImageFiles: (files: File[]) => void
  handleRemoveCreateImage: (id: string) => void
  handleSetPrimaryCreateImage: (id: string) => void
  onUpdateImagePrimary?: (imgId: number) => void
  onDeleteImage?: (imgId: number) => void
}

export const ProductMediaSection: React.FC<ProductMediaSectionProps> = ({
  isEdit,
  productDetail,
  createImagePreviews,
  createDragActive,
  handleCreateDrag,
  handleCreateDrop,
  handleCreateImageFiles,
  handleRemoveCreateImage,
  handleSetPrimaryCreateImage,
  onUpdateImagePrimary,
  onDeleteImage,
}) => {
  const { t } = useTranslation(['products', 'common'])

  return (
    <FormCard
      title={t('mediaGallery', 'Product Media Gallery')}
      subtitle={t('mediaGallerySub', 'Upload product images, set catalog thumbnail or sort order.')}
      badge={
        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full">
          {createImagePreviews.length + (productDetail?.images?.length || 0)} {t('imagesSelected', 'images selected')}
        </span>
      }
      contentClassName="space-y-4"
    >

      {/* Image Dropzone */}
      <label
        onDragEnter={handleCreateDrag}
        onDragOver={handleCreateDrag}
        onDragLeave={handleCreateDrag}
        onDrop={handleCreateDrop}
        className={`group flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-6 px-4 text-center cursor-pointer transition-all ${
          createDragActive
            ? 'border-primary bg-primary/10 scale-[1.005]'
            : 'border-border/80 bg-muted/10 hover:border-primary/60 hover:bg-primary/5'
        }`}
      >
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
          <Upload size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">
            {t('dragDropText', 'Drag & drop product images here or click to browse')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WEBP · Up to 10MB per image</p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              handleCreateImageFiles(Array.from(e.target.files))
            }
          }}
        />
      </label>

      {/* Server Uploaded Photos Grid (In Edit Mode) */}
      {isEdit && productDetail?.images && productDetail.images.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/60 space-y-2.5">
          <span className="text-xs font-bold text-muted-foreground block">{t('uploadedImages', 'Uploaded Photos:')}</span>
          <AntImage.PreviewGroup>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {productDetail.images.map((img: any) => {
                const imgUrl = getAbsoluteImageUrl(img.url || img.image)
                return (
                  <div
                    key={img.id}
                    className="group relative rounded-xl overflow-hidden border border-border bg-muted/20 shadow-xs hover:shadow-md transition-all aspect-square"
                  >
                    <AntImage
                      src={imgUrl}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      wrapperClassName="w-full h-full flex items-center justify-center cursor-pointer"
                      alt="catalog"
                      preview={{
                        mask: (
                          <div className="flex items-center gap-1 text-xs font-semibold text-white drop-shadow-md">
                            <Eye size={14} />
                            <span>{t('common.view', 'Preview')}</span>
                          </div>
                        ),
                      }}
                      fallback={DEFAULT_PRODUCT_IMAGE}
                    />
                    {img.is_primary && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-primary/95 text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md z-10 backdrop-blur-xs pointer-events-none">
                        <Star size={10} fill="currentColor" />
                        {t('primaryImage', 'Primary')}
                      </span>
                    )}
                    {/* Action buttons overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      {!img.is_primary && onUpdateImagePrimary && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateImagePrimary(img.id)
                          }}
                          className="p-1.5 bg-background/90 text-primary hover:bg-primary hover:text-white rounded-lg shadow-sm border border-border/60 transition-all cursor-pointer"
                          title={t('setPrimary', 'Set as Primary')}
                        >
                          <Star size={13} />
                        </button>
                      )}
                      {onDeleteImage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteImage(img.id)
                          }}
                          className="p-1.5 bg-background/90 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg shadow-sm border border-border/60 transition-all cursor-pointer"
                          title={t('delete', 'Delete')}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </AntImage.PreviewGroup>
        </div>
      )}

      {/* New Image Previews Grid */}
      {createImagePreviews.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/60 space-y-2.5">
          <span className="text-xs font-bold text-muted-foreground block">{t('newPhotos', 'New Photos to Upload:')}</span>
          <AntImage.PreviewGroup>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {createImagePreviews.map((img) => (
                <div key={img.id} className="relative group rounded-xl border border-border overflow-hidden bg-muted/20 aspect-square shadow-xs hover:shadow-md transition-all">
                  <AntImage
                    src={img.url}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    wrapperClassName="w-full h-full flex items-center justify-center cursor-pointer"
                    preview={{
                      mask: (
                        <div className="flex items-center gap-1 text-xs font-semibold text-white drop-shadow-md">
                          <Eye size={14} />
                          <span>{t('common.view', 'Preview')}</span>
                        </div>
                      ),
                    }}
                  />
                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-primary/95 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10 backdrop-blur-xs pointer-events-none">
                      <Star size={10} fill="currentColor" />
                      {t('primaryImage', 'Primary')}
                    </span>
                  )}
                  {/* Action buttons overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetPrimaryCreateImage(img.id)
                      }}
                      className={`p-1.5 rounded-lg text-xs font-semibold shadow-sm border border-border/60 transition-all cursor-pointer ${
                        img.isPrimary ? 'bg-primary text-primary-foreground' : 'bg-background/90 text-foreground hover:bg-primary hover:text-white'
                      }`}
                      title={t('setPrimary', 'Set as Primary')}
                    >
                      <Star size={13} className={img.isPrimary ? 'fill-current' : ''} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveCreateImage(img.id)
                      }}
                      className="p-1.5 rounded-lg bg-background/90 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm border border-border/60 transition-all cursor-pointer"
                      title={t('delete', 'Delete')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AntImage.PreviewGroup>
        </div>
      )}
    </FormCard>
  )
}

