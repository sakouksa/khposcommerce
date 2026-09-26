import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { useThemeStore } from './themeStore'

export interface UserCompany {
  id: number
  name: string
  logo?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  tax_number?: string | null
  city?: string | null
  province?: string | null
  country?: string | null
}

export interface UserBranch {
  id: number
  name: string
  address?: string | null
}

export interface UserEmployee {
  id: number
  employee_number: string
  status?: string | null
}

export interface User {
  id: number
  name: string
  username?: string | null
  email: string
  phone?: string | null
  avatar?: string | null
  roles: string[]
  permissions: string[]
  company?: UserCompany | null
  branch?: UserBranch | null
  employee?: UserEmployee | null
}

interface AuthState {
  user:         User | null
  token:        string | null
  accessToken:  string | null
  refreshToken: string | null
  isLoggedIn:   boolean
  darkMode:     boolean
  setAuth:      (user: User, accessToken: string, refreshToken?: string | null) => void
  setTokens:    (accessToken: string, refreshToken?: string | null) => void
  updateUser:   (user: Partial<User>) => void
  logout:       () => void
  toggleDark:   () => void
  hasRole:      (role: string | string[]) => boolean
  hasPermission:(permission: string | string[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:         null,
      token:        null,
      accessToken:  null,
      refreshToken: null,
      isLoggedIn:   false,
      darkMode:     false,

      setAuth: (user, accessToken, refreshToken = null) => {
        set({
          user,
          token: accessToken,
          accessToken,
          refreshToken: refreshToken || get().refreshToken,
          isLoggedIn: true,
        })
      },

      setTokens: (accessToken, refreshToken = null) => {
        set((state) => ({
          token: accessToken,
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
        }))
      },

      updateUser: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }))
      },

      logout: () => {
        set({
          user: null,
          token: null,
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
        })
      },

      toggleDark: () => {
        const dark = !get().darkMode
        set({ darkMode: dark })
        document.documentElement.classList.toggle('dark', dark)
        const themeStore = useThemeStore.getState()
        if ((dark && themeStore.themeMode !== 'dark') || (!dark && themeStore.themeMode !== 'light')) {
          themeStore.updateThemeMode(dark ? 'dark' : 'light')
        }
      },

      hasRole: (role) => {
        const userRoles = get().user?.roles ?? []
        if (Array.isArray(role)) {
          return role.some((r) => userRoles.includes(r))
        }
        return userRoles.includes(role)
      },

      hasPermission: (permission) => {
        const user = get().user
        if (!user) return false
        if (user.roles?.includes('super_admin') || user.roles?.includes('admin')) return true
        
        const userPermissions = user.permissions ?? []
        if (Array.isArray(permission)) {
          return permission.some((p) => userPermissions.includes(p))
        }
        return userPermissions.includes(permission)
      },
    }),
    {
      name:    'enterprise-pos-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user:         state.user,
        token:        state.token,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
        isLoggedIn:   state.isLoggedIn,
        darkMode:     state.darkMode,
      }),
    }
  )
)
