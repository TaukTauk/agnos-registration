import createMiddleware from 'next-intl/middleware'
import { routing } from './src/navigation'

export default createMiddleware(routing)

export const config = {
  matcher: ['/', '/(en|th)/:path*']
}