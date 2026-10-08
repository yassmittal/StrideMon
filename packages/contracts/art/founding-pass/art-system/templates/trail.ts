import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const TRAIL: SneakerTemplate = {
  key: 'trail',
  label: 'Trail',
  description: 'Built for dirt: a lugged outsole, a rubber toe bumper and a tough upper.',
  silhouette: parseShape(
    '124 516, 96 506, 76 490, 66 466, 62 430, 60 390, 64 330, 76 280, 92 240, 118 222, ' +
      '160 226, 204 244, 246 256, 288 246, 318 220, 330 188, 354 164, 390 162, 408 180, ' +
      '414 198, 676 310, 744 326, 812 340, 870 358, 912 382, 936 414, 944 448, 940 474, ' +
      '928 494, 904 508, 880 516, 872 520, 826 520, 820 505, 812 505, 806 520, 760 520, ' +
      '754 505, 746 505, 740 520, 694 520, 688 505, 680 505, 674 520, 628 520, 622 505, ' +
      '614 505, 608 520, 562 520, 556 505, 548 505, 542 520, 496 520, 490 505, 482 505, ' +
      '476 520, 430 520, 424 505, 416 505, 410 520, 364 520, 358 505, 350 505, 344 520, ' +
      '298 520, 292 505, 284 505, 278 520, 232 520, 226 505, 218 505, 212 520, 166 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '300 120, 450 120, 450 230, 330 290, 300 280'),
  ],
  framingPanels: [
    buildPanel('heel', '0 140, 160 228, 206 318, 214 440, 0 440'),
    buildPanel('eyestay', '406 140, 740 280, 658 352, 396 240'),
    buildPanel('toe', '720 290, 1000 290, 1000 460, 690 460, 690 380'),
    buildPanel('trim', '880 352, 1000 352, 1000 470, 780 470, 830 420'),
    buildPanel(
      'collar',
      '30 120, 346 120, 342 210, 322 252, 288 280, 246 292, 200 280, 116 260, 76 278, 30 278',
    ),
  ],
  solePanels: [
    buildPanel('midsole', '0 410, 300 422, 1000 440, 1000 600, 0 600'),
    buildPanel('outsole', '0 474, 700 478, 860 474, 1000 456, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('790 340, 822 346, 790 400, 760 400'),
    parseShape('92 290, 110 288, 98 396, 80 398'),
  ],
  laceLine: { points: parseShape('414 198, 676 310'), eyeletCount: 6 },
  heelTab: { anchor: [96, 242], tiltDegrees: -20 },
  optionSlots: [
    {
      key: 'overlay',
      label: 'Overlay',
      values: [
        buildOptionValue({
          key: 'ridge',
          label: 'Ridge',
          rarity: 'common',
          layer: 'quarter',
          panels: [
            buildPanel(
              'overlay',
              '214 450, 214 396, 250 360, 280 392, 320 340, 360 390, 400 350, 440 392, 480 344, 520 390, 560 356, 600 394, 640 360, 690 400, 690 450',
            ),
          ],
        }),
        buildOptionValue({
          key: 'peaks',
          label: 'Peaks',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '214 440, 300 320, 386 440', '360 440, 470 290, 580 440')],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'slope',
          label: 'Slope',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '214 440, 690 330, 690 440')],
        }),
      ],
    },
    {
      key: 'guard',
      label: 'Guard',
      values: [
        buildOptionValue({ key: 'toe', label: 'Toe', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'heel',
          label: 'Heel',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '40 352, 172 374, 214 440, 40 440')],
        }),
        buildOptionValue({
          key: 'rand',
          label: 'Rand',
          rarity: 'rare',
          layer: 'top',
          panels: [buildPanel('trim', '0 384, 300 396, 1000 414, 1000 470, 0 470')],
        }),
      ],
    },
    {
      key: 'tread',
      label: 'Tread',
      values: [
        buildOptionValue({ key: 'mono', label: 'Mono', rarity: 'common', layer: 'sole' }),
        buildOptionValue({
          key: 'stripe',
          label: 'Stripe',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '0 432, 860 450, 830 460, 0 444')],
        }),
        buildOptionValue({
          key: 'tinted',
          label: 'Tinted',
          rarity: 'uncommon',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '0 474, 700 478, 860 474, 1000 456, 1000 600, 0 600')],
        }),
      ],
    },
  ],
}
