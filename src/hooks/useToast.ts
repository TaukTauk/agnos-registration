import { useState, useCallback } from 'react'
import { ToastMessage, ToastType } from '@/components/ui/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((
    type: ToastType,
    title: string,
    description?: string
  ) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`
    setToasts((prev) => [...prev, { id, type, title, description }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}