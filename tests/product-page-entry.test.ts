import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';

// Input: actual product-page entry and interactions; output: connected reviews/cart and deletion-safe controls.
test('product page entry connects real catalog, local reviews, cart purchases, and unavailable updates', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const saved = new Map();
  globalThis.localStorage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  const elements = new Map();
  // Input: selector; output: one persistent simulated page element.
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, Object.assign(createElement(), { reportValidity: () => true }));
    return elements.get(selector);
  };
  const events = {};
  globalThis.document = {
    body: Object.assign(createElement('body'), { dataset: { page: 'product' } }),
    querySelector: (selector) => selector === 'dialog[open]' ? null : element(selector),
    querySelectorAll: () => [], createElement, addEventListener() {},
  };
  globalThis.window = { location: { search: '?id=1' }, addEventListener: (name, callback) => { events[name] = callback; } };
  try {
    await import('../src/main.ts?product-page');
    assert.match(element('#product-detail').innerHTML, /Leather Tote Bag/);
    const click = { target: { closest: () => ({ dataset: { addToCart: '1' } }) } };
    element('#product-detail').listeners.click(click);
    assert.equal(element('#cart-count').textContent, '1');
    const { cartStorageKey } = await import('../src/features/cart/data.ts');
    assert.deepEqual(JSON.parse(saved.get(cartStorageKey)), { 1: 1 });
    saved.set(cartStorageKey, JSON.stringify({ 1: 3 })); events.pageshow();
    assert.equal(element('#cart-count').textContent, '3');
    element('input[name="rating"]:checked').value = '5';
    element('#rating-form').listeners.submit({ preventDefault() {} });
    assert.match(element('#rating-summary').textContent, /5.0/);
    element('#comment-name').value = 'Demo visitor'; element('#comment-body').value = 'Great demo';
    element('#comment-form').listeners.submit({ preventDefault() {} });
    assert.equal(element('#comment-list').children.length, 1);
    const catalog = await import('../src/features/products/state.ts');
    catalog.saveProduct({ ...catalog.products[0], inStock: false }); events.storage({ key: catalog.catalogStorageKey });
    assert.match(element('#product-detail').innerHTML, /disabled/);
    element('#product-detail').listeners.click(click);
    assert.match(element('#product-purchase-status').textContent, /unavailable/);
    catalog.deleteProduct(1); events.storage({ key: catalog.catalogStorageKey });
    assert.match(element('#product-detail').innerHTML, /Product unavailable/);
    assert.equal(element('#product-reviews').hidden, true);
    element('#comment-body').value = 'No longer valid';
    element('#comment-form').listeners.submit({ preventDefault() {} });
    assert.match(element('#comment-status').textContent, /no longer available/);
    assert.equal(element('#comment-body').value, 'No longer valid');
  } finally { delete globalThis.document; delete globalThis.window; delete globalThis.localStorage; }
});
