import React, { useEffect, useState } from 'react'
import { HelpCircle, ChevronDown, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import PageTransition from '@/components/common/PageTransition'
import api from '@/lib/api'

interface FaqItem {
  id?: number
  q: string
  a: string
  category?: string
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: 'How long does nationwide shipping take in Cambodia?',
    a: 'Express delivery takes 1 to 3 hours within Phnom Penh for orders placed before 4:00 PM. For all other 25 provinces, standard express delivery takes 1 to 2 business days.',
    category: 'Shipping & Delivery',
  },
  {
    q: 'What payment methods do you support?',
    a: 'We support ABA KHQR, ACLEDA Mobile, Visa/Mastercard credit and debit cards, Wing Bank, and Cash on Delivery (COD) across Cambodia.',
    category: 'Payment',
  },
  {
    q: 'What is your return & refund guarantee policy?',
    a: 'You can return any unopened item in its original retail condition within 30 days of purchase for an exchange or full refund to your original payment method.',
    category: 'Returns & Refunds',
  },
  {
    q: 'Are all laptops and electronic products 100% authentic?',
    a: 'Yes! 100% of products sold on Enterprise Store are authentic, brand-new, and backed by official manufacturer warranties and authorized service centers.',
    category: 'Product Authenticity',
  },
  {
    q: 'How do I track my order delivery in real time?',
    a: 'You can check your live order tracking status anytime by visiting our Track Order page and entering your Order Number (e.g., ORD-XXXXXXXXXX).',
    category: 'Orders',
  },
  {
    q: 'Do you offer warranty repairs and technical support?',
    a: 'Yes, our dedicated Service & Repair Center in Phnom Penh provides full hardware warranty claims, diagnosis, and technical assistance.',
    category: 'Warranty & Service',
  },
]

export const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    api.get('/faqs')
      .then(({ data }) => {
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const flattened: FaqItem[] = []
          data.data.forEach((group: any) => {
            if (group.items) {
              group.items.forEach((item: any) => {
                flattened.push({
                  id: item.id,
                  q: item.question,
                  a: item.answer,
                  category: group.category || item.category,
                })
              })
            }
          })
          if (flattened.length > 0) {
            setFaqs(flattened)
          }
        }
      })
      .catch(() => {
        // Retain default FAQs
      })
  }, [])

  // ── FAQPage Structured Data (Schema.org) ──────────────────────────────────
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  }

  return (
    <>
      <SEOHead
        title="Frequently Asked Questions (FAQ)"
        description="Find instant answers to common questions regarding express shipping in Cambodia, ABA KHQR payment, 30-day returns, warranty claims, and order tracking."
        canonical="/faq"
        schema={faqSchema}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'FAQ', url: '/faq' },
        ]}
      />

      <PageTransition className="container-site py-12 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pb-4">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-xs">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Quick answers to common questions about orders, payments, warranties, and delivery across Cambodia.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-0.5">
                    {faq.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {faq.category}
                      </span>
                    )}
                    <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {faq.q}
                    </h2>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-fadeIn">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Still Have Questions Card */}
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Still have questions?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Our customer support team is available 24/7 to assist you.</p>
            </div>
          </div>
          <Link to="/contact" className="btn-primary text-xs font-bold py-2.5 px-5 rounded-xl whitespace-nowrap shadow-sm">
            Contact Support
          </Link>
        </div>
      </PageTransition>
    </>
  )
}

export default FAQPage
