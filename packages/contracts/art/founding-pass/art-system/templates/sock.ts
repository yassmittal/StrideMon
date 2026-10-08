import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const SOCK: SneakerTemplate = {
  key: 'sock',
  label: 'Sock',
  legendaryName: 'Moonbow',
  description: 'A knit sock runner: a tall stretch cuff and no separate tongue.',
  silhouette: parseShape(
    '100 520, 76 508, 64 486, 62 452, 60 400, 62 340, 70 270, 80 200, 92 150, 120 140, ' +
      '170 136, 222 132, 256 136, 274 156, 300 196, 660 320, 740 342, 810 358, 868 376, ' +
      '908 398, 932 426, 938 456, 930 480, 912 498, 876 510, 810 518, 740 520',
  ),
  upperPanels: [buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600')],
  framingPanels: [
    buildPanel('heel', '0 250, 120 270, 160 340, 170 440, 0 440'),
    buildPanel('eyestay', '300 150, 720 290, 646 360, 286 236'),
    buildPanel('toe', '720 320, 1000 320, 1000 460, 700 460, 690 400'),
    buildPanel(
      'collar',
      '40 60, 320 60, 300 196, 276 182, 236 172, 170 178, 120 186, 80 200, 40 200',
    ),
  ],
  solePanels: [
    buildPanel('midsole', '0 420, 300 430, 1000 450, 1000 600, 0 600'),
    buildPanel('outsole', '0 494, 700 496, 860 490, 1000 470, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('780 352, 812 358, 772 430, 742 430'),
    parseShape('84 230, 102 226, 96 330, 78 332'),
  ],
  laceLine: { points: parseShape('300 196, 660 320'), eyeletCount: 6 },
  heelTab: { anchor: [96, 154], tiltDegrees: -12 },
  optionSlots: [
    {
      key: 'cuff',
      label: 'Cuff',
      values: [
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'band',
          label: 'Band',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '40 154, 290 136, 296 160, 40 180')],
        }),
        buildOptionValue({
          key: 'tipped',
          label: 'Tipped',
          rarity: 'uncommon',
          layer: 'top',
          panels: [buildPanel('trim', '40 100, 320 100, 300 148, 40 160')],
        }),
      ],
    },
    {
      key: 'cage',
      label: 'Cage',
      values: [
        buildOptionValue({
          key: 'wrap',
          label: 'Wrap',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '0 200, 220 214, 340 440, 0 440')],
        }),
        buildOptionValue({
          key: 'zigzag',
          label: 'Zigzag',
          rarity: 'common',
          layer: 'quarter',
          panels: [
            buildPanel(
              'overlay',
              '170 440, 170 372, 240 404, 310 362, 380 400, 450 358, 520 396, 590 360, 690 400, 690 440',
            ),
          ],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'chevron',
          label: 'Chevron',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '200 322, 290 322, 390 382, 290 442, 200 442, 300 382')],
        }),
      ],
    },
    {
      key: 'sole',
      label: 'Sole',
      values: [
        buildOptionValue({ key: 'flat', label: 'Flat', rarity: 'common', layer: 'sole' }),
        buildOptionValue({
          key: 'stripe',
          label: 'Stripe',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '0 454, 860 472, 830 482, 0 466')],
        }),
        buildOptionValue({
          key: 'pod',
          label: 'Pod',
          rarity: 'rare',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '40 424, 300 432, 220 494, 40 494')],
        }),
      ],
    },
  ],
}
