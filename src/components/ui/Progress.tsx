interface ProgressProps {
  value: number
  max?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Progress({
  value,
  max = 100,
  showLabel = true,
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  const heights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  }

  return (
    <div className="w-full space-y-1">
      <div className={`progress-bar ${heights[size]}`}>
        <div
          className="progress-bar-fill transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  )
}
