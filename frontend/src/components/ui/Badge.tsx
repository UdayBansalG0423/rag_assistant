import { cn } from '@/utils/cn'

interface BadgeProps {
  variant?: 'ready' | 'indexing' | 'error' | 'default'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    ready: 'bg-status-ready/15 text-status-ready',
    indexing: 'bg-status-indexing/15 text-status-indexing',
    error: 'bg-status-error/15 text-status-error',
    default: 'bg-bg-overlay text-text-secondary border border-border-subtle',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {variant === 'indexing' && <span className="w-1.5 h-1.5 rounded-full bg-status-indexing animate-pulse" />}
      {variant === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-status-ready" />}
      {variant === 'error' && <span className="w-1.5 h-1.5 rounded-full bg-status-error" />}
      {children}
    </span>
  )
}
