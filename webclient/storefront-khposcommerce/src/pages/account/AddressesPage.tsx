import React, { useState } from 'react'
import {
  MapPin,
  Plus,
  CheckCircle2,
  Phone,
  User,
  Trash2,
  Edit2,
  Sparkles,
  Building2,
  Navigation,
} from 'lucide-react'
import { useAuthStore } from '@/stores'

interface AddressItem {
  id: string
  label: string
  name: string
  phone: string
  province: string
  address: string
  isDefault: boolean
}

const CAMBODIA_PROVINCES = [
  'Phnom Penh',
  'Kandal',
  'Siem Reap',
  'Battambang',
  'Kampong Cham',
  'Sihanoukville (Preah Sihanouk)',
  'Kampot',
  'Takeo',
  'Prey Veng',
  'Tbong Khmum',
  'Banteay Meanchey',
  'Pursat',
  'Svay Rieng',
  'Kampong Chhnang',
  'Kampong Speu',
  'Kampong Thom',
  'Koh Kong',
  'Kratie',
  'Mondulkiri',
  'Oddar Meanchey',
  'Pailin',
  'Preah Vihear',
  'Ratanakiri',
  'Stung Treng',
  'Kep',
]

export const AddressesPage: React.FC = () => {
  const { customer, user } = useAuthStore()

  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 'addr-default',
      label: 'Home / Primary',
      name: customer?.name || user?.name || 'Customer Name',
      phone: customer?.phone || '012 345 678',
      province: 'Phnom Penh',
      address: 'Street 271, Sangkat Boeng Tumpun, Khan Mean Chey',
      isDefault: true,
    },
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [newLabel, setNewLabel] = useState('Work / Office')
  const [newName, setNewName] = useState(customer?.name || '')
  const [newPhone, setNewPhone] = useState(customer?.phone || '')
  const [newProvince, setNewProvince] = useState('Phnom Penh')
  const [newAddress, setNewAddress] = useState('')

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAddress.trim()) return

    const newAddr: AddressItem = {
      id: `addr-${Date.now()}`,
      label: newLabel,
      name: newName || 'Recipient',
      phone: newPhone || 'Not provided',
      province: newProvince,
      address: newAddress,
      isDefault: false,
    }

    setAddresses([...addresses, newAddr])
    setShowAddForm(false)
    setNewAddress('')
  }

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    )
  }

  const handleDelete = (id: string) => {
    if (addresses.length <= 1) return
    setAddresses(addresses.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* ─── Header Card ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f58220]/10 text-[#f58220] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
              Saved Delivery Addresses
            </h2>
            <p className="text-xs text-slate-400">
              Manage your delivery locations for fast 1-click checkout
            </p>
          </div>
        </div>

        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f58220] hover:bg-[#e07110] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* ─── Add New Address Form ───────────────────────────────────────────── */}
      {showAddForm && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#f58220]/40 p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#f58220]" />
              <span>Add New Delivery Location</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Address Label
                </label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Home, Office, Branch"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 012 345 678"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Province / City
                </label>
                <select
                  value={newProvince}
                  onChange={(e) => setNewProvince(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none"
                >
                  {CAMBODIA_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address / Khan / Sangkat / Landmark
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="House #, Street name, Landmark description"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-[#f58220] focus:ring-1 focus:ring-[#f58220] outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#f58220] hover:bg-[#e07110] text-white text-xs font-bold shadow-xs transition-all"
              >
                Save Location
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Addresses Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4 ${
              item.isDefault
                ? 'bg-orange-50/40 dark:bg-orange-950/20 border-[#f58220]/60 ring-1 ring-[#f58220]/30 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.isDefault
                      ? 'bg-[#f58220] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {item.label}
                </span>

                {item.isDefault ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f58220]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Default Delivery</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(item.id)}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-[#f58220] dark:hover:text-[#f58220] font-semibold underline"
                  >
                    Set as default
                  </button>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.name}</span>
                </div>

                <div className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.phone}</span>
                </div>

                <div className="text-slate-600 dark:text-slate-400 flex items-start gap-2 pt-1 leading-relaxed">
                  <Navigation className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {item.address}, {item.province}, Cambodia
                  </span>
                </div>
              </div>
            </div>

            {!item.isDefault && addresses.length > 1 && (
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-700 text-xs font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddressesPage
