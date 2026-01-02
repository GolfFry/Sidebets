'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
  action?: React.ReactNode
  className?: string
}

export function Header({
  title,
  subtitle,
  showBack = false,
  backHref,
  action,
  className,
}: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header className={cn('sticky top-0 bg-white border-b border-gray-100 z-30 safe-top', className)}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button or spacer */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 truncate">{subtitle}</p>}
        </div>

        {/* Right: Action or spacer */}
        <div className="w-10 flex justify-end">{action}</div>
      </div>
    </header>
  )
}
