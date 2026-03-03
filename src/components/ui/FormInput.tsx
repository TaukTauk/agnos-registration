import { forwardRef } from 'react'
import { useTranslations } from 'next-intl'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  optional?: boolean
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, optional, className, ...props }, ref) => {
	const t = useTranslations('common')

    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {optional && (
            <span className="ml-1 text-xs text-gray-400 font-normal">({t('optional')})</span>
          )}
        </label>
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900
            placeholder:text-gray-400 outline-none transition-all duration-200
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-400
            ${error
              ? 'border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400'
              : 'border-gray-200 bg-white hover:border-gray-300'
            }
            ${className ?? ''}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            role="alert"
            className="text-xs text-red-500 mt-0.5"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormInput.displayName = 'FormInput'
export default FormInput