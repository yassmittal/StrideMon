type DemoVideoPlayerProps = {
  filePath: string
  posterPath?: string
  widthPixels: number
  heightPixels: number
  label: string
  className?: string
}

// The demo in the same plain phone frame as the screenshots. Muted, `preload="none"`: nothing but
// the poster loads until the visitor presses play.
export function DemoVideoPlayer({
  filePath,
  posterPath,
  widthPixels,
  heightPixels,
  label,
  className = '',
}: DemoVideoPlayerProps) {
  return (
    <div className={`rounded-[28px] bg-ink p-[5px] ${className}`}>
      <video
        className="block h-auto w-full rounded-[23px] bg-ink"
        src={filePath}
        poster={posterPath}
        width={widthPixels}
        height={heightPixels}
        aria-label={label}
        preload="none"
        controls
        muted
        playsInline
      />
    </div>
  )
}
