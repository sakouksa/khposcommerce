import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import Spinner from '@/components/ui/Spinner'

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/auth/login')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8 space-y-6 shadow-xl">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">
          Set New Password
        </h2>
        <p className="text-xs text-gray-500">Enter your new password below</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Confirm New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              className="input pl-10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          {loading ? <Spinner size="sm" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}

export default ResetPasswordPage
