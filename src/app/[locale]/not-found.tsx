import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'

async function getMessages(locale: string) {
  try {
    return (await import(`../../../messages/${locale}.json`)).default
  } catch {
    return (await import('../../../messages/en.json')).default
  }
}

export default async function NotFoundPage() {
  // Can't access params in not-found, default to 'en'
  const messages = await getMessages('en')

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <NotFoundContent />
    </NextIntlClientProvider>
  )
}

function NotFoundContent() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 12h.01M12 3v.01M21 12h.01M12 21v.01M4.22 4.22l.01.01M19.78 4.22l.01.01M19.78 19.78l.01.01M4.22 19.78l.01.01" />
            </svg>
          </div>
          <h1 className="text-6xl font-black text-gray-200 mb-2">404</h1>
          <h2 className="text-xl font-bold text-gray-900">Page not found</h2>
          <p className="text-gray-500 text-sm mt-2">
            The page you are looking for does not exist.
          </p>
        </div>
        <Link
          href="/en"
          className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}