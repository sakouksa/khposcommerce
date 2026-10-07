import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Upload, Trash2 } from 'lucide-react'
import UserAvatar from '@/components/common/UserAvatar'
import { FieldError, getFieldClass } from '@/components/common'
import type { User } from '../types/user.types'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingUser: User | null
  roles?: any[]
  onSubmit: (e: React.FormEvent) => void
  isSaving: boolean
  name: string
  setName: (val: string) => void
  email: string
  setEmail: (val: string) => void
  password: string
  setPassword: (val: string) => void
  phone: string
  setPhone: (val: string) => void
  avatar: string
  setAvatar: (val: string) => void
  isUploadingAvatar: boolean
  handleAvatarFileUpload: (file: File) => void
  getAvatarUrl: (avatar?: string | null) => string | null
  gender: string
  setGender: (val: string) => void
  address: string
  setAddress: (val: string) => void
  city: string
  setCity: (val: string) => void
  country: string
  setCountry: (val: string) => void
  role: string
  setRole: (val: string) => void
  isActive: boolean
  setIsActive: (val: boolean) => void
  formErrors?: Record<string, string>
  onClearError?: (field: string) => void
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  roles = [],
  onSubmit,
  isSaving,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  phone,
  setPhone,
  avatar,
  setAvatar,
  isUploadingAvatar,
  handleAvatarFileUpload,
  getAvatarUrl,
  gender,
  setGender,
  address,
  setAddress,
  city,
  setCity,
  country,
  setCountry,
  role,
  setRole,
  isActive,
  setIsActive,
  formErrors = {},
  onClearError,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-content max-w-xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-foreground">
                {editingUser ? 'Edit User Profile' : 'Create New User Account'}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Full Name <span className="text-rose-500 font-bold">*</span></label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      onClearError?.('name')
                    }}
                    placeholder="e.g. John Doe"
                    className={getFieldClass(formErrors.name, 'w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border transition-all font-medium')}
                  />
                  <FieldError error={formErrors.name} />
                </div>
                <div>
                  <label className="label">Email Address <span className="text-rose-500 font-bold">*</span></label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      onClearError?.('email')
                    }}
                    placeholder="john@enterprise.com"
                    className={getFieldClass(formErrors.email, 'w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border transition-all font-medium')}
                  />
                  <FieldError error={formErrors.email} />
                </div>
                <div>
                  <label className="label">
                    {editingUser ? 'Password (Leave empty to keep current)' : (
                      <>
                        Password <span className="text-rose-500 font-bold">*</span>
                      </>
                    )}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      onClearError?.('password')
                    }}
                    placeholder="••••••••"
                    className={getFieldClass(formErrors.password, 'w-full h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-lg border transition-all font-medium')}
                  />
                  <FieldError error={formErrors.password} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Phone Number</label>
                  <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+ -]/g, ''))} placeholder="012 345 678" className="input w-full font-mono" />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="input w-full">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Assign Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="input w-full">
                    <option value="">Default Staff Role</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    {roles.map((r: any) => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Phnom Penh" className="input w-full" />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Cambodia" className="input w-full" />
                </div>
              </div>

              <div>
                <label className="label">Address Details</label>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full street address..." className="input w-full min-h-[60px]" />
              </div>

              <div className="space-y-1.5">
                <label className="label">Profile Avatar Image</label>
                <div className="flex items-center gap-3 bg-muted/20 p-3 rounded-xl border border-border">
                  <UserAvatar
                    src={avatar}
                    name={name || 'User'}
                    sizeClassName="w-12 h-12"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:opacity-90 transition-opacity">
                        {isUploadingAvatar ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>Upload Avatar File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleAvatarFileUpload(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Remove Avatar"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      placeholder="Or paste image URL link..."
                      className="input w-full text-xs py-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="checkbox h-4 w-4"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-foreground cursor-pointer">
                  Enable active login status for this user account
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="btn btn-primary text-xs flex items-center gap-1.5">
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>Save Account Details</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default UserFormModal
