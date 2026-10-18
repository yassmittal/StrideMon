type ShareSheetIconProps = {
  className?: string
}

/** An arrow out of a tray: the phone's own share sheet. Decorative: the button carries the name. */
export function ShareSheetIcon({ className = '' }: ShareSheetIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={`size-[18px] shrink-0 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  )
}
