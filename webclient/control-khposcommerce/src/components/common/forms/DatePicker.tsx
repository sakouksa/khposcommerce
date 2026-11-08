import React, { useMemo } from 'react'
import { DatePicker as MuiDatePickerRoot } from '@mui/x-date-pickers/DatePicker'
import { TimePicker as MuiTimePickerRoot } from '@mui/x-date-pickers/TimePicker'
import { DateTimePicker as MuiDateTimePickerRoot } from '@mui/x-date-pickers/DateTimePicker'
import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

// ─── 1. DatePicker (MUI DatePicker) ──────────────────────────────────────────

export interface DatePickerProps {
  value?: string | null // e.g. YYYY-MM-DD
  onChange?: (dateStr: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  className?: string
  buttonClassName?: string // backward compatibility
  align?: 'left' | 'right' // backward compatibility
  minDate?: string
  maxDate?: string
  format?: string // defaults to 'YYYY-MM-DD'
  views?: readonly ('year' | 'month' | 'day')[]
  error?: boolean
  helperText?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'YYYY-MM-DD',
  disabled = false,
  required = false,
  clearable = true,
  className = '',
  minDate,
  maxDate,
  size = 'small',
  format = 'YYYY-MM-DD',
  views,
  error = false,
  helperText,
}) => {
  const parsedValue: Dayjs | null = useMemo(() => {
    if (!value) return null
    const d = dayjs(value)
    return d.isValid() ? d : null
  }, [value])

  const parsedMinDate = useMemo(() => (minDate ? dayjs(minDate) : undefined), [minDate])
  const parsedMaxDate = useMemo(() => (maxDate ? dayjs(maxDate) : undefined), [maxDate])

  const handleChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      onChange?.('')
    } else {
      onChange?.(newValue.format(format))
    }
  }

  return (
    <div className={`inline-block w-full ${className}`}>
      {label && (
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}
      <MuiDatePickerRoot
        value={parsedValue}
        onChange={handleChange}
        disabled={disabled}
        minDate={parsedMinDate}
        maxDate={parsedMaxDate}
        format={format}
        views={views}
        slotProps={{
          textField: {
            size,
            fullWidth: true,
            placeholder,
            required,
            error,
            helperText,
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: size === 'small' ? '38px' : '44px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              },
              '& .MuiInputBase-input': {
                padding: size === 'small' ? '8px 12px' : '10px 14px',
                fontSize: '0.8125rem',
              },
              '& .MuiIconButton-root': {
                padding: '5px',
                marginRight: '2px',
              },
            },
          },
          field: {
            clearable: clearable !== false,
          },
          popper: {
            sx: {
              zIndex: 99999, // Float above drawers and dialogs
            },
          },
        }}
      />
    </div>
  )
}

// ─── 2. TimePicker (MUI TimePicker) ──────────────────────────────────────────

export interface TimePickerProps {
  value?: string | null // e.g. '14:30' or '14:30:00'
  onChange?: (timeStr: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  className?: string
  minTime?: string
  maxTime?: string
  size?: 'small' | 'medium'
  format?: string // defaults to 'HH:mm'
  ampm?: boolean // false for 24h, true for 12h
  error?: boolean
  helperText?: string
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'HH:mm',
  disabled = false,
  required = false,
  clearable = true,
  className = '',
  minTime,
  maxTime,
  size = 'small',
  format = 'HH:mm',
  ampm = false,
  error = false,
  helperText,
}) => {
  const parsedValue: Dayjs | null = useMemo(() => {
    if (!value) return null
    // Support formats like HH:mm or HH:mm:ss or full ISO
    const d = dayjs(value, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm'])
    if (d.isValid()) return d
    const fallback = dayjs(`2000-01-01 ${value}`)
    return fallback.isValid() ? fallback : null
  }, [value])

  const parsedMinTime = useMemo(() => (minTime ? dayjs(`2000-01-01 ${minTime}`) : undefined), [minTime])
  const parsedMaxTime = useMemo(() => (maxTime ? dayjs(`2000-01-01 ${maxTime}`) : undefined), [maxTime])

  const handleChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      onChange?.('')
    } else {
      onChange?.(newValue.format(format))
    }
  }

  return (
    <div className={`inline-block w-full ${className}`}>
      {label && (
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}
      <MuiTimePickerRoot
        value={parsedValue}
        onChange={handleChange}
        disabled={disabled}
        minTime={parsedMinTime}
        maxTime={parsedMaxTime}
        ampm={ampm}
        format={format}
        slotProps={{
          textField: {
            size,
            fullWidth: true,
            placeholder,
            required,
            error,
            helperText,
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: size === 'small' ? '38px' : '44px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              },
              '& .MuiInputBase-input': {
                padding: size === 'small' ? '8px 12px' : '10px 14px',
                fontSize: '0.8125rem',
              },
              '& .MuiIconButton-root': {
                padding: '5px',
                marginRight: '2px',
              },
            },
          },
          field: {
            clearable: clearable !== false,
          },
          popper: {
            sx: {
              zIndex: 99999,
            },
          },
        }}
      />
    </div>
  )
}

// ─── 3. DateTimePicker (MUI DateTimePicker) ───────────────────────────────

export interface DateTimePickerProps {
  value?: string | null // e.g. '2026-09-17T14:30' or '2026-09-17 14:30'
  onChange?: (dateTimeStr: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  clearable?: boolean
  className?: string
  minDateTime?: string
  maxDateTime?: string
  size?: 'small' | 'medium'
  format?: string // defaults to 'YYYY-MM-DD HH:mm'
  outputFormat?: string // format emitted to onChange, defaults to format
  ampm?: boolean
  error?: boolean
  helperText?: string
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'YYYY-MM-DD HH:mm',
  disabled = false,
  required = false,
  clearable = true,
  className = '',
  minDateTime,
  maxDateTime,
  size = 'small',
  format = 'YYYY-MM-DD HH:mm',
  outputFormat,
  ampm = false,
  error = false,
  helperText,
}) => {
  const parsedValue: Dayjs | null = useMemo(() => {
    if (!value) return null
    const d = dayjs(value)
    return d.isValid() ? d : null
  }, [value])

  const parsedMinDateTime = useMemo(() => (minDateTime ? dayjs(minDateTime) : undefined), [minDateTime])
  const parsedMaxDateTime = useMemo(() => (maxDateTime ? dayjs(maxDateTime) : undefined), [maxDateTime])

  const emitFormat = outputFormat || format

  const handleChange = (newValue: Dayjs | null) => {
    if (!newValue || !newValue.isValid()) {
      onChange?.('')
    } else {
      onChange?.(newValue.format(emitFormat))
    }
  }

  return (
    <div className={`inline-block w-full ${className}`}>
      {label && (
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
          {label} {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      )}
      <MuiDateTimePickerRoot
        value={parsedValue}
        onChange={handleChange}
        disabled={disabled}
        minDateTime={parsedMinDateTime}
        maxDateTime={parsedMaxDateTime}
        ampm={ampm}
        format={format}
        slotProps={{
          textField: {
            size,
            fullWidth: true,
            placeholder,
            required,
            error,
            helperText,
            sx: {
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: size === 'small' ? '38px' : '44px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              },
              '& .MuiInputBase-input': {
                padding: size === 'small' ? '8px 12px' : '10px 14px',
                fontSize: '0.8125rem',
              },
              '& .MuiIconButton-root': {
                padding: '5px',
                marginRight: '2px',
              },
            },
          },
          field: {
            clearable: clearable !== false,
          },
          popper: {
            sx: {
              zIndex: 99999,
            },
          },
        }}
      />
    </div>
  )
}

// ─── 4. MonthPicker (MUI MonthPicker) ──────────────────────────────────────────
export interface MonthPickerProps extends Omit<DatePickerProps, 'views'> {}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  format = 'YYYY-MM',
  placeholder = 'YYYY-MM',
  ...props
}) => {
  return (
    <DatePicker
      {...props}
      views={['year', 'month']}
      format={format}
      placeholder={placeholder}
    />
  )
}

// ─── Backward Compatibility Aliases ───────────────────────────────────────────
export type EnterpriseDatePickerProps = DatePickerProps
export const EnterpriseDatePicker = DatePicker

export type EnterpriseMonthPickerProps = MonthPickerProps
export const EnterpriseMonthPicker = MonthPicker

export type EnterpriseTimePickerProps = TimePickerProps
export const EnterpriseTimePicker = TimePicker

export type EnterpriseDateTimePickerProps = DateTimePickerProps
export const EnterpriseDateTimePicker = DateTimePicker

export const MuiDatePicker = DatePicker
export const MuiMonthPicker = MonthPicker
export const MuiTimePicker = TimePicker
export const MuiDateTimePicker = DateTimePicker

export const AppDatePicker = DatePicker
export const AppMonthPicker = MonthPicker
export const AppTimePicker = TimePicker
export const AppDateTimePicker = DateTimePicker

export type AppDatePickerProps = DatePickerProps
export type AppMonthPickerProps = MonthPickerProps
export type AppTimePickerProps = TimePickerProps
export type AppDateTimePickerProps = DateTimePickerProps

export default DatePicker
