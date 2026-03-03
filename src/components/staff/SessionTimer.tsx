'use client'

import { useEffect, useState } from 'react'

interface SessionTimerProps {
  createdAt: string
}

export default function SessionTimer({ createdAt }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(createdAt).getTime()
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setElapsed(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [createdAt])

  return (
    <span className="font-mono text-sm font-semibold text-blue-600">
      {elapsed}
    </span>
  )
}