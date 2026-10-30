import assert from 'node:assert/strict';
import { test } from 'node:test';
import products from './console/products-console.js';

test('product controls combine search, category and price order without changing the catalog', async () => {
  const elements = Object.fromEntries(['#searchInput', '#categorySelect', '#sortSelect', '#products .products'].map((selector) => [selector, {
    value: '', innerHTML: '', listeners: {},
    addEventListener(event, listener) { this.listeners[event] = listener; },
  }]));
  globalThis.document = { querySelector: (selector) => elements[selector] };
  const originalProducts = structuredClone(products);
  try {
    await import('./products.js');
    const search = elements['#searchInput'];
    const category = elements['#categorySelect'];
    const sort = elements['#sortSelect'];
    const container = elements['#products .products'];
    const displayedIds = () => [...container.innerHTML.matchAll(/data-add-to-cart="(\d+)"/g)].map((match) => Number(match[1]));
    assert.deepEqual(displayedIds(), products.map((product) => product.id));
    for (const name of new Set(products.map((product) => product.category))) {
      assert.ok(category.innerHTML.includes(`value="${name}"`));
    }
    category.value = 'Bags';
    category.listeners.change();
    assert.deepEqual(displayedIds(), [1, 2, 3, 10]);
    for (const term of ['bag', 'BAG', 'Bag']) {
      search.value = term;
      search.listeners.input();
      assert.deepEqual(displayedIds(), [1, 3, 10]);
    }
    sort.value = 'price-asc';
    sort.listeners.change();
    assert.deepEqual(displayedIds(), [3, 1, 10]);
    sort.value = 'price-desc';
    sort.listeners.change();
    assert.deepEqual(displayedIds(), [10, 1, 3]);
    category.value = 'Shoes';
    category.listeners.change();
    assert.ok(container.innerHTML.includes('No products found'));
    search.value = '';
    search.listeners.input();
    assert.deepEqual(displayedIds(), [5, 6, 4, 11]);
    category.value = '';
    sort.value = '';
    sort.listeners.change();
    assert.deepEqual(displayedIds(), products.map((product) => product.id));
    assert.deepEqual(products, originalProducts);
  } finally {
    delete globalThis.document;
  }
});
