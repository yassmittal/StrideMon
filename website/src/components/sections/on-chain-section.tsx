import {
  buildExplorerAddressUrl,
  deployedContracts,
  explorerName,
  onChainContent,
  shortenAddress,
} from '@/content/contracts'
import { screenshots } from '@/content/screenshots'
import { sectionIds } from '@/content/site'
import { hasPublicFile } from '@/lib/read-public-file'
import { sneakerArtPath, sneakerArtSizePixels } from '@/lib/read-sneaker-art'
import { ArrowIcon } from '../ui/arrow-icon'
import { CopyAddressButton } from '../ui/copy-address-button'
import { CrossMarks } from '../ui/cross-marks'
import { PhoneFrame } from '../ui/phone-frame'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${sectionIds.onChain}-heading`

export function OnChainSection() {
  const hasExplorerScreenshot = hasPublicFile(`/screenshots/${screenshots.explorerNft.fileName}`)
  return (
    <section
      id={sectionIds.onChain}
      aria-labelledby={headingId}
      className="relative page-gutter page-container py-16 md:py-24"
    >
      <CrossMarks />
      <SectionHeading
        id={headingId}
        metaLabels={['On-chain', 'Monad testnet']}
        heading={onChainContent.heading}
      />
      <p data-reveal className="mt-6 text-lg leading-[1.4] text-ink-secondary-small">
        {onChainContent.intro}
      </p>

      <ul className="mt-10 border-t border-hairline md:mt-14">
        {deployedContracts.map((contract) => (
          <li
            key={contract.address}
            data-reveal
            className="grid gap-2 border-b border-hairline py-5 md:grid-cols-12 md:items-center md:gap-6"
          >
            <div className="flex flex-col gap-1 md:col-span-4">
              <span className="font-mono text-lg">{contract.name}</span>
              <span className="text-sm text-ink-secondary-small">
                {contract.standard} • {contract.role}
              </span>
            </div>
            <div className="md:col-span-6">
              <CopyAddressButton
                address={contract.address}
                shortAddress={shortenAddress(contract.address)}
                contractName={contract.name}
              />
            </div>
            <a
              href={buildExplorerAddressUrl(contract.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-2 text-label font-medium tracking-[0.08em] uppercase md:col-span-2 md:justify-end"
            >
              {explorerName}
              <span className="sr-only"> page for {contract.name}</span>
              <ArrowIcon className="transition-transform duration-300 ease-standard group-hover:translate-x-[3px]" />
            </a>
          </li>
        ))}
      </ul>

      <div
        data-reveal
        className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:items-center md:gap-6"
      >
        <div className="flex flex-col gap-4 md:col-span-6">
          <h3 className="text-[clamp(1.625rem,3vw,2.5rem)] leading-[1.05] tracking-[-0.01em]">
            {onChainContent.artHeading}
          </h3>
          <p className="max-w-[25em] text-lg leading-[1.4]">{onChainContent.artText}</p>
        </div>
        <div className="flex justify-center md:col-span-5 md:col-start-8 md:justify-end">
          {hasExplorerScreenshot ? (
            <PhoneFrame
              screenshot={screenshots.explorerNft}
              sizes="(min-width: 768px) 277px, 62vw"
              className="w-[66%] max-w-[277px]"
            />
          ) : (
            // biome-ignore lint/performance/noImgElement: a vector file; next/image adds nothing in a static export.
            <img
              src={sneakerArtPath}
              alt={onChainContent.artAlt}
              width={sneakerArtSizePixels}
              height={sneakerArtSizePixels}
              loading="lazy"
              decoding="async"
              className="h-auto w-full max-w-[360px] rounded-panel"
            />
          )}
        </div>
      </div>
    </section>
  )
}
