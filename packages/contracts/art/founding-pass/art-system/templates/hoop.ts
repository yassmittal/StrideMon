import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const HOOP: SneakerTemplate = {
  key: 'hoop',
  label: 'Hoop',
  legendaryName: 'Glory',
  description: 'A basketball high-top: a padded ankle collar, a long lace run, a thick cupsole.',
  silhouette: parseShape(
    '90 520, 70 508, 62 484, 64 446, 58 400, 56 340, 60 270, 66 200, 76 140, 92 112, ' +
      '130 100, 180 102, 222 112, 246 128, 262 108, 280 90, 312 80, 340 84, 352 100, ' +
      '354 118, 650 320, 720 346, 800 364, 864 380, 906 400, 932 428, 940 458, 936 482, ' +
      '920 500, 888 512, 830 518, 760 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '230 30, 400 30, 400 150, 300 220, 230 200'),
  ],
  framingPanels: [
    buildPanel('heel', '0 300, 140 316, 196 360, 206 450, 0 450'),
    buildPanel('eyestay', '350 60, 700 290, 624 358, 328 156'),
    buildPanel('toe', '690 316, 1000 316, 1000 460, 670 460, 676 390'),
    buildPanel('collar', '30 20, 290 20, 262 120, 240 150, 190 140, 130 142, 84 160, 30 166'),
  ],
  solePanels: [
    buildPanel('midsole', '0 428, 1000 448, 1000 600, 0 600'),
    buildPanel('outsole', '0 496, 760 498, 900 490, 1000 470, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('780 366, 812 372, 772 440, 742 440'),
    parseShape('84 200, 102 196, 96 300, 78 302'),
  ],
  laceLine: { points: parseShape('354 118, 650 320'), eyeletCount: 7 },
  heelTab: { anchor: [90, 118], tiltDegrees: -10 },
  optionSlots: [
    {
      key: 'side',
      label: 'Side',
      values: [
        buildOptionValue({
          key: 'bolt',
          label: 'Bolt',
          rarity: 'common',
          layer: 'quarter',
          panels: [
            buildPanel('overlay', '300 220, 420 220, 370 300, 450 300, 290 446, 336 340, 250 340'),
          ],
        }),
        buildOptionValue({
          key: 'panel',
          label: 'Panel',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '0 180, 300 150, 440 450, 0 450')],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'wedge',
          label: 'Wedge',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '206 330, 620 444, 206 446')],
        }),
      ],
    },
    {
      key: 'ankle',
      label: 'Ankle',
      values: [
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'pad',
          label: 'Pad',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '112 182, 206 178, 236 224, 206 268, 112 272, 86 226')],
        }),
        buildOptionValue({
          key: 'strap',
          label: 'Strap',
          rarity: 'rare',
          layer: 'top',
          panels: [
            buildPanel('trim', '40 252, 322 196, 334 246, 40 304'),
            buildPanel('ink', '272 214, 304 208, 312 240, 280 246'),
          ],
        }),
      ],
    },
    {
      key: 'collar',
      label: 'Collar',
      values: [
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'tipped',
          label: 'Tipped',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '30 20, 290 20, 276 124, 220 128, 130 120, 30 130')],
        }),
        buildOptionValue({
          key: 'stripe',
          label: 'Stripe',
          rarity: 'uncommon',
          layer: 'top',
          panels: [buildPanel('trim', '30 124, 282 84, 288 110, 30 152')],
        }),
      ],
    },
  ],
}
