import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const HIKER: SneakerTemplate = {
  key: 'hiker',
  label: 'Hiker',
  description: 'A mid hiking boot: an ankle shaft, deep lugs and a rubber toe bumper.',
  silhouette: parseShape(
    '128 520, 98 512, 78 500, 66 476, 62 440, 58 390, 60 330, 66 260, 74 200, 86 156, ' +
      '116 140, 160 136, 206 142, 240 152, 256 136, 274 116, 310 110, 330 122, 338 142, ' +
      '640 320, 720 336, 800 350, 864 366, 908 388, 934 420, 944 456, 940 484, 926 502, ' +
      '900 512, 884 520, 830 520, 823 500, 813 500, 806 520, 752 520, 745 500, 735 500, ' +
      '728 520, 674 520, 667 500, 657 500, 650 520, 596 520, 589 500, 579 500, 572 520, ' +
      '518 520, 511 500, 501 500, 494 520, 440 520, 433 500, 423 500, 416 520, 362 520, ' +
      '355 500, 345 500, 338 520, 284 520, 277 500, 267 500, 260 520, 206 520, 199 500, ' +
      '189 500, 182 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '240 60, 380 60, 380 170, 300 230, 240 210'),
  ],
  framingPanels: [
    buildPanel('heel', '0 300, 150 316, 200 370, 206 440, 0 440'),
    buildPanel('eyestay', '334 80, 700 290, 617 360, 315 182'),
    buildPanel('toe', '690 310, 1000 310, 1000 460, 670 460, 676 390'),
    buildPanel('trim', '860 350, 1000 350, 1000 470, 760 470, 800 420'),
    buildPanel('collar', '30 60, 270 60, 262 150, 236 186, 190 184, 130 186, 80 202, 30 202'),
  ],
  solePanels: [
    buildPanel('midsole', '0 420, 300 428, 1000 446, 1000 600, 0 600'),
    buildPanel('outsole', '0 466, 700 470, 880 466, 1000 450, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('770 344, 802 350, 770 410, 740 410'),
    parseShape('84 220, 102 216, 96 320, 78 322'),
  ],
  laceLine: { points: parseShape('338 142, 640 320'), eyeletCount: 7 },
  heelTab: { anchor: [88, 160], tiltDegrees: -10 },
  optionSlots: [
    {
      key: 'shaft',
      label: 'Shaft',
      values: [
        buildOptionValue({
          key: 'zigzag',
          label: 'Zigzag',
          rarity: 'common',
          layer: 'quarter',
          panels: [
            buildPanel(
              'overlay',
              '206 450, 206 380, 270 410, 330 370, 390 404, 450 366, 510 400, 570 364, 640 400, 640 450',
            ),
          ],
        }),
        buildOptionValue({
          key: 'panel',
          label: 'Panel',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '0 200, 250 180, 330 300, 206 440, 0 440')],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'peaks',
          label: 'Peaks',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '206 450, 300 330, 394 450', '370 450, 480 310, 590 450')],
        }),
      ],
    },
    {
      key: 'rand',
      label: 'Rand',
      values: [
        buildOptionValue({ key: 'none', label: 'None', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'heel',
          label: 'Heel',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '40 360, 180 380, 206 440, 40 440')],
        }),
        buildOptionValue({
          key: 'wrap',
          label: 'Wrap',
          rarity: 'rare',
          layer: 'top',
          panels: [buildPanel('trim', '0 392, 300 400, 1000 418, 1000 470, 0 470')],
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
          panels: [buildPanel('trim', '30 60, 270 60, 264 130, 236 160, 30 168')],
        }),
        buildOptionValue({
          key: 'stripe',
          label: 'Stripe',
          rarity: 'uncommon',
          layer: 'top',
          panels: [buildPanel('trim', '30 130, 262 110, 260 134, 30 156')],
        }),
      ],
    },
  ],
}
