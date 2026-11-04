import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from './helpers/dom.ts';

// Input: valid/invalid URL IDs; output: real product navigation and safe catalog detail rendering.
test('product detail routes resolve stable IDs and render safe information or an unavailable page', async () => {
  const { getProductId } = await import('../src/features/product-details/logic.ts');
  const { renderProductDetail } = await import('../src/features/product-details/ui/product.ts');
  const { renderProductCards } = await import('../src/features/products/ui/cards.ts');
  assert.equal(getProductId('?id=12'), 12);
  for (const query of ['', '?id=0', '?id=-1', '?id=1.5', '?id=abc', '?id=1&id=2', '?id=1e2']) {
    assert.equal(getProductId(query), null);
  }
  const elements = new Map();
  // Input: a selector; output: its persistent page element.
  const element = (selector) => {
    if (!elements.has(selector)) elements.set(selector, createElement());
    return elements.get(selector);
  };
  globalThis.document = { querySelector: element, title: '' };
  try {
    const product = { id: 12, name: 'Bag <Special>', description: '<script>hello</script>', category: 'Bags', image: '/images/product-1.jpg', price: 30, inStock: true };
    renderProductCards([product]);
    assert.match(element('#products .products').innerHTML, /href="\/product.html\?id=12"/);
    renderProductDetail(product);
    assert.match(element('#product-detail').innerHTML, /Bag &lt;Special&gt;/);
    assert.match(element('#product-detail').innerHTML, /&lt;script&gt;hello&lt;\/script&gt;/);
    assert.match(element('#product-detail').innerHTML, /data-add-to-cart="12"/);
    assert.equal(document.title, 'Bag <Special> | ShopBoard');
    renderProductDetail({ ...product, inStock: false, description: '' });
    assert.match(element('#product-detail').innerHTML, /disabled/);
    assert.doesNotMatch(element('#product-detail').innerHTML, /product-description-copy/);
    renderProductDetail(undefined);
    assert.match(element('#product-detail').innerHTML, /Product unavailable/);
    assert.equal(element('#product-reviews').hidden, true);
  } finally { delete globalThis.document; }
});
