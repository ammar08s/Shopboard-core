import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';
import { showProductStatus } from '../src/features/products/ui/status.ts';

// Input: feedback inside/outside an active modal; output: one accessible announcement source in each case.
test('catalog feedback inside a modal is announced only when its inline status is inaccessible', () => {
  const modal = createElement('dialog');
  const inside = createElement('p');
  const outside = createElement('p');
  modal.append(inside);
  let active = null;
  globalThis.document = { querySelector: () => active };
  const notices = [];
  try {
    showProductStatus(outside, 'Catalog updated.', (notice) => notices.push(notice));
    assert.equal(notices.at(-1).announce, false);
    active = modal;
    showProductStatus(outside, 'Updated in another tab.', (notice) => notices.push(notice));
    assert.equal(notices.at(-1).announce, true);
    showProductStatus(inside, 'Photo is invalid.', (notice) => notices.push(notice), 'error');
    assert.equal(notices.at(-1).announce, false);
  } finally { delete globalThis.document; }
});
