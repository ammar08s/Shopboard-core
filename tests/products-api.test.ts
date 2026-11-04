import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProductsApi } from './helpers/products-api.ts';

// Input: the actual wire format; output: live names/prices/stock and demo-only media supplements.
test('API mapping translates integer cents and rejects malformed catalogs', async () => {
  const { readApiCatalog } = await import('../src/features/products/logic/readApiCatalog.ts');
  const raw = { id: 1, title: 'Live bag', category_name: 'Travel', price_cents: 1234, in_stock: false };
  const [product] = readApiCatalog({ items: [raw], total: 1 });
  assert.equal(product.name, 'Live bag'); assert.equal(product.price, 12.34);
  assert.equal(product.inStock, false); assert.equal(product.image, '/images/product-1.jpg');
  assert.deepEqual(readApiCatalog({ items: [], total: 0 }), []);
  for (const input of [{}, { items: null }, { items: [raw, raw] }, { items: [{ ...raw, price_cents: 1.5 }] },
    { items: [{ ...raw, id: '1' }] }, { items: [{ ...raw, in_stock: 'false' }] }]) {
    assert.throws(() => readApiCatalog(input));
  }
});

// Input: a controlled HTTP boundary; output: confirmed remote CRUD with safe failure handling and no demo fallback.
test('catalog uses real async requests and never changes state after rejected writes', async () => {
  const api = createProductsApi(); const originalFetch = globalThis.fetch;
  globalThis.fetch = api.fetch;
  globalThis.localStorage = { getItem: () => '[{"id":999}]', setItem() { throw new Error('Storage full'); } };
  try {
    const catalog = await import('../src/features/products/state.ts?api-contract');
    assert.equal(typeof catalog.refreshProducts, 'function');
    await catalog.refreshProducts();
    assert.equal(catalog.products.length, 12);
    const values = { name: 'Remote bag', category: 'Travel', price: 42.5, image: 'https://example.com/bag.jpg', inStock: true };
    const saved = await catalog.saveProduct(values);
    assert.equal(saved.id, 13); assert.equal(catalog.products.at(-1).name, 'Remote bag');
    const post = api.calls.find((call) => call.method === 'POST');
    assert.equal(post.url, 'https://shopboard-api.vercel.app/api/products');
    assert.equal(JSON.parse(post.body).price_cents, 4250);
    await catalog.saveProduct({ ...saved, price: 50, inStock: false });
    assert.equal(api.calls.at(-1).method, 'PUT');
    assert.equal(api.calls.at(-1).url.endsWith('/13'), true);
    assert.equal(catalog.products.at(-1).inStock, false);
    const before = structuredClone(catalog.products);
    api.fail(405);
    await assert.rejects(catalog.saveProduct(values), /405/);
    await assert.rejects(catalog.deleteProduct(1), /405/);
    await assert.rejects(catalog.refreshProducts(), /405/);
    assert.deepEqual(catalog.products, before);
    api.fail(0); await catalog.deleteProduct(13);
    assert.equal(catalog.products.length, 12);
    assert.equal(api.calls.at(-1).method, 'DELETE');
  } finally { globalThis.fetch = originalFetch; delete globalThis.localStorage; }
});
