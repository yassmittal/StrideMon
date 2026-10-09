import {
  buildExplorerAddressUrl,
  explorerName,
  listedContracts,
  onChainContent,
  shortenAddress,
} from '@/content/contracts'
import { fairPlayColumns, fairPlayContent } from '@/content/fair-play'
import { gameRules, rulesContent, starterSneakerStats } from '@/content/game-rules'
import { screenshots } from '@/content/screenshots'
import { underTheHoodContent, underTheHoodTabs } from '@/content/under-the-hood'
import { whyMonadContent, whyMonadPoints } from '@/content/why-monad'
import { ArrowIcon } from '../ui/arrow-icon'
import { CopyAddressButton } from '../ui/copy-address-button'
import { CountUp } from '../ui/count-up'
import { CrossMarks } from '../ui/cross-marks'
import { type HashTab, HashTabs } from '../ui/hash-tabs'
import { PhoneFrame } from '../ui/phone-frame'
import { SectionHeading } from '../ui/section-heading'

const headingId = `${underTheHoodContent.id}-heading`

const panelHeadingClass = 'text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] tracking-[-0.01em]'

/**
 * Under the hood (D-050): the rules, fair play and privacy, the contracts and why Monad, once
 * four sections, now four tabs on one dark band after the waitlist.
 */
export function UnderTheHoodSection() {
  const panelsById: Record<(typeof underTheHoodTabs)[number]['id'], HashTab['panel']> = {
    rules: <RulesPanel />,
    'fair-play': <FairPlayPanel />,
    'on-chain': <ContractsPanel />,
    'why-monad': <WhyMonadPanel />,
  }
  const tabs: HashTab[] = underTheHoodTabs.map((tab) => ({ ...tab, panel: panelsById[tab.id] }))

  return (
    <section
      id={underTheHoodContent.id}
      aria-labelledby={headingId}
      className="relative bg-dark text-on-dark"
    >
      <CrossMarks tone="dark" />
      <div className="page-gutter page-container flex flex-col gap-10 py-16 md:gap-12 md:py-24">
        <div className="flex flex-col gap-6">
          <SectionHeading
            id={headingId}
            metaLabels={underTheHoodContent.metaLabels}
            heading={underTheHoodContent.heading}
            tone="dark"
          />
          <p data-reveal className="max-w-[30em] text-lg leading-[1.4] text-on-dark-secondary">
            {underTheHoodContent.intro}
          </p>
        </div>
        <HashTabs label={underTheHoodContent.tabListLabel} tabs={tabs} />
      </div>
    </section>
  )
}

function RulesPanel() {
  return (
    <div className="flex flex-col gap-8">
      <h3 className={panelHeadingClass}>{rulesContent.heading}</h3>
      <dl className="grid border-t border-hairline-on-dark md:grid-cols-2 lg:grid-cols-3">
        {gameRules.map((rule) => (
          <div
            key={rule.label}
            className="flex flex-col gap-3 border-b border-hairline-on-dark py-7 md:pr-8"
          >
            <dt className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
              {rule.label}
            </dt>
            <dd className="flex flex-col gap-3">
              <span className="flex items-baseline gap-3 font-mono">
                <span className="text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.9] tracking-[-0.02em]">
                  <CountUp value={rule.value} fractionDigits={rule.fractionDigits} />
                </span>
                <span className="text-sm text-on-dark-secondary">{rule.unit}</span>
              </span>
              <span className="max-w-[19em] leading-[1.4]">{rule.explanation}</span>
            </dd>
          </div>
        ))}
        <div className="flex flex-col gap-4 border-b border-hairline-on-dark py-7 md:pr-8">
          <dt className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
            {rulesContent.starterSneakerLabel}
          </dt>
          <dd className="grid grid-cols-2 gap-2.5">
            {starterSneakerStats.map((stat) => (
              <span
                key={stat.label}
                className="flex flex-col gap-1 rounded-panel bg-dark-panel p-4"
              >
                <span className="font-mono text-3xl leading-none text-lime">{stat.value}</span>
                <span className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
                  {stat.label}
                </span>
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="size-2 rounded-full bg-lime" />
        <p className="text-label font-medium tracking-[0.08em] uppercase">
          {rulesContent.footnote}
        </p>
      </div>
    </div>
  )
}

function FairPlayPanel() {
  return (
    <div className="flex flex-col gap-8">
      <h3 className={`max-w-[18em] ${panelHeadingClass}`}>{fairPlayContent.heading}</h3>
      <div className="grid gap-2.5 md:grid-cols-2">
        {fairPlayColumns.map((column) => (
          <article
            key={column.label}
            className="flex flex-col gap-5 rounded-panel bg-dark-panel p-6 md:p-[30px]"
          >
            <p className="text-label font-medium tracking-[0.08em] text-on-dark-secondary uppercase">
              {column.label}
            </p>
            <h4 className="text-[clamp(1.375rem,2.4vw,2rem)] leading-[1.1] tracking-[-0.01em]">
              {column.heading}
            </h4>
            <ul className="flex flex-col">
              {column.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-4 border-t border-hairline-on-dark py-4 text-base leading-[1.4]"
                >
                  <span
                    aria-hidden="true"
                    className="pt-[0.2em] font-mono text-sm text-on-dark-secondary"
                  >
                    +
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}

function ContractsPanel() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className={`max-w-[18em] ${panelHeadingClass}`}>{onChainContent.heading}</h3>
        <p className="text-lg leading-[1.4] text-on-dark-secondary">{onChainContent.intro}</p>
      </div>
      <ul className="border-t border-hairline-on-dark">
        {listedContracts.map((contract) => (
          <li
            key={contract.address}
            className="grid gap-2 border-b border-hairline-on-dark py-5 md:grid-cols-12 md:items-center md:gap-6"
          >
            <div className="flex flex-col gap-1 md:col-span-4">
              <span className="font-mono text-lg">{contract.name}</span>
              <span className="text-sm text-on-dark-secondary">
                {contract.standard} • {contract.role}
              </span>
            </div>
            <div className="md:col-span-6">
              <CopyAddressButton
                address={contract.address}
                shortAddress={shortenAddress(contract.address)}
                contractName={contract.name}
                tone="dark"
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
      <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-6">
        <div className="flex flex-col gap-4 md:col-span-6">
          <h4 className="text-[clamp(1.375rem,2.4vw,2rem)] leading-[1.1] tracking-[-0.01em]">
            {onChainContent.artHeading}
          </h4>
          <p className="max-w-[25em] text-lg leading-[1.4] text-on-dark-secondary">
            {onChainContent.artText}
          </p>
        </div>
        <div className="flex justify-center md:col-span-5 md:col-start-8 md:justify-end">
          <PhoneFrame
            screenshot={screenshots.explorerNft}
            sizes="(min-width: 768px) 220px, 48vw"
            className="w-[48%] max-w-[220px] ring-1 ring-hairline-on-dark"
          />
        </div>
      </div>
    </div>
  )
}

function WhyMonadPanel() {
  return (
    <div className="flex flex-col gap-8">
      <h3 className={panelHeadingClass}>{whyMonadContent.heading}</h3>
      <ol className="grid gap-2.5 md:grid-cols-3">
        {whyMonadPoints.map((point, pointIndex) => (
          <li
            key={point.title}
            className="flex flex-col gap-10 rounded-panel bg-dark-panel p-6 md:p-[30px]"
          >
            <span className="font-mono text-sm text-lime">
              {String(pointIndex + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-3">
              <h4 className="text-[1.625rem] leading-[1.1]">{point.title}</h4>
              <p className="leading-[1.4] text-on-dark-secondary">{point.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
