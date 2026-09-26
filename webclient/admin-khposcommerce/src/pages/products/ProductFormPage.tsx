import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Edit2, X, Check, Loader2, Image as ImageIcon, Upload, Eye,
  Package, DollarSign, Layers, Box, Globe, SlidersHorizontal,
  ArrowRight, ArrowLeft, Sparkles, LayoutGrid, CheckCircle2, ChevronRight
} from 'lucide-react'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { brandService } from '@/services/brandService'
import { unitService } from '@/services/unitService'
import { financeService } from '@/services/financeService'
import { companyService } from '@/services/companyService'
import { inventoryService } from '@/services/inventoryService'
import { useToast } from '@/hooks/useToast'
import { LoadingSpinner, DeleteConfirmDialog, FormLayout, FormContent, FormFooter } from '@/components/common'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import { focusFirstInvalidField } from '@/utils/formValidation'
import { getAbsoluteImageUrl } from '@/utils/image'

// Modular Components
import { ProductFormHeader } from './components/ProductFormHeader'
import { ProductBasicInfoSection } from './components/ProductBasicInfoSection'
import { ProductMediaSection } from './components/ProductMediaSection'
import { ProductVariantsSection } from './components/ProductVariantsSection'
import { ProductPriceHistoryModal } from './components/ProductPriceHistoryModal'
import { ProductAuditLogModal } from './components/ProductAuditLogModal'
import { ProductLivePreviewDrawer } from './components/ProductLivePreviewDrawer'

// Shared Form Sub-sections
import { FlexiblePricingSection } from './components/FlexiblePricingSection'
import { FlexibleInventorySection } from './components/FlexibleInventorySection'
import { FlexibleDimensionsSection } from './components/FlexibleDimensionsSection'
import { FlexibleSEOSection } from './components/FlexibleSEOSection'

// Types & Helpers
import { BLANK_FORM, type ProductForm, type CreateImagePreview, type CustomColorItem } from './types/productForm.types'
import {
  COLOR_MAP, normalizeColorKey, normalizeColorName,
  getDynamicColorMatchedImage, COLOR_MATCHED_IMAGES, getVariantColorHex
} from './utils/colorResolver'
import { SIZE_PRESET_MAP } from './utils/productPresets'

// Re-export helpers for backwards compatibility
export { normalizeColorKey, getDynamicColorMatchedImage, COLOR_MATCHED_IMAGES }

const ProductFormPage: React.FC = () => {
  const { t } = useTranslation(['products', 'common'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const productId = id ? parseInt(id) : null
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  // Tab State
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'inventory' | 'dimensions' | 'seo' | 'variants'>('general')

  // Main Form State
  const [form, setForm] = useState<ProductForm>(BLANK_FORM)
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false)

  // Media upload state
  const [createImagePreviews, setCreateImagePreviews] = useState<CreateImagePreview[]>([])
  const [createDragActive, setCreateDragActive] = useState(false)

  // Variant generator & management state
  const [selectedPresetMode, setSelectedPresetMode] = useState<string>('auto')
  const [customSizeCategory, setCustomSizeCategory] = useState<string>('auto')
  const [customSelectedSizes, setCustomSelectedSizes] = useState<string[]>(['128GB', '256GB', '512GB'])
  const [customSelectedColors, setCustomSelectedColors] = useState<string[]>(['Black', 'White', 'Silver'])
  const [customInputSize, setCustomInputSize] = useState<string>('')
  const [userAddedSizes, setUserAddedSizes] = useState<string[]>([])
  const [customInputColor, setCustomInputColor] = useState<string>('')
  const [customColorHex, setCustomColorHex] = useState<string>('#6366f1')
  const [userAddedColors, setUserAddedColors] = useState<CustomColorItem[]>([])
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false)
  const [matrixProgress, setMatrixProgress] = useState<{ current: number; total: number } | null>(null)
  const [colorImageMap, setColorImageMap] = useState<Record<string, string>>({})

  // Variant dialogs
  const [editingVariant, setEditingVariant] = useState<any | null>(null)
  const [viewingVariant, setViewingVariant] = useState<any | null>(null)
  const [variantToDelete, setVariantToDelete] = useState<{ id: number; name: string } | null>(null)
  const [isClearAllVariantsOpen, setIsClearAllVariantsOpen] = useState(false)
  const [isClearingAllVariants, setIsClearingAllVariants] = useState(false)
  const [bulkDeleteVariantConfirmOpen, setBulkDeleteVariantConfirmOpen] = useState(false)
  const [selectedVariantIds, setSelectedVariantIds] = useState<number[]>([])
  const [variantPage, setVariantPage] = useState(1)
  const [variantPageSize, setVariantPageSize] = useState(10)

  // Modals & Drawer state
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false)
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false)
  // const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false)

  // ─── Queries ──────────────────────────────────────────────────────────────
  const {
    data: productDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['product-detail-page', productId],
    queryFn: () => productId ? productService.show(productId) : null,
    enabled: isEdit,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories-select'],
    queryFn: () => categoryService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: brands } = useQuery({
    queryKey: ['brands-select'],
    queryFn: () => brandService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: units } = useQuery({
    queryKey: ['units-select'],
    queryFn: () => unitService.list({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: taxes } = useQuery({
    queryKey: ['taxes-select'],
    queryFn: () => financeService.getTaxes({ per_page: 100 }).then(r => r.data ?? []),
  })

  const { data: warehousesData } = useQuery({
    queryKey: ['warehouses-select'],
    queryFn: () => companyService.getWarehouses({ per_page: 100 }).then(r => r.data ?? []),
  })
  const warehouses = Array.isArray(warehousesData) ? warehousesData : (warehousesData?.data ?? [])

  const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['product-stock-movements', productId],
    queryFn: () => productId ? inventoryService.listAdjustments({ search: productDetail?.sku || productDetail?.name || String(productId), per_page: 50 }).then(r => r.data ?? []) : [],
    enabled: !!productId,
  })

  // Stock Adjustment Mutation
  const addAdjustmentMutation = useMutation({
    mutationFn: async (data: {
      warehouse_id: string
      variant_id?: string
      type: string
      quantity: string
      reason: string
    }) => {
      if (!productId) {
        throw new Error('Product must be saved before adding stock adjustment')
      }
      return inventoryService.createAdjustment({
        warehouse_id: data.warehouse_id,
        type: data.type,
        reason: data.reason,
        product_id: productId,
        variant_id: data.variant_id || undefined,
        quantity: parseFloat(data.quantity),
        auto_approve: true,
      })
    },
    onSuccess: () => {
      toast.success(t('stockAdjustSuccess', 'Stock level adjusted successfully'))
      qc.invalidateQueries({ queryKey: ['product-detail-page', productId] })
      qc.invalidateQueries({ queryKey: ['product-stock-movements', productId] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('stockAdjustFailed', 'Failed to adjust stock level'))
    }
  })

  // Save Inventory Settings Mutation
  const saveInventorySettingsMutation = useMutation({
    mutationFn: async () => {
      if (!productId) return
      return productService.update(productId, {
        track_inventory: form.track_inventory,
        low_stock_threshold: form.low_stock_threshold,
      })
    },
    onSuccess: () => {
      toast.success(t('inventorySettingsSaved', 'Inventory settings saved successfully'))
      qc.invalidateQueries({ queryKey: ['product-detail-page', productId] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('inventorySettingsFailed', 'Failed to save inventory settings'))
    }
  })

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const setField = (field: keyof ProductForm | string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      handleClearError(field)
    }
  }

  const generateSKU = (name: string): string => {
    if (!name.trim()) return ''
    const cleanName = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 20)
    return cleanName ? `SKU-${cleanName}` : ''
  }

  const getDetectedCategoryKey = () => {
    const catName = (categories?.find((c: any) => String(c.id) === String(form.category_id))?.name || productDetail?.category?.name || '').toLowerCase()
    if (catName.includes('phone') || catName.includes('mobile') || catName.includes('smartphone')) return 'smartphones'
    if (catName.includes('laptop') || catName.includes('computer') || catName.includes('macbook')) return 'laptops'
    if (catName.includes('monitor') || catName.includes('display') || catName.includes('screen')) return 'monitors'
    if (catName.includes('watch') || catName.includes('smartwatch')) return 'smartwatches'
    if (catName.includes('keyboard')) return 'keyboards'
    if (catName.includes('headphone') || catName.includes('earphone') || catName.includes('speaker') || catName.includes('audio') || catName.includes('mice') || catName.includes('mouse')) return 'audio'
    if (catName.includes('camera') || catName.includes('lens')) return 'cameras'
    if (catName.includes('charger') || catName.includes('adapter') || catName.includes('power')) return 'chargers'
    if (catName.includes('shoe') || catName.includes('footwear') || catName.includes('sneaker')) return 'shoes'
    if (catName.includes('shirt') || catName.includes('clothing') || catName.includes('apparel') || catName.includes('fashion')) return 'apparel'
    return 'smartphones'
  }

  const activeCategoryKey = customSizeCategory === 'auto' ? getDetectedCategoryKey() : customSizeCategory

  const handleSwitchSizeCategory = (catKey: string) => {
    setCustomSizeCategory(catKey)
    const targetObj = SIZE_PRESET_MAP[catKey]
    if (targetObj) {
      const defaultCodes = targetObj.options.slice(0, 3).map(o => o.code)
      setCustomSelectedSizes(defaultCodes)
    }
  }

  // ─── Population on Edit ───────────────────────────────────────────────────
  useEffect(() => {
    if (productDetail) {
      setForm({
        name:                productDetail.name || '',
        sku:                 productDetail.sku || '',
        barcode:             productDetail.barcode || '',
        description:         productDetail.description || '',
        short_description:   productDetail.short_description || '',
        category_id:         String(productDetail.category_id ?? productDetail.category?.id ?? ''),
        brand_id:            String(productDetail.brand_id ?? productDetail.brand?.id ?? ''),
        unit_id:             String(productDetail.unit_id ?? productDetail.unit?.id ?? ''),
        tax_id:              String(productDetail.tax_id ?? productDetail.tax?.id ?? ''),
        cost_price:          String(productDetail.cost_price ?? ''),
        selling_price:       String(productDetail.selling_price ?? ''),
        compare_price:       String(productDetail.compare_price ?? ''),
        weight:              String(productDetail.weight ?? ''),
        length:              String(productDetail.length ?? ''),
        width:               String(productDetail.width ?? ''),
        height:              String(productDetail.height ?? ''),
        track_inventory:     !!productDetail.track_inventory,
        has_variants:        !!productDetail.has_variants,
        low_stock_threshold: String(productDetail.low_stock_threshold ?? '5'),
        status:              productDetail.status || 'active',
        is_featured:         !!productDetail.is_featured,
        is_digital:          !!productDetail.is_digital,
        meta_title:          productDetail.meta_title || '',
        meta_description:    productDetail.meta_description || '',
        meta_keywords:       productDetail.meta_keywords || '',
      })

      if (productDetail.variants && productDetail.variants.length > 0) {
        const extractedSizes = new Set<string>()
        const extractedColors = new Set<string>()
        const initialColorImageMap: Record<string, string> = {}

        productDetail.variants.forEach((v: any) => {
          const vName = v.name || ''
          const vImg = getAbsoluteImageUrl(v.image)
          const parts = vName.includes('/') ? vName.split('/') : vName.includes('-') ? vName.split('-') : [vName]
          parts.forEach((part: string) => {
            const clean = part.trim()
            if (/\b\d+\s*(gb|tb|mb)\b/i.test(clean) || /\b(s|m|l|xl|xxl)\b/i.test(clean)) {
              extractedSizes.add(clean)
            } else {
              const norm = normalizeColorName(clean)
              if (norm) {
                extractedColors.add(norm)
                if (vImg && !initialColorImageMap[norm]) initialColorImageMap[norm] = vImg
              }
            }
          })
        })

        if (extractedSizes.size > 0) setCustomSelectedSizes(Array.from(extractedSizes))
        if (extractedColors.size > 0) setCustomSelectedColors(Array.from(extractedColors))
        if (Object.keys(initialColorImageMap).length > 0) setColorImageMap(initialColorImageMap)
      }
    }
  }, [productDetail])

  // ─── Mutations ────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (isEdit && productId) {
        return productService.update(productId, payload)
      } else {
        return productService.create(payload)
      }
    },
    onSuccess: async (data: any) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['pos-products'] })
      qc.invalidateQueries({ queryKey: ['products-stats'] })
      if (productId) qc.invalidateQueries({ queryKey: ['product-detail-page', productId] })

      if (!isEdit && data?.id && createImagePreviews.length > 0) {
        try {
          const files = createImagePreviews.map(p => p.file)
          await productService.uploadImages(data.id, files)
          toast.success(t('products.createSuccessWithImages', 'Product & media created successfully.'))
        } catch {
          toast.success(t('products.createSuccess', 'Product created successfully.'))
        }
      } else {
        toast.success(isEdit ? t('products.updateSuccess', 'Product updated successfully.') : t('products.createSuccess', 'Product created successfully.'))
      }

      if (!isEdit && data?.id) {
        navigate(`/products/${data.id}/edit`)
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'Failed to save product.')
    },
  })

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imgId }: { productId: number; imgId: number }) =>
      productService.deleteImage(productId, imgId),
    onSuccess: () => {
      refetchDetail()
      toast.success('Image deleted successfully.')
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to delete image.')
  })

  const updateImageMutation = useMutation({
    mutationFn: ({ imgId, data }: { imgId: number; data: { is_primary?: boolean } }) =>
      productService.updateImage(imgId, data),
    onSuccess: () => {
      refetchDetail()
      toast.success('Image details updated.')
    },
    onError: () => toast.error('Failed to update image details.')
  })

  const updateVariantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productService.updateVariant(id, data),
    onSuccess: () => {
      refetchDetail()
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('products.variantUpdated', 'Variant updated successfully.'))
      setEditingVariant(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to update variant.')
  })

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) => productService.deleteVariant(variantId),
    onSuccess: () => {
      refetchDetail()
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('products.variantDeleted', 'Variant deleted successfully.'))
      setVariantToDelete(null)
    },
    onError: () => toast.error(t('products.variantDeleteFailed', 'Failed to delete variant.'))
  })

  const bulkDeleteVariantMutation = useMutation({
    mutationFn: (ids: number[]) => productService.bulkDeleteVariants(ids),
    onSuccess: () => {
      refetchDetail()
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('products.bulkDeleteVariantsSuccess', 'Bulk deleted variants successfully.'))
      setSelectedVariantIds([])
      setBulkDeleteVariantConfirmOpen(false)
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Failed to delete variants.')
  })

  // ─── Image Drag & Drop Handlers ──────────────────────────────────────────
  const handleCreateDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCreateDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleCreateDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCreateDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleCreateImageFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleCreateImageFiles = (files: File[]) => {
    if (isEdit && productId) {
      productService.uploadImages(productId, files).then(() => {
        refetchDetail()
        toast.success(t('products.imagesUploadSuccess', 'Images uploaded successfully.'))
      }).catch((err: any) => {
        toast.error(err?.response?.data?.message || t('products.imagesUploadFailed', 'Failed to upload images.'))
      })
      return
    }
    const newPreviews = files.map((file, idx) => ({
      id: `create-img-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
      isPrimary: createImagePreviews.length === 0 && idx === 0,
    }))
    setCreateImagePreviews(prev => [...prev, ...newPreviews])
  }

  const handleRemoveCreateImage = (idToRemove: string) => {
    setCreateImagePreviews(prev => {
      const filtered = prev.filter(img => img.id !== idToRemove)
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) filtered[0].isPrimary = true
      return filtered
    })
  }

  const handleSetPrimaryCreateImage = (idToPrimary: string) => {
    setCreateImagePreviews(prev =>
      prev.map(img => ({ ...img, isPrimary: img.id === idToPrimary }))
    )
  }

  // ─── Variant Matrix Generation ───────────────────────────────────────────
  const handleGenerateMatrix = async () => {
    if (!productId) {
      toast.error('Please save the product basic info first before generating variants.')
      return
    }
    const baseSelling = parseFloat(form.selling_price) || 0
    const baseCost = parseFloat(form.cost_price) || 0
    const combinations: any[] = []

    customSelectedSizes.forEach(size => {
      customSelectedColors.forEach(color => {
        const variantName = `${size} / ${color}`
        const skuSuffix = `${size.replace(/[^a-zA-Z0-9]/g, '')}-${color.toUpperCase().slice(0, 3)}`
        const matchedImage = getDynamicColorMatchedImage(color, activeCategoryKey, productDetail?.images, colorImageMap, form.name)
        combinations.push({
          product_id: productId,
          name: variantName,
          sku: `${form.sku}-${skuSuffix}`,
          selling_price: baseSelling,
          cost_price: baseCost,
          stock: 10,
          is_active: true,
          image: matchedImage,
        })
      })
    })

    if (combinations.length === 0) return

    setIsGeneratingVariants(true)
    setMatrixProgress({ current: 0, total: combinations.length })

    try {
      for (let i = 0; i < combinations.length; i++) {
        await productService.createVariant(combinations[i])
        setMatrixProgress({ current: i + 1, total: combinations.length })
      }
      refetchDetail()
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('products.matrixGeneratedSuccess', 'Generated variant matrix successfully!'))
    } catch {
      toast.error('Failed to generate all variants in matrix.')
    } finally {
      setIsGeneratingVariants(false)
      setMatrixProgress(null)
    }
  }

  // ─── Custom Attribute Handlers ────────────────────────────────────────────
  const handleAddUserCustomSize = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const trimmed = customInputSize.trim()
    if (!trimmed) return
    if (!userAddedSizes.includes(trimmed)) setUserAddedSizes(prev => [...prev, trimmed])
    if (!customSelectedSizes.includes(trimmed)) setCustomSelectedSizes(prev => [...prev, trimmed])
    setCustomInputSize('')
  }

  const handleAddUserCustomColor = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const trimmed = customInputColor.trim()
    if (!trimmed) return
    const norm = normalizeColorName(trimmed)
    if (!customSelectedColors.includes(norm)) setCustomSelectedColors(prev => [...prev, norm])
    if (!userAddedColors.some(c => c.key.toLowerCase() === norm.toLowerCase())) {
      setUserAddedColors(prev => [...prev, { key: norm, name: norm, hex: customColorHex || '#6366f1' }])
    }
    setCustomInputColor('')
  }

  const handleClearAllVariants = async () => {
    if (!productId) return
    setIsClearingAllVariants(true)
    try {
      await productService.update(productId, { has_variants: false, variants: [] })
      setField('has_variants', false)
      refetchDetail()
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success(t('products.clearAllVariantsSuccess', 'Cleared all variants successfully.'))
    } finally {
      setIsClearingAllVariants(false)
      setIsClearAllVariantsOpen(false)
    }
  }

  // ─── Submit Form ──────────────────────────────────────────────────────────
  const validate = () => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) {
      errors.name = t('products.errors.nameRequired', 'Please enter product name')
    }
    if (!form.sku.trim()) {
      errors.sku = t('products.errors.skuRequired', 'Please enter SKU code')
    }
    if (!form.selling_price || isNaN(parseFloat(form.selling_price))) {
      errors.selling_price = t('products.errors.priceRequired', 'Please enter selling price')
    }
    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      if (errors.name || errors.sku) {
        setActiveTab('general')
      } else if (errors.selling_price) {
        setActiveTab('pricing')
      }
      focusFirstInvalidField(errors)
      return
    }

    const payload = {
      name:                form.name.trim(),
      sku:                 form.sku.trim() || generateSKU(form.name),
      barcode:             form.barcode.trim() || null,
      description:         form.description.trim() || null,
      short_description:   form.short_description.trim() || null,
      category_id:         form.category_id ? Number(form.category_id) : null,
      brand_id:            form.brand_id ? Number(form.brand_id) : null,
      unit_id:             form.unit_id ? Number(form.unit_id) : null,
      tax_id:              form.tax_id ? Number(form.tax_id) : null,
      cost_price:          parseFloat(form.cost_price) || 0,
      selling_price:       parseFloat(form.selling_price) || 0,
      compare_price:       form.compare_price ? parseFloat(form.compare_price) : null,
      weight:              form.weight ? parseFloat(form.weight) : null,
      length:              form.length ? parseFloat(form.length) : null,
      width:               form.width ? parseFloat(form.width) : null,
      height:              form.height ? parseFloat(form.height) : null,
      track_inventory:     !!form.track_inventory,
      has_variants:        !!form.has_variants,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      status:              form.status || 'active',
      is_featured:         !!form.is_featured,
      is_digital:          !!form.is_digital,
      meta_title:          form.meta_title.trim() || null,
      meta_description:    form.meta_description.trim() || null,
      meta_keywords:       form.meta_keywords.trim() || null,
    }

    saveMutation.mutate(payload)
  }

  if (isLoadingDetail) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isEdit && isErrorDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 max-w-xl mx-auto text-center">
        <CustomErrorMessage
          variant="card"
          severity="error"
          code={(detailError as any)?.response?.status || 500}
          title={t('errors.serverErrorTitle', 'Unable to Load Product')}
          message={(detailError as any)?.response?.data?.message || t('errors.serverErrorDesc', 'Failed to retrieve product details from server.')}
          details={(detailError as any)?.response?.data}
          onRetry={() => refetchDetail()}
          action={{
            label: t('back', 'Back to Products'),
            onClick: () => navigate('/products'),
          }}
          className="w-full shadow-2xl"
        />
      </div>
    )
  }

  const tabsList = [
    { id: 'general', label: t('tabGeneral', 'General & Media'), badge: null },
    { id: 'pricing', label: t('tabPricing', 'Pricing & Margins'), badge: form.selling_price ? `$${Number(form.selling_price || 0).toFixed(2)}` : null },
    { id: 'inventory', label: t('tabInventory', 'Inventory & Stock'), badge: form.track_inventory ? t('trackStockLevel', 'Track Stock') : null },
    { id: 'dimensions', label: t('tabDimensions', 'Dimensions & Shipping'), badge: form.weight ? `${form.weight}kg` : null },
    { id: 'seo', label: t('tabSEO', 'SEO & Meta'), badge: null },
    { id: 'variants', label: t('tabVariants', 'Product Variants'), badge: (productDetail?.variants?.length || 0) > 0 ? `${productDetail.variants.length}` : null },
  ]

  const handleNextTab = () => {
    const currentIndex = tabsList.findIndex(tab => tab.id === activeTab)
    if (currentIndex < tabsList.length - 1) {
      setActiveTab(tabsList[currentIndex + 1].id as any)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevTab = () => {
    const currentIndex = tabsList.findIndex(tab => tab.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabsList[currentIndex - 1].id as any)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isSubmitting={saveMutation.isPending}
      header={
        <ProductFormHeader
          isEdit={isEdit}
          productId={productId}
          productDetail={productDetail}
          // onOpenLivePreview={() => setIsLivePreviewOpen(true)}
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={saveMutation.isPending}
          onCancel={() => navigate('/products')}
          cancelPath="/products"
          submitLabel={isEdit ? t('products.saveChanges', 'Save Changes') : t('products.createProduct', 'Create Product')}
          extraActions={
            <div className="flex items-center gap-2">
              {tabsList.findIndex(tab => tab.id === activeTab) > 0 && (
                <button
                  type="button"
                  onClick={handlePrevTab}
                  className="h-9 min-h-[36px] px-3.5 sm:px-4 rounded-xl border border-border/80 dark:border-slate-700 bg-card dark:bg-slate-900 text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-white hover:bg-muted/80 text-xs sm:text-[13px] font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer active:scale-95"
                >
                  <ArrowLeft size={14} />
                  <span>{t('previous', 'Previous')}</span>
                </button>
              )}
              {tabsList.findIndex(tab => tab.id === activeTab) < tabsList.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextTab}
                  className="h-9 min-h-[36px] px-4 rounded-xl border border-border/80 dark:border-slate-700 bg-muted dark:bg-slate-800 text-foreground dark:text-slate-100 hover:bg-muted/80 text-xs sm:text-[13px] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                >
                  <span>{t('next', 'Next')}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          }
        />
      }
    >
      <FormContent maxWidth="3xl" layout="custom">
        <div className="space-y-6">
          {/* Navigation Tabs Pill Bar */}
          <div className="bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-xl p-1.5 shadow-2xs overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              {tabsList.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-100 hover:bg-muted/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        {/* Tab Content Panes */}
        <AnimatePresence mode="wait">
          {activeTab === 'general' && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-6"
            >
              <div className="xl:col-span-7">
                <ProductBasicInfoSection
                  form={form}
                  setField={setField}
                  categories={categories || []}
                  brands={brands || []}
                  units={units || []}
                  taxes={taxes || []}
                  isSkuManuallyEdited={isSkuManuallyEdited}
                  setIsSkuManuallyEdited={setIsSkuManuallyEdited}
                  generateSKU={generateSKU}
                  formErrors={formErrors}
                  onClearError={handleClearError}
                />
              </div>
              <div className="xl:col-span-5">
                <ProductMediaSection
                  isEdit={isEdit}
                  productId={productId}
                  productDetail={productDetail}
                  createImagePreviews={createImagePreviews}
                  createDragActive={createDragActive}
                  handleCreateDrag={handleCreateDrag}
                  handleCreateDrop={handleCreateDrop}
                  handleCreateImageFiles={handleCreateImageFiles}
                  handleRemoveCreateImage={handleRemoveCreateImage}
                  handleSetPrimaryCreateImage={handleSetPrimaryCreateImage}
                  onUpdateImagePrimary={(imgId) => updateImageMutation.mutate({ imgId, data: { is_primary: true } })}
                  onDeleteImage={(imgId) => deleteImageMutation.mutate({ productId: productId!, imgId })}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs"
            >
              <FlexiblePricingSection
                costPrice={form.cost_price}
                sellingPrice={form.selling_price}
                comparePrice={form.compare_price}
                taxId={form.tax_id}
                taxes={taxes || []}
                sellingPriceError={formErrors.selling_price}
                onCostPriceChange={(val) => setField('cost_price', val)}
                onSellingPriceChange={(val) => setField('selling_price', val)}
                onComparePriceChange={(val) => setField('compare_price', val)}
                onTaxIdChange={(val) => setField('tax_id', val)}
                showTaxSelector={true}
              />
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs"
            >
              <FlexibleInventorySection
                trackInventory={form.track_inventory}
                hasVariants={form.has_variants}
                lowStockThreshold={form.low_stock_threshold}
                onTrackInventoryChange={(val) => setField('track_inventory', val)}
                onHasVariantsChange={(val) => setField('has_variants', val)}
                onLowStockThresholdChange={(val) => setField('low_stock_threshold', val)}
                onSaveSettings={() => saveInventorySettingsMutation.mutate()}
                isSavingSettings={saveInventorySettingsMutation.isPending}
                warehouses={warehouses}
                movements={movementsData || []}
                isLoadingMovements={isLoadingMovements}
                currentStock={Number(productDetail?.stock ?? productDetail?.current_stock ?? (productDetail as any)?.quantity ?? 0)}
                costPrice={String(form.cost_price || '0')}
                sellingPrice={String(form.selling_price || '0')}
                variants={productDetail?.variants || []}
                onAddAdjustment={(adjData) => addAdjustmentMutation.mutate(adjData)}
                isAddingAdjustment={addAdjustmentMutation.isPending}
              />
            </motion.div>
          )}

          {activeTab === 'dimensions' && (
            <motion.div
              key="dimensions"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs"
            >
              <FlexibleDimensionsSection
                weight={form.weight}
                length={form.length}
                width={form.width}
                height={form.height}
                onWeightChange={(val) => setField('weight', val)}
                onLengthChange={(val) => setField('length', val)}
                onWidthChange={(val) => setField('width', val)}
                onHeightChange={(val) => setField('height', val)}
              />
            </motion.div>
          )}

          {activeTab === 'seo' && (
            <motion.div
              key="seo"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="bg-card border border-border/80 rounded-xl p-5 shadow-2xs"
            >
              <FlexibleSEOSection
                metaTitle={form.meta_title}
                metaKeywords={form.meta_keywords}
                metaDescription={form.meta_description}
                productName={form.name}
                onMetaTitleChange={(val) => setField('meta_title', val)}
                onMetaKeywordsChange={(val) => setField('meta_keywords', val)}
                onMetaDescriptionChange={(val) => setField('meta_description', val)}
              />
            </motion.div>
          )}

          {activeTab === 'variants' && (
            <motion.div
              key="variants"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              <ProductVariantsSection
                productId={productId}
                form={form}
                setField={setField}
                productDetail={productDetail}
                selectedPresetMode={selectedPresetMode}
                setSelectedPresetMode={setSelectedPresetMode}
                customSizeCategory={customSizeCategory}
                activeCategoryKey={activeCategoryKey}
                handleSwitchSizeCategory={handleSwitchSizeCategory}
                customSelectedSizes={customSelectedSizes}
                setCustomSelectedSizes={setCustomSelectedSizes}
                customInputSize={customInputSize}
                setCustomInputSize={setCustomInputSize}
                userAddedSizes={userAddedSizes}
                handleAddUserCustomSize={handleAddUserCustomSize}
                customSelectedColors={customSelectedColors}
                setCustomSelectedColors={setCustomSelectedColors}
                customInputColor={customInputColor}
                setCustomInputColor={setCustomInputColor}
                customColorHex={customColorHex}
                setCustomColorHex={setCustomColorHex}
                userAddedColors={userAddedColors}
                handleAddUserCustomColor={handleAddUserCustomColor}
                isGeneratingVariants={isGeneratingVariants}
                matrixProgress={matrixProgress}
                handleGenerateMatrix={handleGenerateMatrix}
                variantPage={variantPage}
                setVariantPage={setVariantPage}
                variantPageSize={variantPageSize}
                setVariantPageSize={setVariantPageSize}
                selectedVariantIds={selectedVariantIds}
                setSelectedVariantIds={setSelectedVariantIds}
                onOpenEditVariant={(v) => setEditingVariant({ ...v })}
                onOpenViewVariant={(v) => setViewingVariant({ ...v })}
                onOpenDeleteVariant={(v) => setVariantToDelete(v)}
                onOpenClearAllVariants={() => setIsClearAllVariantsOpen(true)}
                onOpenBulkDeleteVariants={() => setBulkDeleteVariantConfirmOpen(true)}
                onQuickToggleVariantStatus={(v) => updateVariantMutation.mutate({ id: v.id, data: { is_active: !v.is_active } })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </FormContent>

      {/* ─── MODALS & DRAWERS ─── */}
      {/* View Variant Details Modal */}
      <AnimatePresence>
        {viewingVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Package size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{t('products.variantDetails', 'Variant Details')}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{viewingVariant.sku || '—'}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setViewingVariant(null)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center gap-3">
                  {getVariantColorHex(viewingVariant) && (
                    <span
                      className="w-8 h-8 rounded-xl border border-black/20 shrink-0 shadow-2xs"
                      style={{ backgroundColor: getVariantColorHex(viewingVariant) || undefined }}
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{viewingVariant.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      viewingVariant.is_active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {viewingVariant.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('products.colPrice', 'Selling Price')}</span>
                    <p className="text-sm font-bold text-primary font-mono mt-0.5">${Number(viewingVariant.selling_price || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('products.colCostPrice', 'Cost Price')}</span>
                    <p className="text-sm font-bold text-muted-foreground font-mono mt-0.5">${Number(viewingVariant.cost_price || 0).toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{t('products.colStock', 'Stock')}</span>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{viewingVariant.stock ?? 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setViewingVariant(null)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    {t('common.close', 'Close')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const v = viewingVariant
                      setViewingVariant(null)
                      setEditingVariant({ ...v })
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit2 size={13} />
                    <span>{t('common.edit', 'Edit')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Variant Modal */}
      <AnimatePresence>
        {editingVariant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <h3 className="text-base font-bold text-foreground">{t('products.editVariantDetails', 'Edit Variant Details')}</h3>
                <button type="button" onClick={() => setEditingVariant(null)} className="p-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  updateVariantMutation.mutate({
                    id: editingVariant.id,
                    data: {
                      name: editingVariant.name,
                      sku: editingVariant.sku,
                      cost_price: parseFloat(editingVariant.cost_price) || 0,
                      selling_price: parseFloat(editingVariant.selling_price) || 0,
                      stock: parseFloat(editingVariant.stock) || 0,
                      is_active: !!editingVariant.is_active,
                      image: editingVariant.image || null,
                    }
                  })
                }}
                className="space-y-3.5 text-xs"
              >
                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">{t('products.variantName', 'Variant Name')} *</label>
                  <input
                    type="text"
                    required
                    value={editingVariant.name || ''}
                    onChange={e => setEditingVariant({ ...editingVariant, name: e.target.value })}
                    className="form-input text-xs w-full font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted-foreground mb-1">{t('products.sku', 'SKU')}</label>
                  <input
                    type="text"
                    value={editingVariant.sku || ''}
                    onChange={e => setEditingVariant({ ...editingVariant, sku: e.target.value })}
                    className="form-input text-xs font-mono w-full uppercase"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">{t('products.colPrice', 'Selling Price ($)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingVariant.selling_price || ''}
                      onChange={e => setEditingVariant({ ...editingVariant, selling_price: e.target.value })}
                      className="form-input text-xs font-mono font-bold text-primary w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">{t('products.colCostPrice', 'Cost Price ($)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingVariant.cost_price || ''}
                      onChange={e => setEditingVariant({ ...editingVariant, cost_price: e.target.value })}
                      className="form-input text-xs font-mono w-full"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-muted-foreground mb-1">{t('products.colStock', 'Stock')}</label>
                    <input
                      type="number"
                      value={editingVariant.stock ?? ''}
                      onChange={e => setEditingVariant({ ...editingVariant, stock: e.target.value })}
                      className="form-input text-xs font-mono font-bold text-emerald-600 w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="font-bold text-foreground">{t('products.activeInCatalog', 'Active in Catalog')}</span>
                  <button
                    type="button"
                    onClick={() => setEditingVariant({ ...editingVariant, is_active: !editingVariant.is_active })}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      editingVariant.is_active ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {editingVariant.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingVariant(null)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={updateVariantMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {updateVariantMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    <span>{t('products.saveChanges', 'Save Changes')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Single Variant Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!variantToDelete}
        title={t('products.variant', 'Variant')}
        itemName={variantToDelete?.name || ''}
        warningText={t('products.confirmDeleteVariant', 'Are you sure you want to delete this variant?')}
        isPending={deleteVariantMutation.isPending}
        onCancel={() => setVariantToDelete(null)}
        onSoftDelete={() => variantToDelete && deleteVariantMutation.mutate(variantToDelete.id)}
      />

      {/* Clear All Variants Confirmation */}
      <DeleteConfirmDialog
        isOpen={isClearAllVariantsOpen}
        title={t('products.allVariants', 'All Variants')}
        itemName={t('products.allVariants', 'All Product Variants')}
        warningText={t('products.confirmClearVariants', 'Are you sure you want to clear all variants for this product?')}
        isPending={isClearingAllVariants}
        onCancel={() => setIsClearAllVariantsOpen(false)}
        onSoftDelete={handleClearAllVariants}
      />

      {/* Bulk Delete Selected Variants Confirmation */}
      <DeleteConfirmDialog
        isOpen={bulkDeleteVariantConfirmOpen}
        title={t('variants.bulkDeleteTitle', 'Delete Selected Variants')}
        itemName={`${selectedVariantIds.length} items`}
        warningText={t('variants.confirmBulkDeleteMessage', {
          count: selectedVariantIds.length,
          defaultValue: `Are you sure you want to delete ${selectedVariantIds.length} selected variants?`
        }).replace('{{count}}', String(selectedVariantIds.length))}
        isPending={bulkDeleteVariantMutation.isPending}
        onCancel={() => setBulkDeleteVariantConfirmOpen(false)}
        onSoftDelete={() => bulkDeleteVariantMutation.mutate(selectedVariantIds)}
      />

      {/* Price History Modal */}
      <ProductPriceHistoryModal
        isOpen={isPriceHistoryOpen}
        onClose={() => setIsPriceHistoryOpen(false)}
        productName={form.name}
        priceHistory={productDetail?.price_history || []}
      />

      {/* Audit Log Modal */}
      <ProductAuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        productName={form.name}
        auditLogs={productDetail?.audit_logs || []}
      />

      {/* Live Preview Drawer */}
      {/* <ProductLivePreviewDrawer
        isOpen={isLivePreviewOpen}
        onClose={() => setIsLivePreviewOpen(false)}
        form={form}
        productDetail={productDetail}
        categories={categories || []}
        brands={brands || []}
        createImagePreviews={createImagePreviews}
      /> */}
    </FormLayout>
  )
}

export default ProductFormPage
