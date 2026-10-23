import { describe, expect, test } from 'bun:test'
import { LOADING_WEIGHTS, type LoadingState, readLoadingProgress } from './loading-store'

// The loader's progress is real: each step counts once, and the lime stroke (the last 15%) waits
// for the shaders.

const everythingButTheScene: LoadingState = {
  phase: 'loading',
  isPageCodeLoaded: true,
  isStoreCodeLoaded: true,
  loadedFileCount: 66,
  totalFileCount: 66,
  isSceneWarm: false,
}

describe('readLoadingProgress', () => {
  test('the weights add up to the whole mark', () => {
    const total = Object.values(LOADING_WEIGHTS).reduce((sum, weight) => sum + weight, 0)
    expect(total).toBeCloseTo(1)
  })

  test('the lime stroke starts only once the scene is warm', () => {
    expect(readLoadingProgress(everythingButTheScene)).toBeCloseTo(0.85)
    expect(readLoadingProgress({ ...everythingButTheScene, isSceneWarm: true })).toBeCloseTo(1)
  })

  test('files count one by one, never past their share', () => {
    const halfTheFiles = { ...everythingButTheScene, loadedFileCount: 33 }
    expect(readLoadingProgress(halfTheFiles)).toBeCloseTo(0.85 - LOADING_WEIGHTS.files / 2)
    const tooMany = { ...everythingButTheScene, loadedFileCount: 70 }
    expect(readLoadingProgress(tooMany)).toBeCloseTo(0.85)
  })
})
