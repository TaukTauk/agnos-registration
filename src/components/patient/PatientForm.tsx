'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { patientSchema, PatientSchemaType } from '@/lib/validation'
import { getSessionId, calculateProgress } from '@/lib/utils'
import { PatientSession } from '@/types/patient'
import PersonalSection from './PersonalSection'
import ContactSection from './ContactSection'
import AdditionalSection from './AdditionalSection'
import EmergencySection from './EmergencySection'
import ProgressBar from '@/components/ui/ProgressBar'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import StatusBadge from '@/components/ui/StatusBadge'

type FormState = 'loading' | 'filling' | 'submitted'

export default function PatientForm() {
  const t = useTranslations('patient')
  const tStatus = useTranslations('status')
  const sessionId = useRef<string>('')
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [formState, setFormState] = useState<FormState>('loading')
  const [isEditingAfterSubmit, setIsEditingAfterSubmit] = useState(false)
  const tCommon = useTranslations('common')

  const methods = useForm<PatientSchemaType>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      nationality: '',
      religion: '',
      preferred_language: '',
      phone: '',
      email: '',
      address: '',
      emergency_name: '',
      emergency_relationship: '',
    },
    mode: 'onChange',
  })

  const { handleSubmit, watch, reset, formState: { errors, isSubmitting } } = methods

  // On mount — check if session already exists and its status
  useEffect(() => {
    sessionId.current = getSessionId()
    initOrRestoreSession()
  }, [])

  const initOrRestoreSession = async () => {
    // Check if session already exists in Supabase
    const { data } = await supabase
      .from('patient_sessions')
      .select('*')
      .eq('session_id', sessionId.current)
      .single()

    if (data) {
      const session = data as PatientSession

      if (session.status === 'submitted') {
        // Restore submitted form data for A2 editing
        reset({
          first_name: session.first_name ?? '',
          middle_name: session.middle_name ?? '',
          last_name: session.last_name ?? '',
          date_of_birth: session.date_of_birth ?? '',
          gender: session.gender ?? '',
          nationality: session.nationality ?? '',
          religion: session.religion ?? '',
          preferred_language: session.preferred_language ?? '',
          phone: session.phone ?? '',
          email: session.email ?? '',
          address: session.address ?? '',
          emergency_name: session.emergency_name ?? '',
          emergency_relationship: session.emergency_relationship ?? '',
        })
        setFormState('submitted')
      } else {
        // Restore partial data and continue filling
        reset({
          first_name: session.first_name ?? '',
          middle_name: session.middle_name ?? '',
          last_name: session.last_name ?? '',
          date_of_birth: session.date_of_birth ?? '',
          gender: session.gender ?? '',
          nationality: session.nationality ?? '',
          religion: session.religion ?? '',
          preferred_language: session.preferred_language ?? '',
          phone: session.phone ?? '',
          email: session.email ?? '',
          address: session.address ?? '',
          emergency_name: session.emergency_name ?? '',
          emergency_relationship: session.emergency_relationship ?? '',
        })
        // Update status back to filling
        await supabase
          .from('patient_sessions')
          .update({
            status: 'filling',
            last_activity_at: new Date().toISOString(),
          })
          .eq('session_id', sessionId.current)
        setFormState('filling')
      }
    } else {
      // Brand new session
      await supabase.from('patient_sessions').insert({
        session_id: sessionId.current,
        status: 'filling',
        last_activity_at: new Date().toISOString(),
      })
      setFormState('filling')
    }
  }

  // Sync to Supabase (debounced 400ms)
  const syncToSupabase = useCallback(async (data: Partial<PatientSchemaType>) => {
    await supabase
      .from('patient_sessions')
      .update({
        ...data,
        // Keep 'submitted' status if editing after submit
        ...(formState !== 'submitted' && { status: 'filling' }),
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId.current)
  }, [formState])

  // Watch and sync on change
  useEffect(() => {
    if (formState === 'loading') return

    const subscription = watch((data) => {
      if (syncTimeout.current) clearTimeout(syncTimeout.current)
      syncTimeout.current = setTimeout(() => {
        syncToSupabase(data as Partial<PatientSchemaType>)
      }, 400)
    })

    return () => {
      subscription.unsubscribe()
      if (syncTimeout.current) clearTimeout(syncTimeout.current)
    }
  }, [watch, syncToSupabase, formState])

  // Submit handler
  const onSubmit = async (data: PatientSchemaType) => {
    await supabase
      .from('patient_sessions')
      .update({
        ...data,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId.current)

    setFormState('submitted')
    setIsEditingAfterSubmit(false)
  }

  const formValues = watch()
  const progress = calculateProgress(formValues as Record<string, unknown>)

  // Loading state
  if (formState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-gray-400">{tCommon('loading')}</p>
        </div>
      </div>
    )
  }

  // Success state — with option to edit
  if (formState === 'submitted' && !isEditingAfterSubmit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('success')}</h2>
          <p className="text-gray-500 text-sm mb-6">
            {tCommon('close_window')}
          </p>

          {/* Edit button */}
          <button
            onClick={() => setIsEditingAfterSubmit(true)}
            className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-sm"
          >
            {tCommon('edit_info')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
		  <a href="/">
	          <div className="flex items-center gap-2">
	            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
	              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
	                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
	              </svg>
	            </div>
	            <span className="font-semibold text-gray-900 text-sm">Agnos</span>
	          </div>
		  </a>
          <div className="flex items-center gap-2">
            {/* Show submitted badge if editing after submit */}
            {isEditingAfterSubmit && (
              <StatusBadge status="submitted" label={tStatus('submitted')} />
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Edit after submit banner */}
      {isEditingAfterSubmit && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
            <p className="text-xs text-blue-700">
              {tCommon('editing_banner')}
            </p>
            <button
              onClick={() => setIsEditingAfterSubmit(false)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              {tCommon('done_editing')}
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <ProgressBar progress={progress} label={t('progress')} />
        </div>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Patient registration form"
          >
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <PersonalSection />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <ContactSection />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <AdditionalSection />
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <EmergencySection />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {t('submitting')}
                  </>
                ) : isEditingAfterSubmit ? (
                  tCommon('save_changes')
                ) : (
                  t('submit')
                )}
              </button>

              {Object.keys(errors).length > 0 && (
                <p role="alert" className="text-center text-sm text-red-500">
                  {tCommon('fix_errors')}
                </p>
              )}
            </div>
          </form>
        </FormProvider>
      </main>
    </div>
  )
}