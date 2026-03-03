'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export interface SelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  id?: string
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  optional?: boolean
  disabled?: boolean
}

export default function SearchableSelect({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
  optional,
  disabled,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const t = useTranslations('common')
  const selected = options.find((o) => o.value === value)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
  }, [open])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setSearch('') }
    if (e.key === 'Enter' && !open) setOpen(true)
  }

  const handleSelect = (option: SelectOption) => {
    onChange(option.value)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {optional && (
          <span className="ml-1 text-xs text-gray-400 font-normal">({t('optional')})</span>
        )}
      </label>

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`
          w-full px-4 py-2.5 rounded-xl border text-sm text-left
          outline-none transition-all duration-200 bg-white
          flex items-center justify-between gap-2
          ${error
            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-400'
            : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          }
          disabled:bg-gray-50 disabled:text-gray-400
        `}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          style={{ width: containerRef.current?.offsetWidth }}
          role="listbox"
          aria-label={label}
        >
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full px-3 py-2 text-sm border text-black border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options list */}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400 text-center">{t('no_results')}</li>
            ) : (
              filtered.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100
                    flex items-center justify-between
                    ${option.value === value
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {option.label}
                  {option.value === value && (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  )
}