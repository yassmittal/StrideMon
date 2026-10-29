import { ArrowIcon } from './arrow-icon'

type ShowroomButtonProps = {
  href: string
  label: string
  className?: string
}

/**
 * The way into the 3D store (D-073), the one button that isn't a flat pill: a lime key on its own
 * dark edge, so it reads on light and dark pages. It rises on hover and presses down when pressed.
 */
export function ShowroomButton({ href, label, className = '' }: ShowroomButtonProps) {
  return (
    <a href={href} className={`showroom-button ${className}`}>
      <span aria-hidden="true" className="showroom-button-shadow" />
      <span aria-hidden="true" className="showroom-button-edge" />
      <span className="showroom-button-face">
        <CubeIcon />
        {label}
        <ArrowIcon className="showroom-button-arrow" />
      </span>
    </a>
  )
}

function CubeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="showroom-button-cube size-[18px] shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    >
      <path d="M10 1.75 17.25 5.9v8.2L10 18.25 2.75 14.1V5.9L10 1.75Z" />
      <path d="M2.75 5.9 10 10.05l7.25-4.15M10 10.05v8.2" />
    </svg>
  )
}
