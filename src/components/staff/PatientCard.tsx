'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { PatientSession } from '@/types/patient'
import { getActivityStatus, formatDateTime } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'
import FieldRow from './FieldRow'
import SessionTimer from './SessionTimer'
import SessionActions from './SessionActions'
import jsPDF from 'jspdf'
import type { ToastType } from '@/components/ui/Toast'

interface PatientCardProps {
  session: PatientSession
  onExpired?: (sessionId: string) => void
  onDeleted?: (sessionId: string) => void
  onToast?: (type: ToastType, title: string, description?: string) => void
}

export default function PatientCard({ session, onExpired, onDeleted, onToast }: PatientCardProps) {
  const t = useTranslations()
  const cardRef = useRef<HTMLDivElement>(null)

  const currentStatus = getActivityStatus(session.last_activity_at, session.status)

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const margin = 20
    let y = margin

    doc.setFontSize(18)
    doc.setTextColor(37, 99, 235)
    doc.text('Agnos Smart Registration', margin, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Patient Registration Report`, margin, y)
    y += 5
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

    if (session.submitted_at) {
      y += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, 210 - margin, y)
      y += 8
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Submitted At: ${new Date(session.submitted_at).toLocaleString()}`, margin, y)
    }

    doc.save(`patient-${session.session_id}.pdf`)
    onToast?.('success', t('toast.pdf_exported'), `patient-${session.session_id}.pdf`)
  }

  const fields: [string, string | null][] = [
    [t('patient.fields.first_name'), session.first_name],
    [t('patient.fields.middle_name'), session.middle_name],
    [t('patient.fields.last_name'), session.last_name],
    [t('patient.fields.date_of_birth'), session.date_of_birth],
    [t('patient.fields.gender'), session.gender],
    [t('patient.fields.phone'), session.phone],
    [t('patient.fields.email'), session.email],
    [t('patient.fields.address'), session.address],
    [t('patient.fields.nationality'), session.nationality],
    [t('patient.fields.preferred_language'), session.preferred_language],
    [t('patient.fields.religion'), session.religion],
    [t('patient.fields.emergency_name'), session.emergency_name],
    [t('patient.fields.emergency_relationship'), session.emergency_relationship],
  ]

  return (
    <div
      ref={cardRef}
      className={`
        bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300
        ${currentStatus === 'submitted' ? 'border-green-200' :
          currentStatus === 'inactive' ? 'border-orange-100' :
          currentStatus === 'expired' ? 'border-gray-100' :
          'border-blue-100'}
      `}
    >
      {/* Card Header */}
      <div className={`
        px-4 py-3 flex items-center justify-between
        ${currentStatus === 'submitted' ? 'bg-green-50' :
          currentStatus === 'inactive' ? 'bg-orange-50' :
          currentStatus === 'expired' ? 'bg-gray-50' :
          'bg-blue-50'}
      `}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {session.first_name && session.last_name
                ? `${session.first_name} ${session.last_name}`
                : t('staff.anonymous')}
            </p>
            <p className="text-xs text-gray-400 font-mono truncate">
              {session.session_id.slice(0, 20)}...
            </p>
          </div>
        </div>
        <StatusBadge
          status={currentStatus}
          label={t(`status.${currentStatus}`)}
        />
      </div>

      {/* Timer + Last Activity */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-400">{t('staff.session_timer')}:</span>
          <SessionTimer createdAt={session.created_at} />
        </div>
        <div className="text-xs text-gray-400">
          {t('staff.last_activity')}: {formatDateTime(session.last_activity_at)}
        </div>
      </div>

      {/* Fields */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {t('staff.fields')}
        </p>
        {fields.map(([label, value]) => (
          <FieldRow
            key={label}
            label={label}
            value={value}
            emptyLabel={t('staff.empty_field')}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 space-y-2">
        {/* Submitted time */}
        {session.submitted_at && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{t('staff.submitted_at')} {new Date(session.submitted_at).toLocaleString()}</span>
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2">
          {/* PDF export */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {t('staff.export_pdf')}
          </button>

          {/* Expire + Delete */}
          <SessionActions
            session={session}
            onExpired={onExpired}
            onDeleted={onDeleted}
            compact={true}
          />
        </div>
      </div>
    </div>
  )
}