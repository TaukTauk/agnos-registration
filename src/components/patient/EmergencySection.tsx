import { useFormContext } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import FormInput from '@/components/ui/FormInput'
import { PatientSchemaType } from '@/lib/validation'

export default function EmergencySection() {
  const t = useTranslations('patient')
  const { register, formState: { errors } } = useFormContext<PatientSchemaType>()

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">4</span>
        {t('sections.emergency')}
        <span className="text-xs text-gray-400 font-normal ml-1">(Optional)</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          id="emergency_name"
          label={t('fields.emergency_name')}
          placeholder={t('placeholders.emergency_name')}
          error={errors.emergency_name?.message}
          optional
          autoComplete="name"
          {...register('emergency_name')}
        />
        <FormInput
          id="emergency_relationship"
          label={t('fields.emergency_relationship')}
          placeholder={t('placeholders.emergency_relationship')}
          error={errors.emergency_relationship?.message}
          optional
          {...register('emergency_relationship')}
        />
      </div>
    </div>
  )
}