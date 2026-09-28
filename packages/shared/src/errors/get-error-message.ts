/** Turns a caught value (always `unknown` in TypeScript) into a readable message. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}
