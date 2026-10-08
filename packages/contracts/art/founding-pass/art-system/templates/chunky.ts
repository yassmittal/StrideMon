import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

/** The outsole, redrawn by the one-tone midsole option after it covers the lower layer. */
const OUTSOLE_POINTS = '0 492, 1000 488, 1000 600, 0 600'

export const CHUNKY: SneakerTemplate = {
  key: 'chunky',
  label: 'Chunky',
  legendaryName: 'Nacreous',
  description: 'The "dad shoe": a tall layered midsole, a bulky upper, overlays on overlays.',
  silhouette: parseShape(
    '110 520, 84 512, 66 492, 58 460, 60 420, 62 380, 58 320, 64 270, 80 226, 110 208, ' +
      '156 210, 204 228, 250 240, 292 230, 322 204, 334 172, 360 148, 400 146, 420 166, ' +
      '426 186, 664 280, 740 290, 812 302, 872 322, 916 350, 944 386, 954 428, 952 466, ' +
      '942 492, 918 510, 870 518, 800 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '310 100, 460 100, 460 220, 350 290, 310 270'),
  ],
  framingPanels: [
    buildPanel('heel', '0 140, 150 212, 196 300, 206 400, 0 400'),
    buildPanel('eyestay', '420 130, 724 250, 646 325, 408 231'),
    buildPanel('toe', '704 260, 1000 260, 1000 420, 690 420, 670 334'),
    buildPanel(
      'collar',
      '30 120, 346 120, 342 196, 322 240, 290 268, 250 280, 200 270, 150 254, 110 254, 74 274, 30 274',
    ),
  ],
  solePanels: [
    buildPanel(
      'midsole',
      '0 380, 170 384, 220 350, 300 354, 350 374, 510 378, 560 344, 650 348, 700 372, 1000 384, 1000 600, 0 600',
    ),
    buildPanel(
      'soleAccent',
      '0 440, 170 436, 210 452, 380 446, 420 462, 1000 452, 1000 600, 0 600',
    ),
    buildPanel('outsole', OUTSOLE_POINTS),
  ],
  sheenShapes: [
    parseShape('790 300, 824 306, 774 372, 742 372'),
    parseShape('80 270, 98 266, 92 370, 74 372'),
  ],
  laceLine: { points: parseShape('426 186, 664 280'), eyeletCount: 6 },
  heelTab: { anchor: [84, 228], tiltDegrees: -22 },
  optionSlots: [
    {
      key: 'layers',
      label: 'Layers',
      values: [
        buildOptionValue({
          key: 'mudguard',
          label: 'Mudguard',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '0 316, 300 324, 1000 340, 1000 420, 0 420')],
        }),
        buildOptionValue({
          key: 'waves',
          label: 'Waves',
          rarity: 'common',
          layer: 'quarter',
          panels: [
            buildPanel(
              'overlay',
              '196 400, 196 330, 260 300, 320 336, 380 296, 440 330, 500 290, 560 324, 620 290, 690 330, 690 400',
            ),
          ],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'shard',
          label: 'Shard',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '196 290, 540 400, 196 400')],
        }),
      ],
    },
    {
      key: 'midsole',
      label: 'Midsole',
      values: [
        buildOptionValue({ key: 'stacked', label: 'Stacked', rarity: 'common', layer: 'sole' }),
        buildOptionValue({
          key: 'solid',
          label: 'Solid',
          rarity: 'common',
          layer: 'sole',
          panels: [
            buildPanel('midsole', '0 430, 1000 430, 1000 600, 0 600'),
            buildPanel('outsole', OUTSOLE_POINTS),
          ],
        }),
        buildOptionValue({
          key: 'striped',
          label: 'Striped',
          rarity: 'rare',
          layer: 'sole',
          panels: [buildPanel('trim', '0 404, 300 408, 1000 414, 1000 430, 300 424, 0 420')],
        }),
      ],
    },
    {
      key: 'heel',
      label: 'Heel',
      values: [
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'cap',
          label: 'Cap',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '40 214, 126 216, 176 272, 40 290')],
        }),
        buildOptionValue({
          key: 'pod',
          label: 'Pod',
          rarity: 'uncommon',
          layer: 'top',
          panels: [buildPanel('trim', '40 296, 160 316, 206 400, 40 400')],
        }),
      ],
    },
  ],
}
