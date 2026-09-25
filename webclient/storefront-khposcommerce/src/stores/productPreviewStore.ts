import { create } from 'zustand'
import type { ProductItem } from '@/types/store'

export interface AnchorRect {
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
}

interface ProductPreviewState {
  // Modal Preview (on Eye Icon click)
  modalProduct: ProductItem | null
  isModalOpen: boolean
  openModal: (product: ProductItem) => void
  closeModal: () => void

  // Hover Specs Popover (on Desktop Card Hover)
  hoverProduct: ProductItem | null
  hoverRect: AnchorRect | null
  isHoverOpen: boolean
  isHoverLocked: boolean
  openHover: (product: ProductItem, rect?: DOMRect | AnchorRect | null) => void
  closeHover: () => void
  setHoverLocked: (locked: boolean) => void

  // Backward-compatible aliases
  activeProduct: ProductItem | null
  isOpen: boolean
  openPreview: (product: ProductItem, rect?: DOMRect | AnchorRect | null) => void
  closePreview: () => void
}

const toAnchorRect = (rect?: DOMRect | AnchorRect | null): AnchorRect | null => {
  if (!rect) return null
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
  }
}

export const useProductPreviewStore = create<ProductPreviewState>()((set, get) => ({
  // Modal State
  modalProduct: null,
  isModalOpen: false,
  openModal: (product) => {
    set({
      modalProduct: product,
      isModalOpen: true,
      activeProduct: product,
      isOpen: true,
      // close hover popover when modal opens
      isHoverOpen: false,
      hoverProduct: null,
    })
  },
  closeModal: () => {
    set({
      modalProduct: null,
      isModalOpen: false,
      activeProduct: null,
      isOpen: false,
    })
  },

  // Hover State
  hoverProduct: null,
  hoverRect: null,
  isHoverOpen: false,
  isHoverLocked: false,
  openHover: (product, rect) => {
    // Don't open hover if modal is currently open
    if (get().isModalOpen) return
    set({
      hoverProduct: product,
      hoverRect: toAnchorRect(rect),
      isHoverOpen: true,
      isHoverLocked: false,
    })
  },
  closeHover: () => {
    set({
      hoverProduct: null,
      hoverRect: null,
      isHoverOpen: false,
      isHoverLocked: false,
    })
  },
  setHoverLocked: (locked) => {
    set({ isHoverLocked: locked })
  },

  // Aliases for compatibility
  activeProduct: null,
  isOpen: false,
  openPreview: (product) => {
    get().openModal(product)
  },
  closePreview: () => {
    get().closeModal()
  },
}))

export default useProductPreviewStore
