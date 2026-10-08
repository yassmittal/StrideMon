import type { ColorFamily, ColorFamilyKey } from './types'

/**
 * Fourteen families of five shades, light to dark. Each ramp shifts its hue a little as it
 * darkens, which keeps a one-family Sneaker rich instead of flat. The darkest shade stays well
 * clear of the ink, so panel lines still show on it.
 */
export const COLOR_FAMILIES: readonly ColorFamily[] = [
  {
    key: 'ember',
    label: 'Ember',
    rarity: 'common',
    shades: ['#FFE6CF', '#FFB27A', '#FF6F2E', '#C9431A', '#6E2310'],
    sheenColor: null,
  },
  {
    key: 'cherry',
    label: 'Cherry',
    rarity: 'common',
    shades: ['#FFDADF', '#FF8A96', '#E8283F', '#A3122A', '#5A0A1A'],
    sheenColor: null,
  },
  {
    key: 'rose',
    label: 'Rose',
    rarity: 'common',
    shades: ['#FFE0F0', '#FFA3D1', '#F2559F', '#B52A72', '#61163F'],
    sheenColor: null,
  },
  {
    key: 'plum',
    label: 'Plum',
    rarity: 'common',
    shades: ['#EDE0FF', '#C3A1FF', '#8C55F0', '#5C2DB0', '#2F175F'],
    sheenColor: null,
  },
  {
    key: 'cobalt',
    label: 'Cobalt',
    rarity: 'common',
    shades: ['#DFE4FF', '#9AA8FF', '#3A50FF', '#1E2DB8', '#111A63'],
    sheenColor: null,
  },
  {
    key: 'ocean',
    label: 'Ocean',
    rarity: 'common',
    shades: ['#D9F0FF', '#8FD0FF', '#2E9BEA', '#1A62A8', '#0F3260'],
    sheenColor: null,
  },
  {
    key: 'lagoon',
    label: 'Lagoon',
    rarity: 'common',
    shades: ['#D5FAF4', '#7FE6D6', '#19B5A5', '#0E7A72', '#08403F'],
    sheenColor: null,
  },
  {
    key: 'jade',
    label: 'Jade',
    rarity: 'common',
    shades: ['#DDF7E3', '#8EE0A6', '#2FB863', '#1A7A42', '#0D4124'],
    sheenColor: null,
  },
  {
    key: 'moss',
    label: 'Moss',
    rarity: 'common',
    shades: ['#EEF0D8', '#C9CF94', '#8E9A4A', '#5C6630', '#333A1A'],
    sheenColor: null,
  },
  {
    key: 'lime',
    label: 'Lime',
    rarity: 'common',
    shades: ['#F1FFC4', '#C1FF00', '#8FCC00', '#557A00', '#2E4206'],
    sheenColor: null,
  },
  {
    key: 'clay',
    label: 'Clay',
    rarity: 'common',
    shades: ['#F5E8D8', '#DDBB94', '#B3824F', '#7A5130', '#45291A'],
    sheenColor: null,
  },
  {
    key: 'gold',
    label: 'Gold',
    rarity: 'rare',
    shades: ['#FFE98A', '#FFC928', '#DE9E00', '#A26A00', '#5C3C00'],
    sheenColor: '#FFFBE6',
  },
  {
    key: 'chrome',
    label: 'Chrome',
    rarity: 'rare',
    shades: ['#E9EEF5', '#B9C5D6', '#8391A8', '#4E596D', '#262B36'],
    sheenColor: '#FFFFFF',
  },
  {
    key: 'prism',
    label: 'Prism',
    rarity: 'legendary',
    // Five hues instead of five shades, still light to dark, so the colourways keep their shape.
    shades: ['#FFE45C', '#5CF0C0', '#FF6AB8', '#7C4DFF', '#24196E'],
    sheenColor: null,
  },
]

export function readColorFamily(colorFamilyKey: ColorFamilyKey): ColorFamily {
  const colorFamily = COLOR_FAMILIES.find((family) => family.key === colorFamilyKey)
  if (colorFamily === undefined) throw new Error(`Unknown colour family: ${colorFamilyKey}`)
  return colorFamily
}
