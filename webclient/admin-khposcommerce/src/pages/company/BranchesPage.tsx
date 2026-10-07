import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Pagination from '@/components/shared/Pagination'
import { useServerPagination } from '@/hooks/useServerPagination'
import TableWrapper from '@/components/shared/TableWrapper'
import SearchInput from '@/components/shared/SearchInput'
import ResetButton from '@/components/shared/ResetButton'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Edit2, Trash2, RefreshCw, X, Building2,
  ToggleLeft, ToggleRight, Eye, Mail, Phone, MapPin, Loader2, Star, Check
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import PageHeader from '@/components/common/PageHeader'
import Breadcrumb from '@/components/common/Breadcrumb'
import { StatusBadge, CloseButton, FieldError, getFieldClass, TableToolbar } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface Branch {
  id:          number
  company_id:  number
  name:        string
  code:        string
  email?:      string
  phone?:      string
  address?:    string
  city?:       string
  province?:   string
  postal_code?: string
  is_main:     boolean
  is_active:   boolean
}

const BranchesPage: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
  const { t } = useTranslation(['settings', 'common'])
  const qc = useQueryClient()
  const toast = useToast()
    const {
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    debouncedSearch,
    reset,
    adjustAfterDelete,
  } = useServerPagination({ storageKey: 'branches' })
    const [modalOpen, setModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [viewBranch, setViewBranch] = useState<Branch | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [isMain, setIsMain] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleClearError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['branches', page, debouncedSearch, perPage],
    queryFn: () => companyService.getBranches({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (newBranch: any) => companyService.createBranch(newBranch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch created successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create branch.'
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => companyService.updateBranch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update branch.'
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyService.deleteBranch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch deleted successfully.')
      adjustAfterDelete(branches.length)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete branch.'
      toast.error(msg)
    }
  })

  const branches: Branch[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingBranch(null)
    setFormErrors({})
    setName('')
    setCode('')
    setEmail('')
    setPhone('')
    setAddress('')
    setCity('')
    setProvince('')
    setPostalCode('')
    setIsMain(false)
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch)
    setFormErrors({})
    setName(branch.name)
    setCode(branch.code)
    setEmail(branch.email ?? '')
    setPhone(branch.phone ?? '')
    setAddress(branch.address ?? '')
    setCity(branch.city ?? '')
    setProvince(branch.province ?? '')
    setPostalCode(branch.postal_code ?? '')
    setIsMain(branch.is_main)
    setIsActive(branch.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingBranch(null)
    setFormErrors({})
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!code.trim()) {
      errors.code = t('settings.errors.branchCodeRequired', 'Please enter branch code')
    }
    if (!name.trim()) {
      errors.name = t('settings.errors.branchNameRequired', 'Please enter branch name')
    }
    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      focusFirstInvalidField(errors)
      return
    }

    const payload = {
      company_id: 1,
      name,
      code,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      province: province || null,
      postal_code: postalCode || null,
      is_main: isMain,
      is_active: isActive
    }

    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: 'Company' }, { label: 'Branches' }]} />

          <PageHeader
            icon={<Building2 size={24} />}
            title="Branches"
            subtitle="Manage corporate office and store branch coordinates"
            action={
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
                           bg-gradient-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus size={16} />
                Add Branch
              </button>
            }
          />
        </>
      )}

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search branches..."
        onReset={reset}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['branches'] })}
        refreshLoading={isFetching}
        rightActions={
          isTab ? (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 h-10 min-h-[40px] text-xs sm:text-[13px] font-semibold text-white
                         bg-gradient-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              Add Branch
            </button>
          ) : undefined
        }
      />

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
      <TableWrapper isFetching={isFetching}>
        <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Branch</th>
                <th className="text-left">Code</th>
                <th className="text-left">Contact</th>
                <th className="text-left">Location</th>
                <th className="text-left">Main</th>
                <th className="text-left">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className="skeleton h-4 w-32 rounded" /></td>
                      <td><div className="skeleton h-4 w-16 rounded" /></td>
                      <td><div className="skeleton h-4 w-28 rounded" /></td>
                      <td><div className="skeleton h-4 w-36 rounded" /></td>
                      <td><div className="skeleton h-4 w-10 rounded" /></td>
                      <td><div className="skeleton h-4 w-16 rounded" /></td>
                      <td><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
                    </tr>
                  ))
                : branches.map((b) => (
                    <tr key={b.id} className="group hover:bg-muted/25 transition-colors">
                      <td>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-primary flex-shrink-0" />
                          <div>
                            <span className="font-medium text-foreground text-sm">{b.name}</span>
                            {b.is_main && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                                <Star size={10} fill="currentColor" /> Main
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-muted-foreground">{b.code}</td>
                      <td>
                        <div className="text-xs space-y-0.5 text-muted-foreground">
                          {b.email && <div className="flex items-center gap-1"><Mail size={10} /> {b.email}</div>}
                          {b.phone && <div className="flex items-center gap-1"><Phone size={10} /> {b.phone}</div>}
                        </div>
                      </td>
                      <td className="text-muted-foreground text-sm">
                        {b.city ? `${b.city}, ${b.province}` : b.address ?? '—'}
                      </td>
                      <td>
                        {b.is_main ? (
                          <span className="text-green-500 flex items-center gap-0.5 text-xs font-semibold">
                            <Check size={14} /> Yes
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={b.is_active} />
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          variant="inline"
                          onView={() => setViewBranch(b)}
                          onEdit={() => openEditModal(b)}
                          onDelete={() => {
                            if (confirm('Are you sure you want to delete this branch?')) deleteMutation.mutate(b.id)
                          }}
                        />
                      </td>
                    </tr>
                  ))
              }
              {!isLoading && branches.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Building2 size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No branches found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </TableWrapper>
      </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">
                  {editingBranch ? 'Edit Branch' : 'Add Branch'}
                </h3>
                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Code <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="code"
                      name="code"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value)
                        handleClearError('code')
                      }}
                      placeholder="BR001"
                      className={getFieldClass(formErrors.code, 'form-input w-full')}
                    />
                    <FieldError error={formErrors.code} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Name <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        handleClearError('name')
                      }}
                      placeholder="Branch Name"
                      className={getFieldClass(formErrors.name, 'form-input w-full')}
                    />
                    <FieldError error={formErrors.name} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="branch@company.com"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/[^\d+ -]/g, ''))}
                      placeholder="012 345 678"
                      className="form-input font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Physical address"
                    rows={2}
                    className="form-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Province</label>
                    <input
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Province"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Postal Code</label>
                    <input
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Postal Code"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isMain"
                      checked={isMain}
                      onChange={(e) => setIsMain(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <label htmlFor="isMain" className="text-sm font-medium text-muted-foreground cursor-pointer">
                      Mark as Main Branch
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Active Status</span>
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className="text-primary hover:opacity-80 transition-opacity"
                    >
                      {isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-primary rounded-lg hover:opacity-90 shadow-sm flex items-center gap-1.5"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                    {editingBranch ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {viewBranch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-md border-l border-border h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Branch Detail</h3>
                <CloseButton onClose={() => setViewBranch(null)} size="md" color="rose" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Basic Info</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono font-medium">{viewBranch.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{viewBranch.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Main Office:</span>
                      <span className="font-medium">{viewBranch.is_main ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={viewBranch.is_active} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact Details</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{viewBranch.email ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{viewBranch.phone ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location Address</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-start gap-1"><MapPin size={14} className="mt-0.5" /> Address:</span>
                      <span className="font-medium text-right max-w-[200px] break-words">{viewBranch.address ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">City:</span>
                      <span className="font-medium">{viewBranch.city ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Province:</span>
                      <span className="font-medium">{viewBranch.province ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Postal Code:</span>
                      <span className="font-medium">{viewBranch.postal_code ?? '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BranchesPage
