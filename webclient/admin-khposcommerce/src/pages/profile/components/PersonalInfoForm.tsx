import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, User, Mail, Phone, Calendar, MapPin, Building, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EnterpriseDatePicker } from '@/components/common'
import type { UserProfile } from '@/services/profileService'

const personalInfoSchema = z.object({
  name: z.string().min(2, 'personal_tab.name_required').max(100),
  email: z.string().email('personal_tab.email_invalid'),
  phone: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
})

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>

interface PersonalInfoFormProps {
  profile: UserProfile
  onSave: (data: PersonalInfoFormData) => void
  isSaving: boolean
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  profile,
  onSave,
  isSaving,
}) => {
  const { t } = useTranslation('profile')
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
      gender: profile.gender ?? '',
      date_of_birth: profile.date_of_birth ?? '',
      address: profile.address ?? '',
      country: profile.country ?? '',
      province: profile.province ?? '',
      city: profile.city ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <User size={18} className="text-primary" />
            <span>{t('personal_tab.title', 'Personal Information')}</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('personal_tab.subtitle', 'Update your personal details such as full name, email, phone number, and location address.')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-primary" />
            <span>{t('personal_tab.full_name', 'Full Name')}</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder={t('personal_tab.name_placeholder', 'Enter your full name')}
            className={`w-full px-4 py-2.5 rounded-2xl border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 ${
              errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
            }`}
          />
          {errors.name && (
            <p className="text-[11px] text-red-500 font-bold mt-1">{t(errors.name.message || '')}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={13} className="text-primary" />
            <span>{t('personal_tab.email', 'Email Address')}</span>
            <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register('email')}
            placeholder={t('personal_tab.email_placeholder', 'e.g. superadmin@enterprise-pos.com')}
            className={`w-full px-4 py-2.5 rounded-2xl border bg-background text-foreground text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 ${
              errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-border'
            }`}
          />
          {errors.email && (
            <p className="text-[11px] text-red-500 font-bold mt-1">{t(errors.email.message || '')}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={13} className="text-primary" />
            <span>{t('personal_tab.phone', 'Phone Number')}</span>
          </label>
          <input
            type="tel"
            inputMode="tel"
            {...register('phone', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                e.target.value = e.target.value.replace(/[^\d+ -]/g, '')
              },
            })}
            placeholder="012 345 678"
            className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 font-mono"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-primary" />
            <span>{t('personal_tab.gender', 'Gender')}</span>
          </label>
          <select
            {...register('gender')}
            className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">{t('personal_tab.select_gender', 'Select Gender')}</option>
            <option value="male">{t('personal_tab.male', 'Male')}</option>
            <option value="female">{t('personal_tab.female', 'Female')}</option>
            <option value="other">{t('personal_tab.other', 'Other')}</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} className="text-primary" />
            <span>{t('personal_tab.dob', 'Date of Birth')}</span>
          </label>
          <EnterpriseDatePicker
            value={watch('date_of_birth') || ''}
            onChange={(val) => setValue('date_of_birth', val, { shouldValidate: true, shouldDirty: true })}
            placeholder={t('personal_tab.dob', 'Date of Birth')}
          />
        </div>

        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={13} className="text-primary" />
            <span>{t('personal_tab.country', 'Country')}</span>
          </label>
          <input
            type="text"
            {...register('country')}
            placeholder={t('personal_tab.country_placeholder', 'Enter country (e.g. Cambodia)')}
            className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Province */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={13} className="text-primary" />
            <span>{t('personal_tab.province', 'Province / State')}</span>
          </label>
          <input
            type="text"
            {...register('province')}
            placeholder={t('personal_tab.province_placeholder', 'Province / State (e.g. Phnom Penh)')}
            className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* City */}
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Building size={13} className="text-primary" />
            <span>{t('personal_tab.city', 'City / District')}</span>
          </label>
          <input
            type="text"
            {...register('city')}
            placeholder={t('personal_tab.city_placeholder', 'City / District (e.g. Doun Penh)')}
            className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Address (Full-width) */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={13} className="text-primary" />
            <span>{t('personal_tab.address', 'Street Address')}</span>
          </label>
          <textarea
            {...register('address')}
            rows={3}
            placeholder={t('personal_tab.address_placeholder', 'Enter street address, building, or location details...')}
            className="w-full px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-border/50 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-2xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Save size={15} />
          <span>{isSaving ? t('personal_tab.saving', 'Saving...') : t('personal_tab.save_changes', 'Save Changes')}</span>
        </button>
      </div>
    </form>
  )
}

export default PersonalInfoForm
