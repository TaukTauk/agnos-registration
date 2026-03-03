'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PatientSession } from '@/types/patient'
import { markSessionExpired, deleteSession } from '@/lib/sessionActions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface SessionActionsProps {
  session: PatientSession
  onExpired?: (sessionId: string) => void
  onDeleted?: (sessionId: string) => void
  compact?: boolean
}

export default function SessionActions({
  session,
  onExpired,
  onDeleted,
  compact = false,
}: SessionActionsProps) {
  const t = useTranslations()
  const [dialog, setDialog] = useState<'expire' | 'delete' | null>(null)
  const [loading, setLoading] = useState(false)

  const handleExpire = async () => {
    setLoading(true)
    const success = await markSessionExpired(session.session_id)
    if (success) onExpired?.(session.session_id)
    setLoading(false)
    setDialog(null)
  }

  const handleDelete = async () => {
    setLoading(true)
    const success = await deleteSession(session.session_id)
    if (success) onDeleted?.(session.session_id)
    setLoading(false)
    setDialog(null)
  }

  const canExpire = session.status !== 'expired' && session.status !== 'submitted'

  return (
    <>
      <div className={`flex items-center gap-1.5 ${compact ? '' : 'flex-wrap'}`}>

        {/* Mark as expired */}
        {canExpire && (
          <button
            onClick={() => setDialog('expire')}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold border border-orange-200 transition-colors duration-200 whitespace-nowrap disabled:opacity-50"
            aria-label={`Mark ${session.session_id} as expired`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {!compact && t('staff.actions.expire')}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => setDialog('delete')}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-200 transition-colors duration-200 whitespace-nowrap disabled:opacity-50"
          aria-label={`Delete session ${session.session_id}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {!compact && t('staff.actions.delete')}
        </button>
      </div>

      {/* Expire confirmation */}
      <ConfirmDialog
        open={dialog === 'expire'}
        title={t('staff.actions.expire_title')}
        description={t('staff.actions.expire_description')}
        confirmLabel={t('staff.actions.expire')}
        confirmDestructive={false}
        onConfirm={handleExpire}
        onCancel={() => setDialog(null)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={dialog === 'delete'}
        title={t('staff.actions.delete_title')}
        description={t('staff.actions.delete_description')}
        confirmLabel={t('staff.actions.delete')}
        confirmDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDialog(null)}
      />
    </>
  )
}