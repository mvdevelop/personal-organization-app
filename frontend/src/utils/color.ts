/**
 * Determine if a hex color is "light" (luminance > 0.5).
 * Used to pick contrasting text color over colored backgrounds.
 */
export function isLightColor(hex: string): boolean {
  if (!hex || hex === '#ffffff') return true
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5
}
