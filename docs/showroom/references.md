# The StrideMon Showroom: references

Research done on 2026-10-22, for [`brief.md`](brief.md). Each entry says what to **take** and
what to **leave**. Before Part 1 and Part 2, open the live sites (on a laptop and on the phone)
and look at how they move, not only how they look.

## Web experiences

| Reference | What it is | Take | Leave |
|---|---|---|---|
| **Cartier, Watches & Wonders** ([site](https://www.cartier.com/en-fr/watchesandwonders), [case study](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html), Immersive Garden with 60fps and Mooders, 2025) | Six 3D **alcoves**, one per watch, each "a self-contained world" of architecture, light and material. Scrolling moves between rooms. Three.js, Blender, GSAP, Lenis, a Web Audio score | **The structure:** our ten chapels are its alcoves, one per template, each with its own mood inside one brand world. Hidden interactions that "reward curiosity" but never break the flow | Its six handmade worlds: ours is one room design with ten moods |
| **Igloo Inc** ([igloo.inc](https://www.igloo.inc), [case study](https://www.awwwards.com/igloo-inc-case-study.html), abeto with Bureaux, Awwwards Site of the Year 2024) | Each project sits in its own procedurally grown ice block. Praised for running well "on potato devices" | **Geometry from code, not downloads** (our Sneakers are built from a few KB of polygons). Measuring speed on weak devices from the first day. Shaders compiled in the background while the visitor reads | The chromatic aberration, glitches and text scrambles: not our calm look |
| **Oryzo** ([oryzo.ai](https://oryzo.ai), [behind the scenes](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics), Lusion, Awwwards Site of the Month April 2026) | One cork coaster treated with complete seriousness: a warm, believable desk, slow camera on an eased path, real weight in the scroll | **Restraint:** "the challenge is often not adding more, but knowing when to stop." One hero object at a time. The camera weighted to where the eye should rest | Its Houdini, Redshift and Gaussian-splat pipeline: far beyond what we need |
| **Lusion** ([lusion.co](https://lusion.co)) | The studio StrideMon's design system is taken from | The DOM layer: type, pills, colours, easing (`docs/architecture/design-system.md`) | |
| **Shoes Box** ([live](https://shoes-box.pages.dev), [case study](https://craftsite.it.com/work/shoes-box/en)) | 144 sneakers in a 3D grid. Next.js 16, React Three Fiber, GLSL, filters, a minimap | Proof that our stack runs this kind of site. **Browsing many shoes needs filters and a map** | Holographic cards in a 3D grid: a grid in 3D is still a grid |
| **Utsubo, "8 Best Three.js Websites of 2026"** ([article](https://www.utsubo.com/blog/best-threejs-websites-2026)) | A list of award-winning three.js sites, one technique each | Its note that **instancing, baked lighting and byte budgets** are what separate award winners from demos. Our budgets are in the brief's §8 | |

## Physical spaces

| Reference | What it is | Take |
|---|---|---|
| **Snarkitecture for Kith, Brooklyn** ([Dezeen, 2015](https://www.dezeen.com/2015/11/13/snarkitecture-kith-brooklyn-store-installation-700-nike-air-jordan-replicas-cereal-bar/)) | About 700 white cast replicas of the Air Jordan II hung from the ceiling on white rods (Kith's own recap says 750) | **The vault of 1,000 white casts.** Ours adds one thing theirs couldn't: a cast takes its colours when its pass is minted |
| **Snarkitecture for Kith, Los Angeles** ([Dezeen, 2018](https://www.dezeen.com/2018/02/25/snarkitecture-creates-bright-shoe-display-kith-store-los-angeles/)) and **Tokyo** ([Snarkitecture](https://www.snarkitecture.com/projects/kith-tokyo)) | About 200 cast Jordans overhead in LA. In Tokyo, a vaulted ceiling of cast Air Force 1s, **stainless steel shelving**, a marble herringbone floor, and a round **glass case holding Ronnie Fieg's own archive** | The steel shelves in the chapels, and the glass case for each chapel's Legendary |
| **Nike House of Innovation 000, New York** ([Dezeen, 2018](https://www.dezeen.com/2018/11/14/nike-house-innovation-000-flagship-store-new-york-city/)) | A "dark and theatrical" ground floor with rotating sculptural installations | The after-hours mood: dark rooms, lit objects |
| **Cloisonné enamel** (a craft, not a place) | Fine metal walls separating fields of glossy coloured enamel | **The Sneakers' finish** (brief §5.2). Our ink lines are the metal walls |

## Code to learn from

All MIT-licensed. Read the code; don't copy whole examples in.

| Example | Take |
|---|---|
| [pmndrs `image-gallery`](https://pmndrs.github.io/examples/image-gallery) | Frames on a reflective floor, and the camera flying to the frame you pick: the walk to a Sneaker and back |
| [pmndrs `shoe-configurator`](https://pmndrs.github.io/examples/shoe-configurator) | A shoe that turns under the pointer, with parts picked by tapping: up close |
| [pmndrs `baking-soft-shadows`](https://pmndrs.github.io/examples/baking-soft-shadows) | Soft contact shadows under the plinths and shelves |
| [pmndrs `camera-scroll`](https://pmndrs.github.io/examples/camera-scroll) | The scroll driving the camera along a path |
| The [examples index](https://r3f.docs.pmnd.rs/getting-started/examples) | About 150 more, including portals and views |
| drei: `Environment` with `Lightformer`, `MeshReflectorMaterial`, `PerformanceMonitor`, `AdaptiveDpr`, `Instances`, `Text` ([pmndrs/env](https://github.com/pmndrs/env) builds light setups in the browser) | Studio light without an HDRI file: long soft reflections on the enamel |
| [Spark](https://sparkjs.dev) ([GitHub](https://github.com/sparkjsdev/spark)), World Labs' Gaussian-splat renderer for three.js | **Not used.** It needs a scanned space; noted in case a real room is ever scanned |

## Free assets

- [ambientCG](https://ambientcg.com) and [Poly Haven](https://polyhaven.com): CC0 textures (stone,
  plaster, wood, concrete, felt) and HDRIs. Credit them in `showroom/CREDITS.md` anyway.
- Fonts: Satoshi (Fontshare) and IBM Plex Mono (OFL), as the website loads them. Placards in 3D
  use an IBM Plex Mono file served by the showroom.

## In this repo

| Where | Take |
|---|---|
| `launch-video/src/showroom/` (the Showroom film) | A StrideMon store already drawn in code with R3F 9 and three 0.186: lit panels, glow sprites, the laced art as cut-outs, the proportions. The showroom web app is its flagship |
| `website/src/lib/founding-pass/` | The design table's helpers (`readPassDesign`, `formatPassNumber`, names, rarity, similar designs), the filters, and `use-pass-collection.ts` (the live state and its refresh). Copy what's needed: there's no shared package |
| `website/src/content/founding-pass.ts` | The schedule's words and the planned times, so the placard's button says the same as `/pass` |
| `docs/architecture/design-system.md` | The Lusion look for the DOM layer |
