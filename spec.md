# Web Basics Reborn — spec

Modules that give a site the behaviour it would otherwise install a block of
JavaScript for, built on the HTML and CSS the browser already has.

A site calls on a module by linking one stylesheet and writing the markup.
There is no API to learn, no build step, no dependency and no loader. If a file
is not linked, its module is simply absent.

Two orders are kept here. The **module** order below doubles as the directory
index. The **lookup** at the end runs the other way — start from what you want
to build and read off the module that builds it.

Every module directory carries its own `readme.md` with that module's contract;
`authoring.md` is the procedure for adding one.

---

## What a module is

- **One directory, one job.** `modules/<name>/` holds `readme.md`,
  `assets/<name>.css`, an optional `assets/<name>.js`, and `examples/`.
- **The markup is the API.** A module works because of the elements and
  attributes the page writes, not because of a call it makes. Nothing is
  configured from a script.
- **State is the control.** An open menu is a checked radio; an open disclosure
  is `<details open>`; a dismissed surface is `:popover-open`. A module reads
  the state the browser already tracks, so it cannot get out of step with it.
  Where the platform cannot express a condition, a class may mirror the state;
  it never replaces it as the source of truth.
- **CSS is the engine.** Selectors read native state — `:checked`, `:has()`,
  `:open`, `[popover]`. The rule count is per module, never per level: adding a
  branch or a depth adds markup, not CSS.
- **JavaScript is supplemental.** A module may ship a `.js` file for the small
  set of things the platform genuinely cannot do: roles, ARIA and keyboard
  activation for assistive technology, and the few behaviours with no CSS
  equivalent. It is never the only thing that makes the module function: prune
  it and the markup and CSS still render a working control. The module states
  what the script adds and what is lost without it.
- **No build.** The files the page links are the files that ship: no
  preprocessor, no bundler, no package.
- **Removable.** If deleting the module's link breaks the page, the module is
  doing more than one job.

## Contracts

What every module promises, whatever it builds.

| Name | Rule |
|---|---|
| Opt-in | One root class or the markup itself, published in the module's `readme.md`. Removing it is the whole opt-out. |
| State | Native state is the source of truth — the control's own `:checked`, `:open`, `[popover]`, or the open attribute. A class may mirror it where the platform cannot express a condition; it never replaces it. |
| JS | Supplemental only: optional, guarded against a double include, idempotent, never the sole thing that makes the module function. |
| Assets | No external font, icon set, image or URL. A module is a stylesheet and, at most, one script. |
| Support | Declared per module, naming the one newest feature it cannot work without. |
| Own scope | A module touches its own elements. It does not write to the page, add listeners that outlive it, or restyle anything it was not asked to dress. |

## Modules

### `modules/pure-css-nested-menu` — nested menu

A branching menu at any depth where at most one path is open at a time. Closing
a level closes every level beneath it and keeps its ancestors open, with no
stale branch left behind.

**Use when** a site needs a nested drop-menu and the alternative is a menu
library.

**Hook** one empty external `<form>` per menu tree, plus the module's node
markup. See `modules/pure-css-nested-menu/readme.md` for the contract — that
file, not this one, is the authority.

**Engine** a single shared radio group per tree, so the browser enforces
exclusivity; `:has(input:checked)` so an ancestor opens when anything inside it
is selected; a reset control at the root that clears the tree in one press.

**Support** `:has()`.

**JS** optional and supplemental (assistive technology only).

---

## Lookup

Start from the thing you are building.

| You want | Module |
|---|---|
| A nested menu that closes cleanly at any depth | `pure-css-nested-menu` |
| A disclosure that needs no script | not yet built |
| Tabs | not yet built |
| A modal that traps focus | not yet built |
| A tooltip | not yet built |
| An accordion | not yet built |
| A toast | not yet built |
| A theme switch | not yet built |

---

## Not yet built

The candidates, in rough order of how often a site loads a library to do them:

- disclosure and accordion (`<details>`, `name` for exclusivity)
- tabs (radio group, `:has()`)
- dialog and modal (`<dialog>`, `::backdrop`)
- tooltip (anchor positioning, `popover`)
- toast and status surface (`popover="manual"`, `:popover-open`)
- carousel (`::scroll-button`, scroll snap, `:target-current`)
- copy to clipboard (`<button popovertarget>` and a tiny script, or the
  selection API)
- theme switch (`:has()`, `prefers-color-scheme`, a checkbox)
- table sorting and filtering (no script is honest here; leave it out)

Each entry is a claim that the platform can carry it. A candidate that needs a
script to hold state is not a candidate.
