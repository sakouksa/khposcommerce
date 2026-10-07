import api from '@/api/client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductListParams {
  page?:        number
  per_page?:    number
  search?:      string
  status?:      string
  category_id?: number | string
  brand_id?:    number | string
  is_featured?: boolean
  sort?:        string
  order?:       'asc' | 'desc'
  sort_by?:     string
  sort_order?:  'asc' | 'desc'
  low_stock?:   boolean
  inventory?:   string
  [key: string]: any
}

export interface ProductPayload {
  company_id?:          number
  name:                 string
  sku:                  string
  barcode?:             string | null
  category_id?:         number | null
  brand_id?:            number | null
  unit_id?:             number | null
  tax_id?:              number | null
  description?:         string | null
  short_description?:   string | null
  cost_price?:          number | null
  selling_price:        number
  compare_price?:       number | null
  weight?:              number | null
  length?:              number | null
  width?:               number | null
  height?:              number | null
  has_variants?:        boolean
  variants?:            any[]
  track_inventory?:     boolean
  low_stock_threshold?: number
  status:               string
  is_featured?:         boolean
  is_digital?:          boolean
  meta_title?:          string | null
  meta_description?:    string | null
  meta_keywords?:       string | null
}

// ─── Product CRUD ─────────────────────────────────────────────────────────────

export const productService = {
  /** GET /products — paginated list */
  list: (params: ProductListParams = {}) =>
    api.get('/products', { params }).then(r => r.data),

  /** GET /products/dashboard-statistics */
  dashboardStatistics: () =>
    api.get('/products/dashboard-statistics').then(r => r.data.data ?? r.data),

  /** GET /products/:id — full detail with relations */
  show: (id: number | string) =>
    api.get(`/products/${id}`).then(r => r.data.data),

  /** POST /products */
  create: (payload: ProductPayload | any) =>
    api.post('/products', payload).then(r => r.data.data ?? r.data),

  /** PUT /products/:id */
  update: (id: number | string, payload: Partial<ProductPayload> | any) =>
    api.put(`/products/${id}`, payload).then(r => r.data.data ?? r.data),

  /** DELETE /products/:id */
  delete: (id: number | string) =>
    api.delete(`/products/${id}`).then(r => r.data),

  /** POST /products/bulk-delete */
  bulkDelete: (ids: (number | string)[]) =>
    api.post('/products/bulk-delete', { ids }).then(r => r.data),

  /** POST /products/import */
  import: (formData: FormData) =>
    api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  /** GET /products/export */
  export: () =>
    api.get('/products/export', { responseType: 'blob' }),

  // ── Images ──────────────────────────────────────────────────────────────────

  /** POST /products/:id/images  (multipart) */
  uploadImages: (productId: number | string, files: File[], primaryIndex = 0) => {
    const fd = new FormData()
    files.forEach(f => fd.append('images[]', f))
    fd.append('primary_index', String(primaryIndex))
    return api.post(`/products/${productId}/images`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  /** POST /product-images */
  createImage: (data: { product_id: number; image: string; alt_text?: string; is_primary?: boolean; sort_order?: number }) =>
    api.post('/product-images', data).then(r => r.data),

  /** DELETE /products/:productId/images/:imageId */
  deleteImage: (productId: number | string, imageId: number | string) =>
    api.delete(`/products/${productId}/images/${imageId}`).then(r => r.data),

  /** PUT /product-images/:id — set primary or sort_order */
  updateImage: (imageId: number | string, data: { is_primary?: boolean; sort_order?: number }) =>
    api.put(`/product-images/${imageId}`, data).then(r => r.data),

  // ── Variants ─────────────────────────────────────────────────────────────────

  /** GET /products/:id/variants */
  getVariants: (productId: number | string) =>
    api.get(`/products/${productId}/variants`).then(r => r.data.data ?? []),

  /** POST /product-variants */
  createVariant: (payload: {
    product_id: number | string; name: string; sku?: string
    cost_price?: number; selling_price: number; is_active?: boolean; attribute_values?: number[]
  }) => api.post('/product-variants', payload).then(r => r.data.data),

  /** PUT /product-variants/:id */
  updateVariant: (variantId: number | string, payload: {
    name?: string; sku?: string; cost_price?: number; selling_price?: number
    compare_price?: number; barcode?: string; is_active?: boolean; attribute_values?: number[]
  }) => api.put(`/product-variants/${variantId}`, payload).then(r => r.data.data),

  /** DELETE /product-variants/:id */
  deleteVariant: (variantId: number | string) =>
    api.delete(`/product-variants/${variantId}`).then(r => r.data),

  /** POST /product-variants/bulk-delete */
  bulkDeleteVariants: (ids: (number | string)[]) =>
    api.post('/product-variants/bulk-delete', { ids }).then(r => r.data),

  // ── Tiered Prices ─────────────────────────────────────────────────────────────

  /** POST /product-prices */
  createPrice: (payload: {
    product_id: number | string; price_type: string
    min_qty: number; price: number; currency_code?: string
    start_date?: string; end_date?: string
  }) => api.post('/product-prices', payload).then(r => r.data.data),

  /** DELETE /product-prices/:id */
  deletePrice: (priceId: number | string) =>
    api.delete(`/product-prices/${priceId}`).then(r => r.data),
}

export default productService
