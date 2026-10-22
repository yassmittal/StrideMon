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
  test('never picks a taken design or the one on the stand', () => {
    const takenDesignNumbers = new Set(Array.from({ length: 40 }, (_, index) => 961 + index))
    for (let step = 0; step < 200; step += 1) {
      const picked = pickSurpriseDesignNumber({
        takenDesignNumbers,
        standDesignNumber: 868,
        random: () => step / 200,
      })
      expect(takenDesignNumbers.has(picked)).toBe(false)
      expect(picked).not.toBe(868)
      expect(picked).toBeGreaterThanOrEqual(1)
      expect(picked).toBeLessThanOrEqual(960)
    }
  })

  test('still picks one when every design is taken', () => {
    const everyDesign = new Set(Array.from({ length: 1000 }, (_, index) => index + 1))
    const picked = pickSurpriseDesignNumber({
      takenDesignNumbers: everyDesign,
      standDesignNumber: 1000,
    })
    expect(picked).toBe(1)
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
