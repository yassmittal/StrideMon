'use client'

import { mintStepContent } from '@/content/founding-pass-mint'
import { formatPassNumber } from '@/lib/founding-pass/pass-design'
import { openPassMint } from '@/lib/founding-pass/pass-mint-flow'
import { buildPillClassName, PillContent } from '../ui/pill-button'

/** "Mint #0137": for someone who got ready, this one tap mints it (brief §5.3). */
export function MintPassButton({ designNumber }: { designNumber: number }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => openPassMint(designNumber, { startNow: true })}
        className={buildPillClassName('primary', 'regular')}
      >
        <PillContent
          label={`${mintStepContent.mintLabelPrefix} ${formatPassNumber(designNumber)}`}
        />
      </button>
      <p className="text-sm leading-[1.4] text-ink-secondary-small">{mintStepContent.freeLine}</p>
    </div>
  )
}
