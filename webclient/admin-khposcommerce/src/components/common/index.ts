// Common shared components — Root Master Barrel Export

// 1. Cards Suite (Flutter 3 Flatten, Ribbon, Enterprise Stats & Charts)
export * from './cards'

// 2. Forms & Inputs Suite (Layouts, Fields, Pickers, Selects)
export * from './forms'

// 3. Modals, Drawers & Dialogs Suite
export * from './modals'

// 4. Tables & Toolbars Suite
export * from './tables'

// 5. Buttons & Action Groups Suite
export * from './buttons'

// 6. Badges & Indicators Suite
export * from './badges'

// 7. Media, Avatars & Visuals Suite
export * from './media'

// 8. Feedback, Loading & Error State Suite
export * from './feedback'

// 9. Navigation Suite
export * from './navigation'

// 10. Showcase & Demo Playground
export * from './showcase'

// 11. Shared Cross-component Re-exports (preserves existing imports)
export { default as ModernSelect } from '../shared/ModernSelect'
export type { ModernSelectProps, Option as ModernSelectOption } from '../shared/ModernSelect'
export { default as TableActionMenu } from '../shared/TableActionMenu'
export type { TableActionItem } from '../shared/TableActionMenu'
export { default as SearchInput } from '../shared/SearchInput'
export type { SearchInputProps } from '../shared/SearchInput'
export { default as ColumnSettingsPopover } from '../shared/ColumnSettingsPopover'
export type { ColumnOption } from '../shared/ColumnSettingsPopover'
export { default as ConfirmDialog } from '../shared/ConfirmDialog'
export type { ConfirmDialogProps } from '../shared/ConfirmDialog'
export { default as BulkSelectionBanner } from '../shared/BulkSelectionBanner'
export { default as TableWrapper } from '../shared/TableWrapper'
export { default as LoadingSkeleton } from '../shared/LoadingSkeleton'
export { default as ProductThumbnail } from '@/pages/products/components/ProductThumbnail'
export type { ProductThumbnailProps } from '@/pages/products/components/ProductThumbnail'
export { AnimatedCounter } from '../shared/AnimatedCounter'

// Global Print & Official Document Standard Components
export { 
  GlobalPrintContainer, 
  GlobalPrintHeader, 
  GlobalPrintFooter,
  GlobalPrintContainer as PrintContainer,
  GlobalPrintHeader as PrintHeader,
  GlobalPrintFooter as PrintFooter,
} from '../shared/GlobalPrint'
export type { 
  GlobalPrintContainerProps,
  GlobalPrintHeaderProps, 
  CompanyPrintInfo,
  GlobalPrintFooterProps, 
  PrintSignatureRole 
} from '../shared/GlobalPrint'
