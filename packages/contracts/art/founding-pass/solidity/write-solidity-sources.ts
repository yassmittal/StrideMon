import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Design } from '../art-system/types'
import { buildArtDataSource } from './build-art-data-source'
import { buildDesignsSource } from './build-designs-source'
import { assertSolidityOrderMatches } from './solidity-order'

const CONTRACTS_DIRECTORY = fileURLToPath(new URL('../../../', import.meta.url))
const GENERATED_SOURCE_DIRECTORY = join(CONTRACTS_DIRECTORY, 'src/founding-pass-art')

/**
 * Writes the generated Solidity (the art data and the design table) and formats it with
 * `forge fmt`, so a rebuild with nothing changed leaves the files exactly as they were.
 */
export async function writeSoliditySources({
  designs,
  statusLine,
}: {
  designs: readonly Design[]
  statusLine: string
}): Promise<void> {
  assertSolidityOrderMatches()
  const sourceFiles = [
    { fileName: 'FoundingPassArtData.sol', source: buildArtDataSource() },
    { fileName: 'FoundingPassDesigns.sol', source: buildDesignsSource({ designs, statusLine }) },
  ]
  const sourcePaths = sourceFiles.map(({ fileName }) => join(GENERATED_SOURCE_DIRECTORY, fileName))
  for (const [index, { source }] of sourceFiles.entries()) {
    const sourcePath = sourcePaths[index]
    if (sourcePath !== undefined) await writeFile(sourcePath, source)
  }
  runInContracts(['forge', 'fmt', ...sourcePaths])
}

/** Runs a Foundry command from `packages/contracts`, and throws with its output if it fails. */
export function runInContracts(command: readonly string[]): string {
  const result = Bun.spawnSync([...command], { cwd: CONTRACTS_DIRECTORY })
  if (result.exitCode !== 0) {
    throw new Error(
      `${command.join(' ')} failed:\n${result.stdout.toString()}${result.stderr.toString()}`,
    )
  }
  return result.stdout.toString()
}
