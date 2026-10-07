import React from 'react'
import { ModernSelect as ModernSelectBase } from '@/components/shared/ModernSelect'
import type { Option as BaseOption, ModernSelectProps as BaseProps } from '@/components/shared/ModernSelect'

export type SelectOption = BaseOption
export type ModernSelectProps = BaseProps

export const ModernSelect: React.FC<ModernSelectProps> = (props) => {
  return <ModernSelectBase {...props} />
}

export default ModernSelect
