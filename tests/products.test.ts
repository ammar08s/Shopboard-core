import assert from 'node:assert/strict';
import { test } from 'node:test';
import { products } from '../src/features/products/data.ts';
import { renderProductCards } from '../src/features/products/ui/cards.ts';
import { createProductControlsFixture } from './helpers/product-controls-fixture.ts';
import { checkProductControlFiltering } from './helpers/product-controls-filtering.ts';

// Input: an isolated product state module; output: initialization permitted exactly once per module session.
test('product state claims browsing initialization once', async () => {
  const state = await import('../src/features/products/state.ts?initialization-test');
  assert.equal(typeof state.claimProductInitialization, 'function');
  assert.equal(state.claimProductInitialization(), true);
  assert.equal(state.claimProductInitialization(), false);
});

// Input: simulated listing controls; output: verified filtering, navigation, panel, and safe card rendering.
test('product controls combine search, category and price order without changing the catalog', async () => {
  const originalProducts = structuredClone(products);
  const fixture = await createProductControlsFixture();
  const { elements, container, search, category, sort, displayedIds } = fixture;
  try {
    checkProductControlFiltering(fixture, products);
    assert.equal(elements['#filters-toggle'].attributes['aria-expanded'], 'false');
    elements['#filters-toggle'].listeners.click();
    assert.equal(elements['#filters-toggle'].attributes['aria-expanded'], 'true');
    assert.equal(elements['#filter-panel'].hidden, false);
    elements['#filters-toggle'].listeners.click();
    assert.equal(elements['#filters-toggle'].attributes['aria-expanded'], 'false');
    assert.equal(elements['#filter-panel'].hidden, true);
    category.value = 'Shoes';
    search.value = '';
    search.listeners.input();
    assert.deepEqual(displayedIds(), [5, 6, 4, 11]);
    category.value = '';
    sort.value = '';
    sort.listeners.change();
    // Input: a demo product; output: its original product ID.
    assert.deepEqual(displayedIds(), products.map((product) => product.id));
    assert.deepEqual(products, originalProducts);
    renderProductCards([{ ...products[0], name: '<Demo bag>', category: 'Travel & Bags', image: '/images/product-1.jpg', inStock: false }]);
    assert.ok(container.innerHTML.includes('Out of stock'));
    assert.match(container.innerHTML, /<button[^>]*disabled/);
    assert.ok(container.innerHTML.includes('&lt;Demo bag&gt;'));
    assert.ok(container.innerHTML.includes('Travel &amp; Bags'));
    assert.ok(!container.innerHTML.includes('<Demo bag>'));
    const fallback = { hidden: true };
    const failedImage = { hidden: false, nextElementSibling: fallback,
      // Input: a selector; output: whether this element is a product image.
      matches: (selector) => selector === '.product-photo',
    };
    container.listeners.error({ target: failedImage });
    assert.equal(failedImage.hidden, true);
    assert.equal(fallback.hidden, false);
  } finally {
    fixture.cleanup();
  }
});
