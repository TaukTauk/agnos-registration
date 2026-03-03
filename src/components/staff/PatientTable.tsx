'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PatientSession } from '@/types/patient'
import { getActivityStatus, formatDateTime } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import SessionTimer from './SessionTimer'
import SessionActions from './SessionActions'
import type { ToastType } from '@/components/ui/Toast'

interface PatientTableProps {
  sessions: PatientSession[]
  onExpired?: (sessionId: string) => void
  onDeleted?: (sessionId: string) => void
  onToast?: (type: ToastType, title: string, desc?: string) => void
}

export default function PatientTable({
  sessions,
  onExpired,
  onDeleted,
  onToast,
}: PatientTableProps) {
  const t = useTranslations()

  const handleExportPDF = (session: PatientSession) => {
    const { default: jsPDF } = require('jspdf')
    const doc = new jsPDF()
    const margin = 20
    let y = margin

    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('Agnos Smart Registration', margin, y)
    y += 8
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y)
    y += 5
    doc.text(`Session ID: ${session.session_id}`, margin, y)
    y += 12

    doc.setDrawColor(200, 200, 200)
    doc.line(margin, y, 210 - margin, y)
    y += 10

    const addSection = (title: string, fields: [string, string | null][]) => {
      doc.setFontSize(12)
      doc.setTextColor(37, 99, 235)
      doc.text(title, margin, y)
      y += 7
      doc.setFontSize(10)
      fields.forEach(([label, value]) => {
        doc.setTextColor(100, 100, 100)
        doc.text(`${label}:`, margin, y)
        doc.setTextColor(30, 30, 30)
        doc.text(value || '—', margin + 55, y)
        y += 6
      })
      y += 4
    }

    addSection('Personal Information', [
      ['First Name', session.first_name],
      ['Middle Name', session.middle_name],
      ['Last Name', session.last_name],
      ['Date of Birth', session.date_of_birth],
      ['Gender', session.gender],
    ])
    addSection('Contact Information', [
      ['Phone', session.phone],
      ['Email', session.email],
      ['Address', session.address],
    ])
    addSection('Additional Information', [
      ['Nationality', session.nationality],
      ['Preferred Language', session.preferred_language],
      ['Religion', session.religion],
    ])
    addSection('Emergency Contact', [
      ['Name', session.emergency_name],
      ['Relationship', session.emergency_relationship],
    ])

    doc.save(`patient-${session.session_id}.pdf`)
    onToast?.('success', t('toast.pdf_exported'))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Patient sessions table">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {/* Always visible */}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.patient')}
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.status')}
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.phone')}
              </th>
              {/* Hidden on mobile */}
              <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.nationality')}
              </th>
              <th className="hidden md:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.language')}
              </th>
              <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.session_time')}
              </th>
              <th className="hidden sm:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.last_activity')}
              </th>
              <th className="hidden lg:table-cell text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.submitted_at')}
              </th>
              {/* Always visible */}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                {t('staff.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.map((session) => {
              const currentStatus = getActivityStatus(
                session.last_activity_at,
                session.status
              )
              const name =
                session.first_name || session.last_name
                  ? `${session.first_name ?? ''} ${session.last_name ?? ''}`.trim()
                  : t('staff.table.anonymous')

              return (
                <tr
                  key={session.session_id}
                  className="hover:bg-gray-50 transition-colors duration-100"
                >
                  {/* Patient — always visible */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 whitespace-nowrap">{name}</p>
                        <p className="text-xs text-gray-400 font-mono hidden sm:block">
                          {session.session_id.slice(0, 16)}...
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status — always visible */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={currentStatus}
                      label={t(`status.${currentStatus}`)}
                    />
                  </td>

                  {/* Phone — always visible */}
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {session.phone || (
                      <span className="text-gray-300 italic text-xs">—</span>
                    )}
                  </td>

                  {/* Nationality — hidden on mobile */}
                  <td className="hidden md:table-cell px-4 py-3 text-gray-600 whitespace-nowrap capitalize">
                    {session.nationality || (
                      <span className="text-gray-300 italic text-xs">—</span>
                    )}
                  </td>

                  {/* Language — hidden on mobile */}
                  <td className="hidden md:table-cell px-4 py-3 text-gray-600 whitespace-nowrap capitalize">
                    {session.preferred_language || (
                      <span className="text-gray-300 italic text-xs">—</span>
                    )}
                  </td>

                  {/* Session timer — hidden on tablet and below */}
                  <td className="hidden lg:table-cell px-4 py-3">
                    <SessionTimer createdAt={session.created_at} />
                  </td>

                  {/* Last activity — hidden on mobile */}
                  <td className="hidden sm:table-cell px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {formatDateTime(session.last_activity_at)}
                  </td>

                  {/* Submitted at — hidden on tablet and below */}
                  <td className="hidden lg:table-cell px-4 py-3 text-xs whitespace-nowrap">
                    {session.submitted_at ? (
                      <div className="flex items-center gap-1.5 text-green-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 13l4 4L19 7" />
                        </svg>
                        {new Date(session.submitted_at).toLocaleString()}
                      </div>
                    ) : (
                      <span className="text-gray-300 italic">—</span>
                    )}
                  </td>

                  {/* Actions — always visible */}
                  <td className="px-4 py-3">
                    <TableRowActions
                      session={session}
                      onExpired={onExpired}
                      onDeleted={onDeleted}
                      onToast={onToast}
                      t={t}
                      handleExportPDF={handleExportPDF}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TableRowActions({
  session,
  onExpired,
  onDeleted,
  onToast,
  t,
  handleExportPDF,
}: {
  session: PatientSession
  onExpired?: (id: string) => void
  onDeleted?: (id: string) => void
  onToast?: (type: ToastType, title: string, desc?: string) => void
  t: ReturnType<typeof useTranslations>
  handleExportPDF: (session: PatientSession) => void
}) {
  const [showPrint, setShowPrint] = useState(false)

  return (
    <div className="flex items-center gap-1.5">
      {/* PDF — icon only on mobile */}
      <button
        onClick={() => handleExportPDF(session)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors duration-200 whitespace-nowrap"
        aria-label="Export PDF"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="hidden sm:inline">{t('staff.table.pdf')}</span>
      </button>

      {/* Expire + Delete — icon only on mobile */}
      <SessionActions
        session={session}
        onExpired={onExpired}
        onDeleted={onDeleted}
        compact={true}
      />
    </div>
  )
}