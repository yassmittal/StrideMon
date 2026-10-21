# Part 5: Finish

**Goal:** the showroom feels finished from the first frame to the last: a beautiful arrival, the
final light, smooth on weak devices, and a calm way forward for everyone it can't fully serve.

## Read first

- The brief §4, §6, §8 and §9, and the README's rules
- `references.md` → Igloo Inc (speed on weak devices) and Oryzo (restraint)
- `website/src/app/icon.svg` (the line-Sneaker mark)
- `showroom/README.md`, `showroom/src/world/floor-plan.ts`, `showroom/src/sneakers/sneaker-look.ts`

## Build

1. **The arrival:** the loader draws the line-Sneaker mark stroke by stroke, tied to real loading
   progress (never a fake timer), with the lime stroke last. Shaders compile while it draws
   (`gl.compile`). Then the doors open and the camera steps into the nave, in about a second.
   A repeat visit in the same tab skips the doors (session storage, read and written in
   try/catch).
2. **The last light pass:** one more look at each space in the picked mood. Post-processing, all
   of it quiet: anti-aliasing, bloom only on what gives off light (the lime lines, the oculus,
   the case bases), ambient occlusion on the laptop tier, depth of field only up close, a faint
   vignette. No chromatic aberration, grain, lens flares or glitches.
3. **Speed tiers:** drei's `PerformanceMonitor` steps down in the brief's §8 order and never
   flickers between tiers. Check with Chrome's CPU throttled ×4 and on the phone; watch texture
   memory. Write the measured numbers into `showroom/README.md`.
4. **Fallbacks:**
   - **No WebGL, or the context is lost:** the plain page from the brief's §8, with the
     drawings as lazy images (`public/sneakers/laced/`) linking to their `/pass` pages
   - **Slow network:** after 8 seconds the loader adds "Still loading… the gallery is also at
     stridemon.xyz/pass" with the link
   - **The API down:** Part 3's quiet line
5. **Accessibility:** a hidden DOM list mirrors the Sneakers in the current room, reachable by
   keyboard and screen readers; the "where you are" line is an `aria-live` region; reduced motion
   works everywhere; the DOM layer's contrast passes.
6. **Sound:** only if Part 0 said yes (the default is no).
7. **Lighthouse** on the page shell: accessibility and best practices ≥ 95.

If the building still looks flat after this (no bounce light between the walls, shadows too
even), show Yash a screenshot and propose Part 5b. Don't start it.

## The stuck-point check

Walk every path on the phone and the laptop and confirm each one ends in a next step: first
visit, repeat visit, a deep link, a bad deep link, slow 3G (Chrome's throttling), no WebGL (Chrome
with `--disable-webgl`), the API down, reduced motion, keyboard only, a screen reader on the list.

## Done when

- The stuck-point check passes.
- Yash approves the arrival and the whole walk on his phone and the laptop.
- The brief's §8 budgets are measured and met, and written into `showroom/README.md`.
- Typecheck, lint and tests pass.

Mark Part 5 **Done**, then stop.
