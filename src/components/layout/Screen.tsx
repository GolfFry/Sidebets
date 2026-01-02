import { cn } from '@/lib/utils'

interface ScreenProps {
  children: React.ReactNode
  className?: string
  padBottom?: boolean
}

export function Screen({ children, className, padBottom = true }: ScreenProps) {
  return (
    <div
      className={cn('min-h-screen bg-gray-50', padBottom && 'pb-20', className)}
    >
      {children}
    </div>
  )
}
