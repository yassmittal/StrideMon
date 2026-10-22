# Part 4: Finish and fallbacks

**Goal:** the showroom feels finished from the first frame to the last: a loader worth watching,
the final light, smooth on weak devices, and a calm way forward for everyone it can't fully serve.

## Read first

- The brief §4, §6, §7.6, §8 and §9, and the README's rules
- `references.md` → Igloo Inc (speed on weak devices) and Oryzo (restraint)
- `website/src/app/icon.svg` (the line-Sneaker mark)
- `showroom/README.md` (the tiers' numbers from Part 1)

## Build

1. **The loader:** the line-Sneaker mark drawn stroke by stroke, tied to real loading progress
   (never a fake timer), the lime stroke last. Shaders compile while it draws (`gl.compile`).
   It's plain HTML and SVG in the page, so it paints before any script.
2. **The last light pass:** one more look at the street and each stop on the phone and the
   laptop. Bloom, reflections, shadows, AO and grain all quiet (brief §6.3); nothing on the
   "not used" list.
3. **The tiers, tuned:** `PerformanceMonitor` steps down in the brief's §7.6 order and never
   flickers between tiers. Check with Chrome's CPU throttled ×4 and on the phone; watch draw calls
   and texture memory. Write the measured numbers into `showroom/README.md`.
4. **Fallbacks:**
   - **No WebGL, or the context is lost:** a still picture of the lit store (rendered from the
     showroom itself, portrait and landscape, small WebP files), "Your browser can't show the 3D
     store", and the same links: browse all 1,000 on `stridemon.xyz/pass`, Get your Founding Pass
     (free, can't be sent or sold), Join the waitlist, Help. A lost context offers "Try again".
   - **Slow network:** after 8 seconds the loader adds "Still loading… the collection is also at
     stridemon.xyz/pass" with the link.
   - **The API down:** Part 3's quiet line.
5. **Accessibility:** reduced motion works everywhere; the DOM layer's contrast passes on the night
   store; the hidden list and the `aria-live` line from Parts 2 and 3 still read right.
6. **Share card and title:** the page's title, description and Open Graph image (a still of the lit
   store, 1200 × 630), the website's `buildPageMetadata` pattern copied by hand.
7. **Lighthouse** on the page: accessibility and best practices ≥ 95.

## The stuck-point check

Walk every path on the phone and the laptop and confirm each one ends in a next step: a first
visit, a repeat visit, a deep link, a bad deep link, slow 3G (Chrome's throttling), no WebGL
(Chrome with `--disable-webgl`), the API down, reduced motion, keyboard only, a screen reader on
the list.

## Done when

- The stuck-point check passes.
- Yash approves the arrival and the whole visit on his phone and the laptop.
- The brief's §8 budgets are measured and met, and written into `showroom/README.md`.
- Typecheck, lint and tests pass.

Mark Part 4 **Done**, then stop.
