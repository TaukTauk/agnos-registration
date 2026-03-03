import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import PWAInstallBanner from '@/components/ui/PWAInstallBanner'

const locales = ['en', 'th']

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(locales, locale)) {
    notFound()
  }

  // Load messages directly instead of relying on getMessages()
  const messages = (await import(`../../../messages/${locale}.json`)).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
	  <PWAInstallBanner/>
    </NextIntlClientProvider>
  )
}