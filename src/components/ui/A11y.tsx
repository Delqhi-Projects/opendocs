import { type ReactNode } from 'react'

interface A11yProps {
  children: ReactNode
  role?: string
  ariaLabel?: string
  ariaDescribedBy?: string
  ariaExpanded?: boolean
  ariaPressed?: boolean
  ariaSelected?: boolean
  ariaChecked?: boolean
  ariaDisabled?: boolean
  tabIndex?: number
}

export function A11y({ children, ...props }: A11yProps) {
  const ariaProps = Object.entries(props).reduce((acc, [key, value]) => {
    if (key.startsWith('aria')) {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, unknown>)

  return <span {...ariaProps}>{children}</span>
}

export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>
}

export function FocusTrap({ children }: { children: ReactNode }) {
  return (
    <div tabIndex={-1} role="presentation">
      {children}
    </div>
  )
}

export function SkipLink({ href = '#main', children = 'Zum Hauptinhalt springen' }: { href?: string; children?: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
    >
      {children}
    </a>
  )
}

export function Announcer({ message, politeness = 'polite' }: { message: string; politeness?: 'polite' | 'assertive' }) {
  return (
    <div
      role="status"
      aria-live={polite}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}
