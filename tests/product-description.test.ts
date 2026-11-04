import { test } from 'node:test';
import assert from 'node:assert/strict';

// Input: legacy/new catalog values; output: optional descriptions validated, persisted, and retained on edits.
test('product descriptions are optional, validated, trimmed, and retained through updates', async () => {
  const saved = new Map();
  globalThis.localStorage = { getItem: (key) => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) };
  try {
    const catalog = await import('../src/features/products/state.ts');
    const { validateProduct } = await import('../src/features/products/logic/validateProduct.ts');
    const values = { name: 'Travel bag', category: 'Bags', price: 35, image: '/images/product-1.jpg', inStock: true };
    assert.doesNotThrow(() => validateProduct(values));
    const product = catalog.saveProduct({ ...values, description: '  Room for everyday essentials.  ' });
    assert.equal(product.description, 'Room for everyday essentials.');
    catalog.saveProduct({ ...values, inStock: false }, product.id);
    assert.equal(catalog.products.find((item) => item.id === product.id).description, product.description);
    const reloaded = await import('../src/features/products/state.ts?descriptions');
    assert.equal(reloaded.products.find((item) => item.id === product.id).description, product.description);
    for (const description of [42, null, 'a'.repeat(2001)]) {
      assert.throws(() => catalog.saveProduct({ ...values, description }, product.id), /description/i);
    }
    catalog.saveProduct({ ...values, description: '' }, product.id);
    assert.equal(catalog.products.find((item) => item.id === product.id).description, '');
  } finally { delete globalThis.localStorage; }
});
