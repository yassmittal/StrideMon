import { createElement, type ReactNode, useEffect, useState } from 'react'
import { cancelRender, continueRender, delayRender } from 'remotion'

// The Founding Pass art is the contract renderer's own SVG. These helpers load it and turn it into
// React elements, so a scene can animate parts of it (reveal, draw, hide while cropping). They never
// change a path, a coordinate or a colour (DESIGNS_FROZEN_ON).

/** Loads the given SVG files once, holding the render until they're in. Keyed by path. */
export function useSvgMarkups(paths: readonly string[]): ReadonlyMap<string, string> | null {
  const [markups, setMarkups] = useState<ReadonlyMap<string, string> | null>(null)
  const [delayHandle] = useState(() => delayRender('Loading the Founding Pass art'))
  const pathsKey = paths.join('|')

  useEffect(() => {
    Promise.all(
      pathsKey.split('|').map(async (path) => {
        const response = await fetch(path)
        if (!response.ok) {
          throw new Error(`Missing pass art: ${path}. Run bash scripts/copy-pass-art.sh`)
        }
        return [path, await response.text()] as const
      }),
    )
      .then((entries) => {
        setMarkups(new Map(entries))
        continueRender(delayHandle)
      })
      .catch((error: unknown) => cancelRender(error))
  }, [pathsKey, delayHandle])

  return markups
}

const parsedSvgCache = new Map<string, Element>()

/** The markup's root `<svg>`, parsed once per markup. Read it, never mutate it. */
export function parseSvgMarkup(markup: string): Element {
  const cached = parsedSvgCache.get(markup)
  if (cached !== undefined) return cached
  const svgElement = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  parsedSvgCache.set(markup, svgElement)
  return svgElement
}

/**
 * What a scene wants done with one element: leave it (`undefined`), hide it (`null`), add props
 * (an object: animation only, such as opacity or a dash offset), or draw something in its place
 * (`replace`, given the element's own React rendering).
 */
export type SvgElementDecoration =
  | null
  | undefined
  | { props?: Record<string, string | number>; replace?: (rendered: ReactNode) => ReactNode }

export type SvgElementDecorator = (element: Element) => SvgElementDecoration

/** One element and its children as React, in the file's own order and attributes. */
export function renderSvgElement(
  element: Element,
  key: string,
  decorate?: SvgElementDecorator,
): ReactNode {
  const decoration = decorate?.(element)
  if (decoration === null) return null
  const rendered = createElement(
    element.tagName,
    { ...readSvgAttributes(element), ...decoration?.props, key },
    element.children.length > 0
      ? [...element.children].map((child, childIndex) =>
          renderSvgElement(child, `${key}-${childIndex}`, decorate),
        )
      : element.textContent,
  )
  return decoration?.replace === undefined ? rendered : decoration.replace(rendered)
}

type SvgArtProps = {
  markup: string
  width: number
  /** A crop of the file's own viewBox, as "x y width height". The art inside is unchanged. */
  viewBox?: string
  decorate?: SvgElementDecorator
  /** Extra layers drawn over the art, in its coordinates. */
  children?: ReactNode
}

/** The art at a width, keeping its aspect ratio (or the crop's). */
export function SvgArt({ markup, width, viewBox, decorate, children }: SvgArtProps) {
  const svgElement = parseSvgMarkup(markup)
  const shownViewBox = viewBox ?? svgElement.getAttribute('viewBox') ?? '0 0 1000 1000'
  const [, , viewBoxWidth = 1, viewBoxHeight = 1] = shownViewBox.split(' ').map(Number)
  return createElement(
    'svg',
    {
      ...readSvgAttributes(svgElement),
      viewBox: shownViewBox,
      width,
      height: (width * viewBoxHeight) / viewBoxWidth,
      style: { display: 'block' },
    },
    [...svgElement.children].map((child, childIndex) =>
      renderSvgElement(child, `art-${childIndex}`, decorate),
    ),
    children,
  )
}

/** SVG attributes as React props: `stroke-width` → `strokeWidth`. */
export function readSvgAttributes(element: Element): Record<string, string> {
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

/** A path's subpaths, each starting at its own M. */
export function splitSubpaths(pathData: string): string[] {
  return pathData.match(/M[^M]*/g) ?? []
}
