# authoring

How a new module is written, and the rules it has to keep. `spec.md` is the
index of what exists; every module directory's `readme.md` is that module's
contract; this file is the procedure for adding one.

## What qualifies

A module earns its directory by all four:

- It does something a site would otherwise install a script to do.
- The browser can hold the state — a checked control, an open attribute, a
  popover — so CSS can read it.
- Pruned from the page, the native elements still work, plainly.
- It is one job. A module that needs a second module to be useful belongs in
  its `readme.md` as a stated pairing, not as a hidden dependency.

A thing a script must hold state for is not a module here. It is a script.

## Where it goes

- Inside `modules/`, one directory named for the job:
  `modules/pure-css-nested-menu/`.
- A directory holds `readme.md`, `assets/<name>.css`, an optional
  `assets/<name>.js`, and `examples/`.
- The whole name is the module name: directory, stylesheet, script, and the
  `###` entry in `spec.md` all say the same word.
- No grouping inside `modules/` yet. When a second area exists and the folders
  outgrow a flat list, this file gains the rule; inventing the tree before the
  modules exist is guessing.

## The files

- **`assets/<name>.css`** — the engine. Native state selectors, no per-level
  repetition, no external font or image.
- **`assets/<name>.js`** — optional and supplemental: roles, `aria-*`, keyboard
  activation, and the few behaviours CSS cannot express. Nothing visual, and
  never the thing that makes the module work.
- **`examples/`** — at least one page that links the stylesheet in `assets/`
  and works by itself. An example that copies the CSS inline will drift from
  the module; link it.
- **`readme.md`** — the contract, in this order: title and one-line pitch,
  contents, features, optional JavaScript, quick start, markup contract, how it
  works, notes and constraints, browser support, files.

## The header is the contract

Every file opens with a block naming:

- what it is for,
- the markup it requires (root class, required elements, required ids),
- the one newest feature it depends on,
- whether a script is needed, and what the script is allowed to do,
- what is left of the page when the module is pruned.

When the header and `spec.md` disagree, the header wins.

## Markup rules

- **Native first.** `<button>`, `<input type="radio">`, `<details>`,
  `<dialog>`, `popover`. A `<div>` dressed as a control is the thing this
  collection exists to avoid.
- **The control is the state.** If the module needs "one of these at a time",
  that is a radio group. If it needs "any of these", that is a checkbox. If it
  needs a title and a body, that is `<details>`.
- **One form per tree, external.** Forms are not nested; controls join theirs
  with `form="…"`.
- **Ids are the collision point.** A reusable module needs `id`/`for` pairs, so
  ids are the one thing a page keeps unique. The module's own example shows the
  pattern; nothing more is enforced.
- **No `aria` that repeats the native element.** A `<button>` is already a
  button. If the markup needs a role to be understood, the markup is wrong —
  fix the element, not the attribute.

## CSS rules

- Read state, do not store it: `:checked`, `:open`, `[popover]`, `:has()`.
- One rule per state, not per level. If a third depth means a third selector,
  the engine is wrong.
- Keep the engine and the paint apart. The first rules make the thing work; the
  rest dress it. A host must be able to drop the second half and still have a
  working control.
- No `@import`, no remote font, no icon font. A glyph is text or nothing.
- Name the newest selector the module cannot live without in its `readme.md`.

## The optional script

- One file, no dependencies, wrapped so a double include is harmless:
  `(() => { 'use strict'; … })();` with a `loaded` flag set before anything
  else.
- It is supplemental: it does the small set of things the platform genuinely
  cannot. Roles, `aria-expanded`, `aria-controls`, `aria-hidden`, `tabindex`,
  keyboard activation, and the odd behaviour with no CSS equivalent.
- It may not be the only thing that makes the module work. With the `<script>`
  removed, the markup and CSS still open, close and reset for a pointer. The
  `readme.md` says exactly what the script adds and what is lost without it.
- Re-run on `DOMContentLoaded`, on `change`, on `reset`, and expose one
  `sync()` for nodes added later.

## Registering it

Adding a module touches four places, all by hand:

1. **The directory** — `readme.md`, `assets/`, `examples/`.
2. **`spec.md`** — a `###` entry under `## Modules`: what it is, **Use when**,
   **Hook**, the feature it needs, whether it has a script.
3. **The lookup table** — the row a person would search for, or nothing if the
   module answers a want nothing else does.
4. **`## Not yet built`** — strike the line if the module was on it.

A module that is not in all four is half-registered: it works, and nobody can
find it.

## Proving it live

The page is the test. For every change:

1. **Load it clean.** Reload the example; nothing throws, the page renders.
2. **Check the opt-in.** The required markup is where the readme says, and only
   there.
3. **Read it at rest.** Computed style, size and rect match what the readme
   describes — not what the CSS looks like it should produce.
4. **Exercise every path.** Open three levels, switch a sibling, close a parent,
   reset from the root. A branch that only works in one order is not finished.
5. **Check the ghost.** Close a level, reopen it: nothing inside it should come
   back checked.
6. **Unplug the script.** Comment out the `.js` link, reload: the module still
   opens, closes and resets for a pointer. Only the ARIA and keyboard
   affordances are gone.
7. **Prune it.** Comment out the `.css` link, reload: the native controls still
   work, plainly, and nothing throws.
8. **Put it back.** Restore anything the probe touched.

An honest report is the numbers: what was open at rest, what was open after the
press, what it settled to.

## Removing it

The page must keep working with the files simply absent: elements keep their
resting look, native controls still toggle, and nothing throws. If that is not
true, the module holds state a script would have held, and the claim that the
platform can carry it is wrong.
