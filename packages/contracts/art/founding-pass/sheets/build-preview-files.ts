import type { Design } from '../art-system/types'
import {
  planColorwaysSheet,
  planFamiliesSheet,
  planOptionsSheet,
  planTemplatesSheet,
} from './art-system-sheets'
import {
  planCardStateFiles,
  planContactSheets,
  planLegendariesSheet,
  type ReviewStatus,
} from './collection-sheets'
import type { PreviewPlan } from './showcase'
import { planXTeaserFile } from './x-teaser'

export type { ReviewStatus } from './collection-sheets'
export type { PreviewPlan } from './showcase'

/**
 * Every file previews/ gets: the ten contact sheets for the review, the art-system sheets, the
 * card states, the Legendaries, and the X teaser. All of them lay out the Solidity renderer's
 * own drawings.
 */
export function planPreviewFiles(
  designs: readonly Design[],
  reviewStatus: ReviewStatus,
): PreviewPlan[] {
  return [
    planTemplatesSheet(),
    planFamiliesSheet(),
    ...planContactSheets(designs, reviewStatus),
    ...planCardStateFiles(designs),
    planColorwaysSheet(),
    planOptionsSheet(),
    planLegendariesSheet(designs),
    planXTeaserFile(),
  ]
}
