import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-bg-elevated border border-border-default rounded-lg px-4 py-2.5',
              'text-text-primary placeholder-text-muted',
              'focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-status-error focus:border-status-error focus:ring-status-error/30',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-status-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
