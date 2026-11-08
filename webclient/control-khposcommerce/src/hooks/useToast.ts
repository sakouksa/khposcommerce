import { useMemo } from 'react'
import { useToastStore, type ToastOptions } from '@/stores/toastStore'
import { normalizeToastOptions, type ToastParam } from '@/utils/toast'

export type { ToastParam }

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  const removeToast = useToastStore((s) => s.removeToast)
  const clearToasts = useToastStore((s) => s.clearToasts)

  return useMemo(
    () => ({
      success: (param: ToastParam, duration?: number) =>
        addToast(normalizeToastOptions(param, 'success', duration)),
      error: (param: ToastParam, duration?: number) =>
        addToast(normalizeToastOptions(param, 'error', duration)),
      warning: (param: ToastParam, duration?: number) =>
        addToast(normalizeToastOptions(param, 'warning', duration)),
      info: (param: ToastParam, duration?: number) =>
        addToast(normalizeToastOptions(param, 'info', duration)),
      custom: (options: ToastOptions) => addToast(options),
      remove: (id: string) => removeToast(id),
      dismiss: (id?: string) => (id ? removeToast(id) : clearToasts()),
      clear: () => clearToasts(),
    }),
    [addToast, removeToast, clearToasts]
  )
}

export default useToast
