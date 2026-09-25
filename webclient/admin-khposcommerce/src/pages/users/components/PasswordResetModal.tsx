import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Key, X, Lock, RefreshCcw, Copy, Check, Loader2 } from 'lucide-react'
import type { User } from '../types/user.types'

interface PasswordResetModalProps {
  user: User | null
  onClose: () => void
  newPassword: string
  setNewPassword: (val: string) => void
  confirmPassword: string
  setConfirmPassword: (val: string) => void
  isResettingPassword: boolean
  generateRandomPassword: () => void
  onConfirm: () => void
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  user,
  onClose,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isResettingPassword,
  generateRandomPassword,
  onConfirm,
}) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopyPassword = () => {
    if (!newPassword) return
    navigator.clipboard.writeText(newPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {user && (
        <div className="modal-backdrop">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="modal-content max-w-md w-full p-6 bg-card border border-border rounded-2xl shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Key size={18} className="text-amber-500" />
                <span>Reset User Password</span>
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-xs text-amber-600 dark:text-amber-400">
                You are resetting the login credential for <strong className="text-foreground font-semibold">{user.name} ({user.email})</strong>.
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">New Password</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="form-input text-xs w-full font-mono pr-20"
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                      title="Generate Secure Password"
                    >
                      <RefreshCcw size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                      title="Copy Password"
                    >
                      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="form-input text-xs w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <button type="button" onClick={onClose} className="btn btn-secondary text-xs">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isResettingPassword}
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                >
                  {isResettingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                  <span>Reset Credentials</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PasswordResetModal
