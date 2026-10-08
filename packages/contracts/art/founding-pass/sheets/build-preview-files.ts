import type { Design } from '../art-system/types'
import {
  buildColorwaysSheet,
  buildFamiliesSheet,
  buildOptionsSheet,
  buildTemplatesSheet,
} from './art-system-sheets'
import {
  buildCardStateFiles,
  buildFirstDesignsSheet,
  buildLegendariesSheet,
} from './collection-sheets'
import type { PreviewFile } from './showcase'
import { buildXTeaserFile } from './x-teaser'

export type { PreviewFile } from './showcase'

/** Every file previews/ gets: the four sheets the brief asks for, three for the review, one for X. */
export function buildPreviewFiles(designs: readonly Design[]): PreviewFile[] {
  return [
    buildTemplatesSheet(),
    buildFamiliesSheet(),
    buildFirstDesignsSheet(designs),
    ...buildCardStateFiles(designs),
    buildColorwaysSheet(),
    buildOptionsSheet(),
    buildLegendariesSheet(designs),
    buildXTeaserFile(),
  ]
}
