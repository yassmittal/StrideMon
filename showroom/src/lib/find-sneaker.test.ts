import { describe, expect, test } from 'bun:test'
import {
  FIND_RESULT_LIMIT,
  findSneakerDesigns,
  pickSurpriseDesignNumber,
  readDeepLinkDesignNumber,
} from './find-sneaker'

// Find and the deep link (brief §10, D-066).

describe('findSneakerDesigns', () => {
  test('a number, with or without # and zeros, finds that design', () => {
    for (const query of ['137', '0137', '#0137', ' 137 ']) {
      expect(findSneakerDesigns(query).map((design) => design.name)).toEqual(['Rose Hiker Night'])
    }
    expect(findSneakerDesigns('0')).toEqual([])
    expect(findSneakerDesigns('1001')).toEqual([])
  })

  test('any part of a name finds it, every word, in any case', () => {
    const results = findSneakerDesigns('ember COURT')
    expect(results.length).toBeGreaterThan(0)
    expect(results.length).toBeLessThanOrEqual(FIND_RESULT_LIMIT)
    for (const design of results) expect(design.name).toMatch(/Ember Court/)
    expect(findSneakerDesigns('nacreous').map((design) => design.designNumber)).toEqual([542])
  })

  test('nothing for no match or an empty field', () => {
    expect(findSneakerDesigns('zzz')).toEqual([])
    expect(findSneakerDesigns('   ')).toEqual([])
  })
})

describe('pickSurpriseDesignNumber', () => {
  test('picks any design but the one on the stand', () => {
    const picked = new Set<number>()
    for (let step = 0; step < 1000; step += 1) {
      const designNumber = pickSurpriseDesignNumber({
        standDesignNumber: 868,
        random: () => step / 1000,
      })
      expect(designNumber).not.toBe(868)
      expect(designNumber).toBeGreaterThanOrEqual(1)
      expect(designNumber).toBeLessThanOrEqual(1000)
      picked.add(designNumber)
    }
    // Every other design can come up, the first and the last included.
    expect(picked.size).toBe(999)
  })
})

test('the deep link takes 137, 0137 or #0137, and nothing else', () => {
  expect(readDeepLinkDesignNumber('137')).toBe(137)
  expect(readDeepLinkDesignNumber('0137')).toBe(137)
  expect(readDeepLinkDesignNumber('#0137')).toBe(137)
  for (const bad of ['0', '1001', '2000', 'abc', '13.7', '-1', '']) {
    expect(readDeepLinkDesignNumber(bad)).toBeNull()
  }
})
