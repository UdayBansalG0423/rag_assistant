import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-accent-primary text-white hover:shadow-accent-glow hover:-translate-y-0.5 active:translate-y-0',
      secondary: 'border border-border-strong text-text-primary hover:bg-bg-overlay hover:border-border-default',
      ghost: 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary',
      danger: 'bg-status-error/15 text-status-error hover:bg-status-error/25',
      outline: 'border border-border-default bg-transparent text-text-primary hover:bg-bg-overlay hover:border-border-strong',
    }
    
    const sizes = {
      sm: 'px-4 py-1.5 text-sm',
      md: 'px-6 py-2.5 text-sm',
      lg: 'px-8 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
