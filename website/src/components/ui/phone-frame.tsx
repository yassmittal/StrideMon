import { getImageProps } from 'next/image'
import {
  type Screenshot,
  screenshotHeightPixels,
  screenshotWidthPixels,
} from '@/content/screenshots'
import { hasPublicFile } from '@/lib/read-public-file'
import { loadAvifScreenshot } from '@/lib/screenshot-image-loader'

type PhoneFrameProps = {
  screenshot: Screenshot
  sizes: string
  isPriority?: boolean
  className?: string
}

// A plain phone frame around a screenshot. A missing file fails the build rather than shipping a
// broken image.
export function PhoneFrame({
  screenshot,
  sizes,
  isPriority = false,
  className = '',
}: PhoneFrameProps) {
  const sourcePath = `/screenshots/${screenshot.fileName}`
  if (!hasPublicFile(sourcePath)) {
    throw new Error(`Missing screenshot: public${sourcePath}`)
  }
  return (
    <div className={`rounded-[28px] bg-ink p-[5px] ${className}`}>
      <ScreenshotPicture
        sourcePath={sourcePath}
        alt={screenshot.alt}
        sizes={sizes}
        isPriority={isPriority}
      />
    </div>
  )
}

type ScreenshotPictureProps = {
  sourcePath: string
  alt: string
  sizes: string
  isPriority: boolean
}

function ScreenshotPicture({ sourcePath, alt, sizes, isPriority }: ScreenshotPictureProps) {
  const sharedProps = {
    src: sourcePath,
    alt,
    sizes,
    width: screenshotWidthPixels,
    height: screenshotHeightPixels,
    // The hero image is the likely LCP: fetch it first. Everything else loads lazily.
    loading: isPriority ? 'eager' : 'lazy',
    fetchPriority: isPriority ? 'high' : 'auto',
  } as const
  const {
    props: { srcSet: avifSourceSet },
  } = getImageProps({ ...sharedProps, loader: loadAvifScreenshot })
  const { props: imageProps } = getImageProps(sharedProps)
  return (
    <picture>
      <source type="image/avif" srcSet={avifSourceSet} sizes={sizes} />
      {/* biome-ignore lint/a11y/useAltText: `alt` is inside imageProps from getImageProps. */}
      <img {...imageProps} className="block h-auto w-full rounded-[23px]" />
    </picture>
  )
}
