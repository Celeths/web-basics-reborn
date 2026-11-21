# pure-css-nested-menu

A branching menu at any depth, where **exactly one path is open at a time**. Three CSS rules, no JavaScript required.

Close a level and everything beneath it closes with it; its ancestors stay open; nothing re-opens behind your back.

---

## Contents

- [Features](#features)
- [Optional JavaScript](#optional-javascript)
- [Quick start](#quick-start)
- [Markup contract](#markup-contract)
- [How it works](#how-it-works)
- [Notes and constraints](#notes-and-constraints)
- [Browser support](#browser-support)
- [Files](#files)

---

## Features

- **Three rules.** Depth and branching are markup, never CSS. Add a sibling or nest another level by pasting one `.node` block.
- **One open path.** Every radio in a tree shares one `name`, so the browser guarantees at most one is ever checked.
- **No ghost re-opens.** Closing a level genuinely unchecks everything below it.
- **No build, no dependencies.** One stylesheet. The optional script is the only other file.
- **Presentation stays yours.** The engine hides the radio and flips `display` on the two faces and the panel. Size, colour, spacing and motion are not in it.
- **Many menus per page.** One `<form>` and one radio `name` per tree; they never interfere.

## Optional JavaScript

The menu works without any script. [`assets/pure-css-nested-menu.js`](assets/pure-css-nested-menu.js) is supplemental: it adds what the markup cannot say to assistive technology, and reads state the radio group already holds.

It adds:

- `role="button"` and `tabindex="0"` on the `.open` and `.close` labels
- `aria-expanded` on both faces, following the node's real state
- `aria-controls`, linking each face to the panel it shows
- Enter and Space activation on those labels

It re-syncs on `change`, on `reset`, and on `DOMContentLoaded`, and exposes `window.pureCssNestedMenu.sync()` for nodes added later.

Without it: the menu still opens, closes and resets with a pointer, and the radios remain keyboard-operable through the group. What is lost is the announced state and Enter/Space on the faces.

## Quick start

1. Link [`assets/pure-css-nested-menu.css`](assets/pure-css-nested-menu.css) once.
2. Add one empty external `<form>` per menu tree, with a unique `id`. It is a form owner only: it renders nothing.
3. Write the markup below. Every radio and the root reset join that form with `form="…"`.
4. Optionally add the script from [Optional JavaScript](#optional-javascript).

```html
<form id="menu-form"></form>
```

## Markup contract

```
.node
├─ input[type="radio"]      the state carrier (name + form)
├─ label.open[for="self"]   open this node
├─ label.close[for="parent"] close it to its parent
└─ .panel                   children container
   └─ .node                 …same structure, any number, any depth
```

| Element / class | Role | Requirement |
| --- | --- | --- |
| `<form id="…">` | form owner | One per tree, empty, never nested |
| `.node` | one menu item | Wraps a radio, its two faces, its children |
| `input[type="radio"]` | state | Direct child of `.node`; one `name` and one `form` shared across the tree |
| `.open` | open face | `<label for="this-id">` |
| `.close` | close face | `<label for="parent-id">`; at the root, `<button type="reset" form="…">` |
| `.panel` | children container | Direct child of `.node`, after the faces |

The faces and the panel must be **direct children** of `.node`, because the engine selects them with `>`.

### Repeatable node template

Every node below the root is the same block. Change the ids, the label text, and paste children into `.panel`:

```html
<div class="node">
  <input type="radio" name="menu" id="r-self" form="menu-form">
  <label for="r-self" class="open">Node title</label>
  <label for="r-parent" class="close">Node title</label>
  <div class="panel">
    <!-- any number of child .node blocks -->
  </div>
</div>
```

A root node is the same block with the close face swapped for a reset control bound to the form:

```html
<div class="node">
  <input type="radio" name="menu" id="r-root" form="menu-form">
  <label for="r-root" class="open">Menu</label>
  <button type="reset" form="menu-form" class="close">Menu</button>
  <div class="panel">…</div>
</div>
```

## How it works

**One group, one checked node.** Every radio in a tree shares a single `name`, so radio exclusivity does the bookkeeping. There is never a second checked node to clean up.

**Open is derived, not stored.** A node is open when anything inside it is checked:

```css
.node:has(input[type="radio"]:checked)
```

That matches the node's own radio and every radio deeper in its subtree, so the ancestors of the active node open themselves and nothing else does.

**Closing a level checks its parent.** While a node is closed its row shows `.open`, pointing at itself. While it is open the row shows `.close`, pointing at the parent's radio. Pressing it checks the parent, which unchecks the whole subtree below, and the ancestors stay open because their radios are on the path.

**The root resets.** A root `.close` is `type="reset"` in the same form, so it clears the tree's radios in one press instead of merely selecting the root.

### The engine

```css
/* Hide the radios without breaking label activation or the reset */
.node > input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Every node starts closed */
.node > .close,
.node > .panel { display: none; }

.node > .open { display: block; }

/* The three rules */
.node:has(input[type="radio"]:checked) > .open  { display: none; }
.node:has(input[type="radio"]:checked) > .close { display: block; }
.node:has(input[type="radio"]:checked) > .panel { display: block; }
```

### How interactions behave

A three-level example: `A` → `A-1` → `A-1-1`, with siblings at every level.

| Action | Control pressed | Checked after | Open path |
| --- | --- | --- | --- |
| Page load | none | *(none)* | Closed |
| Open A, then A-1 | `label[for="a"]`, `label[for="a-1"]` | `a-1` | A → A-1 |
| Open A-1-1 | `label[for="a-1-1"]` | `a-1-1` | A → A-1 → A-1-1 |
| Switch to sibling A-2 | `label[for="a-2"]` | `a-2` | A → A-2 *(A-1 subtree closes)* |
| Close A-1 | `label[for="a"]` | `a` | A |
| Reopen A-1 | `label[for="a-1"]` | `a-1` | A → A-1 *(children stay closed)* |
| Switch to root B | `label[for="b"]` | `b` | B *(A subtree closes)* |
| Close the menu | root reset | *(none)* | Closed |

### Constant size

The wiring is the same at every level: `.open` points one step down, `.close` points one step up, and the root's close points at a reset.

```mermaid
flowchart TD
  Form["form id=menu-form"]
  L1["Menu A · L1<br/>open for=a<br/>close: reset"]
  L2["Option A-1 · L2<br/>open for=a-1<br/>close for=a"]
  L3["Option A-1-1 · L3<br/>open for=a-1-1<br/>close for=a-1"]
  L1 --> L2 --> L3
  Form -.->|reset clears every radio| L1
```

So the CSS never grows:

| Task | Change | New CSS |
| --- | --- | :---: |
| Add a sibling at any depth | Paste one `.node` into the parent `.panel` | **0 lines** |
| Add a fifth, tenth, Nth level | Nest one `.node` in the level above | **0 lines** |
| Add a second, independent menu | New `<form id>` and a new radio `name` | **0 lines** |

## Notes and constraints

- **Ids are per page.** Every `for=`/`id=` pair must be unique, so two menus never share ids.
- **`close` points at the direct parent.** Point it one level too high and the press skips a level; point it at itself and the press does nothing.
- **The root's close must be a reset.** A label cannot clear a subtree; `type="reset"` bound to the form can.
- **One radio name per tree.** Two names means one radio can be checked in each; the two groups then open independently, which is only right if they are two menus.
- **Closed panels take no space.** The engine uses `display`, so a closed node leaves layout. If you need closed panels measurable for height animation or anchor positioning, that is a different engine.
- **The radios stay focusable.** They are visually hidden, not `disabled`, so the group is keyboard-operable. The optional script is what makes the faces themselves pressable.

## Browser support

- `:has()`: Chrome 105+, Edge 105+, Safari 15.4+, Firefox 121+.
- No JavaScript is required for the menu to work.
- The optional script needs nothing beyond ES2020.

## Files

```
modules/pure-css-nested-menu/
├── readme.md
├── assets/
│   ├── pure-css-nested-menu.css   required
│   └── pure-css-nested-menu.js    optional, accessibility
└── examples/
    └── abc.html                   3 menus, 5 levels, links both files
```
