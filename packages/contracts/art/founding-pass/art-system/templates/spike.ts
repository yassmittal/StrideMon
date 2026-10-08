import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const SPIKE: SneakerTemplate = {
  key: 'spike',
  label: 'Spike',
  description: 'A track spike: low and pointed, with a spike plate under the forefoot.',
  silhouette: parseShape(
    '100 516, 80 508, 70 490, 68 460, 66 420, 70 370, 80 320, 94 286, 120 274, 160 278, ' +
      '206 292, 244 298, 282 286, 310 266, 324 244, 346 230, 374 230, 388 244, 392 258, ' +
      '640 350, 720 372, 800 388, 870 404, 920 420, 950 436, 958 454, 950 470, 920 482, ' +
      '898 492, 880 494, 870 520, 860 494, 820 494, 810 520, 800 494, 760 494, 750 520, ' +
      '740 494, 700 494, 690 520, 680 494, 640 494, 630 520, 620 494, 560 494, 520 498, ' +
      '470 504, 400 510, 300 514, 200 516',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '316 200, 440 200, 440 280, 340 330, 316 320'),
  ],
  framingPanels: [
    buildPanel('heel', '0 260, 140 280, 180 340, 186 460, 0 460'),
    buildPanel('eyestay', '386 204, 700 322, 625 389, 377 297'),
    buildPanel('toe', '700 340, 1000 340, 1000 480, 670 480, 680 410'),
    buildPanel(
      'collar',
      '40 230, 340 230, 330 262, 300 290, 256 314, 206 310, 160 300, 120 300, 84 318, 40 318',
    ),
  ],
  solePanels: [
    buildPanel('midsole', '0 446, 400 460, 1000 468, 1000 600, 0 600'),
    buildPanel('outsole', '0 504, 480 500, 1000 482, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('790 384, 822 390, 790 450, 760 450'),
    parseShape('92 330, 110 326, 102 420, 84 422'),
  ],
  laceLine: { points: parseShape('392 258, 640 350'), eyeletCount: 5 },
  heelTab: { anchor: [98, 288], tiltDegrees: -14 },
  optionSlots: [
    {
      key: 'side',
      label: 'Side',
      values: [
        buildOptionValue({
          key: 'dart',
          label: 'Dart',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '186 330, 580 400, 186 456, 260 396')],
        }),
        buildOptionValue({
          key: 'streaks',
          label: 'Streaks',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '186 330, 500 380, 186 366', '186 390, 600 430, 186 430')],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'chevron',
          label: 'Chevron',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '230 330, 320 330, 420 390, 320 450, 230 450, 330 390')],
        }),
      ],
    },
    {
      key: 'support',
      label: 'Support',
      values: [
        buildOptionValue({ key: 'none', label: 'None', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'counter',
          label: 'Counter',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '40 360, 150 376, 186 460, 40 460')],
        }),
        buildOptionValue({
          key: 'strap',
          label: 'Strap',
          rarity: 'rare',
          layer: 'top',
          panels: [buildPanel('trim', '304 280, 376 300, 330 470, 256 470')],
        }),
      ],
    },
    {
      key: 'plate',
      label: 'Plate',
      values: [
        buildOptionValue({ key: 'matched', label: 'Matched', rarity: 'common', layer: 'sole' }),
        buildOptionValue({
          key: 'contrast',
          label: 'Contrast',
          rarity: 'common',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '500 486, 1000 474, 1000 600, 500 600')],
        }),
        buildOptionValue({
          key: 'flash',
          label: 'Flash',
          rarity: 'uncommon',
          layer: 'sole',
          panels: [buildPanel('soleAccent', '20 466, 420 474, 400 486, 20 480')],
        }),
      ],
    },
  ],
}
