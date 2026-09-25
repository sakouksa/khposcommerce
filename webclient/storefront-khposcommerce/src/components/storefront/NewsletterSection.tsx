import React, { useState } from 'react'
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

export const NewsletterSection: React.FC = () => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@') || loading) return

    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await api.post('/newsletter/subscribe', { email })
      if (res.data?.success) {
        setSuccess(true)
        setEmail('')
      } else {
        setErrorMsg(res.data?.message || 'Subscription failed. Please try again.')
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Unable to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container-site py-6 sm:py-10">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 lg:p-16 text-white shadow-2xl border border-blue-800/40">
        {/* Background glow decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-amber-300 shadow-md">
            <Mail className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            {t('section.newsletter_title')}
          </h2>

          <p className="text-xs sm:text-base text-blue-100/90 max-w-lg mx-auto font-normal leading-relaxed">
            {t('section.newsletter_sub')}
          </p>

          {success ? (
            <div className="pt-4 flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm sm:text-base animate-fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('newsletter.success')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pt-4 max-w-md mx-auto space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletter.placeholder')}
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {loading ? t('newsletter.subscribing') : t('newsletter.button')}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-300 text-xs justify-center pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <p className="text-[11px] text-blue-200/60 pt-1">
                {t('newsletter.privacy')}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

export default NewsletterSection
