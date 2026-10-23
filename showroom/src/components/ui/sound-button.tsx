'use client'

import { soundCopy } from '@/content/showroom'
import { useSmallStore } from '@/lib/create-small-store'
import { soundEngine, soundStore } from '@/sound/sound-engine'

// The one sound button (D-070), top right: three small bars that sway while the music plays and
// lie flat when it doesn't. Round, dark and quiet like the walk's buttons.

const BAR_HEIGHTS_PIXELS = [7, 12, 9] as const

export function SoundButton() {
  const isPlaying = useSmallStore(soundStore, (state) => state.isPlaying)
  return (
    <button
      type="button"
      data-sound-button
      aria-label={soundCopy.label}
      aria-pressed={isPlaying}
      title={isPlaying ? soundCopy.turnOff : soundCopy.turnOn}
      onClick={() => soundEngine.toggle()}
      className="pointer-events-auto absolute top-[max(16px,env(safe-area-inset-top))] right-4 z-10 flex size-11 items-center justify-center gap-[3px] rounded-full border border-hairline-on-dark bg-dark-panel/70 text-on-dark backdrop-blur-md transition-colors duration-300 ease-standard hover:bg-dark-panel active:bg-black sm:top-6 sm:right-6"
    >
      {BAR_HEIGHTS_PIXELS.map((heightPixels, index) => (
        <span
          key={heightPixels}
          aria-hidden="true"
          className={`sound-bar block w-[2px] rounded-full bg-current transition-[height,opacity] duration-500 ease-standard ${isPlaying ? 'sound-bar-playing opacity-100' : 'opacity-60'}`}
          style={{
            height: isPlaying ? heightPixels : 2,
            animationDelay: `${index * -0.35}s`,
          }}
        />
      ))}
    </button>
  )
}
