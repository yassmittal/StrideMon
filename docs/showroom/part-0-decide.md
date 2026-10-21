# Part 0: Decide

**Goal:** Yash confirms the few open questions, and the showroom gets its decision entry and its
place in the docs. No code.

## Read first

- [`README.md`](README.md), [`brief.md`](brief.md) (all of it), [`references.md`](references.md)
- `CLAUDE.md`, then in `docs/decisions.md`: D-035 (the website), D-040 (the domain), D-041 and
  D-044 (the Founding Pass and its gallery), D-049 (founder access, said plainly), D-050 (the
  website read as a first-time visitor)
- `docs/waitlist-growth-plan.md` §1 and the dates in it

## Do

1. **Explain the showroom to Yash in plain words**, in about ten lines: the building, the visit,
   cloisonné Sneakers, what it never does. Then ask the brief's §10 questions in one message,
   each with its default, so "defaults" answers them all. Don't add new questions unless
   something in the repo has changed since 2026-10-22 (check `CLAUDE.md` → Current phase).
2. **Write the decision** with the next free number in `docs/decisions.md`: "The 3D showroom at
   `showroom.stridemon.xyz`". Context, the choice (with Yash's answers), why, and what it never
   does (brief §9). Keep it as short as the recent entries.
3. **Update the docs** to match:
   - `brief.md`: status line, §10 answers marked decided
   - `CLAUDE.md` → Current phase: replace the "3D showroom (planned)" lines with the decision
     number and the next part
   - `docs/README.md`: the status row
   - `docs/architecture/repository-structure.md`: a `showroom/` line under the tree, worded like
     `website/`'s ("its own install, not a workspace")
4. Mark Part 0 **Done** in `README.md` with the date and the decision number.

## Done when

- Yash has answered §10.
- The decision is written, and the four docs above agree with it.

Stop there. Don't create anything in `showroom/`: that's Part 1.
