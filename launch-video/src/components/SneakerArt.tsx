import { getLength } from '@remotion/paths'
import { createElement, type ReactNode, useEffect, useState } from 'react'
import {
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion'
import { easings } from '../theme'

// The art is SneakerArtRenderer's own output (public/sneaker/, read with eth_call, FACTS.md §8).
// This component only animates it; it never changes a coordinate or a colour.

const LINE_DRAW_DURATION_FRAMES = 40
const LINE_STAGGER_FRAMES = 3
const NEW_SPEED_LINE_DURATION_FRAMES = 24
const TEXT_FADE_DURATION_FRAMES = 12
// The lime starts once the white lines are mostly drawn.
const LIME_DELAY_AFTER_WHITE_FRAMES = 20
const LIME_COLOR = '#C1FF00'
const SPEED_LINE_STROKE_WIDTH = '1.5'

export function toSneakerArtFileName({ level, durability }: { level: number; durability: number }) {
  return `sneaker-0002-level-${String(level).padStart(2, '0')}-durability-${String(durability).padStart(3, '0')}.svg`
}

/** Loads the given art files once, holding the render until they're in. */
export function useSneakerArtMarkups(
  fileNames: readonly string[],
): ReadonlyMap<string, string> | null {
  const [markups, setMarkups] = useState<ReadonlyMap<string, string> | null>(null)
  const [delayHandle] = useState(() => delayRender('Loading the contract’s Sneaker art'))
  const fileNamesKey = fileNames.join(',')

  useEffect(() => {
    const requestedFileNames = fileNamesKey.split(',')
    Promise.all(
      requestedFileNames.map(async (fileName) => {
        const response = await fetch(staticFile(`sneaker/${fileName}`))
        if (!response.ok) throw new Error(`Missing Sneaker art: public/sneaker/${fileName}`)
        return [fileName, await response.text()] as const
      }),
    )
      .then((entries) => {
        setMarkups(new Map(entries))
        continueRender(delayHandle)
      })
      .catch((error: unknown) => cancelRender(error))
  }, [fileNamesKey, delayHandle])

  return markups
}

type SneakerArtProps = {
  markup: string
  size: number
  /** Lines draw in from this frame: white strokes first, then the lime accent, then the speed lines. */
  drawInStartFrame?: number
  /** The newest speed line draws in from this frame (a level-up). */
  newSpeedLineStartFrame?: number
  /** The panel's rounding, as the app's HeroPanel has. */
  borderRadius?: number
}

export function SneakerArt({
  markup,
  size,
  drawInStartFrame,
  newSpeedLineStartFrame,
  borderRadius = 0,
}: SneakerArtProps) {
  const frame = useCurrentFrame()
  const svgElement = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  const drawContext = buildDrawContext({
    svgElement,
    frame,
    drawInStartFrame,
    newSpeedLineStartFrame,
  })

  return (
    <div style={{ width: size, height: size, borderRadius, overflow: 'hidden' }}>
      {createElement(
        'svg',
        { ...readAttributes(svgElement), width: size, height: size },
        renderChildren(svgElement, drawContext, 'svg'),
      )}
    </div>
  )
}

type DrawContext = {
  frame: number
  drawInStartFrame: number | undefined
  newSpeedLineStartFrame: number | undefined
  whiteSubpathCount: number
  whiteSubpathIndex: number
}

function buildDrawContext({
  svgElement,
  frame,
  drawInStartFrame,
  newSpeedLineStartFrame,
}: {
  svgElement: Element
  frame: number
  drawInStartFrame: number | undefined
  newSpeedLineStartFrame: number | undefined
}): DrawContext {
  const whiteSubpathCount = [...svgElement.querySelectorAll('path')]
    .filter((pathElement) => !isLimePath(pathElement))
    .reduce(
      (count, pathElement) => count + splitSubpaths(pathElement.getAttribute('d') ?? '').length,
      0,
    )
  return {
    frame,
    drawInStartFrame,
    newSpeedLineStartFrame,
    whiteSubpathCount,
    whiteSubpathIndex: 0,
  }
}

function renderChildren(
  parentElement: Element,
  drawContext: DrawContext,
  parentKey: string,
): ReactNode[] {
  return [...parentElement.children].map((childElement, childIndex) =>
    renderElement(childElement, drawContext, `${parentKey}-${childIndex}`),
  )
}

function renderElement(element: Element, drawContext: DrawContext, key: string): ReactNode {
  const tagName = element.tagName
  if (tagName === 'path') return renderPath(element, drawContext, key)
  if (tagName === 'text') {
    return createElement(
      'text',
      { ...readAttributes(element), key, opacity: readTextOpacity(drawContext) },
      element.textContent,
    )
  }
  if (tagName === 'g' && element.getAttribute('fill') === LIME_COLOR) {
    return createElement(
      'g',
      { ...readAttributes(element), key, opacity: readLimeOpacity(drawContext) },
      renderChildren(element, drawContext, key),
    )
  }
  if (tagName === 'rect' && element.getAttribute('fill') === LIME_COLOR) {
    return createElement('rect', {
      ...readAttributes(element),
      key,
      ...readLimeBarStyle(element, drawContext),
    })
  }
  return createElement(
    tagName,
    { ...readAttributes(element), key },
    renderChildren(element, drawContext, key),
  )
}

/** Each subpath becomes its own path, so each can draw on its own. The geometry is unchanged. */
function renderPath(pathElement: Element, drawContext: DrawContext, key: string): ReactNode {
  const subpaths = splitSubpaths(pathElement.getAttribute('d') ?? '')
  const isLime = isLimePath(pathElement)
  const isSpeedLine = isLime && pathElement.getAttribute('stroke-width') === SPEED_LINE_STROKE_WIDTH

  return subpaths.map((subpath, subpathIndex) => {
    const progress = isLime
      ? readLimeSubpathProgress({
          drawContext,
          isSpeedLine,
          subpathIndex,
          subpathCount: subpaths.length,
        })
      : readWhiteSubpathProgress(drawContext, drawContext.whiteSubpathIndex++)
    const length = getLength(subpath)
    return createElement('path', {
      ...readAttributes(pathElement),
      key: `${key}-${subpathIndex}`,
      d: subpath,
      strokeDasharray: `${length} ${length}`,
      strokeDashoffset: length * (1 - progress),
      // A round cap still paints a dot at zero length.
      opacity: progress === 0 ? 0 : 1,
    })
  })
}

function readWhiteSubpathProgress(drawContext: DrawContext, whiteSubpathIndex: number): number {
  if (drawContext.drawInStartFrame === undefined) return 1
  const startFrame = drawContext.drawInStartFrame + whiteSubpathIndex * LINE_STAGGER_FRAMES
  return interpolate(
    drawContext.frame,
    [startFrame, startFrame + LINE_DRAW_DURATION_FRAMES],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easings.standard,
    },
  )
}

function readLimeSubpathProgress({
  drawContext,
  isSpeedLine,
  subpathIndex,
  subpathCount,
}: {
  drawContext: DrawContext
  isSpeedLine: boolean
  subpathIndex: number
  subpathCount: number
}): number {
  const { frame, newSpeedLineStartFrame } = drawContext
  if (isSpeedLine && newSpeedLineStartFrame !== undefined && subpathIndex === subpathCount - 1) {
    return interpolate(
      frame,
      [newSpeedLineStartFrame, newSpeedLineStartFrame + NEW_SPEED_LINE_DURATION_FRAMES],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: easings.outExpo,
      },
    )
  }
  const limeStartFrame = readLimeStartFrame(drawContext)
  if (limeStartFrame === undefined) return 1
  // The accent stripe first, then the speed lines, one after another.
  const order = isSpeedLine ? 1 + subpathIndex : 0
  const startFrame = limeStartFrame + order * LINE_STAGGER_FRAMES * 2
  return interpolate(frame, [startFrame, startFrame + LINE_DRAW_DURATION_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easings.standard,
  })
}

function readLimeStartFrame(drawContext: DrawContext): number | undefined {
  if (drawContext.drawInStartFrame === undefined) return undefined
  return (
    drawContext.drawInStartFrame +
    drawContext.whiteSubpathCount * LINE_STAGGER_FRAMES +
    LIME_DELAY_AFTER_WHITE_FRAMES
  )
}

function readTextOpacity(drawContext: DrawContext): number {
  if (drawContext.drawInStartFrame === undefined) return 1
  return interpolate(
    drawContext.frame,
    [drawContext.drawInStartFrame, drawContext.drawInStartFrame + TEXT_FADE_DURATION_FRAMES],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easings.standard },
  )
}

/** The lime level ticks arrive with the lime lines. */
function readLimeOpacity(drawContext: DrawContext): number {
  const limeStartFrame = readLimeStartFrame(drawContext)
  if (limeStartFrame === undefined) return 1
  return drawContext.frame >= limeStartFrame ? 1 : 0
}

/** The lime durability bar grows from the left with the lime lines. */
function readLimeBarStyle(rectElement: Element, drawContext: DrawContext) {
  const limeStartFrame = readLimeStartFrame(drawContext)
  const fullWidth = Number(rectElement.getAttribute('width') ?? 0)
  if (limeStartFrame === undefined) return { width: fullWidth }
  const growth = interpolate(
    drawContext.frame,
    [limeStartFrame, limeStartFrame + LINE_DRAW_DURATION_FRAMES],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: easings.emphasized,
    },
  )
  return { width: fullWidth * growth }
}

function isLimePath(pathElement: Element): boolean {
  return pathElement.getAttribute('stroke') === LIME_COLOR
}

function splitSubpaths(pathData: string): string[] {
  return pathData.match(/M[^M]*/g) ?? []
}

/** SVG attributes as React props: `stroke-width` → `strokeWidth`. */
function readAttributes(element: Element): Record<string, string> {
  const attributes: Record<string, string> = {}
  for (const attribute of element.attributes) {
    if (attribute.name === 'xmlns') continue
    const propName = attribute.name.replace(/-([a-z])/g, (_match, letter: string) =>
      letter.toUpperCase(),
    )
    attributes[propName] = attribute.value
  }
  return attributes
}
