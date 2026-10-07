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
  Plus, Search, Edit2, Trash2, RefreshCw, X, Warehouse,
  ToggleLeft, ToggleRight, Eye, Phone, User, MapPin, Loader2, Star, Check
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import { focusFirstInvalidField } from '@/utils/formValidation'
import PageHeader from '@/components/common/PageHeader'
import Breadcrumb from '@/components/common/Breadcrumb'
import StatusBadge from '@/components/common/StatusBadge'
import { FieldError, getFieldClass, TableToolbar } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface WarehouseItem {
  id:          number
  branch_id:   number
  branch?:     { name: string }
  name:        string
  code:        string
  address?:    string
  city?:       string
  province?:   string
  phone?:      string
  pic_name?:   string
  is_main:     boolean
  is_active:   boolean
}

const WarehousesPage: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
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
  } = useServerPagination({ storageKey: 'warehouses' })
    const [modalOpen, setModalOpen] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null)
  const [viewWarehouse, setViewWarehouse] = useState<WarehouseItem | null>(null)

  // Form states
  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [phone, setPhone] = useState('')
  const [picName, setPicName] = useState('')
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

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches().then(r => r.data ?? []),
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['warehouses', page, debouncedSearch, perPage],
    queryFn: () => companyService.getWarehouses({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (newWarehouse: any) => companyService.createWarehouse(newWarehouse),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Warehouse created successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create warehouse.'
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => companyService.updateWarehouse(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Warehouse updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update warehouse.'
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyService.deleteWarehouse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['warehouses'] })
      toast.success('Warehouse deleted successfully.')
      adjustAfterDelete(warehouses.length)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete warehouse.'
      toast.error(msg)
    }
  })

  const warehouses: WarehouseItem[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingWarehouse(null)
    setFormErrors({})
    setBranchId('')
    setName('')
    setCode('')
    setAddress('')
    setCity('')
    setProvince('')
    setPhone('')
    setPicName('')
    setIsMain(false)
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (wh: WarehouseItem) => {
    setEditingWarehouse(wh)
    setFormErrors({})
    setBranchId(wh.branch_id.toString())
    setName(wh.name)
    setCode(wh.code)
    setAddress(wh.address ?? '')
    setCity(wh.city ?? '')
    setProvince(wh.province ?? '')
    setPhone(wh.phone ?? '')
    setPicName(wh.pic_name ?? '')
    setIsMain(wh.is_main)
    setIsActive(wh.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingWarehouse(null)
    setFormErrors({})
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!branchId) {
      errors.branchId = t('settings.errors.warehouseBranchRequired', 'Please select a branch')
    }
    if (!code.trim()) {
      errors.code = t('settings.errors.warehouseCodeRequired', 'Please enter warehouse code')
    }
    if (!name.trim()) {
      errors.name = t('settings.errors.warehouseNameRequired', 'Please enter warehouse name')
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
      branch_id: Number(branchId),
      name,
      code,
      address: address || null,
      city: city || null,
      province: province || null,
      phone: phone || null,
      pic_name: picName || null,
      is_main: isMain,
      is_active: isActive
    }

    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: 'Company' }, { label: 'Warehouses' }]} />

          <PageHeader
            icon={<Warehouse size={24} />}
            title="Warehouses"
            subtitle="Manage inventory depots, main storage units, and stock centers"
            action={
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
                           bg-gradient-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus size={16} />
                Add Warehouse
              </button>
            }
          />
        </>
      )}

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search warehouses..."
        onReset={reset}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['warehouses'] })}
        refreshLoading={isFetching}
        rightActions={
          isTab ? (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 h-10 min-h-[40px] text-xs sm:text-[13px] font-semibold text-white
                         bg-gradient-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer ml-auto"
            >
              <Plus size={15} />
              Add Warehouse
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
                <th className="text-left">Warehouse</th>
                <th className="text-left">Code</th>
                <th className="text-left">Branch</th>
                <th className="text-left">PIC</th>
                <th className="text-left">Main Depot</th>
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
                      <td><div className="skeleton h-4 w-24 rounded" /></td>
                      <td><div className="skeleton h-4 w-10 rounded" /></td>
                      <td><div className="skeleton h-4 w-16 rounded" /></td>
                      <td><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
                    </tr>
                  ))
                : warehouses.map((w) => (
                    <tr key={w.id} className="group hover:bg-muted/25 transition-colors">
                      <td>
                        <div className="flex items-center gap-2">
                          <Warehouse size={16} className="text-primary flex-shrink-0" />
                          <div>
                            <span className="font-medium text-foreground text-sm">{w.name}</span>
                            {w.is_main && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                                <Star size={10} fill="currentColor" /> Main
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-muted-foreground">{w.code}</td>
                      <td className="text-muted-foreground text-sm">{w.branch?.name ?? '—'}</td>
                      <td>
                        <div className="text-xs space-y-0.5 text-muted-foreground">
                          {w.pic_name && <div className="flex items-center gap-1 font-medium text-foreground"><User size={10} /> {w.pic_name}</div>}
                          {w.phone && <div className="flex items-center gap-1"><Phone size={10} /> {w.phone}</div>}
                        </div>
                      </td>
                      <td>
                        {w.is_main ? (
                          <span className="text-green-500 flex items-center gap-0.5 text-xs font-semibold">
                            <Check size={14} /> Yes
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={w.is_active} />
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          variant="inline"
                          onView={() => setViewWarehouse(w)}
                          onEdit={() => openEditModal(w)}
                          onDelete={() => {
                            if (confirm('Are you sure you want to delete this warehouse?')) deleteMutation.mutate(w.id)
                          }}
                        />
                      </td>
                    </tr>
                  ))
              }
              {!isLoading && warehouses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Warehouse size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No warehouses found</p>
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
                  {editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
                </h3>
                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Branch <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    id="branchId"
                    name="branchId"
                    value={branchId}
                    onChange={(e) => {
                      setBranchId(e.target.value)
                      handleClearError('branchId')
                    }}
                    className={getFieldClass(formErrors.branchId, 'form-input w-full')}
                  >
                    <option value="">Select Branch</option>
                    {(branches ?? []).map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <FieldError error={formErrors.branchId} />
                </div>

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
                      placeholder="WH001"
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
                      placeholder="Warehouse Name"
                      className={getFieldClass(formErrors.name, 'form-input w-full')}
                    />
                    <FieldError error={formErrors.name} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">PIC Name</label>
                    <input
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                      placeholder="Person in Charge"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">PIC Phone</label>
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
                    placeholder="Physical depot address"
                    rows={2}
                    className="form-input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isMainWh"
                      checked={isMain}
                      onChange={(e) => setIsMain(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <label htmlFor="isMainWh" className="text-sm font-medium text-muted-foreground cursor-pointer">
                      Mark as Main Depot
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
                    {editingWarehouse ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {viewWarehouse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-md border-l border-border h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Warehouse Details</h3>
                <button onClick={() => setViewWarehouse(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Basic Info</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono font-medium">{viewWarehouse.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{viewWarehouse.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Associated Branch:</span>
                      <span className="font-medium">{viewWarehouse.branch?.name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Main Storage Unit:</span>
                      <span className="font-medium">{viewWarehouse.is_main ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={viewWarehouse.is_active} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact & PIC</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><User size={12} /> PIC Name:</span>
                      <span className="font-medium">{viewWarehouse.pic_name ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1"><Phone size={12} /> PIC Phone:</span>
                      <span className="font-medium">{viewWarehouse.phone ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location details</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-start gap-1"><MapPin size={14} className="mt-0.5" /> Address:</span>
                      <span className="font-medium text-right max-w-[200px] break-words">{viewWarehouse.address ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">City:</span>
                      <span className="font-medium">{viewWarehouse.city ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Province:</span>
                      <span className="font-medium">{viewWarehouse.province ?? '—'}</span>
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

export default WarehousesPage
