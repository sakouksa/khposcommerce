import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import i18n, { ensureLanguageLoaded, buildActiveDict } from '../lib/i18n'
import { useAuthStore } from './authStore'


export interface FontConfig {
  family: string
  size: string
  weight: string
  lineHeight: string
  letterSpacing: string
}

export interface SidebarConfig {
  bgColor: string
  textColor: string
  activeBgColor: string
  activeTextColor: string
  hoverBgColor: string
  hoverTextColor: string
  borderColor: string
  width: number
  compact: boolean
  collapsed: boolean
  roundedStyle: string
}

export interface NavbarConfig {
  bgColor: string
  textColor: string
  borderColor: string
  shadow: 'none' | 'sm' | 'md' | 'lg'
  transparency: number // opacity value from 0 to 1
  height: number // in px
}

export interface LayoutConfig {
  contentWidth: 'full' | 'boxed'
  padding: string
  cardRadius: string
  tableRadius: string
  buttonRadius: string
  inputRadius: string
  modalRadius: string
  drawerRadius: string
}

export interface CardConfig {
  bgColor: string
  borderColor: string
  shadow: 'none' | 'sm' | 'md' | 'lg'
  radius: string
  hoverEffect: boolean
}

export interface ButtonConfig {
  primaryColor: string
  secondaryColor: string
  dangerColor: string
  successColor: string
  radius: string
  size: 'sm' | 'md' | 'lg'
  hoverAnimation: boolean
}

export interface TableConfig {
  rowHeight: 'compact' | 'comfortable' | 'spacious'
  headerBgColor: string
  headerTextColor: string
  zebraRows: boolean
  hoverBgColor: string
  borderColor: string
  density: 'compact' | 'comfortable' | 'spacious'
}

export interface FormConfig {
  inputRadius: string
  inputBorderColor: string
  focusRingColor: string
  labelWeight: string
  placeholderColor: string
}

export interface IconConfig {
  size: number
  style: 'stroke' | 'fill'
  color: string
}

export interface WidgetConfig {
  id: string
  visible: boolean
  size: 'small' | 'medium' | 'large'
  order: number
}

interface ThemeState {
  // Theme Mode
  themeMode: 'light' | 'dark' | 'system'
  language: 'en' | 'km'
  primaryColor: string
  
  // Custom configurations
  font: FontConfig
  sidebar: SidebarConfig
  navbar: NavbarConfig
  layout: LayoutConfig
  card: CardConfig
  button: ButtonConfig
  table: TableConfig
  form: FormConfig
  icon: IconConfig
  widgetsList: WidgetConfig[]

  // Action methods
  setLanguage: (lang: 'en' | 'km') => void
  updateThemeMode: (mode: 'light' | 'dark' | 'system') => void
  updatePrimaryColor: (color: string) => void
  updateFont: (config: Partial<FontConfig>) => void
  updateSidebar: (config: Partial<SidebarConfig>) => void
  updateNavbar: (config: Partial<NavbarConfig>) => void
  updateLayout: (config: Partial<LayoutConfig>) => void
  updateCard: (config: Partial<CardConfig>) => void
  updateButton: (config: Partial<ButtonConfig>) => void
  updateTable: (config: Partial<TableConfig>) => void
  updateForm: (config: Partial<FormConfig>) => void
  updateIcon: (config: Partial<IconConfig>) => void
  updateWidgetsList: (widgets: WidgetConfig[]) => void
  resetAll: () => void
}

import { DEFAULT_WIDGETS_LIST } from '@/config/dashboardWidgets'

const defaultWidgets: WidgetConfig[] = DEFAULT_WIDGETS_LIST


export function applyPrimaryCssVar(color: string) {
  if (!color) return
  let c = color.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  if (c.length !== 6) return
  const r = parseInt(c.substring(0, 2), 16) / 255
  const g = parseInt(c.substring(2, 4), 16) / 255
  const b = parseInt(c.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  const hDeg = Math.round(h * 360)
  const sPct = Math.round(s * 100)
  const lPct = Math.round(l * 100)
  document.documentElement.style.setProperty('--primary', `${hDeg} ${sPct}% ${lPct}%`)
  document.documentElement.style.setProperty('--ring', `${hDeg} ${sPct}% ${lPct}%`)
}

export function applyLayoutCssVars(layout: Partial<LayoutConfig>) {
  if (!layout) return
  if (layout.cardRadius) document.documentElement.style.setProperty('--card-radius', layout.cardRadius)
  if (layout.tableRadius) document.documentElement.style.setProperty('--table-radius', layout.tableRadius)
  if (layout.buttonRadius) document.documentElement.style.setProperty('--button-radius', layout.buttonRadius)
  if (layout.inputRadius) document.documentElement.style.setProperty('--input-radius', layout.inputRadius)
  if (layout.padding) document.documentElement.style.setProperty('--container-padding', layout.padding)
}

export function applyTableCssVars(table: Partial<TableConfig>) {
  if (!table) return
  const densityPadding = table.density === 'compact' ? '0.375rem 0.625rem' : table.density === 'spacious' ? '1rem 1.25rem' : '0.625rem 0.875rem'
  document.documentElement.style.setProperty('--table-density-padding', densityPadding)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'light',
      language: (localStorage.getItem('enterprise-pos-lang') as 'en' | 'km') || 'km',
      primaryColor: '#3b82f6',

      font: {
        family: 'Default',
        size: '14px',
        weight: '400',
        lineHeight: '1.5',
        letterSpacing: '0px',
      },

      sidebar: {
        bgColor: '#0f172a',
        textColor: '#94a3b8',
        activeBgColor: '#3b82f6',
        activeTextColor: '#ffffff',
        hoverBgColor: '#1e293b',
        hoverTextColor: '#ffffff',
        borderColor: '#1e293b',
        width: 256,
        compact: false,
        collapsed: false,
        roundedStyle: '0.5rem',
      },

      navbar: {
        bgColor: '#ffffff',
        textColor: '#0f172a',
        borderColor: '#e2e8f0',
        shadow: 'sm',
        transparency: 1,
        height: 64,
      },

      layout: {
        contentWidth: 'full',
        padding: '1.5rem',
        cardRadius: '0.75rem',
        tableRadius: '0.5rem',
        buttonRadius: '0.5rem',
        inputRadius: '0.5rem',
        modalRadius: '0.75rem',
        drawerRadius: '0.75rem',
      },

      card: {
        bgColor: '#ffffff',
        borderColor: '#e2e8f0',
        shadow: 'sm',
        radius: '0.75rem',
        hoverEffect: true,
      },

      button: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        dangerColor: '#ef4444',
        successColor: '#10b981',
        radius: '0.5rem',
        size: 'md',
        hoverAnimation: true,
      },

      table: {
        rowHeight: 'comfortable',
        headerBgColor: '#f8fafc',
        headerTextColor: '#475569',
        zebraRows: true,
        hoverBgColor: '#f1f5f9',
        borderColor: '#e2e8f0',
        density: 'comfortable',
      },

      form: {
        inputRadius: '0.5rem',
        inputBorderColor: '#cbd5e1',
        focusRingColor: '#3b82f6',
        labelWeight: '500',
        placeholderColor: '#94a3b8',
      },

      icon: {
        size: 18,
        style: 'stroke',
        color: '#64748b',
      },

      widgetsList: defaultWidgets,

      setLanguage: async (lang) => {
        await ensureLanguageLoaded(lang)
        localStorage.setItem('enterprise-pos-lang', lang)
        await i18n.changeLanguage(lang)
        buildActiveDict()
        set({ language: lang })
      },

      updateThemeMode: (mode) => {
        set({ themeMode: mode })
        const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        const authStore = useAuthStore.getState()
        if (authStore.darkMode !== isDark) {
          useAuthStore.setState({ darkMode: isDark })
        }
        document.documentElement.classList.toggle('dark', isDark)
      },
      updatePrimaryColor: (color) => {
        applyPrimaryCssVar(color)
        set((s) => ({
          primaryColor: color,
          sidebar: { ...s.sidebar, activeBgColor: color },
          button: { ...s.button, primaryColor: color },
        }))
      },
      updateFont: (config) => set((s) => ({ font: { ...s.font, ...config } })),
      updateSidebar: (config) => set((s) => ({ sidebar: { ...s.sidebar, ...config } })),
      updateNavbar: (config) => set((s) => ({ navbar: { ...s.navbar, ...config } })),
      updateLayout: (config) =>
        set((s) => {
          const next = { ...s.layout, ...config }
          applyLayoutCssVars(next)
          return { layout: next }
        }),
      updateCard: (config) => set((s) => ({ card: { ...s.card, ...config } })),
      updateButton: (config) => set((s) => ({ button: { ...s.button, ...config } })),
      updateTable: (config) =>
        set((s) => {
          const next = { ...s.table, ...config }
          applyTableCssVars(next)
          return { table: next }
        }),
      updateForm: (config) => set((s) => ({ form: { ...s.form, ...config } })),
      updateIcon: (config) => set((s) => ({ icon: { ...s.icon, ...config } })),
      updateWidgetsList: (widgets) => set({ widgetsList: widgets }),

      resetAll: () => {
        applyPrimaryCssVar('#3b82f6')
        set({
          themeMode: 'light',
          primaryColor: '#3b82f6',
          font: {
            family: 'Default',
            size: '14px',
            weight: '400',
            lineHeight: '1.5',
            letterSpacing: '0px',
          },
          sidebar: {
            bgColor: '#0f172a',
            textColor: '#94a3b8',
            activeBgColor: '#3b82f6',
            activeTextColor: '#ffffff',
            hoverBgColor: '#1e293b',
            hoverTextColor: '#ffffff',
            borderColor: '#1e293b',
            width: 256,
            compact: false,
            collapsed: false,
            roundedStyle: '0.5rem',
          },
          navbar: {
            bgColor: '#ffffff',
            textColor: '#0f172a',
            borderColor: '#e2e8f0',
            shadow: 'sm',
            transparency: 1,
            height: 64,
          },
          layout: {
            contentWidth: 'full',
            padding: '1.5rem',
            cardRadius: '0.75rem',
            tableRadius: '0.5rem',
            buttonRadius: '0.5rem',
            inputRadius: '0.5rem',
            modalRadius: '0.75rem',
            drawerRadius: '0.75rem',
          },
        card: {
          bgColor: '#ffffff',
          borderColor: '#e2e8f0',
          shadow: 'sm',
          radius: '0.75rem',
          hoverEffect: true,
        },
        button: {
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          dangerColor: '#ef4444',
          successColor: '#10b981',
          radius: '0.5rem',
          size: 'md',
          hoverAnimation: true,
        },
        table: {
          rowHeight: 'comfortable',
          headerBgColor: '#f8fafc',
          headerTextColor: '#475569',
          zebraRows: true,
          hoverBgColor: '#f1f5f9',
          borderColor: '#e2e8f0',
          density: 'comfortable',
        },
        form: {
          inputRadius: '0.5rem',
          inputBorderColor: '#cbd5e1',
          focusRingColor: '#3b82f6',
          labelWeight: '500',
          placeholderColor: '#94a3b8',
        },
        icon: {
          size: 18,
          style: 'stroke',
          color: '#64748b',
        },
        widgetsList: defaultWidgets,
      })
    },
  }),
  {
      name: 'enterprise-pos-customizer',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
