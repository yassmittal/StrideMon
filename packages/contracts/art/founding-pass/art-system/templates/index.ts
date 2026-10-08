import type { SneakerTemplate, TemplateKey } from '../types'
import { CHUNKY } from './chunky'
import { COURT } from './court'
import { HIKER } from './hiker'
import { HOOP } from './hoop'
import { RACER } from './racer'
import { RUNNER } from './runner'
import { SKATE } from './skate'
import { SOCK } from './sock'
import { SPIKE } from './spike'
import { TRAIL } from './trail'

/** The ten silhouettes, in the order the sheets show them. */
export const SNEAKER_TEMPLATES: readonly SneakerTemplate[] = [
  RUNNER,
  RACER,
  TRAIL,
  COURT,
  HOOP,
  CHUNKY,
  SOCK,
  SKATE,
  SPIKE,
  HIKER,
]

export function readSneakerTemplate(templateKey: TemplateKey): SneakerTemplate {
  const template = SNEAKER_TEMPLATES.find((candidate) => candidate.key === templateKey)
  if (template === undefined) throw new Error(`Unknown template: ${templateKey}`)
  return template
}
