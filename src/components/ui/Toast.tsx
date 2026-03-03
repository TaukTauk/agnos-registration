'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'info' | 'warning' | 'error'

export interface ToastMessage {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastProps {
  toast: ToastMessage
  onRemove: (id: string) => void
}

const toastConfig = {
  success: {
    bg: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    title: 'text-green-900',
    desc: 'text-green-700',
    bar: 'bg-green-400',
    path: 'M5 13l4 4L19 7',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    title: 'text-blue-900',
    desc: 'text-blue-700',
    bar: 'bg-blue-400',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    bg: 'bg-orange-50 border-orange-200',
    icon: 'text-orange-600',
    title: 'text-orange-900',
    desc: 'text-orange-700',
    bar: 'bg-orange-400',
    path: 'M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z',
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    title: 'text-red-900',
    desc: 'text-red-700',
    bar: 'bg-red-400',
    path: 'M6 18L18 6M6 6l12 12',
  },
}

function Toast({ toast, onRemove }: ToastProps) {
  const [visible, setVisible] = useState(false)
  const config = toastConfig[toast.type]

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setVisible(true), 10)
    // Animate out then remove
    const hideTimer = setTimeout(() => setVisible(false), 3800)
    const removeTimer = setTimeout(() => onRemove(toast.id), 4200)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [toast.id, onRemove])

  return (
    <div
      className={`
        relative overflow-hidden w-80 rounded-xl border shadow-lg p-4
        transition-all duration-300 ease-in-out
        ${config.bg}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 mt-0.5 ${config.icon}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.path} />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${config.title}`}>{toast.title}</p>
          {toast.description && (
            <p className={`text-xs mt-0.5 ${config.desc}`}>{toast.description}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={() => onRemove(toast.id)}
          className={`shrink-0 ${config.icon} opacity-60 hover:opacity-100 transition-opacity`}
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 ${config.bar} animate-shrink`} />
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}