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

// A plain phone frame around a screenshot. A missing PNG shows a labelled placeholder of the same
// size, so dropping the file in later changes nothing around it.
export function PhoneFrame({
  screenshot,
  sizes,
  isPriority = false,
  className = '',
}: PhoneFrameProps) {
  const sourcePath = `/screenshots/${screenshot.fileName}`
  return (
    <div className={`rounded-[28px] bg-ink p-[5px] ${className}`}>
      {hasPublicFile(sourcePath) ? (
        <ScreenshotPicture
          sourcePath={sourcePath}
          alt={screenshot.alt}
          sizes={sizes}
          isPriority={isPriority}
        />
      ) : (
        <ScreenshotPlaceholder screenshot={screenshot} />
      )}
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

function ScreenshotPlaceholder({ screenshot }: { screenshot: Screenshot }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder for the ${screenshot.screenName} screen`}
      className="flex aspect-[1080/2340] w-full flex-col items-center justify-center gap-2 rounded-[23px] bg-surface-muted p-4 text-center"
    >
      <span className="text-label font-medium uppercase tracking-[0.08em] text-ink-secondary-small">
        Screenshot
      </span>
      <span className="text-base text-ink">{screenshot.screenName}</span>
      <span className="font-mono text-[0.625rem] break-all text-ink-secondary-small">
        {screenshot.fileName}
      </span>
    </div>
  )
}
