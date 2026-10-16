import { type Hit, type HitKind, hits } from './hits'

// Reading the hit map. The film names hits ("the clap on beat 41"), never frames, so every cut
// and move sits on something in the music (docs/sneaker-drop-video-prompt.md §2).

/** The hit of this kind on this beat (fractions are 16ths: 7.75 is the last 16th of beat 7). */
export function findHit({ beat, kind }: { beat: number; kind: HitKind }): Hit {
  const sixteenth = Math.round(beat * 4)
  const hit = hits.find((candidate) => candidate.sixteenth === sixteenth && candidate.kind === kind)
  if (hit === undefined) throw new Error(`No ${kind} on beat ${beat} in hits.ts`)
  return hit
}

/** The frame of the hit of this kind on this beat. */
export function readHitFrame(query: { beat: number; kind: HitKind }): number {
  return findHit(query).frame
}

/** Every hit from `fromBeat` up to (not including) `toBeat`, of these kinds, in order. */
export function readHitsBetween({
  fromBeat,
  toBeat,
  kinds,
}: {
  fromBeat: number
  toBeat: number
  kinds: readonly HitKind[]
}): Hit[] {
  return hits.filter(
    (hit) =>
      hit.sixteenth >= fromBeat * 4 && hit.sixteenth < toBeat * 4 && kinds.includes(hit.kind),
  )
}

/** The 16th's beat, for naming a hit back in plain words. */
export function toBeat(hit: Hit): number {
  return hit.sixteenth / 4
}
