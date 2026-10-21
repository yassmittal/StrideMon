# Part 2: The building

**Goal:** the empty building is beautiful and easy to walk: the doors, the nave, ten chapels and
the apse, lit in the picked mood, with the guided walk working by scroll, swipe and keys. Only the
ten Legendaries and the apse Sneaker are in place; the shelves stay empty until Part 3.

## Read first

- The brief §3, §4, §6 and §8; `references.md` (open Cartier's site and the Kith and Nike
  photos; read pmndrs `camera-scroll` and `image-gallery`)
- `showroom/src/sneakers/sneaker-look.ts` (Part 1's pick) and `showroom/README.md`
- `launch-video/src/showroom/components/ShowroomWorld.tsx` (lit panels, glow sprites, LED lines)

## Build

1. **The floor plan:** `src/world/floor-plan.ts` holds every size and position in metres: the
   nave, the ten chapels (in the design table's template order), the apse, the doors, the walk's
   stops and the shelf grid each chapel will have in Part 3. Everything else reads from it.
2. **The architecture, in code:** the nave (floor, walls, pilasters between the chapel doorways,
   the dark coffered vault), one chapel component used ten times with a mood per template
   (floor material, light temperature: brief §6.2), the apse with its oculus, and the doors.
   Simple shapes; proportion, material and light do the work. Merge static meshes per material.
3. **Materials:** CC0 textures (ambientCG, Poly Haven) at the smallest size that holds up on a
   laptop, compressed (KTX2 or WebP: pick by the budget, brief §8). Credit them in
   `showroom/CREDITS.md`.
4. **Light:** an `Environment` of `Lightformer`s for the reflections; warm pools on the plinths
   and cases; the wall wash in the nave; the uplight on the (empty) vault; the oculus's shaft of
   light (a soft additive cone, like the film's glows); the lime line across each chapel
   threshold. Soft contact shadows under every object that stands on a floor. The nave floor's
   blurred reflection only on the laptop tier.
5. **The walk** (brief §4): a camera path from the doors through the five nave stops to the apse,
   and into and around each chapel. Damped motion with weight (nothing overshoots). Input:
   wheel and trackpad (normalised), touch swipes, ↑ ↓ ← →, Enter, Esc. It settles on the nearest
   stop after input ends. On a laptop the pointer turns the view a few degrees. With
   `prefers-reduced-motion`, short fades instead of glides.
6. **The DOM layer:** where you are ("The hall · Court and Hoop", "Court · 100 Sneakers"), "Back
   to the hall" in every chapel, the map pill with the floor plan as a small line drawing (tap a
   room to go), and a one-time hint: "Scroll or swipe to walk". Lusion look, quiet.
7. **Placeholders:** each chapel's Legendary in its glass case (2×, full relief), and a Sneaker on
   the apse plinth (3×). Empty steel shelves on the chapel walls.
8. **Delete `/look`.** Its numbers live on in `sneaker-look.ts`.

## Nobody gets stuck

- From anywhere, one tap gets you back to the hall, and the map gets you to any room.
- The "where you are" line is always right, including mid-glide.
- Arriving with no input for a few seconds shows the hint again, once.

## Done when

- Yash walks the whole building on the laptop and the phone and approves the nave, a chapel and
  the apse.
- 60 fps on the laptop and ≥ 50 fps on the phone, anywhere in the building; the download before
  the nave is walkable stays within the brief's §8.
- The stuck-point check is done; screenshots of the nave, a chapel and the apse are in
  `docs/showroom/look/`.
- Typecheck, lint and tests pass.

Mark Part 2 **Done**, then stop.
