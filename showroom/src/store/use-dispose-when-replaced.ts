import { useEffect } from 'react'
import type { Texture } from 'three'

// Disposes a texture once React has committed whatever replaced it (another texture, or nothing),
// never while a material still draws it. A texture disposed and then drawn one more frame is
// uploaded again, and that copy is never freed: Part 4 found look closer leaking about 13 MB a
// look on a phone that way.

export function useDisposeWhenReplaced(texture: Texture | null): void {
  useEffect(() => {
    if (texture === null) return
    // A cleanup runs after the commit that swapped the material's map, or on unmount.
    return () => texture.dispose()
  }, [texture])
}
