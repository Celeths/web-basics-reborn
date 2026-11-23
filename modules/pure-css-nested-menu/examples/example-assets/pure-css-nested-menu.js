(() => {
	'use strict';
	const api = (window.pureCssNestedMenu ??= {});
	if (api.loaded) return;
	api.loaded = true;

	let uid = 0;
	const setOnce = (el, k, v) => !el.hasAttribute(k) && el.setAttribute(k, v);

	const sync = () => {
		for (const node of document.querySelectorAll('.node')) {
			const panel = node.querySelector(':scope > .panel');
			if (!panel) continue;
			panel.id ||= `nested-menu-panel-${++uid}`;
			const open = String(!!node.querySelector('input[type=radio]:checked'));
			for (const face of node.querySelectorAll(':scope > :is(.open, .close)')) {
				if (face instanceof HTMLLabelElement) {
					setOnce(face, 'role', 'button');
					setOnce(face, 'tabindex', '0');
				}
				face.setAttribute('aria-expanded', open);
				setOnce(face, 'aria-controls', panel.id);
			}
		}
	};

	const on = document.addEventListener.bind(document);
	on('keydown', (e) => {
		if (e.key !== 'Enter' && e.key !== ' ') return;
		const face = e.target instanceof Element && e.target.closest('.node > :is(.open, .close)');
		if (!face) return;
		e.preventDefault();
		face.click();
	});
	on('change', sync, true);
	on('reset', () => queueMicrotask(sync), true);

	if (document.readyState === 'loading') on('DOMContentLoaded', sync, { once: true });
	else sync();

	api.sync = sync;
})();
