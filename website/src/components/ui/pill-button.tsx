import { ArrowIcon } from './arrow-icon'

type PillVariant = 'primary' | 'secondary' | 'callToAction'
type PillSize = 'regular' | 'compact'

type PillButtonProps = {
  href: string
  label: string
  variant?: PillVariant
  size?: PillSize
  isExternal?: boolean
  className?: string
}

// Pressed pills step one shade (D-031); there is no blue flood.
const variantClasses: Record<PillVariant, string> = {
  primary: 'bg-primary text-on-dark active:bg-ink',
  secondary: 'bg-surface-muted text-ink active:bg-surface',
  callToAction: 'bg-surface text-ink shadow-floating-pill active:bg-surface-muted',
}

const sizeClasses: Record<PillSize, string> = {
  regular: 'h-[45px] pr-4 pl-[23px] text-sm',
  compact: 'h-10 pr-3.5 pl-5 text-xs',
}

// A pill with an arrow (D-029). On hover the label rolls and the arrow nudges right.
export function PillButton({
  href,
  label,
  variant = 'primary',
  size = 'regular',
  isExternal = false,
  className = '',
}: PillButtonProps) {
  const externalProps = isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a
      href={href}
      className={`pill inline-flex items-center gap-2.5 rounded-full leading-[1.15] font-medium uppercase transition-colors duration-300 ease-standard ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...externalProps}
    >
      <span className="pill-label-window">
        <span className="pill-label">{label}</span>
        <span aria-hidden="true" className="pill-label-clone">
          {label}
        </span>
      </span>
      <ArrowIcon className="pill-arrow" />
    </a>
  )
}
