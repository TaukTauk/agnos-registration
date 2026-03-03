import { PatientStatus } from '@/types/patient'

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = sessionStorage.getItem('patient_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('patient_session_id', sessionId)
  }
  return sessionId
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('patient_session_id')
}

export function getActivityStatus(
  lastActivityAt: string,
  status: PatientStatus
): PatientStatus {
  if (status === 'submitted') return 'submitted'
  if (status === 'expired') return 'expired'

  const diff = Date.now() - new Date(lastActivityAt).getTime()
  const thirtySeconds = 30 * 1000
  const thirtyMinutes = 30 * 60 * 1000

  if (diff > thirtyMinutes) return 'expired'
  if (diff > thirtySeconds) return 'inactive'
  return 'filling'
}

export function isSessionExpired(lastActivityAt: string, status: PatientStatus): boolean {
  if (status === 'submitted') return false
  if (status === 'expired') return true
  const diff = Date.now() - new Date(lastActivityAt).getTime()
  return diff > 30 * 60 * 1000
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatElapsed(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}

export function calculateProgress(data: Record<string, unknown>): number {
  const requiredFields = [
    'first_name', 'last_name', 'date_of_birth',
    'gender', 'nationality', 'preferred_language',
    'phone', 'address'
  ]
  const filled = requiredFields.filter(
    (field) => data[field] && String(data[field]).trim() !== ''
  ).length
  return Math.round((filled / requiredFields.length) * 100)
}