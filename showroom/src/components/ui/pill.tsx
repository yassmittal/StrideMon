import { ArrowIcon } from './icons'

// The website's pill with an arrow (D-029): the label rolls and the arrow nudges on hover, a press
// steps one shade (D-031). On the night store the pills are mostly dark with white text; the
// light one is kept for the one thing to do next (brief §6.4).

export type PillVariant = 'dark' | 'light'
export type PillSize = 'regular' | 'compact'

const variantClasses: Record<PillVariant, string> = {
  dark: 'border border-hairline-on-dark bg-dark-panel/75 text-on-dark backdrop-blur-md hover:bg-dark-panel active:bg-black',
  light: 'bg-white text-black active:bg-surface-muted',
}

const sizeClasses: Record<PillSize, string> = {
  regular: 'h-[45px] pr-4 pl-[23px] text-sm',
  compact: 'h-9 pr-3 pl-4 text-[11px] sm:h-10 sm:pr-3.5 sm:pl-5 sm:text-xs',
}

function buildPillClassName(variant: PillVariant, size: PillSize): string {
  return `pill inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full font-medium uppercase leading-[1.15] transition-colors duration-300 ease-standard ${variantClasses[variant]} ${sizeClasses[size]}`
}

function PillContent({ label }: { label: string }) {
  return (
    <>
      <span className="pill-label-window">
        <span className="pill-label">{label}</span>
        <span aria-hidden="true" className="pill-label-clone">
          {label}
        </span>
      </span>
      <ArrowIcon className="pill-arrow" />
    </>
  )
}

export function PillLink({
  href,
  label,
  variant = 'dark',
  size = 'compact',
}: {
  href: string
  label: string
  variant?: PillVariant
  size?: PillSize
}) {
  return (
    <a href={href} className={buildPillClassName(variant, size)}>
      <PillContent label={label} />
    </a>
  )
}

export function PillButton({
  label,
  onPress,
  variant = 'dark',
  size = 'regular',
}: {
  label: string
  onPress: () => void
  variant?: PillVariant
  size?: PillSize
}) {
  return (
    <button type="button" onClick={onPress} className={buildPillClassName(variant, size)}>
      <PillContent label={label} />
    </button>
  )
}
