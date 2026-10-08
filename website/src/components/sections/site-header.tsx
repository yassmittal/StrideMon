import { headerContent, navigationLinks, sectionIds, siteName, xAccountUrl } from '@/content/site'
import { BrandMark } from '../ui/brand-mark'
import { buildPillClassName, PillButton } from '../ui/pill-button'
import { XLogoIcon } from '../ui/x-logo-icon'

type SiteHeaderProps = {
  /** The waitlist pill's target: the landing page's form, or the one on the current page. */
  waitlistHref?: string
}

export function SiteHeader({ waitlistHref = `/#${sectionIds.waitlist}` }: SiteHeaderProps) {
  return (
    <header className="page-gutter page-container flex flex-wrap items-center justify-between gap-x-2 gap-y-1 pt-4 sm:gap-x-6 md:pt-6">
      <a
        href="/"
        className="flex min-h-11 items-center gap-2 text-lg tracking-[-0.01em] sm:gap-2.5 sm:text-xl"
      >
        <BrandMark className="size-7 sm:size-8" />
        {siteName}
      </a>
      <nav aria-label="Sections" className="order-last w-full md:order-none md:w-auto">
        <ul className="-mx-2 flex flex-wrap md:gap-x-2">
          {navigationLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex min-h-11 items-center px-2 text-label font-medium tracking-[0.08em] uppercase transition-opacity duration-300 ease-standard hover:opacity-60"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Just the X logo on a phone, where the header has room for one pill. */}
        <a
          href={xAccountUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={headerContent.followAccessibleLabel}
          className={buildPillClassName(
            'secondary',
            'compact',
            'max-sm:w-10 max-sm:justify-center max-sm:px-0 sm:pl-4',
          )}
        >
          <XLogoIcon />
          <span aria-hidden="true" className="max-sm:hidden">
            {headerContent.followLabel}
          </span>
        </a>
        <PillButton href={waitlistHref} label={headerContent.waitlistLabel} size="compact" />
      </div>
    </header>
  )
}
