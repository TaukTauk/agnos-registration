'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { PatientSchemaType } from '@/lib/validation'

const NATIONALITIES = [
  // ASEAN first
  { value: 'thai',        label: '🇹🇭 Thai' },
  { value: 'vietnamese',  label: '🇻🇳 Vietnamese' },
  { value: 'indonesian',  label: '🇮🇩 Indonesian' },
  { value: 'filipino',    label: '🇵🇭 Filipino' },
  { value: 'malaysian',   label: '🇲🇾 Malaysian' },
  { value: 'singaporean', label: '🇸🇬 Singaporean' },
  { value: 'myanmar',     label: '🇲🇲 Myanmar' },
  { value: 'cambodian',   label: '🇰🇭 Cambodian' },
  { value: 'laotian',     label: '🇱🇦 Laotian' },
  { value: 'bruneian',    label: '🇧🇳 Bruneian' },
  { value: 'timorese',    label: '🇹🇱 Timorese' },
  // Rest of world
  { value: 'american',    label: '🇺🇸 American' },
  { value: 'british',     label: '🇬🇧 British' },
  { value: 'japanese',    label: '🇯🇵 Japanese' },
  { value: 'korean',      label: '🇰🇷 Korean' },
  { value: 'chinese',     label: '🇨🇳 Chinese' },
  { value: 'indian',      label: '🇮🇳 Indian' },
  { value: 'australian',  label: '🇦🇺 Australian' },
  { value: 'canadian',    label: '🇨🇦 Canadian' },
  { value: 'german',      label: '🇩🇪 German' },
  { value: 'french',      label: '🇫🇷 French' },
  { value: 'italian',     label: '🇮🇹 Italian' },
  { value: 'spanish',     label: '🇪🇸 Spanish' },
  { value: 'russian',     label: '🇷🇺 Russian' },
  { value: 'brazilian',   label: '🇧🇷 Brazilian' },
  { value: 'emirati',     label: '🇦🇪 Emirati' },
  { value: 'saudi',       label: '🇸🇦 Saudi' },
  { value: 'egyptian',    label: '🇪🇬 Egyptian' },
  { value: 'pakistani',   label: '🇵🇰 Pakistani' },
  { value: 'bangladeshi', label: '🇧🇩 Bangladeshi' },
  { value: 'sri_lankan',  label: '🇱🇰 Sri Lankan' },
  { value: 'nepali',      label: '🇳🇵 Nepali' },
  { value: 'other',       label: '🌍 Other' },
]

const LANGUAGE_OPTIONS = [
  { value: 'english',    label: 'English' },
  { value: 'thai',       label: 'Thai / ภาษาไทย' },
  { value: 'chinese',    label: 'Chinese / 中文' },
  { value: 'japanese',   label: 'Japanese / 日本語' },
  { value: 'korean',     label: 'Korean / 한국어' },
  { value: 'arabic',     label: 'Arabic / العربية' },
  { value: 'french',     label: 'French / Français' },
  { value: 'german',     label: 'German / Deutsch' },
  { value: 'spanish',    label: 'Spanish / Español' },
  { value: 'malay',      label: 'Malay / Bahasa Melayu' },
  { value: 'indonesian', label: 'Indonesian / Bahasa Indonesia' },
  { value: 'vietnamese', label: 'Vietnamese / Tiếng Việt' },
  { value: 'burmese',    label: 'Burmese / မြန်မာဘာသာ' },
  { value: 'khmer',      label: 'Khmer / ភាសាខ្មែរ' },
  { value: 'lao',        label: 'Lao / ພາສາລາວ' },
  { value: 'other',      label: 'Other' },
]

const RELIGION_OPTIONS = [
  { value: 'buddhism',     label: 'Buddhism' },
  { value: 'christianity', label: 'Christianity' },
  { value: 'islam',        label: 'Islam' },
  { value: 'hinduism',     label: 'Hinduism' },
  { value: 'sikhism',      label: 'Sikhism' },
  { value: 'judaism',      label: 'Judaism' },
  { value: 'taoism',       label: 'Taoism' },
  { value: 'none',         label: 'No religion' },
  { value: 'other',        label: 'Other' },
]

export default function AdditionalSection() {
  const t = useTranslations('patient')
  const { control, formState: { errors } } = useFormContext<PatientSchemaType>()

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">3</span>
        {t('sections.additional')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="nationality"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              id="nationality"
              label={t('fields.nationality')}
              options={NATIONALITIES}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={t('placeholders.select_nationality')}
              error={errors.nationality?.message}
            />
          )}
        />

        <Controller
          name="preferred_language"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              id="preferred_language"
              label={t('fields.preferred_language')}
              options={LANGUAGE_OPTIONS}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={t('placeholders.preferred_language')}
              error={errors.preferred_language?.message}
            />
          )}
        />

        <Controller
          name="religion"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              id="religion"
              label={t('fields.religion')}
              options={RELIGION_OPTIONS}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={t('placeholders.select_religion')}
              error={errors.religion?.message}
              optional
            />
          )}
        />
      </div>
    </div>
  )
}