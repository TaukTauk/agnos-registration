'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'th' : 'en'
    const segments = pathname.split('/')
    segments[1] = nextLocale
    const newPath = segments.join('/')

    startTransition(() => {
      // Hard navigation forces server to reload with new locale messages
      window.location.href = newPath
    })
  }

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm font-medium text-gray-600 hover:text-blue-600 transition-all duration-200 disabled:opacity-50"
      aria-label="Switch language"
    >
      <span className="text-base">{locale === 'en' ? '🇹🇭' : '🇬🇧'}</span>
      <span className="hidden sm:flex">{locale === 'en' ? 'ภาษาไทย' : 'English'}</span>
    </button>
  )
}