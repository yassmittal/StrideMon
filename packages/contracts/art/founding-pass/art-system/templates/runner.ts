import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const RUNNER: SneakerTemplate = {
  key: 'runner',
  label: 'Runner',
  legendaryName: 'Earthshine',
  description: 'The everyday trainer: a medium sole, a padded collar and a rounded toe.',
  silhouette: parseShape(
    '100 520, 76 510, 64 488, 62 460, 66 420, 58 380, 60 330, 70 282, 86 240, 110 224, ' +
      '150 226, 196 244, 238 258, 282 250, 312 226, 326 192, 350 168, 386 166, 404 184, ' +
      '410 202, 688 318, 760 338, 828 354, 880 372, 914 394, 934 422, 938 452, 930 476, ' +
      '910 496, 872 510, 806 518, 740 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '300 120, 450 120, 450 230, 330 290, 300 280'),
  ],
  framingPanels: [
    buildPanel('heel', '0 140, 156 226, 206 316, 214 440, 0 440'),
    buildPanel('eyestay', '400 140, 750 290, 670 362, 392 246'),
    buildPanel('toe', '716 280, 1000 280, 1000 470, 680 470, 688 372'),
    buildPanel(
      'collar',
      '30 120, 346 120, 342 214, 322 258, 288 286, 238 296, 190 282, 112 262, 74 280, 30 280',
    ),
  ],
  solePanels: [
    buildPanel('midsole', '0 412, 260 424, 1000 446, 1000 600, 0 600'),
    buildPanel('outsole', '0 486, 680 488, 840 482, 920 470, 1000 448, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('800 362, 834 370, 782 452, 750 452'),
    parseShape('86 292, 104 290, 90 400, 72 402'),
  ],
  laceLine: { points: parseShape('410 202, 688 318'), eyeletCount: 6 },
  heelTab: { anchor: [88, 244], tiltDegrees: -20 },
  optionSlots: [
    {
      key: 'side',
      label: 'Side',
      values: [
        buildOptionValue({
          key: 'wedge',
          label: 'Wedge',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '214 300, 600 410, 214 430')],
        }),
        buildOptionValue({
          key: 'zigzag',
          label: 'Zigzag',
          rarity: 'common',
          layer: 'quarter',
          panels: [
            buildPanel(
              'overlay',
              '214 440, 214 368, 282 398, 350 356, 418 394, 486 352, 554 390, 622 358, 690 392, 690 440',
            ),
          ],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'chevron',
          label: 'Chevron',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '256 300, 346 300, 452 368, 346 436, 256 436, 336 368')],
        }),
      ],
    },
    {
      key: 'heel',
      label: 'Heel',
      values: [
        buildOptionValue({ key: 'counter', label: 'Counter', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'clip',
          label: 'Clip',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '40 330, 150 352, 184 440, 40 440')],
        }),
        buildOptionValue({
          key: 'cage',
          label: 'Cage',
          rarity: 'rare',
          layer: 'top',
          // The second polygon winds the other way, so it cuts a window into the first.
          panels: [
            buildPanel('trim', '30 286, 130 296, 216 446, 30 446', '64 336, 64 414, 150 414'),
          ],
        }),
      ],
    },
    {
      key: 'sole',
      label: 'Sole',
      values: [
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'sole' }),
        buildOptionValue({
          key: 'flash',
          label: 'Flash',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '96 440, 860 458, 800 474, 96 466')],
        }),
        buildOptionValue({
          key: 'pod',
          label: 'Pod',
          rarity: 'uncommon',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '40 420, 330 432, 230 490, 40 490')],
        }),
      ],
    },
  ],
}
