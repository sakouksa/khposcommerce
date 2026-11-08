import React from 'react'
import { Modal } from '@/components/common'
import { ModalFooter } from '@/components/common/ModalFooter'
import { FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CategoryForm } from '../types/finance.types'
const labelCls = 'block text-xs font-semibold text-foreground/90 dark:text-slate-200 mb-1.5'
const inputCls =
  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium'
const textareaCls =
  'w-full px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border border-border/80 dark:border-slate-700/80 bg-background dark:bg-slate-900/90 text-foreground dark:text-slate-100 placeholder:text-muted-foreground/70 dark:placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none'

export interface CategoryFormDrawerProps {
  isOpen: boolean
  onClose: () => void
  editingItem: any | null
  onSubmit: () => void
  isPending: boolean
  categoryForm: CategoryForm
  setCategoryForm: React.Dispatch<React.SetStateAction<CategoryForm>>
}

export const CategoryFormDrawer: React.FC<CategoryFormDrawerProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSubmit,
  isPending,
  categoryForm,
  setCategoryForm,
}) => {
  const { t } = useTranslation(['finance', 'common'])
  const isEdit = Boolean(editingItem)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? t('finance.edit_category', 'Edit Category') : t('finance.add_category', 'Add Category')}
      subtitle={t('finance.category_subtitle', 'Configure category name, code, description, and status')}
      icon={<FolderOpen size={20} />}
      iconVariant="amber"
      size="lg"
      footer={
        <ModalFooter
          onCancel={onClose}
          cancelLabel={t('common.cancel', 'Cancel')}
          onSubmit={onSubmit}
          isSubmitting={isPending}
          isEdit={isEdit}
          submitLabel={
            isEdit
              ? t('common.saveChanges', 'Save Changes')
              : t('common.save', 'Save')
          }
        />
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="p-5 sm:p-6 space-y-4"
      >
        <div>
          <label className={labelCls}>
            {t('finance.category_name', 'Category Name')} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={categoryForm.name}
            onChange={(e) => {
              setCategoryForm((p) => ({
                ...p,
                name: e.target.value,
                code: p.code || (e.target.value ? `EXP-${e.target.value.substring(0, 3).toUpperCase()}` : '')
              }))
            }}
            placeholder={t('finance.placeholder_category_name', 'e.g. Travel & Transport')}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>{t('finance.category_code', t('finance.code_col', 'Identifier Code'))}</label>
          <input
            type="text"
            value={categoryForm.code}
            onChange={(e) => setCategoryForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            placeholder="EXP-TRV"
            className={`${inputCls} font-mono uppercase text-xs`}
          />
        </div>

        <div>
          <label className={labelCls}>{t('finance.category_description', 'Description (Optional)')}</label>
          <textarea
            value={categoryForm.description || ''}
            onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
            placeholder={t('finance.placeholder_cat_desc', 'Brief overview description of this category...')}
            rows={3}
            className={textareaCls}
          />
        </div>

        {/* Active Status Card */}
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-muted/40 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/70">
          <div>
            <p className="text-xs font-semibold text-foreground">{t('finance.status_active_label', t('finance.status_active', 'Active Status'))}</p>
            <p className="text-[11px] text-muted-foreground">{t('finance.category_active_desc', t('finance.active_desc', 'Enable this expense category in the system'))}</p>
          </div>
          <input
            type="checkbox"
            id="catActive"
            checked={categoryForm.is_active}
            onChange={(e) => setCategoryForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
          />
        </div>
      </form>
    </Modal>
  )
}

export default CategoryFormDrawer
