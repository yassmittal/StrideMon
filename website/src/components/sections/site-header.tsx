import { buildExplorerAddressUrl, sneakerNftContract } from '@/content/contracts'
import { heroContent } from '@/content/hero'
import { navigationLinks, siteName } from '@/content/site'
import { PillButton } from '../ui/pill-button'

export function SiteHeader() {
  return (
    <header className="page-gutter page-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1 pt-4 md:pt-6">
      <a href="#top" className="flex min-h-11 items-center text-xl tracking-[-0.01em]">
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
      <PillButton
        href={buildExplorerAddressUrl(sneakerNftContract.address)}
        label={heroContent.seeOnMonadLabel}
        variant="secondary"
        isExternal
        size="compact"
      />
    </header>
  )
}
