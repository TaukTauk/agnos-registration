interface FieldRowProps {
  label: string
  value: string | null | undefined
  emptyLabel: string
}

export default function FieldRow({ label, value, emptyLabel }: FieldRowProps) {
  const isEmpty = !value || value.trim() === ''

  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-400 shrink-0 w-36">{label}</span>
      <span className={`text-xs text-right flex-1 ${isEmpty ? 'text-gray-300 italic' : 'text-gray-800 font-medium'}`}>
        {isEmpty ? emptyLabel : value}
      </span>
    </div>
  )
}