import { describe, expect, it } from 'bun:test'
import {
  FOUNDING_PASS_DESIGNS,
  type FoundingPassDesign,
} from '@stridemon/chain/founding-pass-designs'
import { findSimilarAvailableDesignNumbers, toMintedDesignNumbers } from './minted-designs'

describe('toMintedDesignNumbers', () => {
  it('reads bit n as design n across the four words', () => {
    const mintedBitmapWords = [(1n << 1n) | (1n << 137n), 1n << 0n, 0n, 1n << (1000n - 768n)]

    expect(toMintedDesignNumbers(mintedBitmapWords)).toEqual([1, 137, 256, 1000])
  })

  it('is empty before anyone mints', () => {
    expect(toMintedDesignNumbers([0n, 0n, 0n, 0n])).toEqual([])
  })
})

describe('findSimilarAvailableDesignNumbers', () => {
  const designs: FoundingPassDesign[] = [
    buildDesign(1, { templateKey: 'runner', colorFamilyKey: 'ember' }),
    buildDesign(2, { templateKey: 'runner', colorFamilyKey: 'ember' }),
    buildDesign(3, { templateKey: 'court', colorFamilyKey: 'ember' }),
    buildDesign(4, { templateKey: 'runner', colorFamilyKey: 'ocean' }),
    buildDesign(5, { templateKey: 'runner', colorFamilyKey: 'ember' }),
  ]

  it('puts the same template and family first, then the nearest number, skipping taken ones', () => {
    expect(
      findSimilarAvailableDesignNumbers({
        designNumber: 1,
        designs,
        takenDesignNumbers: new Set([2]),
        count: 3,
      }),
    ).toEqual([5, 4, 3])
  })

  it('finds three free designs for every one of the 1,000', () => {
    for (const design of FOUNDING_PASS_DESIGNS) {
      expect(
        findSimilarAvailableDesignNumbers({
          designNumber: design.designNumber,
          designs: FOUNDING_PASS_DESIGNS,
          takenDesignNumbers: new Set(),
          count: 3,
        }),
      ).toHaveLength(3)
    }
  })
})

function buildDesign(
  designNumber: number,
  layers: Pick<FoundingPassDesign, 'templateKey' | 'colorFamilyKey'>,
): FoundingPassDesign {
  return {
    designNumber,
    name: `Design ${designNumber}`,
    rarity: 'common',
    colorwayKey: 'dusk',
    optionValueKeys: { side: 'plain' },
    laceColorKey: 'ink',
    ...layers,
  }
}
