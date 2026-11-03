import assert from 'node:assert/strict';

// Input: a listing fixture and demo products; output: verified search, category, ordering, and removable filters.
export function checkProductControlFiltering({ elements, container, search, category, sort, displayedIds, clickCatalogAction }, products) {
  // Input: a demo product; output: its product ID.
  assert.deepEqual(displayedIds(), products.map((product) => product.id));
  assert.equal(elements['#result-count'].textContent, '12 products');
  assert.equal(elements['#products-title'].textContent, 'All products');
  // Input: a demo product; output: its category name.
  for (const name of new Set(products.map((product) => product.category))) {
    assert.ok(category.innerHTML.includes(`value="${name}"`));
  }
  category.value = 'Bags';
  category.listeners.change();
  assert.deepEqual(displayedIds(), [1, 2, 3, 10]);
  assert.equal(elements['#products-title'].textContent, 'Bags');
  assert.equal(elements['#result-count'].textContent, '4 products');
  assert.match(elements['#active-filters'].innerHTML, /Remove category filter: Bags/);
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
  assert.equal(elements['#result-count'].textContent, '3 products');
  clickCatalogAction({ removeFilter: 'search' });
  assert.equal(search.value, '');
  assert.equal(category.value, 'Bags');
  assert.deepEqual(displayedIds(), [10, 1, 2, 3]);
  search.value = 'bag';
  search.listeners.input();
  category.value = 'Shoes';
  category.listeners.change();
  assert.ok(container.innerHTML.includes('No products found'));
  assert.equal(elements['#result-count'].textContent, '0 products');
  assert.match(container.innerHTML, /data-reset-filters/);
  clickCatalogAction({ resetFilters: '' });
  assert.equal(search.value, '');
  assert.equal(category.value, '');
  assert.equal(sort.value, 'price-desc');
  assert.equal(displayedIds()[0], 8);
  assert.equal(elements['#active-filters'].hidden, true);
  elements['#category-navigation'].listeners.click({
    // Input: a selector; output: a Shoes category navigation button.
    target: { closest: () => ({ dataset: { category: 'Shoes' } }) },
  });
  assert.equal(category.value, 'Shoes');
  assert.deepEqual(displayedIds(), [5, 6, 4, 11]);
  assert.match(elements['#category-navigation'].innerHTML, /data-category="Shoes"[^>]*aria-pressed="true"/);
  search.value = 'Running';
  search.listeners.input();
  assert.equal(elements['#result-count'].textContent, '1 product');
  clickCatalogAction({ removeFilter: 'category' });
  assert.equal(category.value, '');
  assert.equal(search.value, 'Running');
  assert.deepEqual(displayedIds(), [5]);
  assert.equal(elements['#products-title'].textContent, 'All products');
}
