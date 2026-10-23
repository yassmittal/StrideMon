import { describe, expect, it } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { passDesigns, readPassDesign } from '@/lib/sneaker-design'

const showroomLacedArtDirectory = join(import.meta.dir, '..', '..', 'public', 'sneakers', 'laced')
const websiteLacedArtDirectory = join(
  import.meta.dir,
  '..',
  '..',
  '..',
  'website',
  'public',
  'pass-art',
  'laced',
)

function readSvgFileNames(directory: string): string[] {
  return readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.svg'))
    .sort()
}

describe('the exported Sneaker art', () => {
  it('has one laced SVG for each of the 1,000 designs in the table, and nothing else', () => {
    const expectedFileNames = passDesigns.map(
      (design) => `${String(design.designNumber).padStart(4, '0')}.svg`,
    )
    expect(passDesigns).toHaveLength(1000)
    expect(readSvgFileNames(showroomLacedArtDirectory)).toEqual(expectedFileNames)
  })

  it("is byte for byte the website's laced art", () => {
    for (const fileName of readSvgFileNames(websiteLacedArtDirectory)) {
      const showroomSvg = readFileSync(join(showroomLacedArtDirectory, fileName), 'utf8')
      const websiteSvg = readFileSync(join(websiteLacedArtDirectory, fileName), 'utf8')
      expect(showroomSvg).toBe(websiteSvg)
    }
  })

  it('draws every Sneaker in the 1000 × 600 space the store sizes it by', () => {
    for (const fileName of readSvgFileNames(showroomLacedArtDirectory)) {
      const svg = readFileSync(join(showroomLacedArtDirectory, fileName), 'utf8')
      expect(svg).toContain('viewBox="0 0 1000 600"')
    }
  })
})

describe('the design table', () => {
  it('names the designs the store shows as the website does', () => {
    expect(readPassDesign(137)?.name).toBe('Rose Hiker Night')
    expect(readPassDesign(868)?.name).toBe('Ember Court Night')
    expect(readPassDesign(20)).toEqual({
      designNumber: 20,
      name: 'Earthshine',
      rarity: 'legendary',
    })
    expect(readPassDesign(542)?.name).toBe('Nacreous')
  })
})
