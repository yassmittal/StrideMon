import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Build-time only (Server Components and metadata routes): the site is a static export.
const publicDirectory = join(process.cwd(), 'public')

export function hasPublicFile(publicPath: string): boolean {
  return existsSync(join(publicDirectory, publicPath))
}

export function readPublicTextFile(publicPath: string): string {
  return readFileSync(join(publicDirectory, publicPath), 'utf8')
}
