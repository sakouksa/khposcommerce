import { useQuery } from '@tanstack/react-query'
import {
  storeSettingsService,
  categoryService,
  brandService,
  productService,
  checkoutService,
  type PaymentMethodItem,
  type ShippingMethodItem,
  type ProvinceItem,
} from '@/services'
import type { Category, Brand, StoreSettings, Banner } from '@/types/store'

/**
 * Global hook to fetch and cache Store Settings (logo, phone, hotlines, etc.)
 */
export const useStoreSettings = () => {
  return useQuery<StoreSettings>({
    queryKey: ['storefront', 'settings'],
    queryFn: () => storeSettingsService.getSettings(),
    staleTime: 30 * 1000, // 30 seconds (reactive to Admin Dashboard changes)
    refetchOnWindowFocus: true,
  })
}

/**
 * Global hook to fetch and cache all Categories
 */
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['storefront', 'categories'],
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

/**
 * Global hook to fetch and cache all Official Brands
 */
export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: ['storefront', 'brands'],
    queryFn: () => brandService.getBrands(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

/**
 * Global hook to fetch products by category slug
 */
export const useCategoryProducts = (categorySlug?: string, limit = 4) => {
  return useQuery<ProductItem[]>({
    queryKey: ['storefront', 'category-products', categorySlug, limit],
    queryFn: async () => {
      if (!categorySlug) return []
      const res = await productService.getProducts({ category: categorySlug, per_page: limit })
      return (res.data || []) as ProductItem[]
    },
    enabled: Boolean(categorySlug),
    staleTime: 3 * 60 * 1000, // 3 minutes cache
  })
}

/**
 * Global hook to fetch and cache Hero Banners
 */
export const useBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ['storefront', 'banners'],
    queryFn: () => productService.getBanners(),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Global hook to fetch and cache active Payment Methods from database
 */
export const usePaymentMethods = () => {
  return useQuery<PaymentMethodItem[]>({
    queryKey: ['storefront', 'payment-methods'],
    queryFn: () => checkoutService.getPaymentMethods(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Global hook to fetch and cache active Shipping Methods from database
 */
export const useShippingMethods = () => {
  return useQuery<ShippingMethodItem[]>({
    queryKey: ['storefront', 'shipping-methods'],
    queryFn: () => checkoutService.getShippingMethods(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Global hook to fetch and cache Cambodian Provinces from database
 */
export const useProvinces = () => {
  return useQuery<ProvinceItem[]>({
    queryKey: ['storefront', 'provinces'],
    queryFn: () => checkoutService.getProvinces(),
    staleTime: 10 * 60 * 1000,
  })
}
