'use client'

import { cn } from '@/lib/utils'

interface HoleInputProps {
  holeNumber: number
  par: number
  score?: number
  onScoreChange: (score: number | undefined) => void
  disabled?: boolean
  className?: string
}

export function HoleInput({
  holeNumber,
  par,
  score,
  onScoreChange,
  disabled = false,
  className,
}: HoleInputProps) {
  const scoreToParDiff = score !== undefined ? score - par : 0
  const scoreColor = score === undefined ? 'text-gray-900' : scoreToParDiff < 0 ? 'text-fairway-600' : scoreToParDiff > 0 ? 'text-red-600' : 'text-gray-900'
  const scoreBg = score === undefined ? 'bg-gray-100' : scoreToParDiff < 0 ? 'bg-fairway-50' : scoreToParDiff > 0 ? 'bg-red-50' : 'bg-white'

  const handleMinus = () => {
    if (score === undefined) {
      onScoreChange(par - 1)
    } else if (score > 1) {
      onScoreChange(score - 1)
    }
  }

  const handlePlus = () => {
    if (score === undefined) {
      onScoreChange(par + 1)
    } else if (score < 20) {
      onScoreChange(score + 1)
    }
  }

  const formatScore = (s?: number) => (s === undefined ? '-' : s.toString())
  const formatToPar = (s?: number) => {
    if (s === undefined) return ''
    const diff = s - par
    if (diff === 0) return 'E'
    if (diff > 0) return `+${diff}`
    return `${diff}`
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200',
        'tap-target',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Hole Number Badge */}
      <div className="flex items-center gap-2 w-full justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-gray-600 uppercase">Hole</span>
          <span className="text-sm font-bold text-gray-900">{holeNumber}</span>
        </div>
        <span className="text-xs font-semibold text-gray-600">Par {par}</span>
      </div>

      {/* Score Display */}
      <div className={cn('w-full h-16 rounded-lg flex items-center justify-center', 'border-2 border-gray-300 transition-all', scoreBg, scoreColor)}>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">{formatScore(score)}</span>
          {score !== undefined && <span className="text-xs font-semibold">{formatToPar(score)}</span>}
        </div>
      </div>

      {/* +/- Buttons */}
      <div className="flex gap-2 w-full">
        <button
          onClick={handleMinus}
          disabled={disabled || (score === undefined && par <= 1) || (score !== undefined && score <= 1)}
          className={cn(
            'flex-1 h-12 rounded-lg font-bold text-lg transition-colors',
            'tap-target',
            'border-2 border-gray-300 bg-white text-gray-900',
            'hover:bg-gray-50 hover:border-gray-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-fairway-500 focus:ring-offset-2'
          )}
          aria-label={`Decrease score for hole ${holeNumber}`}
        >
          −
        </button>
        <button
          onClick={handlePlus}
          disabled={disabled || (score !== undefined && score >= 20)}
          className={cn(
            'flex-1 h-12 rounded-lg font-bold text-lg transition-colors',
            'tap-target',
            'border-2 border-gray-300 bg-white text-gray-900',
            'hover:bg-gray-50 hover:border-gray-400',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300',
            'focus:outline-none focus:ring-2 focus:ring-fairway-500 focus:ring-offset-2'
          )}
          aria-label={`Increase score for hole ${holeNumber}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
