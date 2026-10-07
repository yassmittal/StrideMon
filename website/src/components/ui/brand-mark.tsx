type BrandMarkProps = {
  className?: string
}

/**
 * The StrideMon mark: a line Sneaker with a lime stripe on the dark tile. The same drawing as
 * `app/icon.svg` and the app icon (apps/mobile/scripts/build-app-icons.sh).
 */
export function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <svg aria-hidden="true" className={`shrink-0 ${className}`} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="14" className="fill-dark-panel" />
      <g strokeWidth="3" strokeLinejoin="round" className="stroke-on-dark">
        <path d="M13 43h30c5 0 9-1 10-3 1-1 0-2-1-2L26 37c-5 0-9-1-12-1-1 3-1 6-1 7Z" />
        <path
          d="M14 36c-2-5-2-10-1-15 4 2 8 3 11 3l3-6 15 10c7 2 10 6 11 10"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M15 32c8 1 16-2 22-6"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="stroke-lime"
      />
    </svg>
  )
}
