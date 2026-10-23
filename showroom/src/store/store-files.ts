import { loadingStore, showLoadingFallback } from '@/lib/loading-store'
import { loadSneakerImages, type SneakerImages } from './load-sneaker-images'
import { STORE_DESIGN_NUMBERS } from './sneaker-placements'
import { loadStoreFonts, readStoreFontFamilies, type StoreFontFamilies } from './store-fonts'

// The store's files: the 65 Sneakers it shows and the signs' fonts. They start loading as soon as
// the page runs, alongside three.js (the canvas chunk), not after it, and each one counts in the
// loader's progress. No three.js here, so this stays in the page's own small chunk.

export type StoreFiles = { fontFamilies: StoreFontFamilies; sneakerImages: SneakerImages }

/** The fonts count as one file in the progress. */
const FONT_FILE_COUNT = 1

let storeFilesPromise: Promise<StoreFiles> | null = null

/** Starts loading once; every later call gets the same files. */
export function loadStoreFiles(): Promise<StoreFiles> {
  if (storeFilesPromise !== null) return storeFilesPromise
  loadingStore.update({ totalFileCount: STORE_DESIGN_NUMBERS.length + FONT_FILE_COUNT })
  const countLoadedFile = () =>
    loadingStore.update({ loadedFileCount: loadingStore.read().loadedFileCount + 1 })
  const fontFamilies = readStoreFontFamilies()
  storeFilesPromise = Promise.all([
    loadSneakerImages({ designNumbers: STORE_DESIGN_NUMBERS, onFileLoaded: countLoadedFile }),
    loadStoreFonts(fontFamilies).then(countLoadedFile),
  ]).then(([sneakerImages]) => ({ fontFamilies, sneakerImages }))
  storeFilesPromise.catch((error: unknown) => {
    console.error('The showroom could not load its Sneakers', error)
    showLoadingFallback('filesFailed')
  })
  return storeFilesPromise
}
