'use client'

import {
  fallbackCopy,
  foundingPassUrl,
  helpUrl,
  passCollectionUrl,
  storeButtonCopy,
  storeStills,
  waitlistUrl,
} from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { loadingStore } from '@/lib/loading-store'
import { PillButton, PillLink } from './pill'

// When the 3D store can't run (Part 4): a still of the lit store (rendered from the showroom
// itself), what happened in plain words, and the ways on that the store's lit buttons would have
// given (D-068): the collection, the Founding Pass, the waitlist and
// Help. A lost context or files that didn't come can try again: a reload, which keeps a deep link.

export function StoreFallback() {
  const phase = useSmallStore(loadingStore, (state) => state.phase)
  if (phase === 'loading' || phase === 'ready') return null
  const copy = fallbackCopy[phase]
  const canTryAgain = phase !== 'noWebgl'
  return (
    <div className="absolute inset-0">
      <picture>
        <source media="(orientation: portrait)" srcSet={storeStills.portrait} />
        <img
          src={storeStills.landscape}
          alt={fallbackCopy.stillAlt}
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start bg-linear-to-t from-black/70 via-black/35 to-transparent px-4 pt-24 pb-[max(20px,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
        <div
          role="alert"
          className="flex w-full max-w-[30rem] flex-col items-start gap-3 rounded-panel border border-hairline-on-dark bg-dark-panel/80 px-4 py-4 backdrop-blur-md"
        >
          <h1 className="text-[19px] text-on-dark leading-snug sm:text-xl">{copy.title}</h1>
          <p className="text-[15px] text-on-dark-secondary leading-snug">{copy.line}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <PillLink
              href={passCollectionUrl}
              label={fallbackCopy.browse}
              variant="light"
              size="regular"
            />
            {canTryAgain ? (
              <PillButton
                label={fallbackCopy.tryAgain}
                size="compact"
                onPress={() => window.location.reload()}
              />
            ) : null}
          </div>
          <p className="text-[14px] text-on-dark-secondary leading-snug">
            <a
              target="_blank"
              rel="noopener"
              href={foundingPassUrl}
              className="text-on-dark underline decoration-hairline-on-dark underline-offset-4"
            >
              {storeButtonCopy.foundingPass}
            </a>
            {' · '}
            <a
              target="_blank"
              rel="noopener"
              href={waitlistUrl}
              className="text-on-dark underline decoration-hairline-on-dark underline-offset-4"
            >
              {storeButtonCopy.waitlist}
            </a>
          </p>
          <a
            target="_blank"
            rel="noopener"
            href={helpUrl}
            className="py-1 font-mono text-label text-on-dark-secondary uppercase underline decoration-hairline-on-dark underline-offset-4 transition-colors duration-300 ease-standard hover:text-on-dark"
          >
            {fallbackCopy.help}
          </a>
        </div>
      </div>
    </div>
  )
}
