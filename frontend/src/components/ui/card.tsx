import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  active?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = true, active, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-bg-elevated border border-border-subtle rounded-lg',
        hover && 'hover:-translate-y-0.5 hover:border-border-strong transition-all duration-200',
        active && 'border-l-2 border-l-accent-primary bg-bg-overlay',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
