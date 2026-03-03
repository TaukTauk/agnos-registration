declare module 'next-pwa' {
  import { NextConfig } from 'next'

  type PWAOptions = {
    dest: string
    disable?: boolean
    register?: boolean
    skipWaiting?: boolean
  }

  export default function withPWA(
    options: PWAOptions
  ): (config: NextConfig) => NextConfig
}