import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

/** The carbon plate through the midsole: the Racer's signature, in one colour or another. */
const PLATE_POINTS =
  '110 450, 300 456, 600 464, 800 456, 900 438, 940 426, 936 440, 900 452, 800 470, 600 478, 300 470, 110 464'

export const RACER: SneakerTemplate = {
  key: 'racer',
  label: 'Racer',
  description: 'A race-day shoe: a tall rocker sole with a plate, a bevelled heel, a pointed toe.',
  silhouette: parseShape(
    '220 520, 150 512, 96 494, 62 466, 54 440, 60 414, 70 404, 78 350, 88 302, 100 268, ' +
      '128 254, 170 258, 212 272, 250 278, 288 266, 314 246, 328 222, 350 206, 380 206, ' +
      '394 220, 398 236, 650 320, 740 340, 830 360, 900 384, 940 410, 952 432, 944 450, ' +
      '930 466, 880 488, 800 506, 700 516, 620 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '312 150, 432 150, 432 250, 340 300, 312 290'),
  ],
  framingPanels: [
    buildPanel('heel', '0 200, 140 256, 180 330, 176 420, 0 420'),
    buildPanel('eyestay', '392 176, 712 282, 636 362, 384 278'),
    buildPanel('toe', '690 292, 1000 292, 1000 450, 640 450, 660 364'),
    buildPanel(
      'collar',
      '40 170, 360 170, 352 238, 322 262, 292 290, 252 300, 212 294, 168 280, 126 276, 96 296, 40 296',
    ),
  ],
  solePanels: [
    buildPanel('midsole', '0 410, 300 420, 620 432, 820 424, 930 408, 1000 396, 1000 600, 0 600'),
    buildPanel(
      'outsole',
      '0 494, 620 494, 720 490, 820 478, 900 456, 960 434, 1000 424, 1000 600, 0 600',
    ),
  ],
  sheenShapes: [
    parseShape('786 360, 818 368, 784 414, 760 414'),
    parseShape('94 300, 110 296, 102 380, 86 382'),
  ],
  laceLine: { points: parseShape('398 236, 650 320'), eyeletCount: 5 },
  heelTab: { anchor: [102, 268], tiltDegrees: -16 },
  optionSlots: [
    {
      key: 'upper',
      label: 'Upper',
      values: [
        buildOptionValue({
          key: 'streaks',
          label: 'Streaks',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '176 290, 560 356, 176 366', '176 380, 650 410, 176 424')],
        }),
        buildOptionValue({
          key: 'block',
          label: 'Block',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '180 410, 180 300, 300 300, 520 420')],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'shard',
          label: 'Shard',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '176 300, 430 300, 176 420')],
        }),
      ],
    },
    {
      key: 'midsole',
      label: 'Midsole',
      values: [
        buildOptionValue({
          key: 'carbon',
          label: 'Carbon',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('ink', PLATE_POINTS)],
        }),
        buildOptionValue({
          key: 'tinted',
          label: 'Tinted',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('soleAccent', PLATE_POINTS)],
        }),
        buildOptionValue({
          key: 'twotone',
          label: 'Two-tone',
          rarity: 'rare',
          layer: 'sole',
          panels: [
            buildPanel(
              'soleAccent',
              '0 410, 300 420, 620 432, 820 424, 930 408, 1000 396, 1000 428, 930 440, 820 452, 620 460, 300 448, 0 440',
            ),
          ],
        }),
      ],
    },
    {
      key: 'heel',
      label: 'Heel',
      values: [
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'kick',
          label: 'Kick',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '0 410, 180 416, 150 500, 0 500')],
        }),
        buildOptionValue({
          key: 'fin',
          label: 'Fin',
          rarity: 'uncommon',
          layer: 'top',
          panels: [buildPanel('trim', '60 300, 168 404, 40 404')],
        }),
      ],
    },
  ],
}
