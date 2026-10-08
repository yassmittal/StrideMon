import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const SKATE: SneakerTemplate = {
  key: 'skate',
  label: 'Skate',
  description: 'A skate shoe: a puffy collar, a fat tongue and a flat sole that wraps the toe.',
  silhouette: parseShape(
    '80 520, 64 506, 60 480, 60 440, 58 390, 62 330, 72 280, 86 250, 108 232, 150 228, ' +
      '196 238, 236 252, 268 252, 290 236, 300 200, 310 160, 330 140, 372 136, 394 150, ' +
      '402 176, 404 210, 660 320, 740 336, 820 350, 876 366, 914 390, 934 420, 940 452, ' +
      '938 480, 930 500, 910 514, 870 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '296 100, 440 100, 440 220, 330 270, 296 260'),
  ],
  framingPanels: [
    buildPanel('heel', '0 220, 140 250, 170 320, 178 450, 0 450'),
    buildPanel('eyestay', '398 150, 720 290, 643 360, 387 250'),
    buildPanel('toe', '700 300, 1000 300, 1000 460, 660 460, 676 380'),
    buildPanel(
      'collar',
      '30 180, 312 180, 300 240, 282 262, 240 282, 196 274, 150 266, 108 270, 74 290, 30 290',
    ),
  ],
  solePanels: [
    buildPanel('midsole', '0 446, 1000 456, 1000 600, 0 600'),
    buildPanel('midsole', '900 360, 1000 360, 1000 470, 820 470, 850 436'),
    buildPanel('outsole', '0 504, 1000 504, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('760 344, 792 350, 750 420, 720 420'),
    parseShape('84 300, 102 296, 96 400, 78 402'),
  ],
  laceLine: { points: parseShape('404 210, 660 320'), eyeletCount: 5 },
  heelTab: { anchor: [90, 252], tiltDegrees: -18 },
  optionSlots: [
    {
      key: 'side',
      label: 'Side',
      values: [
        buildOptionValue({
          key: 'shard',
          label: 'Shard',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '178 446, 330 290, 420 290, 268 446')],
        }),
        buildOptionValue({
          key: 'wedge',
          label: 'Wedge',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '178 290, 600 450, 178 450')],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'block',
          label: 'Block',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '178 370, 660 404, 660 460, 178 460')],
        }),
      ],
    },
    {
      key: 'foxing',
      label: 'Foxing',
      values: [
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'sole' }),
        buildOptionValue({
          key: 'stripe',
          label: 'Stripe',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '0 470, 1000 478, 1000 494, 0 486')],
        }),
        buildOptionValue({
          key: 'double',
          label: 'Double',
          rarity: 'rare',
          layer: 'sole',
          panels: [
            buildPanel(
              'soleAccent',
              '0 462, 1000 470, 1000 480, 0 472',
              '0 484, 1000 492, 1000 502, 0 494',
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
          key: 'patch',
          label: 'Patch',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '70 300, 146 306, 150 372, 72 372')],
        }),
        buildOptionValue({
          key: 'counter',
          label: 'Counter',
          rarity: 'uncommon',
          layer: 'top',
          panels: [buildPanel('trim', '40 340, 150 360, 178 450, 40 450')],
        }),
      ],
    },
  ],
}
