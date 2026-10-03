# Design System

StrideMon's visual language is taken from **[lusion.co](https://lusion.co)**
(Lusion, the award-winning 3D web studio). The values below are **not guesses**.
They were read on 2026-09-29 from Lusion's production stylesheet
(`/_astro/about.CNa9RfUh.css`), from its WebGL bundle (for colors the canvas
paints), and from computed styles in a real browser at 1440 × 900 and 390 × 844.

**When:** this is applied in **Phase 8** (visual design pass, see
[`../phases/phase-08-demo-hardening.md`](../phases/phase-08-demo-hardening.md)).
Until then, `apps/mobile/src/theme/` keeps its plain palette and nothing in
code changes. Phase 8 only touches `theme/`, `components/ui` and the feature
components' styles (see [`mobile-app.md`](mobile-app.md) → Styling).

How to read this doc:

- **Lusion** columns hold the site's exact CSS, including its responsive units.
- **Phone** columns hold what that CSS computes to at a 390 pt wide screen, which is
  the reference width for the mobile app.
- **Token** is the name and value we put in `src/theme/`. When a value is not on
  Lusion's site and we had to choose one, it is marked **derived**.

---

## 1. What makes it look like Lusion

1. **A cool off-white page (`#F0F1FA`)**, not pure white. Pure white is kept for
   floating things: pills, cards and menu panels.
2. **Two weights only.** Aeonik Regular (400) is used for everything readable,
   at any size. Aeonik Medium (500) is used only for UPPERCASE buttons and labels.
   There is no bold anywhere.
3. **Huge headlines with tight tracking.** Display type is 15 to 20% of the
   screen width, with a line height of 0.9 to 1.0 and a letter spacing of −0.01 to −0.02 em.
4. **Tiny uppercase metadata** between items, separated by bullets:
   `CONCEPT • WEB • DESIGN • 3D`.
5. **Pill buttons with a dot.** A small dot sits next to the label. On hover or
   press, the dot scales up to fill the pill in electric blue (`#1A2FFB`), the
   label slides aside, and an arrow slides in.
6. **Dark 3D panels** (`#141515`, radius 10) set into the light page. The 3D
   object is always the hero.
7. **Whole sections flip to black** (`#000000`), and the header text flips to
   white with them.
8. **Lime (`#C1FF00`) appears only on dark backgrounds**, as a progress fill or a
   highlight. It is never used as text on light backgrounds.
9. **Motion uses two easing curves, and nothing bounces.** They are `cubic-bezier(0.4, 0, 0.1, 1)`
   and `cubic-bezier(0.35, 0, 0, 1)`, at 0.3 to 0.5 s.
10. **"+" crosses** mark the corners of sections and frame small captions such as
    `SCROLL TO EXPLORE`.

---

## 2. Color

### 2.1 Lusion's palette (verbatim `:root`)

| Lusion variable | Value | Where Lusion uses it |
|---|---|---|
| `--color-off-white` | `#F0F1FA` | Page background (the WebGL canvas reads this variable), input fields |
| `--color-white` | `#FFFFFF` | Pill CTAs, menu panels, footer, text on dark |
| `--color-dark-white` | `#E4E6EF` | Secondary pill ("MENU"), circular icon button |
| `--color-off-white-semi` | `rgba(240, 241, 250, 0.7)` | Translucent off-white overlay |
| `--color-black` | `#000000` | All body text, dark sections, "Labs" card, back-to-top circle |
| `--color-grey-blue` | `#2B2E3A` | Primary solid pill ("LET'S TALK"), close button |
| `--color-blue` | `#1A2FFB` | The accent: CTA hover fill, arrows, cursor blobs, dotted leaders at 0.2 opacity |
| `--header-color` | `#0016EC` | Primary pill hover, menu-item hover background (at 0.1 opacity), mobile menu backdrop |
| `--color-dark-blue` | `#071BDF` | Deeper blue (declared, rarely used) |
| `--color-green` | `#C1FF00` | Progress fill on dark, highlight cards, mono accent text |
| `--color-red` | `#FF4C41` | Red accent |
| `--color-error` | `#E90000` | Form errors |
| `--color-purple` | `#8832F7` | Purple accent (declared, rarely used) |

Colors that appear outside `:root`:

| Value | Where |
|---|---|
| `#141515` | Dark 3D panel base (`u_color0` in the hero shader), painted with `#1A2FFB` |
| `#121416` | "Next page" dark band background |
| `#34393F` | Progress track on dark (under the lime fill) |
| `#999999` | "+" cross marks on the About page |
| `rgba(0,0,0,0.1)` / `rgba(255,255,255,0.1)` | Scroll indicator track on light / on dark |
| `rgba(255,255,255,0.2)` | Video progress track |
| `rgba(255,255,255,0.3)` | Team indicator fill on dark |
| `rgba(0,0,0,0.9)` | Video overlay scrim |
| `linear-gradient(270deg, #0B0B1280, #0B0B1200)` | Header backdrop when the menu opens (desktop) |
| `#061DFB` `#ADFF00` `#F6000E` `#7E09F5` `#FFC000` | Random "balloon" colors for playful 3D objects |

Text opacities in use: **0.5** (secondary text), **0.3** (placeholder), **0.2**
(decorative dotted leaders), **0.1** (hover wash).

### 2.2 StrideMon color tokens (`src/theme/colors.ts`, Phase 8)

Existing token names stay, so feature code doesn't churn. Only the values change,
plus a few new tokens.

| Token | Value | Source |
|---|---|---|
| `background` | `#F0F1FA` | `--color-off-white` |
| `surface` | `#FFFFFF` | `--color-white` |
| `surfaceMuted` *(new)* | `#E4E6EF` | `--color-dark-white` |
| `textPrimary` | `#000000` | `--color-black` |
| `textSecondary` | `rgba(0, 0, 0, 0.5)` | Lusion's secondary text = black at 0.5 |
| `textPlaceholder` *(new)* | `rgba(0, 0, 0, 0.3)` | Input placeholder opacity |
| `textOnPrimary` | `#FFFFFF` | White on `#2B2E3A` |
| `primary` | `#2B2E3A` | `--color-grey-blue` ("LET'S TALK" pill) |
| `primaryPressed` | `#0016EC` | `--header-color` (that pill's hover) |
| `accent` *(new)* | `#1A2FFB` | `--color-blue` |
| `highlight` *(new)* | `#C1FF00` | `--color-green`. Use only on dark or as a fill behind black text |
| `disabled` | `#E4E6EF` | **Derived.** Lusion has no disabled state. Pair it with text at `textPlaceholder` |
| `success` | `#C1FF00` | **Derived.** Lusion has no success color, so it reuses the lime. Use it as a fill with black text on it, never as text on light |
| `danger` | `#E90000` | `--color-error` |
| `dangerAccent` *(new)* | `#FF4C41` | `--color-red` |
| `darkBackground` *(new)* | `#000000` | Black sections |
| `darkSurface` *(new)* | `#121416` | "Next page" band |
| `darkPanel` *(new)* | `#141515` | 3D hero panel base |
| `darkTrack` *(new)* | `#34393F` | Progress track on dark |
| `textOnDark` *(new)* | `#FFFFFF` | |
| `textOnDarkMuted` *(new)* | `rgba(255, 255, 255, 0.3)` | |
| `overlayOnLight` *(new)* | `rgba(0, 0, 0, 0.1)` | Scroll track, hairlines |
| `overlayOnDark` *(new)* | `rgba(255, 255, 255, 0.1)` | |
| `scrim` *(new)* | `rgba(0, 0, 0, 0.9)` | Full-screen overlays |
| `backdrop` *(new)* | `rgba(0, 0, 0, 0.5)` | **Derived.** Dims the screen behind a bottom sheet without hiding it (Lusion has no sheets) |
| `crossMark` *(new)* | `#999999` | "+" corner marks |

Three Phase 0–7 tokens have no Lusion counterpart. They keep their names with
**derived** values:

| Token | Value | Use |
|---|---|---|
| `primarySurface` | `rgba(0, 22, 236, 0.1)` | Pressed or pending wash, Lusion's menu hover (`#0016EC` at 0.1) |
| `successSurface` | `#C1FF00` | A success badge: lime fill, black text |
| `dangerSurface` | `rgba(233, 0, 0, 0.08)` | Behind an error or warning, `danger` text on it |

`success` is lime, so success is never shown as lime text on a light screen. On
light screens it's black text on a `successSurface` fill.

---

## 3. Typography

### 3.1 Families

| Lusion family | Weights and styles | Role | For StrideMon |
|---|---|---|---|
| **Aeonik** (CoType Foundry) | 400, 500, 400 italic | Everything | **Commercial font. Buy an app/embedding licence from CoType** before shipping. Don't copy the files from lusion.co, because they are Lusion's licensed copies. |
| **IBM Plex Mono** | 400, 500 | Counters, toggles, award lists, numbers | Free (SIL OFL): `@expo-google-fonts/ibm-plex-mono`. Use it for every number: SOLE amounts, distance, time, energy, stats. |
| **LusionMono** | 400 | Capability letter cards, playground text | Lusion's own proprietary face, so it is **not available**. IBM Plex Mono takes its place. |

If the Aeonik licence isn't bought in time for the demo, **Satoshi** (Indian Type
Foundry, free on Fontshare) is the closest free geometric grotesk. This fallback
is **derived**: it's an approximation, not what Lusion uses.

**Chosen for StrideMon (Phase 8.1): Satoshi.** No Aeonik licence is bought.
`Satoshi-Regular` and `Satoshi-Medium` (TTF, from Fontshare) live in
`apps/mobile/assets/fonts/` next to the licence, `Satoshi-FFL.txt` (ITF Free Font
License 2.0). It allows embedding in an app, but not sharing the files from a
public server. The repository is public for the hackathon, and Yash chose to keep
the files in it anyway (2026-10-03). To remove that risk, swap Satoshi for an SIL OFL
font from `@expo-google-fonts` (only `src/theme/fonts.ts` and the font files change).

Rendering: Lusion sets `-webkit-font-smoothing: antialiased` and uses
`font-display: block`. That means text waits for the font and never flashes a
fallback. In the app, keep the splash screen up until `expo-font` has loaded.

### 3.2 Weights

| Token | Value | Lusion usage |
|---|---|---|
| `regular` | `'400'` | All headlines, body text and titles |
| `medium` | `'500'` | UPPERCASE buttons, toggles, `SCROLL TO EXPLORE` |

The current `fontWeights.semibold` and `fontWeights.bold` are dropped in Phase 8,
and their call sites move to `medium` or `regular`. Lusion has nothing heavier than 500.

### 3.3 Type scale

The Lusion CSS is responsive and in `vw`. The Phone column is the computed value at
a 390 pt width, and the token is that value rounded. The **Desktop** column holds the
computed value at a 1440 px width, for a future website.

| Token (`fontSizes`) | Phone (pt) | Line height | Letter spacing | Case / weight | Lusion source | Desktop (px) |
|---|---|---|---|---|---|---|
| `label` | **10** (9.75) | 1.15 | normal | UPPER / 400 | `.project-item-line-1`: `2.5vw` (phone), `0.9vw` | 12.96 |
| `caption` | **14** (13.65) | 1.4 | normal | UPPER / 400 | `#home-featured-disclaimer`: `3.5vw` (≤480) | 12.96 |
| `button` | **14** | 1.15 | normal | UPPER / 500 | `#header-right-*-btn`, CTAs: `0.875em` / `clamp(.875rem,1vw,1.75rem)` | 14.4 |
| `body` | **16** | 1.4 | normal | Sentence / 400 | root `16px`; `#home-goal-texts` `1.125em` (phone) | 21.6 |
| `input` *(new)* | **18** (17.5) | 1.15 | normal | Sentence / 400 | `#footer-newsletter-input-field` `1.25em` | 18 |
| `intro` *(new)* | **23** (23.4) | 1.1 | normal | Sentence / 400 | `#home-hero-title`: `6vw` (phone), `2.5vw` | 36 |
| `title` | **25** (25.35) | 1.15 | normal | Title Case / 400 | `.project-item-line-2`: `6.5vw` (phone), `3vw` | 43.2 |
| `menuItem` *(new)* | **26** | 1.0 | normal | UPPER / 400 | `.header-menu-link-text`: `1.625em` | 26 |
| `heading` *(new)* | **47** (47.25) | 1.15 | normal | Sentence / 400 | `#footer-newsletter-header`: `3.375em` | 48.6 |
| `counter` *(new)* | **51** (50.7) | 0.75 | normal | digits / 400 | `#preloader-percent-digits`: `13vw` (phone), `clamp(7em,8vw,20em)` | 115.2 |
| `display` | **58** (58.5) | 0.9 | −0.02 em (−1.17 pt) | Title Case / 400 | `#home-featured-title-wrapper`: `15vw` (phone), `8vw` | 115.2 |
| `displayLarge` *(new)* | **62** (62.4) | 1.0 | −0.01 em (−0.62 pt) | Title Case / 400 | `#home-goal-title`: `16vw` (≤560), `8vw` | 115.2 |
| `displayHuge` *(new)* | **76** (76.05) | 1.0 | normal | Title Case / 400 | `#end-section-title`: `19.5vw` (≤560), `10vw` | 144 |

Other Lusion type rules we keep:

- **Tracking is only ever tightened, and only on display type**: −0.02 em on the
  biggest titles, −0.01 em on the next size down. Wide tracking appears only on
  tiny uppercase captions: `0.0975em` at `0.625em` size with opacity 0.5
  (`#about-who-team-job`), and `0.024rem` on 1.2 rem timeline labels.
- React Native's `letterSpacing` is in **points, not em**. Convert with
  `letterSpacing = em × fontSize` (for example, −0.02 × 58 = −1.16).
- Display lines are pulled left optically (`left: -0.03em` to `-0.07em`), so the
  glyph edge lines up with the gutter. In RN that becomes `marginLeft: -0.05 × fontSize`.
- Big uppercase statements on dark (`STEP INTO A NEW WORLD…`) use `6vw` (desktop),
  white, 400, justified word by word.
- Font sizes stay fixed in points. Scaling them with screen width
  (`size × windowWidth / 390`, matching Lusion's `vw`) is optional and **derived**.

---

## 4. Layout and spacing

### 4.1 Lusion's layout variables (verbatim)

| Variable | Desktop | ≤ 812 px | ≤ 400 px | ≥ 21:9 |
|---|---|---|---|---|
| `--base-padding-x` (page gutter) | `max(5vw, 40px)` | `25px` | `15px` | `max(6vw, 60px)` |
| `--base-padding-y` | `clamp(30px, 4vw, 50px)` | `25px` | `15px` | — |
| `--grid-gap` | `2vw` | `4vw` | `4vw` | — |
| Grid columns | 12 | 6 | 6 | 12 |
| `--global-border-radius` | `20px` | `10px` | `10px` | — |
| `--header-size` | `clamp(1rem, 1vw, 2rem)` | — | `clamp(0.75rem, 1vw, 2rem)` | — |
| `--cross-size` | `clamp(0.875rem, 1vw, 2rem)` | — | — | — |

Sections are `padding: var(--base-padding-y) var(--base-padding-x)` on the grid
above. Breakpoints in use: 380, 400, 480, 560, 812, 1000, 1200 and 1600 px, plus
`min-aspect-ratio: 21/9` and `hover: hover`.

### 4.2 StrideMon spacing tokens (`src/theme/spacing.ts`, Phase 8)

Every value is a Lusion value converted at a 16 pt root.

| Token | Value | Lusion source |
|---|---|---|
| `extraSmall` | **5** | `0.3125em`: dot size, small nudges |
| `small` | **10** | `0.625em`: gap between stacked panels, button icon gap, menu panel radius |
| `medium` | **15** | `--base-padding-x/y` on phones ≤ 400 |
| `large` | **20** | `1.25em`: input padding, dark-card vertical padding |
| `extraLarge` | **30** | `1.875em`: panel padding |
| `sectionSmall` *(new)* | **32** | `2em`: gap between list items on phone (`.project-item` stacking) |
| `section` *(new)* | **48** | `3em`: gap above a CTA |
| `sectionLarge` *(new)* | **80** | `5em`: gap between card rows |

| Layout token (`layout`, new) | Value | Source |
|---|---|---|
| `pageGutter` | **15** when the window width is ≤ 400, else **25** | `--base-padding-x` |
| `gridColumns` | **6** | phone grid |
| `gridGap` | **4% of window width** (≈ 16 at 390) | `--grid-gap: 4vw` |
| `headerHeight` | **76** (15 + 45 + 15 + 1) | measured `#header` at 390 pt |
| `minimumTouchTarget` | **44** | Unchanged (`MINIMUM_TOUCH_TARGET_SIZE`). Lusion's pills are 45, so they meet it. |

The component sizes from §8 are `layout` tokens too (Phase 8.2): `pillHeight` 45,
`callToActionPillHeight` 47, `callToActionDotSize` 7 (now the small status dot, e.g. the active run's recording dot), `progressTrackHeight` 4,
`crossMarkSize` 14 with a `crossMarkStrokeWidth` of 1, `textFieldHeight` 61,
`textFieldArrowSize` 21, `iconCircleButtonSize` 45, `iconCircleButtonDarkSize` 53, and
`iconSize` 18 and `iconStrokeWidth` 1.5 (**derived**, the line glyph inside a circle button). Two app-only sizes are
**derived**: `successBadgeSize` 64 (the lime check after a transaction) and
`onboardingStepIndicatorWidth` 24. `opticalPullLeftRatio` is −0.05 (§3.3: display lines
are pulled left by 0.05 × font size).

---

## 5. Radii (`src/theme/radii.ts`, Phase 8)

| Token | Value | Lusion source |
|---|---|---|
| `tiny` *(new)* | **3** | Scroll indicator, video progress (`3px` / `0.1875em`) |
| `small` | **6** | Capability letter cards (`0.361rem` ≈ 5.8) |
| `medium` | **10** | `--global-border-radius` on phone, menu panels `0.625em`, dark cards |
| `media` *(new)* | **15** | `.project-item-image` `15px` |
| `input` *(new)* | **18** | Inputs: `1.125rem` (menu), `1.125em` at 14 (footer) |
| `card` *(new)* | **20** | `--global-border-radius` on desktop; highlight card `1.2rem` |
| `pill` | **999** | `6.25em`, `5.3125em`, `100px` on every pill |

Circles (icon buttons, dots) are `width = height` with `borderRadius: pill`.

---

## 6. Elevation

Lusion uses **exactly one shadow**, and only on white pills floating over content:

```css
box-shadow: 0 6px 10px #0000000a, 0 2px 4px #0000000a; /* black at 4% */
```

React Native 0.86 supports `boxShadow` (the new architecture) with the same string:

| Token (`shadows`, new) | Value |
|---|---|
| `floatingPill` | `'0px 6px 10px rgba(0, 0, 0, 0.04), 0px 2px 4px rgba(0, 0, 0, 0.04)'` |

Nothing else has a shadow. Depth comes from color steps
(`#F0F1FA` → `#FFFFFF` → `#E4E6EF`), not from elevation.

---

## 7. Motion (`src/theme/motion.ts`, new, Phase 8)

Counted across the whole stylesheet:

| Token | Value | Uses | Lusion role |
|---|---|---|---|
| `easingStandard` | `cubic-bezier(0.4, 0, 0.1, 1)` | 32 | Text rolls, menu open and close, icon swaps |
| `easingEmphasized` | `cubic-bezier(0.35, 0, 0, 1)` | 32 | CTA fills, dot growth, footer link underlines |
| `easingArrow` | `cubic-bezier(0.4, 0, 0, 1)` | 2 | Arrow slides into CTAs |
| `easingLoop` | `cubic-bezier(0.1, 0, 0.1, 1)` | 3 | Repeating 3 s text loop (`CONTINUE TO SCROLL`) |
| `easingOutExpo` | `cubic-bezier(0.16, 1, 0.3, 1)` | 2 | Rare, soft settles |

| Duration token | ms | Uses |
|---|---|---|
| `durationInstant` | 100 | 4 |
| `durationFast` | 200 | 2 |
| `durationBase` | **300** | 22 (most common) |
| `durationMedium` | 400 | 18 |
| `durationSlow` | 500 | 10 |
| `durationSlower` | 600 | 2 |

In the app these become `Easing.bezier(0.4, 0, 0.1, 1)` and friends, from
`react-native` `Animated` or Reanimated.

**Signature interactions.** Rebuild these, don't just approximate them:

1. **Text roll.** The label sits in an `overflow: hidden` box and a clone waits
   just below it (`translateY(100%)`). On press, the label goes to `-100%` and the
   clone comes to `0`. 400 ms, `easingStandard`.
2. **Dot fill CTA.** At rest the pill is white, with a black 0.5 em dot before
   the label. On press, the dot moves right and scales ×20 to ×32 while turning
   `#1A2FFB`, so it floods the pill. The label turns white and shifts −1.5 em. A blue,
   then white, arrow slides in from the right. The background changes over 500 ms
   after a 300 ms delay, `easingEmphasized`. The dot moves over 400 ms.
3. **Primary pill press.** `#2B2E3A` → `#0016EC` over 400 ms. The white dot scales
   to 0 while the label slides +1.5 em and an arrow slides in from the left
   (300 ms, `easingStandard`).
4. **Menu open.** Panels start at `translateY(5.5em) rotate(3.5deg)` (links) and
   `translateY(7.75em) rotate(-3.5deg)` (the other cards) at opacity 0, then settle
   to `0 / 0deg / 1` over 500 ms, `easingStandard`, staggered. The two-dot menu
   icon rotates from 180° to 270°.
5. **Menu item hover wash.** A pill of `#0016EC` at 0.1 opacity scales from 0.85
   to 1 behind the item. The active item shows an 8 pt black dot on the right.
6. **Section flip.** When a dark section is on screen, the header's content color
   switches to white (250 ms).
7. **Hero headline entry.** Each word rises from `translateY(1.5em) rotate(15deg)`.
8. **Underline links.** A 0.1 em line scales from `scaleX(0)` to `1` from the
   left, over 300 ms, `easingEmphasized`.

---

## 8. Components (`src/components/ui/`, Phase 8)

Sizes are Phone values at 390 pt.

The three pills are one `Button` with a `variant` (`primary`, `secondary`,
`callToAction`), so the call sites from Phases 0–7 keep their import. `Card`
becomes `Panel`. `MediaCard` and `MenuListItem` are built when a screen needs one.

| Component | Spec (from Lusion) | StrideMon use |
|---|---|---|
| **`PrimaryPillButton`** | `primary` background, white `button` text (14/500/UPPER), height **45**, padding `0 16 0 23` (`0 1.125em 0 1.625em` at 14), `pill` radius, trailing white **arrow** (`iconSize`, gap 10) where Lusion has a 4 pt dot (D-029). Press: interaction 3, with the arrow nudging right instead of the dot shrinking. | Sign in, START, Confirm transaction |
| **`SecondaryPillButton`** | `surfaceMuted` background, black text, same size. Press: background `surface`. A black arrow on the right, where Lusion has a two-dot icon (D-029). | Menu, Cancel, secondary actions |
| **`CallToActionPill`** | `surface` background, black `button` text, height **47**, padding `14 21 14 23`, leading black **arrow** where Lusion has a 7 pt dot (D-029), gap 14, `floatingPill` shadow. Press: interaction 2, with a blue circle growing from behind the arrow to flood the pill, and the arrow turning white. | "See Sneaker", "Repair", "Upgrade" |
| **`IconCircleButton`** | 45 × 45 circle on `surfaceMuted` (sound button). Dark variant: 53 × 53 black circle with a white icon (back-to-top). | Close, back, settings |
| **`Panel`** | `surface` background, radius `medium` (10), padding 30. Stack panels with gap 10. | Every card on light screens |
| **`DarkPanel`** | `darkBackground` background, radius 10, padding `20 30`, white 26 UPPER text, arrow on the right (the "Labs" card). | Featured action on a light screen |
| **`HeroPanel`** | Full width minus gutters, `darkPanel` background, radius 10, hosts the 3D/illustration. It fills the rest of the first screen. | The Sneaker on Home |
| **`MediaCard`** | Image with radius `media` (15) at a 65% aspect (`height = 0.65 × width`). Below it: a `label` row with ` • ` separators (margin 15 above, 10 below: `1.5em 0 1em` at 9.75), then a `title`. | Sneaker list, marketplace (Phase 9) |
| **`MetaLabel`** | `label` or `caption`, UPPER, items joined with ` • `. | `LEVEL 3 • EFFICIENCY 12 • DURABILITY 82` |
| **`TextField`** | `background` fill on a white panel, radius `input` (18), height **61**, padding `11 22` (`0.625em 1.25em` at 17.5), `input` text, placeholder at 0.3, trailing 21 pt arrow button. | Transfer address, amounts |
| **`MenuListItem`** | `menuItem` (26 UPPER, line height 1), padding `16 26`, hover wash and active dot (interaction 5). | Settings, navigation lists |
| **`ProgressBar`** | Track `darkTrack` 4 pt tall, fill `highlight`, grows from the left with `scaleX`. Label: `caption` UPPER, white. | **Energy** and **durability** on dark screens |
| **`CrossMarks`** | "+" marks at `--cross-size` (14) at the section corners, with a centered 14/500 UPPER caption between them. | "SWIPE TO START", "EARNED THIS RUN" frames |
| **`CounterText`** | IBM Plex Mono digits, one character per slot (`width: 1ch`), each digit rolling vertically. Preloader style: `counter` size, line height 0.75, white on black. | SOLE balance, live distance and time, "Minting…" percent |

---

## 9. How StrideMon screens use it

This maps each existing phase's screens onto the system. It is applied in Phase 8.

| Screen (phase) | Treatment |
|---|---|
| Onboarding and sign-in (2) | Light `background`. `displayLarge` headline, "Walk. Earn. Upgrade.", pulled left. `intro` subline. `PrimaryPillButton` "CONNECT WALLET". |
| "Minting your Sneaker…" (3) | Full black screen, Lusion preloader style: huge IBM Plex Mono percent digits bottom-left (`counter`), white. |
| Home (3) | Header: wordmark on the left, `IconCircleButton` and `SecondaryPillButton` on the right. `HeroPanel` with the Sneaker. `MetaLabel` stats row. SOLE balance in `CounterText`. `CallToActionPill` "START RUN". |
| Active run (4) | The screen flips to `darkBackground`. Time and distance in huge IBM Plex Mono (`displayHuge`). Energy left as `ProgressBar` (lime on `#34393F`). `CrossMarks` frame the estimated reward. STOP is a `PrimaryPillButton`. |
| Run summary (4, 5) | Back to light. `displayLarge` "+12.40 SOLE". `Panel` stack with rewarded minutes and durability lost. |
| Repair and upgrade (6) | `Panel`s with quotes. `CallToActionPill` for confirm. Transaction states as `MetaLabel` (`AWAITING SIGNATURE • CONFIRMING`). |
| Transfer (7) | `TextField` for the address, `PrimaryPillButton` send. |
| Tab bar (8.2) | White `surface` bar with a hairline top. Each tab has a line icon (the `Icon` set, same stroke as the arrows) above a `label` UPPER title; active `textPrimary`, inactive `textSecondary`. |
| Marketplace (9) | `MediaCard` grid (1 column on phone, gap `sectionSmall`). |

---

## 10. What Phase 8 changes in code

For reference only. **Nothing here is applied before Phase 8.**

- `src/theme/colors.ts`, `spacing.ts`, `radii.ts`, `typography.ts`: set the values
  in §2.2, §4.2, §5 and §3.2 to §3.3. Existing keys keep their names, and new keys are added.
- New `src/theme/fonts.ts` (`fontFamilies`: `regular` and `medium` for Satoshi,
  `monoRegular` and `monoMedium` for IBM Plex Mono). Android picks a font by file,
  not by `fontWeight`, so text sets a family per weight and never a `fontWeight`.
  Plus `letterSpacings`, `lineHeights`, `shadows`, `motion` and `layout`.
- `textStyles` in `typography.ts` combines a §3.3 row (family, size, line height,
  letter spacing) into one style to spread: `...textStyles.body`. Case stays with the
  component (`MetaLabel` and the buttons uppercase their text).
- Load fonts with `expo-font` (`bunx expo install expo-font @expo-google-fonts/ibm-plex-mono`),
  and keep the splash screen up until they are loaded.
- Build the §8 components in `src/components/ui/`.
- Replace the call sites that use `fontWeights.semibold` and `fontWeights.bold`. The
  `fontWeights` token goes with them: the weight is the family (`fontFamilies.medium`).
- Component sizes (pill heights, dot sizes, the progress track) are `layout` tokens too,
  so no pixel value lives outside `src/theme/`.
