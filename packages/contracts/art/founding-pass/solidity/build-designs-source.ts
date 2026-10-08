import type { Design } from '../art-system/types'
import { encodeLayers, SOLIDITY_RARITIES } from './solidity-order'
import { GENERATED_FILE_HEADER } from './solidity-source-format'

const DESIGN_NUMBER_DIGITS = 4
/** The card writes names into SVG text as they are, so they stay letters and spaces. */
const PLAIN_NAME_PATTERN = /^[A-Za-z ]+$/

/**
 * `FoundingPassDesigns.sol`: the design table, one row of eight bytes per design number, each
 * an index into the art data (template, family, colourway, the three option slots, laces) and the
 * design's rarity. The row comment carries the name, so the table reads like `designs.json`.
 */
export function buildDesignsSource({
  designs,
  statusLine,
}: {
  designs: readonly Design[]
  /** Whether the table is still under review or frozen, for the file's NatSpec. */
  statusLine: string
}): string {
  return [
    GENERATED_FILE_HEADER,
    'pragma solidity 0.8.37;',
    '',
    '/// @title FoundingPassDesigns',
    `/// @notice The ${designs.length.toLocaleString('en-US')} Founding Pass designs, by design number (the token id).`,
    `/// ${statusLine}`,
    'library FoundingPassDesigns {',
    `    uint256 internal constant DESIGN_COUNT = ${designs.length};`,
    '    uint256 internal constant ROW_LENGTH = 8;',
    '',
    '    /// @dev Row n - 1 is design n: template, colour family, colourway, option slots 1 to 3,',
    '    /// lace colour, rarity.',
    '    bytes internal constant DESIGN_TABLE =',
    // The semicolon gets its own line: on the last row's line it would sit inside the comment.
    designs.map(formatDesignRow).join('\n'),
    '        ;',
    '}',
    '',
  ].join('\n')
}

function formatDesignRow(design: Design, index: number): string {
  if (design.designNumber !== index + 1) {
    throw new Error(`Design ${design.designNumber} is in row ${index + 1}`)
  }
  if (!PLAIN_NAME_PATTERN.test(design.name)) throw new Error(`Not a plain name: ${design.name}`)
  const encodedLayers = encodeLayers(design.layers)
  const rowBytes = [
    encodedLayers.templateIndex,
    encodedLayers.colorFamilyIndex,
    encodedLayers.colorwayIndex,
    ...encodedLayers.optionValueIndexes,
    encodedLayers.laceColorIndex,
    SOLIDITY_RARITIES.indexOf(design.rarity),
  ]
  const hexDigits = rowBytes.map((rowByte) => rowByte.toString(16).padStart(2, '0')).join('')
  const designLabel = String(design.designNumber).padStart(DESIGN_NUMBER_DIGITS, '0')
  return `        hex"${hexDigits}" // #${designLabel} ${design.name}`
}
