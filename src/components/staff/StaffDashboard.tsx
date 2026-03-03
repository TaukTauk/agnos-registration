'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { PatientSession } from '@/types/patient'
import PatientCard from './PatientCard'
import PatientTable from './PatientTable'
import DashboardFilters from './DashboardFilters'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import { ToastContainer } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

type ViewMode = 'card' | 'table'

interface FilterState {
  search: string
  gender: string
  nationality: string
}

export default function StaffDashboard() {
  const t = useTranslations()
  const [sessions, setSessions] = useState<PatientSession[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [showExpired, setShowExpired] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    gender: '',
    nationality: '',
  })
  const { toasts, addToast, removeToast } = useToast()

  // Auto-switch to card view on mobile
	useEffect(() => {
	  const checkMobile = () => {
	    if (window.innerWidth < 768) {
	      setViewMode('card')
	    }
	  }
	  checkMobile()
	  window.addEventListener('resize', checkMobile)
	  return () => window.removeEventListener('resize', checkMobile)
	}, [])

  // Initial fetch
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('patient_sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setSessions(data as PatientSession[])
      setLoading(false)
    }
    fetchSessions()
  }, [])

  // Realtime subscription
  useEffect(() => {
	  const channel = supabase
	    .channel('patient_sessions_changes')
	    .on(
	      'postgres_changes',
	      { event: '*', schema: 'public', table: 'patient_sessions' },
	      (payload) => {
	        if (payload.eventType === 'INSERT') {
	          const newSession = payload.new as PatientSession
	          setSessions((prev) => [newSession, ...prev])
	          const name = newSession.first_name
	            ? `${newSession.first_name} ${newSession.last_name ?? ''}`.trim()
	            : t('staff.table.anonymous')
	          addToast('info', t('toast.new_patient'), name)
	        } else if (payload.eventType === 'UPDATE') {
	          const updated = payload.new as PatientSession
	          setSessions((prev) =>
	            prev.map((s) =>
	              s.session_id === updated.session_id ? updated : s
	            )
	          )
	          // Notify when a patient submits
	          if (updated.status === 'submitted') {
	            const name = updated.first_name
	              ? `${updated.first_name} ${updated.last_name ?? ''}`.trim()
	              : t('staff.table.anonymous')
	            addToast('success', t('toast.patient_submitted'), name)
	          }
	        } else if (payload.eventType === 'DELETE') {
	          setSessions((prev) =>
	            prev.filter((s) => s.session_id !== (payload.old as PatientSession).session_id)
	          )
	        }
	      }
	    )
	    .subscribe()

	  return () => { supabase.removeChannel(channel) }
	}, [addToast, t])

  // Auto-expire inactive sessions every minute
  useEffect(() => {
    const expireSessions = async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()

      await supabase
        .from('patient_sessions')
        .update({ status: 'expired' })
        .in('status', ['filling', 'inactive'])
        .lt('last_activity_at', thirtyMinutesAgo)

      setSessions((prev) =>
        prev.map((s) => {
          if (s.status === 'submitted' || s.status === 'expired') return s
          const diff = Date.now() - new Date(s.last_activity_at).getTime()
          if (diff > 30 * 60 * 1000) return { ...s, status: 'expired' as const }
          return s
        })
      )
    }

    expireSessions()
    const interval = setInterval(expireSessions, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Derive unique nationalities from sessions for filter dropdown
  const availableNationalities = useMemo(() => {
    const nats = sessions
      .map((s) => s.nationality)
      .filter((n): n is string => !!n && n.trim() !== '')
    return [...new Set(nats)].sort()
  }, [sessions])

  // Apply filters
  const applyFilters = (list: PatientSession[]) => {
    return list.filter((s) => {
      const fullName = `${s.first_name ?? ''} ${s.last_name ?? ''}`.toLowerCase()
      const matchSearch =
        filters.search === '' ||
        fullName.includes(filters.search.toLowerCase()) ||
        (s.first_name ?? '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (s.last_name ?? '').toLowerCase().includes(filters.search.toLowerCase())

      const matchGender =
        filters.gender === '' || s.gender === filters.gender

      const matchNationality =
        filters.nationality === '' || s.nationality === filters.nationality

      return matchSearch && matchGender && matchNationality
    })
  }

  const activeSessions = sessions.filter((s) => s.status === 'filling' || s.status === 'inactive')
  const submittedSessions = sessions.filter((s) => s.status === 'submitted')
  const expiredSessions = sessions.filter((s) => s.status === 'expired')

  const filteredActive = applyFilters(activeSessions)
  const filteredSubmitted = applyFilters(submittedSessions)
  const filteredExpired = applyFilters(expiredSessions)

  const totalCount = sessions.length
  const filteredCount = filteredActive.length + filteredSubmitted.length + filteredExpired.length

  const hasResults = filteredActive.length > 0 || filteredSubmitted.length > 0 || filteredExpired.length > 0
  const hasActiveFilters = filters.search !== '' || filters.gender !== '' || filters.nationality !== ''

  const handleSessionExpired = (sessionId: string) => {
	  setSessions((prev) =>
	    prev.map((s) =>
	      s.session_id === sessionId ? { ...s, status: 'expired' as const } : s
	    )
	  )
	  addToast('warning', t('toast.session_expired'))
	}

	const handleSessionDeleted = (sessionId: string) => {
	  setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
	  addToast('error', t('toast.session_deleted'))
	}

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
		  <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

		    {/* Logo */}
		    <a href="/">
		      <div className="flex items-center gap-2">
		        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
		          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
		              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
		          </svg>
		        </div>
		        <div>
		          <h1 className="text-sm font-bold text-gray-900">{t('staff.title')}</h1>
		          <p className="text-xs text-gray-400 hidden sm:block">{t('staff.subtitle')}</p>
		        </div>
		      </div>
		    </a>

		    {/* Right controls */}
		    <div className="flex items-center gap-2">

		      {/* Live + Stats — desktop only */}
		      <div className="hidden md:flex items-center gap-3">
		        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
		          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
		          <span className="text-xs font-medium text-green-700">{t('staff.live')}</span>
		        </div>
		        <div className="flex items-center gap-3 text-xs text-gray-500">
		          <span><b className="text-blue-600">{activeSessions.length}</b> {t('staff.active')}</span>
		          <span><b className="text-green-600">{submittedSessions.length}</b> {t('staff.submitted_count')}</span>
		          <span><b className="text-gray-400">{expiredSessions.length}</b> {t('staff.expired_count')}</span>
		        </div>
		      </div>

		      {/* View toggle — always visible */}
		      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
		        <button
		          onClick={() => setViewMode('card')}
		          className={`px-2.5 py-1.5 transition-colors duration-200 ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
		          aria-label="Card view"
		          aria-pressed={viewMode === 'card'}
		        >
		          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
		              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
		          </svg>
		        </button>
		        <button
		          onClick={() => setViewMode('table')}
		          className={`px-2.5 py-1.5 transition-colors duration-200 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
		          aria-label="Table view"
		          aria-pressed={viewMode === 'table'}
		        >
		          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
		              d="M3 10h18M3 14h18M10 6h4M10 18h4M3 6h4M3 18h4M17 6h4M17 18h4" />
		          </svg>
		        </button>
		      </div>

		      <LanguageSwitcher />
		    </div>
		  </div>
		</header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-400">{t('staff.loading_sessions')}</p>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">{t('staff.no_patients')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('staff.no_patients_sub')}</p>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <DashboardFilters
              filters={filters}
              onChange={setFilters}
              availableNationalities={availableNationalities}
              totalCount={totalCount}
              filteredCount={filteredCount}
            />

            {/* No results after filtering */}
            {hasActiveFilters && !hasResults ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">{t('staff.no_filter_results')}</p>
                <button
                  onClick={() => setFilters({ search: '', gender: '', nationality: '' })}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  {t('staff.clear_filters')}
                </button>
              </div>
            ) : (
              <div className="space-y-8">

                {/* Active Sessions */}
                {filteredActive.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                      {t('staff.active_sessions')} ({filteredActive.length})
                    </h2>
                    {viewMode === 'table' ? (
					  <PatientTable
					    sessions={filteredActive}
					    onExpired={handleSessionExpired}
					    onDeleted={handleSessionDeleted}
						onToast={addToast}
					  />
					) : (
					  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					    {filteredActive.map((session) => (
					      <PatientCard
					        key={session.session_id}
					        session={session}
					        onExpired={handleSessionExpired}
					        onDeleted={handleSessionDeleted}
							onToast={addToast}
					      />
					    ))}
					  </div>
					)}
                  </section>
                )}

                {/* Submitted Sessions */}
                {filteredSubmitted.length > 0 && (
                  <section>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      {t('staff.submitted_sessions')} ({filteredSubmitted.length})
                    </h2>
                    {viewMode === 'table' ? (
					  <PatientTable
					    sessions={filteredSubmitted}
					    onExpired={handleSessionExpired}
					    onDeleted={handleSessionDeleted}
						onToast={addToast}
					  />
					) : (
					  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					    {filteredSubmitted.map((session) => (
					      <PatientCard
					        key={session.session_id}
					        session={session}
					        onExpired={handleSessionExpired}
					        onDeleted={handleSessionDeleted}
							onToast={addToast}
					      />
					    ))}
					  </div>
					)}
                  </section>
                )}

                {/* Expired Sessions — collapsed by default */}
                {filteredExpired.length > 0 && (
                  <section>
                    <button
                      onClick={() => setShowExpired((prev) => !prev)}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 hover:text-gray-600 transition-colors w-full text-left"
                      aria-expanded={showExpired}
                    >
                      <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                      {t('staff.expired_sessions')} ({filteredExpired.length})
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${showExpired ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showExpired && (
					  viewMode === 'table' ? (
					    <PatientTable
					      sessions={filteredExpired}
					      onExpired={handleSessionExpired}
					      onDeleted={handleSessionDeleted}
						  onToast={addToast}
					    />
					  ) : (
					    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-60">
					      {filteredExpired.map((session) => (
					        <PatientCard
					          key={session.session_id}
					          session={session}
					          onExpired={handleSessionExpired}
					          onDeleted={handleSessionDeleted}
							  onToast={addToast}
					        />
					      ))}
					    </div>
					  )
					)}
                  </section>
                )}

              </div>
            )}
          </>
        )}
      </main>
	  <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}