import { useToastStore, type ToastOptions } from '@/stores/toastStore'
import { translateString } from '@/lib/i18n'

export type ToastParam = string | (Omit<ToastOptions, 'type'> & { message: string })

export function normalizeToastOptions(
  param: ToastParam,
  type: 'success' | 'error' | 'warning' | 'info' | 'loading',
  duration?: number
): ToastOptions {
  if (typeof param === 'string') {
    return {
      type,
      message: translateString(param),
      duration: duration !== undefined ? duration : (type === 'loading' ? 0 : undefined),
    }
  }
  return {
    ...param,
    type,
    title: param.title ? translateString(param.title) : undefined,
    message: translateString(param.message),
    description: param.description ? translateString(param.description) : undefined,
    duration: param.duration ?? (duration !== undefined ? duration : (type === 'loading' ? 0 : undefined)),
  }
}

export const showToast = {
  success: (param: ToastParam, duration?: number) =>
    useToastStore.getState().addToast(normalizeToastOptions(param, 'success', duration)),
  error: (param: ToastParam, duration?: number) =>
    useToastStore.getState().addToast(normalizeToastOptions(param, 'error', duration)),
  warning: (param: ToastParam, duration?: number) =>
    useToastStore.getState().addToast(normalizeToastOptions(param, 'warning', duration)),
  info: (param: ToastParam, duration?: number) =>
    useToastStore.getState().addToast(normalizeToastOptions(param, 'info', duration)),
  loading: (param: ToastParam, duration?: number) =>
    useToastStore.getState().addToast(normalizeToastOptions(param, 'loading', duration ?? 0)),
  custom: (options: ToastOptions) => useToastStore.getState().addToast(options),
  dismiss: (id?: string) =>
    id ? useToastStore.getState().removeToast(id) : useToastStore.getState().clearToasts(),
}

export default showToast
