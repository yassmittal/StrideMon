/** `#0137`, as the card and the website write it. */
export function formatPassNumber(designNumber: number): string {
  return `#${String(designNumber).padStart(4, '0')}`
}
