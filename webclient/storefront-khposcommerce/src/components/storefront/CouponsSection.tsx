import React from 'react'
import { Ticket, Percent } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SectionHeader from './SectionHeader'
import CouponCard, { type CouponItem } from './CouponCard'

interface CouponsSectionProps {
  coupons: CouponItem[]
}

export const CouponsSection: React.FC<CouponsSectionProps> = ({ coupons }) => {
  const { t } = useTranslation()

  if (!coupons || coupons.length === 0) return null

  return (
    <section className="container-site py-4 sm:py-6">
      <SectionHeader
        title={t('section.coupons_title')}
        subtitle={t('section.coupons_sub')}
        icon={<Ticket className="w-5 h-5 text-indigo-500" />}
        badge="Claim Discounts"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {coupons.slice(0, 3).map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </section>
  )
}

export default CouponsSection
