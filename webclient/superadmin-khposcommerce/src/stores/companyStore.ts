import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '@/api/client'

export interface BrandingInfo {
  brand_name: string
  brand_tagline: string
  brand_tagline_km: string
  company_name: string
  logo?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  currency?: string | null
  timezone?: string | null
}

const DEFAULT_BRANDING: BrandingInfo = {
  brand_name: 'OptaPOS',
  brand_tagline: 'Next-Generation Enterprise POS & Omni-Channel Commerce',
  brand_tagline_km: 'ប្រព័ន្ធគ្រប់គ្រងការលក់ និងពាណិជ្ជកម្មឆ្លាតវៃជំនាន់ក្រោយ',
  company_name: 'OptaPOS Enterprise',
  logo: '/logo.png',
  email: 'support@optapos.io',
  phone: '+855 23 888 999',
  address: 'Norodom Blvd, Phnom Penh, Cambodia',
  currency: 'USD',
  timezone: 'Asia/Phnom_Penh',
}

interface CompanyState {
  branding: BrandingInfo
  isLoading: boolean
  lastFetchedAt: number | null
  fetchBranding: (force?: boolean) => Promise<void>
  updateBranding: (data: Partial<BrandingInfo>) => void
}

import { useAuthStore } from './authStore'

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      branding: DEFAULT_BRANDING,
      isLoading: false,
      lastFetchedAt: null,

      fetchBranding: async (force = false) => {
        const now = Date.now()
        const lastFetched = get().lastFetchedAt
        // Cache for 5 minutes unless forced
        if (!force && lastFetched && now - lastFetched < 5 * 60 * 1000) {
          return
        }

        set({ isLoading: true })
        try {
          const res = await api.get('/public/branding')
          if (res.data?.data) {
            const fetched = res.data.data
            set({
              branding: {
                ...DEFAULT_BRANDING,
                ...fetched,
              },
              lastFetchedAt: now,
            })
            try {
              const authState = useAuthStore.getState()
              if (authState.user && authState.user.company) {
                authState.updateUser({
                  company: {
                    ...authState.user.company,
                    name: fetched.brand_name || fetched.company_name || authState.user.company.name,
                    logo: fetched.logo || authState.user.company.logo,
                  }
                })
              }
            } catch {}
          }
        } catch {
          // Fallback gracefully to default branding
        } finally {
          set({ isLoading: false })
        }
      },

      updateBranding: (data) => {
        set((state) => ({
          branding: { ...state.branding, ...data },
          lastFetchedAt: Date.now(),
        }))
        // Also keep authStore user.company in sync
        try {
          const authState = useAuthStore.getState()
          if (authState.user && authState.user.company) {
            authState.updateUser({
              company: {
                ...authState.user.company,
                ...(data.brand_name ? { name: data.brand_name } : {}),
                ...(data.company_name ? { name: data.company_name } : {}),
                ...(data.logo !== undefined ? { logo: data.logo } : {}),
              }
            })
          }
        } catch {
          // ignore
        }
      },
    }),
    {
      name: 'nexpos-company-branding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
