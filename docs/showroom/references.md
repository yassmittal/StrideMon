# The StrideMon Showroom: references

Research done on 2026-10-22, for [`brief.md`](brief.md), and revised the same day when the plan
moved to the store from the Showroom film. Each entry says what to **take** and what to **leave**.
Before Parts 1 and 2, open the live sites (on a laptop and on the phone) and look at how they
move, not only how they look.

## The source

| Where | Take |
|---|---|
| **The Showroom film** (`launch-video/src/showroom/`, rendered as `launch-video/out/stridemon-showroom-9x16.mp4`) | **The store itself**: the street, the shop front, the room, the five walls, the light, the Sneakers as cut-outs and prints, the canvas textures, the mood. R3F 9 and three 0.186, so the code ports. Its camera (rolled, fast, speed-ramped) is for a hyperspeed edit: the web walk keeps its framings and drops the roll and the speed |
| Its reference (`hyperSpeedCameraman.mp4` at the repo root) | Only what the film already took from it: a sneaker store at night, the lights, the walls. Its footage and music stay out of the showroom |

## Web experiences

| Reference | What it is | Take | Leave |
|---|---|---|---|
| **Oryzo** ([oryzo.ai](https://oryzo.ai), [behind the scenes](https://blog.lusion.co/oryzo-bts-part-2-7-3d-design-and-motion-graphics), Lusion, Awwwards Site of the Month April 2026) | One cork coaster treated with complete seriousness: a warm, believable desk, slow camera on an eased path, real weight in the scroll | **Restraint:** "the challenge is often not adding more, but knowing when to stop." One subject at a time at each stop. The camera weighted to where the eye should rest | Its Houdini, Redshift and Gaussian-splat pipeline |
| **Igloo Inc** ([igloo.inc](https://www.igloo.inc), [case study](https://www.awwwards.com/igloo-inc-case-study.html), abeto with Bureaux, Awwwards Site of the Year 2024) | Projects in procedurally grown ice blocks; praised for running well "on potato devices" | **Measuring speed on weak devices from the first day.** Shaders compiled while the visitor waits. Pictures made in code, not downloaded (our textures are canvases and SVGs) | The chromatic aberration, glitches and text scrambles |
| **Cartier, Watches & Wonders** ([site](https://www.cartier.com/en-fr/watchesandwonders), [case study](https://www.awwwards.com/watches-wonders-immersive-experience-for-cartier.html), Immersive Garden, 2025) | 3D alcoves, one per watch; scrolling moves between them | **Scroll moves between stops**, each stop a composed picture with one subject | Six handmade worlds: ours is one store |
| **Lusion** ([lusion.co](https://lusion.co)) | The studio StrideMon's design system is taken from | The DOM layer: type, pills, colours, easing (`docs/architecture/design-system.md`) | |
| **Shoes Box** ([live](https://shoes-box.pages.dev), [case study](https://craftsite.it.com/work/shoes-box/en)) | 144 sneakers in a 3D grid. Next.js 16, React Three Fiber | Proof that our stack runs this kind of site; **finding one shoe among many needs a search** | Holographic cards in a 3D grid |
| **Utsubo, "8 Best Three.js Websites of 2026"** ([article](https://www.utsubo.com/blog/best-threejs-websites-2026)) | Award-winning three.js sites, one technique each | Its note that **instancing, baked light and byte budgets** separate award winners from demos. Our budgets are in the brief's §8 | |

## Physical spaces

| Reference | Take |
|---|---|
| **Nike House of Innovation 000, New York** ([Dezeen, 2018](https://www.dezeen.com/2018/11/14/nike-house-innovation-000-flagship-store-new-york-city/)) | The after-hours mood: lit objects in a dark, theatrical store |
| **Snarkitecture for Kith** ([Brooklyn](https://www.dezeen.com/2015/11/13/snarkitecture-kith-brooklyn-store-installation-700-nike-air-jordan-replicas-cereal-bar/), [Tokyo](https://www.snarkitecture.com/projects/kith-tokyo)) | How a sneaker boutique lights its walls: even rows, a lit edge under each shelf, one special pair on its own stand |

## Code to learn from

All MIT-licensed. Read the code; don't copy whole examples in.

| Example | Take |
|---|---|
| [pmndrs `image-gallery`](https://pmndrs.github.io/examples/image-gallery) | **Flat pictures on a reflective floor, and the camera flying to the one you tap**: almost exactly look closer |
| [pmndrs `camera-scroll`](https://pmndrs.github.io/examples/camera-scroll) | The scroll driving the camera between stops |
| [pmndrs `baking-soft-shadows`](https://pmndrs.github.io/examples/baking-soft-shadows) | Soft contact shadows rendered once under the counters, the table and the chairs |
| drei: `Environment` with `Lightformer`, `MeshReflectorMaterial`, `ContactShadows`, `PerformanceMonitor`, `AdaptiveDpr`, `Instances` ([pmndrs/env](https://github.com/pmndrs/env) builds light setups in the browser) | An environment without an HDRI file; the floor's reflection; tiers |
| `@react-three/postprocessing`: `Bloom` (mipmap blur, a threshold), `N8AO`, `SMAA` | Bloom only on what's brighter than white; AO on the high tier |
| The [examples index](https://r3f.docs.pmnd.rs/getting-started/examples) | About 150 more |

## Free assets

- Everything the store needs is drawn in code (the film's canvas textures) or exported from the
  art. If a texture is ever needed (a concrete floor's grain, say), [ambientCG](https://ambientcg.com)
  and [Poly Haven](https://polyhaven.com) are CC0; credit them in `showroom/CREDITS.md` anyway.
- Fonts: Satoshi (Fontshare) and IBM Plex Mono (OFL), as the website loads them.

## In this repo

| Where | Take |
|---|---|
| `launch-video/src/showroom/` | The store (above) |
| `launch-video/src/sneaker-drop/sneakers.ts` | `SEQUENCE_DESIGN_NUMBERS`, the Sneakers niche's order (copied into the brief §5.4) |
| `website/src/lib/founding-pass/` | The design table's helpers (`pass-design.ts`), the schedule (`pass-schedule.ts`) and the live state (`pass-collection.ts`, `use-pass-collection.ts`). Copy what's needed: there's no shared package |
| `website/src/content/founding-pass.ts` | The schedule's words, so the card's button says the same as `/pass` |
| `docs/architecture/design-system.md` | The Lusion look for the DOM layer |
