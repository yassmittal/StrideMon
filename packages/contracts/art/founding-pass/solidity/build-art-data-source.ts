import { COLOR_FAMILIES } from '../art-system/color-families'
import { COLORWAYS } from '../art-system/colorways'
import { formatPathData } from '../art-system/geometry'
import { placeHeelTab } from '../art-system/heel-tab'
import { calculateEyeletCenters, calculateLaceSlatShapes } from '../art-system/lacing'
import { SNEAKER_TEMPLATES } from '../art-system/templates'
import type { OptionValue, Panel, Point, SneakerTemplate } from '../art-system/types'
import { SOLIDITY_PANEL_ROLES, toSolidityMemberName } from './solidity-order'
import { GENERATED_FILE_HEADER, quoteSolidityString } from './solidity-source-format'

const SHADED_ROLE_COUNT = 10
const EYELET_COORDINATE_HEX_DIGITS = 4

/**
 * `FoundingPassArtData.sol`: the art system as Solidity data. Templates (their polygons, lace
 * slats, eyelets and heel tab, placed by the art system's own geometry), colour families,
 * colourways and the name words. The drawing itself lives only in `FoundingPassArtRenderer`.
 */
export function buildArtDataSource(): string {
  return [
    GENERATED_FILE_HEADER,
    'pragma solidity 0.8.37;',
    '',
    'import {',
    '    InvalidArtIndex, OptionLayer, OptionValueArt, Panel, PanelRole, TemplateArt',
    '} from "./FoundingPassArtTypes.sol";',
    '',
    '/// @title FoundingPassArtData',
    '/// @notice The Founding Pass art system as data, for `FoundingPassArtRenderer`. Coordinates are',
    '/// whole units in the 1000 × 600 Sneaker space, written as SVG path data.',
    'library FoundingPassArtData {',
    `    uint256 internal constant TEMPLATE_COUNT = ${SNEAKER_TEMPLATES.length};`,
    `    uint256 internal constant COLOR_FAMILY_COUNT = ${COLOR_FAMILIES.length};`,
    `    uint256 internal constant COLORWAY_COUNT = ${COLORWAYS.length};`,
    '',
    buildLabelFunction({
      functionName: 'readTemplateLabel',
      parameterName: 'templateIndex',
      labels: SNEAKER_TEMPLATES.map((template) => template.label),
    }),
    '',
    "    /// @notice The hand-picked name of each template's one Legendary (D-041).",
    buildLabelFunction({
      functionName: 'readLegendaryName',
      parameterName: 'templateIndex',
      labels: SNEAKER_TEMPLATES.map((template) => template.legendaryName),
    }),
    '',
    buildLabelFunction({
      functionName: 'readColorFamilyLabel',
      parameterName: 'colorFamilyIndex',
      labels: COLOR_FAMILIES.map((colorFamily) => colorFamily.label),
    }),
    '',
    buildLabelFunction({
      functionName: 'readColorwayLabel',
      parameterName: 'colorwayIndex',
      labels: COLORWAYS.map((colorway) => colorway.label),
    }),
    '',
    buildShadeColorFunction(),
    '',
    buildSheenFunctions(),
    '',
    buildColorwayShadeFunction(),
    '',
    buildTemplateArtDispatch(),
    '',
    buildOptionValueDispatch(),
    ...SNEAKER_TEMPLATES.flatMap((template) => [
      '',
      buildTemplateArtFunction(template),
      '',
      buildOptionValueFunction(template),
    ]),
    '}',
    '',
  ].join('\n')
}

function buildLabelFunction({
  functionName,
  parameterName,
  labels,
}: {
  functionName: string
  parameterName: string
  labels: readonly string[]
}): string {
  return [
    `    function ${functionName}(uint256 ${parameterName}) internal pure returns (string memory) {`,
    ...labels.map(
      (label, index) =>
        `        if (${parameterName} == ${index}) return ${quoteSolidityString(label)};`,
    ),
    '        revert InvalidArtIndex();',
    '    }',
  ].join('\n')
}

function buildShadeColorFunction(): string {
  return [
    "    /// @notice A family's five shades, light to dark, as 0xRRGGBB.",
    '    function readShadeColors(uint256 colorFamilyIndex) internal pure returns (uint24[5] memory) {',
    ...COLOR_FAMILIES.map((colorFamily, index) => {
      const shadeList = colorFamily.shades
        .map((shade, shadeIndex) =>
          shadeIndex === 0 ? `uint24(${toHexColor(shade)})` : toHexColor(shade),
        )
        .join(', ')
      return `        if (colorFamilyIndex == ${index}) return [${shadeList}]; // ${colorFamily.label}`
    }),
    '        revert InvalidArtIndex();',
    '    }',
  ].join('\n')
}

function buildSheenFunctions(): string {
  const sheenFamilies = COLOR_FAMILIES.flatMap((colorFamily, index) =>
    colorFamily.sheenColor === null
      ? []
      : [{ colorFamily, index, sheenColor: colorFamily.sheenColor }],
  )
  return [
    '    /// @notice Gold and Chrome: the families with a flat sheen on the toe and heel.',
    '    function hasSheen(uint256 colorFamilyIndex) internal pure returns (bool) {',
    `        return ${sheenFamilies.map(({ index }) => `colorFamilyIndex == ${index}`).join(' || ')};`,
    '    }',
    '',
    "    /// @notice The colour of a metallic family's sheen shards.",
    '    function readSheenColor(uint256 colorFamilyIndex) internal pure returns (uint24) {',
    ...sheenFamilies.map(
      ({ colorFamily, index, sheenColor }) =>
        `        if (colorFamilyIndex == ${index}) return ${toHexColor(sheenColor)}; // ${colorFamily.label}`,
    ),
    '        revert InvalidArtIndex();',
    '    }',
  ].join('\n')
}

function buildColorwayShadeFunction(): string {
  const shadedRoles = SOLIDITY_PANEL_ROLES.slice(0, SHADED_ROLE_COUNT)
  return [
    "    /// @notice Which of the family's shades (0 lightest, 4 darkest) each shaded role takes,",
    '    /// indexed by `PanelRole`.',
    `    /// @dev Columns: ${shadedRoles.map(toSolidityMemberName).join(', ')}.`,
    '    function readColorwayShadeIndexes(uint256 colorwayIndex)',
    '        internal',
    '        pure',
    `        returns (uint8[${SHADED_ROLE_COUNT}] memory)`,
    '    {',
    ...COLORWAYS.map((colorway, index) => {
      const shadeList = shadedRoles
        .map((role, roleIndex) => {
          if (role === 'midsole' || role === 'ink') throw new Error(`${role} isn't shaded`)
          const shadeIndex = colorway.shadeByRole[role]
          return roleIndex === 0 ? `uint8(${shadeIndex})` : String(shadeIndex)
        })
        .join(', ')
      return `        if (colorwayIndex == ${index}) return [${shadeList}]; // ${colorway.label}`
    }),
    '        revert InvalidArtIndex();',
    '    }',
  ].join('\n')
}

function buildTemplateArtDispatch(): string {
  return [
    '    function readTemplateArt(uint256 templateIndex) internal pure returns (TemplateArt memory) {',
    ...SNEAKER_TEMPLATES.map(
      (template, index) =>
        `        if (templateIndex == ${index}) return ${readTemplateArtFunctionName(template)}();`,
    ),
    '        revert InvalidArtIndex();',
    '    }',
  ].join('\n')
}

function buildOptionValueDispatch(): string {
  return [
    '    function readOptionValue(uint256 templateIndex, uint256 slotIndex, uint256 valueIndex)',
    '        internal',
    '        pure',
    '        returns (OptionValueArt memory)',
    '    {',
    ...SNEAKER_TEMPLATES.map(
      (template, index) =>
        `        if (templateIndex == ${index}) return ${readOptionValueFunctionName(template)}(slotIndex, valueIndex);`,
    ),
    '        revert InvalidArtIndex();',
    '    }',
  ].join('\n')
}

function buildTemplateArtFunction(template: SneakerTemplate): string {
  const { tabShape, markShape } = placeHeelTab(template.heelTab)
  const silhouetteTopY = Math.min(...template.silhouette.map(([, y]) => y))
  const optionValueCounts = template.optionSlots.map((optionSlot) => optionSlot.values.length)
  return [
    `    /// @dev The ${template.label}. ${template.description}`,
    `    function ${readTemplateArtFunctionName(template)}() private pure returns (TemplateArt memory templateArt) {`,
    `        templateArt.silhouettePathData = ${quotePathData([template.silhouette])};`,
    `        templateArt.silhouetteTopY = ${silhouetteTopY};`,
    `        templateArt.heelTabPathData = ${quotePathData([tabShape])};`,
    `        templateArt.heelTabMarkPathData = ${quotePathData([markShape])};`,
    ...buildPanelAssignments('templateArt.upperPanels', template.upperPanels),
    ...buildPanelAssignments('templateArt.framingPanels', template.framingPanels),
    ...buildPanelAssignments('templateArt.solePanels', template.solePanels),
    `        templateArt.sheenPathData = ${quotePathData(template.sheenShapes)};`,
    `        templateArt.laceSlatPathData = ${quotePathData(calculateLaceSlatShapes(template.laceLine))};`,
    '        // Each eyelet centre: x, then y, two bytes each.',
    `        templateArt.eyeletCenters = ${formatEyeletCenters(calculateEyeletCenters(template.laceLine))};`,
    `        templateArt.optionValueCounts = [${optionValueCounts.map((count, index) => (index === 0 ? `uint8(${count})` : String(count))).join(', ')}];`,
    '    }',
  ].join('\n')
}

function buildOptionValueFunction(template: SneakerTemplate): string {
  const slotSummary = template.optionSlots
    .map(
      (optionSlot) =>
        `${optionSlot.label} (${optionSlot.values.map((value) => value.label).join(', ')})`,
    )
    .join(', ')
  return [
    `    /// @dev ${template.label}: ${slotSummary}.`,
    `    function ${readOptionValueFunctionName(template)}(uint256 slotIndex, uint256 valueIndex)`,
    '        private',
    '        pure',
    '        returns (OptionValueArt memory optionValue)',
    '    {',
    ...template.optionSlots.flatMap((optionSlot, slotIndex) =>
      optionSlot.values.flatMap((optionValue, valueIndex) => [
        `        if (slotIndex == ${slotIndex} && valueIndex == ${valueIndex}) {`,
        `            // ${optionSlot.label}: ${optionValue.label}`,
        ...buildOptionValueBody(optionValue),
        '            return optionValue;',
        '        }',
      ]),
    ),
    '        revert InvalidArtIndex();',
    '    }',
  ].join('\n')
}

function buildOptionValueBody(optionValue: OptionValue): string[] {
  return [
    `            optionValue.layer = OptionLayer.${toSolidityMemberName(optionValue.layer)};`,
    ...buildPanelAssignments('optionValue.panels', optionValue.panels).map((line) => `    ${line}`),
  ]
}

function buildPanelAssignments(target: string, panels: readonly Panel[]): string[] {
  if (panels.length === 0) return []
  return [
    `        ${target} = new Panel[](${panels.length});`,
    ...panels.map(
      (panel, index) =>
        `        ${target}[${index}] = Panel(PanelRole.${toSolidityMemberName(panel.role)}, ${quotePathData(panel.shapes)});`,
    ),
  ]
}

function formatEyeletCenters(centers: readonly Point[]): string {
  const hexDigits = centers
    .flatMap((coordinates) =>
      coordinates.map((coordinate) => {
        if (coordinate < 0 || coordinate > 0xffff)
          throw new Error(`Eyelet out of range: ${coordinate}`)
        return coordinate.toString(16).toUpperCase().padStart(EYELET_COORDINATE_HEX_DIGITS, '0')
      }),
    )
    .join('')
  return `hex"${hexDigits}"`
}

function quotePathData(shapes: Parameters<typeof formatPathData>[0]): string {
  return quoteSolidityString(formatPathData(shapes))
}

function toHexColor(color: string): string {
  if (!/^#[0-9A-F]{6}$/.test(color)) throw new Error(`Not an #RRGGBB colour: ${color}`)
  return `0x${color.slice(1)}`
}

function readTemplateArtFunctionName(template: SneakerTemplate): string {
  return `read${template.label}Art`
}

function readOptionValueFunctionName(template: SneakerTemplate): string {
  return `read${template.label}OptionValue`
}
