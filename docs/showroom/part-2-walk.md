# Part 2: The arrival and the walk

**Goal:** a visitor arrives on the night street, watches the store's lights come on, steps
inside, and walks the five stops by scroll, swipe, keys, arrows or dots, looking around a little
at each. It works with a thumb on a portrait phone as well as on a laptop.

## Read first

- The brief §3, §4, §6.1 and §8; the README's rules ("Nobody gets stuck", the words)
- `showroom/README.md`, `showroom/src/store/` (Part 1), the dev view switch's poses
- `launch-video/src/showroom/camera.ts` and `timeline.ts` (the film's `darkFront` → `litFront`)
- pmndrs `camera-scroll` and `image-gallery` (`references.md`)
- `docs/architecture/design-system.md` (pills, easing)

## Build

1. **The stops**, in `src/visit/`: the street, then **1** the lightbox, **2** the Rare wall, **3**
   the Legendary corner, **4** the Founding Pass wall, **5** the Sneaker wall and the stand. Each
   stop names its **subject** (a rectangle in the world, for example the lightbox) and a viewing
   direction, and the camera **frames the subject for the screen's shape**, so a portrait phone
   and a wide laptop both see the whole thing. Level camera, no roll. Every number lives in one
   file.
2. **The arrival:** the street with the store dark (the film's `darkFront` brightness), then its
   lights come on over a few seconds: the downlights row by row from the glass to the back, then
   the lightboxes and the LEDs, eased, nothing flickers. The camera eases from a low view of the
   sign to the whole front. A line ("The StrideMon store. 1,000 Founding Pass Sneakers, free to
   mint, can't be sent or sold.") and **"Step inside"** appear. Step inside walks through the glass
   to stop 1. A second visit in the same tab starts lit (session storage, read and written in
   try/catch).
3. **The moves:** stop to stop on a smooth path that stays inside the room and clear of the
   table and counters (through a waypoint in the open floor if needed), about 1.5 to 2.5 s by
   distance, with weight and no overshoot. Input during a move queues at most one more step.
4. **Input:** a wheel or trackpad step and a vertical swipe move one stop (normalised, with a
   short lock so one flick is one step); ↑ ↓ and the on-screen arrows do the same; the dots jump
   to any stop. A horizontal drag **looks around** (about ±20° yaw, ±8° pitch, damped); on touch,
   a gesture's main axis after about 10 px decides between the two. On a laptop the pointer does
   a smaller look-around without a press.
5. **Reduced motion:** cuts with a short fade, the lights come on without the build-up, no
   pointer drift.
6. **The DOM layer:** the header ("Get your Founding Pass" with "Free. Can't be sent or sold.",
   "Join the waitlist", both to `stridemon.xyz` with `?source=showroom`), the where-you-are line
   ("2 of 5 · The Rare wall"), the next step ("Swipe for the Legendary corner"), the dots and
   arrows, a Help link to `stridemon.xyz/help`, and a one-time hint: "Scroll or swipe to walk".
   Lusion look, quiet, dark pills on the night store.
7. **Delete the dev view switch.** The stops replace it.

## Nobody gets stuck

- Every stop says where you are and what's next; the last one says how to go back to the start.
- The where-you-are line is right mid-move too, and it's an `aria-live` region.
- No input for a few seconds after arriving shows the hint again, once.
- Keyboard only: Tab reaches every control, focus is always visible, ↑ ↓ walk.

## Done when

- Yash walks the whole store on his phone and the laptop and approves the arrival and the walk.
- The frame rate holds through every move at each device's tier (brief §8).
- Screenshots of the street (dark and lit) and each stop, portrait and landscape, are in
  `docs/showroom/look/`.
- Typecheck, lint and tests pass.

Mark Part 2 **Done**, then stop.
