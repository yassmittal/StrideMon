import { parseShape } from '../geometry'
import { buildOptionValue, buildPanel } from '../template-builders'
import type { SneakerTemplate } from '../types'

export const COURT: SneakerTemplate = {
  key: 'court',
  label: 'Court',
  legendaryName: 'Fire Rainbow',
  description: 'A clean, low court classic on a tall flat cupsole.',
  silhouette: parseShape(
    '80 520, 64 506, 60 480, 60 430, 60 390, 64 350, 74 314, 88 288, 116 276, 160 280, ' +
      '210 294, 250 300, 290 290, 318 272, 332 246, 356 230, 390 228, 406 242, 412 258, ' +
      '660 344, 740 360, 810 370, 866 380, 906 396, 930 418, 940 442, 940 470, 936 494, ' +
      '922 510, 880 520',
  ),
  upperPanels: [
    buildPanel('upper', '0 0, 1000 0, 1000 600, 0 600'),
    buildPanel('tongue', '316 190, 450 190, 450 290, 340 340, 316 330'),
  ],
  framingPanels: [
    buildPanel('heel', '0 230, 150 276, 176 340, 186 430, 0 430'),
    buildPanel('eyestay', '406 200, 720 310, 646 386, 398 300'),
    buildPanel('toe', '716 320, 1000 320, 1000 440, 680 440'),
    buildPanel(
      'collar',
      '40 220, 360 220, 352 266, 326 288, 292 314, 250 322, 206 316, 158 304, 112 304, 80 324, 40 324',
    ),
  ],
  solePanels: [
    buildPanel('midsole', '0 424, 1000 428, 1000 600, 0 600'),
    buildPanel('outsole', '0 502, 1000 502, 1000 600, 0 600'),
  ],
  sheenShapes: [
    parseShape('780 372, 812 376, 772 426, 744 426'),
    parseShape('90 330, 108 326, 100 418, 82 420'),
  ],
  laceLine: { points: parseShape('412 258, 660 344'), eyeletCount: 5 },
  heelTab: { anchor: [92, 288], tiltDegrees: -14 },
  optionSlots: [
    {
      key: 'side',
      label: 'Side',
      values: [
        buildOptionValue({
          key: 'saddle',
          label: 'Saddle',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '350 270, 480 310, 452 440, 322 440')],
        }),
        buildOptionValue({
          key: 'triangle',
          label: 'Triangle',
          rarity: 'common',
          layer: 'quarter',
          panels: [buildPanel('overlay', '186 314, 186 430, 540 430')],
        }),
        buildOptionValue({ key: 'plain', label: 'Plain', rarity: 'common', layer: 'quarter' }),
        buildOptionValue({
          key: 'chevron',
          label: 'Chevron',
          rarity: 'uncommon',
          layer: 'quarter',
          panels: [buildPanel('overlay', '230 322, 320 322, 420 382, 320 442, 230 442, 330 382')],
        }),
      ],
    },
    {
      key: 'toe',
      label: 'Toe',
      values: [
        buildOptionValue({ key: 'smooth', label: 'Smooth', rarity: 'common', layer: 'top' }),
        buildOptionValue({
          key: 'cap',
          label: 'Cap',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '846 360, 1000 360, 1000 440, 800 440')],
        }),
        buildOptionValue({
          key: 'perforated',
          label: 'Perforated',
          rarity: 'rare',
          layer: 'top',
          panels: [
            buildPanel(
              'ink',
              '764 380, 772 372, 780 380, 772 388',
              '804 384, 812 376, 820 384, 812 392',
              '844 390, 852 382, 860 390, 852 398',
              '780 406, 788 398, 796 406, 788 414',
              '820 410, 828 402, 836 410, 828 418',
              '860 416, 868 408, 876 416, 868 424',
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
          key: 'tab',
          label: 'Tab',
          rarity: 'common',
          layer: 'top',
          panels: [buildPanel('trim', '40 292, 122 300, 128 354, 40 354')],
        }),
        buildOptionValue({
          key: 'spoiler',
          label: 'Spoiler',
          rarity: 'uncommon',
          layer: 'top',
          panels: [buildPanel('trim', '40 290, 116 296, 128 430, 40 430')],
        }),
      ],
    },
  ],
}
