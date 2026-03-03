import { PatientStatus } from '@/types/patient'

interface StatusBadgeProps {
  status: PatientStatus
  label: string
}

const statusConfig = {
  filling: {
    dot: 'bg-yellow-400 animate-pulse',
    badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  inactive: {
    dot: 'bg-orange-400',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  expired: {
    dot: 'bg-gray-400',
    badge: 'bg-gray-50 text-gray-500 border-gray-200',
  },
  submitted: {
    dot: 'bg-green-400',
    badge: 'bg-green-50 text-green-700 border-green-200',
  },
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badge}`}
      role="status"
      aria-label={`Patient status: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  )
}