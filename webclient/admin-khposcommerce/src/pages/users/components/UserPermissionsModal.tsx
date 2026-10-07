import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, X, Check, Loader2 } from 'lucide-react'
import { defaultPermissionModules, type User } from '../types/user.types'

interface UserPermissionsModalProps {
  user: User | null
  onClose: () => void
  roles?: any[]
  selectedRole: string
  setSelectedRole: (val: string) => void
  selectedPermissions: string[]
  setSelectedPermissions: React.Dispatch<React.SetStateAction<string[]>>
  onSave: () => void
  isSaving: boolean
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  user,
  onClose,
  roles = [],
  selectedRole,
  setSelectedRole,
  selectedPermissions,
  setSelectedPermissions,
  onSave,
  isSaving,
}) => {
  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  return (
    <AnimatePresence>
      {user && (
        <div className="modal-backdrop">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="modal-content max-w-xl w-full p-6 bg-card border border-border rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <span>Security Access & Permission Control</span>
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl text-xs text-primary font-medium">
                Configuring RBAC security policies for <strong>{user.name} ({user.email})</strong>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Assigned Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="form-input text-xs w-full bg-card border-border"
                >
                  <option value="admin">Admin / Super Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="staff">Staff</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-2">Granular Module Permissions</label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto border border-border rounded-xl p-2 bg-muted/20">
                  {defaultPermissionModules.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id)
                    return (
                      <label
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors border ${
                          isChecked ? 'bg-primary/10 border-primary/30 text-primary font-semibold' : 'bg-card border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase font-bold">{perm.group}</span>
                          <span>{perm.label}</span>
                        </div>
                        {isChecked && <Check size={14} className="text-primary" />}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isSaving}
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>Apply Access Changes</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default UserPermissionsModal
