/* ---- pure-css-nested-menu · accessibility (optional) ----

   Supplemental only. It adds what the markup cannot say: the faces are
   announced as expanding buttons, tied to the panel they show, and Enter or
   Space presses them. The state stays in the radio group; this file reads it
   and never sets it.

   Load it once, after the markup or with defer. Safe to include twice.
   Public surface: window.pureCssNestedMenu.sync(). */

(() => {
  'use strict';

  const api = (window.pureCssNestedMenu ??= {});
  if (api.loaded) return;
  api.loaded = true;

  let uid = 0;

  /* A node is open when anything inside it is checked: its own radio, or a
     radio deeper in a child node. Same test as `.node:has(input:checked)`. */
  const isOpen = (node) => Boolean(node.querySelector('input[type="radio"]:checked'));

  const sync = () => {
    for (const node of document.querySelectorAll('.node')) {
      const panel = node.querySelector(':scope > .panel');
      if (!panel) continue;

      if (!panel.id) panel.id = `nested-menu-panel-${++uid}`;

      for (const face of node.querySelectorAll(':scope > .open, :scope > .close')) {
        /* A label is not focusable or pressable on its own; the reset button
           is, and keeps its own identity. */
        if (face instanceof HTMLLabelElement) {
          if (!face.hasAttribute('role')) face.setAttribute('role', 'button');
          if (!face.hasAttribute('tabindex')) face.setAttribute('tabindex', '0');
        }
        face.setAttribute('aria-expanded', String(isOpen(node)));
        if (!face.hasAttribute('aria-controls')) face.setAttribute('aria-controls', panel.id);
      }
    }
  };

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target instanceof Element ? event.target : null;
    const face = target?.closest('.node > .open, .node > .close');
    if (!face) return;
    event.preventDefault();
    face.click();
  });

  document.addEventListener('change', sync, true);
  document.addEventListener('reset', () => queueMicrotask(sync), true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync, { once: true });
  } else {
    sync();
  }

  api.sync = sync;
})();
