import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores'
import authService from '@/services/authService'

export interface GoogleUserProfile {
  sub: string
  name: string
  given_name?: string
  family_name?: string
  picture?: string
  email: string
  email_verified: boolean
}

export interface UseGoogleAuthOptions {
  onSuccessRedirect?: string
}

export function useGoogleAuth(options?: UseGoogleAuthOptions) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      setGoogleError(null)

      try {
        // 1. Fetch user profile from Google's userinfo endpoint using the access_token
        const userInfoRes = await axios.get<GoogleUserProfile>(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        )

        const profile = userInfoRes.data

        console.log('✅ Google User Authenticated:', {
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          google_id: profile.sub,
        })

        // 2. Submit to backend API endpoint (/api/v1/store/auth/google)
        const res = await authService.loginWithGoogle({
          email: profile.email,
          name: profile.name || profile.given_name || 'Google Customer',
          avatar: profile.picture,
          google_id: profile.sub,
          access_token: tokenResponse.access_token,
        })

        const data = res.data || res

        // 3. Update store and navigate
        login(data.access_token, data.user, data.customer)
        navigate(options?.onSuccessRedirect || '/account')
      } catch (err: any) {
        console.error('Google Auth Processing Error:', err)
        const errorMsg =
          err.response?.data?.message ||
          t('auth.google_login_failed', 'Google login failed. Please try again.')
        setGoogleError(errorMsg)
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: (errorResponse) => {
      setGoogleLoading(false)
      const err = errorResponse as any
      if (err?.error !== 'popup_closed_by_user') {
        console.error('Google Sign-In Error:', errorResponse)
        setGoogleError(
          t('auth.google_login_failed', 'Google login failed. Please try again.')
        )
      }
    },
  })

  const loginWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || clientId.trim() === '' || clientId.includes('not-configured')) {
      setGoogleError(
        'Google Client ID មិនទាន់បានកំណត់នៅឡើយទេ។ សូមកំណត់ VITE_GOOGLE_CLIENT_ID នៅក្នុង .env (Please set VITE_GOOGLE_CLIENT_ID in your .env file).'
      )
      return
    }

    setGoogleError(null)
    setGoogleLoading(true)
    triggerGoogleLogin()
  }

  return {
    loginWithGoogle,
    googleLoading,
    googleError,
    setGoogleError,
  }
}

export default useGoogleAuth
