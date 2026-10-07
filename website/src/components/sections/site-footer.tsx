import {
  buildExplorerAddressUrl,
  deployedContracts,
  monadTestnetChainId,
} from '@/content/contracts'
import {
  footerContent,
  githubRepositoryUrl,
  legalPagePaths,
  siteName,
  xAccountHandle,
  xAccountUrl,
} from '@/content/site'
import { ArrowIcon } from '../ui/arrow-icon'
import { XLogoIcon } from '../ui/x-logo-icon'

const footerLinkClass =
  'group inline-flex min-h-11 items-center gap-2 text-label font-medium tracking-[0.08em] uppercase'

export function SiteFooter() {
  return (
    <footer className="bg-dark text-on-dark">
      <div className="page-gutter page-container flex flex-col gap-12 pt-16 pb-8 md:pt-24">
        <div className="grid gap-10 md:grid-cols-12 md:gap-6">
          <div className="flex flex-col gap-4 md:col-span-6">
            <p className="-ml-[0.05em] text-[clamp(3.5rem,13vw,9rem)] leading-[0.9] tracking-[-0.02em]">
              {siteName}
            </p>
            <p className="text-lg text-on-dark-secondary">{footerContent.builtOnLine}</p>
          </div>
          <nav
            aria-label="Footer"
            className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:col-span-6"
          >
            <ul>
              <li>
                <a
                  href={githubRepositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  {footerContent.githubLabel}
                  <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
                </a>
              </li>
              <li>
                <a
                  href={xAccountUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerLinkClass}
                >
                  <XLogoIcon />
                  {xAccountHandle}
                  <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
                </a>
              </li>
              <li>
                <a href={legalPagePaths.privacyPolicy} className={footerLinkClass}>
                  {footerContent.privacyPolicyLabel}
                  <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
                </a>
              </li>
              <li>
                <a href={legalPagePaths.deleteAccount} className={footerLinkClass}>
                  {footerContent.deleteAccountLabel}
                  <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
                </a>
              </li>
            </ul>
            <ul>
              {deployedContracts.map((contract) => (
                <li key={contract.address}>
                  <a
                    href={buildExplorerAddressUrl(contract.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footerLinkClass}
                  >
                    {contract.name}
                    <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-hairline-on-dark pt-6 text-label font-medium tracking-[0.08em] uppercase sm:flex-row sm:justify-between">
          <p className="text-lime">{footerContent.noValueLine}</p>
          <p className="text-on-dark-secondary">Monad testnet • Chain {monadTestnetChainId}</p>
        </div>
      </div>
    </footer>
  )
}
