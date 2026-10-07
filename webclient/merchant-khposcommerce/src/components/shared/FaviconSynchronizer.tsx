import React, { useEffect } from 'react'
import { useCompanyStore } from '@/stores/companyStore'
import { useAuthStore } from '@/stores/authStore'
import { getAbsoluteImageUrl } from '@/utils/image'

/**
 * FaviconSynchronizer:
 * Ensures the browser tab favicon and application icon dynamically reflect
 * the single source of truth (Unified Brand Logo or Custom Dynamic Company Logo).
 */
export const FaviconSynchronizer: React.FC = () => {
  const { branding, fetchBranding } = useCompanyStore()
  const { user } = useAuthStore()

  useEffect(() => {
    // Eagerly ensure branding is loaded
    fetchBranding()
  }, [fetchBranding])

  useEffect(() => {
    const rawLogo = branding?.logo || user?.company?.logo
    const resolvedUrl = rawLogo ? getAbsoluteImageUrl(rawLogo) : '/favicon-32x32.png'
    const targetFavicon = resolvedUrl || '/favicon-32x32.png'

    // Update standard icon links
    const iconSelectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']",
    ]

    let foundAny = false
    iconSelectors.forEach((selector) => {
      const links = document.querySelectorAll<HTMLLinkElement>(selector)
      links.forEach((link) => {
        link.href = targetFavicon
        foundAny = true
      })
    })

    if (!foundAny) {
      const newLink = document.createElement('link')
      newLink.rel = 'icon'
      newLink.type = 'image/png'
      newLink.href = targetFavicon
      document.head.appendChild(newLink)
    }
  }, [branding?.logo, user?.company?.logo])

  return null
}

export default FaviconSynchronizer
