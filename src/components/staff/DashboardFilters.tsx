'use client'
import { useTranslations } from 'next-intl'

interface FilterState {
  search: string
  gender: string
  nationality: string
}

interface DashboardFiltersProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  availableNationalities: string[]
  totalCount: number
  filteredCount: number
}

export default function DashboardFilters({
  filters,
  onChange,
  availableNationalities,
  totalCount,
  filteredCount,
}: DashboardFiltersProps) {
  const hasActiveFilters =
    filters.search !== '' || filters.gender !== '' || filters.nationality !== ''
  const t = useTranslations('staff')
  const handleClear = () => {
    onChange({ search: '', gender: '', nationality: '' })
  }

return (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-6">
    <div className="flex flex-col gap-3">

      {/* Search — always full width */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder={t('search_name')}
          className="w-full text-black pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
          aria-label="Search patients by name"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Gender + Nationality + Clear in a row */}
      <div className="flex gap-2">
        {/* Gender */}
        <div className="relative flex-1">
          <select
            value={filters.gender}
            onChange={(e) => onChange({ ...filters, gender: e.target.value })}
            className="font-sans w-full appearance-none pl-3 pr-7 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white text-gray-700"
            aria-label="Filter by gender"
          >
            <option value="">{t('all_genders')}</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Nationality */}
        <div className="relative flex-1">
          <select
            value={filters.nationality}
            onChange={(e) => onChange({ ...filters, nationality: e.target.value })}
            className="font-sans w-full appearance-none pl-3 pr-7 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all duration-200 bg-white text-gray-700"
            aria-label="Filter by nationality"
          >
            <option value="">{t('all_nationalities')}</option>
            {availableNationalities.map((nat) => (
              <option key={nat} value={nat} className="capitalize">
                {nat.charAt(0).toUpperCase() + nat.slice(1)}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-xl transition-colors duration-200 whitespace-nowrap shrink-0"
            aria-label="Clear all filters"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">{t('clear')}</span>
          </button>
        )}
      </div>
    </div>

    {/* Results count */}
    {hasActiveFilters && (
      <p className="text-xs text-gray-400 mt-2">
        {t('showing')} <b className="text-gray-600">{filteredCount}</b> {t('of')}{' '}
        <b className="text-gray-600">{totalCount}</b> {t('patients')}
      </p>
    )}
  </div>
)
}