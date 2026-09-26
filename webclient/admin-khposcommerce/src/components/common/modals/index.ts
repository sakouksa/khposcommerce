// Modals & Drawers Suite - Sub-barrel export
export { default as Modal, Modal as AppModal, EnterpriseModal } from './Modal'
export type { EnterpriseModalProps, ModalProps, ModalSize } from './Modal'

export { default as ModalHeader } from './ModalHeader'
export type { ModalHeaderProps, ModalHeaderIconVariant } from './ModalHeader'

export { default as ModalFooter } from './ModalFooter'
export type { ModalFooterProps } from './ModalFooter'

export { default as ConfirmModal } from './ConfirmModal'
export type { ConfirmVariant, ConfirmModalProps } from './ConfirmModal'

export { default as DeleteConfirmDialog } from './DeleteConfirmDialog'

export {
  default as DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
} from './DetailDrawer'
export type {
  DetailDrawerProps,
  DetailDrawerSize,
  DetailDrawerIconVariant,
  DetailDrawerHeaderProps,
  DetailDrawerTabItem,
  DetailDrawerTabNavProps,
  DetailDrawerBodyProps,
  DetailDrawerFooterProps,
  DetailDrawerCardProps,
  DetailDrawerRowProps,
} from './DetailDrawer'

export { default as CustomerAddressModal } from './CustomerAddressModal'
export type { CustomerAddressModalProps, CustomerAddress, AddressFormData } from './CustomerAddressModal'

export { default as CustomerGroupModal } from './CustomerGroupModal'
export type { CustomerGroupModalProps, CustomerGroup, CustomerGroupFormData } from './CustomerGroupModal'

export { default as UpdateOrderStatusModal } from './UpdateOrderStatusModal'
export type { UpdateOrderStatusModalProps } from './UpdateOrderStatusModal'
