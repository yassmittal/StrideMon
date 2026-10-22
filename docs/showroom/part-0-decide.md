# Part 0: Decide

**Goal:** the plan follows the store from the Showroom film, Yash answers the few open
questions, and the showroom gets its decision entry and its place in the docs. No code.

## Read first

- [`README.md`](README.md), [`brief.md`](brief.md) (all of it), [`references.md`](references.md)
- `launch-video/src/showroom/` (`components/ShowroomWorld.tsx`, `textures.ts`, `sneakers.ts`,
  `camera.ts`, `components/FilmGrain.tsx`): the store this plan ports
- `CLAUDE.md`, then in `docs/decisions.md`: D-035 (the website), D-040 (the domain), D-041 and
  D-044 (the Founding Pass and its gallery), D-049 (founder access, said plainly)

## Do

1. **Rewrite `docs/showroom/` for the store direction** (Yash, 2026-10-22): the brief's building,
   visit, §5 (flat Sneakers in a 3D store) and art direction; the part files re-cut in order (the
   store ported from the film, the walk, look closer and find, finish and fallbacks, launch); the
   parts that no longer apply dropped. *(Done in the session that revised the plan.)*
2. **Ask the brief's §10 questions in one message**, each with its default, so "defaults" answers
   them all. *(Yash asked Claude to research and pick: the brief's §10 records the picks.)*
3. **Write the decision** with the next free number in `docs/decisions.md`: "The 3D showroom at
   `showroom.stridemon.xyz`: the film's store, live". Context, the choice (with Yash's answers),
   why, what it never does (brief §9). Keep it as short as the recent entries.
4. **Update the docs** to match:
   - `brief.md`: status line, §10 answers marked decided
   - `CLAUDE.md` → Current phase: the "3D showroom" lines get the decision number and the next
     part
   - `docs/README.md`: the status row
   - `docs/architecture/repository-structure.md`: a `showroom/` line under the tree, worded like
     `website/`'s ("its own install, not a workspace")
5. Mark Part 0 **Done** in `README.md` with the date and the decision number.

## Done when

- Yash has answered §10.
- The decision is written, and the docs above agree with it.

Stop there. Don't create anything in `showroom/`: that's Part 1.
