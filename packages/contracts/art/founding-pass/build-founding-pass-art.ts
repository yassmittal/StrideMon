/**
 * Builds the Founding Pass art previews (docs/founding-pass-brief.md §4.4, Part 1a): picks the
 * 1,000 designs, checks them against the rules, and draws the review sheets into previews/ as
 * SVG and PNG.
 *
 * Run from the repo root: `bun packages/contracts/art/founding-pass/build-founding-pass-art.ts`
 * Needs rsvg-convert for the PNGs (`brew install librsvg`). Text uses IBM Plex Mono from the
 * app's node_modules when it's there, and a fallback monospace otherwise.
 */
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkDesigns } from './generator/check-designs'
import { generateDesigns } from './generator/generate-designs'
import { buildPreviewFiles, type PreviewFile } from './sheets/build-preview-files'

const PREVIEWS_DIRECTORY = fileURLToPath(new URL('previews/', import.meta.url))
const PLEX_MONO_FONT_DIRECTORY = fileURLToPath(
  new URL('../../../../node_modules/@expo-google-fonts/ibm-plex-mono/400Regular/', import.meta.url),
)
const SYSTEM_FONTCONFIG_FILE = '/opt/homebrew/etc/fonts/fonts.conf'

const designs = generateDesigns()
for (const reportLine of checkDesigns(designs)) console.log(reportLine)
await mkdir(PREVIEWS_DIRECTORY, { recursive: true })
await writeFile(join(PREVIEWS_DIRECTORY, 'designs.json'), `${JSON.stringify(designs, null, 2)}\n`)
const previewFiles = buildPreviewFiles(designs)
for (const previewFile of previewFiles) {
  await writeFile(join(PREVIEWS_DIRECTORY, `${previewFile.fileName}.svg`), previewFile.svg)
}
await renderPngs(previewFiles)
console.log(`previews: ${previewFiles.length} SVGs and PNGs in ${PREVIEWS_DIRECTORY}`)

async function renderPngs(previewFiles: readonly PreviewFile[]): Promise<void> {
  if (Bun.which('rsvg-convert') === null) {
    throw new Error('rsvg-convert is missing: brew install librsvg (the SVGs are written already)')
  }
  const fontconfigDirectory = await mkdtemp(join(tmpdir(), 'founding-pass-fonts-'))
  try {
    const environment = await buildFontEnvironment(fontconfigDirectory)
    for (const { fileName, pngWidthPixels } of previewFiles) {
      const conversion = Bun.spawnSync(
        [
          'rsvg-convert',
          '--width',
          String(pngWidthPixels),
          join(PREVIEWS_DIRECTORY, `${fileName}.svg`),
          '--output',
          join(PREVIEWS_DIRECTORY, `${fileName}.png`),
        ],
        { env: environment },
      )
      if (conversion.exitCode !== 0) {
        throw new Error(`rsvg-convert failed on ${fileName}: ${conversion.stderr.toString()}`)
      }
    }
  } finally {
    await rm(fontconfigDirectory, { recursive: true, force: true })
  }
}

/** Points fontconfig at IBM Plex Mono, so the PNGs show the same type as the app and website. */
async function buildFontEnvironment(fontconfigDirectory: string): Promise<Record<string, string>> {
  const environment: Record<string, string> = {}
  for (const [name, value] of Object.entries(process.env)) {
    if (value !== undefined) environment[name] = value
  }
  if (!existsSync(PLEX_MONO_FONT_DIRECTORY)) {
    console.warn('IBM Plex Mono not found in node_modules: the PNGs use a fallback monospace')
    return environment
  }
  const fontconfigFile = join(fontconfigDirectory, 'fonts.conf')
  await writeFile(
    fontconfigFile,
    [
      '<?xml version="1.0"?>',
      '<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">',
      '<fontconfig>',
      `  <include ignore_missing="yes">${SYSTEM_FONTCONFIG_FILE}</include>`,
      `  <dir>${PLEX_MONO_FONT_DIRECTORY}</dir>`,
      `  <cachedir>${join(fontconfigDirectory, 'cache')}</cachedir>`,
      '</fontconfig>',
      '',
    ].join('\n'),
  )
  environment.FONTCONFIG_FILE = fontconfigFile
  return environment
}
