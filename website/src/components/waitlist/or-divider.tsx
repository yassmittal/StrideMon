import { waitlistContent } from '@/content/waitlist'

/** "or", between Continue with Google and the email box (D-059). */
export function OrDivider() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 text-label font-medium tracking-[0.08em] text-ink-secondary-small uppercase"
    >
      <span className="h-px flex-1 bg-hairline" />
      {waitlistContent.orLabel}
      <span className="h-px flex-1 bg-hairline" />
    </div>
  )
}
