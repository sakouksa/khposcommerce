import React from 'react'
import DatePicker, { type DatePickerProps } from '@/components/common/DatePicker'

export type ModernDatePickerProps = DatePickerProps

export const ModernDatePicker: React.FC<ModernDatePickerProps> = (props) => {
  return <DatePicker {...props} />
}

export default ModernDatePicker
