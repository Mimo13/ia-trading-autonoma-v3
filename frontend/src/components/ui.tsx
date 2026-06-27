import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface CardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function Card({ title, subtitle, children, className = '', headerAction }: CardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, change, icon, trend = 'neutral' }: StatCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400'
  }

  const trendBgColors = {
    up: 'bg-green-400/10',
    down: 'bg-red-400/10',
    neutral: 'bg-slate-400/10'
  }

  return (
    <Card className="hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-2 ${trendColors[trend]}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </p>
          )}
        </div>
        <div className={`${trendBgColors[trend]} ${trendColors[trend]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

interface TableProps {
  headers: string[]
  children: ReactNode
  emptyMessage?: string
  isLoading?: boolean
}

export function Table({ headers, children, emptyMessage = 'No data', isLoading = false }: TableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            {headers.map((header) => (
              <th key={header} className="text-left p-4 text-sm text-slate-400 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-slate-600 text-slate-200',
    success: 'bg-green-400/20 text-green-400',
    warning: 'bg-yellow-400/20 text-yellow-400',
    danger: 'bg-red-400/20 text-red-400',
    info: 'bg-blue-400/20 text-blue-400'
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  className = ''
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-slate-700 text-slate-300'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  )
}
