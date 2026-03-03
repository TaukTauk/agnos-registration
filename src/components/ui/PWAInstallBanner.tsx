'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePWAInstall } from '@/hooks/usePWAInstall'

const DISMISSED_KEY = 'pwa_banner_dismissed'

export default function PWAInstallBanner() {
  const t = useTranslations('common')
  const { install, isInstallable, isStandalone } = usePWAInstall()
  const [isClient, setIsClient] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Check if user already dismissed
    const wasDismissed = localStorage.getItem(DISMISSED_KEY) === 'true'
    setDismissed(wasDismissed)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  const handleInstall = async () => {
    await install()
    localStorage.setItem(DISMISSED_KEY, 'true')
    setDismissed(true)
  }

  if (!isClient) return null
  if (isStandalone) return null
  if (!isInstallable) return null
  if (dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white border border-gray-200 shadow-xl rounded-2xl p-4 z-50 animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        {/* App icon */}
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{t('install_app')}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t('install_description')}</p>
        </div>

        {/* Dismiss X */}
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
          aria-label="Dismiss install banner"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Install button */}
      <button
        onClick={handleInstall}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-colors duration-200"
      >
        {t('install_app')}
      </button>
    </div>
  )
}