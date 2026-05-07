"use client"
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    const variants = {
      primary: 'bg-zinc-900 text-white hover:bg-zinc-700 focus:ring-zinc-900',
      secondary: 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 focus:ring-zinc-500',
      ghost: 'text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500',
    }
    return (
      <button
        ref={ref}
        aria-busy={loading}
        className={`${base} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span aria-hidden className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
