interface ProgressBarProps {
  progress: number
  label?: string
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium text-gray-600">{label}</span>
          <span className="text-xs font-semibold text-blue-600">{progress}%</span>
        </div>
      )}
      <div
        className="w-full bg-gray-100 rounded-full h-2 overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}