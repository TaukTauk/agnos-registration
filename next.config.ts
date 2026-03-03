import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import withPWAInit from 'next-pwa'

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

const nextConfig: NextConfig = {}

const config = withPWA(nextConfig)

export default withNextIntl(config) as NextConfig