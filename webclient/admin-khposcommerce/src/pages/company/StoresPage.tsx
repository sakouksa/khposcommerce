import React, { useState } from 'react'
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
  Plus, Search, Edit2, Trash2, RefreshCw, X, Store,
  ToggleLeft, ToggleRight, Eye, Mail, Phone, MapPin, Globe, Loader2, BookOpen
} from 'lucide-react'
import { companyService } from '@/services/companyService'
import { useToast } from '@/hooks/useToast'
import PageHeader from '@/components/common/PageHeader'
import Breadcrumb from '@/components/common/Breadcrumb'
import StatusBadge from '@/components/common/StatusBadge'
import { TableToolbar } from '@/components/common'
import TableActionMenu from '@/components/shared/TableActionMenu'

interface StoreItem {
  id:          number
  branch_id:   number
  branch?:     { name: string }
  name:        string
  code:        string
  slug:        string
  domain?:     string
  email?:      string
  phone?:      string
  address?:    string
  description?: string
  type:        'online' | 'offline' | 'hybrid'
  is_active:   boolean
}

const StoresPage: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
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
  } = useServerPagination({ storageKey: 'stores' })
    const [modalOpen, setModalOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null)
  const [viewStore, setViewStore] = useState<StoreItem | null>(null)

  // Form states
  const [branchId, setBranchId] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [slug, setSlug] = useState('')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'online' | 'offline' | 'hybrid'>('hybrid')
  const [isActive, setIsActive] = useState(true)

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => companyService.getBranches().then(r => r.data ?? []),
  })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['stores', page, debouncedSearch, perPage],
    queryFn: () => companyService.getStores({ page, search: debouncedSearch, per_page: perPage }),
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: (newStore: any) => companyService.createStore(newStore),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store created successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to create store.'
      toast.error(msg)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => companyService.updateStore(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store updated successfully.')
      closeModal()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to update store.'
      toast.error(msg)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyService.deleteStore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Store deleted successfully.')
      adjustAfterDelete(stores.length)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Failed to delete store.'
      toast.error(msg)
    }
  })

  const stores: StoreItem[] = data?.data ?? []
  const pagination = data?.pagination ?? { total: 0, current_page: 1, last_page: 1 }

  const openCreateModal = () => {
    setEditingStore(null)
    setBranchId('')
    setName('')
    setCode('')
    setSlug('')
    setDomain('')
    setEmail('')
    setPhone('')
    setAddress('')
    setDescription('')
    setType('hybrid')
    setIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (store: StoreItem) => {
    setEditingStore(store)
    setBranchId(store.branch_id.toString())
    setName(store.name)
    setCode(store.code)
    setSlug(store.slug)
    setDomain(store.domain ?? '')
    setEmail(store.email ?? '')
    setPhone(store.phone ?? '')
    setAddress(store.address ?? '')
    setDescription(store.description ?? '')
    setType(store.type)
    setIsActive(store.is_active)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingStore(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      company_id: 1,
      branch_id: Number(branchId),
      name,
      code,
      slug: slug || null,
      domain: domain || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      description: description || null,
      type,
      is_active: isActive
    }

    if (editingStore) {
      updateMutation.mutate({ id: editingStore.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="space-y-5">
      {!isTab && (
        <>
          <Breadcrumb items={[{ label: 'Company' }, { label: 'Stores' }]} />

          <PageHeader
            icon={<Store size={24} />}
            title="Stores"
            subtitle="Manage POS outlets, online channels, and hybrid physical stores"
            action={
              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white
                           bg-gradient-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                <Plus size={16} />
                Add Store
              </button>
            }
          />
        </>
      )}

      {/* Global Standard Table Toolbar */}
      <TableToolbar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search stores..."
        onReset={reset}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['stores'] })}
        refreshLoading={isFetching}
        rightActions={
          isTab ? (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 h-10 min-h-[40px] text-xs sm:text-[13px] font-semibold text-white
                         bg-gradient-primary rounded-xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer ml-auto"
            >
              <Plus size={15} />
              Add Store
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
                <th className="text-left">Store</th>
                <th className="text-left">Code</th>
                <th className="text-left">Branch</th>
                <th className="text-left">Type</th>
                <th className="text-left">Domain</th>
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
                      <td><div className="skeleton h-4 w-20 rounded" /></td>
                      <td><div className="skeleton h-4 w-36 rounded" /></td>
                      <td><div className="skeleton h-4 w-16 rounded" /></td>
                      <td><div className="skeleton h-4 w-12 rounded ml-auto" /></td>
                    </tr>
                  ))
                : stores.map((s) => (
                    <tr key={s.id} className="group hover:bg-muted/25 transition-colors">
                      <td>
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-primary flex-shrink-0" />
                          <div>
                            <span className="font-medium text-foreground text-sm">{s.name}</span>
                            <div className="text-[10px] text-muted-foreground font-mono">{s.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs text-muted-foreground">{s.code}</td>
                      <td className="text-muted-foreground text-sm">{s.branch?.name ?? '—'}</td>
                      <td>
                        <span className={`badge-${
                          s.type === 'online' ? 'success' :
                          s.type === 'offline' ? 'warning' : 'info'
                        }`}>
                          {s.type}
                        </span>
                      </td>
                      <td className="text-muted-foreground text-sm font-mono text-xs">
                        {s.domain ? (
                          <a href={`https://${s.domain}`} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            <Globe size={11} /> {s.domain}
                          </a>
                        ) : '—'}
                      </td>
                      <td>
                        <StatusBadge status={s.is_active} />
                      </td>
                      <td className="text-right" onClick={(e) => e.stopPropagation()}>
                        <TableActionMenu
                          variant="inline"
                          onView={() => setViewStore(s)}
                          onEdit={() => openEditModal(s)}
                          onDelete={() => {
                            if (confirm('Are you sure you want to delete this store?')) deleteMutation.mutate(s.id)
                          }}
                        />
                      </td>
                    </tr>
                  ))
              }
              {!isLoading && stores.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Store size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-muted-foreground">No stores found</p>
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
                  {editingStore ? 'Edit Store' : 'Add Store'}
                </h3>
                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Branch</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    required
                    className="form-input"
                  >
                    <option value="">Select Branch</option>
                    {(branches ?? []).map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Code</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      placeholder="ST001"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Store Name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Slug (URL Part)</label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="store-name-outlet"
                      className="form-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Domain</label>
                    <input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="shop.domain.com"
                      className="form-input font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="store@company.com"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Store Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      required
                      className="form-input"
                    >
                      <option value="online">Online Store</option>
                      <option value="offline">Offline / POS Outlet</option>
                      <option value="hybrid">Hybrid (Both)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6 justify-end">
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

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Physical outlet coordinates"
                    rows={2}
                    className="form-input resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Description / Notes</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description about this branch outlet"
                    rows={2}
                    className="form-input resize-none"
                  />
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
                    {editingStore ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Drawer */}
      <AnimatePresence>
        {viewStore && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-card w-full max-w-md border-l border-border h-full flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-lg text-foreground">Store Details</h3>
                <button onClick={() => setViewStore(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Basic Info</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Code:</span>
                      <span className="font-mono font-medium">{viewStore.code}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{viewStore.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Slug:</span>
                      <span className="font-mono font-medium text-xs">{viewStore.slug}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{viewStore.type}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <StatusBadge status={viewStore.is_active} />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact & Online Channels</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{viewStore.email ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{viewStore.phone ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="font-mono text-xs">{viewStore.domain ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Location Coordinates</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-start gap-1"><MapPin size={14} className="mt-0.5" /> Address:</span>
                      <span className="font-medium text-right max-w-[200px] break-words">{viewStore.address ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description / Notes</h4>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border text-sm text-muted-foreground leading-relaxed">
                    {viewStore.description ? (
                      <div className="flex gap-2">
                        <BookOpen size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>{viewStore.description}</span>
                      </div>
                    ) : 'No description provided.'}
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

export default StoresPage
