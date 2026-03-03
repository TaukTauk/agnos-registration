'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import FormInput from '@/components/ui/FormInput'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { PatientSchemaType } from '@/lib/validation'

const COUNTRY_CODES = [
  { value: '+66',  label: '🇹🇭 +66 Thailand' },
  { value: '+84',  label: '🇻🇳 +84 Vietnam' },
  { value: '+62',  label: '🇮🇩 +62 Indonesia' },
  { value: '+63',  label: '🇵🇭 +63 Philippines' },
  { value: '+60',  label: '🇲🇾 +60 Malaysia' },
  { value: '+65',  label: '🇸🇬 +65 Singapore' },
  { value: '+95',  label: '🇲🇲 +95 Myanmar' },
  { value: '+855', label: '🇰🇭 +855 Cambodia' },
  { value: '+856', label: '🇱🇦 +856 Laos' },
  { value: '+673', label: '🇧🇳 +673 Brunei' },
  { value: '+670', label: '🇹🇱 +670 Timor-Leste' },
  { value: '+1',   label: '🇺🇸 +1 United States' },
  { value: '+44',  label: '🇬🇧 +44 United Kingdom' },
  { value: '+81',  label: '🇯🇵 +81 Japan' },
  { value: '+82',  label: '🇰🇷 +82 South Korea' },
  { value: '+86',  label: '🇨🇳 +86 China' },
  { value: '+91',  label: '🇮🇳 +91 India' },
  { value: '+61',  label: '🇦🇺 +61 Australia' },
  { value: '+1CA', label: '🇨🇦 +1 Canada' },
  { value: '+49',  label: '🇩🇪 +49 Germany' },
  { value: '+33',  label: '🇫🇷 +33 France' },
  { value: '+971', label: '🇦🇪 +971 UAE' },
  { value: '+966', label: '🇸🇦 +966 Saudi Arabia' },
  { value: '+92',  label: '🇵🇰 +92 Pakistan' },
  { value: '+880', label: '🇧🇩 +880 Bangladesh' },
]

export default function ContactSection() {
  const t = useTranslations('patient')
  const { register, control, formState: { errors } } = useFormContext<PatientSchemaType>()
  const [countryCode, setCountryCode] = useState('+66')

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">2</span>
        {t('sections.contact')}
      </h2>

      <div className="space-y-4">

        {/* Phone — full width with country code */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {t('fields.phone')}
          </label>
          <div className="flex gap-2 items-start flex-col sm:flex-row">
            {/* Country code — fixed width */}
            <div className="w-48 shrink-0">
              <SearchableSelect
                label=""
                options={COUNTRY_CODES}
                value={countryCode}
                onChange={setCountryCode}
                placeholder="+66"
              />
            </div>
            {/* Phone number input */}
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="phone"
                  type="tel"
                  placeholder="812345678"
                  autoComplete="tel"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/[^0-9]/g, '')
                    field.onChange(`${countryCode}${digits}`)
                  }}
                  value={field.value?.replace(countryCode, '') ?? ''}
                  className={`\
					mt-1 w-full
                    flex-1 px-4 py-2.5 rounded-xl border text-sm text-gray-900
                    placeholder:text-gray-400 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${errors.phone
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                  aria-invalid={!!errors.phone}
                />
              )}
            />
          </div>
          {errors.phone && (
            <p role="alert" className="text-xs text-red-500 mt-0.5">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email and Address in a 2-col grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            id="email"
            label={t('fields.email')}
            placeholder={t('placeholders.email')}
            type="email"
            error={errors.email?.message}
            optional
            autoComplete="email"
            {...register('email')}
          />
          <FormInput
            id="address"
            label={t('fields.address')}
            placeholder={t('placeholders.address')}
            error={errors.address?.message}
            autoComplete="street-address"
            {...register('address')}
          />
        </div>

      </div>
    </div>
  )
}