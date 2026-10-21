# Part 5b (optional): Baked light

**Only if Yash asks for it after Part 5.** This is how premium three.js sites get the soft bounce
light of a real room (Utsubo's list names baked lighting as one of the things that separate
award winners from demos; Cartier's alcoves were built in Blender). It costs nothing at runtime:
the light is painted into textures once.

**Goal:** the building's static architecture carries baked light (soft shadows, light bouncing
between walls), while the Sneakers, the casts and the moving lights stay real-time.

## Read first

- `showroom/src/world/floor-plan.ts` and the architecture components
- The brief §8 (budgets)

## Build

1. **Blender** is free, but it's about 1 GB: ask Yash before `brew install --cask blender`.
2. **Export the plan:** the floor plan's numbers as JSON, so Blender builds exactly the same
   building.
3. **`showroom/blender/build-and-bake.py`**, run headless (`blender -b -P …`): builds the nave,
   one chapel shell and the apse from the JSON, assigns the materials, bakes the lightmaps with
   Cycles, and exports glTF with the lightmaps on a second UV set.
4. **One chapel, ten moods:** the ten chapels share one shell, so they share one baked lightmap.
   Each chapel's floor keeps its own colour texture; the lightmap multiplies it.
5. **Swap it in:** the app loads the baked architecture in place of the code-built one, with
   the lightmaps at the smallest size that holds up.

## Done when

- Before-and-after screenshots of the nave, a chapel and the apse are in `docs/showroom/look/`,
  and Yash picks.
- The brief's §8 budgets still hold (lightmaps count toward the download), on the phone too.
- Typecheck, lint and tests pass.

Mark Part 5b **Done** (or **Skipped**, if Yash prefers the code-built light), then stop.
