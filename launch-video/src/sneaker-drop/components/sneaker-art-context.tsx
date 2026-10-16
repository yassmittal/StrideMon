import { createContext, type ReactNode, useContext } from 'react'
import { useSvgMarkups } from '../../components/svg-markup'
import { LEGENDARY_FOUNDER_SNEAKER_PATH, SNEAKER_DROP_SVG_PATHS, toLacedSneakerPath } from '../art'

// The film loads every SVG it draws once, holding the render until they're in, and every scene
// reads them from here.

const SneakerArtContext = createContext<ReadonlyMap<string, string> | null>(null)

const ALL_PATHS = [...SNEAKER_DROP_SVG_PATHS, LEGENDARY_FOUNDER_SNEAKER_PATH]

export function SneakerArtProvider({ children }: { children: ReactNode }) {
  const markups = useSvgMarkups(ALL_PATHS)
  if (markups === null) return null
  return <SneakerArtContext.Provider value={markups}>{children}</SneakerArtContext.Provider>
}

/** A laced Sneaker's markup. Throws if the film didn't load it (add it to art.ts). */
export function useLacedSneakerMarkup(designNumber: number): string {
  return useMarkup(toLacedSneakerPath(designNumber))
}

export function useLegendaryFounderSneakerMarkup(): string {
  return useMarkup(LEGENDARY_FOUNDER_SNEAKER_PATH)
}

function useMarkup(path: string): string {
  const markups = useContext(SneakerArtContext)
  const markup = markups?.get(path)
  if (markup === undefined) throw new Error(`Sneaker art not loaded: ${path}`)
  return markup
}
