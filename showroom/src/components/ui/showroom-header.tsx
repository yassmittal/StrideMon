import { foundingPassUrl, headerCopy, helpUrl, waitlistUrl } from '@/content/showroom'
import { PillLink } from './pill'

// The header, always on screen: where you are (the wordmark), Help, and the two ways out to
// stridemon.xyz (brief §4, Leave). A Founding Pass offer always says it's free and can't be sent
// or sold.

export function ShowroomHeader() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex bg-linear-to-b from-black/50 via-black/20 to-transparent pb-8 items-start justify-between gap-3 px-4 pt-[max(16px,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
      <div className="pointer-events-auto flex flex-col gap-1.5">
        <p className="flex items-baseline gap-2 leading-none">
          <span className="text-[17px] text-on-dark">{headerCopy.wordmark}</span>
          <span className="font-mono text-label text-on-dark-secondary uppercase">
            {headerCopy.place}
          </span>
        </p>
        <a
          href={helpUrl}
          className="w-fit py-1 font-mono text-label text-on-dark-secondary uppercase underline decoration-hairline-on-dark underline-offset-4 transition-colors duration-300 ease-standard hover:text-on-dark"
        >
          {headerCopy.help}
        </a>
      </div>
      <nav
        aria-label="StrideMon"
        className="pointer-events-auto flex flex-col items-end gap-2 md:flex-row md:items-start md:gap-3"
      >
        <div className="flex flex-col items-end gap-1">
          <PillLink href={foundingPassUrl} label={headerCopy.foundingPass} />
          <p className="pr-1 font-mono text-[10px] text-on-dark-secondary uppercase leading-tight sm:text-label">
            {headerCopy.foundingPassNote}
          </p>
        </div>
        <PillLink href={waitlistUrl} label={headerCopy.waitlist} />
      </nav>
    </header>
  )
}
