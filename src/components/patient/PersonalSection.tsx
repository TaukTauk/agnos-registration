'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import FormInput from '@/components/ui/FormInput'
import SearchableSelect from '@/components/ui/SearchableSelect'
import { PatientSchemaType } from '@/lib/validation'

export default function PersonalSection() {
  const t = useTranslations('patient')
  const { register, control, formState: { errors } } = useFormContext<PatientSchemaType>()

  const genderOptions = [
    { value: 'male',       label: t('gender_options.male') },
    { value: 'female',     label: t('gender_options.female') },
    { value: 'other',      label: t('gender_options.other') },
    { value: 'prefer_not', label: t('gender_options.prefer_not') },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">1</span>
        {t('sections.personal')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          id="first_name"
          label={t('fields.first_name')}
          placeholder={t('placeholders.first_name')}
          error={errors.first_name?.message}
          autoComplete="given-name"
          {...register('first_name')}
        />
        <FormInput
          id="middle_name"
          label={t('fields.middle_name')}
          placeholder={t('placeholders.middle_name')}
          error={errors.middle_name?.message}
          optional
          autoComplete="additional-name"
          {...register('middle_name')}
        />
        <FormInput
          id="last_name"
          label={t('fields.last_name')}
          placeholder={t('placeholders.last_name')}
          error={errors.last_name?.message}
          autoComplete="family-name"
          {...register('last_name')}
        />
        <FormInput
          id="date_of_birth"
          label={t('fields.date_of_birth')}
          placeholder={t('placeholders.date_of_birth')}
          type="date"
          error={errors.date_of_birth?.message}
          autoComplete="bday"
          {...register('date_of_birth')}
        />
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              id="gender"
              label={t('fields.gender')}
              options={genderOptions}
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder={t('placeholders.select_gender')}
              error={errors.gender?.message}
            />
          )}
        />
      </div>
    </div>
  )
}