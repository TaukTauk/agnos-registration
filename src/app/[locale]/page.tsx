import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('nav')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">

        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Agnos</h1>
          <p className="text-gray-500 text-sm mt-1">Smart Registration System</p>
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <Link
            href="/en/patient"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            {t('patient')}
          </Link>
          <Link
            href="/en/staff"
            className="block w-full bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-6 rounded-xl border-2 border-blue-600 transition-colors duration-200"
          >
            {t('staff')}
          </Link>
        </div>

      </div>
    </main>
  )
}