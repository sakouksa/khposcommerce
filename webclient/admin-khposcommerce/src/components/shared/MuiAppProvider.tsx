import React, { useMemo, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import type {} from '@mui/x-date-pickers/themeAugmentation'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/km'
import 'dayjs/locale/en'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useThemeStore } from '@/stores/themeStore'

dayjs.extend(customParseFormat)

export interface MuiAppProviderProps {
  children: React.ReactNode
}

export const MuiAppProvider: React.FC<MuiAppProviderProps> = ({ children }) => {
  const customizer = useThemeStore()

  const isDark =
    customizer.themeMode === 'dark' ||
    (customizer.themeMode === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const lang = customizer.language === 'km' ? 'km' : 'en'

  useEffect(() => {
    dayjs.locale(lang)
  }, [lang])

  const theme = useMemo(() => {
    const primaryColor = customizer.primaryColor || '#2563eb'

    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: primaryColor,
        },
        background: {
          default: isDark ? '#0b0f19' : '#ffffff',
          paper: isDark ? '#141d2e' : '#ffffff',
        },
        text: {
          primary: isDark ? '#f1f5f9' : '#0f172a',
          secondary: isDark ? '#94a3b8' : '#64748b',
        },
        divider: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      },
      shape: {
        borderRadius: 12,
      },
      typography: {
        fontFamily: "'Kantumruy Pro', 'Battambang', 'Inter', system-ui, sans-serif",
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              borderRadius: 16,
              border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: isDark
                ? '0 20px 30px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                : '0 20px 30px -10px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.95)',
              fontSize: '0.8125rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.15)',
                transition: 'all 0.2s ease',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: primaryColor,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: primaryColor,
                borderWidth: 2,
              },
            },
            input: {
              padding: '8px 12px',
              height: '1.25em',
            },
          },
        },
        MuiPickerPopper: {
          styleOverrides: {
            root: {
              zIndex: 99999, // Float comfortably above standard drawers (z-50) and modals
            },
          },
        },
        MuiPickerDay: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 600,
              '&.Mui-selected': {
                backgroundColor: primaryColor,
                color: '#ffffff',
                fontWeight: 800,
                '&:hover': {
                  backgroundColor: primaryColor,
                },
              },
            },
          },
        },
      },
    })
  }, [isDark, customizer.primaryColor])

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={lang}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default MuiAppProvider
